"""
API views for Cognivue AI interviews (Django).
Full port of Flask app.py routes with additional features:
  - Session history endpoint
  - User analytics endpoint
  - Cleaner error handling
  - Django's login_required decorator
"""
import json
import os
import time
from pathlib import Path
from functools import wraps

from django.conf import settings
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from werkzeug.utils import secure_filename

from interviews.models import InterviewSession


# ─── Helper: API login required ───────────────────────────────────────────────
def api_login_required(view_func):
    """Returns 401 JSON instead of redirect for unauthenticated API requests."""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        return view_func(request, *args, **kwargs)
    return wrapper


# ─── Health check ─────────────────────────────────────────────────────────────
@require_http_methods(['GET'])
def health_check(request):
    return JsonResponse({
        'status': 'healthy',
        'message': 'Cognivue AI Backend (Django) Running',
        'framework': 'Django',
    })


# ─── User info ────────────────────────────────────────────────────────────────
@api_login_required
@require_http_methods(['GET'])
def user_info(request):
    user = request.user
    return JsonResponse({
        'id': user.id,
        'username': user.username or user.email.split('@')[0],
        'email': user.email,
        'avatar_url': getattr(user, 'avatar_url', ''),
    })


# ─── Logout ───────────────────────────────────────────────────────────────────
@csrf_exempt
@api_login_required
@require_http_methods(['POST'])
def logout_view(request):
    auth_logout(request)
    return JsonResponse({'message': 'Logged out successfully'})


# ─── Upload Resume ────────────────────────────────────────────────────────────
@csrf_exempt
@api_login_required
@require_http_methods(['POST'])
def upload_resume(request):
    if 'resume' not in request.FILES:
        return JsonResponse({'error': 'No resume file provided'}, status=400)

    file = request.FILES['resume']
    if not file.name:
        return JsonResponse({'error': 'No file selected'}, status=400)

    if not file.name.lower().endswith('.pdf'):
        return JsonResponse({'error': 'Invalid file format. Please upload a PDF.'}, status=400)

    # Save file
    upload_dir = Path(settings.MEDIA_ROOT)
    upload_dir.mkdir(parents=True, exist_ok=True)

    filename = secure_filename(file.name)
    unique_filename = f"{request.user.id}_{int(time.time())}_{filename}"
    filepath = upload_dir / unique_filename

    with open(filepath, 'wb+') as dest:
        for chunk in file.chunks():
            dest.write(chunk)

    try:
        from core.resume_analyzer import analyze_resume_file
        analysis = analyze_resume_file(str(filepath), settings.GEMINI_API_KEY)

        return JsonResponse({
            'message': 'Resume uploaded and analyzed successfully',
            'filename': unique_filename,
            'analysis': {
                'technical_skills': analysis['technical_skills'][:10],
                'soft_skills': analysis['soft_skills'][:8],
                'projects': analysis['projects'][:5],
                'experience_level': analysis['experience_level'],
                'summary': analysis['summary'],
            },
            'keywords': analysis['keywords'],
        })
    except Exception as e:
        print(f"Error analyzing resume: {e}")
        keywords = _extract_resume_keywords(str(filepath))
        return JsonResponse({
            'message': 'Resume uploaded successfully (basic analysis)',
            'filename': unique_filename,
            'keywords': keywords,
            'note': 'Basic analysis used due to processing error',
        })


# ─── Generate Questions ───────────────────────────────────────────────────────
@csrf_exempt
@api_login_required
@require_http_methods(['POST'])
def generate_questions(request):
    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, Exception):
        return JsonResponse({'error': 'Invalid JSON body'}, status=400)

    mode = data.get('mode')
    difficulty = data.get('difficulty')
    role = data.get('role', '')
    keywords = data.get('keywords', [])
    resume_filename = data.get('filename', '')
    analysis = data.get('analysis', {})

    if not mode or not difficulty:
        return JsonResponse({'error': 'mode and difficulty are required'}, status=400)

    try:
        session = InterviewSession(
            user=request.user,
            mode=mode,
            difficulty=difficulty,
            role=role,
            status='active',
        )

        if mode == 'resume' and analysis:
            session.resume_filename = resume_filename
            session.technical_skills = analysis.get('technical_skills', [])
            session.soft_skills = analysis.get('soft_skills', [])
            session.projects = analysis.get('projects', [])
            session.experience_level = analysis.get('experience_level', 'entry')
            session.resume_summary = analysis.get('summary', '')

        # Generate questions
        if mode == 'resume' and analysis:
            from core.gemini import client
            from core.question_generator import QuestionGenerator
            qg = QuestionGenerator(client)
            questions = qg.generate_resume_based_questions(
                technical_skills=analysis.get('technical_skills', []),
                soft_skills=analysis.get('soft_skills', []),
                projects=analysis.get('projects', []),
                difficulty=difficulty,
            )
        else:
            questions = _generate_interview_questions(mode, difficulty, role, keywords)

        if 'error' in questions:
            return JsonResponse({
                'error': questions['error'],
                'details': questions.get('details', 'Unknown error'),
            }, status=500)

        session.questions = questions
        session.save()

        return JsonResponse({
            'session_id': session.id,
            'questions': questions,
        })

    except Exception as e:
        print(f"Error generating questions: {e}")
        return JsonResponse({
            'error': 'An error occurred while generating questions. Please try again.'
        }, status=500)


# ─── Submit Answer ────────────────────────────────────────────────────────────
@csrf_exempt
@api_login_required
@require_http_methods(['POST'])
def submit_answer(request):
    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, Exception):
        return JsonResponse({'error': 'Invalid JSON body'}, status=400)

    session_id = data.get('session_id')
    question_index = data.get('question_index')
    answer = data.get('answer', '')

    try:
        session = InterviewSession.objects.get(id=session_id, user=request.user)
    except InterviewSession.DoesNotExist:
        return JsonResponse({'error': 'Interview session not found'}, status=404)

    try:
        answers = list(session.answers) if session.answers else []

        if question_index is not None and len(answers) <= question_index:
            answers.extend([None] * (question_index + 1 - len(answers)))
        if question_index is not None:
            answers[question_index] = answer

        session.answers = answers
        session.save(update_fields=['answers'])

        return JsonResponse({'message': 'Answer submitted successfully'})

    except Exception as e:
        return JsonResponse({'error': 'Failed to save answer'}, status=500)


# ─── Complete Interview ────────────────────────────────────────────────────────
@csrf_exempt
@api_login_required
@require_http_methods(['POST'])
def complete_interview(request):
    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, Exception):
        return JsonResponse({'error': 'Invalid JSON body'}, status=400)

    session_id = data.get('session_id')

    try:
        session = InterviewSession.objects.get(id=session_id, user=request.user)
    except InterviewSession.DoesNotExist:
        return JsonResponse({'error': 'Interview session not found'}, status=404)

    try:
        feedback = _generate_interview_feedback(session)

        if 'error' in feedback:
            return JsonResponse({
                'error': feedback['error'],
                'details': feedback.get('details', 'Unknown error'),
            }, status=500)

        session.feedback = feedback
        session.mark_completed()

        return JsonResponse({
            'message': 'Interview completed successfully',
            'feedback': feedback,
        })

    except Exception as e:
        error_msg = str(e).lower()
        if '503' in error_msg or 'unavailable' in error_msg or 'overloaded' in error_msg:
            return JsonResponse({
                'error': 'The AI service is temporarily overloaded. Please try again in a few minutes.'
            }, status=503)
        print(f"Error completing interview: {e}")
        return JsonResponse({
            'error': 'An error occurred while completing the interview. Please try again.'
        }, status=500)


# ─── Session History (NEW FEATURE) ────────────────────────────────────────────
@api_login_required
@require_http_methods(['GET'])
def session_history(request):
    """Return all completed interview sessions for the current user."""
    sessions = InterviewSession.objects.filter(
        user=request.user,
        status='completed',
    ).order_by('-completed_at')[:20]  # Latest 20

    history = []
    for s in sessions:
        history.append({
            'id': s.id,
            'mode': s.mode,
            'difficulty': s.difficulty,
            'role': s.role or None,
            'experience_level': s.experience_level or None,
            'overall_score': s.overall_score,
            'duration_minutes': s.duration_minutes,
            'created_at': s.created_at.isoformat(),
            'completed_at': s.completed_at.isoformat() if s.completed_at else None,
            'feedback_summary': {
                'strengths': (s.feedback.get('strengths', [])[:2] if s.feedback else []),
                'improvements': (s.feedback.get('improvements', [])[:2] if s.feedback else []),
            },
        })

    return JsonResponse({'sessions': history})


# ─── Session Detail (NEW FEATURE) ─────────────────────────────────────────────
@api_login_required
@require_http_methods(['GET'])
def session_detail(request, session_id):
    """Return full details of a specific interview session."""
    try:
        session = InterviewSession.objects.get(id=session_id, user=request.user)
    except InterviewSession.DoesNotExist:
        return JsonResponse({'error': 'Session not found'}, status=404)

    # Flatten questions the same way the frontend does
    all_questions = []
    q_data = session.questions or {}
    for category, q_list in q_data.items():
        for q in (q_list or []):
            all_questions.append({
                'category': category.replace('_', ' ').title(),
                'text': q,
            })

    return JsonResponse({
        'id': session.id,
        'mode': session.mode,
        'difficulty': session.difficulty,
        'role': session.role,
        'status': session.status,
        'experience_level': session.experience_level,
        'resume_summary': session.resume_summary,
        'questions': all_questions,
        'answers': session.answers or [],
        'feedback': session.feedback or {},
        'overall_score': session.overall_score,
        'duration_minutes': session.duration_minutes,
        'created_at': session.created_at.isoformat(),
        'completed_at': session.completed_at.isoformat() if session.completed_at else None,
    })


# ─── User Analytics (NEW FEATURE) ─────────────────────────────────────────────
@api_login_required
@require_http_methods(['GET'])
def user_analytics(request):
    """Return performance analytics across all sessions."""
    sessions = InterviewSession.objects.filter(
        user=request.user,
        status='completed',
    )

    total = sessions.count()
    if total == 0:
        return JsonResponse({
            'total_sessions': 0,
            'average_score': None,
            'best_score': None,
            'resume_count': 0,
            'role_count': 0,
            'by_difficulty': {},
        })

    scores = [s.overall_score for s in sessions if s.overall_score is not None]
    avg_score = round(sum(scores) / len(scores), 1) if scores else None
    best_score = max(scores) if scores else None

    resume_count = sessions.filter(mode='resume').count()
    role_count = sessions.filter(mode='role').count()

    by_difficulty = {}
    for diff in ['beginner', 'intermediate', 'advanced']:
        diff_sessions = sessions.filter(difficulty=diff)
        diff_scores = [s.overall_score for s in diff_sessions if s.overall_score is not None]
        by_difficulty[diff] = {
            'count': diff_sessions.count(),
            'average_score': round(sum(diff_scores) / len(diff_scores), 1) if diff_scores else None,
        }

    return JsonResponse({
        'total_sessions': total,
        'average_score': avg_score,
        'best_score': best_score,
        'resume_count': resume_count,
        'role_count': role_count,
        'by_difficulty': by_difficulty,
    })


# ─── Internal helpers ─────────────────────────────────────────────────────────
def _extract_resume_keywords(filepath: str) -> list:
    """Fallback keyword extraction using PyPDF2."""
    import re
    from collections import Counter
    try:
        import PyPDF2
        with open(filepath, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            text = ''.join(p.extract_text() or '' for p in reader.pages)

        skill_patterns = [
            r'\b(?:python|java|javascript|typescript|c\+\+|c#|php|ruby|go|rust|swift|kotlin)\b',
            r'\b(?:react|angular|vue|node\.?js|express|django|flask|spring|laravel)\b',
            r'\b(?:html|css|sass|scss|bootstrap|tailwind)\b',
            r'\b(?:sql|mysql|postgresql|mongodb|redis|elasticsearch)\b',
            r'\b(?:aws|azure|gcp|docker|kubernetes|jenkins|git|github|gitlab)\b',
            r'\b(?:machine learning|data science|ai|tensorflow|pytorch|pandas|numpy)\b',
            r'\b(?:agile|scrum|devops|ci/cd|microservices|api|rest|graphql)\b',
        ]
        found = []
        text_lower = text.lower()
        for pat in skill_patterns:
            found.extend(re.findall(pat, text_lower, re.IGNORECASE))

        return [kw for kw, _ in Counter(found).most_common(10)] if found else ['general programming']
    except Exception as e:
        print(f"Keyword extraction fallback error: {e}")
        return ['general programming', 'software development']


def _generate_interview_questions(mode: str, difficulty: str, role: str, keywords: list) -> dict:
    """Generate role-based interview questions using Gemini."""
    from core.gemini import client
    import re

    if mode == 'resume':
        prompt = f"""You are an expert technical interviewer conducting a {difficulty} level interview.

Based on these skills from the candidate's resume: {', '.join(keywords)}

Generate exactly:
- 3 behavioral/HR questions assessing soft skills
- 4 technical questions testing: {', '.join(keywords[:5])}
- 3 situational questions testing problem-solving

Return ONLY a JSON object:
{{
    "hr_questions": ["q1", "q2", "q3"],
    "technical_questions": ["q1", "q2", "q3", "q4"],
    "cultural_questions": ["q1", "q2", "q3"]
}}"""
    else:
        prompt = f"""You are an expert technical interviewer for a {difficulty} level {role} position.

Generate exactly:
- 3 behavioral/HR questions for a {role}
- 4 technical questions for core {role} competencies
- 3 situational questions for {role} scenarios

Return ONLY a JSON object:
{{
    "hr_questions": ["q1", "q2", "q3"],
    "technical_questions": ["q1", "q2", "q3", "q4"],
    "cultural_questions": ["q1", "q2", "q3"]
}}"""

    max_retries, retry_delay = 3, 1
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(model='gemini-2.5-flash', contents=prompt)
            if response.text:
                match = re.search(r'\{.*\}', response.text, re.DOTALL)
                if match:
                    return json.loads(match.group())
        except json.JSONDecodeError:
            pass
        except Exception as e:
            err = str(e).lower()
            if ('503' in err or 'unavailable' in err or 'overloaded' in err) and attempt < max_retries - 1:
                time.sleep(retry_delay)
                retry_delay *= 2
                continue
            break

    return {
        'error': 'Unable to generate interview questions at this time. Please try again.',
        'details': 'All retry attempts exhausted',
    }


def _generate_interview_feedback(session: InterviewSession) -> dict:
    """Generate AI feedback for a completed interview session."""
    from core.gemini import client
    import re

    questions_data = session.questions or {}
    answers = session.answers or []

    all_questions = []
    for category, q_list in questions_data.items():
        for q in (q_list or []):
            all_questions.append({'category': category.replace('_', ' ').title(), 'text': q})

    interview_data = []
    for i, question in enumerate(all_questions):
        answer = answers[i] if i < len(answers) and answers[i] else 'No answer provided'
        interview_data.append({
            'category': question['category'],
            'question': question['text'],
            'answer': answer,
        })

    prompt = f"""
You are an expert HR interviewer and career coach. Analyze this interview session and provide detailed feedback.

Interview Mode: {session.mode}
Difficulty Level: {session.difficulty}
Role: {session.role or 'General'}

Interview Questions and Answers:
{json.dumps(interview_data, indent=2)}

Provide feedback in this JSON format:
{{
    "overall_score": <0-100>,
    "category_scores": {{
        "hr_performance": <0-100>,
        "technical_performance": <0-100>,
        "cultural_fit": <0-100>
    }},
    "strengths": ["strength1", "strength2", "strength3"],
    "improvements": ["area1", "area2", "area3"],
    "detailed_feedback": "comprehensive paragraph feedback"
}}

Be constructive, specific, and encouraging while providing actionable feedback.
"""

    max_retries, retry_delay = 3, 1
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(model='gemini-2.5-flash', contents=prompt)
            if response.text:
                match = re.search(r'\{.*\}', response.text, re.DOTALL)
                if match:
                    return json.loads(match.group())
        except Exception as e:
            err = str(e).lower()
            if ('503' in err or 'unavailable' in err or 'overloaded' in err) and attempt < max_retries - 1:
                time.sleep(retry_delay)
                retry_delay *= 2
                continue
            break

    return {
        'error': 'Unable to generate feedback at this time. Please try again.',
        'details': 'LLM service unavailable',
    }

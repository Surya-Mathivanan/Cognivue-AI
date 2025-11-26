# Flask backend for Cognivue AI
import os
import time
from pathlib import Path
from dotenv import load_dotenv
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_required, current_user
from werkzeug.utils import secure_filename
import json

# Load environment variables from root .env
# Try multiple paths to find .env file
env_paths = [
    Path(__file__).parent.parent / '.env',  # Parent directory
    Path(__file__).parent / '.env',          # Current directory
    Path.cwd() / '.env'                       # Working directory
]

for env_path in env_paths:
    if env_path.exists():
        load_dotenv(env_path)
        print(f"Loaded .env from: {env_path}")
        break

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SESSION_SECRET', 'dev-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///interview_assistant.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'

# Create upload folder
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Import models and auth blueprint first
from models import User, InterviewSession, db

# Initialize extensions
db.init_app(app)
CORS(app, supports_credentials=True, origins=['http://localhost:3000', 'https://cognivue-aii.vercel.app'])
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'google_auth.login'  # type: ignore

from google_auth import google_auth

# Register blueprint
app.register_blueprint(google_auth)

@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))

# Serve React App
@app.route('/')
def index():
    return send_from_directory('../frontend/dist', 'index.html')

@app.route('/assets/<path:filename>')
def serve_assets(filename):
    return send_from_directory('../frontend/dist/assets', filename)

@app.route('/<path:path>')
def serve_react_app(path):
    # For React Router - serve index.html for all non-API routes
    if path.startswith('api/'):
        return {'error': 'API route not found'}, 404
    return send_from_directory('../frontend/dist', 'index.html')

@app.route('/api/health')
def health_check():
    return jsonify({"status": "healthy", "message": "Interview Assistant Backend Running"})

@app.route('/api/upload-resume', methods=['POST'])
@login_required
def upload_resume():
    if 'resume' not in request.files:
        return jsonify({"error": "No resume file provided"}), 400
    
    file = request.files['resume']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    if file and file.filename and file.filename.lower().endswith('.pdf'):
        filename = secure_filename(file.filename)
        # Add user ID to filename to avoid conflicts
        unique_filename = f"{current_user.id}_{int(time.time())}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(filepath)
        
        try:
            # Use new resume analyzer
            from resume_analyzer import analyze_resume_file
            analysis = analyze_resume_file(filepath, os.environ.get('GEMINI_API_KEY'))
            
            return jsonify({
                "message": "Resume uploaded and analyzed successfully",
                "filename": unique_filename,
                "analysis": {
                    "technical_skills": analysis['technical_skills'][:10],  # Top 10 for display
                    "soft_skills": analysis['soft_skills'][:8],
                    "projects": analysis['projects'][:5],
                    "experience_level": analysis['experience_level'],
                    "summary": analysis['summary']
                },
                "keywords": analysis['keywords']  # For backward compatibility
            })
        except Exception as e:
            print(f"Error analyzing resume: {e}")
            # Fallback to basic keyword extraction
            keywords = extract_resume_keywords(filepath)
            return jsonify({
                "message": "Resume uploaded successfully",
                "filename": unique_filename,
                "keywords": keywords,
                "note": "Basic analysis used due to processing error"
            })
    
    return jsonify({"error": "Invalid file format. Please upload a PDF."}), 400

@app.route('/api/generate-questions', methods=['POST'])
@login_required
def generate_questions():
    data = request.json or {}
    mode = data.get('mode')  # 'resume' or 'role'
    difficulty = data.get('difficulty')  # 'beginner', 'intermediate', 'advanced'
    role = data.get('role', '')
    keywords = data.get('keywords', [])
    
    # Get resume analysis data for resume mode
    resume_filename = data.get('filename', '')
    analysis = data.get('analysis', {})
    
    try:
        # Create interview session first
        session = InterviewSession()
        session.user_id = current_user.id
        session.mode = mode
        session.difficulty = difficulty  
        session.role = role
        session.status = 'active'
        
        # Store resume analysis if in resume mode
        if mode == 'resume' and analysis:
            session.resume_filename = resume_filename
            session.technical_skills = json.dumps(analysis.get('technical_skills', []))
            session.soft_skills = json.dumps(analysis.get('soft_skills', []))
            session.projects = json.dumps(analysis.get('projects', []))
            session.experience_level = analysis.get('experience_level', 'entry')
            session.resume_summary = analysis.get('summary', '')
        
        # Generate questions based on mode
        if mode == 'resume' and analysis:
            # Use new question generator for resume-based interviews
            from gemini import client
            from question_generator import QuestionGenerator
            
            qg = QuestionGenerator(client)
            questions = qg.generate_resume_based_questions(
                technical_skills=analysis.get('technical_skills', []),
                soft_skills=analysis.get('soft_skills', []),
                projects=analysis.get('projects', []),
                difficulty=difficulty
            )
        else:
            # Use existing logic for role-based interviews
            questions = generate_interview_questions(mode, difficulty, role, keywords)
        
        # Check if questions were generated successfully
        if "error" in questions:
            return jsonify({
                "error": questions["error"],
                "details": questions.get("details", "Unknown error")
            }), 500
        
        # Store questions and commit
        session.questions = json.dumps(questions)
        db.session.add(session)
        db.session.commit()

        return jsonify({
            "session_id": session.id,
            "questions": questions
        })
        
    except Exception as e:
        print(f"Error generating questions: {e}")
        return jsonify({"error": "An error occurred while generating questions. Please try again."}), 500

@app.route('/api/submit-answer', methods=['POST'])
@login_required
def submit_answer():
    data = request.json or {}
    session_id = data.get('session_id')
    question_index = data.get('question_index')
    answer = data.get('answer')
    
    try:
        session = InterviewSession.query.filter_by(id=session_id, user_id=current_user.id).first()
        if not session:
            return jsonify({"error": "Interview session not found"}), 404
        
        # Get current answers or initialize
        answers = json.loads(session.answers) if session.answers else []
        
        # Add/update answer
        if question_index is not None and len(answers) <= question_index:
            answers.extend([None] * (question_index + 1 - len(answers)))
        if question_index is not None:
            answers[question_index] = answer
        
        session.answers = json.dumps(answers)
        db.session.commit()
        
        return jsonify({"message": "Answer submitted successfully"})
        
    except Exception as e:
        error_msg = str(e).lower()
        if '503' in error_msg or 'unavailable' in error_msg or 'overloaded' in error_msg:
            return jsonify({"error": "The AI service is temporarily overloaded. Please try again in a few minutes."}), 503
        else:
            return jsonify({"error": "An error occurred while generating questions. Please try again."}), 500

@app.route('/api/complete-interview', methods=['POST'])
@login_required
def complete_interview():
    data = request.json or {}
    session_id = data.get('session_id')
    
    try:
        session = InterviewSession.query.filter_by(id=session_id, user_id=current_user.id).first()
        if not session:
            return jsonify({"error": "Interview session not found"}), 404
        
        # Generate feedback using Gemini API
        feedback = generate_interview_feedback(session)
        
        session.feedback = json.dumps(feedback)
        session.status = 'completed'
        db.session.commit()
        
        # Check if feedback was generated successfully
        if "error" in feedback:
            return jsonify({
                "error": feedback["error"],
                "details": feedback.get("details", "Unknown error")
            }), 500

        return jsonify({
            "message": "Interview completed successfully",
            "feedback": feedback
        })
        
    except Exception as e:
        error_msg = str(e).lower()
        if '503' in error_msg or 'unavailable' in error_msg or 'overloaded' in error_msg:
            return jsonify({"error": "The AI service is temporarily overloaded. Please try again in a few minutes."}), 503
        else:
            return jsonify({"error": "An error occurred while completing the interview. Please try again."}), 500

@app.route('/api/user-info')
@login_required
def user_info():
    return jsonify({
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email
    })

@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    from flask_login import logout_user
    logout_user()
    return jsonify({"message": "Logged out successfully"})

# Helper functions
def extract_resume_keywords(filepath):
    """Extract keywords from uploaded PDF resume"""
    try:
        import PyPDF2
        import re
        from collections import Counter
        
        with open(filepath, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()
        
        # Common technical skills and keywords
        skill_patterns = [
            r'\b(?:python|java|javascript|typescript|c\+\+|c#|php|ruby|go|rust|swift|kotlin)\b',
            r'\b(?:react|angular|vue|node\.?js|express|django|flask|spring|laravel)\b',
            r'\b(?:html|css|sass|scss|bootstrap|tailwind)\b',
            r'\b(?:sql|mysql|postgresql|mongodb|redis|elasticsearch)\b',
            r'\b(?:aws|azure|gcp|docker|kubernetes|jenkins|git|github|gitlab)\b',
            r'\b(?:machine learning|data science|ai|tensorflow|pytorch|pandas|numpy)\b',
            r'\b(?:agile|scrum|devops|ci/cd|microservices|api|rest|graphql)\b'
        ]
        
        found_skills = []
        text_lower = text.lower()
        
        for pattern in skill_patterns:
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            found_skills.extend(matches)
        
        # Additional keyword extraction from common resume terms
        words = re.findall(r'\b[a-zA-Z]{3,}\b', text_lower)
        
        # Filter common resume keywords
        resume_keywords = ['experience', 'project', 'developed', 'designed', 'implemented', 
                          'managed', 'created', 'built', 'led', 'collaborated', 'analyzed',
                          'optimization', 'performance', 'testing', 'debugging', 'integration']
        
        found_keywords = [word for word in words if word in resume_keywords]
        
        # Combine and get most frequent
        all_keywords = found_skills + found_keywords
        if all_keywords:
            keyword_counts = Counter(all_keywords)
            return [keyword for keyword, count in keyword_counts.most_common(10)]
        else:
            # Fallback to basic skill detection
            basic_skills = ['programming', 'development', 'software', 'engineering', 'technical']
            return [skill for skill in basic_skills if skill in text_lower][:5]
        
    except Exception as e:
        print(f"Error extracting keywords: {e}")
        return ['general programming', 'software development']

def generate_interview_questions(mode, difficulty, role, keywords):
    """Generate interview questions using Gemini API"""
    try:
        from gemini import client
        
        if mode == 'resume':
            prompt = f"""You are an expert technical interviewer conducting a {difficulty} level interview.

Based on these skills/keywords from the candidate's resume: {', '.join(keywords)}

Generate a comprehensive set of interview questions in the following categories:
- 3 behavioral/HR questions that assess soft skills and cultural fit
- 4 technical questions that test the specific skills mentioned: {', '.join(keywords[:5])}
- 3 situational questions that test problem-solving and experience

Make questions specific to the skills and experience level indicated.
Return the response as a JSON object with exactly these keys:
{{
    "hr_questions": [array of 3 HR/behavioral questions],
    "technical_questions": [array of 4 technical questions],
    "cultural_questions": [array of 3 situational/cultural fit questions]
}}

Ensure all questions are relevant to the skills: {', '.join(keywords)}"""
        else:
            prompt = f"""You are an expert technical interviewer conducting a {difficulty} level interview for a {role} position.

Generate a comprehensive set of interview questions specifically tailored for a {role} role in the following categories:
- 3 behavioral/HR questions that assess soft skills and cultural fit for a {role}
- 4 technical questions that test the core competencies required for a {role}
- 3 situational questions that test problem-solving and experience in {role} scenarios

Make questions specific to {role} responsibilities and requirements.
Return the response as a JSON object with exactly these keys:
{{
    "hr_questions": [array of 3 HR/behavioral questions],
    "technical_questions": [array of 4 technical questions],
    "cultural_questions": [array of 3 situational/cultural fit questions]
}}

Ensure all questions are highly relevant to a {role} position."""
        
        # Retry logic for Gemini API calls
        max_retries = 3
        retry_delay = 1  # Initial delay in seconds

        for attempt in range(max_retries):
            try:
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt
                )

                # Parse response and return structured questions
                if response.text:
                    # Try to extract JSON from response
                    import re
                    json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
                    if json_match:
                        questions_data = json.loads(json_match.group())
                        return questions_data
                    else:
                        # If no JSON found, return error
                        print(f"No JSON found in response: {response.text[:200]}")
                        raise ValueError("Invalid response format from LLM")

            except json.JSONDecodeError as je:
                print(f"JSON parse error (attempt {attempt + 1}/{max_retries}): {je}")
                if attempt < max_retries - 1:
                    time.sleep(retry_delay)
                    retry_delay *= 2
                    continue
                else:
                    break
            except Exception as e:
                error_str = str(e).lower()
                is_retryable = ('503' in error_str or
                              'unavailable' in error_str or
                              'overloaded' in error_str)

                if is_retryable and attempt < max_retries - 1:
                    print(f"Gemini API temporarily unavailable for questions (attempt {attempt + 1}/{max_retries}): {e}")
                    time.sleep(retry_delay)
                    retry_delay *= 2  # Exponential backoff
                    continue
                else:
                    print(f"Error generating questions (final attempt): {e}")
                    break

    except Exception as e:
        print(f"Error generating questions: {e}")

    # Return error if all retry attempts fail
        return {
            "error": "Unable to generate interview questions at this time. Please check your connection and try again.",
            "details": "All retry attempts exhausted"
        }

def generate_interview_feedback(session):
    """Generate feedback for completed interview using Gemini API"""
    try:
        from gemini import client
        
        questions = json.loads(session.questions)
        answers = json.loads(session.answers) if session.answers else []
        
        # Prepare interview data for analysis
        interview_data = []
        all_questions = []
        
        # Flatten questions from categories
        for category, question_list in questions.items():
            for q in question_list:
                all_questions.append({"category": category.replace("_", " ").title(), "text": q})
        
        # Pair questions with answers
        for i, question in enumerate(all_questions):
            answer = answers[i] if i < len(answers) and answers[i] else "No answer provided"
            interview_data.append({
                "category": question["category"],
                "question": question["text"],
                "answer": answer
            })
        
        # Create detailed prompt for Gemini
        analysis_prompt = f"""
        You are an expert HR interviewer and career coach. Analyze this interview session and provide detailed feedback.
        
        Interview Mode: {session.mode}
        Difficulty Level: {session.difficulty}
        Role: {session.role or 'General'}
        
        Interview Questions and Answers:
        {json.dumps(interview_data, indent=2)}
        
        Provide feedback in the following JSON format:
        {{
            "overall_score": number (0-100),
            "category_scores": {{
                "hr_performance": number (0-100),
                "technical_performance": number (0-100), 
                "cultural_fit": number (0-100)
            }},
            "strengths": [list of 3-5 specific strengths observed],
            "improvements": [list of 3-5 specific areas for improvement],
            "detailed_feedback": "comprehensive paragraph feedback"
        }}
        
        Scoring Criteria:
        - HR Performance: Communication skills, self-awareness, career goals
        - Technical Performance: Problem-solving, technical knowledge, methodology
        - Cultural Fit: Team collaboration, adaptability, values alignment
        
        Be constructive, specific, and encouraging while providing actionable feedback.
        """
        
        # Retry logic for Gemini API calls
        max_retries = 3
        retry_delay = 1  # Initial delay in seconds

        for attempt in range(max_retries):
            try:
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=analysis_prompt
                )

                if response.text:
                    # Try to parse the JSON response
                    import re
                    json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
                    if json_match:
                        feedback_data = json.loads(json_match.group())
                        return feedback_data

            except Exception as gemini_error:
                error_str = str(gemini_error).lower()
                is_retryable = ('503' in error_str or
                              'unavailable' in error_str or
                              'overloaded' in error_str)

                if is_retryable and attempt < max_retries - 1:
                    print(f"Gemini API temporarily unavailable (attempt {attempt + 1}/{max_retries}): {gemini_error}")
                    time.sleep(retry_delay)
                    retry_delay *= 2  # Exponential backoff
                    continue
                else:
                    print(f"Gemini API error (final attempt): {gemini_error}")
                    break
        
        # Return error if LLM fails to generate feedback
        return {
            "error": "Unable to generate feedback at this time. Please try again.",
            "details": "LLM service unavailable for feedback generation"
        }
        
    except Exception as e:
        print(f"Error generating feedback: {e}")
        return {
            "error": "Unable to generate feedback at this time. Please try again.",
            "details": "LLM service unavailable for feedback generation"
        }


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
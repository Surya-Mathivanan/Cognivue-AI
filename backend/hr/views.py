"""
HR authentication and admin API views for Cognivue AI.
Handles HR registration, OTP verification, login, and candidate search.
"""
import json
from functools import wraps
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone

from hr.models import HRUser, OTPRecord
from hr.email_service import send_otp_email


# ─── Helper: HR login required ────────────────────────────────────────────────
def hr_login_required(view_func):
    """Returns 401 JSON for unauthenticated HR API requests."""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        hr_user_id = request.session.get('hr_user_id')
        if not hr_user_id:
            return JsonResponse({'error': 'HR authentication required'}, status=401)
        try:
            hr_user = HRUser.objects.get(id=hr_user_id, is_verified=True)
            request.hr_user = hr_user
        except HRUser.DoesNotExist:
            request.session.pop('hr_user_id', None)
            return JsonResponse({'error': 'HR session invalid'}, status=401)
        return view_func(request, *args, **kwargs)
    return wrapper


# ─── HR Register ──────────────────────────────────────────────────────────────
@csrf_exempt
@require_http_methods(['POST'])
def hr_register(request):
    """Register a new HR user and send OTP to their email."""
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON body'}, status=400)

    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    company = data.get('company', '').strip()
    password = data.get('password', '')

    if not name or not email or not password:
        return JsonResponse({'error': 'Name, email and password are required'}, status=400)

    if len(password) < 8:
        return JsonResponse({'error': 'Password must be at least 8 characters'}, status=400)

    # Check if email already registered and verified
    existing = HRUser.objects.filter(email=email).first()
    if existing and existing.is_verified:
        return JsonResponse({'error': 'An HR account with this email already exists'}, status=409)

    # Create or update unverified HR user
    if existing:
        hr_user = existing
        hr_user.name = name
        hr_user.company = company
        hr_user.is_verified = False
    else:
        hr_user = HRUser(email=email, name=name, company=company)

    hr_user.set_password(password)
    hr_user.save()

    # Generate and send OTP
    otp_code = OTPRecord.generate_otp()
    OTPRecord.objects.create(email=email, otp_code=otp_code)

    return JsonResponse({
        'message': 'Registration successful. OTP generated.',
        'email': email,
        'otp_code': otp_code,
        'name': hr_user.name
    })


# ─── HR Resend OTP ────────────────────────────────────────────────────────────
@csrf_exempt
@require_http_methods(['POST'])
def hr_resend_otp(request):
    """Resend OTP to an HR user's email."""
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON body'}, status=400)

    email = data.get('email', '').strip().lower()
    if not email:
        return JsonResponse({'error': 'Email is required'}, status=400)

    hr_user = HRUser.objects.filter(email=email).first()
    if not hr_user:
        return JsonResponse({'error': 'No registration found for this email'}, status=404)

    otp_code = OTPRecord.generate_otp()
    OTPRecord.objects.create(email=email, otp_code=otp_code)

    return JsonResponse({
        'message': 'OTP generated successfully.',
        'email': email,
        'otp_code': otp_code,
        'name': hr_user.name
    })


# ─── HR Verify OTP ────────────────────────────────────────────────────────────
@csrf_exempt
@require_http_methods(['POST'])
def hr_verify_otp(request):
    """Verify the OTP and activate the HR account."""
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON body'}, status=400)

    email = data.get('email', '').strip().lower()
    otp_code = data.get('otp_code', '').strip()

    if not email or not otp_code:
        return JsonResponse({'error': 'Email and OTP code are required'}, status=400)

    # Get the latest unused OTP for this email
    otp_record = OTPRecord.objects.filter(
        email=email,
        is_used=False,
    ).order_by('-created_at').first()

    if not otp_record:
        return JsonResponse({'error': 'No valid OTP found. Please request a new one.'}, status=400)

    if otp_record.is_expired:
        return JsonResponse({'error': 'OTP has expired. Please request a new one.'}, status=400)

    if otp_record.otp_code != otp_code:
        return JsonResponse({'error': 'Invalid OTP code. Please try again.'}, status=400)

    # Mark OTP as used
    otp_record.is_used = True
    otp_record.save(update_fields=['is_used'])

    # Verify the HR user
    hr_user = HRUser.objects.filter(email=email).first()
    if not hr_user:
        return JsonResponse({'error': 'HR account not found'}, status=404)

    hr_user.is_verified = True
    hr_user.save(update_fields=['is_verified'])

    # Log the HR user into session
    request.session['hr_user_id'] = hr_user.id
    request.session['hr_user_email'] = hr_user.email
    request.session.modified = True

    return JsonResponse({
        'message': 'OTP verified successfully. Welcome to Cognive AI HR Portal!',
        'hr_user': {
            'id': hr_user.id,
            'name': hr_user.name,
            'email': hr_user.email,
            'company': hr_user.company,
        },
    })


# ─── HR Login ─────────────────────────────────────────────────────────────────
@csrf_exempt
@require_http_methods(['POST'])
def hr_login(request):
    """Login an existing verified HR user."""
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON body'}, status=400)

    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return JsonResponse({'error': 'Email and password are required'}, status=400)

    hr_user = HRUser.objects.filter(email=email).first()
    if not hr_user:
        return JsonResponse({'error': 'Invalid email or password'}, status=401)

    if not hr_user.is_verified:
        return JsonResponse({
            'error': 'Account not verified. Please complete email verification.',
            'requires_verification': True,
            'email': email,
        }, status=403)

    if not hr_user.check_password(password):
        return JsonResponse({'error': 'Invalid email or password'}, status=401)

    # Set HR session
    request.session['hr_user_id'] = hr_user.id
    request.session['hr_user_email'] = hr_user.email
    request.session.modified = True

    return JsonResponse({
        'message': 'Login successful',
        'hr_user': {
            'id': hr_user.id,
            'name': hr_user.name,
            'email': hr_user.email,
            'company': hr_user.company,
        },
    })


# ─── HR Logout ────────────────────────────────────────────────────────────────
@csrf_exempt
@require_http_methods(['POST', 'OPTIONS'])
def hr_logout(request):
    """Logout HR user by clearing session."""
    request.session.pop('hr_user_id', None)
    request.session.pop('hr_user_email', None)
    request.session.modified = True
    return JsonResponse({'message': 'HR user logged out successfully'})


# ─── HR Me (current HR user info) ─────────────────────────────────────────────
@hr_login_required
@require_http_methods(['GET'])
def hr_me(request):
    """Return the current HR user's info."""
    hr_user = request.hr_user
    return JsonResponse({
        'id': hr_user.id,
        'name': hr_user.name,
        'email': hr_user.email,
        'company': hr_user.company,
        'is_verified': hr_user.is_verified,
    })


# ─── HR Search by UID ─────────────────────────────────────────────────────────
@hr_login_required
@require_http_methods(['GET'])
def hr_search_uid(request):
    """Search for a candidate by their UID and return their latest completed session."""
    from accounts.models import User
    from interviews.models import InterviewSession

    uid = request.GET.get('uid', '').strip().upper()
    if not uid:
        return JsonResponse({'error': 'UID parameter is required'}, status=400)

    try:
        user = User.objects.get(uid=uid)
    except User.DoesNotExist:
        return JsonResponse({'error': 'No candidate found with this UID'}, status=404)

    # Get the latest completed session
    sessions = InterviewSession.objects.filter(
        user=user,
        status='completed',
    ).order_by('-completed_at')

    session_list = []
    for s in sessions[:10]:
        session_list.append({
            'id': s.id,
            'mode': s.mode,
            'difficulty': s.difficulty,
            'role': s.role or None,
            'overall_score': s.overall_score,
            'duration_minutes': s.duration_minutes,
            'created_at': s.created_at.isoformat(),
            'completed_at': s.completed_at.isoformat() if s.completed_at else None,
        })

    return JsonResponse({
        'candidate': {
            'uid': user.uid,
            'name': user.username or user.email.split('@')[0],
            'email': user.email,
            'avatar_url': user.avatar_url,
            'college_name': getattr(user, 'college_name', ''),
            'degree': getattr(user, 'degree', ''),
            'branch': getattr(user, 'branch', ''),
            'address': getattr(user, 'address', ''),
            'phone_number': getattr(user, 'phone_number', ''),
            'skills': getattr(user, 'skills', ''),
            'location': getattr(user, 'location', ''),
            'total_sessions': len(session_list),
        },
        'sessions': session_list,
    })


# ─── HR Search by Role ────────────────────────────────────────────────────────
@hr_login_required
@require_http_methods(['GET'])
def hr_search_role(request):
    """Search for candidates who have completed interviews for a specific role."""
    from interviews.models import InterviewSession

    role = request.GET.get('role', '').strip()
    if not role:
        return JsonResponse({'error': 'Role parameter is required'}, status=400)

    # Find completed sessions for this role (case-insensitive), most recent first
    sessions = InterviewSession.objects.filter(
        status='completed',
        role__iexact=role,
    ).select_related('user').order_by('-completed_at')[:50]

    results = []
    seen_users = set()

    for s in sessions:
        user = s.user
        # Show latest session per user
        if user.id in seen_users:
            continue
        seen_users.add(user.id)

        results.append({
            'session_id': s.id,
            'candidate': {
                'uid': user.uid,
                'name': user.username or user.email.split('@')[0],
                'email': user.email,
                'avatar_url': user.avatar_url,
                'college_name': getattr(user, 'college_name', ''),
                'degree': getattr(user, 'degree', ''),
                'branch': getattr(user, 'branch', ''),
                'address': getattr(user, 'address', ''),
                'phone_number': getattr(user, 'phone_number', ''),
                'skills': getattr(user, 'skills', ''),
                'location': getattr(user, 'location', ''),
            },
            'role': s.role,
            'difficulty': s.difficulty,
            'overall_score': s.overall_score,
            'completed_at': s.completed_at.isoformat() if s.completed_at else None,
        })

    return JsonResponse({
        'role': role,
        'count': len(results),
        'results': results,
    })


# ─── HR Available Roles ───────────────────────────────────────────────────────
@hr_login_required
@require_http_methods(['GET'])
def hr_available_roles(request):
    """Return all distinct roles that have completed interview sessions."""
    from interviews.models import InterviewSession

    roles = (
        InterviewSession.objects
        .filter(status='completed', mode='role')
        .exclude(role='')
        .values_list('role', flat=True)
        .distinct()
        .order_by('role')
    )

    return JsonResponse({'roles': list(roles)})


# ─── HR Candidate Session Detail ──────────────────────────────────────────────
@hr_login_required
@require_http_methods(['GET'])
def hr_candidate_session_detail(request, session_id):
    """Return full interview session details for HR to review a candidate."""
    from interviews.models import InterviewSession

    try:
        session = InterviewSession.objects.select_related('user').get(
            id=session_id,
            status='completed',
        )
    except InterviewSession.DoesNotExist:
        return JsonResponse({'error': 'Session not found'}, status=404)

    user = session.user

    # Flatten questions
    all_questions = []
    q_data = session.questions or {}
    for category, q_list in q_data.items():
        for q in (q_list or []):
            all_questions.append({
                'category': category.replace('_', ' ').title(),
                'text': q,
            })

    return JsonResponse({
        'session': {
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
        },
        'candidate': {
            'uid': user.uid,
            'name': user.username or user.email.split('@')[0],
            'email': user.email,
            'avatar_url': user.avatar_url,
            'college_name': getattr(user, 'college_name', ''),
            'degree': getattr(user, 'degree', ''),
            'branch': getattr(user, 'branch', ''),
            'address': getattr(user, 'address', ''),
            'phone_number': getattr(user, 'phone_number', ''),
            'skills': getattr(user, 'skills', ''),
            'location': getattr(user, 'location', ''),
        },
    })

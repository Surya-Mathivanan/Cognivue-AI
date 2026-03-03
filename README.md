# 🎯 Cognivue AI - Complete Technical Documentation


## Overview

### What is Cognivue AI?

**Cognivue AI** is an intelligent, full-stack web application designed to revolutionize interview preparation for students, freshers, and job seekers. The application leverages Google Gemini AI to provide personalized, context-aware interview practice with real-time feedback.

### Problem Statement

Traditional interview preparation faces several critical challenges:

1. **Limited Personalized Practice**: Most platforms provide generic questions that don't match the candidate's actual skills or experience
2. **No Context Awareness**: Interview questions rarely align with the specific technologies listed on a candidate's resume
3. **Delayed Feedback**: Students don't receive immediate, actionable feedback on their responses
4. **Skill-Job Mismatch**: Questions don't target the actual skills needed for specific job roles

### Solution Approach

Cognivue AI solves these problems through:

1. **Resume Analysis**: AI extracts technical skills, soft skills, and projects from uploaded PDF resumes
2. **Dual Interview Modes**: 
   - Resume-based mode for personalized questions
   - Role-based mode for industry-specific preparation
3. **Real-time AI Evaluation**: Google Gemini evaluates answers instantly with detailed feedback
4. **Progress Tracking**: Historical session data helps users track improvement over time

---
![alt text](<Images/login page.png>)
![alt text](<Images/homme page 1.png>)
![alt text](<Images/homee page 2.png>)
![alt text](<Images/history page.png>)
![alt text](<Images/Screenshot 2026-02-28 094819.png>)
![alt text](<Images/Screenshot 2026-02-28 094854.png>)
![alt text](<Images/Screenshot 2026-02-28 094912.png>)
![alt text](<Images/Screenshot 2026-02-28 094935.png>)





---






---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   Login Screen  │  │    Dashboard    │  │ Interview View  │             │
│  │   (OAuth 2.0)   │  │  (Mode Select)  │  │  (QA + Feedback)│             │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘             │
│           │                    │                    │                       │
│           └────────────────────┴────────────────────┘                       │
│                              React + Vite                                    │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │ HTTPS/JSON
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API LAYER (Django)                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         Django REST Endpoints                        │    │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐ │    │
│  │  │    Auth      │ │   Upload     │ │  Questions   │ │  Feedback  │ │    │
│  │  │   (/auth/)   │ │  (/api/)     │ │   (/api/)    │ │  (/api/)   │ │    │
│  │  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └─────┬──────┘ │    │
│  └─────────┼────────────────┼────────────────┼───────────────┼────────┘    │
│            │                │                │               │              │
│  ┌─────────┴────────────────┴────────────────┴───────────────┴────────┐    │
│  │                      Core Business Logic                            │    │
│  │  ┌────────────────┐ ┌──────────────────┐ ┌──────────────────────┐  │    │
│  │  │Resume Analyzer │ │Question Generator│ │ Feedback Generator   │  │    │
│  │  │ (pdfplumber +  │ │   (Gemini AI)    │ │    (Gemini AI)       │  │    │
│  │  │  pattern match)│ │                  │ │                      │  │    │
│  │  └────────────────┘ └──────────────────┘ └──────────────────────┘  │    │
│  └────────────────────────────────────────────────────────────────────┘    │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATABASE LAYER                                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   accounts_user │  │interviews_session│  │django_session   │             │
│  │   (User Data)   │  │ (Interview Data) │  │ (Auth Sessions) │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                          PostgreSQL / SQLite                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                     ▲
                                     │ API Calls
┌────────────────────────────────────┴────────────────────────────────────────┐
│                         AI LAYER (Google Gemini)                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │  Resume Parsing │  │ Question Gen    │  │ Answer Eval     │             │
│  │  (Skill Extract)│  │ (Context-aware) │  │ (Feedback Gen)  │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack Deep Dive

### Why Django Instead of Flask?

The original project specification mentioned Flask, but the implementation uses Django. Here's why:

| Aspect | Django Advantage |
|--------|------------------|
| **ORM** | Built-in robust ORM vs SQLAlchemy setup required |
| **Admin Interface** | Auto-generated admin panel for data management |
| **Migrations** | Built-in database migration system |
| **Security** | Built-in CSRF, XSS, SQL injection protection |
| **Authentication** | Comprehensive auth system with session management |
| **Scalability** | Battle-tested at scale (Instagram, Pinterest) |

### Why React + Vite?

**React**:
- Component-based architecture for maintainable UI
- Large ecosystem and community support
- Virtual DOM for efficient rendering
- React hooks for state management

**Vite**:
- Lightning-fast HMR (Hot Module Replacement)
- Out-of-the-box TypeScript support (though this project uses JSX)
- Optimized production builds with Rollup
- Native ES modules support

### Why Google Gemini AI?

1. **Advanced Reasoning**: Gemini 2.5 Pro/Flash offers state-of-the-art reasoning capabilities
2. **Structured Output**: Native JSON schema support via `response_schema` parameter
3. **Cost-Effective**: Competitive pricing compared to GPT-4
4. **Multimodal**: Supports text, image, and video analysis (future extensibility)

### Why PostgreSQL for Production?

1. **ACID Compliance**: Guarantees data integrity for critical interview data
2. **JSON Support**: Native JSON/JSONB fields for flexible question/answer storage
3. **Scalability**: Excellent performance with large datasets
4. **Django Integration**: `dj-database-url` makes configuration seamless

---

## Database Design & Rationale

### Entity Relationship Diagram

```
┌─────────────────┐         ┌─────────────────────────┐
│  accounts_user  │         │   interviews_session    │
├─────────────────┤         ├─────────────────────────┤
│ id (PK)         │◄────────┤ id (PK)                 │
│ email (unique)  │    1:M  │ user_id (FK)            │
│ username        │         │ mode                    │
│ avatar_url      │         │ difficulty              │
│ google_id       │         │ role                    │
│ is_active       │         │ resume_filename         │
│ date_joined     │         │ technical_skills (JSON) │
└─────────────────┘         │ soft_skills (JSON)      │
                            │ projects (JSON)         │
                            │ questions (JSON)        │
                            │ answers (JSON)          │
                            │ feedback (JSON)         │
                            │ status                  │
                            │ created_at              │
                            │ completed_at            │
                            └─────────────────────────┘
```

### Why Custom User Model?

The [`accounts/models.py`](backend/accounts/models.py:1) defines a custom User model because:

1. **Email as Primary Identifier**: Unlike Django's default username-based auth, this uses email (required for Google OAuth)
2. **OAuth Support**: `avatar_url` and `google_id` store Google profile data
3. **Future-Proofing**: Easy to add custom fields like `subscription_tier`, `interview_quota`, etc.

```python
class User(AbstractUser):
    email = models.EmailField(unique=True)  # Primary identifier
    username = models.CharField(blank=True)  # Display name (non-unique)
    avatar_url = models.URLField(blank=True)  # Google profile picture
    google_id = models.CharField(blank=True)  # OAuth subject ID
    
    USERNAME_FIELD = 'email'  # Login with email instead of username
```

### Why JSON Fields for Session Data?

The [`InterviewSession`](backend/interviews/models.py:6) model uses JSON fields for:
- `technical_skills`: Array of extracted skills with categories
- `soft_skills`: Soft skills with context
- `projects`: Project details with technologies
- `questions`: Generated questions categorized by type
- `answers`: User's responses
- `feedback`: AI-generated evaluation

**Rationale**: Interview data is semi-structured and varies per session. JSON fields provide:
1. **Flexibility**: Schema can evolve without migrations
2. **Queryability**: Django's JSONField supports path lookups
3. **Performance**: PostgreSQL's JSONB is indexed and optimized

### Session State Management

```python
STATUS_CHOICES = [('active', 'Active'), ('completed', 'Completed')]
```

Sessions track state to:
1. Allow users to resume incomplete interviews
2. Prevent data loss on browser refresh
3. Enable analytics on completion rates

---

## Backend Implementation

### Application Structure

```
backend/
├── cognivue/              # Project configuration
│   ├── settings.py        # All settings with environment-based config
│   ├── urls.py            # Root URL routing
│   └── wsgi.py            # WSGI entry point
├── accounts/              # Authentication app
│   ├── models.py          # Custom User model
│   ├── views.py           # Google OAuth handlers
│   ├── urls.py            # Auth routes
│   └── backends.py        # Email authentication backend
├── interviews/            # Core interview functionality
│   ├── models.py          # InterviewSession model
│   ├── views.py           # API endpoints (18 endpoints)
│   └── urls.py            # API route definitions
└── core/                  # AI/ML modules
    ├── gemini.py          # Gemini client wrapper
    ├── resume_analyzer.py # Resume parsing logic
    └── question_generator.py # Question generation
```

### Authentication System

#### Why Google OAuth?

1. **Security**: No password storage (reduces breach risk)
2. **User Experience**: One-click login, no password to remember
3. **Trust**: Users trust Google's security infrastructure
4. **Profile Data**: Automatic access to name, email, avatar

#### OAuth Flow Implementation

```python
# Step 1: Initiate OAuth (accounts/views.py)
class GoogleLoginView(View):
    def get(self, request):
        client = WebApplicationClient(GOOGLE_OAUTH_CLIENT_ID)
        request_uri = client.prepare_request_uri(
            auth_endpoint,
            redirect_uri=GOOGLE_REDIRECT_URI,
            scope=['openid', 'email', 'profile'],
            prompt='select_account consent',  # Force account selection
        )
        return redirect(request_uri)

# Step 2: Handle Callback (accounts/views.py)
class GoogleCallbackView(View):
    def get(self, request):
        # Exchange code for tokens
        # Fetch user info from Google
        # Create or get user in database
        # Log user in
```

#### Session Configuration

```python
# settings.py - Secure session handling
SESSION_COOKIE_AGE = 60 * 60 * 24 * 7   # 7 days
SESSION_COOKIE_SAMESITE = 'Lax' if local else 'None'
SESSION_COOKIE_SECURE = not local       # HTTPS only in production
SESSION_COOKIE_HTTPONLY = True          # Prevent XSS access
```

**Why These Settings?**
- **7-day expiry**: Balances security with user convenience
- **SameSite**: 'None' for cross-domain deployment (frontend/backend on different domains)
- **Secure**: Ensures cookies only sent over HTTPS in production
- **HttpOnly**: Prevents JavaScript access to session cookie (XSS protection)

### Resume Analysis System

#### The Challenge

Resume parsing is complex because:
1. PDFs have varying structures (tables, columns, different fonts)
2. Skills can be mentioned anywhere in the document
3. Context matters ("Python" could be a skill or a course name)

#### Hybrid Approach

The [`ResumeAnalyzer`](backend/core/resume_analyzer.py:55) uses a **hybrid extraction strategy**:

1. **Pattern Matching** (Fast, deterministic):
   - Matches against 100+ predefined technical skills
   - Uses word boundaries (`\bskill\b`) for accuracy
   - Categorizes skills (programming, frameworks, databases, etc.)

2. **LLM Extraction** (Intelligent, context-aware):
   - Uses Gemini to understand context
   - Extracts nuanced information (experience level, project details)
   - Generates professional summary

```python
class ResumeAnalyzer:
    TECHNICAL_SKILLS = {
        'programming_languages': ['python', 'java', 'javascript', ...],
        'web_frameworks': ['react', 'angular', 'django', ...],
        'databases': ['mysql', 'postgresql', 'mongodb', ...],
        # 100+ skills across 7 categories
    }
    
    def analyze(self, pdf_path):
        # Step 1: Extract text
        text = self.extract_text_from_pdf(pdf_path)
        
        # Step 2: Pattern matching (fast)
        technical_skills = self.extract_technical_skills(text)
        soft_skills = self.extract_soft_skills(text)
        projects = self.extract_projects_basic(text)
        
        # Step 3: LLM extraction (intelligent)
        llm_results = self.llm_extract_resume_details(text)
        
        # Step 4: Merge results
        return self._merge_results(pattern_results, llm_results)
```

#### Why pdfplumber + PyPDF2?

```python
def extract_text_from_pdf(self, pdf_path):
    try:
        # Primary: pdfplumber (better table/layout handling)
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() + "\n"
    except:
        # Fallback: PyPDF2 (more compatible with older PDFs)
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            ...
```

**pdfplumber**:
- Superior table extraction
- Better handling of multi-column layouts
- Maintains text order more accurately

**PyPDF2 Fallback**:
- Handles encrypted/older PDFs
- More lenient with malformed files
- Ensures analysis always succeeds

### Question Generation System

#### Why Context-Aware Questions?

Generic questions don't test relevant skills. A Python developer shouldn't answer Java questions.

#### Generation Strategy

The [`QuestionGenerator`](backend/core/question_generator.py:17) creates **three types of questions**:

1. **Technical Questions (5)**: Based on extracted technical skills
2. **HR Questions (4)**: Based on soft skills and experience level
3. **Project Questions (3)**: Based on actual projects mentioned

```python
def generate_resume_based_questions(self, technical_skills, soft_skills, projects, difficulty):
    # Technical: Test actual skills from resume
    technical_questions = self._generate_technical_questions(skills, difficulty)
    
    # HR: Assess soft skills mentioned
    hr_questions = self._generate_hr_questions(soft_skills, difficulty)
    
    # Project: Deep dive into actual work
    project_questions = self._generate_project_questions(projects, difficulty)
    
    return {
        'technical_questions': technical_questions,
        'hr_questions': hr_questions,
        'project_questions': project_questions
    }
```

#### Prompt Engineering

```python
prompt = f"""You are an expert technical interviewer conducting a {difficulty} level interview.

The candidate has listed these technical skills: {skills_str}

Generate exactly 5 technical interview questions that are:
1. Appropriate for {difficulty} level ({level_description})
2. Test practical knowledge of the listed skills
3. Include a mix of conceptual and practical questions
4. Progress from easier to harder

Format: Return only a JSON array of question strings.
"""
```

**Why This Prompt Structure?**
- **Role assignment**: "Expert technical interviewer" sets tone
- **Context injection**: Actual skills from resume
- **Constraints**: "Exactly 5" ensures consistent output
- **Difficulty context**: Variable description per level
- **Output format**: JSON array for reliable parsing

### API Endpoint Design

#### RESTful Structure

All endpoints follow REST conventions:

```python
# interviews/urls.py
urlpatterns = [
    path('health/', views.health_check),           # GET - Status check
    path('user-info/', views.user_info),           # GET - Current user
    path('logout/', views.logout_view),            # POST - End session
    path('upload-resume/', views.upload_resume),   # POST - File upload
    path('generate-questions/', views.generate_questions),  # POST - Create questions
    path('submit-answer/', views.submit_answer),   # POST - Save answer
    path('complete-interview/', views.complete_interview),  # POST - Get feedback
    path('session-history/', views.session_history),        # GET - List sessions
    path('session/<int:session_id>/', views.session_detail),  # GET - Single session
]
```

#### Why `@api_login_required` Decorator?

```python
def api_login_required(view_func):
    """Returns 401 JSON instead of redirect for unauthenticated API requests."""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        return view_func(request, *args, **kwargs)
    return wrapper
```

Django's default `@login_required` redirects to login page, which breaks API contracts. This custom decorator:
1. Returns proper HTTP 401 status
2. Returns JSON error (not HTML redirect)
3. Maintains consistent API response format

#### File Upload Handling

```python
@csrf_exempt
@api_login_required
@require_http_methods(['POST'])
def upload_resume(request):
    # Validation
    if 'resume' not in request.FILES:
        return JsonResponse({'error': 'No resume file provided'}, status=400)
    
    file = request.FILES['resume']
    if not file.name.lower().endswith('.pdf'):
        return JsonResponse({'error': 'Invalid file format'}, status=400)
    
    # Secure filename
    filename = secure_filename(file.name)
    unique_filename = f"{request.user.id}_{int(time.time())}_{filename}"
    
    # Save and analyze
    ...
```

**Security Measures**:
- `secure_filename()`: Prevents path traversal attacks
- User ID prefix: Isolates files per user
- Timestamp: Prevents filename collisions
- Extension check: Ensures only PDFs accepted

---

## Frontend Implementation

### Component Architecture

```
App.jsx (Root)
├── LoginScreen.jsx          # Google OAuth login
├── Dashboard.jsx            # Main navigation hub
│   ├── ResumeUpload.jsx     # PDF upload + analysis
│   ├── RoleSelection.jsx    # Role-based mode
│   ├── InterviewSession.jsx # Question/answer flow
│   ├── FeedbackDashboard.jsx # Results display
│   ├── SessionHistory.jsx   # Past interviews
│   └── SessionDetailPage.jsx # Single session view
├── TermsOfService.jsx       # Legal
└── PrivacyPolicy.jsx        # Legal
```

### State Management

React hooks manage state locally (no Redux needed for this scale):

```javascript
// App.jsx - Global auth state
const [user, setUser] = useState(null);        // Current user
const [loading, setLoading] = useState(true);  // App initialization
const [theme, setTheme] = useState("dark");    // Dark/light mode

// Dashboard.jsx - Navigation state
const [currentView, setCurrentView] = useState('mode-selection');
const [interviewData, setInterviewData] = useState(null);
const [feedbackData, setFeedbackData] = useState(null);
```

### API Integration

```javascript
// api.js - Centralized API configuration
export const getApiUrl = (path) => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  return `${baseUrl}${path}`;
};

// Usage in components
fetch(getApiUrl('/api/user-info/'), {
  credentials: 'include'  // Important: Sends session cookie
})
```

**Why `credentials: 'include'`?**
- Required for session-based authentication
- Sends cookies across domains (CORS)
- Maintains login state between requests

### Theme System

```javascript
// Theme toggle with localStorage persistence
const toggleTheme = () => {
  const newTheme = theme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
  localStorage.setItem('theme', newTheme);
  document.body.className = newTheme;
};

// On mount - restore saved theme
useEffect(() => {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  setTheme(savedTheme);
  document.body.className = savedTheme;
}, []);
```

### Route Protection

```javascript
// App.jsx - Conditional rendering based on auth
<Route
  path="/"
  element={
    user ? (
      <Dashboard user={user} ... />
    ) : (
      <LoginScreen setUser={setUser} ... />
    )
  }
/>
```

**Why Client-Side Protection?**
- React Router handles SPA navigation
- Backend API already has `@api_login_required`
- Provides smooth UX (no full page reloads)

---

## AI/ML Components

### Gemini Client Configuration

```python
# core/gemini.py
from google import genai
from google.genai import types
from pydantic import BaseModel

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
```

### Structured Output with Pydantic

```python
class Sentiment(BaseModel):
    rating: int
    confidence: float

def analyze_sentiment(text: str) -> Sentiment:
    response = client.models.generate_content(
        model="gemini-2.5-pro",
        contents=[text],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=Sentiment,  # Enforces schema
        ),
    )
    return Sentiment(**json.loads(response.text))
```

**Why Pydantic + Structured Output?**
1. **Type Safety**: Compile-time validation of AI responses
2. **Schema Enforcement**: Gemini validates output against schema
3. **Auto-Documentation**: Models document expected fields
4. **IDE Support**: Autocomplete and type hints

### Answer Evaluation Logic

```python
def evaluate_answer(question: str, answer: str, context: dict) -> dict:
    """
    Evaluates interview answer and generates comprehensive feedback.
    
    Returns:
        {
            'overall_score': 85,
            'technical_accuracy': 90,
            'communication': 80,
            'problem_solving': 85,
            'strengths': ['Clear explanation', 'Good examples'],
            'weaknesses': ['Missing edge cases'],
            'improvement_suggestions': ['Consider discussing scalability']
        }
    """
    prompt = f"""
    Question: {question}
    Answer: {answer}
    Context: {context}
    
    Evaluate this interview answer comprehensively...
    """
    # Gemini analysis with structured output
    ...
```

---

## API Documentation

### Authentication Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/auth/google/` | GET | Initiate Google OAuth | No |
| `/auth/google/callback/` | GET | OAuth callback | No |
| `/auth/logout/` | POST | Logout user | Yes |

### Core API Endpoints

#### Health Check
```http
GET /api/health/

Response:
{
  "status": "healthy",
  "message": "Cognivue AI Backend (Django) Running",
  "framework": "Django"
}
```

#### Get Current User
```http
GET /api/user-info/

Response:
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "avatar_url": "https://..."
}
```

#### Upload Resume
```http
POST /api/upload-resume/
Content-Type: multipart/form-data

Body:
- resume: <PDF file>

Response:
{
  "message": "Resume uploaded and analyzed successfully",
  "filename": "1_1234567890_resume.pdf",
  "analysis": {
    "technical_skills": [...],
    "soft_skills": [...],
    "projects": [...],
    "experience_level": "mid",
    "summary": "Software engineer with 3 years..."
  }
}
```

#### Generate Questions
```http
POST /api/generate-questions/
Content-Type: application/json

Body (Resume Mode):
{
  "mode": "resume",
  "difficulty": "intermediate",
  "analysis": { ... },
  "filename": "1_1234567890_resume.pdf"
}

Body (Role Mode):
{
  "mode": "role",
  "difficulty": "advanced",
  "role": "Software Engineer",
  "keywords": ["python", "django", "aws"]
}

Response:
{
  "session_id": 42,
  "questions": {
    "technical_questions": [...],
    "hr_questions": [...],
    "project_questions": [...]
  }
}
```

#### Submit Answer
```http
POST /api/submit-answer/
Content-Type: application/json

Body:
{
  "session_id": 42,
  "question_index": 0,
  "answer": "My approach would be to..."
}

Response:
{
  "message": "Answer submitted successfully"
}
```

#### Complete Interview
```http
POST /api/complete-interview/
Content-Type: application/json

Body:
{
  "session_id": 42
}

Response:
{
  "message": "Interview completed",
  "feedback": {
    "overall_score": 85,
    "technical_accuracy": 90,
    "communication": 80,
    "strengths": [...],
    "weaknesses": [...],
    "improvement_suggestions": [...]
  }
}
```

#### Session History
```http
GET /api/session-history/

Response:
{
  "sessions": [
    {
      "id": 42,
      "mode": "resume",
      "difficulty": "intermediate",
      "status": "completed",
      "created_at": "2026-03-01T10:00:00Z",
      "overall_score": 85
    }
  ]
}
```

---

## Authentication Flow

### Google OAuth 2.0 Flow

```
┌─────────┐                                    ┌─────────────┐
│  User   │ ──────── 1. Click Login ─────────► │   Frontend  │
└─────────┘                                    └──────┬──────┘
                                                      │
                              2. Redirect to Google OAuth
                                                      ▼
                                              ┌──────────────┐
                                              │    Google    │
                                              │  OAuth Server│
                                              └──────┬───────┘
                                                     │
                         3. User Consent & Authorization
                                                     │
                              4. Redirect with auth code
                                                     ▼
┌─────────┐     5. Exchange code for tokens      ┌─────────────┐
│ Backend │ ◄────────────────────────────────────│    Google   │
└────┬────┘                                      └─────────────┘
     │
     │ 6. Fetch user info with access token
     ▼
┌─────────┐     7. Create/get user in DB         ┌─────────────┐
│  User   │ ◄────────────────────────────────────│   Backend   │
│ Session │                                      └─────────────┘
│ Created │
└────┬────┘
     │
     │ 8. Set session cookie
     ▼
┌─────────┐
│Frontend │ ◄── 9. Redirect with authenticated session
│  Home   │
└─────────┘
```

### Session Security

1. **CSRF Protection**: Django's CSRF middleware validates requests
2. **Secure Cookies**: HttpOnly, Secure, SameSite flags
3. **Session Expiry**: 7-day automatic expiration
4. **Database Sessions**: Stored server-side (not JWT in localStorage)

---

## Interview Flow

### Complete User Journey

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            1. AUTHENTICATION                                 │
│                                                                              │
│   ┌──────────┐     ┌────────────┐     ┌─────────────┐     ┌──────────┐    │
│   │  Login   │ ──► │   Google   │ ──► │   Backend   │ ──► │Dashboard │    │
│   │  Screen  │     │    OAuth   │     │ Auth Create │     │  (Home)  │    │
│   └──────────┘     └────────────┘     └─────────────┘     └──────────┘    │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         2. MODE SELECTION                                    │
│                                                                              │
│   ┌─────────────────┐                ┌─────────────────┐                   │
│   │  Resume-Based   │                │   Role-Based    │                   │
│   │     Mode        │                │      Mode       │                   │
│   │                 │                │                 │                   │
│   │ Upload PDF ─────┼──► Analysis    │ Select Role ────┼──► Questions      │
│   │ AI Extracts     │                │ Predefined Qs   │                   │
│   │ Skills &        │                │ for Role        │                   │
│   │ Projects        │                │                 │                   │
│   └─────────────────┘                └─────────────────┘                   │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       3. DIFFICULTY SELECTION                                │
│                                                                              │
│   ┌──────────┐  ┌──────────────┐  ┌──────────┐                              │
│   │ Beginner │  │Intermediate  │  │ Advanced │                              │
│   │ (0-1 yr) │  │  (1-3 yrs)   │  │ (3+ yrs) │                              │
│   └──────────┘  └──────────────┘  └──────────┘                              │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      4. INTERVIEW SESSION                                    │
│                                                                              │
│   Question Display                                                            │
│        │                                                                      │
│        ▼                                                                      │
│   ┌────────────┐     ┌────────────┐     ┌────────────┐                      │
│   │  Technical │ ──► │     HR     │ ──► │  Project   │                      │
│   │  Q1 → Q5   │     │  Q1 → Q4   │     │  Q1 → Q3   │                      │
│   └────────────┘     └────────────┘     └────────────┘                      │
│        │                                                                      │
│        ▼                                                                      │
│   Answer Input (Text) ──► Submit ──► Save to Database                        │
│                                                                              │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      5. FEEDBACK GENERATION                                  │
│                                                                              │
│   ┌───────────────────────────────────────────────────────────────────────┐ │
│   │                    Gemini AI Evaluation                               │ │
│   │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │ │
│   │  │  Technical   │ │Communication │ │   Problem    │ │    Overall   │ │ │
│   │  │  Accuracy    │ │    Skills    │ │   Solving    │ │    Score     │ │ │
│   │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ │ │
│   └───────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       6. FEEDBACK DASHBOARD                                  │
│                                                                              │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│   │  Score Display  │  │  Strengths &    │  │  Improvement    │            │
│   │  (Radar Chart)  │  │  Weaknesses     │  │  Suggestions    │            │
│   └─────────────────┘  └─────────────────┘  └─────────────────┘            │
│                                                                              │
│   [View Session History] [Start New Interview]                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Deployment Guide

### Local Development Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd Cognive-AI

# 2. Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 3. Database setup
python manage.py migrate
python manage.py createsuperuser

# 4. Environment variables
cp .env.example .env
# Edit .env with your API keys

# 5. Run backend
python manage.py runserver

# 6. Frontend setup (new terminal)
cd ../frontend
npm install
npm run dev

# 7. Access application
# Frontend: http://localhost:5173
# Backend: http://localhost:8000
# Admin: http://localhost:8000/admin
```

### Production Deployment (Render)

The [`render.yaml`](render.yaml:1) file configures automatic deployment:

```yaml
services:
  - type: web
    name: cognivue-ai-backend
    env: python
    region: frankfurt
    plan: free
    buildCommand: |
      pip install -r requirements.txt &&
      cd backend && python fix_migrations.py &&
      cd ../frontend && npm install && npm run build
    startCommand: |
      cd backend && gunicorn cognivue.wsgi:application 
        --bind 0.0.0.0:$PORT 
        --workers 2 
        --timeout 120
    healthCheckPath: /api/health/
```

**Build Process**:
1. Install Python dependencies
2. Run database migrations
3. Install Node dependencies
4. Build React frontend

**Runtime**:
- Gunicorn WSGI server
- 2 workers (handles concurrent requests)
- 120-second timeout (for AI processing)

---

## Environment Variables

### Required Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `GEMINI_API_KEY` | Google Gemini AI access | `AIzaSyB...` |
| `GOOGLE_OAUTH_CLIENT_ID` | Google OAuth app ID | `123456789.apps...` |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Google OAuth secret | `GOCSPX-...` |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL | `https://.../auth/google/callback/` |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@host/db` |
| `SESSION_SECRET` | Django secret key | `django-insecure-...` |

### Optional Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `FRONTEND_URL` | CORS allowed origin | `http://localhost:3000` |
| `CORS_ORIGINS` | Additional CORS origins | - |
| `FLASK_DEBUG` | Debug mode | `True` |
| `MAX_UPLOAD_SIZE` | Max file upload size | `16777216` (16MB) |

### Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project
3. Enable APIs:
   - Google+ API (for OAuth)
   - Gemini API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://your-domain.com/auth/google/callback/`
6. Copy Client ID and Secret to environment variables

---

## Security Considerations

1. **API Key Protection**: Never commit `.env` files; use Render/Google Secret Manager
2. **CSRF Protection**: Enabled for all state-changing operations
3. **File Upload Security**: 
   - Extension validation (PDF only)
   - Filename sanitization
   - Size limits (16MB default)
4. **Session Security**: HttpOnly, Secure, SameSite cookies
5. **CORS**: Whitelist-based origin validation

---

## Performance Optimizations

1. **Database Connection Pooling**: `conn_max_age=600` in database config
2. **Static File Serving**: WhiteNoise or CDN for production
3. **React Build Optimization**: Vite produces optimized bundles
4. **AI Response Caching**: Consider caching common question patterns
5. **Lazy Loading**: Components loaded on-demand via React Router

---

## Future Enhancements

1. **Speech-to-Text**: Add voice answer capability
2. **Video Interviews**: WebRTC integration for live video
3. **Multi-language Support**: i18n for global accessibility
4. **Mobile App**: React Native port
5. **AI Tutor**: Personalized learning paths based on weak areas
6. **Integration**: LinkedIn, GitHub profile import

---

## License

MIT License - See LICENSE file for details

---

## Support

For issues or questions:
- Create an issue in the repository
- Contact: support@cognivue.ai

---

**Built with ❤️ to help you land your dream job!**

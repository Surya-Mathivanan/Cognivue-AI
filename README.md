# 🎯 Cognivue AI

## 📋 Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [How to Run](#how-to-run)
- [Project Structure](#project-structure)
- [Core Components Explained](#core-components-explained)
- [Why We Use These Technologies](#why-we-use-these-technologies)
- [Database Configuration](#database-configuration)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)
- [Future Enhancements](#future-enhancements)

---

## 🌟 Overview


Cognivue AI

Tagline suggestion:
"Practice. Improve. Get Hired — Smarter with AI."

**Cognivue AI** is an intelligent, full-stack web application designed to revolutionize interview preparation for students, freshers, and job seekers. By leveraging cutting-edge AI technology (Google Gemini AI), this application provides personalized, context-aware interview practice with real-time feedback.

### What Problem Does It Solve?
- **Limited Interview Practice**: Traditional interview preparation lacks personalized, realistic practice opportunities
- **Generic Questions**: Most interview prep tools provide one-size-fits-all questions
- **No Instant Feedback**: Students don't receive immediate, constructive feedback on their responses
- **Resume-Skill Mismatch**: Interview questions often don't align with skills listed on resumes

### How Does It Work?
1. **User Authentication**: Secure Google OAuth login
2. **Two Interview Modes**:
   - **Resume-Based**: Upload your PDF resume → AI analyzes skills → Generates tailored questions
   - **Role-Based**: Select a job role → AI generates industry-specific questions
3. **Interactive Interview**: Answer questions via text input
4. **AI Evaluation**: Google Gemini AI evaluates responses and provides detailed feedback
5. **Performance Tracking**: View comprehensive feedback and improvement suggestions

---

## 🚀 Key Features

### 1. **Intelligent Resume Analysis**
- PDF resume parsing and content extraction
- AI-powered skill identification (technical & soft skills)
- Project and experience level detection
- Keyword extraction for targeted questioning

### 2. **Dual Interview Modes**
- **Resume-Based Interview**: Questions tailored to YOUR specific skills and experience
- **Role-Based Interview**: Industry-specific questions for predefined roles (Software Engineer, Data Scientist, etc.)

### 3. **Difficulty Levels**
- **Beginner**: Entry-level questions for freshers
- **Intermediate**: Mid-level complexity for 1-3 years experience
- **Advanced**: Senior-level questions for experienced professionals

### 4. **AI-Powered Feedback**
- Comprehensive response evaluation
- Strengths and areas for improvement
- Sentiment analysis and confidence scoring
- Category-wise performance metrics (technical accuracy, communication, problem-solving)

### 5. **Secure Authentication**
- Google OAuth 2.0 integration
- Session management with Flask-Login
- User-specific data isolation

### 6. **Modern UI/UX**
- Responsive design with gradient aesthetics
- Interactive animations and loading states
- Clean, professional interface
- Mobile-friendly layout

---

## 💻 Technology Stack

### Frontend
- **React 19.1.1**: Modern, component-based UI framework
- **Vite**: Lightning-fast build tool and development server
- **React Router DOM**: Client-side routing for single-page application
- **Custom CSS**: Handcrafted styling with gradients and animations

### Backend
- **Python 3.11+**: Core backend language
- **Flask**: Lightweight, flexible web framework
- **Flask-SQLAlchemy**: ORM for database operations
- **Flask-Login**: User session management
- **Flask-CORS**: Cross-origin resource sharing for API calls

### AI & Machine Learning
- **Google Gemini AI (2.5 Flash/Pro)**: Advanced language model for:
  - Question generation
  - Resume analysis
  - Response evaluation
  - Feedback generation
- **Pydantic**: Data validation and structured AI responses

### Database
- **SQLite** (Development): Lightweight, file-based database
- **PostgreSQL** (Production): Robust, scalable relational database
- **SQLAlchemy ORM**: Database abstraction layer

### Authentication
- **Google OAuth 2.0**: Secure, industry-standard authentication
- **oauthlib**: OAuth client implementation

### File Handling
- **PyPDF2/pdfplumber**: PDF parsing and text extraction
- **Werkzeug**: Secure filename handling

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INTERFACE                         │
│         (React Frontend - Port 3000/5000)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Login   │  │  Resume  │  │Interview │  │ Feedback │  │
│  │  Screen  │  │  Upload  │  │ Session  │  │Dashboard │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST API
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               BACKEND API LAYER (Flask)                     │
│                    (Port 5000)                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Authentication Routes  │  Interview Routes          │  │
│  │  - Google OAuth Login   │  - Upload Resume           │  │
│  │  - Session Management   │  - Generate Questions      │  │
│  │                         │  - Submit Answers          │  │
│  │                         │  - Get Feedback            │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────┬─────────────────────────┬──────────────────────┘
             │                         │
             ▼                         ▼
┌───────────────────────┐   ┌──────────────────────────────┐
│   DATABASE LAYER      │   │    AI SERVICES LAYER         │
│   (SQLAlchemy ORM)    │   │   (Google Gemini AI)         │
│                       │   │                              │
│  ┌─────────────────┐ │   │  ┌────────────────────────┐ │
│  │ User Model      │ │   │  │ Resume Analyzer        │ │
│  │ - Profile Data  │ │   │  │ - Skill Extraction     │ │
│  │ - OAuth Info    │ │   │  │ - Content Summarization│ │
│  └─────────────────┘ │   │  └────────────────────────┘ │
│                       │   │                              │
│  ┌─────────────────┐ │   │  ┌────────────────────────┐ │
│  │Interview Session│ │   │  │ Question Generator     │ │
│  │ - Questions     │ │   │  │ - Context-Aware        │ │
│  │ - Answers       │ │   │  │ - Difficulty Scaling   │ │
│  │ - Feedback      │ │   │  └────────────────────────┘ │
│  └─────────────────┘ │   │                              │
│                       │   │  ┌────────────────────────┐ │
│ SQLite/PostgreSQL    │   │  │ Response Evaluator     │ │
│                       │   │  │ - Sentiment Analysis   │ │
│                       │   │  │ - Scoring              │ │
│                       │   │  │ - Feedback Generation  │ │
│                       │   │  └────────────────────────┘ │
└───────────────────────┘   └──────────────────────────────┘
```

### Data Flow

1. **User Login** → Google OAuth → User record in database
2. **Resume Upload** → PDF parsing → AI analysis → Skill extraction
3. **Question Generation** → AI processes skills/role → Generates questions → Stored in session
4. **Answer Submission** → User response → AI evaluation → Feedback generation
5. **Feedback Display** → Retrieved from session → Formatted → Displayed to user

---

## 📦 Prerequisites

Before setting up the project, ensure you have:

### Required Software
- **Python 3.11 or higher**
  - Download: https://www.python.org/downloads/
  - Verify: `python --version`
  
- **Node.js (version 16 or higher)**
  - Download: https://nodejs.org/
  - Verify: `node --version` and `npm --version`

- **Git** (for version control)
  - Download: https://git-scm.com/downloads

### Required API Keys & Credentials

1. **Google Gemini AI API Key**
   - Visit: https://ai.google.dev/
   - Create a project and enable Gemini API
   - Generate API key

2. **Google OAuth 2.0 Credentials**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 Client ID (Web application)
   - Add authorized redirect URIs:
     - `http://localhost:5000/auth/callback`
     - `http://localhost:3000/auth/callback` (for development)
   - Note down Client ID and Client Secret

### Optional
- **uv** (Modern Python package manager - faster alternative to pip)
  - Install: `pip install uv`
  - Documentation: https://github.com/astral-sh/uv

---

## 🛠️ Installation & Setup

### Step 1: Clone the Repository
```bash
git clone <your-repository-url>
cd Final_Year_Project
```

### Step 2: Backend Setup

#### 2.1 Create Virtual Environment (Recommended)
```bash
# Using venv
python -m venv venv

# Activate on Windows
venv\Scripts\activate

# Activate on Linux/Mac
source venv/bin/activate
```

#### 2.2 Install Python Dependencies

**Option A: Using uv (Faster)**
```bash
uv sync
```

**Option B: Using pip**
```bash
pip install -r requirements.txt
```

**Key Python Packages Installed:**
- `flask`: Web framework
- `flask-sqlalchemy`: Database ORM
- `flask-login`: Authentication
- `flask-cors`: Cross-origin support
- `google-generativeai`: Gemini AI SDK
- `pydantic`: Data validation
- `python-dotenv`: Environment variable management
- `oauthlib`: OAuth 2.0 implementation
- `PyPDF2` or `pdfplumber`: PDF parsing

#### 2.3 Configure Environment Variables

Create a `.env` file in the project root:
```bash
touch .env
```

Add the following configuration:
```env
# Session Security
SESSION_SECRET=your-random-secret-key-here-generate-a-long-secure-string

# Google OAuth 2.0
GOOGLE_OAUTH_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your-google-client-secret

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Database (SQLite for development)
DATABASE_URL=sqlite:///interview_assistant.db

# Or PostgreSQL for production
# DATABASE_URL=postgresql://username:password@localhost:5432/interview_assistant

# Application URL (for OAuth redirects)
REPLIT_DEV_DOMAIN=localhost:5000
```

**⚠️ Security Notes:**
- Never commit `.env` file to version control
- Add `.env` to `.gitignore`
- Generate strong random strings for SESSION_SECRET
- Keep API keys confidential

#### 2.4 Initialize Database
```bash
# Run Flask shell to create database tables
python
>>> from backend.app import app, db
>>> with app.app_context():
...     db.create_all()
>>> exit()
```

### Step 3: Frontend Setup

#### 3.1 Navigate to Frontend Directory
```bash
cd frontend
```

#### 3.2 Install Node Dependencies
```bash
npm install
```

**Key Packages Installed:**
- `react` & `react-dom`: UI framework
- `react-router-dom`: Client-side routing
- `vite`: Build tool and dev server
- `@vitejs/plugin-react`: React support for Vite

#### 3.3 Configure Vite Port (Optional)

Edit `frontend/vite.config.js`:
```javascript
export default {
  server: {
    port: 3000, // Change if needed
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
}
```

---

## 🚀 How to Run

### Development Mode (Recommended for Development)

#### Terminal 1: Start Backend Server
```bash
# From project root
python backend/app.py
```
- Backend runs on: **http://localhost:5000**
- API endpoints: **http://localhost:5000/api/**

#### Terminal 2: Start Frontend Dev Server
```bash
# From project root
cd frontend
npm run dev
```
- Frontend runs on: **http://localhost:3000** (or configured port)
- Hot Module Replacement (HMR) enabled for instant updates

#### Access the Application
Open your browser and navigate to:
- **Development**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/health (health check)

### Production Mode

#### Build Frontend
```bash
cd frontend
npm run build
```
- Creates optimized production build in `frontend/dist/`

#### Run Production Server
```bash
# From project root
python backend/app.py
```
- Backend serves built frontend
- Access at: **http://localhost:5000**

---

## 📁 Project Structure

```
Final_Year_Project/
│
├── backend/                      # Backend Python/Flask application
│   ├── app.py                   # Main Flask application
│   ├── models.py                # Database models (User, InterviewSession)
│   ├── google_auth.py           # Google OAuth implementation
│   ├── gemini.py                # Gemini AI client initialization
│   ├── resume_analyzer.py       # PDF parsing & AI resume analysis
│   ├── question_generator.py    # AI-powered question generation
│   └── requirements.txt         # Python dependencies
│
├── frontend/                     # React frontend application
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── LoginScreen.jsx         # Google OAuth login UI
│   │   │   ├── Dashboard.jsx           # Mode selection screen
│   │   │   ├── ResumeUpload.jsx        # Resume upload interface
│   │   │   ├── RoleSelection.jsx       # Role-based mode selector
│   │   │   ├── InterviewSession.jsx    # Interactive interview UI
│   │   │   ├── FeedbackDashboard.jsx   # Feedback display
│   │   │   └── LoadingAnimation.jsx    # Loading states
│   │   ├── api.js               # API configuration
│   │   ├── App.jsx              # Main app component & routing
│   │   ├── index.css            # Global styles
│   │   └── main.jsx             # React entry point
│   ├── public/                  # Static assets
│   ├── dist/                    # Production build output (generated)
│   ├── package.json             # Node dependencies
│   └── vite.config.js           # Vite configuration
│
├── uploads/                      # Uploaded resume files (generated)
├── instance/                     # SQLite database (generated)
├── .env                         # Environment variables (not in git)
├── .gitignore                   # Git ignore rules
├── README.md                    # This file
└── pyproject.toml              # Python project configuration (uv)
```

---

## 🔧 Core Components Explained

### Backend Components

#### 1. **app.py** - Main Application
**Purpose**: Central Flask application that coordinates all backend operations

**Key Responsibilities:**
- Initialize Flask app and extensions (SQLAlchemy, CORS, Flask-Login)
- Register authentication blueprints
- Define API routes for interview operations
- Serve React frontend in production
- Handle file uploads and session management

**Critical Routes:**
- `/api/upload-resume`: Accepts PDF files, triggers AI analysis
- `/api/generate-questions`: Creates interview questions based on mode
- `/api/submit-answer`: Processes user responses, triggers AI evaluation
- `/api/feedback`: Retrieves comprehensive feedback for completed interviews

#### 2. **models.py** - Database Models
**Purpose**: Define database schema using SQLAlchemy ORM

**Models:**

**User Model:**
```python
- id: Primary key
- google_id: Unique Google OAuth identifier
- email: User email
- name: Display name
- picture: Profile picture URL
- created_at: Account creation timestamp
- Relationship: One-to-many with InterviewSession
```

**InterviewSession Model:**
```python
- id: Primary key
- user_id: Foreign key to User
- mode: 'resume' or 'role'
- difficulty: 'beginner', 'intermediate', 'advanced'
- role: Job role (for role-based mode)
- resume_filename: Uploaded PDF filename
- technical_skills: JSON array of technical skills
- soft_skills: JSON array of soft skills
- projects: JSON array of projects
- experience_level: Detected experience level
- questions: JSON array of generated questions
- answers: JSON array of user responses
- feedback: JSON object with comprehensive feedback
- status: 'active' or 'completed'
- created_at: Session start time
```

#### 3. **google_auth.py** - OAuth Authentication
**Purpose**: Implement Google OAuth 2.0 login flow

**Process:**
1. User clicks "Login with Google"
2. Redirect to Google authorization page
3. User grants permissions
4. Google redirects back with authorization code
5. Exchange code for access token
6. Fetch user profile from Google
7. Create/update user in database
8. Create Flask session
9. Redirect to dashboard

**Why Google OAuth?**
- Industry-standard security
- No password management required
- User trust and convenience
- Quick implementation with oauthlib

#### 4. **gemini.py** - AI Client
**Purpose**: Initialize and configure Google Gemini AI client

**Configuration:**
```python
import google.generativeai as genai

genai.configure(api_key=os.environ.get('GEMINI_API_KEY'))

# Initialize models
flash_model = genai.GenerativeModel('gemini-2.0-flash-exp')
pro_model = genai.GenerativeModel('gemini-1.5-pro')
```

**Why Gemini?**
- Advanced language understanding
- Context-aware responses
- Structured output with Pydantic
- Cost-effective compared to alternatives
- Fast response times (Flash model)

#### 5. **resume_analyzer.py** - Resume Processing
**Purpose**: Extract and analyze resume content using AI

**Process:**
1. **PDF Parsing**: Extract text using PyPDF2/pdfplumber
2. **Content Cleaning**: Remove artifacts, normalize formatting
3. **AI Analysis**: Send to Gemini with structured prompt
4. **Skill Extraction**: 
   - Technical skills (languages, frameworks, tools)
   - Soft skills (communication, leadership, etc.)
5. **Project Detection**: Identify and summarize key projects
6. **Experience Level**: Determine entry/mid/senior level
7. **Keyword Extraction**: Extract relevant keywords for questions

**Why AI-powered?**
- More accurate than regex patterns
- Understands context and relationships
- Handles diverse resume formats
- Extracts implicit skills

#### 6. **question_generator.py** - Question Creation
**Purpose**: Generate contextual, difficulty-appropriate interview questions

**Modes:**

**Resume-Based:**
```python
def generate_resume_based_questions(skills, projects, difficulty):
    prompt = f"""
    Generate {num_questions} interview questions for a candidate with:
    - Technical Skills: {skills}
    - Projects: {projects}
    - Difficulty: {difficulty}
    
    Focus on practical application and project experience.
    """
    # AI generates tailored questions
```

**Role-Based:**
```python
def generate_role_based_questions(role, difficulty):
    prompt = f"""
    Generate {num_questions} interview questions for a {role} position.
    Difficulty level: {difficulty}
    
    Include technical, behavioral, and situational questions.
    """
```

**Why Dynamic Generation?**
- Unlimited question variety
- Perfectly matched to user profile
- Adapts to different industries
- Reduces memorization, increases learning

### Frontend Components

#### 1. **LoginScreen.jsx** - Authentication UI
**Features:**
- Modern gradient design
- Google OAuth button
- Feature showcase on right panel
- Terms & Privacy links
- Creator attribution

**Why This Design?**
- Professional, trustworthy appearance
- Clear value proposition
- Minimal friction (single click login)

#### 2. **Dashboard.jsx** - Mode Selection
**Features:**
- Two large mode cards (Resume vs. Role)
- Visual icons and descriptions
- Smooth hover effects
- Responsive grid layout

**User Flow:**
- User sees clear choice between modes
- Clicks preferred mode
- Navigated to respective interface

#### 3. **ResumeUpload.jsx** - File Upload
**Features:**
- Drag-and-drop interface
- File validation (PDF only, 16MB max)
- Upload progress indicator
- AI analysis preview
- Skill/project display

**Technical Implementation:**
```javascript
// File upload with FormData
const formData = new FormData();
formData.append('resume', file);

fetch('/api/upload-resume', {
  method: 'POST',
  body: formData,
  credentials: 'include'
})
```

#### 4. **InterviewSession.jsx** - Interactive Interview
**Features:**
- Question display with progress bar
- Text input for answers
- Navigation (Next, Previous, Skip)
- Real-time answer saving
- Submit interview action

**State Management:**
```javascript
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
const [answers, setAnswers] = useState([]);
const [questions, setQuestions] = useState([]);
```

#### 5. **FeedbackDashboard.jsx** - Results Display
**Features:**
- Overall score with visual gauge
- Category-wise scores (Technical, Communication, etc.)
- Detailed feedback sections
- Strengths and improvements lists
- Action buttons (New Interview, Dashboard)

**Data Visualization:**
- Progress circles for scores
- Color-coded ratings (green/yellow/red)
- Card-based layout for readability

#### 6. **LoadingAnimation.jsx** - Loading States
**Features:**
- Custom "Generating" text animation
- Colorful gradient effects
- Prevents user interaction during loading
- Professional appearance

---

## 🤔 Why We Use These Technologies

### Frontend: React + Vite

**React:**
- **Component-Based**: Reusable UI components (LoginScreen, Dashboard, etc.)
- **Virtual DOM**: Fast rendering and updates
- **Rich Ecosystem**: Huge community, libraries, and tools
- **State Management**: Easy to manage complex UI state
- **Learning Curve**: Industry-standard skill for developers

**Vite:**
- **Lightning Fast**: Hot Module Replacement (HMR) in milliseconds
- **Modern**: Uses ES modules, optimized for modern browsers
- **Simple Configuration**: Less setup than Webpack
- **Optimized Builds**: Efficient production bundles
- **Developer Experience**: Instant server start, fast updates

**Alternative Considered:** Next.js (overkill for this project, unnecessary SSR)

### Backend: Flask

**Why Flask?**
- **Lightweight**: Minimal boilerplate, easy to understand
- **Flexible**: Not opinionated, allows custom architecture
- **Python Ecosystem**: Access to AI/ML libraries (Gemini, Pydantic)
- **REST API**: Perfect for frontend-backend separation
- **Extensions**: Rich ecosystem (SQLAlchemy, Flask-Login, CORS)
- **Learning**: Excellent for educational projects

**Alternative Considered:** FastAPI (more complex for beginners), Django (too heavy)

### Database: SQLite → PostgreSQL

**SQLite (Development):**
- **No Setup**: File-based, works out of the box
- **Portable**: Single file, easy to backup/share
- **Zero Configuration**: No server required
- **Perfect for Prototyping**: Fast iteration

**PostgreSQL (Production):**
- **Scalability**: Handles thousands of concurrent users
- **JSON Support**: Native JSONB for storing skills, feedback
- **Advanced Features**: Full-text search, complex queries
- **Data Integrity**: ACID compliance, transactions
- **Popular**: Industry standard, well-documented

### AI: Google Gemini

**Why Gemini over alternatives?**

| Feature | Gemini | OpenAI GPT | Anthropic Claude |
|---------|--------|------------|------------------|
| Cost | ⭐⭐⭐⭐⭐ Low | ⭐⭐⭐ Medium | ⭐⭐⭐ Medium |
| Speed | ⭐⭐⭐⭐⭐ Very Fast | ⭐⭐⭐⭐ Fast | ⭐⭐⭐⭐ Fast |
| Context Window | 1M tokens | 128K tokens | 200K tokens |
| Structured Output | ✅ Pydantic | ✅ JSON mode | ✅ JSON |
| Resume Analysis | ✅ Excellent | ✅ Excellent | ✅ Excellent |
| Free Tier | ✅ Generous | ❌ Limited | ❌ No |

**Key Advantages:**
- **Generous Free Tier**: Essential for student projects
- **Fast Response**: Flash model for quick generation
- **Large Context**: Can process entire resumes
- **Structured Output**: Native Pydantic integration
- **Google Ecosystem**: Easy integration with Google OAuth

### Authentication: Google OAuth

**Why OAuth over traditional login?**
- **Security**: No password storage/management
- **User Trust**: "Sign in with Google" is familiar
- **Reduced Friction**: One-click login
- **Profile Data**: Automatic access to name, email, picture
- **Scalability**: Google handles authentication infrastructure

**Alternative Considered:** 
- Email/Password (security risks, forgot password flows)
- Other OAuth (GitHub, Microsoft - less universal)

---

## 🗄️ Database Configuration

### Option 1: SQLite (Default - Development)

**Already Configured**
```env
DATABASE_URL=sqlite:///interview_assistant.db
```

**Pros:**
- Zero setup
- File-based (instance/interview_assistant.db)
- Perfect for development and testing

**Cons:**
- Limited concurrency
- Not suitable for production
- No advanced features

### Option 2: PostgreSQL (Recommended - Production)

#### Installation

**Windows:**
```bash
# Download from official site
https://www.postgresql.org/download/windows/

# Or using Chocolatey
choco install postgresql
```

**Linux (Ubuntu):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**macOS:**
```bash
brew install postgresql
```

#### Database Setup

```bash
# Start PostgreSQL service
# Windows: Use Services app or pg_ctl
# Linux: sudo service postgresql start
# macOS: brew services start postgresql

# Access PostgreSQL shell
psql -U postgres

# Create database
CREATE DATABASE interview_assistant;

# Create user (optional but recommended)
CREATE USER interview_user WITH PASSWORD 'secure_password_here';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE interview_assistant TO interview_user;

# Exit
\q
```

#### Update Configuration

**Install Python Driver:**
```bash
pip install psycopg2-binary
```

**Update .env:**
```env
DATABASE_URL=postgresql://interview_user:secure_password_here@localhost:5432/interview_assistant
```

**Update app.py (if needed):**
```python
# The app already reads from DATABASE_URL environment variable
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL', 
    'sqlite:///interview_assistant.db'
)
```

#### Migrate Data (Optional)

**If moving from SQLite to PostgreSQL:**
```python
# Export data from SQLite
# Import into PostgreSQL
# Or start fresh (recommended for development)
```

---

## 📡 API Documentation

### Authentication Endpoints

#### `GET /auth/google`
**Description**: Initiates Google OAuth flow  
**Authentication**: None  
**Response**: Redirects to Google login

#### `GET /auth/callback`
**Description**: OAuth callback handler  
**Authentication**: OAuth code  
**Response**: Redirects to dashboard with session

#### `GET /auth/logout`
**Description**: Logs out current user  
**Authentication**: Required  
**Response**: Redirects to login page

#### `GET /api/user`
**Description**: Get current user info  
**Authentication**: Required  
**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "picture": "https://..."
}
```

### Interview Endpoints

#### `POST /api/upload-resume`
**Description**: Upload and analyze resume  
**Authentication**: Required  
**Request:**
```javascript
FormData:
  resume: File (PDF, max 16MB)
```
**Response:**
```json
{
  "message": "Resume uploaded and analyzed successfully",
  "filename": "1_1234567890_resume.pdf",
  "analysis": {
    "technical_skills": ["Python", "React", "SQL"],
    "soft_skills": ["Communication", "Leadership"],
    "projects": ["E-commerce Platform", "ML Model"],
    "experience_level": "intermediate",
    "summary": "..."
  },
  "keywords": ["python", "react", "sql"]
}
```

#### `POST /api/generate-questions`
**Description**: Generate interview questions  
**Authentication**: Required  
**Request:**
```json
{
  "mode": "resume",
  "difficulty": "intermediate",
  "role": "Software Engineer",
  "filename": "1_1234567890_resume.pdf",
  "analysis": {},
  "keywords": ["python", "react"]
}
```
**Response:**
```json
{
  "session_id": 42,
  "questions": [
    "Explain your experience with Python...",
    "Describe a challenging React project..."
  ]
}
```

#### `POST /api/submit-answer`
**Description**: Submit answer for a question  
**Authentication**: Required  
**Request:**
```json
{
  "session_id": 42,
  "question_index": 0,
  "answer": "In my Python project, I used Flask to..."
}
```
**Response:**
```json
{
  "message": "Answer submitted successfully"
}
```

#### `POST /api/complete-interview`
**Description**: Complete interview and generate feedback  
**Authentication**: Required  
**Request:**
```json
{
  "session_id": 42
}
```
**Response:**
```json
{
  "message": "Interview completed successfully",
  "feedback": {
    "overall_score": 75,
    "category_scores": {
      "technical_accuracy": 80,
      "communication": 70,
      "problem_solving": 75,
      "confidence": 72
    },
    "strengths": [
      "Strong technical knowledge of Python",
      "Clear communication style"
    ],
    "improvements": [
      "Provide more specific examples",
      "Elaborate on project challenges"
    ],
    "detailed_feedback": "Your responses demonstrate..."
  }
}
```

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### 1. **Port Already in Use**
**Error**: `Address already in use: 5000`

**Solution:**
```bash
# Windows - Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9

# Or change port in vite.config.js
server: { port: 3000 }
```

#### 2. **Module Not Found**
**Error**: `ModuleNotFoundError: No module named 'flask'`

**Solution:**
```bash
# Ensure virtual environment is activated
# Windows
venv\Scripts\activate

# Install dependencies again
pip install -r requirements.txt
```

#### 3. **Google OAuth Redirect Error**
**Error**: `redirect_uri_mismatch`

**Solution:**
- Go to Google Cloud Console
- Navigate to OAuth 2.0 Client IDs
- Add authorized redirect URI: `http://localhost:5000/auth/callback`
- Ensure exact match (http vs https, trailing slash)

#### 4. **Gemini API Key Invalid**
**Error**: `API key not valid`

**Solution:**
- Verify GEMINI_API_KEY in .env
- Check API key in Google AI Studio
- Ensure no extra spaces or quotes
- Regenerate key if necessary

#### 5. **Database Not Found**
**Error**: `OperationalError: no such table: user`

**Solution:**
```bash
# Recreate database tables
python
>>> from backend.app import app, db
>>> with app.app_context():
...     db.create_all()
>>> exit()
```

#### 6. **Loading Animation Width Issue**
**Symptom**: Page becomes very wide during loading

**Solution:**
Already fixed in latest code:
```css
.loader-wrapper {
  width: 100%;
  max-width: 400px;
  overflow: hidden;
}
```

---

## 🚀 Future Enhancements

### Planned Features
1. **Voice Input**: Record answers via microphone
2. **Video Interview Practice**: Camera integration for body language feedback
3. **Mock Interview Scheduling**: Schedule practice sessions
4. **Company-Specific Questions**: Target specific companies (Google, Amazon, etc.)
5. **Interview History**: Track progress over time with analytics
6. **Peer Review**: Share interviews with mentors for human feedback
7. **Mobile App**: React Native version for iOS/Android
8. **More AI Models**: Support for Claude, GPT-4, etc.
9. **Resume Builder**: Integrated resume creation tool
10. **Job Matching**: Recommend jobs based on skills and interview performance

### Technical Improvements
- Implement Redis for session caching
- Add WebSocket for real-time updates
- Containerize with Docker
- Deploy to cloud (AWS, GCP, Azure)
- Add comprehensive unit and integration tests
- Implement CI/CD pipeline
- Add rate limiting for API endpoints
- Enhance security with JWT tokens

---

## 👥 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

This project is developed as a Final Year Project for educational purposes.

---

## 🙏 Acknowledgments

- **Google Gemini AI** for powerful language models
- **React & Vite** for modern frontend development
- **Flask** for simple yet powerful backend
- **SQLAlchemy** for excellent ORM capabilities
- **Cognivue AI Team** for dedication and hard work

---

## 📞 Contact

**Project Team**: Cognivue AI Team
**GitHub**: [Your GitHub Profile]  
**Email**: [Your Email]

---

## 📚 Additional Resources

- [Google Gemini API Documentation](https://ai.google.dev/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://react.dev/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [OAuth 2.0 Guide](https://oauth.net/2/)

---

**Built with ❤️ by Cognivue AI Team**

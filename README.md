# Cognivue AI — Interview Practice Platform

> AI-powered mock interview platform with multi-mode practice, real-time feedback, HR candidate management, and user profiles with unique candidate IDs.

---

## ✨ Features

### For Students / Candidates
| Feature | Description |
|---------|-------------|
| **Google OAuth Login** | Secure, one-click login via Google |
| **Resume-Based Interviews** | Upload a PDF resume; AI generates questions tailored to your skills and projects |
| **Role-Based Interviews** | Pick a job title and difficulty; AI generates targeted questions |
| **Difficulty Levels** | Beginner · Intermediate · Advanced |
| **AI Feedback** | Overall score, category scores, strengths, areas to improve, detailed analysis |
| **Interview History** | Browse past sessions with scores, dates, and detailed Q&A review |
| **Session Detail Page** | Full breakdown: role, difficulty, Q&A, feedback, category score bars |
| **Analytics Dashboard** | Total sessions, average & best scores, difficulty breakdown |
| **My Profile** | Google avatar, name, UID badge with copy button, performance stats |
| **Unique Candidate UID** | Auto-generated `22BAD` + 5-digit ID you can share with HR recruiters |
| **Light / Dark Mode** | Toggle persists across sessions |

### For HR Professionals
| Feature | Description |
|---------|-------------|
| **HR Portal** | Separate login at `/hr-login` — does not mix with student accounts |
| **HR Registration** | Fill name, email, company, password → receive OTP verification email |
| **OTP Email Verification** | Professional HTML email from "Cognive AI Verification Code"; OTP valid 1 minute |
| **HR Dashboard** | Search candidates by UID or by interview role |
| **UID Search** | Enter a candidate's UID to view their profile and all interview sessions |
| **Role Search** | Browse all candidates who interviewed for a specific role, sorted by recency |
| **Candidate Cards** | Name, UID, role, difficulty badge, score — all at a glance |
| **Full Session Detail** | Click any card to see complete Q&A, feedback, and category scores |

---

## 🗂 Project Structure

```
Cognivue-AI/
├── backend/                  # Django 5.2 API
│   ├── accounts/             # Google OAuth, User model with UID
│   ├── interviews/           # Sessions, Q&A, feedback, analytics
│   ├── hr/                   # HR auth, OTP, email, candidate search
│   ├── cognivue/             # settings.py, urls.py
│   └── core/                 # Gemini AI helpers, question generator
│
├── frontend/                 # React 19 + Vite 7 SPA
│   └── src/
│       ├── components/
│       │   ├── LoginScreen.jsx
│       │   ├── Dashboard.jsx
│       │   ├── SessionHistory.jsx
│       │   ├── SessionDetailPage.jsx
│       │   ├── FeedbackDashboard.jsx
│       │   ├── UserProfile.jsx       # NEW — UID badge + analytics
│       │   ├── HRLoginScreen.jsx     # NEW — HR register/login + OTP
│       │   └── HRDashboard.jsx       # NEW — HR admin search
│       ├── App.jsx
│       ├── api.js
│       └── index.css                 # Full dark/light theme + mobile CSS
│
└── .env                      # Environment variables (see below)
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL database
- Google Cloud project with OAuth 2.0 credentials
- Gmail account (for OTP emails)

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and fill in your values (see below), then:

```bash
python manage.py migrate
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root (alongside `backend/` and `frontend/`):

```env
# Security
SESSION_SECRET=your-random-secret-key

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/cognivue

# Google OAuth
GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback/

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Frontend
VITE_API_BASE_URL=http://localhost:8000
VITE_PORT=3000
FRONTEND_URL=http://localhost:3000

# CORS
CORS_ORIGINS=http://localhost:3000

# Email (for HR OTP verification)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-gmail@gmail.com
EMAIL_HOST_PASSWORD=your-gmail-app-password

# Optional
MAX_UPLOAD_SIZE=10485760
FLASK_DEBUG=True
```

> **Gmail App Password**: Enable 2FA on your Google account, then go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) to generate an App Password for use above.

---

## 🔑 Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → APIs & Services → Credentials
3. Create **OAuth 2.0 Client ID** (Web application)
4. Add to **Authorized redirect URIs**:
   - `http://localhost:8000/auth/google/callback/`
5. Copy the Client ID and Secret into `.env`

---

## 🏗 API Endpoints

### Student / General
| Method | Path | Description |
|--------|------|-------------|
| GET | `/auth/google/` | Start Google OAuth flow |
| GET | `/auth/google/callback/` | OAuth callback |
| GET | `/api/user-info/` | Current user info + UID |
| POST | `/api/logout/` | Logout |
| POST | `/api/upload-resume/` | Upload PDF, get AI analysis |
| POST | `/api/generate-questions/` | Generate interview questions |
| POST | `/api/submit-answer/` | Save an answer |
| POST | `/api/complete-interview/` | Trigger AI feedback |
| GET | `/api/session-history/` | List completed sessions |
| GET | `/api/session/<id>/` | Full session detail |
| GET | `/api/analytics/` | Performance analytics |

### HR
| Method | Path | Description |
|--------|------|-------------|
| POST | `/hr/register/` | Register new HR account, sends OTP |
| POST | `/hr/resend-otp/` | Resend OTP |
| POST | `/hr/verify-otp/` | Verify OTP, create HR session |
| POST | `/hr/login/` | HR login (existing users) |
| POST | `/hr/logout/` | HR logout |
| GET | `/hr/me/` | Current HR user info |
| GET | `/hr/roles/` | List of available roles |
| GET | `/hr/search/uid/?uid=22BAD12345` | Search candidate by UID |
| GET | `/hr/search/role/?role=data-scientist` | Search candidates by role |
| GET | `/hr/session/<id>/` | Full session detail (HR view) |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 7, React Router v6 |
| Styling | Vanilla CSS (dark/light theme, mobile-first) |
| Backend | Django 5.2, django-cors-headers |
| Database | PostgreSQL (via psycopg2 + dj-database-url) |
| AI | Google Gemini API |
| Auth | Google OAuth 2.0 (students), Custom email+OTP (HR) |
| Email | Django SMTP (Gmail) |

---

## 📱 Mobile Support

The application is fully responsive with breakpoints at **768px** (tablet/mobile) and **480px** (small phones):

- Sidebar collapses to a horizontal top navigation bar
- History layout stacks vertically
- HR dashboard search forms stack vertically
- Profile page centers avatar and UID horizontally
- Session detail page stacks score circle below metadata
- Login screen hides the visual panel, shows full-width form

---

## 🔒 Security Notes

- Student sessions use Django's secure cookie-based sessions
- HR passwords are hashed with SHA-256 + salt (no plaintext storage)
- OTPs expire after **1 minute** and are single-use
- CSRF protection is active; CORS is restricted to configured origins
- `SESSION_COOKIE_HTTPONLY=True`, `SAMESITE=None` with `Secure` flag in production

---

## 📝 License

MIT — feel free to use and adapt.

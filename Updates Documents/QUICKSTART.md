# Quick Start Guide

## Cognivue AI

### Prerequisites
- Python 3.11+
- Node.js 16+
- Google Cloud OAuth credentials
- Google Gemini API key

### Setup (5 minutes)

#### 1. Configure Environment Variables

Your `.env` file is already set up, but verify these values:

```env
# Google OAuth (from Google Cloud Console)
GOOGLE_OAUTH_CLIENT_ID=your-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback

# Google Gemini AI (from Google AI Studio)
GEMINI_API_KEY=your-gemini-api-key

# Frontend/Backend URLs
FRONTEND_URL=http://localhost:3000
VITE_API_BASE_URL=http://localhost:5000

# Database (PostgreSQL already configured)
DATABASE_URL=postgresql://...

# Session Secret (generate a random string)
SESSION_SECRET=your-secure-random-string-here-min-32-chars
```

#### 2. Google Cloud Console Setup

**IMPORTANT:** Add this redirect URI to your Google OAuth Client:

```
http://localhost:5000/auth/google/callback
```

Steps:
1. Go to https://console.cloud.google.com/apis/credentials
2. Select your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", add: `http://localhost:5000/auth/google/callback`
4. Click Save

#### 3. Run the Application

**Option A: Automatic (Recommended)**

Double-click `start.bat` - it will:
- Install all dependencies
- Start backend on port 5000
- Start frontend on port 3000
- Open browser automatically

**Option B: Manual**

Terminal 1 (Backend):
```bash
pip install -r requirements.txt
python backend/app.py
```

Terminal 2 (Frontend):
```bash
cd frontend
npm install
npm run dev
```

Then open: http://localhost:3000

### Usage Flow

1. **Login**: Click "Continue with Google"
2. **Choose Mode**: 
   - Resume-based: Upload PDF resume
   - Role-based: Select role and difficulty
3. **Interview**: Answer questions (text or voice)
4. **Feedback**: View AI-generated performance analysis

### Troubleshooting

#### OAuth Error: `redirect_uri_mismatch`
- Ensure `http://localhost:5000/auth/google/callback` is in Google Cloud Console
- Must match exactly (protocol, port, path)

#### OAuth Error: `insecure_transport`
- This is fixed in the code (allows HTTP for localhost)
- If still occurs, restart backend

#### Questions Not Generating
- Check GEMINI_API_KEY is valid
- Check internet connection
- View backend terminal for error details

#### Database Errors
- PostgreSQL URL is pre-configured in `.env`
- For local SQLite instead: `DATABASE_URL=sqlite:///interview_assistant.db`

### Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `GOOGLE_OAUTH_CLIENT_ID` | Google OAuth authentication | `123456-abc.apps.googleusercontent.com` |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Google OAuth secret | `GOCSPX-xxxxx` |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL | `http://localhost:5000/auth/google/callback` |
| `GEMINI_API_KEY` | AI question generation | `AIzaSyXxxxxx` |
| `FRONTEND_URL` | Where to redirect after login | `http://localhost:3000` |
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:5000` |
| `DATABASE_URL` | Database connection | `postgresql://user:pass@host/db` |
| `SESSION_SECRET` | Flask session encryption | Any random 32+ char string |

### Getting API Keys

**Google OAuth:**
1. Go to https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Add redirect URI: `http://localhost:5000/auth/google/callback`
4. Copy Client ID and Secret

**Gemini API:**
1. Go to https://aistudio.google.com/app/apikeys
2. Create API key
3. Copy the key

### Support

For issues:
1. Check backend terminal for Python errors
2. Check frontend terminal for React errors
3. Check browser console (F12) for API errors
4. Ensure all environment variables are set correctly

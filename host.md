# Cognivue AI — How to Run

## Development Setup

### Backend (Django)

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Navigate to the Django project root
cd backend

# 3. Run database migrations
#    Use settings_local for local dev (SQLite — no Postgres required)
python manage.py makemigrations
python manage.py migrate --settings=cognivue.settings_local

# 4. (Optional) Create a Django superuser for the admin panel
python manage.py createsuperuser --settings=cognivue.settings_local

# 5. Start the Django dev server (SQLite locally)
python manage.py runserver --settings=cognivue.settings_local
# Runs on http://localhost:8000

# --- OR, to use the real PostgreSQL (Render) ---
python manage.py runserver
```

### Frontend (React + Vite)

```bash
# In a separate terminal
cd frontend

npm install
npm run dev
# Runs on http://localhost:3000
```

---

## ⚠️ Google OAuth Setup (Required)

Before the Google login button will work, you need to update your OAuth credentials in the Google Cloud Console:

1. Go to [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
2. Select your OAuth 2.0 Client ID
3. Under **"Authorized redirect URIs"**, add:
   ```
   http://localhost:8000/auth/google/callback/
   ```
   _(Note: port changed from 5000 → 8000, and Django requires a trailing slash)_

---

## Production Build

```bash
# Build frontend
cd frontend
npm run build

# Serve everything from Django (static + React SPA)
cd ../backend
python manage.py collectstatic --noinput
gunicorn cognivue.wsgi:application --bind 0.0.0.0:8000
```

---

## Key URL Changes (Flask → Django)

| Flask (old)                        | Django (new)                             |
| ---------------------------------- | ---------------------------------------- |
| `http://localhost:5000`            | `http://localhost:8000`                  |
| `/auth/google`                     | `/auth/google/`                          |
| `/auth/google/callback`            | `/auth/google/callback/`                 |
| `/api/upload-resume`               | `/api/upload-resume/`                    |
| `/api/generate-questions`          | `/api/generate-questions/`               |
| All API routes (no trailing slash) | All API routes (trailing slash required) |

---

## New Features (Django migration additions)

- **Session History** — `/api/session-history/` — lists all completed sessions
- **Session Detail** — `/api/session/<id>/` — full Q&A + feedback for a session
- **User Analytics** — `/api/analytics/` — average score, best score, counts by mode
- **Django Admin** — `http://localhost:8000/admin/` — manage users and sessions
- **Loading animation bug fixed** — 8-second timeout prevents spinner from hanging

---

## Environment Variables (`.env`)

```env
SESSION_SECRET=your-secret-key
DATABASE_URL=postgresql://...   # or leave blank for SQLite
GOOGLE_OAUTH_CLIENT_ID=...
GOOGLE_OAUTH_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback/
GEMINI_API_KEY=...
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000
VITE_API_BASE_URL=http://localhost:8000
```

---

## Render Deployment

### Required Environment Variables on Render:

| Variable                     | Value                                                 | Description                     |
| ---------------------------- | ----------------------------------------------------- | ------------------------------- |
| `SESSION_SECRET`             | Generate a secure random string                       | Used for session encryption     |
| `DATABASE_URL`               | PostgreSQL connection string from Render              | Database credentials            |
| `GOOGLE_OAUTH_CLIENT_ID`     | From Google Cloud Console                             | OAuth client ID                 |
| `GOOGLE_OAUTH_CLIENT_SECRET` | From Google Cloud Console                             | OAuth client secret             |
| `GOOGLE_REDIRECT_URI`        | `https://your-app.onrender.com/auth/google/callback/` | Must match Google Console       |
| `GEMINI_API_KEY`             | From Google AI Studio                                 | For AI features                 |
| `FRONTEND_URL`               | `https://your-app.onrender.com`                       | Your Render URL                 |
| `CORS_ORIGINS`               | `https://your-app.onrender.com`                       | Your Render URL                 |
| `VITE_API_BASE_URL`          | (empty)                                               | Use relative URLs in production |

### Google OAuth Setup for Production:

1. Go to [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
2. Select your OAuth 2.0 Client ID
3. Under **"Authorized redirect URIs"**, add:
   ```
   https://your-app-name.onrender.com/auth/google/callback/
   ```
4. Under **"Authorized JavaScript origins"**, add:
   ```
   https://your-app-name.onrender.com
   ```

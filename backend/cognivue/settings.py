"""
Django settings for Cognivue AI project.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# ─── Load .env ────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent

env_paths = [
    BASE_DIR.parent / '.env',
    BASE_DIR / '.env',
    Path.cwd() / '.env',
]
for env_path in env_paths:
    if env_path.exists():
        load_dotenv(env_path)
        print(f"Loaded .env from: {env_path}")
        break

# ─── Security ─────────────────────────────────────────────────────────────────
SECRET_KEY = os.environ.get('SESSION_SECRET', 'django-insecure-dev-please-change-in-production')
DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() in ('1', 'true', 'yes')
ALLOWED_HOSTS = ['*']

# ─── Application definition ───────────────────────────────────────────────────
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'accounts',
    'interviews',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'cognivue.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR.parent / 'frontend' / 'dist'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'cognivue.wsgi.application'

# ─── Database ─────────────────────────────────────────────────────────────────
DATABASE_URL = os.environ.get('DATABASE_URL', '')

if DATABASE_URL and DATABASE_URL.startswith('postgresql'):
    import dj_database_url
    DATABASES = {
        'default': dj_database_url.parse(DATABASE_URL, conn_max_age=600)
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# ─── Auth ─────────────────────────────────────────────────────────────────────
AUTH_USER_MODEL = 'accounts.User'
AUTHENTICATION_BACKENDS = [
    'accounts.backends.EmailBackend',
    'django.contrib.auth.backends.ModelBackend',
]
LOGIN_URL = '/auth/google/'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ─── Sessions ─────────────────────────────────────────────────────────────────
SESSION_ENGINE = 'django.contrib.sessions.backends.db'
SESSION_COOKIE_AGE = 60 * 60 * 24 * 7   # 7 days
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000').rstrip('/')

def _is_local(url: str) -> bool:
    from urllib.parse import urlparse
    hostname = (urlparse(url).hostname or '').lower()
    return hostname in {'localhost', '127.0.0.1'} or hostname.endswith('.local')

_local = _is_local(FRONTEND_URL)
SESSION_COOKIE_SAMESITE = 'Lax' if _local else 'None'
SESSION_COOKIE_SECURE = not _local
SESSION_COOKIE_HTTPONLY = True

CSRF_TRUSTED_ORIGINS = [FRONTEND_URL, 'http://localhost:3000', 'http://localhost:8000']

# ─── CORS ─────────────────────────────────────────────────────────────────────
CORS_ALLOW_CREDENTIALS = True
_extra_origins = os.environ.get('CORS_ORIGINS', '')
CORS_ALLOWED_ORIGINS = list(filter(None, {
    'http://localhost:3000',
    'http://localhost:8000',
    FRONTEND_URL,
    *[o.strip().rstrip('/') for o in _extra_origins.split(',') if o.strip()],
}))

# ─── Internationalization ──────────────────────────────────────────────────────
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ─── Static & Media files ─────────────────────────────────────────────────────
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = []

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'uploads'

FRONTEND_DIST = BASE_DIR.parent / 'frontend' / 'dist'

# ─── File uploads ─────────────────────────────────────────────────────────────
MAX_UPLOAD_SIZE = int(os.environ.get('MAX_UPLOAD_SIZE', 16 * 1024 * 1024))  # 16 MB
DATA_UPLOAD_MAX_MEMORY_SIZE = MAX_UPLOAD_SIZE
FILE_UPLOAD_MAX_MEMORY_SIZE = MAX_UPLOAD_SIZE

# ─── Google OAuth ─────────────────────────────────────────────────────────────
GOOGLE_OAUTH_CLIENT_ID = os.environ.get('GOOGLE_OAUTH_CLIENT_ID', '')
GOOGLE_OAUTH_CLIENT_SECRET = os.environ.get('GOOGLE_OAUTH_CLIENT_SECRET', '')
GOOGLE_REDIRECT_URI = os.environ.get('GOOGLE_REDIRECT_URI', 'http://localhost:8000/auth/google/callback/')

# ─── Gemini ───────────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')

# ─── Misc ─────────────────────────────────────────────────────────────────────
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

"""
Local development settings override.
Uses SQLite so you don't need the Render PostgreSQL configured locally.

Usage:
  python manage.py migrate --settings=cognivue.settings_local
  python manage.py runserver --settings=cognivue.settings_local

Or set: $env:DJANGO_SETTINGS_MODULE = "cognivue.settings_local"
"""
from cognivue.settings import *  # noqa: F401, F403

# Override database to use local SQLite (no PostgreSQL needed for local dev)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db_local.sqlite3',
    }
}

# No HTTPS required locally
SESSION_COOKIE_SECURE = False
SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SECURE = False

print("[LOCAL] Using local SQLite database (settings_local)")

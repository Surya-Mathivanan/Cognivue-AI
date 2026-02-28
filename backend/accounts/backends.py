"""
Custom authentication backend for email-based login.
Used by Django's auth system to look up users by email.
"""
from accounts.models import User


class EmailBackend:
    """Authenticate by email (used by Google OAuth flow)."""

    def authenticate(self, request, email=None, **kwargs):
        if not email:
            return None
        try:
            return User.objects.get(email=email)
        except User.DoesNotExist:
            return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None

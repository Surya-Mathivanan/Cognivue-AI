from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model for Cognivue AI.
    Uses email as the primary unique identifier.
    Supports Google OAuth — no password required.
    """
    # Override email to make it unique
    email = models.EmailField(unique=True, null=False, blank=False)

    # username is display name from Google (non-unique, matches Flask behavior)
    username = models.CharField(max_length=150, blank=True, default='')

    # Google profile picture URL (extra feature)
    avatar_url = models.URLField(blank=True, default='')

    # Google OAuth subject ID for future verification
    google_id = models.CharField(max_length=255, blank=True, default='')

    # Override USERNAME_FIELD to email
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'accounts_user'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return self.email

    def get_display_name(self):
        return self.username or self.email.split('@')[0]

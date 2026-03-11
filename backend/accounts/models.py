import random
import string
from django.contrib.auth.models import AbstractUser
from django.db import models


def generate_uid():
    """Generate a unique 10-character UID: 22BAD + 5 random digits."""
    digits = ''.join(random.choices(string.digits, k=5))
    return f"22BAD{digits}"


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

    # Unique candidate UID — format: 22BAD + 5 random digits
    uid = models.CharField(max_length=10, unique=True, blank=True, default='')

    # Additional profile fields
    college_name = models.CharField(max_length=255, blank=True, default='')
    degree = models.CharField(max_length=100, blank=True, default='')
    branch = models.CharField(max_length=100, blank=True, default='')
    address = models.TextField(blank=True, default='')
    phone_number = models.CharField(max_length=20, blank=True, default='')
    skills = models.TextField(blank=True, default='')
    location = models.CharField(max_length=150, blank=True, default='')

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

    def save(self, *args, **kwargs):
        # Auto-generate UID if not set
        if not self.uid:
            uid = generate_uid()
            # Ensure uniqueness (retry up to 10 times)
            attempts = 0
            while User.objects.filter(uid=uid).exists() and attempts < 10:
                uid = generate_uid()
                attempts += 1
            self.uid = uid
        super().save(*args, **kwargs)

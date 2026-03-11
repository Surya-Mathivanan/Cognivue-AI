import hashlib
import secrets
from django.db import models
from django.utils import timezone
from datetime import timedelta


class HRUser(models.Model):
    """
    HR personnel model — separate from the student/candidate User model.
    HR users register with email + password and must verify via OTP.
    """
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=150)
    company = models.CharField(max_length=200, blank=True, default='')
    password_hash = models.CharField(max_length=255)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'hr_user'
        verbose_name = 'HR User'
        verbose_name_plural = 'HR Users'

    def __str__(self):
        return f"{self.name} <{self.email}>"

    def set_password(self, raw_password):
        """Hash password using SHA-256 with a salt."""
        salt = secrets.token_hex(16)
        hashed = hashlib.sha256((salt + raw_password).encode()).hexdigest()
        self.password_hash = f"{salt}:{hashed}"

    def check_password(self, raw_password):
        """Verify password against stored hash."""
        try:
            salt, hashed = self.password_hash.split(':', 1)
            return hashlib.sha256((salt + raw_password).encode()).hexdigest() == hashed
        except Exception:
            return False


class OTPRecord(models.Model):
    """
    OTP verification record for HR registration.
    OTPs expire after 30 seconds.
    """
    OTP_EXPIRY_SECONDS = 60

    email = models.EmailField()
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    class Meta:
        db_table = 'hr_otp_record'
        ordering = ['-created_at']
        verbose_name = 'OTP Record'
        verbose_name_plural = 'OTP Records'

    def __str__(self):
        return f"OTP for {self.email} at {self.created_at}"

    @property
    def is_expired(self):
        """Check if OTP has expired (30 second timeout)."""
        expiry_time = self.created_at + timedelta(seconds=self.OTP_EXPIRY_SECONDS)
        return timezone.now() > expiry_time

    @staticmethod
    def generate_otp():
        """Generate a secure 6-digit OTP."""
        return f"{secrets.randbelow(1000000):06d}"

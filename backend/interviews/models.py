from django.db import models
from django.conf import settings
from django.utils import timezone


class InterviewSession(models.Model):
    """
    Stores a single AI-powered interview session for a user.
    Supports both resume-based and role-based modes.
    """
    MODE_CHOICES = [('resume', 'Resume-Based'), ('role', 'Role-Based')]
    DIFFICULTY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    STATUS_CHOICES = [('active', 'Active'), ('completed', 'Completed')]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='interview_sessions',
    )
    mode = models.CharField(max_length=20, choices=MODE_CHOICES)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES)
    role = models.CharField(max_length=100, blank=True, default='')

    # Resume analysis data (for resume mode)
    resume_filename = models.CharField(max_length=255, blank=True, default='')
    technical_skills = models.JSONField(default=list, blank=True)
    soft_skills = models.JSONField(default=list, blank=True)
    projects = models.JSONField(default=list, blank=True)
    experience_level = models.CharField(max_length=20, blank=True, default='entry')
    resume_summary = models.TextField(blank=True, default='')

    # Q&A data
    questions = models.JSONField(default=dict, blank=True)
    answers = models.JSONField(default=list, blank=True)

    # AI-generated feedback
    feedback = models.JSONField(default=dict, blank=True)

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'interviews_session'
        ordering = ['-created_at']
        verbose_name = 'Interview Session'
        verbose_name_plural = 'Interview Sessions'

    def __str__(self):
        return f"<InterviewSession {self.id} — {self.mode} — {self.status}>"

    def mark_completed(self):
        self.status = 'completed'
        self.completed_at = timezone.now()
        self.save(update_fields=['status', 'completed_at'])

    @property
    def overall_score(self):
        """Return the overall score from feedback, or None."""
        return self.feedback.get('overall_score') if self.feedback else None

    @property
    def duration_minutes(self):
        """Return session duration in minutes, or None if not completed."""
        if self.completed_at and self.created_at:
            delta = self.completed_at - self.created_at
            return round(delta.total_seconds() / 60, 1)
        return None

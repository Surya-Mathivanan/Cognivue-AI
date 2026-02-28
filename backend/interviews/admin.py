from django.contrib import admin
from interviews.models import InterviewSession


@admin.register(InterviewSession)
class InterviewSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'mode', 'difficulty', 'role', 'status', 'overall_score_display', 'created_at')
    list_filter = ('mode', 'difficulty', 'status', 'experience_level')
    search_fields = ('user__email', 'user__username', 'role')
    readonly_fields = ('created_at', 'completed_at', 'overall_score_display', 'duration_minutes_display')
    ordering = ('-created_at',)

    fieldsets = (
        ('Session Info', {'fields': ('user', 'mode', 'difficulty', 'role', 'status')}),
        ('Resume Data', {
            'classes': ('collapse',),
            'fields': ('resume_filename', 'experience_level', 'resume_summary',
                       'technical_skills', 'soft_skills', 'projects'),
        }),
        ('Q&A Data', {
            'classes': ('collapse',),
            'fields': ('questions', 'answers', 'feedback'),
        }),
        ('Timestamps', {'fields': ('created_at', 'completed_at', 'duration_minutes_display')}),
        ('Performance', {'fields': ('overall_score_display',)}),
    )

    @admin.display(description='Score')
    def overall_score_display(self, obj):
        score = obj.overall_score
        return f"{score}%" if score is not None else "—"

    @admin.display(description='Duration')
    def duration_minutes_display(self, obj):
        d = obj.duration_minutes
        return f"{d} min" if d is not None else "—"

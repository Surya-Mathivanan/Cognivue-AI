from django.urls import path
from interviews import views

urlpatterns = [
    # Core endpoints (matches Flask routes)
    path('health/', views.health_check, name='health_check'),
    path('user-info/', views.user_info, name='user_info'),
    path('logout/', views.logout_view, name='api_logout'),
    path('upload-resume/', views.upload_resume, name='upload_resume'),
    path('generate-questions/', views.generate_questions, name='generate_questions'),
    path('submit-answer/', views.submit_answer, name='submit_answer'),
    path('complete-interview/', views.complete_interview, name='complete_interview'),

    # New features
    path('session-history/', views.session_history, name='session_history'),
    path('session/<int:session_id>/', views.session_detail, name='session_detail'),
    path('analytics/', views.user_analytics, name='user_analytics'),
]

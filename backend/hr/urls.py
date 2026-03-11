from django.urls import path
from hr import views

urlpatterns = [
    # ─── HR Auth ───────────────────────────────────────────────────────────────
    path('register/', views.hr_register, name='hr_register'),
    path('resend-otp/', views.hr_resend_otp, name='hr_resend_otp'),
    path('verify-otp/', views.hr_verify_otp, name='hr_verify_otp'),
    path('login/', views.hr_login, name='hr_login'),
    path('logout/', views.hr_logout, name='hr_logout'),
    path('me/', views.hr_me, name='hr_me'),

    # ─── HR Admin search ───────────────────────────────────────────────────────
    path('search/uid/', views.hr_search_uid, name='hr_search_uid'),
    path('search/role/', views.hr_search_role, name='hr_search_role'),
    path('roles/', views.hr_available_roles, name='hr_available_roles'),
    path('session/<int:session_id>/', views.hr_candidate_session_detail, name='hr_candidate_session_detail'),
]

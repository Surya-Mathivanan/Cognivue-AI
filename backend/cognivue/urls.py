"""
URL configuration for Cognivue AI project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from pathlib import Path


# Serve React app for non-API routes (production)
def serve_react(request, *args, **kwargs):
    from django.http import FileResponse, Http404
    dist_index = settings.FRONTEND_DIST / 'index.html'
    if dist_index.exists():
        return FileResponse(open(dist_index, 'rb'), content_type='text/html')
    from django.http import HttpResponse
    return HttpResponse(
        '<h2>Frontend not built. Run <code>cd frontend && npm run build</code></h2>',
        content_type='text/html',
        status=200,
    )


urlpatterns = [
    # Django admin
    path('admin/', admin.site.urls),

    # Google OAuth endpoints
    path('auth/', include('accounts.urls')),

    # All API endpoints
    path('api/', include('interviews.urls')),

    # Serve React assets in production
    *static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT),
]

# Serve React frontend for all non-API routes (SPA support)
urlpatterns += [
    re_path(r'^(?!admin/|api/|auth/|media/|static/).*$', serve_react),
]

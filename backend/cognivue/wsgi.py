"""
WSGI config for Cognivue AI project.
"""
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cognivue.settings')
application = get_wsgi_application()

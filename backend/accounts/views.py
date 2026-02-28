"""
Google OAuth 2.0 views for Cognivue AI (Django).
Mirrors the Flask google_auth.py blueprint logic.
"""
import json
import os

# Allow OAuth over HTTP for local development
os.environ.setdefault('OAUTHLIB_INSECURE_TRANSPORT', '1')

import requests
from django.conf import settings
from django.contrib.auth import login, logout
from django.http import HttpResponse, JsonResponse
from django.shortcuts import redirect
from django.views import View
from oauthlib.oauth2 import WebApplicationClient

from accounts.models import User

GOOGLE_DISCOVERY_URL = "https://accounts.google.com/.well-known/openid-configuration"

# Warn about OAuth setup needed
print(f"""
To make Google authentication work:
1. Go to https://console.cloud.google.com/apis/credentials
2. Create a new OAuth 2.0 Client ID
3. Add {settings.GOOGLE_REDIRECT_URI} to Authorized redirect URIs
""")


def _get_google_provider_cfg():
    return requests.get(GOOGLE_DISCOVERY_URL, timeout=10).json()


class GoogleLoginView(View):
    """Initiate Google OAuth flow — redirects user to Google's consent screen."""

    def get(self, request):
        try:
            client = WebApplicationClient(settings.GOOGLE_OAUTH_CLIENT_ID)
            cfg = _get_google_provider_cfg()
            auth_endpoint = cfg['authorization_endpoint']
            request_uri = client.prepare_request_uri(
                auth_endpoint,
                redirect_uri=settings.GOOGLE_REDIRECT_URI,
                scope=['openid', 'email', 'profile'],
                prompt='select_account consent',
            )
            return redirect(request_uri)
        except Exception as e:
            print(f"Error initiating Google OAuth: {e}")
            return HttpResponse(f"Error initializing Google login: {e}", status=500)


class GoogleCallbackView(View):
    """Handle Google OAuth callback, create/get user, set session."""

    def get(self, request):
        code = request.GET.get('code')
        if not code:
            error = request.GET.get('error', 'Unknown error')
            print(f"OAuth callback error: {error}")
            return HttpResponse(f"OAuth authentication failed: {error}", status=400)

        try:
            client = WebApplicationClient(settings.GOOGLE_OAUTH_CLIENT_ID)
            cfg = _get_google_provider_cfg()
            token_endpoint = cfg['token_endpoint']

            # Build token request
            token_url, headers, body = client.prepare_token_request(
                token_endpoint,
                authorization_response=request.build_absolute_uri(),
                redirect_url=settings.GOOGLE_REDIRECT_URI,
                code=code,
            )
            token_response = requests.post(
                token_url,
                headers=headers,
                data=body,
                auth=(settings.GOOGLE_OAUTH_CLIENT_ID, settings.GOOGLE_OAUTH_CLIENT_SECRET),
                timeout=10,
            )
            client.parse_request_body_response(json.dumps(token_response.json()))

            # Fetch user info from Google
            userinfo_endpoint = cfg['userinfo_endpoint']
            uri, headers, body = client.add_token(userinfo_endpoint)
            userinfo_response = requests.get(uri, headers=headers, data=body, timeout=10)
            userinfo = userinfo_response.json()

            if not userinfo.get('email_verified'):
                return HttpResponse("User email not available or not verified by Google.", status=400)

            email = userinfo['email']
            given_name = userinfo.get('given_name', email.split('@')[0])
            avatar_url = userinfo.get('picture', '')
            google_id = userinfo.get('sub', '')

            # Get or create user
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': given_name,
                    'avatar_url': avatar_url,
                    'google_id': google_id,
                }
            )

            # Update avatar / name if they changed on Google side
            if not created:
                updated = False
                if avatar_url and user.avatar_url != avatar_url:
                    user.avatar_url = avatar_url
                    updated = True
                if given_name and user.username != given_name:
                    user.username = given_name
                    updated = True
                if updated:
                    user.save(update_fields=['avatar_url', 'username'])

            # Log the user in (sets session cookie)
            login(request, user, backend='accounts.backends.EmailBackend')
            print(f"User logged in: {email} (new={created})")

            return redirect(settings.FRONTEND_URL)

        except Exception as e:
            print(f"Error in OAuth callback: {e}")
            return HttpResponse(f"OAuth authentication failed: {e}", status=500)


class LogoutView(View):
    """Log out user and redirect to frontend."""

    def get(self, request):
        logout(request)
        return redirect(settings.FRONTEND_URL)

    def post(self, request):
        logout(request)
        return JsonResponse({'message': 'Logged out successfully'})

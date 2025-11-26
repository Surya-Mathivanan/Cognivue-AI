# Google authentication blueprint using flask_google_oauth integration
import json
import os

# IMPORTANT: Allow OAuth over HTTP for local development
# This must be set BEFORE importing any oauthlib modules
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

import requests
from flask import Blueprint, redirect, request, url_for
from flask_login import login_required, login_user, logout_user
from models import User, db
from oauthlib.oauth2 import WebApplicationClient

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_OAUTH_CLIENT_ID", "test-client-id")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_OAUTH_CLIENT_SECRET", "test-client-secret")
GOOGLE_DISCOVERY_URL = "https://accounts.google.com/.well-known/openid-configuration"

# Fixed for local development - use HTTP instead of HTTPS
DEV_REDIRECT_URL = os.environ.get("GOOGLE_REDIRECT_URI", "http://localhost:5000/auth/google/callback")

# ALWAYS display setup instructions to the user:
print(f"""To make Google authentication work:
1. Go to https://console.cloud.google.com/apis/credentials
2. Create a new OAuth 2.0 Client ID
3. Add {DEV_REDIRECT_URL} to Authorized redirect URIs

For detailed instructions, see:
https://docs.replit.com/additional-resources/google-auth-in-flask#set-up-your-oauth-app--client
""")

client = WebApplicationClient(GOOGLE_CLIENT_ID)

google_auth = Blueprint("google_auth", __name__)


@google_auth.route("/auth/google")
def login():
    try:
        google_provider_cfg = requests.get(GOOGLE_DISCOVERY_URL).json()
        authorization_endpoint = google_provider_cfg["authorization_endpoint"]

        request_uri = client.prepare_request_uri(
            authorization_endpoint,
            # Fixed: Use HTTP for localhost development
            redirect_uri=DEV_REDIRECT_URL,
            scope=["openid", "email", "profile"],
            # Force account selection and consent prompt
            prompt="select_account consent"
        )

        print(f"Redirecting to Google OAuth: {request_uri}")
        return redirect(request_uri)

    except Exception as e:
        print(f"Error in Google OAuth login: {e}")
        return f"Error initializing Google login: {str(e)}", 500


@google_auth.route("/auth/google/callback")
def callback():
    code = request.args.get("code")
    print(f"Received OAuth callback with code: {code[:20]}..." if code else "No code received")

    if not code:
        error = request.args.get("error")
        print(f"OAuth error: {error}")
        return f"OAuth authentication failed: {error}", 400

    try:
        google_provider_cfg = requests.get(GOOGLE_DISCOVERY_URL).json()
        token_endpoint = google_provider_cfg["token_endpoint"]

        token_url, headers, body = client.prepare_token_request(
            token_endpoint,
            # Fixed: Use actual request URL without HTTPS replacement
            authorization_response=request.url,
            redirect_url=DEV_REDIRECT_URL,
            code=code,
        )
        token_response = requests.post(
            token_url,
            headers=headers,
            data=body,
            auth=(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET),
        )

        client.parse_request_body_response(json.dumps(token_response.json()))

        userinfo_endpoint = google_provider_cfg["userinfo_endpoint"]
        uri, headers, body = client.add_token(userinfo_endpoint)
        userinfo_response = requests.get(uri, headers=headers, data=body)

        userinfo = userinfo_response.json()
        if userinfo.get("email_verified"):
            users_email = userinfo["email"]
            users_name = userinfo["given_name"]
        else:
            return "User email not available or not verified by Google.", 400

        user = User.query.filter_by(email=users_email).first()
        if not user:
            user = User()
            user.username = users_name
            user.email = users_email
            db.session.add(user)
            db.session.commit()

        login_user(user)

        frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
        return redirect(frontend_url)

    except Exception as e:
        print(f"Error in OAuth callback: {e}")
        return f"OAuth authentication failed: {str(e)}", 500


@google_auth.route("/logout")
@login_required
def logout():
    logout_user()
    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
    return redirect(frontend_url)
"""
JWT utilities for cross-domain authentication (Vercel frontend ↔ Render backend).

Since the frontend (vercel.app) and backend (onrender.com) are on different domains,
browser session cookies cannot cross the domain boundary. We use short-lived JWT
tokens passed as URL query params and stored in localStorage instead.
"""
import jwt
import datetime
import os
from django.conf import settings


def _secret():
    return settings.JWT_SECRET


def create_token(user_id: int, expiry_hours: int = 24 * 7) -> str:
    """Generate a signed JWT for the given user ID. Expires in `expiry_hours` hours."""
    payload = {
        'user_id': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=expiry_hours),
        'iat': datetime.datetime.utcnow(),
    }
    return jwt.encode(payload, _secret(), algorithm='HS256')


def decode_token(token: str) -> dict | None:
    """
    Decode and validate a JWT. Returns the payload dict on success, or None on failure.
    Failure reasons: expired, invalid signature, malformed token.
    """
    try:
        payload = jwt.decode(token, _secret(), algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

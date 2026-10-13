"""
Supabase client configuration and token verification.

Uses the official supabase-py package for authentication and database access.
All credentials are loaded from environment variables — never hard-coded.
"""

import os

from dotenv import load_dotenv
from supabase import create_client, Client

try:  # supabase-py >= 2.32 ships the auth client as the `supabase_auth` package
    from supabase_auth.errors import AuthApiError
except ModuleNotFoundError:  # older supabase-py versions used the `gotrue` package
    from gotrue.errors import AuthApiError

# Load backend/.env for local development before reading configuration below.
# On Vercel, these values come from the project's Environment Variables instead.
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

# ---------------------------------------------------------------------------
# Environment variables
# ---------------------------------------------------------------------------

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "") or os.environ.get(
    "SUPABASE_ANON_KEY", ""
)


def get_supabase_client() -> Client:
    """
    Return a Supabase client instance.

    Raises RuntimeError if environment variables are not configured,
    so the API fails fast rather than returning confusing errors later.
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise RuntimeError(
            "Supabase configuration is missing. "
            "Set SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY) in the environment."
        )
    return create_client(SUPABASE_URL, SUPABASE_KEY)


# ---------------------------------------------------------------------------
# Token verification
# ---------------------------------------------------------------------------

class TokenVerificationError(Exception):
    """Raised when a Bearer token is invalid, expired, or cannot be verified."""


def verify_token(access_token: str) -> dict:
    """
    Verify a Supabase access token and return the authenticated user dict.

    The user dict contains at least 'id' and 'email'.
    Raises TokenVerificationError on failure.
    """
    if not access_token:
        raise TokenVerificationError("No access token provided.")

    try:
        client = get_supabase_client()
        response = client.auth.get_user(access_token)

        if response is None or response.user is None:
            raise TokenVerificationError("Invalid or expired token.")

        user = response.user
        return {
            "id": user.id,
            "email": user.email,
        }

    except TokenVerificationError:
        raise
    except AuthApiError:
        raise TokenVerificationError("Invalid or expired token.")
    except Exception:
        # Never expose internal error details (could contain credentials)
        raise TokenVerificationError("Token verification failed.")

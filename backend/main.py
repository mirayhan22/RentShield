"""
RentShield FastAPI backend.

Provides authentication and risk-check persistence via Supabase.
All user identity is obtained from the verified Bearer token — never from the request body.

Endpoints:
  POST /auth/signup       — Create a Supabase Auth user
  POST /auth/login        — Authenticate with email and password
  GET  /auth/me           — Return the authenticated user (requires Bearer token)
  POST /risk-checks       — Create a risk-check record (requires Bearer token)
  GET  /risk-checks       — List the authenticated user's risk-checks (requires Bearer token)
  GET  /health            — Health check
"""

import os
from typing import List

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware

from backend.models import (
    SignupRequest,
    LoginRequest,
    AuthResponse,
    UserMeResponse,
    RiskCheckCreate,
    RiskCheckResponse,
    HealthResponse,
)
from backend.supabase_client import (
    get_supabase_client,
    verify_token,
    TokenVerificationError,
)

# ---------------------------------------------------------------------------
# App configuration
# ---------------------------------------------------------------------------

app = FastAPI(
    title="RentShield API",
    description="Backend for RentShield rental safety check prototype",
    version="1.0.0",
)

# CORS — allow the Vite dev server and an optional deployed frontend URL
FRONTEND_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Add deployed frontend URL if provided via environment variable
DEPLOYED_FRONTEND_URL = os.environ.get("DEPLOYED_FRONTEND_URL", "").strip()
if DEPLOYED_FRONTEND_URL:
    FRONTEND_ORIGINS.append(DEPLOYED_FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Dependency: extract and verify Bearer token
# ---------------------------------------------------------------------------

def get_current_user(authorization: str = Header(None)) -> dict:
    """
    Extract the Bearer access token from the Authorization header,
    verify it via Supabase, and return the authenticated user dict.

    Raises 401 if the token is missing or invalid.
    """
    if authorization is None:
        raise HTTPException(status_code=401, detail="Authorization header is missing.")

    parts = authorization.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=401,
            detail="Authorization header must use the Bearer scheme.",
        )

    token = parts[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Access token is empty.")

    try:
        user = verify_token(token)
        return user
    except TokenVerificationError as exc:
        raise HTTPException(status_code=401, detail=str(exc))


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@app.get("/health", response_model=HealthResponse, tags=["Health"])
def health() -> HealthResponse:
    """Health check endpoint — no authentication required."""
    return HealthResponse(status="ok", version="1.0.0")


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

@app.post("/auth/signup", response_model=AuthResponse, tags=["Auth"])
def signup(body: SignupRequest) -> AuthResponse:
    """
    Create a new Supabase Auth user.

    Returns user_id, email, and the access token for subsequent requests.
    """
    try:
        client = get_supabase_client()
        response = client.auth.sign_up(
            {
                "email": body.email,
                "password": body.password,
            }
        )
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Signup failed. The email may already be registered.",
        )

    if response.user is None:
        raise HTTPException(status_code=400, detail="Signup failed. Please check your email and password.")

    user = response.user
    session = response.session

    return AuthResponse(
        user_id=user.id,
        email=user.email or "",
        access_token=session.access_token if session else None,
    )


@app.post("/auth/login", response_model=AuthResponse, tags=["Auth"])
def login(body: LoginRequest) -> AuthResponse:
    """
    Authenticate with email and password.

    Returns user_id, email, and the access token for subsequent requests.
    """
    try:
        client = get_supabase_client()
        response = client.auth.sign_in_with_password(
            {
                "email": body.email,
                "password": body.password,
            }
        )
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    if response.user is None or response.session is None:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    user = response.user
    session = response.session

    return AuthResponse(
        user_id=user.id,
        email=user.email or "",
        access_token=session.access_token,
    )


@app.get("/auth/me", response_model=UserMeResponse, tags=["Auth"])
def me(current_user: dict = Depends(get_current_user)) -> UserMeResponse:
    """
    Return the authenticated user's identity.

    Requires a valid Bearer access token.
    """
    return UserMeResponse(
        user_id=current_user["id"],
        email=current_user.get("email", ""),
    )


# ---------------------------------------------------------------------------
# Risk checks
# ---------------------------------------------------------------------------

@app.post("/risk-checks", response_model=RiskCheckResponse, tags=["Risk Checks"])
def create_risk_check(
    body: RiskCheckCreate,
    current_user: dict = Depends(get_current_user),
) -> RiskCheckResponse:
    """
    Create a new risk-check record for the authenticated user.

    The user_id is always obtained from the verified token — never from the request body.
    """
    user_id = current_user["id"]

    record = {
        "user_id": user_id,
        "suburb": body.suburb,
        "weekly_rent": body.weekly_rent,
        "listing_source": body.listing_source,
        "viewed_in_person": body.viewed_in_person,
        "payment_before_viewing": body.payment_before_viewing,
        "pressured_to_pay": body.pressured_to_pay,
        "no_written_agreement": body.no_written_agreement,
        "unregulated_source": body.unregulated_source,
        "unusually_low_rent": body.unusually_low_rent,
        "risk_level": body.risk_level,
        "risk_signals": body.risk_signals,
        "verification_actions": body.verification_actions,
        "evidence_note": body.evidence_note,
    }

    try:
        client = get_supabase_client()
        result = client.table("risk_checks").insert(record).execute()
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Failed to save risk check. Please try again.",
        )

    if not result.data or len(result.data) == 0:
        raise HTTPException(status_code=500, detail="Failed to save risk check.")

    row = result.data[0]
    return _row_to_response(row)


@app.get("/risk-checks", response_model=List[RiskCheckResponse], tags=["Risk Checks"])
def list_risk_checks(
    current_user: dict = Depends(get_current_user),
) -> List[RiskCheckResponse]:
    """
    List all risk-check records for the authenticated user.

    Only returns records where user_id matches the verified token.
    """
    user_id = current_user["id"]

    try:
        client = get_supabase_client()
        result = (
            client.table("risk_checks")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Failed to load risk checks.",
        )

    if result.data is None:
        return []

    return [_row_to_response(row) for row in result.data]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _row_to_response(row: dict) -> RiskCheckResponse:
    """Convert a database row dict to a RiskCheckResponse model."""
    return RiskCheckResponse(
        id=str(row.get("id", "")),
        user_id=str(row.get("user_id", "")),
        suburb=str(row.get("suburb", "")),
        weekly_rent=str(row.get("weekly_rent", "")),
        listing_source=str(row.get("listing_source", "")),
        viewed_in_person=bool(row.get("viewed_in_person", False)),
        payment_before_viewing=bool(row.get("payment_before_viewing", False)),
        pressured_to_pay=bool(row.get("pressured_to_pay", False)),
        no_written_agreement=bool(row.get("no_written_agreement", False)),
        unregulated_source=bool(row.get("unregulated_source", False)),
        unusually_low_rent=bool(row.get("unusually_low_rent", False)),
        risk_level=str(row.get("risk_level", "")),
        risk_signals=row.get("risk_signals"),
        verification_actions=row.get("verification_actions"),
        evidence_note=row.get("evidence_note"),
        created_at=str(row.get("created_at", "")),
    )
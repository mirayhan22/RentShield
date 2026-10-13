"""
Pydantic request and response models for the RentShield API.

These models define the shape of data accepted and returned by the backend.
No secrets, tokens, or database credentials are ever exposed in responses.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional


# ---------------------------------------------------------------------------
# Auth models
# ---------------------------------------------------------------------------

class SignupRequest(BaseModel):
    """Request body for POST /auth/signup."""

    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="User password (min 6 chars)")


class LoginRequest(BaseModel):
    """Request body for POST /auth/login."""

    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="User password")


class AuthResponse(BaseModel):
    """Response body for auth endpoints. Never includes raw tokens or passwords."""

    user_id: str = Field(..., description="Supabase Auth user ID")
    email: str = Field(..., description="User email address")
    access_token: Optional[str] = Field(None, description="Supabase access token (returned on login/signup)")
    token_type: str = Field(default="bearer", description="Token type for Authorization header")


class UserMeResponse(BaseModel):
    """Response body for GET /auth/me."""

    user_id: str
    email: str


# ---------------------------------------------------------------------------
# Risk-check models
# ---------------------------------------------------------------------------

class RiskCheckCreate(BaseModel):
    """Request body for POST /risk-checks. user_id is never accepted — it comes from the verified token."""

    suburb: str = Field(..., min_length=1, max_length=120, description="Property suburb")
    weekly_rent: str = Field(..., min_length=1, max_length=32, description="Weekly rent amount")
    listing_source: str = Field(..., min_length=1, max_length=120, description="Where the listing was found")
    viewed_in_person: bool = Field(..., description="Whether the property was viewed in person")
    payment_before_viewing: bool = Field(..., description="Whether payment was requested before viewing")

    pressured_to_pay: bool = Field(..., description="Whether the user was pressured to pay quickly")
    no_written_agreement: bool = Field(..., description="Whether there is no written lease or agreement")
    unregulated_source: bool = Field(..., description="Whether the listing is from an unregulated source")
    unusually_low_rent: bool = Field(..., description="Whether the rent is unusually low for the area")

    risk_level: str = Field(..., max_length=32, description="Calculated risk level: low, review, or high")
    risk_signals: Optional[dict] = Field(None, description="Structured risk signals from the frontend calculator")
    verification_actions: Optional[list] = Field(None, description="Verification action checkboxes")
    evidence_note: Optional[str] = Field(None, max_length=4000, description="User evidence note")


class RiskCheckResponse(BaseModel):
    """Response body for a single risk-check record."""

    id: str
    user_id: str
    suburb: str
    weekly_rent: str
    listing_source: str
    viewed_in_person: bool
    payment_before_viewing: bool
    pressured_to_pay: bool
    no_written_agreement: bool
    unregulated_source: bool
    unusually_low_rent: bool
    risk_level: str
    risk_signals: Optional[dict] = None
    verification_actions: Optional[list] = None
    evidence_note: Optional[str] = None
    created_at: str


# ---------------------------------------------------------------------------
# Health model
# ---------------------------------------------------------------------------

class HealthResponse(BaseModel):
    """Response body for GET /health."""

    status: str
    version: str
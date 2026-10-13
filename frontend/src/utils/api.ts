/**
 * API client for the RentShield FastAPI backend.
 *
 * All requests go to same-origin /api/*:
 *  - in development the Vite proxy forwards them to the local uvicorn server;
 *  - on Vercel, vercel.json routes /api/* to the Python serverless function.
 *
 * The frontend never talks to Supabase directly and never contains any keys.
 */

import { getAuthToken } from "./auth";
import type { RiskCheckRecord } from "./types";

const API_BASE = "/api";

/** Error thrown for any non-2xx API response, carrying the server message. */
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Response shape of POST /auth/signup and POST /auth/login. */
export interface AuthResult {
  user_id: string;
  email: string;
  access_token: string | null;
  token_type: string;
}

/** Request body for POST /risk-checks (mirrors backend RiskCheckCreate). */
export interface RiskCheckPayload {
  suburb: string;
  weekly_rent: string;
  listing_source: string;
  viewed_in_person: boolean;
  payment_before_viewing: boolean;
  pressured_to_pay: boolean;
  no_written_agreement: boolean;
  unregulated_source: boolean;
  unusually_low_rent: boolean;
  risk_level: string;
  risk_signals: Record<string, unknown>;
  verification_actions: unknown[];
  evidence_note: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (!response.ok) {
    let message = `Request failed (${response.status}). Please try again.`;
    try {
      const body = (await response.json()) as { detail?: unknown };
      if (typeof body.detail === "string" && body.detail.trim()) {
        message = body.detail;
      }
    } catch {
      // Keep the generic message when the body is not JSON.
    }
    throw new ApiError(message, response.status);
  }

  return (await response.json()) as T;
}

export const authApi = {
  /** Create a new account. Returns the session (access_token may be null if email confirmation is required). */
  signup(email: string, password: string): Promise<AuthResult> {
    return request<AuthResult>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  /** Sign in with an existing account. */
  login(email: string, password: string): Promise<AuthResult> {
    return request<AuthResult>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  /** Return the authenticated user (requires a Bearer token). */
  me(): Promise<{ user_id: string; email: string }> {
    return request<{ user_id: string; email: string }>("/auth/me");
  },
};

export const riskCheckApi = {
  /** Save a completed risk check for the authenticated user. */
  create(payload: RiskCheckPayload): Promise<RiskCheckRecord> {
    return request<RiskCheckRecord>("/risk-checks", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /** Retrieve all risk checks saved by the authenticated user. */
  list(): Promise<RiskCheckRecord[]> {
    return request<RiskCheckRecord[]>("/risk-checks");
  },
};
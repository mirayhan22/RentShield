/**
 * Session storage for the signed-in user.
 *
 * Stores the Supabase access token returned by the RentShield backend.
 * The token is sent as an Authorization: Bearer header on API calls.
 * No Supabase keys or secrets are ever stored or used in the frontend.
 */

const STORAGE_KEY = "rentshield.session";

export interface StoredSession {
  email: string;
  access_token: string | null;
  user_id: string | null;
  demo: boolean;
}

/** Return the stored session, or null when signed out. */
export function getSession(): StoredSession | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

/** Persist the session after a successful signup or login. */
export function saveSession(session: StoredSession): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

/** Remove the session (sign out / start new check). */
export function clearSession(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}

/** Return the Bearer access token, or null for demo/signed-out sessions. */
export function getAuthToken(): string | null {
  return getSession()?.access_token ?? null;
}

/** True when a user session (real or demo) exists. */
export function isAuthenticated(): boolean {
  return getSession() !== null;
}

/** True when running in local demo mode (no real account). */
export function isDemoSession(): boolean {
  return getSession()?.demo === true;
}
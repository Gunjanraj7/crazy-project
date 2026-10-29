// Client for the FastAPI backend (see backend/). In development Vite proxies /api to it, so the
// httpOnly session cookie is first-party and sent automatically. Every function resolves with data
// or throws an ApiError carrying a readable message (and per-field messages when the server has them).

export const DEMO_CREDENTIALS = { username: 'demo', password: 'cyber2077' };

// Mirrors the backend defaults; used before the user is loaded.
export const DEFAULT_PREFS = {
  typewriter: true, // bot replies type out letter by letter
  scanlines: true, // CRT overlay across the app
  cursorGlow: true, // soft light following the mouse
};

const REMEMBERED_USER_KEY = 'persona-os:remembered-user';
const UNREACHABLE = 'Can’t reach the server. Is the backend running?';

export class ApiError extends Error {
  constructor(message, status, fieldErrors = {}) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(UNREACHABLE, 0);
  }

  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if (response.ok) return data;

  // The dev proxy answers with a bare 5xx when the backend is down.
  if (!data && response.status >= 500) throw new ApiError(UNREACHABLE, response.status);
  const message = typeof data?.detail === 'string' ? data.detail : `Request failed (${response.status}).`;
  throw new ApiError(message, response.status, data?.errors ?? {});
}

// Who is signed in (from the session cookie), or null.
export async function getCurrentUser() {
  try {
    return await request('/auth/me');
  } catch (err) {
    if (err.status === 401) return null;
    throw err;
  }
}

export function login({ username, password, remember = false }) {
  return request('/auth/login', { method: 'POST', body: { username, password, remember } });
}

export function signup({ displayName, username, email, password }) {
  return request('/auth/signup', { method: 'POST', body: { displayName, username, email, password } });
}

export async function logout() {
  try {
    await request('/auth/logout', { method: 'POST' });
  } catch {
    // Signing out locally still makes sense if the server can't be reached.
  }
}

export function requestPasswordReset(email) {
  return request('/auth/forgot-password', { method: 'POST', body: { email } });
}

export function resetPassword({ token, newPassword }) {
  return request('/auth/reset-password', { method: 'POST', body: { token, newPassword } });
}

export function updateProfile(changes) {
  return request('/users/me', { method: 'PATCH', body: changes });
}

export function changePassword({ currentPassword, newPassword }) {
  return request('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } });
}

// "Remember me" pre-fills the username field; that's a UI convenience, so it stays in localStorage.
export function getRememberedUsername() {
  try {
    return localStorage.getItem(REMEMBERED_USER_KEY) ?? '';
  } catch {
    return '';
  }
}

export function setRememberedUsername(username) {
  try {
    if (username) localStorage.setItem(REMEMBERED_USER_KEY, username);
    else localStorage.removeItem(REMEMBERED_USER_KEY);
  } catch {
    // Not critical: the field just won't be pre-filled.
  }
}

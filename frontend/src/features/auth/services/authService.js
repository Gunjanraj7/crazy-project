// Mock authentication service.
// Replace the body of `login` with a real request (e.g. `fetch('/api/login', ...)`) once a backend exists;
// the rest of the app only relies on it resolving with `{ user }` or throwing an Error with a readable message.

export const DEMO_CREDENTIALS = { username: 'admin', password: 'guardian123' };

const NETWORK_DELAY_MS = 1200;
const REMEMBERED_USER_KEY = 'neural-guardian:remembered-user';

export async function login({ username, password }) {
  await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS));

  const normalizedUsername = username.trim();
  if (
    normalizedUsername.toLowerCase() === DEMO_CREDENTIALS.username &&
    password === DEMO_CREDENTIALS.password
  ) {
    return { user: { username: normalizedUsername, signedInAt: new Date() } };
  }

  throw new Error('Invalid username or password.');
}

// localStorage can throw (private mode, blocked storage), so failures fall back to "not remembered".
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
    // Not critical: the user just won't be remembered.
  }
}

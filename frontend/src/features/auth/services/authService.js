// Mock authentication service backed by browser storage.
// Every function is async and either resolves with data or throws an Error with a readable message,
// so swapping the bodies for real `fetch('/api/...')` calls later won't change any component.
// NOTE: storing accounts in localStorage is for the demo only. Real auth must live on a server.

export const DEMO_CREDENTIALS = { username: 'demo', password: 'cyber2077' };

export const DEFAULT_PREFS = {
  typewriter: true, // bot replies type out letter by letter
  scanlines: true, // CRT overlay across the app
  cursorGlow: true, // soft light following the mouse
};

const NETWORK_DELAY_MS = 900;
const USERS_KEY = 'persona-os:users';
const SESSION_KEY = 'persona-os:session';
const REMEMBERED_USER_KEY = 'persona-os:remembered-user';

const delay = (ms = NETWORK_DELAY_MS) => new Promise((resolve) => setTimeout(resolve, ms));

// Storage can throw (private mode, blocked storage), so every access is guarded.
function readJson(storage, key, fallback) {
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(storage, key, value) {
  try {
    if (value == null) storage.removeItem(key);
    else storage.setItem(key, JSON.stringify(value));
  } catch {
    // Not critical for a demo: data just won't persist.
  }
}

async function hashPassword(password) {
  if (globalThis.crypto?.subtle) {
    const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
    return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // crypto.subtle only exists on https/localhost; fall back to a simple hash elsewhere.
  let hash = 5381;
  for (const char of password) hash = (hash * 33) ^ char.charCodeAt(0);
  return `djb2-${(hash >>> 0).toString(16)}`;
}

const readUsers = () => readJson(localStorage, USERS_KEY, {});
const writeUsers = (users) => writeJson(localStorage, USERS_KEY, users);
const toPublicUser = ({ passwordHash: _passwordHash, ...user }) => ({ ...user, prefs: { ...DEFAULT_PREFS, ...user.prefs } });

// Makes sure the demo account exists so the portfolio can be tried without signing up.
async function loadUsers() {
  const users = readUsers();
  if (!users[DEMO_CREDENTIALS.username]) {
    users[DEMO_CREDENTIALS.username] = {
      username: DEMO_CREDENTIALS.username,
      displayName: 'Demo Runner',
      email: 'demo@persona.os',
      bio: 'Just jacked in. Exploring the grid.',
      createdAt: new Date().toISOString(),
      prefs: { ...DEFAULT_PREFS },
      passwordHash: await hashPassword(DEMO_CREDENTIALS.password),
    };
    writeUsers(users);
  }
  return users;
}

// Session lives in localStorage when "remember me" is on, otherwise only for this tab.
function saveSession(username, remember) {
  writeJson(localStorage, SESSION_KEY, remember ? username : null);
  writeJson(sessionStorage, SESSION_KEY, remember ? null : username);
}

export function getSessionUser() {
  const username = readJson(sessionStorage, SESSION_KEY, null) ?? readJson(localStorage, SESSION_KEY, null);
  const record = username && readUsers()[username];
  return record ? toPublicUser(record) : null;
}

export async function login({ username, password, remember = false }) {
  const [users] = await Promise.all([loadUsers(), delay()]);
  const record = users[username.trim().toLowerCase()];

  if (!record || record.passwordHash !== (await hashPassword(password))) {
    throw new Error('Invalid username or password.');
  }

  saveSession(record.username, remember);
  return toPublicUser(record);
}

export async function signup({ displayName, username, email, password }) {
  const [users] = await Promise.all([loadUsers(), delay()]);
  const key = username.trim().toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();

  if (users[key]) throw new Error('That username is already taken.');
  if (Object.values(users).some((u) => u.email === normalizedEmail)) {
    throw new Error('An account with that email already exists.');
  }

  users[key] = {
    username: key,
    displayName: displayName.trim(),
    email: normalizedEmail,
    bio: '',
    createdAt: new Date().toISOString(),
    prefs: { ...DEFAULT_PREFS },
    passwordHash: await hashPassword(password),
  };
  writeUsers(users);
  saveSession(key, false);
  return toPublicUser(users[key]);
}

export function logout() {
  saveSession(null, false);
}

// Always "succeeds" so the form never reveals which emails have accounts.
export async function requestPasswordReset() {
  await delay(1200);
}

export async function updateProfile(username, changes) {
  const [users] = await Promise.all([loadUsers(), delay(500)]);
  const record = users[username];
  if (!record) throw new Error('Account not found.');

  const email = changes.email?.trim().toLowerCase();
  if (email && Object.values(users).some((u) => u.email === email && u.username !== username)) {
    throw new Error('That email is used by another account.');
  }

  users[username] = {
    ...record,
    ...changes,
    ...(email && { email }),
    prefs: { ...record.prefs, ...changes.prefs },
  };
  writeUsers(users);
  return toPublicUser(users[username]);
}

export async function changePassword(username, { currentPassword, newPassword }) {
  const [users] = await Promise.all([loadUsers(), delay()]);
  const record = users[username];
  if (!record || record.passwordHash !== (await hashPassword(currentPassword))) {
    throw new Error('Current password is incorrect.');
  }
  users[username] = { ...record, passwordHash: await hashPassword(newPassword) };
  writeUsers(users);
}

export function getRememberedUsername() {
  return readJson(localStorage, REMEMBERED_USER_KEY, '');
}

export function setRememberedUsername(username) {
  writeJson(localStorage, REMEMBERED_USER_KEY, username || null);
}

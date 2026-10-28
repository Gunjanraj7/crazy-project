import { AVATARS } from '@/features/avatars/data/avatars';

// Conversations are saved per user and per avatar in localStorage.
const key = (username, avatarId) => `persona-os:chat:${username}:${avatarId}`;

// Tiny change feed so the sidebar and dashboard update while you chat (see useConversations).
const listeners = new Set();
let version = 0;
const notify = () => {
  version++;
  listeners.forEach((listener) => listener());
};

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

let snapshot = { username: null, version: -1, conversations: [] };
export function getConversationsSnapshot(username) {
  if (snapshot.username !== username || snapshot.version !== version) {
    snapshot = { username, version, conversations: listConversations(username) };
  }
  return snapshot.conversations;
}

export function loadMessages(username, avatarId) {
  try {
    const raw = localStorage.getItem(key(username, avatarId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveMessages(username, avatarId, messages) {
  try {
    // `fresh` only drives the typewriter animation for the current session, so it isn't stored.
    const stored = messages.map(({ fresh: _fresh, ...message }) => message);
    localStorage.setItem(key(username, avatarId), JSON.stringify(stored));
  } catch {
    // Storage full or blocked: the chat still works, it just won't be remembered.
  }
  notify();
}

export function clearAllMessages(username) {
  try {
    AVATARS.forEach((avatar) => localStorage.removeItem(key(username, avatar.id)));
  } catch {
    // Nothing to clear.
  }
  notify();
}

// Summary of every conversation the user has actually taken part in, most recent first.
export function listConversations(username) {
  return AVATARS.map((avatar) => {
    const messages = loadMessages(username, avatar.id) ?? [];
    const sent = messages.filter((m) => m.role === 'user').length;
    const last = messages.at(-1);
    return { avatar, sent, total: messages.length, lastMessage: last, updatedAt: last?.createdAt ?? 0 };
  })
    .filter((conversation) => conversation.sent > 0)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

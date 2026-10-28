import { useEffect, useState } from 'react';
import { fillTemplate } from '../utils/personaEngine';
import { getAvatarReply } from '../services/chatService';
import { loadMessages, saveMessages } from '../services/chatStorage';

const createId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const createMessage = (role, text, extra) => ({ id: createId(), role, text, createdAt: Date.now(), ...extra });

const greetingFor = (avatar, userName) => [createMessage('bot', fillTemplate(avatar.greeting, { name: userName }))];

// One conversation with one avatar. Mount it with `key={avatar.id}` so switching avatars starts fresh.
export function useChat({ avatar, user }) {
  const userName = user.displayName || user.username;
  const [messages, setMessages] = useState(() => loadMessages(user.username, avatar.id) ?? greetingFor(avatar, userName));
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    saveMessages(user.username, avatar.id, messages);
  }, [user.username, avatar.id, messages]);

  const send = async (rawText) => {
    const text = rawText.trim();
    if (!text || isTyping) return;

    const history = [...messages, createMessage('user', text)];
    setMessages(history);
    setIsTyping(true);
    try {
      const reply = await getAvatarReply({ avatar, message: text, history, userName });
      setMessages((prev) => [...prev, createMessage('bot', reply, { fresh: true })]);
    } catch {
      setMessages((prev) => [...prev, createMessage('system', 'Connection lost. Try sending that again.')]);
    } finally {
      setIsTyping(false);
    }
  };

  const reset = () => setMessages(greetingFor(avatar, userName));

  return { messages, isTyping, send, reset };
}

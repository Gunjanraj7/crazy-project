import { generateReply } from '../utils/personaEngine';

// Where avatar replies come from. Today it's the offline persona engine with a fake "thinking" delay.
// To connect a real language model, replace the body with a call to your backend, e.g.
//   const res = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({
//     system: avatar.persona, messages: history.map(({ role, text }) => ({ role, content: text })) }) });
//   return (await res.json()).reply;
// Keep API keys on the server, never in this frontend.
export async function getAvatarReply({ avatar, message, history, userName }) {
  const thinkingMs = 700 + Math.random() * 700 + Math.min(message.length * 8, 600);
  await new Promise((resolve) => setTimeout(resolve, thinkingMs));

  const recentReplies = history.filter((m) => m.role === 'bot').slice(-6).map((m) => m.text);
  return generateReply(avatar, message, { name: userName, recentReplies });
}

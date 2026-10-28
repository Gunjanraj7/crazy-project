import { Navigate, useParams } from 'react-router';
import { useAuth } from '@/features/auth';
import { AVATARS, getAvatar } from '@/features/avatars/data/avatars';
import ChatRoom from '@/features/chat/components/ChatRoom';
import { useConversations } from '@/features/chat/hooks/useConversations';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function ChatPage() {
  const { avatarId } = useParams();
  const { user, prefs } = useAuth();
  const conversations = useConversations(user.username);
  const avatar = getAvatar(avatarId);
  useDocumentTitle(avatar ? `Chat with ${avatar.name}` : 'Chat');

  // "/chat" on its own opens the most recent conversation (or the first avatar).
  if (!avatarId) return <Navigate to={`/chat/${conversations[0]?.avatar.id ?? AVATARS[0].id}`} replace />;
  if (!avatar) return <Navigate to="/dashboard" replace />;

  return <ChatRoom key={avatar.id} avatar={avatar} user={user} typewriter={prefs.typewriter} />;
}

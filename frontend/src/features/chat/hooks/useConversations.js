import { useSyncExternalStore } from 'react';
import { getConversationsSnapshot, subscribe } from '../services/chatStorage';

// Live list of the user's conversations, most recent first.
export function useConversations(username) {
  return useSyncExternalStore(subscribe, () => getConversationsSnapshot(username));
}

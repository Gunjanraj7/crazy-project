export const formatClock = (timestamp) =>
  new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const formatDate = (timestamp) =>
  new Date(timestamp).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });

// "just now", "5m ago", "3h ago", "2d ago", then a date.
export function timeAgo(timestamp, now = Date.now()) {
  const minutes = Math.floor((now - timestamp) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days < 7 ? `${days}d ago` : formatDate(timestamp);
}

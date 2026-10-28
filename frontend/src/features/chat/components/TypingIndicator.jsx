import AvatarSigil from '@/features/avatars/components/AvatarSigil';

export default function TypingIndicator({ avatar }) {
  return (
    <div className="flex animate-fade-up items-center gap-3" role="status">
      <AvatarSigil avatar={avatar} className="h-8 w-8 shrink-0" />
      <div className="clip-chamfer-sm flex items-center gap-1.5 bg-night-700/80 px-4 py-3.5">
        {[0, 150, 300].map((delayMs) => (
          <span
            key={delayMs}
            className="h-1.5 w-1.5 animate-bounce-dot rounded-full"
            style={{ background: avatar.colors[0], animationDelay: `${delayMs}ms` }}
          />
        ))}
      </div>
      <span className="font-mono text-xs text-gray-500">{avatar.name} is composing…</span>
    </div>
  );
}

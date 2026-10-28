import AvatarSigil from '@/features/avatars/components/AvatarSigil';
import { formatClock } from '@/lib/time';
import { useTypewriter } from '../hooks/useTypewriter';

function BotMessage({ message, avatar, animate }) {
  const { text, done } = useTypewriter(message.text, animate);

  return (
    <div className="flex max-w-[88%] animate-fade-up items-end gap-3 sm:max-w-[75%]">
      <AvatarSigil avatar={avatar} animated={false} className="h-8 w-8 shrink-0" />
      <div>
        <p className="mb-1.5 font-mono text-[10px] tracking-widest text-gray-500 uppercase">
          <span style={{ color: avatar.colors[0] }}>{avatar.name}</span> · {formatClock(message.createdAt)}
        </p>
        <div
          className="clip-chamfer-sm border-l-2 bg-night-700/80 px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap text-gray-100"
          style={{ borderColor: avatar.colors[0], backgroundImage: `linear-gradient(90deg, ${avatar.colors[0]}14, transparent 60%)` }}
        >
          {text}
          {!done && <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-caret" style={{ background: avatar.colors[0] }} />}
        </div>
      </div>
    </div>
  );
}

export default function ChatMessage({ message, avatar, animate }) {
  if (message.role === 'system') {
    return <p className="mx-auto font-mono text-xs text-rose-400">&gt; {message.text}</p>;
  }

  if (message.role === 'bot') return <BotMessage message={message} avatar={avatar} animate={animate} />;

  return (
    <div className="ml-auto flex max-w-[88%] animate-fade-up flex-col items-end sm:max-w-[75%]">
      <p className="mb-1.5 font-mono text-[10px] tracking-widest text-gray-500 uppercase">You · {formatClock(message.createdAt)}</p>
      <div className="clip-chamfer-sm bg-linear-to-br from-purple-600/90 to-fuchsia-700/80 px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap text-white">
        {message.text}
      </div>
    </div>
  );
}

import { Link } from 'react-router';
import AvatarSigil from '@/features/avatars/components/AvatarSigil';
import { AVATARS } from '@/features/avatars/data/avatars';

// Side panel in the chat room: who you're talking to, plus quick switching between avatars.
export default function AvatarProfile({ avatar, messageCount }) {
  const [primary, secondary] = avatar.colors;

  return (
    // Children must not shrink: on short windows the panel should scroll instead of crushing its sections.
    <aside className="hidden w-80 shrink-0 flex-col overflow-y-auto border-r border-gray-800/60 bg-night-900/60 backdrop-blur-xl xl:flex *:shrink-0">
      <div className="relative overflow-hidden px-6 pt-10 pb-8 text-center">
        <div
          className="absolute top-6 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full opacity-25 blur-3xl"
          style={{ background: `radial-gradient(circle, ${primary}, ${secondary}, transparent 70%)` }}
        />
        <AvatarSigil avatar={avatar} className="relative mx-auto mb-6 h-36 w-36" />
        <h2 className="relative font-display text-3xl font-bold tracking-widest">
          <span className="glitch" data-text={avatar.name}>
            {avatar.name}
          </span>
        </h2>
        <p className="relative mt-1 text-sm font-medium" style={{ color: primary }}>
          {avatar.title}
        </p>
        <p className="relative mt-4 text-sm text-gray-400">{avatar.tagline}</p>
      </div>

      <dl className="mx-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-gray-800/60 bg-gray-800/60 text-center">
        <div className="bg-night-800 p-3">
          <dt className="font-mono text-[10px] tracking-widest text-gray-500 uppercase">Class</dt>
          <dd className="mt-1 text-sm font-semibold">{avatar.category}</dd>
        </div>
        <div className="bg-night-800 p-3">
          <dt className="font-mono text-[10px] tracking-widest text-gray-500 uppercase">Messages</dt>
          <dd className="mt-1 text-sm font-semibold">{messageCount}</dd>
        </div>
      </dl>

      <div className="px-6 pt-6">
        <p className="mb-3 font-mono text-[10px] tracking-[0.25em] text-gray-500 uppercase">// Traits</p>
        <ul className="flex flex-wrap gap-2">
          {avatar.traits.map((trait) => (
            <li key={trait} className="rounded-md border px-2.5 py-1 text-xs" style={{ borderColor: `${primary}55`, color: primary }}>
              {trait}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto px-6 pt-8 pb-6">
        <p className="mb-3 font-mono text-[10px] tracking-[0.25em] text-gray-500 uppercase">// Switch persona</p>
        <ul className="grid grid-cols-4 gap-2">
          {AVATARS.filter((other) => other.id !== avatar.id).map((other) => (
            <li key={other.id}>
              <Link
                to={`/chat/${other.id}`}
                title={`${other.name}: ${other.title}`}
                className="block rounded-lg p-1.5 transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-purple-400"
              >
                <AvatarSigil avatar={other} animated={false} className="h-full w-full" />
                <span className="sr-only">Chat with {other.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

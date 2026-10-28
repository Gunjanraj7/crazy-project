import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import AvatarSigil from './AvatarSigil';

// Selectable avatar tile on the dashboard. Each card glows in its avatar's own colours.
export default function AvatarCard({ avatar, messageCount = 0, style }) {
  const [primary, secondary] = avatar.colors;

  return (
    <Link
      to={`/chat/${avatar.id}`}
      style={{ '--accent': primary, '--accent-2': secondary, ...style }}
      className="group relative flex animate-fade-up flex-col overflow-hidden rounded-2xl border border-gray-800/80 bg-night-800/70 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-(--accent)/60 hover:shadow-[0_10px_50px_-15px_var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent)"
    >
      {/* Colour bloom */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-(--accent) opacity-10 blur-3xl transition-opacity duration-500 group-hover:opacity-30" />
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-(--accent) to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative mb-4 flex h-5 items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.25em] text-gray-500 uppercase">// {avatar.category}</span>
        {messageCount > 0 && (
          <span className="rounded-full border border-(--accent)/40 px-2 py-0.5 font-mono text-[10px] text-(--accent)">
            {messageCount} msg
          </span>
        )}
      </div>

      <AvatarSigil avatar={avatar} className="relative mb-5 h-20 w-20 transition-transform duration-500 group-hover:scale-110" />

      <h3 className="relative font-display text-2xl font-bold tracking-wider">{avatar.name}</h3>
      <p className="relative mb-2 text-sm font-medium text-(--accent)">{avatar.title}</p>
      <p className="relative mb-4 text-sm text-gray-400">{avatar.tagline}</p>

      <ul className="relative mb-5 flex flex-wrap gap-1.5">
        {avatar.traits.map((trait) => (
          <li key={trait} className="rounded-md border border-gray-800 bg-night-700/60 px-2 py-0.5 text-[11px] text-gray-400">
            {trait}
          </li>
        ))}
      </ul>

      <span className="relative mt-auto inline-flex items-center gap-1.5 font-mono text-xs font-bold tracking-widest text-(--accent) uppercase">
        {messageCount > 0 ? 'Resume link' : 'Connect'}
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
      </span>
    </Link>
  );
}

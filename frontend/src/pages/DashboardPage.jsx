import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Activity, ArrowRight, Cpu, MessageSquareText, Search, Shuffle, Star } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/features/auth';
import AvatarCard from '@/features/avatars/components/AvatarCard';
import AvatarSigil from '@/features/avatars/components/AvatarSigil';
import { AVATARS, CATEGORIES } from '@/features/avatars/data/avatars';
import { useConversations } from '@/features/chat/hooks/useConversations';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/lib/cn';
import { timeAgo } from '@/lib/time';

function StatTile({ icon: Icon, label, value, accent }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-800/80 bg-night-800/60 p-4 backdrop-blur-sm">
      <Icon className={cn('mb-3 h-4 w-4', accent)} aria-hidden="true" />
      <p className="truncate font-display text-2xl font-bold">{value}</p>
      <p className="font-mono text-[10px] tracking-widest text-gray-500 uppercase">{label}</p>
    </div>
  );
}

const matchesQuery = (avatar, query) =>
  [avatar.name, avatar.title, avatar.tagline, ...avatar.traits].some((text) => text.toLowerCase().includes(query));

export default function DashboardPage() {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();
  const navigate = useNavigate();
  const conversations = useConversations(user.username);
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');

  const name = user.displayName || user.username;
  const sentByAvatar = Object.fromEntries(conversations.map((c) => [c.avatar.id, c.sent]));
  const totalSent = conversations.reduce((sum, c) => sum + c.sent, 0);
  const favorite = [...conversations].sort((a, b) => b.sent - a.sent)[0]?.avatar;
  const latest = conversations[0];

  const normalizedQuery = query.trim().toLowerCase();
  const visibleAvatars = AVATARS.filter(
    (avatar) => (category === 'All' || avatar.category === category) && matchesQuery(avatar, normalizedQuery),
  );

  const surpriseMe = () => navigate(`/chat/${AVATARS[Math.floor(Math.random() * AVATARS.length)].id}`);

  return (
    <div className="mx-auto max-w-7xl space-y-12 p-5 sm:p-8 lg:p-10">
      {/* Hero */}
      <section className="relative animate-fade-up overflow-hidden rounded-3xl border border-gray-800/60 bg-night-800/50 p-6 backdrop-blur-sm sm:p-10">
        <div className="bg-grid absolute inset-0 opacity-60" />
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-purple-600/25 blur-[100px]" />
        <div className="absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-neon-pink/10 blur-[100px]" />

        <div className="relative grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <p className="mb-4 flex items-center gap-2 font-mono text-xs tracking-[0.25em] text-neon-teal uppercase">
              <span className="h-2 w-2 animate-pulse rounded-full bg-neon-teal" />
              Session active
            </p>
            <h1 className="mb-4 font-display text-4xl leading-tight font-bold uppercase sm:text-5xl">
              Welcome back,
              <br />
              <span className="glitch text-neon-yellow" data-text={name}>
                {name}
              </span>
            </h1>
            <p className="mb-8 max-w-md text-gray-400">
              Eight synthetic minds, each with its own voice. Who do you want to talk to today?
            </p>
            <div className="flex flex-wrap gap-3">
              {latest ? (
                <Button as={Link} to={`/chat/${latest.avatar.id}`} block={false} className="px-6">
                  Resume with {latest.avatar.name}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Button>
              ) : (
                <Button as="a" href="#avatars" block={false} className="px-6">
                  Choose an avatar
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Button>
              )}
              <Button variant="secondary" block={false} onClick={surpriseMe} className="px-5">
                <Shuffle className="h-4 w-4" aria-hidden="true" />
                Surprise me
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatTile icon={Cpu} label="Personas online" value={AVATARS.length} accent="text-neon-teal" />
            <StatTile icon={Activity} label="Active links" value={conversations.length} accent="text-neon-purple" />
            <StatTile icon={MessageSquareText} label="Messages sent" value={totalSent} accent="text-neon-pink" />
            <StatTile icon={Star} label="Top persona" value={favorite?.name ?? '—'} accent="text-neon-yellow" />
          </div>
        </div>
      </section>

      {/* Avatar picker */}
      <section id="avatars" className="scroll-mt-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 font-mono text-[10px] tracking-[0.25em] text-gray-500 uppercase">// Select persona</p>
            <h2 className="font-display text-2xl font-bold uppercase sm:text-3xl">Choose your avatar</h2>
          </div>
          <div className="relative md:w-72">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-500" aria-hidden="true" />
            <label htmlFor="avatar-search" className="sr-only">
              Search avatars
            </label>
            <input
              id="avatar-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or trait…"
              className="w-full rounded-xl border border-gray-800 bg-night-800/80 py-2.5 pr-4 pl-10 text-sm text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div role="group" aria-label="Filter by category" className="mb-6 flex flex-wrap gap-2">
          {CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
              className={cn(
                'clip-chamfer-sm px-4 py-1.5 font-mono text-xs tracking-wider uppercase transition-colors focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-hidden focus-visible:ring-inset',
                category === item ? 'bg-neon-teal text-void' : 'bg-night-700/80 text-gray-400 hover:bg-night-600 hover:text-white',
              )}
            >
              {item}
            </button>
          ))}
        </div>

        {visibleAvatars.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {visibleAvatars.map((avatar, index) => (
              <AvatarCard
                key={avatar.id}
                avatar={avatar}
                messageCount={sentByAvatar[avatar.id]}
                style={{ animationDelay: `${index * 60}ms` }}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-800 p-12 text-center">
            <p className="font-mono text-sm text-gray-500">&gt; No persona matches “{query}”.</p>
          </div>
        )}
      </section>

      {/* Recent conversations */}
      {conversations.length > 0 && (
        <section>
          <p className="mb-2 font-mono text-[10px] tracking-[0.25em] text-gray-500 uppercase">// Log</p>
          <h2 className="mb-6 font-display text-2xl font-bold uppercase sm:text-3xl">Recent transmissions</h2>
          <ul className="divide-y divide-gray-800/60 overflow-hidden rounded-2xl border border-gray-800/60 bg-night-800/50 backdrop-blur-sm">
            {conversations.map(({ avatar, lastMessage, sent, updatedAt }) => (
              <li key={avatar.id}>
                <Link
                  to={`/chat/${avatar.id}`}
                  className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.03] focus-visible:bg-white/[0.03] focus-visible:outline-hidden"
                >
                  <AvatarSigil avatar={avatar} animated={false} className="h-11 w-11 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-baseline gap-2">
                      <span className="font-display font-bold tracking-wide" style={{ color: avatar.colors[0] }}>
                        {avatar.name}
                      </span>
                      <span className="font-mono text-[10px] text-gray-600">{sent} sent</span>
                    </p>
                    <p className="truncate text-sm text-gray-400">
                      {lastMessage.role === 'user' && <span className="text-gray-500">You: </span>}
                      {lastMessage.text}
                    </p>
                  </div>
                  <span className="hidden shrink-0 font-mono text-xs text-gray-500 sm:block">{timeAgo(updatedAt)}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-gray-600 transition-all group-hover:translate-x-1 group-hover:text-white" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

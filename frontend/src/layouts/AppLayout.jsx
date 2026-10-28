import { NavLink, Outlet, useMatch } from 'react-router';
import { LayoutGrid, LogOut, MessagesSquare, UserRound } from 'lucide-react';
import AnimatedBackground from '@/components/effects/AnimatedBackground';
import HexInitials from '@/components/ui/HexInitials';
import Logo from '@/components/ui/Logo';
import { useAuth } from '@/features/auth';
import AvatarSigil from '@/features/avatars/components/AvatarSigil';
import { useConversations } from '@/features/chat/hooks/useConversations';
import { cn } from '@/lib/cn';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/chat', label: 'Chat', icon: MessagesSquare },
  { to: '/profile', label: 'Profile', icon: UserRound },
];

const RECENT_LIMIT = 5;

function SidebarLink({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-purple-400',
          isActive ? 'bg-white/5 text-white' : 'text-gray-400 hover:bg-white/[0.03] hover:text-gray-200',
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              'absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-full bg-neon-teal shadow-[0_0_8px_var(--color-neon-teal)] transition-opacity',
              isActive ? 'opacity-100' : 'opacity-0',
            )}
          />
          <Icon className={cn('h-4.5 w-4.5', isActive ? 'text-neon-teal' : 'text-gray-500 group-hover:text-gray-300')} aria-hidden="true" />
          {label}
        </>
      )}
    </NavLink>
  );
}

function Sidebar() {
  const { user, logout } = useAuth();
  const conversations = useConversations(user.username);
  const activeAvatarId = useMatch('/chat/:avatarId')?.params.avatarId;

  return (
    <aside className="relative z-10 hidden w-72 shrink-0 flex-col border-r border-gray-800/60 bg-night-900/80 backdrop-blur-xl lg:flex">
      <div className="px-6 pt-6 pb-8">
        <Logo to="/dashboard" />
      </div>

      <nav aria-label="Main" className="space-y-1 px-4">
        {NAV_ITEMS.map((item) => (
          <SidebarLink key={item.to} {...item} />
        ))}
      </nav>

      <div className="mt-8 min-h-0 flex-1 overflow-y-auto px-4">
        <p className="mb-3 px-3 font-mono text-[10px] tracking-[0.25em] text-gray-600 uppercase">// Recent</p>
        {conversations.length === 0 ? (
          <p className="px-3 text-xs text-gray-600">No conversations yet. Pick an avatar to start.</p>
        ) : (
          <ul className="space-y-1">
            {conversations.slice(0, RECENT_LIMIT).map(({ avatar, lastMessage }) => (
              <li key={avatar.id}>
                <NavLink
                  to={`/chat/${avatar.id}`}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-white/[0.03] focus-visible:outline-2 focus-visible:outline-purple-400',
                    activeAvatarId === avatar.id && 'bg-white/5',
                  )}
                >
                  <AvatarSigil avatar={avatar} animated={false} className="h-8 w-8" />
                  <span className="min-w-0">
                    <span className="block font-display text-sm font-semibold tracking-wide" style={{ color: avatar.colors[0] }}>
                      {avatar.name}
                    </span>
                    <span className="block truncate text-xs text-gray-500">{lastMessage?.text}</span>
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="m-4 flex items-center gap-3 rounded-xl border border-gray-800/60 bg-night-800/60 p-3">
        <HexInitials name={user.displayName || user.username} className="h-10 w-10 text-sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{user.displayName || user.username}</p>
          <p className="truncate font-mono text-xs text-gray-500">@{user.username}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          aria-label="Sign out"
          title="Sign out"
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-rose-500/10 hover:text-rose-400 focus-visible:outline-2 focus-visible:outline-purple-400"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}

function MobileTopBar() {
  const { user } = useAuth();
  return (
    <header className="relative z-10 flex items-center justify-between border-b border-gray-800/60 bg-night-900/80 px-4 py-3 backdrop-blur-xl lg:hidden">
      <Logo to="/dashboard" />
      <NavLink to="/profile" aria-label="Profile">
        <HexInitials name={user.displayName || user.username} className="h-9 w-9 text-xs" />
      </NavLink>
    </header>
  );
}

function MobileTabBar() {
  return (
    <nav aria-label="Main" className="relative z-10 grid grid-cols-3 border-t border-gray-800/60 bg-night-900/90 backdrop-blur-xl lg:hidden">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn('flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors', isActive ? 'text-neon-teal' : 'text-gray-500')
          }
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

// Shell for signed-in pages: sidebar on desktop, top bar + tab bar on mobile.
export default function AppLayout() {
  return (
    <div className="relative flex h-svh overflow-hidden bg-void text-white">
      <AnimatedBackground />
      <Sidebar />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <MobileTopBar />
        <main className="relative min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
        <MobileTabBar />
      </div>
    </div>
  );
}

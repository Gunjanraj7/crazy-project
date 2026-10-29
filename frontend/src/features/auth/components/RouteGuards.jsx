import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../hooks/useAuth';

// Shown for the split second while the backend tells us whether the session cookie is still valid.
function BootScreen() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-void" role="status">
      <p className="font-mono text-xs tracking-[0.3em] text-neon-teal uppercase">
        Establishing link
        <span className="ml-1 inline-block h-3 w-1.5 translate-y-0.5 animate-caret bg-current" />
      </p>
    </div>
  );
}

// Only for signed-in users; everyone else is sent to /login and brought back afterwards.
export function RequireAuth() {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <BootScreen />;
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}

// Login / sign-up pages: signed-in users skip straight to the app (or back to where they were headed).
export function RedirectIfAuthed() {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <BootScreen />;
  return user ? <Navigate to={location.state?.from ?? '/dashboard'} replace /> : <Outlet />;
}

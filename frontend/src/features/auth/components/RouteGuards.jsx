import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../hooks/useAuth';

// Only for signed-in users; everyone else is sent to /login and brought back afterwards.
export function RequireAuth() {
  const { user } = useAuth();
  const location = useLocation();
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}

// Login / sign-up pages: signed-in users skip straight to the app (or back to where they were headed).
export function RedirectIfAuthed() {
  const { user } = useAuth();
  const location = useLocation();
  return user ? <Navigate to={location.state?.from ?? '/dashboard'} replace /> : <Outlet />;
}

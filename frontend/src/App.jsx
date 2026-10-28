import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import GlobalEffects from '@/components/effects/GlobalEffects';
import { AuthLayout, AuthProvider, ForgotPasswordForm, LoginForm, RedirectIfAuthed, RequireAuth, SignupForm } from '@/features/auth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import AppLayout from '@/layouts/AppLayout';
import ChatPage from '@/pages/ChatPage';
import DashboardPage from '@/pages/DashboardPage';
import NotFoundPage from '@/pages/NotFoundPage';
import ProfilePage from '@/pages/ProfilePage';

// Auth routes render inside the neural-core layout; app routes need a signed-in user.
function Titled({ title, children }) {
  useDocumentTitle(title);
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GlobalEffects />
        <Routes>
          <Route element={<RedirectIfAuthed />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Titled title="Sign in"><LoginForm /></Titled>} />
              <Route path="/signup" element={<Titled title="Create account"><SignupForm /></Titled>} />
              <Route path="/forgot-password" element={<Titled title="Reset password"><ForgotPasswordForm /></Titled>} />
            </Route>
          </Route>

          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/chat/:avatarId?" element={<ChatPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

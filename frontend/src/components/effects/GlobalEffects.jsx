import { useAuth } from '@/features/auth';
import CursorGlow from './CursorGlow';

// App-wide visual layers, switchable from the profile settings.
export default function GlobalEffects() {
  const { prefs } = useAuth();

  return (
    <>
      {prefs.cursorGlow && <CursorGlow />}
      {prefs.scanlines && <div aria-hidden="true" className="scanlines pointer-events-none fixed inset-0 z-[60]" />}
    </>
  );
}

import { useState } from 'react';
import AnimatedBackground from '@/components/effects/AnimatedBackground';
import CursorGlow from '@/components/effects/CursorGlow';
import { AuthCard, BrandPanel, LoginForm, LoginSuccess, MOOD } from '@/features/auth';

export default function LoginPage() {
  const [guardian, setGuardian] = useState({ mood: MOOD.IDLE, lookProgress: 0 });
  const [user, setUser] = useState(null);
  const [isHoveringForm, setIsHoveringForm] = useState(false);

  const handleMoodChange = (mood, lookProgress = 0) => setGuardian({ mood, lookProgress });

  const handleSignOut = () => {
    setUser(null);
    handleMoodChange(MOOD.IDLE);
  };

  return (
    <main className="relative flex min-h-svh w-full flex-col overflow-hidden bg-void text-white selection:bg-purple-500/30 lg:flex-row">
      <AnimatedBackground />
      <CursorGlow dimmed={isHoveringForm} />

      <BrandPanel mood={guardian.mood} lookProgress={guardian.lookProgress} />

      <section
        className="relative z-20 flex w-full items-center justify-center border-gray-800/50 bg-night-900/70 p-6 pb-12 backdrop-blur-sm sm:p-8 lg:min-h-svh lg:w-1/2 lg:border-l lg:p-16"
        onMouseEnter={() => setIsHoveringForm(true)}
        onMouseLeave={() => setIsHoveringForm(false)}
      >
        <AuthCard>
          {user ? (
            <LoginSuccess user={user} onSignOut={handleSignOut} />
          ) : (
            <LoginForm onMoodChange={handleMoodChange} onSuccess={setUser} />
          )}
        </AuthCard>
      </section>
    </main>
  );
}

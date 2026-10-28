import { useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import AnimatedBackground from '@/components/effects/AnimatedBackground';
import { MOOD } from '../constants';
import AuthCard from './AuthCard';
import BrandPanel from './BrandPanel';

// Shared shell for login / sign-up / forgot password: neural core on the left, form card on the right.
// Forms reach the core through the outlet context (see useCoreMood).
export default function AuthLayout() {
  const [core, setCore] = useState({ mood: MOOD.IDLE, lookProgress: 0 });
  const { pathname } = useLocation();

  const onMoodChange = (mood, lookProgress = 0) => setCore({ mood, lookProgress });

  return (
    <main className="relative flex min-h-svh w-full flex-col overflow-hidden bg-void text-white lg:flex-row">
      <AnimatedBackground />

      <BrandPanel mood={core.mood} lookProgress={core.lookProgress} />

      <section className="relative z-20 flex w-full items-center justify-center border-gray-800/50 bg-night-900/70 p-5 pb-12 backdrop-blur-sm sm:p-8 lg:min-h-svh lg:w-1/2 lg:border-l lg:p-14">
        {/* Keyed by route so the card re-animates when switching between forms */}
        <AuthCard key={pathname}>
          <Outlet context={{ onMoodChange }} />
        </AuthCard>
      </section>
    </main>
  );
}

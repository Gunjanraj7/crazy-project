import Logo from '@/components/ui/Logo';
import { APP_VERSION } from '@/config/app';
import AvatarSigil from '@/features/avatars/components/AvatarSigil';
import { AVATARS } from '@/features/avatars/data/avatars';
import { cn } from '@/lib/cn';
import { MOOD, MOOD_CAPTIONS } from '../constants';
import NeuralCore from './NeuralCore';

const CAPTION_COLORS = {
  [MOOD.ERROR]: 'text-rose-400',
  [MOOD.SUCCESS]: 'text-emerald-400',
  [MOOD.HIDING]: 'text-fuchsia-400',
};

const PREVIEW_COUNT = 5;

export default function BrandPanel({ mood, lookProgress }) {
  return (
    <section className="relative z-10 flex w-full flex-col justify-center overflow-hidden p-6 sm:p-8 lg:min-h-svh lg:w-1/2 lg:p-14 xl:p-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,#1e103c_0%,transparent_60%)]" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-xl flex-col justify-between gap-6 lg:mx-0">
        <header className="animate-fade-up space-y-8">
          <div className="flex items-center justify-between">
            <Logo to="/login" />
            <span className="hidden font-mono text-[10px] tracking-widest text-gray-600 sm:block">{APP_VERSION}</span>
          </div>

          <div>
            <p className="mb-4 flex items-center gap-2 font-mono text-xs font-bold tracking-[0.2em] text-neon-teal uppercase">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
              </span>
              {AVATARS.length} personas online
            </p>
            <h1 className="font-display text-4xl leading-[1.05] font-bold tracking-tight uppercase md:text-5xl xl:text-6xl">
              <span className="glitch" data-text="Talk to minds">
                Talk to minds
              </span>
              <br />
              <span className="bg-linear-to-r from-neon-pink via-neon-purple to-neon-teal bg-clip-text text-transparent">
                built from neon.
              </span>
            </h1>
          </div>
        </header>

        <div className="hidden grow flex-col items-center justify-center gap-3 sm:flex lg:py-6">
          <NeuralCore mood={mood} lookProgress={lookProgress} />
          <p
            aria-live="polite"
            className={cn('font-mono text-xs tracking-wider transition-colors duration-500', CAPTION_COLORS[mood] ?? 'text-gray-400')}
          >
            &gt; {MOOD_CAPTIONS[mood]}
            <span className="ml-1 inline-block h-3 w-1.5 translate-y-0.5 animate-caret bg-current" />
          </p>
        </div>

        <div className="hidden items-center gap-4 sm:flex">
          <div className="flex -space-x-3">
            {AVATARS.slice(0, PREVIEW_COUNT).map((avatar) => (
              <div key={avatar.id} className="rounded-full bg-void p-0.5" title={avatar.name}>
                <AvatarSigil avatar={avatar} animated={false} className="h-10 w-10" />
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-400">
            {AVATARS.slice(0, 3)
              .map((avatar) => avatar.name)
              .join(', ')}{' '}
            and {AVATARS.length - 3} more are waiting to talk.
          </p>
        </div>
      </div>
    </section>
  );
}

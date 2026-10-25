import { Fingerprint, LockKeyhole, Radar } from 'lucide-react';
import { cn } from '@/lib/cn';
import { MOOD, MOOD_CAPTIONS } from '../constants';
import GeometricCat from './GeometricCat';

const FEATURES = [
  { icon: LockKeyhole, label: '256-bit encryption' },
  { icon: Fingerprint, label: 'Zero-trust identity' },
  { icon: Radar, label: '24/7 monitoring' },
];

const CAPTION_COLORS = {
  [MOOD.ERROR]: 'text-rose-400',
  [MOOD.SUCCESS]: 'text-emerald-400',
};

export default function BrandPanel({ mood, lookProgress }) {
  return (
    <section className="relative z-10 flex w-full flex-col justify-center overflow-hidden p-8 lg:min-h-svh lg:w-1/2 lg:p-16 xl:p-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,#1e103c_0%,transparent_60%)]" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-xl flex-col justify-between gap-8 lg:mx-0">
        <header className="animate-fade-up">
          <p className="mb-4 flex items-center gap-2 font-mono text-xs font-bold tracking-[0.2em] text-neon-teal uppercase md:text-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
            </span>
            Neural Guardian <span className="text-gray-500">//</span> Online
          </p>
          <h1 className="text-4xl leading-[1.1] font-extrabold tracking-tight md:text-5xl lg:text-6xl">
            Secure access.
            <br />
            <span className="bg-linear-to-r from-gray-200 to-gray-500 bg-clip-text text-transparent">
              Watched closely.
            </span>
          </h1>
        </header>

        <div className="flex grow flex-col items-center justify-center gap-4 py-4 lg:py-10">
          <GeometricCat mood={mood} lookProgress={lookProgress} />
          <p
            aria-live="polite"
            className={cn(
              'font-mono text-xs tracking-wider transition-colors duration-500',
              CAPTION_COLORS[mood] ?? 'text-gray-400',
            )}
          >
            &gt; {MOOD_CAPTIONS[mood]}
          </p>
        </div>

        <ul className="hidden flex-wrap gap-3 sm:flex">
          {FEATURES.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-2 rounded-full border border-gray-800/80 bg-night-800/60 px-3.5 py-1.5 text-xs text-gray-400 backdrop-blur-sm"
            >
              <Icon className="h-3.5 w-3.5 text-neon-teal" aria-hidden="true" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

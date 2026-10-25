import { useEffect, useState } from 'react';
import { useMousePosition } from '@/hooks/useMousePosition';
import { cn } from '@/lib/cn';
import { MOOD } from '../constants';

// How far (in SVG units) the pupils can travel from the eye centre.
const PUPIL_RANGE = { x: 18, y: 6 };

const EYE_COLORS = {
  [MOOD.ERROR]: ['#f43f5e', '#fb923c'],
  [MOOD.SUCCESS]: ['#22c55e', '#2dd4bf'],
};
const DEFAULT_EYE_COLORS = ['#a855f7', '#2dd4bf'];

const ACCENT_COLORS = {
  [MOOD.ERROR]: '#f43f5e',
  [MOOD.SUCCESS]: '#22c55e',
};
const DEFAULT_ACCENT = '#2dd4bf';

const AURA_CLASSES = {
  [MOOD.ERROR]: 'bg-rose-500/15',
  [MOOD.SUCCESS]: 'bg-emerald-500/15',
};

const clamp = (value) => Math.max(-1, Math.min(1, value));

// Where the pupils point, in normalised [-1, 1] coordinates.
function getGaze(mood, lookProgress, mouse) {
  switch (mood) {
    case MOOD.TYPING:
      // Glance towards the form and slide along as the username gets longer.
      return { x: -0.4 + lookProgress * 1.4, y: 0.8 };
    case MOOD.PEEKING:
      return { x: 0.9, y: 0.7 };
    case MOOD.LOADING:
      return { x: 0.5, y: -0.9 };
    case MOOD.ERROR:
      return { x: 0, y: 0 };
    default:
      return {
        x: clamp((mouse.x - window.innerWidth / 2) / (window.innerWidth / 2)),
        y: clamp((mouse.y - window.innerHeight / 2) / (window.innerHeight / 2)),
      };
  }
}

// Blinks every few seconds at a slightly random rhythm so it feels alive.
function useRandomBlink() {
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    let timeout;
    const scheduleBlink = () => {
      timeout = setTimeout(() => {
        setIsBlinking(true);
        timeout = setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 160);
      }, 2500 + Math.random() * 3500);
    };

    scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  return isBlinking;
}

function Eye({ side, cx, cy, open, happy, gaze }) {
  const clipId = `cat-eye-clip-${side}`;
  const eyeShape = `${cx - 40},${cy} ${cx},${cy - 15} ${cx + 40},${cy} ${cx},${cy + 15}`;

  return (
    <g>
      <clipPath id={clipId}>
        <polygon points={eyeShape} />
      </clipPath>

      {/* Squashing the eye vertically = closing it */}
      <g
        className="transition-transform duration-150 ease-out"
        style={{ transformOrigin: `${cx}px ${cy}px`, transform: `scaleY(${open ? 1 : 0.06})` }}
      >
        <polygon points={eyeShape} fill="url(#cat-eye-gradient)" />
        <g clipPath={`url(#${clipId})`}>
          <ellipse
            cx={cx}
            cy={cy}
            rx="6"
            ry="14"
            fill="#ffffff"
            className="transition-transform duration-200 ease-out"
            style={{ transform: `translate(${gaze.x * PUPIL_RANGE.x}px, ${gaze.y * PUPIL_RANGE.y}px)` }}
          />
        </g>
      </g>

      {/* Happy "^" eye shown on success */}
      <polyline
        points={`${cx - 28},${cy + 6} ${cx},${cy - 12} ${cx + 28},${cy + 6}`}
        fill="none"
        stroke="url(#cat-eye-gradient)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-opacity duration-300"
        style={{ opacity: happy ? 1 : 0 }}
      />
    </g>
  );
}

export default function GeometricCat({ mood = MOOD.IDLE, lookProgress = 0 }) {
  const mouse = useMousePosition();
  const isBlinking = useRandomBlink();

  const gaze = getGaze(mood, lookProgress, mouse);
  const isHappy = mood === MOOD.SUCCESS;
  const canBlink = mood === MOOD.IDLE || mood === MOOD.TYPING;
  const leftEyeOpen = !isHappy && mood !== MOOD.HIDING && mood !== MOOD.PEEKING && !(canBlink && isBlinking);
  const rightEyeOpen = !isHappy && mood !== MOOD.HIDING && !(canBlink && isBlinking);

  const [eyeStart, eyeEnd] = EYE_COLORS[mood] ?? DEFAULT_EYE_COLORS;
  const accent = ACCENT_COLORS[mood] ?? DEFAULT_ACCENT;

  return (
    <div className="relative flex aspect-square w-full max-w-[240px] animate-float items-center justify-center sm:max-w-[320px] lg:max-w-[400px]">
      {/* Outer glow aura */}
      <div
        className={cn(
          'absolute inset-0 rounded-full blur-[80px] transition-colors duration-500',
          AURA_CLASSES[mood] ?? 'bg-blue-500/10',
        )}
      />

      <svg
        viewBox="0 0 400 400"
        role="img"
        aria-label="Geometric guardian cat"
        className={cn(
          'h-full w-full drop-shadow-[0_0_15px_rgba(45,212,191,0.3)] transition-[color] duration-500',
          mood === MOOD.ERROR && 'animate-shake',
        )}
        style={{ color: accent }}
      >
        <defs>
          <linearGradient id="cat-eye-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={eyeStart} className="transition-[stop-color] duration-500" />
            <stop offset="100%" stopColor={eyeEnd} className="transition-[stop-color] duration-500" />
          </linearGradient>
          <linearGradient id="cat-line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="currentColor" />
          </linearGradient>
        </defs>

        {/* Base head outline */}
        <polygon
          points="200,360 80,320 40,200 60,80 120,120 200,80 280,120 340,80 360,200 320,320"
          fill="#0a0f1a"
          stroke="url(#cat-line-gradient)"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Inner geometric forehead / mask */}
        <g stroke="currentColor" strokeWidth="1" fill="none">
          <polygon points="200,120 140,160 160,200 240,200 260,160" fill="#131a2a" opacity="0.5" />
          <polygon points="200,120 140,160 80,140 120,120" opacity="0.3" />
          <polygon points="200,120 260,160 320,140 280,120" opacity="0.3" />
          <polygon points="80,140 40,200 120,220 140,160" opacity="0.3" />
          <polygon points="320,140 360,200 280,220 260,160" opacity="0.3" />

          {/* Muzzle / lower face */}
          <polygon points="200,280 140,240 80,320 200,360" opacity="0.4" />
          <polygon points="200,280 260,240 320,320 200,360" opacity="0.4" />
        </g>

        {/* Whiskers */}
        <g stroke="currentColor" strokeWidth="1.5" opacity="0.6">
          <line x1="120" y1="260" x2="40" y2="250" />
          <line x1="120" y1="280" x2="50" y2="290" />
          <line x1="280" y1="260" x2="360" y2="250" />
          <line x1="280" y1="280" x2="350" y2="290" />
        </g>

        {/* Nose & mouth */}
        <polygon points="190,260 210,260 200,275" fill="currentColor" />
        <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="200" y1="275" x2="200" y2="290" />
          <line x1="200" y1="290" x2="185" y2="300" />
          <line x1="200" y1="290" x2="215" y2="300" />
        </g>

        {/* Security badge / collar core */}
        <polygon points="200,350 170,310 230,310" fill="#0d1424" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="200" cy="325" r="4" fill="currentColor" className="animate-pulse" />

        <Eye side="left" cx={140} cy={210} open={leftEyeOpen} happy={isHappy} gaze={gaze} />
        <Eye side="right" cx={260} cy={210} open={rightEyeOpen} happy={isHappy} gaze={gaze} />

        {/* Scanner beam while verifying */}
        {mood === MOOD.LOADING && (
          <line
            x1="50"
            y1="90"
            x2="350"
            y2="90"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="animate-scan drop-shadow-[0_0_6px_currentColor]"
          />
        )}
      </svg>
    </div>
  );
}

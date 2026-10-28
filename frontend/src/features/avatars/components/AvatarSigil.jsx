import { useId } from 'react';
import { cn } from '@/lib/cn';

const polygonPoints = (sides, radius, rotation = -Math.PI / 2) =>
  Array.from({ length: sides }, (_, i) => {
    const angle = rotation + (i / sides) * Math.PI * 2;
    return `${50 + Math.cos(angle) * radius},${50 + Math.sin(angle) * radius}`;
  }).join(' ');

// Generative emblem for an avatar: its own polygon, colours and initial, with slowly turning rings.
export default function AvatarSigil({ avatar, animated = true, className }) {
  const gradientId = `sigil-${avatar.id}-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const [primary, secondary] = avatar.colors;
  const spinClass = (name) => (animated ? `${name} origin-center [transform-box:fill-box]` : undefined);

  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={cn('overflow-visible', className)}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={primary} />
          <stop offset="100%" stopColor={secondary} />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="47" fill="none" stroke={primary} strokeOpacity="0.35" strokeWidth="1" strokeDasharray="2 5" className={spinClass('animate-spin-slow')} />

      <g className={spinClass('animate-spin-reverse')}>
        <circle cx="50" cy="50" r="41" fill="none" stroke={secondary} strokeOpacity="0.2" strokeWidth="0.8" />
        <circle cx="50" cy="9" r="2" fill={secondary} />
      </g>

      <polygon points={polygonPoints(avatar.sides, 34)} fill="#0a0d14" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinejoin="round" />
      <polygon
        points={polygonPoints(avatar.sides, 22, -Math.PI / 2 + Math.PI / avatar.sides)}
        fill={`url(#${gradientId})`}
        fillOpacity="0.18"
        stroke={`url(#${gradientId})`}
        strokeOpacity="0.6"
        strokeWidth="1"
        className={spinClass('animate-spin-slow')}
      />

      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        fill={`url(#${gradientId})`}
        className="font-display text-[22px] font-bold"
      >
        {avatar.name[0]}
      </text>
    </svg>
  );
}

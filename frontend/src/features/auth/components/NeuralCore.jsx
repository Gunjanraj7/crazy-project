import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';
import { MOOD } from '../constants';

// Visual "personality" of the core for each mood. Values are eased towards every frame,
// so switching moods morphs smoothly instead of snapping.
//   spin   – rotation speed (radians / second)
//   scale  – sphere size (hiding collapses it into a tight shielded ball)
//   noise  – how much the surface ripples (error = glitchy)
//   shield – opacity of the hexagonal shell drawn around it
//   scan   – opacity of the scanning beam
const MOOD_STYLES = {
  [MOOD.IDLE]: { colors: ['#a855f7', '#2dd4bf'], spin: 0.25, scale: 1, noise: 0.05, shield: 0, scan: 0 },
  [MOOD.TYPING]: { colors: ['#2dd4bf', '#38bdf8'], spin: 0.5, scale: 1.02, noise: 0.08, shield: 0, scan: 0 },
  [MOOD.HIDING]: { colors: ['#a855f7', '#ff2bd6'], spin: 0.12, scale: 0.6, noise: 0.02, shield: 1, scan: 0 },
  [MOOD.PEEKING]: { colors: ['#ff2bd6', '#fcee0a'], spin: 0.3, scale: 0.8, noise: 0.06, shield: 0.4, scan: 0 },
  [MOOD.LOADING]: { colors: ['#38bdf8', '#2dd4bf'], spin: 2.4, scale: 0.92, noise: 0.14, shield: 0, scan: 1 },
  [MOOD.ERROR]: { colors: ['#f43f5e', '#fb923c'], spin: 0.9, scale: 1, noise: 0.3, shield: 0, scan: 0 },
  [MOOD.SUCCESS]: { colors: ['#22c55e', '#2dd4bf'], spin: 0.6, scale: 1.15, noise: 0.02, shield: 0, scan: 0 },
};

const AURA_CLASSES = {
  [MOOD.ERROR]: 'bg-rose-500/20',
  [MOOD.SUCCESS]: 'bg-emerald-500/20',
  [MOOD.HIDING]: 'bg-fuchsia-500/15',
  [MOOD.PEEKING]: 'bg-pink-500/15',
};

const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const lerp = (a, b, t) => a + (b - a) * t;
const rgba = ([r, g, b], a) => `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${a})`;
const mixRgb = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));

const normalize = ([x, y, z]) => {
  const len = Math.hypot(x, y, z);
  return [x / len, y / len, z / len];
};

// Icosahedron subdivided once: 42 points, 120 edges. Reads as "3D" without being too busy.
function buildGeodesicSphere() {
  const t = (1 + Math.sqrt(5)) / 2;
  const vertices = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ].map(normalize);
  const faces = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];

  const midpoints = new Map();
  const midpoint = (a, b) => {
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (!midpoints.has(key)) {
      const [va, vb] = [vertices[a], vertices[b]];
      vertices.push(normalize([(va[0] + vb[0]) / 2, (va[1] + vb[1]) / 2, (va[2] + vb[2]) / 2]));
      midpoints.set(key, vertices.length - 1);
    }
    return midpoints.get(key);
  };

  const edges = new Set();
  const addEdge = (a, b) => edges.add(a < b ? `${a}-${b}` : `${b}-${a}`);
  for (const [a, b, c] of faces) {
    const ab = midpoint(a, b);
    const bc = midpoint(b, c);
    const ca = midpoint(c, a);
    for (const [p, q, r] of [[a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]]) {
      addEdge(p, q);
      addEdge(q, r);
      addEdge(r, p);
    }
  }

  return { vertices, edges: [...edges].map((key) => key.split('-').map(Number)) };
}

const SPHERE = buildGeodesicSphere();

// Animated wireframe "neural core" drawn on a canvas. Reacts to the login form through `mood`.
export default function NeuralCore({ mood = MOOD.IDLE, lookProgress = 0 }) {
  const canvasRef = useRef(null);
  const inputRef = useRef({ mood, lookProgress });

  useEffect(() => {
    inputRef.current = { mood, lookProgress };
  }, [mood, lookProgress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pointer = { x: 0, y: 0 };

    const initial = MOOD_STYLES[MOOD.IDLE];
    const state = {
      colorA: hexToRgb(initial.colors[0]),
      colorB: hexToRgb(initial.colors[1]),
      spin: initial.spin,
      scale: initial.scale,
      noise: initial.noise,
      shield: 0,
      scan: 0,
      tiltX: 0,
      tiltY: 0,
      rotation: 0,
    };

    let width = 0;
    let height = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const handlePointerMove = (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', handlePointerMove);

    let frame = 0;
    let last = performance.now();

    const draw = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      // Hidden (e.g. on small screens): nothing to draw, and drawImage would throw on a 0×0 canvas.
      if (!width || !height) {
        frame = requestAnimationFrame(draw);
        return;
      }
      const time = now / 1000;
      const { mood: currentMood, lookProgress: progress } = inputRef.current;
      const target = MOOD_STYLES[currentMood] ?? MOOD_STYLES[MOOD.IDLE];

      // Ease every property towards the current mood.
      const ease = 1 - Math.pow(0.002, dt);
      state.colorA = mixRgb(state.colorA, hexToRgb(target.colors[0]), ease);
      state.colorB = mixRgb(state.colorB, hexToRgb(target.colors[1]), ease);
      const targetSpin = (target.spin + (currentMood === MOOD.TYPING ? progress * 1.5 : 0)) * (reducedMotion ? 0.3 : 1);
      state.spin = lerp(state.spin, targetSpin, ease);
      state.scale = lerp(state.scale, target.scale, ease);
      state.noise = lerp(state.noise, reducedMotion ? Math.min(target.noise, 0.05) : target.noise, ease);
      state.shield = lerp(state.shield, target.shield, ease);
      state.scan = lerp(state.scan, target.scan, ease);

      // Idle: lean towards the cursor. Typing: lean towards the form on the right.
      const lookAtForm = currentMood === MOOD.TYPING;
      state.tiltX = lerp(state.tiltX, lookAtForm ? 0.35 : pointer.y * 0.5, ease * 0.6);
      state.tiltY = lerp(state.tiltY, lookAtForm ? -0.4 + progress * 0.9 : pointer.x * 0.7, ease * 0.6);
      state.rotation += state.spin * dt;

      ctx.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;
      const pulse = 1 + Math.sin(time * 2) * 0.015;
      const radius = Math.min(width, height) * 0.3 * state.scale * pulse;

      // Inner glow
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.1);
      glow.addColorStop(0, rgba(state.colorA, 0.35));
      glow.addColorStop(0.5, rgba(state.colorB, 0.08));
      glow.addColorStop(1, rgba(state.colorB, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      // Project the sphere
      const rotY = state.rotation + state.tiltY;
      const rotX = 0.35 + state.tiltX;
      const [sinY, cosY, sinX, cosX] = [Math.sin(rotY), Math.cos(rotY), Math.sin(rotX), Math.cos(rotX)];
      const projected = SPHERE.vertices.map(([x, y, z], i) => {
        const ripple = 1 + state.noise * Math.sin(x * 4 + time * 2.2 + i) * Math.cos(y * 3 + time * 1.7);
        let [px, py, pz] = [x * ripple, y * ripple, z * ripple];
        [px, pz] = [px * cosY - pz * sinY, px * sinY + pz * cosY];
        [py, pz] = [py * cosX - pz * sinX, py * sinX + pz * cosX];
        const perspective = 3 / (3 + pz);
        return { x: cx + px * radius * perspective, y: cy + py * radius * perspective, depth: (1 - pz) / 2, height: (py + 1) / 2 };
      });

      ctx.globalCompositeOperation = 'lighter';
      ctx.lineWidth = 1;
      for (const [a, b] of SPHERE.edges) {
        const [p, q] = [projected[a], projected[b]];
        const depth = (p.depth + q.depth) / 2;
        ctx.strokeStyle = rgba(mixRgb(state.colorA, state.colorB, (p.height + q.height) / 2), 0.08 + depth * 0.55);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      }
      for (const p of projected) {
        ctx.fillStyle = rgba(mixRgb(state.colorA, state.colorB, p.height), 0.25 + p.depth * 0.75);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 0.8 + p.depth * 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Orbit rings with travelling data packets
      for (let ring = 0; ring < 2; ring++) {
        const ringRadius = radius * (1.38 + ring * 0.2);
        const tilt = ring === 0 ? 0.28 : -0.22;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(tilt + state.tiltY * 0.2);
        ctx.strokeStyle = rgba(ring ? state.colorA : state.colorB, 0.18);
        ctx.setLineDash(ring ? [2, 6] : []);
        ctx.beginPath();
        ctx.ellipse(0, 0, ringRadius, ringRadius * 0.28, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        for (let k = 0; k < 3; k++) {
          const angle = time * (0.6 + state.spin * 0.4) * (ring ? -1 : 1) + (k * Math.PI * 2) / 3;
          ctx.fillStyle = rgba(ring ? state.colorA : state.colorB, 0.9);
          ctx.beginPath();
          ctx.arc(Math.cos(angle) * ringRadius, Math.sin(angle) * ringRadius * 0.28, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Hexagonal shield (password hidden)
      if (state.shield > 0.01) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(time * 0.3);
        const shieldRadius = Math.min(width, height) * 0.36;
        for (const [r, alpha] of [[shieldRadius, 0.6], [shieldRadius * 0.86, 0.25]]) {
          ctx.strokeStyle = rgba(state.colorB, alpha * state.shield);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          for (let i = 0; i <= 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
          }
          ctx.stroke();
        }
        ctx.restore();
      }

      // Scanning beam (verifying)
      if (state.scan > 0.01) {
        const beamY = cy + Math.sin(time * 3) * radius * 1.1;
        const beam = ctx.createLinearGradient(cx - radius * 1.5, 0, cx + radius * 1.5, 0);
        beam.addColorStop(0, rgba(state.colorB, 0));
        beam.addColorStop(0.5, rgba(state.colorB, 0.9 * state.scan));
        beam.addColorStop(1, rgba(state.colorB, 0));
        ctx.fillStyle = beam;
        ctx.fillRect(cx - radius * 1.5, beamY - 1, radius * 3, 2);
      }
      ctx.globalCompositeOperation = 'source-over';

      // Glitch: shift random horizontal slices sideways when the surface is very unstable.
      if (state.noise > 0.2 && Math.random() < 0.35) {
        for (let i = 0; i < 3; i++) {
          const sliceY = Math.random() * height;
          const sliceHeight = 4 + Math.random() * 14;
          const offset = (Math.random() - 0.5) * 24;
          ctx.drawImage(canvas, 0, sliceY * (canvas.height / height), canvas.width, sliceHeight * (canvas.height / height), offset, sliceY, width, sliceHeight);
        }
      }

      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  return (
    <div className="relative flex aspect-square w-full max-w-[260px] animate-float items-center justify-center sm:max-w-[340px] lg:max-w-[420px]">
      <div
        className={cn(
          'absolute inset-[15%] rounded-full blur-[70px] transition-colors duration-700',
          AURA_CLASSES[mood] ?? 'bg-purple-600/15',
        )}
      />
      {/* HUD crosshair corners */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-[6%]">
        <span className="absolute top-0 left-0 h-5 w-5 border-t border-l border-white/15" />
        <span className="absolute top-0 right-0 h-5 w-5 border-t border-r border-white/15" />
        <span className="absolute bottom-0 left-0 h-5 w-5 border-b border-l border-white/15" />
        <span className="absolute right-0 bottom-0 h-5 w-5 border-r border-b border-white/15" />
      </div>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Animated neural core that reacts to the form"
        className={cn('relative h-full w-full', mood === MOOD.ERROR && 'animate-shake')}
      />
    </div>
  );
}

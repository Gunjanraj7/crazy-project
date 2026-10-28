# PERSONA//OS (frontend)

A cyberpunk AI-avatar chat app. Sign in, pick one of eight personas, and chat. Each avatar has its own personality, colours, sigil and way of replying.

React 19 + Vite + Tailwind CSS v4 + React Router 7.

## Highlights

- **Neural core**: a canvas-rendered 3D geodesic sphere on the auth screens that reacts to the form. It leans towards your cursor, spins faster as you type, raises a hex shield while you enter a password, glitches red on errors and blooms green on success.
- **8 avatars** (NOVA, VEX, SAGE-9, BYTE, ECHO, RONIN, GLITCH, CIPHER), each with a generated SVG sigil and an in-character reply bank.
- **Chat**: typewriter replies, typing indicator, suggested prompts, history saved per avatar.
- **Pages**: login, sign up (with password strength meter), forgot password, dashboard (filter + search avatars, stats, recent chats), chat, profile/settings, 404.
- **Settings that work**: typewriter replies, CRT scanlines and cursor glow can each be toggled; the profile is editable and the password can be changed.

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build into dist/
npm run lint
```

Demo account: **demo** / **cyber2077** (or press *Autofill*). You can also create your own account.

> There is no backend yet. Accounts, sessions and chats live in `localStorage`, which is fine for a portfolio demo but not secure for real users.

## Connecting a real AI

Avatar replies come from `src/features/chat/services/chatService.js`. Today it uses the offline persona engine (`utils/personaEngine.js`).
To use a language model, call your own backend from `getAvatarReply` and pass `avatar.persona` as the system prompt. Keep API keys on the server, never in this frontend.

Auth works the same way: replace the bodies in `src/features/auth/services/authService.js` with API calls. Components only rely on the functions resolving with data or throwing an `Error` with a readable message.

## Deploying

This is a single-page app using browser routing, so the host must serve `index.html` for unknown paths (e.g. Netlify `_redirects`: `/* /index.html 200`, or Vercel rewrites).

## Project structure

```
src/
├── main.jsx                  # entry point
├── App.jsx                   # routes: auth pages, protected app pages, 404
├── config/app.js             # app name, tagline, version
├── layouts/AppLayout.jsx     # sidebar (desktop) / top bar + tab bar (mobile)
├── pages/                    # Dashboard, Chat, Profile, NotFound
├── features/
│   ├── auth/                 # AuthProvider + useAuth, route guards, forms, NeuralCore, mock authService
│   ├── avatars/              # avatar data (personas + reply banks), AvatarSigil, AvatarCard
│   └── chat/                 # ChatRoom UI, useChat, typewriter, persona engine, chat storage
├── components/
│   ├── ui/                   # Button, InputField, Checkbox, Toggle, Alert, Panel, Logo, HexInitials
│   ├── effects/              # AnimatedBackground, CursorGlow, GlobalEffects
│   └── icons/                # brand SVGs (Google, GitHub)
├── hooks/                    # useMousePosition, useDocumentTitle
├── lib/                      # cn, time formatting
└── styles/globals.css        # design tokens (@theme), keyframes, glitch / scanline / chamfer utilities
```

Imports use the `@` alias for `src/`, e.g. `import Button from '@/components/ui/Button'`.

**Adding an avatar:** add an entry to `src/features/avatars/data/avatars.js`. The dashboard, sigil, chat and sidebar pick it up automatically.

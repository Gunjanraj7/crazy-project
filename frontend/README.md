# PERSONA//OS (frontend)

A cyberpunk AI-avatar chat app. Sign in, pick one of eight personas, and chat. Each avatar has its own personality, colours, sigil and way of replying.

React 19 + Vite + Tailwind CSS v4 + React Router 7.

## Highlights

- **Neural core**: a canvas-rendered 3D geodesic sphere on the auth screens that reacts to the form. It leans towards your cursor, spins faster as you type, raises a hex shield while you enter a password, glitches red on errors and blooms green on success.
- **8 avatars** (NOVA, VEX, SAGE-9, BYTE, ECHO, RONIN, GLITCH, CIPHER), each with a generated SVG sigil and an in-character reply bank.
- **Chat**: typewriter replies, typing indicator, suggested prompts, history saved per avatar.
- **Real accounts**: sign up, login, sessions, profile and password changes are handled by the FastAPI + PostgreSQL backend in `../backend`.
- **Pages**: login, sign up (with password strength meter), forgot / reset password, dashboard (filter + search avatars, stats, recent chats), chat, profile/settings, 404.
- **Settings that work**: typewriter replies, CRT scanlines and cursor glow can each be toggled; the profile is editable and the password can be changed.

## Getting started

The app needs the backend running too (see `../backend/README.md` for its one-time setup). Use two terminals:

```powershell
# Terminal 1: API on http://localhost:8000
cd "D:\crazy project FR\backend"
.venv\Scripts\uvicorn app.main:app --reload

# Terminal 2: app on http://localhost:5173
cd "D:\crazy project FR\frontend"
npm install      # first time only
npm run dev
```

Other scripts: `npm run build` (production build into `dist/`), `npm run lint`.

Demo account: **demo** / **cyber2077** (or press *Autofill*). You can also create your own account.

During development Vite forwards every `/api/*` request to the backend (`server.proxy` in `vite.config.js`), so the browser sees a single origin and the `HttpOnly` session cookie just works.

> Chat history still lives in the browser's `localStorage`; moving it to the database is the next step.

## Connecting a real AI

Avatar replies come from `src/features/chat/services/chatService.js`. Today it uses the offline persona engine (`utils/personaEngine.js`).
To use a language model, call your own backend from `getAvatarReply` and pass `avatar.persona` as the system prompt. Keep API keys on the server, never in this frontend.

Auth goes through `src/features/auth/services/authService.js`, a small `fetch` client for the backend. Its functions resolve with data or throw an `ApiError` with a readable `message` and per-field `fieldErrors`, which the forms show under the matching inputs.

## Deploying

This is a single-page app using browser routing, so the host must serve `index.html` for unknown paths (e.g. Netlify `_redirects`: `/* /index.html 200`, or Vercel rewrites). It also needs `/api` routed to the backend, ideally on the same domain; see "Before deploying" in `../backend/README.md`.

## Project structure

```
src/
├── main.jsx                  # entry point
├── App.jsx                   # routes: auth pages, protected app pages, 404
├── config/app.js             # app name, tagline, version
├── layouts/AppLayout.jsx     # sidebar (desktop) / top bar + tab bar (mobile)
├── pages/                    # Dashboard, Chat, Profile, NotFound
├── features/
│   ├── auth/                 # AuthProvider + useAuth, route guards, forms, NeuralCore, API client (authService)
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

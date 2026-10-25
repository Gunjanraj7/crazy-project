# Neural Guardian — Login (frontend)

React 19 + Vite + Tailwind CSS v4 login page with an animated geometric "guardian" cat that reacts to what you do in the form.

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build into dist/
npm run lint
```

Demo account: **admin** / **guardian123** (or press *Autofill* on the page).
Authentication is mocked in `src/features/auth/services/authService.js`. Swap `login()` for a real API call when a backend is ready.

## Project structure

```
src/
├── main.jsx                  # entry point: mounts <App />, loads global styles
├── App.jsx                   # app shell (add a router here when there are more pages)
├── pages/
│   └── LoginPage.jsx         # composes the login screen from feature + shared components
├── features/
│   └── auth/                 # everything specific to logging in
│       ├── index.js          # public exports of the feature
│       ├── constants.js      # cat moods + captions
│       ├── components/       # BrandPanel, GeometricCat, AuthCard, LoginForm, SocialLogin, LoginSuccess
│       ├── services/         # authService (mock login, "remember me" storage)
│       └── utils/            # validateLogin
├── components/               # reusable, feature-agnostic UI
│   ├── ui/                   # Button, InputField, Checkbox, Alert
│   ├── effects/              # CursorGlow, AnimatedBackground
│   └── icons/                # brand SVGs (Google, GitHub)
├── hooks/                    # useMousePosition
├── lib/                      # small helpers (cn)
└── styles/
    └── globals.css           # Tailwind import, design tokens (@theme), keyframes
```

Imports use the `@` alias for `src/` (configured in `vite.config.js` and `jsconfig.json`), e.g. `import Button from '@/components/ui/Button'`.

**Rule of thumb:** if something is only used by one feature, it lives inside that feature's folder. Once a second feature needs it, move it to `components/`, `hooks/` or `lib/`.

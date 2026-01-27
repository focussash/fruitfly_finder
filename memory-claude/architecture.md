# Fruitfly Finder - Architecture & Progress

## Project Structure

```
Fruitfly_finder/
├── memory-claude/           # Planning & documentation
│   ├── CLAUDE.md           # Project rules
│   ├── app-design.md       # Feature specifications
│   ├── architecture.md     # This file - progress tracking
│   └── implementation-plan.md
│
├── src/
│   ├── components/         # React components
│   │   ├── game/          # Game-specific components
│   │   │   ├── GameCanvas.tsx
│   │   │   ├── Fly.tsx
│   │   │   ├── Timer.tsx
│   │   │   └── ScoreDisplay.tsx
│   │   ├── ui/            # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Settings.tsx
│   │   └── layout/        # Layout components
│   │       ├── Header.tsx
│   │       └── GameScreen.tsx
│   │
│   ├── hooks/             # Custom React hooks
│   │   ├── useGameState.ts
│   │   ├── useTimer.ts
│   │   ├── useSettings.ts
│   │   └── useMultiplayer.ts
│   │
│   ├── services/          # External services
│   │   ├── gemini.ts      # Gemini API integration
│   │   ├── socket.ts      # Socket.io client
│   │   └── storage.ts     # localStorage wrapper
│   │
│   ├── types/             # TypeScript types
│   │   ├── game.ts
│   │   └── api.ts
│   │
│   ├── utils/             # Utility functions
│   │   ├── flyPlacement.ts
│   │   ├── scoring.ts
│   │   └── difficulty.ts
│   │
│   ├── assets/            # Static assets
│   │   ├── sprites/       # Fly sprites
│   │   ├── sounds/        # Audio files
│   │   └── animations/    # Animation assets
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── server/                # Backend (if needed)
│   ├── index.ts          # Express + Socket.io server
│   ├── routes/
│   └── services/
│
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Frontend Framework | React 18 |
| Build Tool | Vite |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion / CSS Animations |
| State Management | React Context + useReducer |
| Multiplayer | Socket.io |
| Image Generation | Gemini Pro API |
| Hosting | Vercel / Netlify |

---

## Core Data Types

```typescript
interface Fly {
  id: string;
  x: number;          // percentage position (0-100)
  y: number;          // percentage position (0-100)
  size: number;       // scale factor
  found: boolean;
  escaped: boolean;
}

interface Level {
  id: string;
  imageUrl: string;
  flies: Fly[];
  theme: 'kitchen' | 'garden' | 'fantasy' | 'retro';
  difficulty: number;
  timeLimit: number;
}

interface GameState {
  currentLevel: Level | null;
  score: number;
  streak: number;
  misclicks: number;
  timeRemaining: number;
  status: 'idle' | 'playing' | 'paused' | 'won' | 'lost';
}

interface Settings {
  catchAnimation: 'cute' | 'wild';
  soundEnabled: boolean;
  musicEnabled: boolean;
  casualMode: boolean;  // extended timer
}
```

---

## Progress Log

### Completed Steps
*(Updated after each implementation step)*

- [x] Step 1: Project setup
- [ ] Step 2: Core game canvas
- [ ] Step 3: Fly component & click detection
- [ ] Step 4: Timer system
- [ ] Step 5: Scoring system
- [ ] Step 6: Catch animations (cute/wild toggle)
- [ ] Step 7: Escape animation
- [ ] Step 8: Settings & persistence
- [ ] Step 9: Level generation (static)
- [ ] Step 10: Gemini integration
- [ ] Step 11: Difficulty progression
- [ ] Step 12: Game modes (campaign/endless)
- [ ] Step 13: Multiplayer foundation
- [ ] Step 14: Polish & sounds
- [ ] Step 15: Final testing

---

## Step 1 Validation Results (2026-01-26)

| Test | Result | Evidence |
|------|--------|----------|
| Dev server runs | PASS | Server running on http://localhost:5174 |
| Tailwind works | PASS | Blue test box with hover effect renders correctly |
| TypeScript compiles | PASS | `npm run build` succeeded (31 modules, built in 2.17s) |
| Folder structure | PASS | All 23 TypeScript files created in correct locations |

### Files Created
- `src/types/game.ts`, `src/types/api.ts` - Core type definitions
- `src/components/game/*` - GameCanvas, Fly, Timer, ScoreDisplay (placeholders)
- `src/components/ui/*` - Button, Modal, Settings
- `src/components/layout/*` - Header, GameScreen
- `src/hooks/*` - useGameState, useTimer, useSettings, useMultiplayer
- `src/services/*` - gemini, socket, storage
- `src/utils/*` - flyPlacement, scoring, difficulty
- `server/index.ts` - Express + Socket.io server placeholder

---

## Notes & Decisions

### Step 1 Notes
- Used Vite 7.3.1 with React-TS template
- Tailwind CSS 4.x with @tailwindcss/vite plugin (no tailwind.config.js needed)
- All placeholder files have TODO comments referencing their implementation step
- Unused parameters prefixed with `_` to satisfy TypeScript strict mode

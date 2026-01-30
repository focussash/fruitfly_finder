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
- [x] Step 2: Core game canvas
- [x] Step 3: Fly component & click detection
- [x] Step 4: Timer system
- [x] Step 5: Scoring system
- [x] Step 6: Catch animations (cute/wild toggle)
- [x] Step 7: Escape animation
- [x] Step 8: Game state management
- [x] Step 9: Level system (static)
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

## Step 2 Validation Results (2026-01-27)

| Test | Result | Evidence |
|------|--------|----------|
| Image displays responsively | PASS | Image scales with browser window, maintains aspect ratio |
| Click detection works | PASS | Debug overlay shows click coordinates |
| Coordinates are percentages | PASS | Corner clicks show ~0,0 and ~100,100 |
| Aspect ratio maintained | PASS | Using `object-fit: contain`, letterboxing works correctly |
| No scrolling | PASS | Fixed with `h-screen` + `overflow-hidden` |

### Files Modified
- `src/components/game/GameCanvas.tsx` - Full implementation with:
  - Responsive image display using `object-fit: contain`
  - Click handler with percentage coordinate calculation
  - Letterbox-aware click detection (accounts for empty space around image)
  - Debug overlay showing coordinates and visual crosshair
- `src/App.tsx` - Updated to use GameCanvas with debug mode, viewport-constrained layout

### Technical Notes
- Click coordinates correctly account for `object-fit: contain` letterboxing
- Uses `getBoundingClientRect()` to calculate actual rendered image area
- Coordinates clamped to 0-100 range
- Clicks outside actual image content are ignored

---

## Step 3 Validation Results (2026-01-27)

| Test | Result | Evidence |
|------|--------|----------|
| Flies render at positions | PASS | 5 test flies render at specified percentage positions |
| Click on fly = found | PASS | Fly fades to 30% opacity, shows checkmark, pointer-events disabled |
| Click off fly = miss | PASS | Console logs miss, misclick counter increments |
| Multiple flies independent | PASS | Each fly tracks its own found state |
| Hit detection accuracy | PASS | Flies have hover scale effect, clicks register correctly |

### Files Modified
- `src/components/game/Fly.tsx` - Full implementation with:
  - SVG fly sprite (body, head, eyes, wings, legs)
  - Percentage-based positioning with `transform: translate(-50%, -50%)` for centering
  - Visual feedback: opacity change, grayscale, checkmark on found
  - Hover effect (scale 110%) for unfound flies
  - `stopPropagation()` to prevent bubbling to canvas miss handler
  - Debug mode showing coordinates under each fly
- `src/components/game/GameCanvas.tsx` - Updated to:
  - Accept `flies` array and `onFlyClick`/`onMiss` callbacks
  - Render fly container positioned to match actual image area
  - Track image layout for accurate fly positioning over letterboxed images
- `src/App.tsx` - Test harness with 5 sample flies, found counter, misclick counter, reset button

### Technical Notes
- Fly container is absolutely positioned to match the rendered image area (accounting for letterboxing)
- Flies use `pointer-events-auto` inside a `pointer-events-none` container for proper click handling
- Fly clicks use `stopPropagation()` so canvas miss handler doesn't fire

---

## Step 4 Validation Results (2026-01-27)

| Test | Result | Evidence |
|------|--------|----------|
| Timer counts down | PASS | Timer decrements every second when running |
| Timer accuracy | PASS | Uses setInterval(1000ms), matches real time |
| Pause/resume works | PASS | Pause button stops timer, Resume continues |
| Urgency styling | PASS | Timer turns orange and pulses at ≤5 seconds |
| Time-up event fires | PASS | onTimeUp callback triggers, game shows "Time's Up!" |

### Files Modified
- `src/hooks/useTimer.ts` - Full implementation with:
  - `time`, `isRunning` state
  - `start()`, `pause()`, `reset(newTime?)` functions
  - `onTimeUp` callback when timer reaches 0
  - Proper cleanup on unmount
  - Refs to avoid stale closures in interval
- `src/components/game/Timer.tsx` - Circular timer display with:
  - SVG circular progress indicator
  - Color changes: green → orange (urgent) → red (expired)
  - Pulse animation when urgent
  - "paused" and "TIME UP" status labels
  - Time formatting (supports MM:SS for >60s)
- `src/App.tsx` - Integrated timer with game flow:
  - Start/Pause/Reset controls
  - Win condition (all flies found)
  - Lose condition (time expires)
  - Status overlays for won/lost states

### Technical Notes
- Timer uses `window.setInterval` with 1000ms interval
- Uses refs (`timeRef`, `onTimeUpRef`) to avoid stale closure issues
- Urgency threshold configurable (default 5 seconds)
- Timer component is purely presentational (receives props from hook)

---

## Step 5 Validation Results (2026-01-27)

| Test | Result | Evidence |
|------|--------|----------|
| Base points (100) | PASS | Each fly awards 100 base points |
| Time bonus (+10/sec) | PASS | With 20s remaining: 100 + 200 = 300 points |
| Streak multiplier (1.5x) | PASS | 2nd+ consecutive find shows yellow "x1.5 streak!" |
| Accuracy bonus (+50) | PASS | Win with 0 misclicks shows "+50 accuracy bonus!" |
| Misclick tracking | PASS | Misclicks reset streak, disqualify accuracy bonus |
| Escape penalty (-50) | PASS | Unfound flies show -50 floating down when time expires |

### Files Modified
- `src/utils/scoring.ts` - Full implementation with:
  - `calculateFindScore(timeRemaining, streak)` → ScoreBreakdown
  - `calculateAccuracyBonus(misclicks)` → 50 or 0
  - `getEscapePenalty()` → -50
  - Constants: BASE_POINTS=100, TIME_BONUS_PER_SECOND=10, STREAK_MULTIPLIER=1.5
- `src/components/game/ScoreDisplay.tsx` - Score UI with:
  - Main score display with streak indicator (shows "2x Streak!" badge)
  - Floating score popup at fly position showing breakdown
  - PenaltyPopup component for escape penalties
- `src/index.css` - Added keyframe animations:
  - `float-up` for score popups (rises and fades)
  - `float-down` for penalty popups (drops and fades)
- `src/App.tsx` - Integrated scoring:
  - Tracks score, streak, misclicks state
  - Score popups appear at fly position with breakdown
  - Streak resets on misclick
  - Accuracy bonus awarded on win with 0 misclicks
  - Staggered escape penalties on time-up

### Technical Notes
- Streak starts at 0, increments on find, resets on miss
- Streak multiplier applies when streak >= 2 (i.e., 2nd consecutive find)
- Score popups auto-remove after 1.5s animation
- Escape penalties staggered by 300ms for visual effect

---

## Step 6 Validation Results (2026-01-27)

| Test | Result | Evidence |
|------|--------|----------|
| Settings persist | PASS | Toggle animation style, refresh page, setting preserved |
| Cute animation plays | PASS | Pink burst, sparkle stars, floating hearts |
| Wild animation plays | PASS | Hand emoji swoops in, green splat, "SPLAT!" text |
| Toggle mid-game | PASS | Can change setting during gameplay, next catch uses new style |
| Animations non-blocking | PASS | Can rapidly click flies, animations don't freeze game |

### Files Created/Modified
- `src/hooks/useSettings.ts` - Full implementation with:
  - localStorage persistence (key: 'fruitfly-finder-settings')
  - `settings`, `updateSetting(key, value)`, `resetSettings()` functions
  - Loads saved settings on mount, saves on every change
- `src/components/ui/Settings.tsx` - Settings panel with:
  - Cute/Wild animation toggle buttons with visual feedback
  - Sound/Music/Casual Mode toggle switches
  - Modal overlay with close button
- `src/components/game/CatchAnimation.tsx` - Animation components:
  - `CuteAnimation`: Pink pop burst, 8 sparkle stars radiating out, floating hearts
  - `WildAnimation`: Hand emoji swooping, green splat effect, splat drops, "SPLAT!" impact text
- `src/index.css` - Added keyframe animations:
  - Cute: `pop`, `sparkle-out`, `float-heart`
  - Wild: `hand-swoop`, `splat`, `splat-drop`, `impact-text`
- `src/App.tsx` - Integrated settings and animations:
  - Settings button (gear icon) opens modal
  - Catch animations triggered at fly position on find
  - Casual mode support (60s timer instead of 30s)

### Technical Notes
- Animations use CSS keyframes with custom properties for angle/distance
- Each animation auto-removes after 800ms via onComplete callback
- Settings modal overlays game with semi-transparent backdrop
- Casual mode doubles timer from 30s to 60s
- **Bug fix**: Animations now render inside GameCanvas children prop for correct positioning relative to image area (accounts for letterboxing)
- All overlays (score popups, catch animations, penalty popups) use absolute positioning within the image-area container

---

## Step 7 Validation Results (2026-01-27)

| Test | Result | Evidence |
|------|--------|----------|
| Escape animation triggers | PASS | Unfound flies buzz and fly off when timer expires |
| Only unfound flies escape | PASS | Found flies stay visible (faded), unfound escape |
| Staggered timing | PASS | 400ms delay between each fly starting escape |
| Penalty points shown | PASS | -50 penalty popup appears when fly finishes escaping |
| Game state changes | PASS | "Time's Up!" banner shows after timer expires |

### Files Modified
- `src/components/game/Fly.tsx` - Added escape animation support:
  - `escaped` and `escapeDelay` props
  - Three-phase animation: idle → buzzing (500ms) → flying (600ms) → gone
  - Buzz animation with rapid shaking
  - Fly-off animation towards nearest edge with rotation
  - "Escaping!" text indicator during buzz phase
  - `onEscapeComplete` callback when animation finishes
- `src/components/game/GameCanvas.tsx` - Added escape props:
  - `escapeDelays` record for staggered timing
  - `onFlyEscapeComplete` callback
- `src/index.css` - Added escape animations:
  - `buzz` - rapid position/rotation shake
  - `wing-left` / `wing-right` - fast wing flapping (50ms cycle)
- `src/App.tsx` - Integrated escape flow:
  - Staggered delays (400ms apart) for each escaping fly
  - Penalty shown when escape animation completes (not immediately)
  - Escaped count shown in stats

### Technical Notes
- Escape animation is a three-phase state machine: idle → buzzing → flying → gone
- Wings animate independently with transform-origin set for realistic flapping
- Fly direction calculated based on position (flies toward nearest edge)
- Penalty popup triggered by `onEscapeComplete` callback, not by timer
- **Bug fix**: Added useEffect to reset `escapePhase` to 'idle' when `escaped` prop changes to false (fixes flies not reappearing after game reset)

---

## Step 8 Validation Results (2026-01-28, validated 2026-01-29)

| Test | Result | Evidence |
|------|--------|----------|
| Idle state UI | PASS | Start screen with title, fly icon, Play/Settings buttons |
| Playing state | PASS | Full game UI with timer, score, canvas, flies |
| Paused state | PASS | Dark overlay with Resume/Settings/Quit buttons |
| Won state | PASS | Results screen with score, stats grid, Play Again |
| Lost state | PASS | Results screen showing Time's Up, escaped count |
| Play Again works | PASS | Resets all state and starts new game (bug fix applied) |
| State transitions logged | PASS | Console logs for all state transitions |
| Score popup offset | PASS | Score popup doesn't overlap catch animation |

### Bug Fix (2026-01-29)
- **Issue**: "Play Again" didn't show flies after first game round
- **Cause**: Cached images don't always fire `onLoad` event when component remounts
- **Fix**: Added `useEffect` in `GameCanvas.tsx` to check `img.complete` on mount and initialize `imageLoaded`/`imageLayout` state immediately for cached images

### Files Created/Modified
- `src/hooks/useGameState.ts` - Full implementation with useReducer:
  - Actions: START_GAME, PAUSE_GAME, RESUME_GAME, FIND_FLY, MISS_CLICK, TIME_UP, ADD_ESCAPE_PENALTY, PLAY_AGAIN, RESET
  - Encapsulates all core game state (status, flies, score, streak, misclicks)
  - Win detection (all flies found) with accuracy bonus
  - Escape delay calculation on TIME_UP
- `src/components/layout/StartScreen.tsx` - Start menu with fly icon, Play/Settings
- `src/components/layout/PauseOverlay.tsx` - Pause overlay with Resume/Settings/Quit
- `src/components/layout/ResultsScreen.tsx` - Results screen with:
  - Score display, stats grid (found, accuracy, escaped, misclicks)
  - Play Again and Main Menu buttons
- `src/components/layout/GameScreen.tsx` - Playing state layout (header + canvas slot)
- `src/App.tsx` - Refactored to use useGameState:
  - Renders appropriate screen based on game.status
  - Animation state (popups, catch effects) kept as UI-only state
  - Clean separation: game logic in reducer, UI in components

### Technical Notes
- Game state uses useReducer for predictable state transitions
- Animation state (score popups, catch animations, penalties) intentionally kept separate from game state
- Test level hardcoded for now (level system is Step 9)
- Settings accessible from start screen, pause overlay, and during gameplay

---

## Step 9 Validation Results (2026-01-29)

| Test | Result | Evidence |
|------|--------|----------|
| Levels load correctly | PENDING | Select different levels, verify different images/fly positions |
| Fly positions vary | PENDING | Compare levels side by side |
| Progress saves | PENDING | Complete level, refresh, check localStorage |
| Level select UI | PENDING | Level select screen with grid of level cards |
| Locked levels shown | PENDING | Fresh start shows level 1 unlocked, others locked |
| Next Level button | PENDING | Win a level, Next Level button appears |

### Files Created/Modified
- `src/types/game.ts` - Added `name` field to Level type, added `LevelProgress` interface
- `src/data/levels.ts` - 5 static levels with different themes, images, and fly positions:
  - Level 1-2: Kitchen theme (easy, 3-4 flies, 30s)
  - Level 3-4: Garden theme (medium, 5 flies, 25-30s)
  - Level 5: Fantasy theme (hard, 6 flies, 25s)
- `src/hooks/useLevelProgress.ts` - localStorage persistence for level completion/scores
- `src/components/layout/LevelSelect.tsx` - Level selection grid with:
  - Theme-colored cards with level name and difficulty dots
  - Lock overlay for locked levels
  - Progress display (completed checkmark + best score)
- `src/components/layout/ResultsScreen.tsx` - Added Next Level button for won games
- `src/App.tsx` - Integrated level system:
  - Screen state (start → levelSelect → playing → results)
  - Level selection flow
  - Casual mode adds 30s to level's time limit
  - Level completion tracking

### Technical Notes
- Levels use Unsplash images (different scenes for each level)
- First level always unlocked, subsequent levels unlock on completion
- Progress stored in localStorage under `fruitfly-finder-progress`
- Casual mode adds 30 seconds to each level's base time limit

---

## Notes & Decisions

### Step 1 Notes
- Used Vite 7.3.1 with React-TS template
- Tailwind CSS 4.x with @tailwindcss/vite plugin (no tailwind.config.js needed)
- All placeholder files have TODO comments referencing their implementation step
- Unused parameters prefixed with `_` to satisfy TypeScript strict mode

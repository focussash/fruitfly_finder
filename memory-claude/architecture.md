# Fruitfly Finder - Architecture & Progress

## Project Structure

```
Fruitfly_finder/
├── memory-claude/           # Planning & documentation
│   ├── CLAUDE.md           # Project rules
│   ├── app-design.md       # Feature specifications
│   ├── architecture.md     # This file - progress tracking
│   ├── implementation-plan.md
│   └── RESUME.md           # Session handoff notes
│
├── src/
│   ├── components/         # React components
│   │   ├── game/          # Game-specific components
│   │   │   ├── GameCanvas.tsx    # Main game area with image + click detection
│   │   │   ├── Fly.tsx           # Fly sprite with pointer-event hold detection
│   │   │   ├── CatchAnimation.tsx # Cute/Wild catch animations (intensity-scaled)
│   │   │   ├── Timer.tsx          # Circular countdown timer
│   │   │   └── ScoreDisplay.tsx   # Score popups + penalty popups
│   │   ├── ui/            # Reusable UI components
│   │   │   └── Settings.tsx      # Settings panel (toggles + folder picker)
│   │   └── layout/        # Layout components
│   │       ├── Header.tsx
│   │       ├── StartScreen.tsx
│   │       ├── WorldSelect.tsx
│   │       ├── LevelSelect.tsx
│   │       ├── GameScreen.tsx
│   │       ├── PauseOverlay.tsx
│   │       ├── ResultsScreen.tsx
│   │       ├── MultiplayerLobby.tsx
│   │       └── MultiplayerResults.tsx
│   │
│   ├── hooks/             # Custom React hooks
│   │   ├── useGameState.ts    # Core game state (useReducer)
│   │   ├── useTimer.ts        # Countdown timer
│   │   ├── useSettings.ts     # Settings with localStorage
│   │   ├── useLevelProgress.ts # Level/world/endless progress
│   │   └── useMultiplayer.ts   # Socket.io multiplayer state
│   │
│   ├── services/          # External services
│   │   ├── imageSource.ts # Image loading (Unsplash defaults + folder picker)
│   │   └── socket.ts      # Socket.io client
│   │
│   ├── data/              # Game data
│   │   ├── levels.ts      # Level generation (campaign + endless)
│   │   └── worlds.ts      # World definitions (4 themed worlds)
│   │
│   ├── types/             # TypeScript types
│   │   └── game.ts        # Fly, Level, GameState, Settings, etc.
│   │
│   ├── utils/             # Utility functions
│   │   ├── scoring.ts     # Score calculation (with intensity multiplier)
│   │   └── difficulty.ts  # Difficulty scaling per level/round
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css          # CSS keyframe animations
│
├── server/
│   └── index.ts           # Express + Socket.io multiplayer server
│
├── public/
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Frontend Framework | React 18 |
| Build Tool | Vite 7.x |
| Language | TypeScript |
| Styling | Tailwind CSS 4.x |
| Animation | CSS Keyframes + inline styles |
| State Management | useReducer + custom hooks |
| Multiplayer | Socket.io (Express server) |
| Images | Unsplash defaults + browser folder picker |
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
  name: string;
  imageUrl: string;
  flies: Fly[];
  theme: 'kitchen' | 'garden' | 'fantasy' | 'retro';
  difficulty: number;
  timeLimit: number;
}

interface LevelProgress {
  completed: boolean;
  bestScore: number;
  bestTime: number; // seconds remaining when completed
}

interface GameState {
  currentLevel: Level | null;
  score: number;
  streak: number;
  misclicks: number;
  timeRemaining: number;
  status: 'idle' | 'playing' | 'paused' | 'won' | 'lost';
}

type GameMode = 'campaign' | 'endless' | 'multiplayer';

interface Settings {
  catchAnimation: 'cute' | 'wild';
  soundEnabled: boolean;
  musicEnabled: boolean;
  casualMode: boolean;   // extended timer
  powerSlap: boolean;    // hold longer for bigger catches and bonus points
}

interface ScoreBreakdown {
  base: number;
  timeBonus: number;
  streakMultiplier: number;
  intensityMultiplier: number;  // 1.0x (quick tap) to 2.0x (full hold)
  total: number;
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
- [x] Step 10: Difficulty progression
- [x] Step 11: Local images support (Gemini skipped)
- [x] Step 12: Fly placement (done in Step 10)
- [x] Step 13: Campaign mode
- [x] Step 14: Endless mode
- [x] Step 15: Multiplayer foundation
- [x] Step 16: Head-to-Head mode (integrated in Step 15)
- [x] Feature: Power Slap (hold-to-charge scoring + animation scaling)
- [x] Feature: Local Folder Picker (replaced HEAD-request scanner)
- [ ] Step 17: Polish & sounds
- [ ] Step 18: Final testing

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
| Levels load correctly | PASS | Different levels show different images and fly positions |
| Fly positions vary | PASS | Each level has unique fly placements |
| Progress saves | PASS | Completed level persists after refresh, unlocks next level |
| Level select UI | PASS | Grid of 5 level cards with theme colors and difficulty dots |
| Locked levels shown | PASS | Level 1 unlocked, levels 2-5 show lock icon initially |
| Next Level button | PASS | Appears on results screen after winning |

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

## Step 10 Validation Results (2026-01-29)

| Test | Result | Evidence |
|------|--------|----------|
| Level 1-5: 30s, 3-5 flies | PASS | Timer shows 30s, fly count scales 3-5 |
| Level 6-15: 25s, 5-8 flies | PASS | Timer shows 25s, fly count scales 5-8 |
| Level 16-30: 20s, 8-12 flies | PASS | Timer shows 20s, fly count scales 8-12 |
| Fly size decreases | PASS | Flies get smaller at higher levels |
| 30 levels generated | PASS | All 30 levels visible in scrollable level select |
| Current level display | PASS | Level number and name shown during gameplay |

### Files Created/Modified
- `src/utils/difficulty.ts` - Enhanced difficulty scaling utility:
  - Three tiers: Easy (1-5), Medium (6-15), Hard (16-30)
  - Time limits: 30s → 25s → 20s
  - Fly counts: 3-5 → 5-8 → 8-12
  - Fly sizes: Normal → Smaller → Smallest
  - Theme assignment by level range
- `src/data/levels.ts` - Dynamic level generation:
  - Generates 30 levels using difficulty params
  - Seeded random fly placement (consistent positions per level)
  - Theme-specific image pools (8 images per theme)
  - No-overlap fly placement algorithm
- `src/components/layout/LevelSelect.tsx` - Updated for 30 levels:
  - Grouped by difficulty tier (Easy/Medium/Hard sections)
  - Compact 5-column grid layout
  - Scrollable with tier completion counters
- `src/components/layout/GameScreen.tsx` - Added level display:
  - Shows current level number and name during gameplay
- `src/App.tsx` - Pass level info to GameScreen

### Technical Notes
- Seeded RNG ensures same fly positions each playthrough
- Fly positions maintain minimum 12% distance apart
- 10% margin keeps flies away from edges
- Theme progression: Kitchen → Garden → Fantasy → Retro

---

## Step 11: Local Images Support (2026-01-30)

Gemini integration skipped; added local image folder support instead.

| Test | Result | Evidence |
|------|--------|----------|
| Setting toggle | PASS | "Use Local Images" toggle in Settings |
| Instructions shown | PASS | Blue info box with naming conventions |
| Image scanning | PASS | Console logs found images count |
| Fallback to default | PASS | Uses Unsplash when no local images |

### Files Created/Modified
- `src/services/imageSource.ts` - Image source service:
  - Scans `public/levels/` for local images
  - Supports numbered (`level-1.jpg`) and themed (`kitchen-1.jpg`) naming
  - Caches scan results for performance
  - Falls back to Unsplash defaults
- `src/types/game.ts` - Added `useLocalImages` to Settings
- `src/hooks/useSettings.ts` - Added default for new setting
- `src/components/ui/Settings.tsx` - Added toggle with usage instructions
- `src/data/levels.ts` - Integrated with imageSource service
- `src/App.tsx` - Scan for local images when setting enabled
- `public/levels/README.txt` - Instructions for adding custom images

### How to Use
1. Enable "Use Local Images" in Settings
2. Add images to `public/levels/` folder:
   - Numbered: `level-1.jpg`, `level-2.png`, etc.
   - Themed: `kitchen-1.jpg`, `garden-2.png`, etc.
3. Restart game or toggle setting to reload

---

## Step 13: Campaign Mode (2026-01-30)

| Test | Result | Evidence |
|------|--------|----------|
| World select UI | PASS | 4 themed world cards displayed |
| World 1 unlocked by default | PASS | Kitchen world accessible |
| World 2 locked initially | PASS | Garden world shows lock |
| Level unlocking | PASS | Complete level to unlock next |
| Theme changes per world | PASS | Kitchen→Garden→Fantasy→Retro |
| Progress display | PASS | World progress bar, level checkmarks |

### Files Created/Modified
- `src/data/worlds.ts` - World definitions:
  - 4 worlds: Kitchen, Garden, Fantasy, Retro
  - 8 levels per world (32 total)
  - World metadata (name, icon, color, description)
- `src/data/levels.ts` - Updated for 32 levels with world structure
- `src/utils/difficulty.ts` - Difficulty scales within and across worlds
- `src/components/layout/WorldSelect.tsx` - World selection screen:
  - World cards with progress bars
  - Lock overlay for incomplete worlds
  - Completion badges
- `src/components/layout/LevelSelect.tsx` - Updated for world context:
  - Shows levels within selected world
  - 4-column grid with level cards
  - Best score display for completed levels
- `src/hooks/useLevelProgress.ts` - World-based unlocking:
  - Complete all levels in a world to unlock next
  - World progress tracking
- `src/App.tsx` - Campaign navigation flow:
  - Start → World Select → Level Select → Playing

### Campaign Structure
| World | Theme | Levels | Time | Flies |
|-------|-------|--------|------|-------|
| 1 | Kitchen | 1-8 | 30s | 4-6 |
| 2 | Garden | 9-16 | 27s | 5-7 |
| 3 | Fantasy | 17-24 | 24s | 6-9 |
| 4 | Retro | 25-32 | 20s | 7-10 |

---

## Step 14: Endless Mode (2026-02-12)

| Test | Result | Evidence |
|------|--------|----------|
| Endless mode starts | PASS | Purple "Endless Mode" button on start screen |
| Lives display | PASS | 3 hearts shown in game header |
| Life lost on escape | PASS | Heart disappears when fly escapes |
| Game over at 0 lives | PASS | Game over screen with total score |
| High score saves | PASS | High score persists after restart |
| Difficulty increases | PASS | More flies, less time as rounds progress |
| Round complete screen | PASS | "Round Complete!" with Continue button |
| End run saves score | PASS | Quitting mid-run saves high score |

### Files Created/Modified
- `src/types/game.ts` - Added `GameMode` type ('campaign' | 'endless')
- `src/utils/difficulty.ts` - Added `getEndlessDifficulty()`:
  - Smooth scaling: time 30s→12s, flies 4→15, sizes shrink over 30 rounds
  - Theme cycles: kitchen→garden→fantasy→retro per round
  - Movement after round 20
- `src/data/levels.ts` - Added `generateEndlessLevel(round)`:
  - Dynamic level generation for any round number
  - Different seed from campaign (round * 54321)
  - Cycles through 8 images per theme
- `src/hooks/useLevelProgress.ts` - Added endless high score tracking:
  - `getEndlessHighScore()`, `getEndlessBestRound()`, `saveEndlessHighScore()`
  - Stored in separate localStorage keys
- `src/components/layout/StartScreen.tsx` - Added:
  - "Endless Mode" purple button
  - High score display below endless button
- `src/components/layout/GameScreen.tsx` - Added:
  - Lives display (hearts) when `isEndless`
  - Round number instead of Level number
  - Total accumulated score display
- `src/components/layout/ResultsScreen.tsx` - Three endless mode screens:
  - Won round: "Round Complete!" with Continue button
  - Lost round (lives > 0): "Flies Escaped!" with lives, Continue button
  - Game over (lives = 0): "Game Over!" with total score, high score comparison
- `src/App.tsx` - Endless mode integration:
  - `gameMode` state ('campaign' | 'endless')
  - `endlessRound`, `endlessLives`, `endlessTotalScore` state
  - Lives decrease on each fly escape (-1 per fly)
  - Auto-saves high score on game over and end run
  - Separate play again (restart endless) and continue (next round) flows

### Endless Mode Design
- Start with 3 lives
- Each escaped fly costs 1 life
- Score accumulates across rounds
- Continue to next round after winning or losing (if lives > 0)
- Game over when lives reach 0
- Difficulty ramps continuously: time decreases ~0.6s/round, flies increase ~0.4/round
- High score and best round tracked separately in localStorage

### Bug fixes during implementation
- Fixed pre-existing TypeScript errors: type-only imports (MouseEvent, ReactNode), unused variables
- Removed unused `levels` and `isLastLevelInWorld` imports from App.tsx

---

## Step 15: Multiplayer Foundation + Head-to-Head (2026-02-12)

| Test | Result | Evidence |
|------|--------|----------|
| Server starts | PASS | `npm run server` → "Multiplayer server running on port 3001" |
| Health endpoint | PASS | `curl localhost:3001/health` → {"status":"ok","rooms":0} |
| Client build | PASS | `npm run build` succeeds (84 modules) |
| Multiplayer button | PENDING | Blue "Multiplayer" button on start screen |
| Connect to server | PENDING | Lobby shows "Connected to server" |
| Create room | PENDING | Room code displayed after creating |
| Join room | PENDING | Both players shown in lobby |
| Ready system | PENDING | Both players ready → game starts |
| Same level | PENDING | Both players play same level |
| Opponent progress | PENDING | See opponent's found count during gameplay |
| Game results | PENDING | Both players' scores shown side-by-side |
| Rematch | PENDING | Players return to lobby, can ready up again |
| Disconnection | PENDING | Opponent left message shown |

### Files Created/Modified
- `server/index.ts` - Full multiplayer server implementation:
  - Room creation with 4-char codes (e.g., "AB3K")
  - Room joining, leaving, disconnection handling
  - Ready system (both players ready → game starts)
  - Game event broadcasting (fly-found, player-miss, player-finished)
  - Rematch support
  - Stale room cleanup (30 min timeout)
  - Health check endpoint
- `src/services/socket.ts` - Socket.io client service:
  - Connect/disconnect with reconnection
  - Room actions (create, join, leave, ready)
  - Game event emitters (flyFound, miss, finished, rematch)
- `src/hooks/useMultiplayer.ts` - Multiplayer state hook:
  - Connection state, room state, player list
  - Opponent updates (score, found count)
  - Game results from server
  - All event listeners with cleanup
- `src/components/layout/MultiplayerLobby.tsx` - Lobby UI:
  - Connect screen, create/join menu, name input
  - Room code display with share instructions
  - Player list with ready indicators
  - Ready up / cancel ready buttons
- `src/components/layout/MultiplayerResults.tsx` - Results comparison:
  - Side-by-side player scores
  - Winner highlight with green border
  - Tie detection
  - Rematch / Leave buttons
- `src/components/layout/StartScreen.tsx` - Added "Multiplayer" button
- `src/components/layout/GameScreen.tsx` - Added opponent progress display
- `src/types/game.ts` - Added 'multiplayer' to GameMode
- `src/App.tsx` - Full multiplayer integration:
  - Multiplayer screen and lobby routing
  - Auto-start game on server signal
  - Event emission on fly found/miss/game end
  - Waiting screen while opponent finishes
  - Rematch flow back to lobby
- `package.json` - Added scripts: `server`, `dev:all`

### Dependencies Added
- `socket.io` (server)
- `socket.io-client` (client)
- `express` (server)
- `@types/express` (dev)
- `tsx` (dev, for running server)

### How to Run
1. Start server: `npm run server` (port 3001)
2. Start client: `npm run dev` (port 5173)
3. Open two browser tabs to localhost:5173
4. Both click Multiplayer → Connect → one creates room, other joins with code
5. Both ready up → game starts with same level

### Multiplayer Game Flow
1. Player 1 creates room → gets 4-char code
2. Player 2 joins with code
3. Both toggle "Ready" → server picks random level (1-32)
4. Both play same image with same fly positions (seeded RNG)
5. Real-time updates: opponent's found count shown during play
6. When both finish → server sends results comparison
7. Rematch returns to lobby

---

## LAN Multiplayer Support (2026-02-12)

Added ability for two PCs on the same WiFi to play multiplayer together. Previously only worked on the same PC (hardcoded to localhost).

| Test | Result | Evidence |
|------|--------|----------|
| TypeScript compiles | PASS | `npx tsc --noEmit` succeeds |
| Server prints LAN IP | NOT TESTED | Needs manual verification |
| Vite shows Network URL | NOT TESTED | Needs manual verification |
| Same-PC multiplayer | NOT TESTED | Needs two-tab test |
| Cross-PC multiplayer | NOT TESTED | Needs two PCs on same WiFi |

### Files Modified
- `server/index.ts` - LAN support:
  - CORS origin changed from specific localhost URLs to `'*'`
  - Added `os.networkInterfaces()` import and `getLanIP()` helper
  - Server prints LAN IP on startup (e.g., `[Server] Network: http://192.168.1.5:3001`)
- `src/services/socket.ts` - Dynamic server URL:
  - Removed hardcoded `SERVER_URL = 'http://localhost:3001'`
  - Added `getDefaultServerURL()` using `window.location.hostname:3001`
  - `connectToServer()` accepts optional `serverUrl` parameter
- `src/hooks/useMultiplayer.ts` - URL passthrough:
  - `connect()` accepts optional `serverUrl` and passes to `connectToServer()`
- `src/components/layout/MultiplayerLobby.tsx` - Server address UI:
  - Shows editable "Server Address" field before connecting
  - Auto-detected from `window.location.hostname` (works for LAN access)
  - User can override to point to another PC's server
- `vite.config.ts` - Added `server: { host: true }` so Vite serves on `0.0.0.0`

### How LAN Play Works
1. Host runs `npm run server` — console shows LAN IP (e.g., `192.168.1.5`)
2. Host runs `npm run dev` — Vite shows Network URL (e.g., `http://192.168.1.5:5173`)
3. Joining player opens the Network URL in their browser
4. Server address auto-detects (since page was loaded from LAN IP)
5. Both click Multiplayer → Connect → create/join room as usual

---

## Notes & Decisions

### Step 1 Notes
- Used Vite 7.3.1 with React-TS template
- Tailwind CSS 4.x with @tailwindcss/vite plugin (no tailwind.config.js needed)
- All placeholder files have TODO comments referencing their implementation step
- Unused parameters prefixed with `_` to satisfy TypeScript strict mode

---

## Feature: Power Slap (2026-02-12)

Hold-to-charge mechanic: longer mousedown-to-mouseup duration on a fly = bigger animation + score bonus (up to 2.0x). Gated by a toggle in Settings.

| Test | Result | Evidence |
|------|--------|----------|
| Power Slap off (default) | PASS | TypeScript compiles, intensity always 0 when disabled |
| Power Slap on | PENDING | Manual testing needed |
| Quick tap = base score | PENDING | Manual testing needed |
| Full hold (500ms) = 2.0x | PENDING | Manual testing needed |
| Animations scale by intensity | PENDING | Manual testing needed |
| Score popup shows power bonus | PENDING | Manual testing needed |
| Build succeeds | PASS | `npx tsc --noEmit` + `npx vite build` both pass |

### Files Modified
- `src/types/game.ts` — Replaced `useLocalImages: boolean` with `powerSlap: boolean` in Settings
- `src/hooks/useSettings.ts` — Default `powerSlap: false`
- `src/utils/scoring.ts` — Added Power Slap constants and `intensityMultiplier` to scoring:
  - `POWER_SLAP_MAX_HOLD_MS = 500` — max charge time
  - `POWER_SLAP_MAX_MULTIPLIER = 2.0` — max score bonus
  - `intensityMultiplier` field in `ScoreBreakdown`
  - `calculateFindScore(timeRemaining, streak, intensity = 0)` — new 3rd parameter
  - Formula: `intensityMultiplier = 1 + intensity * (MAX_MULTIPLIER - 1)`, applied to total
- `src/components/game/Fly.tsx` — Replaced `onClick` handler with pointer events:
  - `onPointerDown` — records `Date.now()` in ref, calls `setPointerCapture`
  - `onPointerUp` — calculates `holdDuration`, converts to `intensity = clamp(holdDuration / 500, 0, 1)`, calls `onClick(id, intensity)`
  - `onPointerCancel` — clears ref (no catch)
  - Added `touchAction: 'none'` style to prevent browser default touch behaviors
  - Same guards: skip if `found` or `escapePhase !== 'idle'`
- `src/components/game/GameCanvas.tsx` — Updated `onFlyClick` prop type to `(flyId: string, intensity: number)`
- `src/App.tsx` — Updated `handleFlyClick(flyId, intensity)`:
  - `effectiveIntensity = settings.powerSlap ? intensity : 0`
  - Passes to `calculateFindScore` and `CatchAnimationData`
  - `CatchAnimationData` type now includes `intensity: number`
- `src/components/game/CatchAnimation.tsx` — Added `intensity` prop (0-1):
  - Auto-destroy timeout: `800 + intensity * 400` ms (800ms–1200ms)
  - **CuteAnimation scaling** (all via inline styles):
    - Particle count: `8 + intensity * 8` (8→16)
    - Star SVG size: `(8 + random * 8) * (1 + intensity * 0.5)`
    - Pink burst: `48 + intensity * 32` px
    - Sparkle travel: CSS var `--travel: ${50 + intensity * 50}px`
    - Heart emoji: `2 + intensity * 1` rem
    - Animation durations scaled up with intensity
  - **WildAnimation scaling**:
    - Drop count: `6 + intensity * 6` (6→12)
    - Drop distance: `* (1 + intensity * 0.5)`
    - Splat circle: `64 + intensity * 48` px
    - Hand emoji: `3 + intensity * 1.5` rem
    - SPLAT text: `1.5 + intensity * 1` rem
    - Animation durations scaled up with intensity
- `src/index.css` — Changed sparkle-out keyframe from hardcoded `50px` to `var(--travel, 50px)`
- `src/components/game/ScoreDisplay.tsx` — Shows "x{n} power!" line when `intensityMultiplier > 1.01`
- `src/components/ui/Settings.tsx` — Added "Power Slap" toggle with description

### Design Decisions
- No visual charge indicator — player discovers the mechanic naturally
- `setPointerCapture` ensures pointerup fires even if finger drifts slightly off the fly
- `e.preventDefault()` on pointerDown/pointerUp prevents synthetic click from firing (which would also trigger the canvas miss handler)
- Intensity is always calculated in Fly, but `effectiveIntensity` is gated by `settings.powerSlap` in App.tsx so turning the feature off makes intensity=0 with no code path changes

---

## Feature: Local Folder Picker (2026-02-12)

Replaced the old `useLocalImages` toggle (which probed `public/levels/` via 200+ HEAD requests) with a browser folder picker dialog. User clicks "Pick Local Folder..." in Settings, selects a folder, and those images become level backgrounds.

| Test | Result | Evidence |
|------|--------|----------|
| Build succeeds | PASS | `npx tsc --noEmit` + `npx vite build` both pass |
| Folder picker (Chrome/Edge) | PENDING | Manual testing needed |
| Folder picker (Firefox fallback) | PENDING | Manual testing needed |
| Reset button reverts to defaults | PENDING | Manual testing needed |
| Cancel dialog = no change | PENDING | Manual testing needed |

### Files Modified
- `src/services/imageSource.ts` — Complete rewrite of local image loading:
  - **Removed**: `scanLocalImages()` (HEAD request probing), `checkImageExists()`
  - **Added**: `readFolderImages()` — async, returns `{ all: string[], byTheme: Record<string, string[]> } | null`
    - Feature-detects `showDirectoryPicker` → uses it (Chrome/Edge)
    - Fallback: creates hidden `<input type="file" webkitdirectory>` and clicks it (Firefox/Safari)
    - Filters for image MIME types (jpeg, png, webp, gif) with extension fallback
    - Sorts files alphabetically for deterministic level assignment
    - Creates `URL.createObjectURL()` for each file
    - Categorizes by theme if filename contains theme name, otherwise → `custom`
    - Returns `null` if user cancels
  - **Added**: `revokeLocalFolderImages()` — revokes all active object URLs
  - **Kept**: `getImageForLevel()`, `clearImageCache()`, `getDefaultImages()`, default Unsplash images
  - Module-level `activeObjectUrls: string[]` tracks URLs for cleanup
  - Cancel detection: uses `window.focus` event with 300ms timeout for fallback input
- `src/types/game.ts` — Removed `useLocalImages: boolean` from Settings
- `src/hooks/useSettings.ts` — Removed `useLocalImages: false` from defaults
- `src/App.tsx` — Replaced image loading approach:
  - **Removed**: `useEffect` watching `settings.useLocalImages` that called `scanLocalImages()`
  - **Added**: `handlePickLocalFolder` callback — calls `readFolderImages()`, then `regenerateLevelsWithImages(result)`
  - **Added**: `handleClearLocalImages` callback — calls `revokeLocalFolderImages()`, `clearImageCache()`, reverts levels
  - Both callbacks + `localImagesLoaded` state passed to `<Settings>`
  - Updated import: `readFolderImages, revokeLocalFolderImages, clearImageCache`
- `src/components/ui/Settings.tsx` — Replaced local images section:
  - **Removed**: `useLocalImages` toggle and instruction block
  - **Added** new props: `onPickLocalFolder`, `onClearLocalImages`, `localImagesLoaded`
  - "Background Images" section with:
    - "Pick Local Folder..." button (or "Change Folder..." if already loaded)
    - "Reset" button (only shown when images are loaded)
    - Status text showing current state

### Design Decisions
- Object URLs are tracked in a module-level array (not React state) for reliable cleanup
- `revokeLocalFolderImages()` is called before creating new URLs (in `readFolderImages`) and when user clicks Reset
- The fallback `<input webkitdirectory>` approach handles cancel detection via `window.focus` event — when the native dialog closes without a file selection, focus returns to the window and no `change` event fires
- Theme categorization is case-insensitive substring match on filename (e.g., "kitchen-sunset.jpg" → kitchen theme)

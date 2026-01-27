# Fruitfly Finder - Implementation Plan

## Overview
Step-by-step implementation guide. Each step includes deliverables and validation tests with required proof.

---

## Phase 1: Foundation

### Step 1: Project Setup
**Goal**: Initialize React + TypeScript + Vite project with Tailwind CSS

**Tasks**:
1. Create Vite project with React-TS template
2. Install and configure Tailwind CSS
3. Set up folder structure as defined in architecture.md
4. Create placeholder files for main modules
5. Verify dev server runs

**Validation Tests**:
| Test | How to Validate | Evidence Required |
|------|-----------------|-------------------|
| Dev server runs | Run `npm run dev` | Screenshot of terminal showing server running + browser showing app |
| Tailwind works | Add a test class (e.g., `bg-blue-500`) | Screenshot showing styled element |
| TypeScript compiles | Run `npm run build` | Terminal output showing successful build (pass/fail) |
| Folder structure | Check directories exist | `ls` or `tree` output showing structure |

---

### Step 2: Core Game Canvas
**Goal**: Create the main game area that displays an image and detects clicks

**Tasks**:
1. Create `GameCanvas.tsx` component
2. Implement responsive image display (fills container, maintains aspect ratio)
3. Add click handler that captures (x, y) as percentage of image dimensions
4. Display click coordinates on screen (debug mode)

**Validation Tests**:
| Test | How to Validate | Evidence Required |
|------|-----------------|-------------------|
| Image displays responsively | Resize browser window | Screenshots at 3 different window sizes |
| Click detection works | Click various spots on image | Screenshot showing debug coordinates displayed |
| Coordinates are percentages | Click corners (should show ~0,0 and ~100,100) | Console log or UI showing corner coordinates |
| Aspect ratio maintained | Load different aspect ratio images | Screenshot showing image not distorted |

---

### Step 3: Fly Component & Click Detection
**Goal**: Render flies on the canvas and detect when they're clicked

**Tasks**:
1. Create `Fly.tsx` component with basic sprite
2. Position flies using absolute positioning with percentage values
3. Implement hit detection (click within fly bounds)
4. Add visual feedback for found flies (opacity change initially)
5. Track found/unfound state

**Validation Tests**:
| Test | How to Validate | Evidence Required |
|------|-----------------|-------------------|
| Flies render at positions | Place flies at known coordinates | Screenshot showing flies at expected positions |
| Click on fly = found | Click directly on a fly | Screenshot/GIF showing fly state change (opacity) |
| Click off fly = miss | Click empty space | Console log showing miss registered, fly unchanged |
| Multiple flies independent | Find one fly, others remain | Screenshot showing mixed found/unfound states |
| Hit detection accuracy | Click fly edges | Test clicking near boundaries works correctly |

---

### Step 4: Timer System
**Goal**: Implement countdown timer with visual display

**Tasks**:
1. Create `useTimer.ts` hook with start/pause/reset
2. Create `Timer.tsx` component with circular or bar display
3. Add urgency styling (color change when low)
4. Trigger "time up" event when timer reaches zero

**Validation Tests**:
| Test | How to Validate | Evidence Required |
|------|-----------------|-------------------|
| Timer counts down | Start timer, observe countdown | Screenshot or GIF of timer counting |
| Timer accuracy | Compare to real clock over 30s | Confirm within 1s of real time (pass/fail) |
| Pause/resume works | Pause, wait, resume | Screenshots showing paused state, then resumed |
| Urgency styling | Let timer reach <5s | Screenshot showing color change |
| Time-up event fires | Let timer reach 0 | Console log or UI change when timer expires |

---

### Step 5: Scoring System
**Goal**: Calculate and display score based on game rules

**Tasks**:
1. Create `scoring.ts` utility with point calculations
2. Create `ScoreDisplay.tsx` component
3. Implement: base points, time bonus, accuracy bonus, streak multiplier
4. Show score popup when fly is found
5. Track misclicks for accuracy calculation

**Validation Tests**:
| Test | How to Validate | Evidence Required |
|------|-----------------|-------------------|
| Base points (100) | Find one fly with no bonus | Screenshot showing +100 |
| Time bonus (+10/sec) | Find fly with 20s remaining | Screenshot showing 100 + 200 = 300 points |
| Streak multiplier (1.5x) | Find 2+ flies consecutively | Screenshot showing multiplied score |
| Accuracy bonus (+50) | Complete level with 0 misclicks | Screenshot showing bonus applied |
| Misclick tracking | Click empty space, then finish | Screenshot showing no accuracy bonus |
| Escape penalty (-50) | Let a fly escape | Screenshot showing negative points |

---

## Phase 2: Core Animations

### Step 6: Catch Animations (Cute/Wild Toggle)
**Goal**: Implement both animation modes for finding a fly

**Tasks**:
1. Create `useSettings.ts` hook with localStorage persistence
2. Create `Settings.tsx` modal/panel with animation toggle
3. **Cute Mode**: Sparkle particles, fly pops, points float up
4. **Wild Mode**: Hand sprite swoops in, splat effect
5. Add corresponding sound effect hooks (silent for now)

**Validation Tests**:
| Test | How to Validate | Evidence Required |
|------|-----------------|-------------------|
| Settings persist | Toggle, refresh page, check setting | Screenshots: before refresh, after refresh showing same state |
| Cute animation plays | Set to Cute, find a fly | GIF/video of sparkle animation |
| Wild animation plays | Set to Wild, find a fly | GIF/video of hand smack animation |
| Toggle mid-game | Change setting during gameplay | Both animations work in same session |
| Animations non-blocking | Find flies rapidly | Game remains responsive during animations |

---

### Step 7: Escape Animation
**Goal**: Animate unfound flies escaping when timer expires

**Tasks**:
1. Create escape animation (fly buzzes and flies off screen)
2. Trigger for all unfound flies when timer hits zero
3. Add slight delay between each fly escaping (staggered)
4. Show penalty points floating down

**Validation Tests**:
| Test | How to Validate | Evidence Required |
|------|-----------------|-------------------|
| Escape animation triggers | Let timer expire with unfound flies | GIF/video of flies escaping |
| Only unfound flies escape | Find some flies, let timer expire | Screenshot showing found flies stay, unfound escape |
| Staggered timing | Multiple flies escape | Video showing sequential escape, not simultaneous |
| Penalty points shown | Fly escapes | Screenshot showing -50 floating text |
| Game state changes | All escapes complete | UI shows game over or level results |

---

## Phase 3: Game Flow

### Step 8: Game State Management
**Goal**: Implement complete game state machine

**Tasks**:
1. Create `useGameState.ts` hook with reducer
2. States: idle → playing → paused → won/lost
3. Create game UI for each state (start screen, pause overlay, results)
4. Wire up all components to game state
5. Implement "Play Again" and "Next Level" flows

**Validation Tests**:
| Test | How to Validate | Evidence Required |
|------|-----------------|-------------------|
| Idle state UI | Load game fresh | Screenshot of start/menu screen |
| Playing state | Start game | Screenshot showing active gameplay |
| Paused state | Press pause button | Screenshot showing pause overlay |
| Won state | Find all flies | Screenshot of victory/results screen |
| Lost state | Let all flies escape | Screenshot of game over screen |
| Play Again works | Click play again from results | Game resets to playing state |
| State transitions logged | All transitions | Console logs showing state changes |

---

### Step 9: Level System (Static)
**Goal**: Create level data structure and progression with hardcoded levels

**Tasks**:
1. Define `Level` type and sample level data
2. Create 3-5 test levels with placeholder images
3. Implement level loading and fly placement
4. Add level select screen
5. Track level completion in localStorage

**Validation Tests**:
| Test | How to Validate | Evidence Required |
|------|-----------------|-------------------|
| Levels load correctly | Select different levels | Screenshots of 2-3 different levels |
| Fly positions vary | Compare levels | Different fly positions per level |
| Progress saves | Complete level, refresh | Screenshot showing level marked complete |
| Level select UI | Open level select | Screenshot of level select screen |
| Locked levels shown | Fresh start | Screenshot showing locked/unlocked indicators |

---

### Step 10: Difficulty Progression
**Goal**: Implement difficulty scaling as per design

**Tasks**:
1. Create `difficulty.ts` utility
2. Implement time reduction per level range
3. Implement fly count increase
4. Prepare hooks for camouflage (size variation)
5. Prepare hooks for movement (to be animated later)

**Validation Tests**:
| Test | How to Validate | Evidence Required |
|------|-----------------|-------------------|
| Level 1-5: 30s, 3-5 flies | Play level 1 and 5 | Screenshots showing timer and fly count |
| Level 6-15: 25s, 5-8 flies | Play level 10 | Screenshot showing 25s timer, more flies |
| Level 16-30: 20s, 8-12 flies | Play level 20 | Screenshot showing 20s timer, many flies |
| Difficulty utility tests | Unit test or console | Output showing correct params per level |

---

## Phase 4: Image Generation

### Step 11: Gemini Integration
**Goal**: Generate game images using Gemini Pro

**Tasks**:
1. Create `gemini.ts` service with API wrapper
2. Design prompts for each theme (kitchen, garden, fantasy, retro)
3. Implement image generation flow
4. Create fly placement algorithm for generated images
5. Cache generated images for reuse

**Validation Tests**:
| Test | How to Validate | Evidence Required |
|------|-----------------|-------------------|
| API connects | Make test request | Console log showing successful API response |
| Kitchen theme generates | Request kitchen image | Screenshot of generated kitchen scene |
| Garden theme generates | Request garden image | Screenshot of generated garden scene |
| Caching works | Request same image twice | Console showing cache hit on second request |
| Error handling | Invalid API key or network error | Graceful error message shown |

---

### Step 12: Fly Placement Algorithm
**Goal**: Intelligently place flies on generated images

**Tasks**:
1. Implement random but valid placement zones
2. Ensure flies don't overlap
3. Ensure flies aren't placed at edges
4. Scale fly size based on difficulty
5. Consider "hiding spots" (corners, busy areas)

**Validation Tests**:
| Test | How to Validate | Evidence Required |
|------|-----------------|-------------------|
| No edge placement | Generate multiple layouts | Screenshots showing flies away from edges |
| No overlapping | Generate layout with many flies | Screenshot showing distinct, separated flies |
| Size scaling | Compare easy vs hard level | Screenshots showing size difference |
| Distribution | Multiple generations | Flies spread across image, not clustered |
| Reproducible with seed | Same seed = same placement | Two screenshots with identical placement |

---

## Phase 5: Game Modes

### Step 13: Campaign Mode
**Goal**: Implement progressive campaign with themed worlds

**Tasks**:
1. Create world/level structure (e.g., 4 worlds × 8 levels)
2. Create world select screen
3. Implement level unlocking logic
4. Add world themes (Kitchen → Garden → Fantasy → Retro)
5. Show progress/stars on level select

**Validation Tests**:
| Test | How to Validate | Evidence Required |
|------|-----------------|-------------------|
| World select UI | Open world select | Screenshot showing 4 worlds |
| World 1 unlocked by default | Fresh start | Screenshot showing World 1 accessible |
| World 2 locked initially | Fresh start | Screenshot showing World 2 locked |
| Level unlocking | Complete World 1 Level 1 | Screenshot showing Level 2 unlocked |
| Theme changes per world | Enter different worlds | Screenshots showing different visual themes |
| Progress/stars display | Complete levels with varying scores | Screenshot showing star ratings |

---

### Step 14: Endless Mode
**Goal**: Implement infinite play mode

**Tasks**:
1. Create endless mode entry point
2. Generate levels dynamically
3. Implement "lives" system (X escapes = game over)
4. Track high score separately
5. Increase difficulty every N levels

**Validation Tests**:
| Test | How to Validate | Evidence Required |
|------|-----------------|-------------------|
| Endless mode starts | Select endless from menu | Screenshot of endless mode gameplay |
| Lives display | Start endless mode | Screenshot showing lives counter |
| Life lost on escape | Let a fly escape | Screenshot showing lives decreased |
| Game over at 0 lives | Lose all lives | Screenshot of game over with final score |
| High score saves | Achieve high score, restart | Screenshot showing high score persisted |
| Difficulty increases | Play through 10+ levels | Console log or UI showing difficulty ramp |

---

## Phase 6: Multiplayer

### Step 15: Socket.io Setup
**Goal**: Set up multiplayer infrastructure

**Tasks**:
1. Create basic Express server with Socket.io
2. Create `socket.ts` client service
3. Implement room creation/joining
4. Sync basic game events (fly found, timer)
5. Handle disconnections gracefully

**Validation Tests**:
| Test | How to Validate | Evidence Required |
|------|-----------------|-------------------|
| Server starts | Run server | Terminal output showing server listening |
| Client connects | Open game in browser | Console log showing connection established |
| Room creation | Create a room | Console log showing room ID generated |
| Room joining | Second client joins | Both clients show connected to same room |
| Event sync | Find fly on client 1 | Console log on client 2 showing event received |
| Disconnection handled | Close one browser tab | Other client shows opponent disconnected message |

---

### Step 16: Head-to-Head Mode
**Goal**: Two players compete on same image

**Tasks**:
1. Create lobby/room UI
2. Sync level data between players
3. Show opponent's progress (flies found count)
4. Determine winner when all flies found or time up
5. Show results comparison

**Validation Tests**:
| Test | How to Validate | Evidence Required |
|------|-----------------|-------------------|
| Lobby UI | Enter multiplayer mode | Screenshot of lobby/room UI |
| Same image for both | Both players start game | Side-by-side screenshots showing identical image |
| Opponent progress shown | Player 1 finds fly | Player 2's screen shows opponent found count update |
| Winner determined | One player finds more flies | Screenshot showing correct winner |
| Results comparison | Game ends | Screenshot showing both players' scores side-by-side |

---

## Phase 7: Polish

### Step 17: Sound Effects & Music
**Goal**: Add audio feedback

**Tasks**:
1. Source/create sound effects (find, miss, escape, timer)
2. Implement audio system with mute controls
3. Add ambient buzzing that fades
4. Add background music (optional)
5. Integrate with settings

**Validation Tests**:
| Test | How to Validate | Evidence Required |
|------|-----------------|-------------------|
| Find sound plays | Find a fly | Confirm sound plays (pass/fail + describe sound) |
| Miss sound plays | Click empty space | Confirm sound plays (pass/fail) |
| Escape sound plays | Let fly escape | Confirm sound plays (pass/fail) |
| Mute toggle works | Toggle mute, try actions | Confirm silence when muted (pass/fail) |
| Settings persist | Mute, refresh, check | Mute state preserved (pass/fail) |
| Buzzing fades | Find flies progressively | Ambient sound decreases (pass/fail) |

---

### Step 18: Visual Polish
**Goal**: Refine UI/UX and animations

**Tasks**:
1. Add screen transitions
2. Polish button hover/click states
3. Add loading states
4. Implement responsive design for mobile
5. Add particle effects and juice

**Validation Tests**:
| Test | How to Validate | Evidence Required |
|------|-----------------|-------------------|
| Screen transitions | Navigate between screens | GIF showing smooth transitions |
| Button states | Hover and click buttons | Screenshot showing hover state |
| Loading states | Trigger image load | Screenshot showing loading indicator |
| Mobile layout | Open on mobile or use dev tools | Screenshot at mobile viewport size |
| Responsive breakpoints | Test 3 screen sizes | Screenshots at mobile, tablet, desktop |

---

### Step 19: Final Testing & Bug Fixes
**Goal**: Comprehensive testing and fixes

**Tasks**:
1. Test all game modes end-to-end
2. Test edge cases (timer at 0, all flies found instantly, etc.)
3. Test multiplayer with real latency
4. Performance testing (many flies, animations)
5. Fix identified bugs

**Validation Tests**:
| Test | How to Validate | Evidence Required |
|------|-----------------|-------------------|
| Campaign complete playthrough | Play through all worlds | Pass/fail + any bugs found |
| Endless mode stress test | Play 20+ levels | Pass/fail + performance notes |
| Multiplayer latency test | Play with friend on different network | Pass/fail + latency observations |
| Edge case: instant win | Find all flies in <1s | Game handles correctly (pass/fail) |
| Edge case: no clicks | Let timer expire without clicking | Game handles correctly (pass/fail) |
| Performance: many flies | Level with 15 flies + animations | FPS remains smooth (pass/fail) |
| Bug list | Document any issues | List of bugs found and fixed |

---

## Quick Reference

| Phase | Steps | Focus |
|-------|-------|-------|
| 1 | 1-5 | Foundation & core mechanics |
| 2 | 6-7 | Animations |
| 3 | 8-10 | Game flow & state |
| 4 | 11-12 | AI image generation |
| 5 | 13-14 | Game modes |
| 6 | 15-16 | Multiplayer |
| 7 | 17-19 | Polish & launch |

# Fruitfly Finder - Game Design Document

## Concept Overview

A web-based hidden object game where players race against time to find camouflaged fruitflies hidden in AI-generated images. Unfound flies escape when the timer runs out, adding urgency and excitement.

---

## Core Gameplay Loop

1. **Image Presented** - Player sees an AI-generated scene with hidden fruitflies
2. **Hunt Phase** - Player clicks/taps to find flies before timer expires
3. **Fly Escape** - Unfound flies animate and fly away when time runs out
4. **Scoring** - Points awarded based on flies found, time remaining, and accuracy
5. **Progression** - Advance to next level with increased difficulty

---

## Game Modes

### Single Player
- **Campaign Mode** - Progress through themed worlds with increasing difficulty
- **Endless Mode** - Keep playing until you miss too many flies
- **Daily Challenge** - Same puzzle for all players, compete on leaderboard

### Multiplayer
- **Head-to-Head** - Two players race on the same image simultaneously
- **Party Mode** - Multiple players take turns, highest score wins
- **Co-op** - Work together to find all flies before time expires

---

## Difficulty Progression

Difficulty scales through multiple mechanics that layer together:

| Level Range | Time | Fly Count | Camouflage | Movement |
|-------------|------|-----------|------------|----------|
| 1-5         | 30s  | 3-5       | Obvious    | Static   |
| 6-15        | 25s  | 5-8       | Moderate   | Occasional twitch |
| 16-30       | 20s  | 8-12      | Well-hidden| Short flights |
| 31+         | 15s  | 10-15     | Expert     | Active movement |

### Camouflage Techniques
- Color matching with background elements
- Hiding in busy/textured areas
- Partial occlusion behind objects
- Size variation (smaller = harder)

---

## Visual Design

### Art Style Variety
Different themes use different visual styles to keep gameplay fresh:

- **Kitchen Theme** - Photorealistic fruits, countertops, produce
- **Garden Theme** - Illustrated flowers, leaves, outdoor scenes
- **Fantasy Theme** - Stylized magical forests, unusual fruits
- **Retro Theme** - Pixel art throwback levels (bonus content)

### Fly Design
- Consistent recognizable silhouette across all art styles
- Subtle wing shimmer animation when stationary
- Satisfying "caught" animation when clicked (see Animation Modes below)
- Dramatic escape animation when timer expires

### Catch Animation Modes (Toggleable)
Players can choose their preferred animation style when finding a fly:

| Mode | Description |
|------|-------------|
| **Cute Mode** (Default) | Pink pop burst, sparkle stars radiating out, floating hearts |
| **Wild Mode** | Hand emoji swoops in, green splat effect, splat drops, "SPLAT!" impact text |

- Toggle available in Settings menu
- Persists across sessions (localStorage)
- Can be changed mid-game without restart
- **Power Slap scaling**: When Power Slap is enabled, all animation elements (particle count, sizes, travel distances, durations) scale with hold intensity (0→1). Quick taps give minimal animations; full 500ms holds give dramatic, oversized effects.

---

## Image Sources

### Default Images
Levels use themed Unsplash images (8 per theme: kitchen, garden, fantasy, retro).

### Local Folder Picker
Players can use their own images as level backgrounds:
1. Settings → "Pick Local Folder..." → browser folder picker opens
2. Select a folder containing image files (JPEG, PNG, WebP, GIF)
3. Images are sorted alphabetically and assigned to levels
4. If filename contains a theme name (e.g., "kitchen-sunset.jpg"), it's categorized to that theme
5. "Reset" button reverts to Unsplash defaults

**Technical**: Uses `showDirectoryPicker` API (Chrome/Edge) with `<input webkitdirectory>` fallback (Firefox/Safari). Images loaded as `URL.createObjectURL()` — no upload needed.

### Original Plan (Not Implemented)
Gemini Pro AI image generation was originally planned but was replaced with the local folder picker approach for simplicity and offline support.

---

## Scoring System

| Action | Points |
|--------|--------|
| Find a fly | 100 base |
| Time bonus | +10 per second remaining |
| Accuracy bonus | +50 if no misclicks |
| Streak bonus | x1.5 multiplier for consecutive finds |
| Power Slap bonus | x1.0–2.0 multiplier based on hold duration (requires toggle) |
| Fly escaped | -50 per fly |

### Power Slap
- **Toggle**: Settings → "Power Slap" (off by default)
- **Mechanic**: Hold mousedown on a fly. Longer hold (up to 500ms) = higher intensity (0–1)
- **Score**: `intensityMultiplier = 1 + intensity * 1.0` → 1.0x to 2.0x applied to total
- **Animation**: Particle count, burst size, travel distance, emoji size, and duration all scale with intensity
- **No visual charge indicator** — player discovers the mechanic naturally
- **Score popup**: Shows "x2.0 power!" line when intensity multiplier > 1.01

---

## User Experience

### Onboarding
- Quick 3-image tutorial showing easy-to-find flies
- Introduce mechanics gradually (timer, movement, camouflage)

### Feedback & Polish
- Satisfying sound effects for finds and escapes
- Screen shake on misclick (subtle)
- Particle effects when fly is caught
- Buzzing ambient sound that fades as flies are found

### Accessibility
- Colorblind-friendly fly indicators (optional)
- Adjustable timer for casual mode
- Hint system (limited uses, reduces score)

---

## Technical Considerations

### Platform: Web App
- **Framework**: React 18+ with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Multiplayer**: WebSocket for real-time sync (Socket.io)
- **Hosting**: Static hosting (Vercel, Netlify) + serverless functions

### Key Components
- Image display with click detection
- Timer system with visual countdown
- Fly animation system (CSS/Canvas)
- Leaderboard backend
- User accounts (optional, for progress saving)
- Settings persistence (localStorage): animation style, sound, music, casual mode, power slap

---

## Open Questions for Future Discussion

1. **Monetization** - Free with ads? One-time purchase? Cosmetic microtransactions?
2. **User-Generated Content** - Allow players to create/share their own levels?
3. **Mobile Optimization** - Responsive design or dedicated mobile version later?
4. **Offline Play** - Cache levels for offline single-player?

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
| **Cute Mode** (Default) | Fly sparkles, pops with particle effects, points float up with a cheerful sound |
| **Wild Mode** | A hand swoops in and smacks the fly with a satisfying splat effect and sound |

- Toggle available in Settings menu
- Persists across sessions (localStorage)
- Can be changed mid-game without restart

---

## Image Generation Strategy

Using **Gemini Pro** for AI image generation:

### Generation Approach
1. Create base scene prompts for each theme/difficulty
2. Generate images with specific "hiding spots" in mind
3. Programmatically overlay fly sprites at calculated positions
4. Store fly positions as metadata for hit detection

### Alternative Hybrid Approach
1. Generate scenic backgrounds with Gemini
2. Use separate fly asset library for consistent recognition
3. Composite flies into scenes with appropriate scaling/rotation
4. Apply post-processing to blend flies naturally

---

## Scoring System

| Action | Points |
|--------|--------|
| Find a fly | 100 base |
| Time bonus | +10 per second remaining |
| Accuracy bonus | +50 if no misclicks |
| Streak bonus | x1.5 multiplier for consecutive finds |
| Fly escaped | -50 per fly |

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
- Settings persistence (localStorage)

---

## Open Questions for Future Discussion

1. **Monetization** - Free with ads? One-time purchase? Cosmetic microtransactions?
2. **User-Generated Content** - Allow players to create/share their own levels?
3. **Mobile Optimization** - Responsive design or dedicated mobile version later?
4. **Offline Play** - Cache levels for offline single-player?

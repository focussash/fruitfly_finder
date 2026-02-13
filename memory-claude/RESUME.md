# Session Resume Notes

*Last updated: 2026-02-12*

## Current Status

**Completed**: Steps 1-15, LAN Multiplayer, Power Slap, Local Folder Picker
- Step 11 modified: Local images support instead of Gemini integration
- Step 14: Endless Mode
- Step 15: Multiplayer Foundation + Head-to-Head
- LAN Multiplayer: Cross-PC play on same WiFi
- Power Slap: Hold-to-charge mechanic (up to 2.0x score bonus, scaled animations)
- Local Folder Picker: Browser folder picker replaced HEAD-request scanner

**NOT YET TESTED**: Multiplayer (both Step 15 base + LAN support), Power Slap, Folder Picker
- User will test manually later — do not assume they work

**Next**: Step 17 (Polish & Sounds)

## Startup Commands

```bash
cd E:\Random\Pet_projects\Fruitfly_finder
npm run server    # Start multiplayer server (port 3001) — now prints LAN IP
npm run dev       # Start Vite dev server — now shows Network URL for LAN
```

## What Was Just Done (Latest Session)

### Power Slap Feature
- Added `powerSlap: boolean` to Settings (off by default)
- Fly.tsx uses pointer events (pointerDown/pointerUp/pointerCancel) with setPointerCapture
- Hold duration measured: `intensity = clamp(holdDuration / 500ms, 0, 1)`
- Scoring: `intensityMultiplier = 1 + intensity * (2.0 - 1)` → 1.0x to 2.0x
- CatchAnimation scales particle count, sizes, travel distances, durations by intensity
- CSS `sparkle-out` keyframe uses `var(--travel, 50px)` instead of hardcoded value
- ScoreDisplay shows "x2.0 power!" line when intensity multiplier > 1.01
- Settings toggle: "Power Slap — Hold longer for bigger catches and bonus points"

### Local Folder Picker Feature
- Removed `useLocalImages` toggle and `scanLocalImages()` HEAD-request approach
- New `readFolderImages()` uses `showDirectoryPicker` (Chrome/Edge) with `<input webkitdirectory>` fallback
- Object URLs tracked in module-level array, revoked via `revokeLocalFolderImages()`
- Settings UI: "Pick Local Folder..." button + "Reset" button + status text
- App.tsx: `handlePickLocalFolder` and `handleClearLocalImages` callbacks

### Verification
- `npx tsc --noEmit` — passes clean
- `npx vite build` — passes (84 modules, 302 KB JS)

## Testing Checklists

### Power Slap Testing
1. Default (off): Click flies normally — should score and animate identically to before
2. Enable in Settings: Toggle "Power Slap" on
3. Quick-tap a fly → small animation, base score (multiplier ~1.0x)
4. Hold ~500ms then release → bigger animation, score popup shows "x2.0 power!" line
5. Verify Settings toggle persists across page refresh

### Folder Picker Testing
1. Settings → "Pick Local Folder..." → browser folder picker opens
2. Select a folder with images → levels reload with those images
3. Firefox: Same flow but shows folder/file selection dialog
4. "Reset" → levels revert to Unsplash defaults
5. Cancel dialog → nothing changes

### Multiplayer Testing Checklist (when ready)

#### Same-PC Test
1. Start server: `npm run server` — verify LAN IP is printed
2. Start client: `npm run dev` — verify Network URL shown
3. Open two browser tabs at http://localhost:5173
4. Tab 1: Multiplayer → Connect → Create Room → note the 4-char code
5. Tab 2: Multiplayer → Connect → Join Room → enter code
6. Both tabs: Ready Up → game should start with same level
7. Play in both tabs, verify opponent progress shows
8. Verify results comparison screen appears
9. Test rematch, disconnect handling

#### Cross-PC LAN Test
1. Host runs `npm run server` + `npm run dev`
2. Note the Network URL from Vite output (e.g., `http://192.168.1.5:5173`)
3. From another PC on same WiFi, open that Network URL
4. Server address should auto-detect in the Multiplayer connect screen
5. Create/join room and play as usual

## Recent Changes Summary

- **Power Slap**: Pointer-event hold-to-charge mechanic gated by Settings toggle
- **Local Folder Picker**: Browser-native folder picker replacing HEAD request scanner
- **Settings**: `useLocalImages` removed, `powerSlap` added, folder picker buttons added

## Reference Documents

- `memory-claude/implementation-plan.md` - Full step-by-step plan
- `memory-claude/architecture.md` - Progress log and technical decisions
- `memory-claude/app-design.md` - Feature specifications

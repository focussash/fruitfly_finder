// GameScreen.tsx - Main game screen layout

import { GameCanvas } from '../game/GameCanvas';
import { Timer } from '../game/Timer';
import { ScoreDisplay } from '../game/ScoreDisplay';

export function GameScreen() {
  return (
    <div className="game-screen flex flex-col items-center gap-4 p-4">
      <div className="flex justify-between w-full max-w-4xl">
        <Timer />
        <ScoreDisplay />
      </div>
      <GameCanvas />
    </div>
  );
}

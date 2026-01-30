// GameScreen.tsx - Main game screen layout during playing/paused states

import { ReactNode } from 'react';
import { Timer } from '../game/Timer';
import { ScoreDisplay } from '../game/ScoreDisplay';

interface GameScreenProps {
  score: number;
  streak: number;
  foundCount: number;
  totalFlies: number;
  escapedCount: number;
  misclicks: number;
  time: number;
  maxTime: number;
  isRunning: boolean;
  casualMode: boolean;
  onPause: () => void;
  children: ReactNode; // Game canvas area
}

export function GameScreen({
  score,
  streak,
  foundCount,
  totalFlies,
  escapedCount,
  misclicks,
  time,
  maxTime,
  isRunning,
  casualMode,
  onPause,
  children,
}: GameScreenProps) {
  return (
    <div className="flex-1 min-h-0 flex flex-col p-4">
      {/* Game header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        {/* Left: Score display */}
        <ScoreDisplay score={score} streak={streak} />

        {/* Center: Stats */}
        <div className="text-center">
          <div className="text-lg font-semibold">
            Found: {foundCount}/{totalFlies}
            {escapedCount > 0 && (
              <span className="text-red-400 ml-2">({escapedCount} escaped)</span>
            )}
          </div>
          <div className="text-sm text-green-200">
            Misclicks: {misclicks}
          </div>
          {casualMode && (
            <div className="text-xs text-yellow-300">Casual Mode</div>
          )}
        </div>

        {/* Right: Timer and pause */}
        <div className="flex items-center gap-4">
          <Timer
            time={time}
            maxTime={maxTime}
            isRunning={isRunning}
            urgencyThreshold={5}
          />
          <button
            onClick={onPause}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded font-semibold transition-colors"
          >
            {isRunning ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      {/* Game canvas area */}
      <div className="flex-1 min-h-0 relative">
        {children}
      </div>
    </div>
  );
}

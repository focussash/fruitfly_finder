// GameScreen.tsx - Main game screen layout during playing/paused states

import type { ReactNode } from 'react';
import { Timer } from '../game/Timer';
import { ScoreDisplay } from '../game/ScoreDisplay';

interface GameScreenProps {
  levelNumber: number;
  levelName: string;
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
  // Endless mode props
  isEndless?: boolean;
  lives?: number;
  totalScore?: number;
  // Multiplayer props
  isMultiplayer?: boolean;
  opponentName?: string;
  opponentFoundCount?: number;
  opponentFinished?: boolean;
}

export function GameScreen({
  levelNumber,
  levelName,
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
  isEndless = false,
  lives = 0,
  totalScore = 0,
  isMultiplayer = false,
  opponentName,
  opponentFoundCount = 0,
  opponentFinished = false,
}: GameScreenProps) {
  return (
    <div className="flex-1 min-h-0 flex flex-col p-4">
      {/* Game header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        {/* Left: Level info + Score */}
        <div className="flex items-center gap-4">
          <div className="bg-black/30 rounded-lg px-3 py-1">
            <div className="text-xs text-white/60">
              {isEndless ? `Round ${levelNumber}` : `Level ${levelNumber}`}
            </div>
            <div className="text-sm font-semibold text-white">{levelName}</div>
          </div>
          {isEndless && (
            <div className="bg-black/30 rounded-lg px-3 py-1">
              <div className="text-xs text-white/60">Lives</div>
              <div className="text-sm font-semibold text-red-400">
                {'❤️'.repeat(Math.max(0, lives))}
                {lives <= 0 && <span className="text-gray-500">None</span>}
              </div>
            </div>
          )}
          <ScoreDisplay score={isEndless ? totalScore + score : score} streak={streak} />
        </div>

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
          {isMultiplayer && opponentName && (
            <div className="mt-1 bg-blue-900/40 rounded px-2 py-1">
              <div className="text-xs text-blue-300">
                {opponentName}: {opponentFoundCount}/{totalFlies} found
                {opponentFinished && <span className="text-yellow-400 ml-1">(done)</span>}
              </div>
            </div>
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

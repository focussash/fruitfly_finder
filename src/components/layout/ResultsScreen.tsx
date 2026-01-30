// ResultsScreen.tsx - Shown after game ends (won or lost)

import type { Fly } from '../../types/game';

interface ResultsScreenProps {
  won: boolean;
  score: number;
  flies: Fly[];
  misclicks: number;
  timeRemaining: number;
  finalBonus: number;
  hasNextLevel: boolean;
  onPlayAgain: () => void;
  onNextLevel: () => void;
  onQuit: () => void;
}

export function ResultsScreen({
  won,
  score,
  flies,
  misclicks,
  timeRemaining,
  finalBonus,
  hasNextLevel,
  onPlayAgain,
  onNextLevel,
  onQuit,
}: ResultsScreenProps) {
  const foundCount = flies.filter(f => f.found).length;
  const totalFlies = flies.length;
  const escapedCount = flies.filter(f => f.escaped).length;
  const accuracy = foundCount + misclicks > 0
    ? Math.round((foundCount / (foundCount + misclicks)) * 100)
    : 0;

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="bg-gray-800/95 rounded-xl p-8 text-center shadow-2xl border border-gray-700 w-full max-w-md">
        {/* Header */}
        <div className="mb-6">
          <h3 className={`text-4xl font-bold mb-2 ${won ? 'text-green-400' : 'text-red-400'}`}>
            {won ? 'You Won!' : "Time's Up!"}
          </h3>
          <p className="text-gray-300">
            {won
              ? `Found all flies with ${timeRemaining}s to spare!`
              : `Found ${foundCount} of ${totalFlies} flies`}
          </p>
        </div>

        {/* Score */}
        <div className="mb-6 py-4 bg-black/30 rounded-lg">
          <div className="text-5xl font-bold text-yellow-400 mb-1">
            {score.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">Final Score</div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
          <div className="bg-black/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-400">{foundCount}/{totalFlies}</div>
            <div className="text-gray-400">Flies Found</div>
          </div>
          <div className="bg-black/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-400">{accuracy}%</div>
            <div className="text-gray-400">Accuracy</div>
          </div>
          <div className="bg-black/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-400">{escapedCount}</div>
            <div className="text-gray-400">Escaped</div>
          </div>
          <div className="bg-black/20 rounded-lg p-3">
            <div className="text-2xl font-bold text-gray-300">{misclicks}</div>
            <div className="text-gray-400">Misclicks</div>
          </div>
        </div>

        {/* Bonuses */}
        {finalBonus > 0 && (
          <div className="mb-6 text-yellow-300 font-semibold">
            +{finalBonus} Accuracy Bonus!
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {won && hasNextLevel && (
            <button
              onClick={onNextLevel}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-lg transition-colors"
            >
              Next Level →
            </button>
          )}
          <button
            onClick={onPlayAgain}
            className={`px-6 py-3 rounded-lg font-bold transition-colors ${
              won && hasNextLevel
                ? 'bg-gray-700 hover:bg-gray-600 text-lg'
                : 'bg-green-600 hover:bg-green-500 text-lg'
            }`}
          >
            Play Again
          </button>
          <button
            onClick={onQuit}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}

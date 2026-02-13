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
  // Endless mode props
  isEndless?: boolean;
  endlessRound?: number;
  endlessTotalScore?: number;
  endlessLives?: number;
  endlessHighScore?: number;
  endlessBestRound?: number;
  isGameOver?: boolean;
  onContinue?: () => void;
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
  isEndless = false,
  endlessRound = 0,
  endlessTotalScore = 0,
  endlessLives = 0,
  endlessHighScore = 0,
  endlessBestRound = 0,
  isGameOver = false,
  onContinue,
}: ResultsScreenProps) {
  const foundCount = flies.filter(f => f.found).length;
  const totalFlies = flies.length;
  const escapedCount = flies.filter(f => f.escaped).length;
  const accuracy = foundCount + misclicks > 0
    ? Math.round((foundCount / (foundCount + misclicks)) * 100)
    : 0;

  // Endless mode: game over screen
  if (isEndless && isGameOver) {
    const isNewHighScore = endlessTotalScore > endlessHighScore;
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-gray-800/95 rounded-xl p-8 text-center shadow-2xl border border-red-700/50 w-full max-w-md">
          <div className="mb-6">
            <h3 className="text-4xl font-bold mb-2 text-red-400">Game Over!</h3>
            <p className="text-gray-300">You made it to Round {endlessRound}</p>
          </div>

          <div className="mb-6 py-4 bg-black/30 rounded-lg">
            <div className="text-5xl font-bold text-yellow-400 mb-1">
              {endlessTotalScore.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Total Score</div>
            {isNewHighScore && (
              <div className="text-lg text-yellow-300 font-bold mt-2">New High Score!</div>
            )}
          </div>

          {!isNewHighScore && endlessHighScore > 0 && (
            <div className="mb-4 text-sm text-gray-400">
              High Score: {endlessHighScore.toLocaleString()} (Round {endlessBestRound})
            </div>
          )}

          {/* Last round stats */}
          <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
            <div className="bg-black/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-400">{foundCount}/{totalFlies}</div>
              <div className="text-gray-400">Last Round</div>
            </div>
            <div className="bg-black/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-purple-400">{endlessRound}</div>
              <div className="text-gray-400">Rounds Played</div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={onPlayAgain}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold text-lg transition-colors"
            >
              Try Again
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

  // Endless mode: round complete (continue playing)
  if (isEndless && !isGameOver) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-gray-800/95 rounded-xl p-8 text-center shadow-2xl border border-gray-700 w-full max-w-md">
          <div className="mb-6">
            <h3 className={`text-4xl font-bold mb-2 ${won ? 'text-green-400' : 'text-orange-400'}`}>
              {won ? 'Round Complete!' : 'Flies Escaped!'}
            </h3>
            <p className="text-gray-300">
              {won
                ? `Cleared Round ${endlessRound}!`
                : `${escapedCount} ${escapedCount === 1 ? 'fly' : 'flies'} escaped!`}
            </p>
          </div>

          <div className="mb-4 py-4 bg-black/30 rounded-lg">
            <div className="text-3xl font-bold text-yellow-400 mb-1">
              +{score.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Round Score</div>
            <div className="text-lg text-white mt-2">
              Total: {endlessTotalScore.toLocaleString()}
            </div>
          </div>

          {/* Lives remaining */}
          <div className="mb-6 text-lg">
            <span className="text-gray-400">Lives: </span>
            <span className="text-red-400">{'❤️'.repeat(Math.max(0, endlessLives))}</span>
          </div>

          {finalBonus > 0 && (
            <div className="mb-4 text-yellow-300 font-semibold">
              +{finalBonus} Accuracy Bonus!
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={onContinue}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold text-lg transition-colors"
            >
              Continue → Round {endlessRound + 1}
            </button>
            <button
              onClick={onQuit}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
            >
              End Run
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Campaign mode: standard results
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

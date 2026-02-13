// MultiplayerResults.tsx - Head-to-head results comparison screen

import type { GameResult } from '../../hooks/useMultiplayer';

interface MultiplayerResultsProps {
  results: GameResult[];
  mySocketId?: string;
  onRematch: () => void;
  onQuit: () => void;
}

export function MultiplayerResults({
  results,
  onRematch,
  onQuit,
}: MultiplayerResultsProps) {
  // Sort by score (highest first)
  const sorted = [...results].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const isTie = sorted.length === 2 && sorted[0].score === sorted[1].score;

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="bg-gray-800/95 rounded-xl p-8 text-center shadow-2xl border border-gray-700 w-full max-w-lg">
        {/* Header */}
        <div className="mb-6">
          <h3 className={`text-4xl font-bold mb-2 ${isTie ? 'text-yellow-400' : 'text-green-400'}`}>
            {isTie ? "It's a Tie!" : 'Match Over!'}
          </h3>
          {!isTie && (
            <p className="text-gray-300">
              {winner.name} wins!
            </p>
          )}
        </div>

        {/* Player comparison */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {sorted.map((player, index) => (
            <div
              key={player.name}
              className={`rounded-lg p-4 ${
                index === 0 && !isTie
                  ? 'bg-green-900/30 border-2 border-green-500'
                  : 'bg-gray-700/50 border-2 border-gray-600'
              }`}
            >
              {index === 0 && !isTie && (
                <div className="text-yellow-400 text-sm font-semibold mb-1">Winner</div>
              )}
              <div className="font-bold text-lg mb-2">{player.name}</div>

              <div className="text-3xl font-bold text-yellow-400 mb-3">
                {player.score.toLocaleString()}
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Found:</span>
                  <span className="text-green-400">{player.foundCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Misclicks:</span>
                  <span className="text-gray-300">{player.misclicks}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onRematch}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-lg transition-colors"
          >
            Rematch
          </button>
          <button
            onClick={onQuit}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
          >
            Leave Room
          </button>
        </div>
      </div>
    </div>
  );
}

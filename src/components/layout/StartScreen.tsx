// StartScreen.tsx - Initial menu screen shown in idle state

interface StartScreenProps {
  onStart: () => void;
  onEndless: () => void;
  onMultiplayer: () => void;
  onSettings: () => void;
  endlessHighScore?: number;
  endlessBestRound?: number;
}

export function StartScreen({ onStart, onEndless, onMultiplayer, onSettings, endlessHighScore = 0, endlessBestRound = 0 }: StartScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        {/* Fly icon */}
        <div className="mb-4">
          <svg viewBox="0 0 32 32" className="w-24 h-24 mx-auto drop-shadow-lg">
            <ellipse cx="16" cy="18" rx="6" ry="8" fill="#2d1810" />
            <circle cx="16" cy="9" r="5" fill="#1a0f0a" />
            <circle cx="13" cy="8" r="2.5" fill="#8b0000" />
            <circle cx="19" cy="8" r="2.5" fill="#8b0000" />
            <circle cx="12.5" cy="7" r="0.8" fill="#fff" opacity="0.6" />
            <circle cx="18.5" cy="7" r="0.8" fill="#fff" opacity="0.6" />
            <ellipse cx="8" cy="15" rx="6" ry="4" fill="#a0c4e8" opacity="0.7" transform="rotate(-30 8 15)" />
            <ellipse cx="24" cy="15" rx="6" ry="4" fill="#a0c4e8" opacity="0.7" transform="rotate(30 24 15)" />
          </svg>
        </div>

        <h2 className="text-5xl font-bold mb-3">Fruitfly Finder</h2>
        <p className="text-xl text-green-200 max-w-md mx-auto">
          Find all the hidden fruitflies before time runs out!
        </p>
      </div>

      <div className="flex flex-col gap-4 w-64">
        <button
          onClick={onStart}
          className="px-8 py-4 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-xl transition-colors shadow-lg hover:shadow-xl"
        >
          Campaign
        </button>
        <button
          onClick={onEndless}
          className="px-8 py-4 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-xl transition-colors shadow-lg hover:shadow-xl"
        >
          Endless Mode
        </button>
        {endlessHighScore > 0 && (
          <div className="text-center text-sm text-gray-400">
            Best: {endlessHighScore.toLocaleString()} pts (Round {endlessBestRound})
          </div>
        )}
        <button
          onClick={onMultiplayer}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-xl transition-colors shadow-lg hover:shadow-xl"
        >
          Multiplayer
        </button>
        <button
          onClick={onSettings}
          className="px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold transition-colors"
        >
          Settings
        </button>
      </div>
    </div>
  );
}

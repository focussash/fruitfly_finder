// LevelSelect.tsx - Level selection grid

import type { Level, LevelProgress } from '../../types/game';

interface LevelSelectProps {
  levels: Level[];
  isLevelUnlocked: (levelId: string) => boolean;
  getLevelProgress: (levelId: string) => LevelProgress | undefined;
  onSelectLevel: (level: Level) => void;
  onBack: () => void;
}

const themeColors: Record<string, string> = {
  kitchen: 'from-orange-600 to-amber-700',
  garden: 'from-green-600 to-emerald-700',
  fantasy: 'from-purple-600 to-indigo-700',
  retro: 'from-pink-600 to-rose-700',
};

const themeIcons: Record<string, string> = {
  kitchen: '🍳',
  garden: '🌿',
  fantasy: '✨',
  retro: '👾',
};

export function LevelSelect({
  levels,
  isLevelUnlocked,
  getLevelProgress,
  onSelectLevel,
  onBack,
}: LevelSelectProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-auto">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <span className="text-xl">←</span>
            <span>Back</span>
          </button>
          <h2 className="text-2xl font-bold text-white">Select Level</h2>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>

        {/* Level Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {levels.map((level, index) => {
            const unlocked = isLevelUnlocked(level.id);
            const progress = getLevelProgress(level.id);
            const colorClass = themeColors[level.theme] || 'from-gray-600 to-gray-700';
            const icon = themeIcons[level.theme] || '🎮';

            return (
              <button
                key={level.id}
                onClick={() => unlocked && onSelectLevel(level)}
                disabled={!unlocked}
                className={`
                  relative rounded-xl overflow-hidden transition-all duration-200
                  ${unlocked
                    ? 'hover:scale-105 hover:shadow-lg cursor-pointer'
                    : 'opacity-50 cursor-not-allowed grayscale'
                  }
                `}
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${colorClass}`} />

                {/* Content */}
                <div className="relative p-4 text-left">
                  {/* Level number and icon */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60 text-sm font-medium">
                      Level {index + 1}
                    </span>
                    <span className="text-2xl">{icon}</span>
                  </div>

                  {/* Level name */}
                  <h3 className="text-white font-bold text-lg leading-tight mb-2">
                    {level.name}
                  </h3>

                  {/* Difficulty dots */}
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3].map(d => (
                      <div
                        key={d}
                        className={`w-2 h-2 rounded-full ${
                          d <= level.difficulty ? 'bg-yellow-400' : 'bg-white/20'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Progress indicator */}
                  {progress?.completed && (
                    <div className="flex items-center gap-1 text-green-300 text-sm">
                      <span>✓</span>
                      <span>{progress.bestScore} pts</span>
                    </div>
                  )}

                  {/* Lock overlay */}
                  {!unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <span className="text-4xl">🔒</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Info text */}
        <p className="text-center text-white/50 text-sm mt-6">
          Complete levels to unlock the next one
        </p>
      </div>
    </div>
  );
}

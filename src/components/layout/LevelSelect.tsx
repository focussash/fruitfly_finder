// LevelSelect.tsx - Level selection within a world

import type { Level, LevelProgress } from '../../types/game';
import type { World } from '../../data/worlds';

interface LevelSelectProps {
  world: World;
  levels: Level[];
  isLevelUnlocked: (levelId: string) => boolean;
  getLevelProgress: (levelId: string) => LevelProgress | undefined;
  onSelectLevel: (level: Level) => void;
  onBack: () => void;
}

export function LevelSelect({
  world,
  levels,
  isLevelUnlocked,
  getLevelProgress,
  onSelectLevel,
  onBack,
}: LevelSelectProps) {
  const completedCount = levels.filter(l => getLevelProgress(l.id)?.completed).length;

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <span className="text-xl">←</span>
          <span>Worlds</span>
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 justify-center">
            <span>{world.icon}</span>
            <span>{world.name}</span>
          </h2>
          <p className="text-white/60 text-sm">{completedCount}/{levels.length} completed</p>
        </div>
        <div className="w-20" />
      </div>

      {/* Level Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto">
          <div className="grid grid-cols-4 gap-3">
            {levels.map((level, index) => {
              const unlocked = isLevelUnlocked(level.id);
              const progress = getLevelProgress(level.id);

              return (
                <button
                  key={level.id}
                  onClick={() => unlocked && onSelectLevel(level)}
                  disabled={!unlocked}
                  className={`
                    relative rounded-xl overflow-hidden transition-all duration-200 aspect-square
                    ${unlocked
                      ? 'hover:scale-105 hover:shadow-lg cursor-pointer'
                      : 'opacity-40 cursor-not-allowed'
                    }
                  `}
                >
                  {/* Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${world.color}`} />

                  {/* Content */}
                  <div className="relative p-2 h-full flex flex-col items-center justify-center">
                    {/* Level number */}
                    <span className="text-3xl font-bold text-white">
                      {index + 1}
                    </span>

                    {/* Level name */}
                    <span className="text-xs text-white/70 text-center leading-tight mt-1 line-clamp-2">
                      {level.name}
                    </span>

                    {/* Difficulty stars */}
                    <div className="flex gap-0.5 mt-1">
                      {[1, 2, 3].map(d => (
                        <span
                          key={d}
                          className={`text-xs ${d <= level.difficulty ? 'text-yellow-400' : 'text-white/20'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>

                    {/* Completed checkmark */}
                    {progress?.completed && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}

                    {/* Best score */}
                    {progress?.completed && (
                      <div className="absolute bottom-1 left-1 right-1 text-center">
                        <span className="text-xs text-yellow-300 font-medium">
                          {progress.bestScore}
                        </span>
                      </div>
                    )}

                    {/* Lock overlay */}
                    {!unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <span className="text-2xl">🔒</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-white/40 text-xs mt-3 flex-shrink-0">
        {completedCount === levels.length
          ? '★ World Complete! ★'
          : 'Complete levels to unlock the next one'}
      </p>
    </div>
  );
}

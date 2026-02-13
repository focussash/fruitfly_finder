// WorldSelect.tsx - World selection screen for campaign mode

import type { World } from '../../data/worlds';

interface WorldSelectProps {
  worlds: World[];
  isWorldUnlocked: (worldId: string) => boolean;
  getWorldProgress: (worldId: string) => { completed: number; total: number };
  onSelectWorld: (world: World) => void;
  onBack: () => void;
}

export function WorldSelect({
  worlds,
  isWorldUnlocked,
  getWorldProgress,
  onSelectWorld,
  onBack,
}: WorldSelectProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <span className="text-xl">←</span>
            <span>Back</span>
          </button>
          <h2 className="text-3xl font-bold text-white">Select World</h2>
          <div className="w-16" />
        </div>

        {/* World Grid */}
        <div className="grid grid-cols-2 gap-4">
          {worlds.map((world, index) => {
            const unlocked = isWorldUnlocked(world.id);
            const progress = getWorldProgress(world.id);
            const progressPercent = (progress.completed / progress.total) * 100;

            return (
              <button
                key={world.id}
                onClick={() => unlocked && onSelectWorld(world)}
                disabled={!unlocked}
                className={`
                  relative rounded-xl overflow-hidden transition-all duration-200 aspect-[3/2]
                  ${unlocked
                    ? 'hover:scale-105 hover:shadow-xl cursor-pointer'
                    : 'opacity-50 cursor-not-allowed grayscale'
                  }
                `}
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${world.color}`} />

                {/* Content */}
                <div className="relative p-5 h-full flex flex-col text-left">
                  {/* World number badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-black/30 px-2 py-0.5 rounded text-sm font-medium">
                      World {index + 1}
                    </span>
                    <span className="text-4xl">{world.icon}</span>
                  </div>

                  {/* World name */}
                  <h3 className="text-2xl font-bold text-white mb-1">
                    {world.name}
                  </h3>

                  {/* Description */}
                  <p className="text-white/70 text-sm flex-1">
                    {world.description}
                  </p>

                  {/* Progress bar */}
                  {unlocked && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-white/70 mb-1">
                        <span>{progress.completed}/{progress.total} levels</span>
                        <span>{Math.round(progressPercent)}%</span>
                      </div>
                      <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white/80 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Lock overlay */}
                  {!unlocked && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                      <span className="text-5xl mb-2">🔒</span>
                      <span className="text-white/80 text-sm">Complete previous world</span>
                    </div>
                  )}

                  {/* Completed badge */}
                  {progress.completed === progress.total && progress.total > 0 && (
                    <div className="absolute top-3 right-3 bg-yellow-500 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                      ★ Complete
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Info text */}
        <p className="text-center text-white/50 text-sm mt-6">
          Complete all levels in a world to unlock the next one
        </p>
      </div>
    </div>
  );
}

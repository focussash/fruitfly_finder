// PauseOverlay.tsx - Overlay shown when game is paused

interface PauseOverlayProps {
  onResume: () => void;
  onSettings: () => void;
  onQuit: () => void;
}

export function PauseOverlay({ onResume, onSettings, onQuit }: PauseOverlayProps) {
  return (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-40 rounded-lg">
      <div className="bg-gray-800/95 rounded-xl p-8 text-center shadow-2xl border border-gray-700 w-72">
        <h3 className="text-3xl font-bold mb-6">Paused</h3>

        <div className="flex flex-col gap-3">
          <button
            onClick={onResume}
            className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold text-lg transition-colors"
          >
            Resume
          </button>
          <button
            onClick={onSettings}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
          >
            Settings
          </button>
          <button
            onClick={onQuit}
            className="px-6 py-3 bg-red-700 hover:bg-red-600 rounded-lg font-semibold transition-colors"
          >
            Quit
          </button>
        </div>
      </div>
    </div>
  );
}

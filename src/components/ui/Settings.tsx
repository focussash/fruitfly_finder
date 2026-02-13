// Settings.tsx - Settings panel component

import type { Settings as SettingsType } from '../../types/game';

interface SettingsProps {
  settings: SettingsType;
  onUpdateSetting: <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => void;
  onClose?: () => void;
  onPickLocalFolder?: () => void;
  onClearLocalImages?: () => void;
  localImagesLoaded?: boolean;
}

export function Settings({ settings, onUpdateSetting, onClose, onPickLocalFolder, onClearLocalImages, localImagesLoaded }: SettingsProps) {
  return (
    <div className="bg-gray-800/95 rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Settings</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl leading-none"
          >
            &times;
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Catch Animation Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Catch Animation Style
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => onUpdateSetting('catchAnimation', 'cute')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                settings.catchAnimation === 'cute'
                  ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span className="block text-lg">✨</span>
              <span>Cute</span>
            </button>
            <button
              onClick={() => onUpdateSetting('catchAnimation', 'wild')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                settings.catchAnimation === 'wild'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span className="block text-lg">👋</span>
              <span>Wild</span>
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {settings.catchAnimation === 'cute'
              ? 'Sparkles and gentle pop animation'
              : 'Hand swoops in with splat effect'}
          </p>
        </div>

        {/* Sound Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Sound Effects
            </label>
            <p className="text-xs text-gray-400">Play sounds when catching flies</p>
          </div>
          <ToggleSwitch
            enabled={settings.soundEnabled}
            onChange={(value) => onUpdateSetting('soundEnabled', value)}
          />
        </div>

        {/* Music Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Background Music
            </label>
            <p className="text-xs text-gray-400">Play ambient music during gameplay</p>
          </div>
          <ToggleSwitch
            enabled={settings.musicEnabled}
            onChange={(value) => onUpdateSetting('musicEnabled', value)}
          />
        </div>

        {/* Casual Mode Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Casual Mode
            </label>
            <p className="text-xs text-gray-400">Extended timer for relaxed play</p>
          </div>
          <ToggleSwitch
            enabled={settings.casualMode}
            onChange={(value) => onUpdateSetting('casualMode', value)}
          />
        </div>

        {/* Power Slap Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Power Slap
            </label>
            <p className="text-xs text-gray-400">Hold longer for bigger catches and bonus points</p>
          </div>
          <ToggleSwitch
            enabled={settings.powerSlap}
            onChange={(value) => onUpdateSetting('powerSlap', value)}
          />
        </div>

        {/* Background Images (Folder Picker) */}
        {onPickLocalFolder && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Background Images
            </label>
            <div className="flex gap-2">
              <button
                onClick={onPickLocalFolder}
                className="flex-1 py-2 px-4 rounded-lg font-semibold transition-all bg-blue-600 hover:bg-blue-500 text-white text-sm"
              >
                {localImagesLoaded ? 'Change Folder...' : 'Pick Local Folder...'}
              </button>
              {localImagesLoaded && onClearLocalImages && (
                <button
                  onClick={onClearLocalImages}
                  className="py-2 px-4 rounded-lg font-semibold transition-all bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm"
                >
                  Reset
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {localImagesLoaded
                ? 'Custom images loaded. Click "Reset" to revert to defaults.'
                : 'Select a folder with images to use as level backgrounds'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Toggle switch component
interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (value: boolean) => void;
}

function ToggleSwitch({ enabled, onChange }: ToggleSwitchProps) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-14 h-8 rounded-full transition-colors ${
        enabled ? 'bg-green-500' : 'bg-gray-600'
      }`}
    >
      <div
        className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
          enabled ? 'translate-x-7' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

// useSettings.ts - Settings hook with localStorage persistence
// TODO: Implement in Step 6

import { useState } from 'react';
import type { Settings } from '../types/game';

const defaultSettings: Settings = {
  catchAnimation: 'cute',
  soundEnabled: true,
  musicEnabled: true,
  casualMode: false,
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  return {
    settings,
    setSettings,
  };
}

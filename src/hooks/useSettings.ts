// useSettings.ts - Settings hook with localStorage persistence

import { useState, useEffect, useCallback } from 'react';
import type { Settings } from '../types/game';

const STORAGE_KEY = 'fruitfly-finder-settings';

const defaultSettings: Settings = {
  catchAnimation: 'cute',
  soundEnabled: true,
  musicEnabled: true,
  casualMode: false,
};

function loadSettings(): Settings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle new settings added in updates
      return { ...defaultSettings, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load settings from localStorage:', e);
  }
  return defaultSettings;
}

function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings to localStorage:', e);
  }
}

export function useSettings() {
  const [settings, setSettingsState] = useState<Settings>(loadSettings);

  // Save to localStorage whenever settings change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const setSettings = useCallback((newSettings: Settings | ((prev: Settings) => Settings)) => {
    setSettingsState(newSettings);
  }, []);

  const updateSetting = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettingsState(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettingsState(defaultSettings);
  }, []);

  return {
    settings,
    setSettings,
    updateSetting,
    resetSettings,
  };
}

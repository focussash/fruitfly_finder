// useLevelProgress.ts - Track level completion and scores in localStorage

import { useState, useCallback, useEffect } from 'react';
import type { LevelProgress } from '../types/game';
import { levels } from '../data/levels';

const STORAGE_KEY = 'fruitfly-finder-progress';

type ProgressMap = Record<string, LevelProgress>;

function loadProgress(): ProgressMap {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveProgress(progress: ProgressMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    console.warn('Failed to save progress to localStorage');
  }
}

export function useLevelProgress() {
  const [progress, setProgress] = useState<ProgressMap>(loadProgress);

  // Save to localStorage whenever progress changes
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const completeLevel = useCallback((levelId: string, score: number, timeRemaining: number) => {
    setProgress(prev => {
      const existing = prev[levelId];
      const newProgress: LevelProgress = {
        completed: true,
        bestScore: existing ? Math.max(existing.bestScore, score) : score,
        bestTime: existing ? Math.max(existing.bestTime, timeRemaining) : timeRemaining,
      };
      return { ...prev, [levelId]: newProgress };
    });
  }, []);

  const isLevelUnlocked = useCallback((levelId: string): boolean => {
    // First level is always unlocked
    const levelIndex = levels.findIndex(l => l.id === levelId);
    if (levelIndex === 0) return true;

    // Check if previous level is completed
    const previousLevel = levels[levelIndex - 1];
    return progress[previousLevel.id]?.completed ?? false;
  }, [progress]);

  const getLevelProgress = useCallback((levelId: string): LevelProgress | undefined => {
    return progress[levelId];
  }, [progress]);

  const resetProgress = useCallback(() => {
    setProgress({});
  }, []);

  return {
    progress,
    completeLevel,
    isLevelUnlocked,
    getLevelProgress,
    resetProgress,
  };
}

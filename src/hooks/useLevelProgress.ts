// useLevelProgress.ts - Track level completion and scores in localStorage

import { useState, useCallback, useEffect } from 'react';
import type { LevelProgress } from '../types/game';
import { levels, getLevelsForWorld } from '../data/levels';
import { worlds, getWorldForLevel } from '../data/worlds';

const STORAGE_KEY = 'fruitfly-finder-progress';
const ENDLESS_HIGH_SCORE_KEY = 'fruitfly-finder-endless-highscore';
const ENDLESS_BEST_ROUND_KEY = 'fruitfly-finder-endless-bestround';

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

  // Check if a specific level is unlocked
  const isLevelUnlocked = useCallback((levelId: string): boolean => {
    const levelIndex = levels.findIndex(l => l.id === levelId);
    if (levelIndex === -1) return false;

    // First level of the game is always unlocked
    if (levelIndex === 0) return true;

    // First level of each world is unlocked if the world is unlocked
    const levelNumber = levelIndex + 1;
    const world = getWorldForLevel(levelNumber);
    if (world && levelNumber === world.levelRange.start) {
      return isWorldUnlocked(world.id);
    }

    // Otherwise, previous level must be completed
    const previousLevel = levels[levelIndex - 1];
    return progress[previousLevel.id]?.completed ?? false;
  }, [progress]);

  // Check if a world is unlocked
  const isWorldUnlocked = useCallback((worldId: string): boolean => {
    const worldIndex = worlds.findIndex(w => w.id === worldId);

    // First world is always unlocked
    if (worldIndex === 0) return true;

    // Check if previous world is fully completed
    const previousWorld = worlds[worldIndex - 1];
    const previousWorldLevels = getLevelsForWorld(previousWorld.id);
    return previousWorldLevels.every(level => progress[level.id]?.completed);
  }, [progress]);

  // Get progress for a specific level
  const getLevelProgress = useCallback((levelId: string): LevelProgress | undefined => {
    return progress[levelId];
  }, [progress]);

  // Get completion stats for a world
  const getWorldProgress = useCallback((worldId: string): { completed: number; total: number } => {
    const worldLevels = getLevelsForWorld(worldId);
    const completed = worldLevels.filter(level => progress[level.id]?.completed).length;
    return { completed, total: worldLevels.length };
  }, [progress]);

  // Check if a world is fully completed
  const isWorldCompleted = useCallback((worldId: string): boolean => {
    const { completed, total } = getWorldProgress(worldId);
    return completed === total && total > 0;
  }, [getWorldProgress]);

  // Get total campaign progress
  const getCampaignProgress = useCallback((): { completed: number; total: number } => {
    const completed = levels.filter(level => progress[level.id]?.completed).length;
    return { completed, total: levels.length };
  }, [progress]);

  const resetProgress = useCallback(() => {
    setProgress({});
  }, []);

  // Endless mode high score
  const getEndlessHighScore = useCallback((): number => {
    try {
      return parseInt(localStorage.getItem(ENDLESS_HIGH_SCORE_KEY) || '0', 10);
    } catch {
      return 0;
    }
  }, []);

  const getEndlessBestRound = useCallback((): number => {
    try {
      return parseInt(localStorage.getItem(ENDLESS_BEST_ROUND_KEY) || '0', 10);
    } catch {
      return 0;
    }
  }, []);

  const saveEndlessHighScore = useCallback((score: number, round: number) => {
    try {
      const currentHigh = getEndlessHighScore();
      if (score > currentHigh) {
        localStorage.setItem(ENDLESS_HIGH_SCORE_KEY, String(score));
      }
      const currentBestRound = getEndlessBestRound();
      if (round > currentBestRound) {
        localStorage.setItem(ENDLESS_BEST_ROUND_KEY, String(round));
      }
    } catch {
      console.warn('Failed to save endless high score');
    }
  }, [getEndlessHighScore, getEndlessBestRound]);

  return {
    progress,
    completeLevel,
    isLevelUnlocked,
    isWorldUnlocked,
    getLevelProgress,
    getWorldProgress,
    isWorldCompleted,
    getCampaignProgress,
    resetProgress,
    getEndlessHighScore,
    getEndlessBestRound,
    saveEndlessHighScore,
  };
}

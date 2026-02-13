// difficulty.ts - Difficulty scaling utility

import { getWorldForLevel, LEVELS_PER_WORLD } from '../data/worlds';

export interface DifficultyParams {
  timeLimit: number;
  flyCount: number;
  minFlySize: number;
  maxFlySize: number;
  hasMovement: boolean;
  theme: 'kitchen' | 'garden' | 'fantasy' | 'retro';
}

// Difficulty scaling within each world (8 levels per world)
// First 3 levels: easier, middle 3: medium, last 2: harder
function getWorldDifficultyMultiplier(levelInWorld: number): number {
  if (levelInWorld <= 3) return 0; // Easy
  if (levelInWorld <= 6) return 0.5; // Medium
  return 1; // Hard
}

export function getDifficultyForLevel(levelNumber: number): DifficultyParams {
  const world = getWorldForLevel(levelNumber);
  const theme = world?.theme || 'kitchen';

  // Position within world (1-8)
  const levelInWorld = world
    ? levelNumber - world.levelRange.start + 1
    : ((levelNumber - 1) % LEVELS_PER_WORLD) + 1;

  // World number (1-4)
  const worldNumber = world
    ? parseInt(world.id.split('-')[1])
    : Math.ceil(levelNumber / LEVELS_PER_WORLD);

  // Base difficulty increases per world
  const worldMultiplier = (worldNumber - 1) * 0.25; // 0, 0.25, 0.5, 0.75
  const levelMultiplier = getWorldDifficultyMultiplier(levelInWorld);
  const totalDifficulty = worldMultiplier + levelMultiplier * 0.25;

  // Time limits: World 1: 30s, World 2: 27s, World 3: 24s, World 4: 20s
  const baseTime = 30 - (worldNumber - 1) * 3;
  const timeLimit = Math.max(15, baseTime - Math.floor(levelMultiplier * 2));

  // Fly count: starts at 3, increases with difficulty
  const baseFlyCount = 3 + worldNumber;
  const flyCount = Math.min(12, baseFlyCount + Math.floor(levelMultiplier * 2));

  // Fly sizes get smaller as difficulty increases
  const maxSize = 1.2 - totalDifficulty * 0.3;
  const minSize = 0.8 - totalDifficulty * 0.2;

  return {
    timeLimit,
    flyCount,
    minFlySize: Math.max(0.6, minSize),
    maxFlySize: Math.max(0.8, maxSize),
    hasMovement: worldNumber >= 4 && levelInWorld >= 5, // Only late game
    theme,
  };
}

// Get difficulty tier name for display
export function getDifficultyTier(levelNumber: number): 'Easy' | 'Medium' | 'Hard' {
  const world = getWorldForLevel(levelNumber);
  if (!world) return 'Easy';

  const levelInWorld = levelNumber - world.levelRange.start + 1;
  if (levelInWorld <= 3) return 'Easy';
  if (levelInWorld <= 6) return 'Medium';
  return 'Hard';
}

// Get star rating (1-3) based on difficulty within world
export function getDifficultyStars(levelNumber: number): number {
  const world = getWorldForLevel(levelNumber);
  if (!world) return 1;

  const levelInWorld = levelNumber - world.levelRange.start + 1;
  if (levelInWorld <= 3) return 1;
  if (levelInWorld <= 6) return 2;
  return 3;
}

// Endless mode difficulty - smooth continuous scaling
export function getEndlessDifficulty(round: number): DifficultyParams {
  const themes: Array<'kitchen' | 'garden' | 'fantasy' | 'retro'> = ['kitchen', 'garden', 'fantasy', 'retro'];
  const theme = themes[(round - 1) % themes.length];

  // Time: 30s at round 1, decreasing ~0.6s per round, min 12s
  const timeLimit = Math.max(12, Math.round(30 - (round - 1) * 0.6));

  // Flies: 4 at round 1, increasing ~0.4 per round, max 15
  const flyCount = Math.min(15, 4 + Math.floor((round - 1) * 0.4));

  // Sizes: shrink gradually over 30 rounds
  const sizeProgress = Math.min(1, (round - 1) / 30);
  const maxFlySize = Math.max(0.7, 1.2 - sizeProgress * 0.5);
  const minFlySize = Math.max(0.5, 0.8 - sizeProgress * 0.3);

  // Movement after round 20
  const hasMovement = round >= 20;

  return {
    timeLimit,
    flyCount,
    minFlySize,
    maxFlySize,
    hasMovement,
    theme,
  };
}

// levels.ts - Level data with dynamic generation based on difficulty and worlds

import type { Level, Fly } from '../types/game';
import { getDifficultyForLevel, getEndlessDifficulty } from '../utils/difficulty';
import { getImageForLevel } from '../services/imageSource';
import { getWorldForLevel, TOTAL_LEVELS } from './worlds';

// Level names by theme
const levelNames: Record<string, string[]> = {
  kitchen: [
    'Kitchen Chaos', 'Counter Strike', 'Pantry Panic', 'Fridge Frenzy',
    'Sink Surprise', 'Oven Outbreak', 'Cupboard Crisis', 'Table Trouble',
  ],
  garden: [
    'Garden Party', 'Flower Frenzy', 'Veggie Venture', 'Greenhouse Getaway',
    'Patio Pursuit', 'Hedge Hunt', 'Pond Patrol', 'Orchard Ordeal',
  ],
  fantasy: [
    'Enchanted Forest', 'Mystic Meadow', 'Crystal Cave', 'Dragon\'s Den',
    'Fairy Glen', 'Wizard\'s Tower', 'Starlight Summit', 'Ancient Ruins',
  ],
  retro: [
    'Arcade Alley', 'Pixel Paradise', 'Neon Nights', 'Game Room',
    'Console Corner', 'Retro Realm', 'Vintage Vibes', 'High Score Hall',
  ],
};

// Seeded random number generator for consistent fly placement
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

// Generate fly positions that don't overlap and stay within bounds
function generateFlyPositions(
  count: number,
  minSize: number,
  maxSize: number,
  seed: number
): Omit<Fly, 'found' | 'escaped'>[] {
  const random = seededRandom(seed);
  const flies: Omit<Fly, 'found' | 'escaped'>[] = [];
  const minDistance = 12;
  const margin = 10;

  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let x: number, y: number, size: number;

    do {
      x = margin + random() * (100 - 2 * margin);
      y = margin + random() * (100 - 2 * margin);
      size = minSize + random() * (maxSize - minSize);
      attempts++;

      const tooClose = flies.some(f => {
        const dx = f.x - x;
        const dy = f.y - y;
        return Math.sqrt(dx * dx + dy * dy) < minDistance;
      });

      if (!tooClose || attempts > 50) {
        flies.push({ id: `fly-${i + 1}`, x, y, size });
        break;
      }
    } while (attempts < 50);
  }

  return flies;
}

// Get difficulty stars (1-3) based on position in world
function getStarsForLevel(levelNumber: number): number {
  const world = getWorldForLevel(levelNumber);
  if (!world) return 1;

  const posInWorld = levelNumber - world.levelRange.start;
  if (posInWorld < 3) return 1;
  if (posInWorld < 6) return 2;
  return 3;
}

// Generate a single level
function generateLevel(
  levelNumber: number,
  localImages?: { all: string[]; byTheme: Record<string, string[]> }
): Level {
  const world = getWorldForLevel(levelNumber);
  const theme = world?.theme || 'kitchen';
  const difficulty = getDifficultyForLevel(levelNumber);

  // Get image URL
  const imageUrl = getImageForLevel(levelNumber, theme, localImages);

  // Pick name based on level position within world
  const names = levelNames[theme] || levelNames.kitchen;
  const posInWorld = world ? (levelNumber - world.levelRange.start) : (levelNumber - 1);
  const nameIndex = posInWorld % names.length;
  const name = names[nameIndex];

  // Generate fly positions
  const flyData = generateFlyPositions(
    difficulty.flyCount,
    difficulty.minFlySize,
    difficulty.maxFlySize,
    levelNumber * 12345
  );

  const flies: Fly[] = flyData.map(f => ({
    ...f,
    found: false,
    escaped: false,
  }));

  return {
    id: `level-${levelNumber}`,
    name,
    imageUrl,
    theme,
    difficulty: getStarsForLevel(levelNumber),
    timeLimit: difficulty.timeLimit,
    flies,
  };
}

// Generate all 32 levels with default images
export let levels: Level[] = Array.from({ length: TOTAL_LEVELS }, (_, i) => generateLevel(i + 1));

// Regenerate levels with local images
export function regenerateLevelsWithImages(
  localImages: { all: string[]; byTheme: Record<string, string[]> }
): void {
  levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => generateLevel(i + 1, localImages));
}

export function getLevelById(id: string): Level | undefined {
  return levels.find(level => level.id === id);
}

export function getLevelsForWorld(worldId: string): Level[] {
  const worldIndex = parseInt(worldId.split('-')[1]) - 1;
  const startIndex = worldIndex * 8;
  return levels.slice(startIndex, startIndex + 8);
}

export function getNextLevel(currentId: string): Level | undefined {
  const currentIndex = levels.findIndex(level => level.id === currentId);
  if (currentIndex === -1 || currentIndex >= levels.length - 1) {
    return undefined;
  }
  return levels[currentIndex + 1];
}

export function isLastLevel(levelId: string): boolean {
  return levels[levels.length - 1].id === levelId;
}

export function isLastLevelInWorld(levelId: string): boolean {
  const levelNum = getLevelNumber(levelId);
  const world = getWorldForLevel(levelNum);
  return world ? levelNum === world.levelRange.end : false;
}

export function getLevelNumber(levelId: string): number {
  const index = levels.findIndex(level => level.id === levelId);
  return index + 1;
}

// Generate a level for endless mode
export function generateEndlessLevel(round: number): Level {
  const difficulty = getEndlessDifficulty(round);

  const themeNames = levelNames[difficulty.theme] || levelNames.kitchen;
  const name = themeNames[(round - 1) % themeNames.length];

  // Cycle through 8 images per theme
  const imageIndex = ((round - 1) % 8) + 1;
  const imageUrl = getImageForLevel(imageIndex, difficulty.theme);

  const flyData = generateFlyPositions(
    difficulty.flyCount,
    difficulty.minFlySize,
    difficulty.maxFlySize,
    round * 54321 // Different seed from campaign
  );

  const flies: Fly[] = flyData.map(f => ({
    ...f,
    found: false,
    escaped: false,
  }));

  return {
    id: `endless-${round}`,
    name,
    imageUrl,
    theme: difficulty.theme,
    difficulty: Math.min(3, 1 + Math.floor((round - 1) / 10)),
    timeLimit: difficulty.timeLimit,
    flies,
  };
}

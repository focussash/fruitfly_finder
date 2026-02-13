// worlds.ts - World and campaign structure

export interface World {
  id: string;
  name: string;
  theme: 'kitchen' | 'garden' | 'fantasy' | 'retro';
  description: string;
  icon: string;
  color: string; // Tailwind gradient classes
  levelRange: { start: number; end: number }; // 1-indexed level numbers
}

export const worlds: World[] = [
  {
    id: 'world-1',
    name: 'Kitchen',
    theme: 'kitchen',
    description: 'Hunt flies in cozy kitchens and dining rooms',
    icon: '🍳',
    color: 'from-orange-600 to-amber-700',
    levelRange: { start: 1, end: 8 },
  },
  {
    id: 'world-2',
    name: 'Garden',
    theme: 'garden',
    description: 'Explore beautiful gardens and greenhouses',
    icon: '🌿',
    color: 'from-green-600 to-emerald-700',
    levelRange: { start: 9, end: 16 },
  },
  {
    id: 'world-3',
    name: 'Fantasy',
    theme: 'fantasy',
    description: 'Venture into magical forests and mystical realms',
    icon: '✨',
    color: 'from-purple-600 to-indigo-700',
    levelRange: { start: 17, end: 24 },
  },
  {
    id: 'world-4',
    name: 'Retro',
    theme: 'retro',
    description: 'Step into nostalgic arcades and game rooms',
    icon: '👾',
    color: 'from-pink-600 to-rose-700',
    levelRange: { start: 25, end: 32 },
  },
];

export const LEVELS_PER_WORLD = 8;
export const TOTAL_LEVELS = worlds.length * LEVELS_PER_WORLD; // 32

export function getWorldById(id: string): World | undefined {
  return worlds.find(w => w.id === id);
}

export function getWorldForLevel(levelNumber: number): World | undefined {
  return worlds.find(w =>
    levelNumber >= w.levelRange.start && levelNumber <= w.levelRange.end
  );
}

export function getLevelIndexInWorld(levelNumber: number): number {
  const world = getWorldForLevel(levelNumber);
  if (!world) return 0;
  return levelNumber - world.levelRange.start + 1;
}

export function getNextWorld(currentWorldId: string): World | undefined {
  const currentIndex = worlds.findIndex(w => w.id === currentWorldId);
  if (currentIndex === -1 || currentIndex >= worlds.length - 1) {
    return undefined;
  }
  return worlds[currentIndex + 1];
}

export function isLastWorld(worldId: string): boolean {
  return worlds[worlds.length - 1].id === worldId;
}

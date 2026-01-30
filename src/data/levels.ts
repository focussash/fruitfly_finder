// levels.ts - Static level data for the game

import type { Level } from '../types/game';

// Helper to create fly data (found/escaped always start false)
const fly = (id: string, x: number, y: number, size = 1) => ({
  id,
  x,
  y,
  size,
  found: false,
  escaped: false,
});

export const levels: Level[] = [
  // Level 1 - Kitchen (Easy)
  {
    id: 'level-1',
    name: 'Kitchen Chaos',
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    theme: 'kitchen',
    difficulty: 1,
    timeLimit: 30,
    flies: [
      fly('1-1', 25, 40, 1.2),
      fly('1-2', 70, 30, 1.1),
      fly('1-3', 50, 70, 1.0),
    ],
  },

  // Level 2 - Kitchen (Easy)
  {
    id: 'level-2',
    name: 'Counter Strike',
    imageUrl: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80',
    theme: 'kitchen',
    difficulty: 1,
    timeLimit: 30,
    flies: [
      fly('2-1', 15, 55, 1.1),
      fly('2-2', 80, 25, 1.0),
      fly('2-3', 45, 80, 1.2),
      fly('2-4', 60, 45, 0.9),
    ],
  },

  // Level 3 - Garden (Medium)
  {
    id: 'level-3',
    name: 'Garden Party',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
    theme: 'garden',
    difficulty: 2,
    timeLimit: 30,
    flies: [
      fly('3-1', 20, 35, 1.0),
      fly('3-2', 75, 60, 0.9),
      fly('3-3', 40, 75, 1.1),
      fly('3-4', 85, 20, 1.0),
      fly('3-5', 55, 45, 0.8),
    ],
  },

  // Level 4 - Garden (Medium)
  {
    id: 'level-4',
    name: 'Flower Frenzy',
    imageUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=80',
    theme: 'garden',
    difficulty: 2,
    timeLimit: 25,
    flies: [
      fly('4-1', 30, 25, 0.9),
      fly('4-2', 65, 70, 1.0),
      fly('4-3', 15, 60, 1.1),
      fly('4-4', 80, 40, 0.85),
      fly('4-5', 50, 50, 1.0),
    ],
  },

  // Level 5 - Fantasy (Hard)
  {
    id: 'level-5',
    name: 'Enchanted Forest',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
    theme: 'fantasy',
    difficulty: 3,
    timeLimit: 25,
    flies: [
      fly('5-1', 22, 30, 0.85),
      fly('5-2', 78, 55, 0.9),
      fly('5-3', 45, 80, 1.0),
      fly('5-4', 60, 25, 0.8),
      fly('5-5', 35, 55, 0.95),
      fly('5-6', 85, 75, 0.9),
    ],
  },
];

export function getLevelById(id: string): Level | undefined {
  return levels.find(level => level.id === id);
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

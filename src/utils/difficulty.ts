// difficulty.ts - Difficulty scaling utility
// TODO: Implement in Step 10

export interface DifficultyParams {
  timeLimit: number;
  flyCount: number;
  flySize: number;
  hasMovement: boolean;
}

export function getDifficultyForLevel(level: number): DifficultyParams {
  // Difficulty scaling logic will be implemented here
  if (level <= 5) {
    return { timeLimit: 30, flyCount: 3 + Math.floor(level / 2), flySize: 1.0, hasMovement: false };
  } else if (level <= 15) {
    return { timeLimit: 25, flyCount: 5 + Math.floor((level - 5) / 3), flySize: 0.9, hasMovement: false };
  } else {
    return { timeLimit: 20, flyCount: 8 + Math.floor((level - 15) / 4), flySize: 0.8, hasMovement: true };
  }
}

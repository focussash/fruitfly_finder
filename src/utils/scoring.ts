// scoring.ts - Scoring utility with point calculations

export const BASE_POINTS = 100;
export const TIME_BONUS_PER_SECOND = 10;
export const STREAK_MULTIPLIER = 1.5;
export const ACCURACY_BONUS = 50;
export const ESCAPE_PENALTY = -50;

export interface ScoreBreakdown {
  base: number;
  timeBonus: number;
  streakMultiplier: number;
  total: number;
}

/**
 * Calculate score for finding a fly
 * @param timeRemaining - Seconds remaining on the timer
 * @param streak - Current consecutive find streak (1 = first find, 2+ = streak active)
 * @returns Score breakdown with base, time bonus, multiplier, and total
 */
export function calculateFindScore(
  timeRemaining: number,
  streak: number
): ScoreBreakdown {
  const base = BASE_POINTS;
  const timeBonus = timeRemaining * TIME_BONUS_PER_SECOND;

  // Streak multiplier applies after 1 consecutive find (streak >= 2)
  const streakMultiplier = streak >= 2 ? STREAK_MULTIPLIER : 1;

  const subtotal = base + timeBonus;
  const total = Math.round(subtotal * streakMultiplier);

  return {
    base,
    timeBonus,
    streakMultiplier,
    total,
  };
}

/**
 * Calculate accuracy bonus for completing a level
 * @param misclicks - Number of misclicks during the level
 * @returns Accuracy bonus (50 if no misclicks, 0 otherwise)
 */
export function calculateAccuracyBonus(misclicks: number): number {
  return misclicks === 0 ? ACCURACY_BONUS : 0;
}

/**
 * Calculate penalty for a fly escaping
 * @returns Escape penalty (negative value)
 */
export function getEscapePenalty(): number {
  return ESCAPE_PENALTY;
}

/**
 * Format score for display with + or - prefix
 */
export function formatScoreChange(points: number): string {
  if (points >= 0) {
    return `+${points}`;
  }
  return points.toString();
}

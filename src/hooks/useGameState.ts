// useGameState.ts - Game state management hook
// TODO: Implement in Step 8

import { useState } from 'react';
import type { GameState } from '../types/game';

const initialState: GameState = {
  currentLevel: null,
  score: 0,
  streak: 0,
  misclicks: 0,
  timeRemaining: 30,
  status: 'idle',
};

export function useGameState() {
  const [state, setState] = useState<GameState>(initialState);

  return {
    state,
    setState,
  };
}

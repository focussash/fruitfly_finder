// useGameState.ts - Game state management hook with reducer

import { useReducer, useCallback } from 'react';
import type { Fly, Level } from '../types/game';
import type { ScoreBreakdown } from '../utils/scoring';
import { calculateAccuracyBonus } from '../utils/scoring';

const ESCAPE_STAGGER_DELAY = 400;

export interface GameStateData {
  status: 'idle' | 'playing' | 'paused' | 'won' | 'lost';
  currentLevel: Level | null;
  flies: Fly[];
  score: number;
  streak: number;
  misclicks: number;
  escapeDelays: Record<string, number>;
  finalBonus: number;
}

type GameAction =
  | { type: 'START_GAME'; level: Level }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'FIND_FLY'; flyId: string; breakdown: ScoreBreakdown }
  | { type: 'MISS_CLICK' }
  | { type: 'TIME_UP' }
  | { type: 'ADD_ESCAPE_PENALTY'; amount: number }
  | { type: 'PLAY_AGAIN' }
  | { type: 'RESET' };

const initialState: GameStateData = {
  status: 'idle',
  currentLevel: null,
  flies: [],
  score: 0,
  streak: 0,
  misclicks: 0,
  escapeDelays: {},
  finalBonus: 0,
};

function gameReducer(state: GameStateData, action: GameAction): GameStateData {
  switch (action.type) {
    case 'START_GAME': {
      console.log('[Game] idle → playing');
      return {
        ...initialState,
        status: 'playing',
        currentLevel: action.level,
        flies: action.level.flies.map(f => ({ ...f, found: false, escaped: false })),
      };
    }

    case 'PAUSE_GAME': {
      if (state.status !== 'playing') return state;
      console.log('[Game] playing → paused');
      return { ...state, status: 'paused' };
    }

    case 'RESUME_GAME': {
      if (state.status !== 'paused') return state;
      console.log('[Game] paused → playing');
      return { ...state, status: 'playing' };
    }

    case 'FIND_FLY': {
      if (state.status !== 'playing') return state;

      const fly = state.flies.find(f => f.id === action.flyId);
      if (!fly || fly.found) return state;

      console.log(`[Game] Fly found: ${action.flyId} (+${action.breakdown.total})`);

      const updatedFlies = state.flies.map(f =>
        f.id === action.flyId ? { ...f, found: true } : f
      );

      const newStreak = state.streak + 1;
      const newScore = state.score + action.breakdown.total;

      // Check win condition
      const allFound = updatedFlies.every(f => f.found);
      if (allFound) {
        const accuracyBonus = calculateAccuracyBonus(state.misclicks);
        console.log(`[Game] playing → won (score: ${newScore + accuracyBonus})`);
        return {
          ...state,
          flies: updatedFlies,
          score: newScore + accuracyBonus,
          streak: newStreak,
          status: 'won',
          finalBonus: accuracyBonus,
        };
      }

      return {
        ...state,
        flies: updatedFlies,
        score: newScore,
        streak: newStreak,
      };
    }

    case 'MISS_CLICK': {
      if (state.status !== 'playing') return state;
      return {
        ...state,
        misclicks: state.misclicks + 1,
        streak: 0,
      };
    }

    case 'TIME_UP': {
      if (state.status !== 'playing') return state;
      console.log('[Game] playing → lost (time up)');

      const unfoundFlies = state.flies.filter(f => !f.found);
      const delays: Record<string, number> = {};
      unfoundFlies.forEach((fly, index) => {
        delays[fly.id] = index * ESCAPE_STAGGER_DELAY;
      });

      return {
        ...state,
        status: 'lost',
        flies: state.flies.map(fly => fly.found ? fly : { ...fly, escaped: true }),
        escapeDelays: delays,
      };
    }

    case 'ADD_ESCAPE_PENALTY': {
      return {
        ...state,
        score: state.score + action.amount,
      };
    }

    case 'PLAY_AGAIN': {
      if (state.status !== 'won' && state.status !== 'lost') return state;
      if (!state.currentLevel) return state;

      console.log('[Game] → playing (play again)');
      return {
        ...initialState,
        status: 'playing',
        currentLevel: state.currentLevel,
        flies: state.currentLevel.flies.map(f => ({ ...f, found: false, escaped: false })),
      };
    }

    case 'RESET': {
      console.log('[Game] → idle (reset)');
      return initialState;
    }

    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const startGame = useCallback((level: Level) => {
    dispatch({ type: 'START_GAME', level });
  }, []);

  const pauseGame = useCallback(() => {
    dispatch({ type: 'PAUSE_GAME' });
  }, []);

  const resumeGame = useCallback(() => {
    dispatch({ type: 'RESUME_GAME' });
  }, []);

  const findFly = useCallback((flyId: string, breakdown: ScoreBreakdown) => {
    dispatch({ type: 'FIND_FLY', flyId, breakdown });
  }, []);

  const missClick = useCallback(() => {
    dispatch({ type: 'MISS_CLICK' });
  }, []);

  const timeUp = useCallback(() => {
    dispatch({ type: 'TIME_UP' });
  }, []);

  const addEscapePenalty = useCallback((amount: number) => {
    dispatch({ type: 'ADD_ESCAPE_PENALTY', amount });
  }, []);

  const playAgain = useCallback(() => {
    dispatch({ type: 'PLAY_AGAIN' });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    state,
    startGame,
    pauseGame,
    resumeGame,
    findFly,
    missClick,
    timeUp,
    addEscapePenalty,
    playAgain,
    resetGame,
  };
}

export interface Fly {
  id: string;
  x: number;          // percentage position (0-100)
  y: number;          // percentage position (0-100)
  size: number;       // scale factor
  found: boolean;
  escaped: boolean;
}

export interface Level {
  id: string;
  imageUrl: string;
  flies: Fly[];
  theme: 'kitchen' | 'garden' | 'fantasy' | 'retro';
  difficulty: number;
  timeLimit: number;
}

export interface GameState {
  currentLevel: Level | null;
  score: number;
  streak: number;
  misclicks: number;
  timeRemaining: number;
  status: 'idle' | 'playing' | 'paused' | 'won' | 'lost';
}

export interface Settings {
  catchAnimation: 'cute' | 'wild';
  soundEnabled: boolean;
  musicEnabled: boolean;
  casualMode: boolean;  // extended timer
}

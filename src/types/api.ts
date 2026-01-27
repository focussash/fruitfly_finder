export interface GeminiImageRequest {
  prompt: string;
  theme: string;
}

export interface GeminiImageResponse {
  imageUrl: string;
  error?: string;
}

export interface MultiplayerRoom {
  id: string;
  players: string[];
  levelId: string;
  status: 'waiting' | 'playing' | 'finished';
}

export interface MultiplayerEvent {
  type: 'fly_found' | 'game_over' | 'player_joined' | 'player_left';
  playerId: string;
  data?: unknown;
}

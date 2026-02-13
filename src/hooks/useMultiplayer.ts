// useMultiplayer.ts - Multiplayer state management hook

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  connectToServer,
  disconnectFromServer,
  getSocket,
  createRoom,
  joinRoom,
  leaveRoom,
  toggleReady,
  emitFlyFound,
  emitPlayerMiss,
  emitPlayerFinished,
  requestRematch,
} from '../services/socket';

export interface MultiplayerPlayer {
  id: string;
  name: string;
  ready: boolean;
  foundCount: number;
  score: number;
  misclicks: number;
  finished: boolean;
  isHost: boolean;
}

export interface OpponentUpdate {
  playerId: string;
  playerName: string;
  score: number;
  foundCount: number;
}

export interface GameResult {
  name: string;
  score: number;
  foundCount: number;
  misclicks: number;
  isHost: boolean;
}

export function useMultiplayer() {
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [players, setPlayers] = useState<MultiplayerPlayer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [gameLevel, setGameLevel] = useState<number | null>(null);
  const [opponentUpdate, setOpponentUpdate] = useState<OpponentUpdate | null>(null);
  const [opponentFinished, setOpponentFinished] = useState(false);
  const [gameResults, setGameResults] = useState<GameResult[] | null>(null);
  const [playerLeftMessage, setPlayerLeftMessage] = useState<string | null>(null);

  const listenersAttached = useRef(false);

  // Connect to server and set up listeners
  const connect = useCallback((serverUrl?: string) => {
    const socket = connectToServer(serverUrl);

    if (listenersAttached.current) return;
    listenersAttached.current = true;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    // Room events
    socket.on('room-created', ({ roomId, players }: { roomId: string; players: MultiplayerPlayer[] }) => {
      setRoomId(roomId);
      setPlayers(players);
      setError(null);
    });

    socket.on('room-joined', ({ roomId, players }: { roomId: string; players: MultiplayerPlayer[] }) => {
      setRoomId(roomId);
      setPlayers(players);
      setError(null);
    });

    socket.on('join-error', (message: string) => {
      setError(message);
    });

    socket.on('player-joined', ({ players }: { players: MultiplayerPlayer[] }) => {
      setPlayers(players);
    });

    socket.on('players-updated', ({ players }: { players: MultiplayerPlayer[] }) => {
      setPlayers(players);
    });

    socket.on('player-left', ({ playerName, players }: { playerName: string; players: MultiplayerPlayer[] }) => {
      setPlayers(players);
      setPlayerLeftMessage(`${playerName} left the room`);
      setGameLevel(null);
      setOpponentUpdate(null);
      setOpponentFinished(false);
      setGameResults(null);
    });

    // Game events
    socket.on('game-start', ({ levelNumber }: { levelNumber: number }) => {
      setGameLevel(levelNumber);
      setOpponentUpdate(null);
      setOpponentFinished(false);
      setGameResults(null);
    });

    socket.on('opponent-update', (update: OpponentUpdate) => {
      setOpponentUpdate(update);
    });

    socket.on('opponent-finished', () => {
      setOpponentFinished(true);
    });

    socket.on('game-over', ({ results }: { results: GameResult[] }) => {
      setGameResults(results);
    });

    socket.on('rematch', ({ players }: { players: MultiplayerPlayer[] }) => {
      setPlayers(players);
      setGameLevel(null);
      setOpponentUpdate(null);
      setOpponentFinished(false);
      setGameResults(null);
    });
  }, []);

  // Disconnect and clean up
  const disconnect = useCallback(() => {
    const socket = getSocket();
    if (socket) {
      socket.removeAllListeners();
      listenersAttached.current = false;
    }
    disconnectFromServer();
    setIsConnected(false);
    setRoomId(null);
    setPlayers([]);
    setError(null);
    setGameLevel(null);
    setOpponentUpdate(null);
    setOpponentFinished(false);
    setGameResults(null);
    setPlayerLeftMessage(null);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (getSocket()) {
        leaveRoom();
        disconnect();
      }
    };
  }, [disconnect]);

  // Actions
  const handleCreateRoom = useCallback((playerName: string) => {
    setError(null);
    setPlayerLeftMessage(null);
    createRoom(playerName);
  }, []);

  const handleJoinRoom = useCallback((roomCode: string, playerName: string) => {
    setError(null);
    setPlayerLeftMessage(null);
    joinRoom(roomCode, playerName);
  }, []);

  const handleLeaveRoom = useCallback(() => {
    leaveRoom();
    setRoomId(null);
    setPlayers([]);
    setGameLevel(null);
    setOpponentUpdate(null);
    setOpponentFinished(false);
    setGameResults(null);
    setPlayerLeftMessage(null);
  }, []);

  const handleToggleReady = useCallback(() => {
    toggleReady();
  }, []);

  const handleFlyFound = useCallback((score: number, foundCount: number) => {
    emitFlyFound(score, foundCount);
  }, []);

  const handleMiss = useCallback((misclicks: number) => {
    emitPlayerMiss(misclicks);
  }, []);

  const handleFinished = useCallback((won: boolean, score: number, foundCount: number, misclicks: number) => {
    emitPlayerFinished(won, score, foundCount, misclicks);
  }, []);

  const handleRematch = useCallback(() => {
    requestRematch();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearPlayerLeftMessage = useCallback(() => {
    setPlayerLeftMessage(null);
  }, []);

  return {
    // State
    isConnected,
    roomId,
    players,
    error,
    gameLevel,
    opponentUpdate,
    opponentFinished,
    gameResults,
    playerLeftMessage,
    // Actions
    connect,
    disconnect,
    createRoom: handleCreateRoom,
    joinRoom: handleJoinRoom,
    leaveRoom: handleLeaveRoom,
    toggleReady: handleToggleReady,
    flyFound: handleFlyFound,
    miss: handleMiss,
    finished: handleFinished,
    rematch: handleRematch,
    clearError,
    clearPlayerLeftMessage,
  };
}

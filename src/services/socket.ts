// socket.ts - Socket.io client service for multiplayer

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getDefaultServerURL(): string {
  return `http://${window.location.hostname}:3001`;
}

export function getSocket(): Socket | null {
  return socket;
}

export function connectToServer(serverUrl?: string): Socket {
  if (socket?.connected) return socket;

  const url = serverUrl || getDefaultServerURL();
  socket = io(url, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.log('[Socket] Connection error:', err.message);
  });

  return socket;
}

export function disconnectFromServer(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Room actions
export function createRoom(playerName: string): void {
  socket?.emit('create-room', playerName);
}

export function joinRoom(roomId: string, playerName: string): void {
  socket?.emit('join-room', { roomId, playerName });
}

export function leaveRoom(): void {
  socket?.emit('leave-room');
}

export function toggleReady(): void {
  socket?.emit('toggle-ready');
}

// Game actions
export function emitFlyFound(score: number, foundCount: number): void {
  socket?.emit('fly-found', { score, foundCount });
}

export function emitPlayerMiss(misclicks: number): void {
  socket?.emit('player-miss', { misclicks });
}

export function emitPlayerFinished(won: boolean, score: number, foundCount: number, misclicks: number): void {
  socket?.emit('player-finished', { won, score, foundCount, misclicks });
}

export function requestRematch(): void {
  socket?.emit('request-rematch');
}

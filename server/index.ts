// server/index.ts - Express + Socket.io multiplayer server

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { networkInterfaces } from 'os';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3001;

// --- Types ---

interface Player {
  id: string;
  name: string;
  ready: boolean;
  foundCount: number;
  score: number;
  misclicks: number;
  finished: boolean;
}

interface Room {
  id: string;
  host: string;
  players: Map<string, Player>;
  levelNumber: number;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: number;
}

// --- State ---

const rooms = new Map<string, Room>();

// Generate a 4-character room code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous chars
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  // Ensure unique
  if (rooms.has(code)) return generateRoomCode();
  return code;
}

// Clean up stale rooms (older than 30 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [id, room] of rooms) {
    if (now - room.createdAt > 30 * 60 * 1000) {
      rooms.delete(id);
      console.log(`[Room] Cleaned up stale room ${id}`);
    }
  }
}, 60 * 1000);

// --- Socket handlers ---

io.on('connection', (socket) => {
  console.log(`[Server] Client connected: ${socket.id}`);

  // Create a new room
  socket.on('create-room', (playerName: string) => {
    const roomId = generateRoomCode();
    const player: Player = {
      id: socket.id,
      name: playerName || 'Player 1',
      ready: false,
      foundCount: 0,
      score: 0,
      misclicks: 0,
      finished: false,
    };

    const room: Room = {
      id: roomId,
      host: socket.id,
      players: new Map([[socket.id, player]]),
      levelNumber: 1,
      status: 'waiting',
      createdAt: Date.now(),
    };

    rooms.set(roomId, room);
    socket.join(roomId);

    console.log(`[Room] Created room ${roomId} by ${playerName}`);
    socket.emit('room-created', {
      roomId,
      players: getPlayersArray(room),
    });
  });

  // Join an existing room
  socket.on('join-room', ({ roomId, playerName }: { roomId: string; playerName: string }) => {
    const room = rooms.get(roomId.toUpperCase());

    if (!room) {
      socket.emit('join-error', 'Room not found');
      return;
    }

    if (room.status !== 'waiting') {
      socket.emit('join-error', 'Game already in progress');
      return;
    }

    if (room.players.size >= 2) {
      socket.emit('join-error', 'Room is full');
      return;
    }

    const player: Player = {
      id: socket.id,
      name: playerName || 'Player 2',
      ready: false,
      foundCount: 0,
      score: 0,
      misclicks: 0,
      finished: false,
    };

    room.players.set(socket.id, player);
    socket.join(roomId);

    console.log(`[Room] ${playerName} joined room ${roomId}`);

    const playersArray = getPlayersArray(room);
    socket.emit('room-joined', { roomId, players: playersArray });
    socket.to(roomId).emit('player-joined', { players: playersArray });
  });

  // Player toggles ready status
  socket.on('toggle-ready', () => {
    const room = findRoomBySocket(socket.id);
    if (!room) return;

    const player = room.players.get(socket.id);
    if (!player) return;

    player.ready = !player.ready;
    console.log(`[Room ${room.id}] ${player.name} is ${player.ready ? 'ready' : 'not ready'}`);

    io.to(room.id).emit('players-updated', { players: getPlayersArray(room) });

    // Check if all players are ready (need exactly 2)
    if (room.players.size === 2 && [...room.players.values()].every(p => p.ready)) {
      // Pick a random level (1-32)
      room.levelNumber = Math.floor(Math.random() * 32) + 1;
      room.status = 'playing';

      // Reset player game state
      for (const p of room.players.values()) {
        p.foundCount = 0;
        p.score = 0;
        p.misclicks = 0;
        p.finished = false;
      }

      console.log(`[Room ${room.id}] Game starting! Level ${room.levelNumber}`);
      io.to(room.id).emit('game-start', { levelNumber: room.levelNumber });
    }
  });

  // Player found a fly
  socket.on('fly-found', ({ score, foundCount }: { score: number; foundCount: number }) => {
    const room = findRoomBySocket(socket.id);
    if (!room || room.status !== 'playing') return;

    const player = room.players.get(socket.id);
    if (!player) return;

    player.score = score;
    player.foundCount = foundCount;

    // Broadcast to opponent
    socket.to(room.id).emit('opponent-update', {
      playerId: socket.id,
      playerName: player.name,
      score: player.score,
      foundCount: player.foundCount,
    });
  });

  // Player missed (clicked empty space)
  socket.on('player-miss', ({ misclicks }: { misclicks: number }) => {
    const room = findRoomBySocket(socket.id);
    if (!room || room.status !== 'playing') return;

    const player = room.players.get(socket.id);
    if (!player) return;

    player.misclicks = misclicks;
  });

  // Player finished (won or lost)
  socket.on('player-finished', ({ won, score, foundCount, misclicks }: {
    won: boolean;
    score: number;
    foundCount: number;
    misclicks: number;
  }) => {
    const room = findRoomBySocket(socket.id);
    if (!room || room.status !== 'playing') return;

    const player = room.players.get(socket.id);
    if (!player) return;

    player.finished = true;
    player.score = score;
    player.foundCount = foundCount;
    player.misclicks = misclicks;

    console.log(`[Room ${room.id}] ${player.name} finished: ${won ? 'won' : 'lost'} (score: ${score})`);

    // Notify opponent
    socket.to(room.id).emit('opponent-finished', {
      playerName: player.name,
      won,
      score,
      foundCount,
    });

    // Check if both players finished
    if ([...room.players.values()].every(p => p.finished)) {
      room.status = 'finished';
      const results = getPlayersArray(room).map(p => ({
        name: p.name,
        score: p.score,
        foundCount: p.foundCount,
        misclicks: p.misclicks,
        isHost: p.id === room.host,
      }));

      console.log(`[Room ${room.id}] Game over!`);
      io.to(room.id).emit('game-over', { results });
    }
  });

  // Request rematch
  socket.on('request-rematch', () => {
    const room = findRoomBySocket(socket.id);
    if (!room) return;

    // Reset all players
    for (const p of room.players.values()) {
      p.ready = false;
      p.foundCount = 0;
      p.score = 0;
      p.misclicks = 0;
      p.finished = false;
    }
    room.status = 'waiting';

    io.to(room.id).emit('rematch', { players: getPlayersArray(room) });
  });

  // Leave room
  socket.on('leave-room', () => {
    handleLeaveRoom(socket);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`[Server] Client disconnected: ${socket.id}`);
    handleLeaveRoom(socket);
  });
});

// --- Helpers ---

function getPlayersArray(room: Room): (Player & { isHost: boolean })[] {
  return [...room.players.values()].map(p => ({
    ...p,
    isHost: p.id === room.host,
  }));
}

function findRoomBySocket(socketId: string): Room | undefined {
  for (const room of rooms.values()) {
    if (room.players.has(socketId)) return room;
  }
  return undefined;
}

function handleLeaveRoom(socket: { id: string; to: (room: string) => { emit: (event: string, data?: unknown) => void } }) {
  const room = findRoomBySocket(socket.id);
  if (!room) return;

  const player = room.players.get(socket.id);
  room.players.delete(socket.id);

  console.log(`[Room ${room.id}] ${player?.name || 'Unknown'} left`);

  if (room.players.size === 0) {
    rooms.delete(room.id);
    console.log(`[Room ${room.id}] Room deleted (empty)`);
  } else {
    // If host left, transfer to remaining player
    if (room.host === socket.id) {
      const remaining = [...room.players.keys()][0];
      room.host = remaining;
    }
    room.status = 'waiting';
    socket.to(room.id).emit('player-left', {
      playerName: player?.name,
      players: getPlayersArray(room),
    });
  }
}

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', rooms: rooms.size });
});

function getLanIP(): string | null {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]!) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return null;
}

httpServer.listen(PORT, () => {
  const lanIP = getLanIP();
  console.log(`[Server] Multiplayer server running on port ${PORT}`);
  console.log(`[Server] Local:   http://localhost:${PORT}`);
  if (lanIP) {
    console.log(`[Server] Network: http://${lanIP}:${PORT}`);
  }
});

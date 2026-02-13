// MultiplayerLobby.tsx - Room creation, joining, and lobby UI

import { useState } from 'react';
import type { MultiplayerPlayer } from '../../hooks/useMultiplayer';
import { getDefaultServerURL } from '../../services/socket';

interface MultiplayerLobbyProps {
  isConnected: boolean;
  roomId: string | null;
  players: MultiplayerPlayer[];
  error: string | null;
  playerLeftMessage: string | null;
  onConnect: (serverUrl?: string) => void;
  onCreateRoom: (name: string) => void;
  onJoinRoom: (code: string, name: string) => void;
  onToggleReady: () => void;
  onLeaveRoom: () => void;
  onBack: () => void;
  onClearError: () => void;
  onClearPlayerLeft: () => void;
  mySocketId: string | undefined;
}

export function MultiplayerLobby({
  isConnected,
  roomId,
  players,
  error,
  playerLeftMessage,
  onConnect,
  onCreateRoom,
  onJoinRoom,
  onToggleReady,
  onLeaveRoom,
  onBack,
  onClearError,
  onClearPlayerLeft,
  mySocketId,
}: MultiplayerLobbyProps) {
  const [playerName, setPlayerName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [serverAddress, setServerAddress] = useState(getDefaultServerURL());

  // Not connected yet - show connecting UI
  if (!isConnected) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
        <h2 className="text-3xl font-bold">Multiplayer</h2>
        <p className="text-gray-400">Connect to the game server to play with friends</p>

        <div className="w-72 space-y-3">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Server Address</label>
            <input
              type="text"
              value={serverAddress}
              onChange={e => setServerAddress(e.target.value)}
              placeholder="http://192.168.1.x:3001"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none text-sm font-mono"
            />
            <div className="text-xs text-gray-500 mt-1">Auto-detected. Change if joining another PC's server.</div>
          </div>

          <button
            onClick={() => onConnect(serverAddress || undefined)}
            className="w-full px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-xl transition-colors"
          >
            Connect to Server
          </button>
        </div>

        {error && (
          <div className="text-red-400 text-sm bg-red-900/30 px-4 py-2 rounded-lg">
            {error}
          </div>
        )}
        <button
          onClick={onBack}
          className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
        >
          Back
        </button>
      </div>
    );
  }

  // In a room - show lobby
  if (roomId) {
    const me = players.find(p => p.id === mySocketId);
    const opponent = players.find(p => p.id !== mySocketId);

    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
        <h2 className="text-3xl font-bold">Game Lobby</h2>

        {/* Room Code */}
        <div className="bg-black/30 rounded-xl px-8 py-4 text-center">
          <div className="text-sm text-gray-400 mb-1">Room Code</div>
          <div className="text-4xl font-mono font-bold tracking-widest text-yellow-400">
            {roomId}
          </div>
          <div className="text-xs text-gray-500 mt-1">Share this code with your opponent</div>
        </div>

        {playerLeftMessage && (
          <div className="text-orange-400 text-sm bg-orange-900/30 px-4 py-2 rounded-lg flex items-center gap-2">
            {playerLeftMessage}
            <button onClick={onClearPlayerLeft} className="text-orange-300 hover:text-white">x</button>
          </div>
        )}

        {/* Players */}
        <div className="w-full max-w-sm space-y-3">
          {/* Me */}
          <div className={`bg-gray-800/80 rounded-lg p-4 border-2 ${me?.ready ? 'border-green-500' : 'border-gray-600'}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{me?.name || 'You'} {me?.isHost ? '(Host)' : ''}</div>
                <div className="text-sm text-gray-400">You</div>
              </div>
              <div className={`text-sm font-semibold ${me?.ready ? 'text-green-400' : 'text-gray-500'}`}>
                {me?.ready ? 'Ready' : 'Not Ready'}
              </div>
            </div>
          </div>

          {/* Opponent */}
          {opponent ? (
            <div className={`bg-gray-800/80 rounded-lg p-4 border-2 ${opponent.ready ? 'border-green-500' : 'border-gray-600'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{opponent.name} {opponent.isHost ? '(Host)' : ''}</div>
                  <div className="text-sm text-gray-400">Opponent</div>
                </div>
                <div className={`text-sm font-semibold ${opponent.ready ? 'text-green-400' : 'text-gray-500'}`}>
                  {opponent.ready ? 'Ready' : 'Not Ready'}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800/40 rounded-lg p-4 border-2 border-dashed border-gray-600 text-center text-gray-500">
              Waiting for opponent...
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 w-64">
          <button
            onClick={onToggleReady}
            className={`px-6 py-3 rounded-lg font-bold text-lg transition-colors ${
              me?.ready
                ? 'bg-orange-600 hover:bg-orange-500'
                : 'bg-green-600 hover:bg-green-500'
            }`}
          >
            {me?.ready ? 'Cancel Ready' : 'Ready Up!'}
          </button>

          {players.length === 2 && players.every(p => p.ready) && (
            <div className="text-center text-green-400 font-semibold animate-pulse">
              Starting game...
            </div>
          )}

          <button
            onClick={() => { onLeaveRoom(); setMode('menu'); }}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
          >
            Leave Room
          </button>
        </div>
      </div>
    );
  }

  // Connected but not in a room - show create/join options
  if (mode === 'menu') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
        <h2 className="text-3xl font-bold">Multiplayer</h2>
        <p className="text-green-400 text-sm">Connected to server</p>

        <div className="flex flex-col gap-4 w-64">
          <button
            onClick={() => setMode('create')}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-xl transition-colors"
          >
            Create Room
          </button>
          <button
            onClick={() => setMode('join')}
            className="px-8 py-4 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-xl transition-colors"
          >
            Join Room
          </button>
          <button
            onClick={onBack}
            className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // Create room form
  if (mode === 'create') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
        <h2 className="text-3xl font-bold">Create Room</h2>

        <div className="w-64 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              maxLength={16}
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-900/30 px-3 py-2 rounded flex justify-between">
              {error}
              <button onClick={onClearError} className="text-red-300 hover:text-white">x</button>
            </div>
          )}

          <button
            onClick={() => {
              if (playerName.trim()) onCreateRoom(playerName.trim());
            }}
            disabled={!playerName.trim()}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg font-bold text-lg transition-colors"
          >
            Create
          </button>
          <button
            onClick={() => setMode('menu')}
            className="w-full px-6 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // Join room form
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
      <h2 className="text-3xl font-bold">Join Room</h2>

      <div className="w-64 space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Your Name</label>
          <input
            type="text"
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            maxLength={16}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Room Code</label>
          <input
            type="text"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Enter 4-letter code"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none text-center text-2xl font-mono tracking-widest"
            maxLength={4}
          />
        </div>

        {error && (
          <div className="text-red-400 text-sm bg-red-900/30 px-3 py-2 rounded flex justify-between">
            {error}
            <button onClick={onClearError} className="text-red-300 hover:text-white">x</button>
          </div>
        )}

        <button
          onClick={() => {
            if (playerName.trim() && joinCode.length === 4) {
              onJoinRoom(joinCode, playerName.trim());
            }
          }}
          disabled={!playerName.trim() || joinCode.length !== 4}
          className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg font-bold text-lg transition-colors"
        >
          Join
        </button>
        <button
          onClick={() => setMode('menu')}
          className="w-full px-6 py-2 text-gray-400 hover:text-white transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );
}

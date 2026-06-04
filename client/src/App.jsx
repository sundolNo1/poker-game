import { useState, useEffect } from 'react';
import { socket } from './socket';
import Lobby from './components/Lobby';
import GameTable from './components/GameTable';

export default function App() {
  const [gameState, setGameState] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    socket.on('connect', () => setPlayerId(socket.id));
    socket.on('room-created', ({ roomId }) => { setRoomId(roomId); setError(null); });
    socket.on('room-joined', ({ roomId }) => { setRoomId(roomId); setError(null); });
    socket.on('game-state', (state) => { setGameState(state); setPlayerId(socket.id); });
    socket.on('error', (msg) => setError(msg));

    if (socket.connected) setPlayerId(socket.id);

    return () => {
      socket.off('connect');
      socket.off('room-created');
      socket.off('room-joined');
      socket.off('game-state');
      socket.off('error');
    };
  }, []);

  if (!roomId || !gameState) {
    return <Lobby error={error} onClearError={() => setError(null)} />;
  }

  return <GameTable gameState={gameState} playerId={playerId} roomId={roomId} />;
}

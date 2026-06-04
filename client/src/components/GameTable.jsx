import { useState } from 'react';
import { socket } from '../socket';
import Card from './Card';
import PlayerSeat from './PlayerSeat';
import BettingControls from './BettingControls';

const PHASE_LABELS = {
  waiting: '대기 중',
  'pre-flop': '프리플랍',
  flop: '플랍',
  turn: '턴',
  river: '리버',
  showdown: '쇼다운',
};

// Seat positions for up to 6 players (excluding self), clockwise
const SEAT_POSITIONS = [
  'bottom-left-12 left-6',
  'top-32 left-6',
  'top-4 left-1/4 -translate-x-1/4',
  'top-4 right-1/4 translate-x-1/4',
  'top-32 right-6',
  'bottom-12 right-6',
];

export default function GameTable({ gameState, playerId, roomId }) {
  const [copied, setCopied] = useState(false);

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const myPlayer = gameState.players.find(p => p.id === playerId);
  const others = gameState.players.filter(p => p.id !== playerId);

  const isHost = gameState.players[0]?.id === playerId;
  const canStart = isHost && gameState.phase === 'waiting' && gameState.players.length >= 2;

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <span className="text-white font-bold">♠ Texas Hold'em</span>
          <span className="text-gray-400 text-sm">|</span>
          <span className={`text-sm font-medium ${gameState.phase === 'waiting' ? 'text-gray-400' : 'text-green-400'}`}>
            {PHASE_LABELS[gameState.phase]}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyRoomId}
            className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-lg text-gray-300 transition-colors"
          >
            {copied ? '복사됨!' : `방코드: ${roomId}`}
          </button>
          {myPlayer && (
            <span className="chip-badge text-yellow-300">
              내 칩: {myPlayer.chips.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Table area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div
          className="poker-table relative rounded-[50%] w-full max-w-3xl"
          style={{ aspectRatio: '2/1', minHeight: '280px' }}
        >
          {/* Other players */}
          {others.map((player, i) => (
            <div key={player.id} className={`absolute ${SEAT_POSITIONS[i]}`}>
              <PlayerSeat player={player} isMe={false} phase={gameState.phase} />
            </div>
          ))}

          {/* Center info */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
            {/* Community cards */}
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4].map(i => (
                <Card
                  key={i}
                  card={gameState.communityCards[i] || null}
                  hidden={!gameState.communityCards[i]}
                  large
                />
              ))}
            </div>

            {/* Pot */}
            {gameState.pot > 0 && (
              <div className="chip-badge text-yellow-300 text-sm font-bold">
                팟: {gameState.pot.toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {/* My seat */}
        <div className="mt-4">
          <PlayerSeat player={myPlayer} isMe phase={gameState.phase} />
        </div>
      </div>

      {/* Winner display */}
      {gameState.phase === 'showdown' && gameState.winners.length > 0 && (
        <div className="mx-4 mb-2 bg-yellow-900 border border-yellow-600 rounded-xl p-4 text-center">
          <div className="text-yellow-300 font-bold text-lg mb-1">
            {gameState.winners.length === 1 ? '🏆 승자' : '🏆 무승부'}
          </div>
          {gameState.winners.map(w => (
            <div key={w.playerId} className="text-white">
              <span className="font-bold">{w.playerName}</span>
              {w.hand && <span className="text-yellow-400 mx-2">— {w.hand.name}</span>}
              <span className="text-green-400">+{w.pot.toLocaleString()}칩</span>
            </div>
          ))}

          {isHost && (
            <button
              className="mt-3 bg-green-700 hover:bg-green-600 text-white font-bold px-6 py-2 rounded-lg transition-colors"
              onClick={() => socket.emit('next-round')}
            >
              다음 라운드
            </button>
          )}
        </div>
      )}

      {/* Start / Waiting */}
      {gameState.phase === 'waiting' && (
        <div className="mx-4 mb-2 bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
          <p className="text-gray-400 text-sm mb-2">
            참가자: {gameState.players.length}명
            {gameState.players.length < 2 && ' (최소 2명 필요)'}
          </p>
          <div className="flex flex-wrap gap-2 justify-center mb-3">
            {gameState.players.map(p => (
              <span key={p.id} className="bg-gray-700 px-3 py-1 rounded-full text-sm text-white">
                {p.id === playerId ? `${p.name} (나)` : p.name}
              </span>
            ))}
          </div>
          {canStart ? (
            <button
              className="bg-green-700 hover:bg-green-600 text-white font-bold px-8 py-2 rounded-lg transition-colors"
              onClick={() => socket.emit('start-game')}
            >
              게임 시작
            </button>
          ) : (
            <p className="text-gray-500 text-sm">
              {isHost ? '다른 플레이어를 기다리는 중...' : '방장이 게임을 시작하면 시작됩니다'}
            </p>
          )}
        </div>
      )}

      {/* Betting controls */}
      {myPlayer && !['waiting','showdown'].includes(gameState.phase) && (
        <BettingControls gameState={gameState} playerId={playerId} />
      )}
    </div>
  );
}

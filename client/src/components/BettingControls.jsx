import { useState, useEffect } from 'react';
import { socket } from '../socket';

export default function BettingControls({ gameState, playerId }) {
  const player = gameState.players.find(p => p.id === playerId);
  const isMyTurn = gameState.currentActorId === playerId;
  const [raiseAmt, setRaiseAmt] = useState(gameState.minRaise);

  useEffect(() => {
    setRaiseAmt(gameState.minRaise);
  }, [gameState.minRaise, gameState.currentActorId]);

  if (!isMyTurn || !['pre-flop','flop','turn','river'].includes(gameState.phase)) {
    return (
      <div className="h-24 flex items-center justify-center text-gray-500 text-sm">
        {gameState.phase === 'waiting'
          ? '게임 시작을 기다리는 중...'
          : gameState.phase === 'showdown'
          ? ''
          : '다른 플레이어의 차례입니다'}
      </div>
    );
  }

  if (!player) return null;

  const callAmount = Math.min(gameState.currentBet - player.totalBet, player.chips);
  const canCheck = player.totalBet >= gameState.currentBet;
  const maxRaise = player.chips - (canCheck ? 0 : callAmount);
  const canRaise = maxRaise >= gameState.minRaise;

  const act = (action, amount) => socket.emit('player-action', { action, amount });

  return (
    <div className="bg-gray-900 border-t border-gray-700 p-4">
      {canRaise && (
        <div className="flex items-center gap-3 mb-3">
          <span className="text-gray-400 text-sm w-12">레이즈</span>
          <input
            type="range"
            min={gameState.minRaise}
            max={maxRaise}
            value={Math.min(raiseAmt, maxRaise)}
            onChange={e => setRaiseAmt(Number(e.target.value))}
            className="flex-1 accent-yellow-500"
          />
          <input
            type="number"
            min={gameState.minRaise}
            max={maxRaise}
            value={raiseAmt}
            onChange={e => setRaiseAmt(Math.max(gameState.minRaise, Math.min(maxRaise, Number(e.target.value))))}
            className="w-20 bg-gray-700 text-white px-2 py-1 rounded text-sm text-center border border-gray-600"
          />
        </div>
      )}

      <div className="flex gap-2 justify-center">
        <button
          className="px-5 py-2 bg-red-700 hover:bg-red-600 text-white font-bold rounded-lg transition-colors text-sm"
          onClick={() => act('fold')}
        >
          폴드
        </button>

        {canCheck ? (
          <button
            className="px-5 py-2 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors text-sm"
            onClick={() => act('check')}
          >
            체크
          </button>
        ) : (
          <button
            className="px-5 py-2 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors text-sm"
            onClick={() => act('call')}
          >
            콜 ({callAmount})
          </button>
        )}

        {canRaise && (
          <button
            className="px-5 py-2 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-lg transition-colors text-sm"
            onClick={() => act('raise', raiseAmt)}
          >
            레이즈 (+{raiseAmt})
          </button>
        )}

        {!canRaise && player.chips > 0 && !canCheck && callAmount < player.chips && (
          <button
            className="px-5 py-2 bg-red-800 hover:bg-red-700 text-white font-bold rounded-lg transition-colors text-sm"
            onClick={() => act('raise', player.chips)}
          >
            올인 ({player.chips})
          </button>
        )}
      </div>
    </div>
  );
}

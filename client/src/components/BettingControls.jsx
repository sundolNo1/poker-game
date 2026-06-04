import { useState, useEffect } from 'react';
import { socket } from '../socket';
import { playChip, playFold, playRaise } from '../sounds';

export default function BettingControls({ gameState, playerId }) {
  const player = gameState.players.find(p => p.id === playerId);
  const isMyTurn = gameState.currentActorId === playerId;

  // 문자열로 관리해야 타이핑 중 클램프 버그가 없음
  const [raiseStr, setRaiseStr] = useState(String(gameState.minRaise));

  useEffect(() => {
    setRaiseStr(String(gameState.minRaise));
  }, [gameState.minRaise, gameState.currentActorId]);

  if (!isMyTurn || !['pre-flop','flop','turn','river'].includes(gameState.phase)) {
    return (
      <div className="h-16 flex items-center justify-center text-gray-500 text-sm">
        {!['waiting','showdown'].includes(gameState.phase) && '다른 플레이어의 차례입니다'}
      </div>
    );
  }

  if (!player) return null;

  const callAmount = Math.min(gameState.currentBet - player.totalBet, player.chips);
  const canCheck = player.totalBet >= gameState.currentBet;
  const maxRaise = player.chips - (canCheck ? 0 : callAmount);
  const canRaise = maxRaise >= gameState.minRaise;

  // 실제 전송할 레이즈 금액 (입력값 검증은 버튼 클릭 시에만)
  const parsedRaise = Number(raiseStr) || gameState.minRaise;
  const clampedRaise = Math.max(gameState.minRaise, Math.min(maxRaise, parsedRaise));

  const act = (action, amount) => socket.emit('player-action', { action, amount });

  const pot = gameState.pot || 1;
  const presets = canRaise ? [
    { label: '1/4팟', value: Math.floor(pot / 4) },
    { label: '1/2팟', value: Math.floor(pot / 2) },
    { label: '팟',    value: pot },
    { label: '올인',  value: maxRaise },
  ].filter(p => p.value >= gameState.minRaise && p.value <= maxRaise) : [];

  return (
    <div className="bg-gray-900 border-t border-gray-700 p-3">
      {canRaise && (
        <div className="mb-3">
          {presets.length > 0 && (
            <div className="flex gap-2 mb-2 justify-center flex-wrap">
              {presets.map(p => (
                <button
                  key={p.label}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-xs transition-colors"
                  onClick={() => setRaiseStr(String(p.value))}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 justify-center">
            <span className="text-gray-400 text-sm whitespace-nowrap">레이즈 금액</span>
            <input
              type="number"
              className="w-36 bg-gray-700 text-white px-3 py-1.5 rounded-lg border border-gray-600 focus:outline-none focus:border-yellow-500 text-center font-bold"
              value={raiseStr}
              min={gameState.minRaise}
              max={maxRaise}
              onChange={e => setRaiseStr(e.target.value)}
              onBlur={() => setRaiseStr(String(clampedRaise))}
            />
            <span className="text-gray-500 text-xs whitespace-nowrap">
              최소 {gameState.minRaise?.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      <div className="flex gap-2 justify-center">
        <button
          className="px-5 py-2 bg-red-700 hover:bg-red-600 text-white font-bold rounded-lg transition-colors text-sm"
          onClick={() => { playFold(); act('fold'); }}
        >
          폴드
        </button>

        {canCheck ? (
          <button
            className="px-5 py-2 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors text-sm"
            onClick={() => { playChip(); act('check'); }}
          >
            체크
          </button>
        ) : (
          <button
            className="px-5 py-2 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors text-sm"
            onClick={() => { playChip(); act('call'); }}
          >
            콜 ({callAmount.toLocaleString()})
          </button>
        )}

        {canRaise && (
          <button
            className="px-5 py-2 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-lg transition-colors text-sm"
            onClick={() => { playRaise(); act('raise', clampedRaise); }}
          >
            레이즈 (+{clampedRaise.toLocaleString()})
          </button>
        )}
      </div>
    </div>
  );
}

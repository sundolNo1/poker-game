import Card from './Card';

export default function PlayerSeat({ player, isMe, phase }) {
  if (!player) return <div className="w-28 h-24" />;

  const isActive = player.isCurrentActor;
  const showdown = phase === 'showdown';

  return (
    <div className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'scale-105' : ''}`}>
      {/* Cards */}
      <div className="flex gap-1">
        {player.hand && player.hand.length > 0 ? (
          player.hand.map((card, i) => (
            <Card key={i} card={card} hidden={!isMe && !showdown && card?.hidden} />
          ))
        ) : (
          <>
            <div className="w-11 h-[62px] rounded-md bg-gray-700 opacity-30" />
            <div className="w-11 h-[62px] rounded-md bg-gray-700 opacity-30" />
          </>
        )}
      </div>

      {/* Player info */}
      <div className={`rounded-xl px-3 py-1 text-center min-w-[90px] border transition-colors ${
        isActive
          ? 'bg-yellow-500 border-yellow-300 text-black'
          : isMe
          ? 'bg-green-800 border-green-600 text-white'
          : 'bg-gray-800 border-gray-600 text-white'
      } ${player.folded ? 'opacity-40' : ''}`}>
        <div className="font-bold text-xs truncate max-w-[80px]">
          {player.isDealer ? '🃏 ' : ''}{player.name}{isMe ? ' (나)' : ''}
        </div>
        <div className="text-xs opacity-80">
          {player.allIn ? '🔴 올인' : player.folded ? '폴드' : `${player.chips.toLocaleString()}칩`}
        </div>
        {player.totalBet > 0 && !['waiting','showdown'].includes(phase) && (
          <div className="chip-badge text-yellow-300 mt-0.5">베팅 {player.totalBet}</div>
        )}
      </div>
    </div>
  );
}

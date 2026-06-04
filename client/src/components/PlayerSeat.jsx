import Card from './Card';

const AVATAR_COLORS = [
  'linear-gradient(135deg, #7c3aed, #4f46e5)',
  'linear-gradient(135deg, #dc2626, #9f1239)',
  'linear-gradient(135deg, #0891b2, #0e7490)',
  'linear-gradient(135deg, #d97706, #b45309)',
  'linear-gradient(135deg, #059669, #047857)',
  'linear-gradient(135deg, #db2777, #be185d)',
];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function ChipCount({ chips }) {
  if (chips === 0) return <span className="text-red-400 text-xs font-bold">올인</span>;
  if (chips >= 1000000) return <span className="text-yellow-300 text-xs">{(chips / 1000000).toFixed(1)}M</span>;
  if (chips >= 1000) return <span className="text-yellow-300 text-xs">{(chips / 1000).toFixed(0)}K</span>;
  return <span className="text-yellow-300 text-xs">{chips.toLocaleString()}</span>;
}

export default function PlayerSeat({ player, isMe, phase }) {
  if (!player) return <div className="w-28 h-24" />;

  const isActive = player.isCurrentActor;
  const showdown = phase === 'showdown';
  const seatClass = player.folded
    ? 'player-seat player-seat-folded player-seat-other'
    : isActive
    ? 'player-seat player-seat-active'
    : isMe
    ? 'player-seat player-seat-me'
    : 'player-seat player-seat-other';

  return (
    <div className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? 'scale-105' : ''}`}>
      {/* Cards */}
      <div className="flex gap-1.5">
        {player.hand && player.hand.length > 0 ? (
          player.hand.map((card, i) => (
            <Card key={i} card={card} hidden={!isMe && !showdown && card?.hidden} />
          ))
        ) : (
          <>
            <div className="w-[52px] h-[74px] rounded-lg bg-gray-800 opacity-20 border border-gray-700" />
            <div className="w-[52px] h-[74px] rounded-lg bg-gray-800 opacity-20 border border-gray-700" />
          </>
        )}
      </div>

      {/* Player info card */}
      <div className={seatClass}>
        <div className="flex items-center gap-2 justify-center">
          {/* Avatar */}
          <div
            className="player-avatar"
            style={{ background: getAvatarColor(player.name) }}
          >
            {player.name.slice(0, 1).toUpperCase()}
          </div>

          <div className="text-left min-w-0">
            {/* Name row */}
            <div className="flex items-center gap-1.5">
              {player.isDealer && <span className="dealer-btn">D</span>}
              <span className="font-bold text-xs truncate max-w-[70px] leading-tight">
                {player.name}{isMe ? <span className="text-green-400 ml-1">(나)</span> : ''}
              </span>
            </div>

            {/* Chips */}
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-yellow-500 text-xs">⬤</span>
              {player.allIn
                ? <span className="text-red-400 text-xs font-bold">ALL IN</span>
                : <ChipCount chips={player.chips} />
              }
            </div>
          </div>
        </div>

        {/* Bet badge */}
        {player.totalBet > 0 && !['waiting', 'showdown'].includes(phase) && (
          <div className="chip-badge text-yellow-300 mt-1.5 text-center">
            베팅 {player.totalBet.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}

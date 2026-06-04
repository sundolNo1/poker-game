const SUIT_SYMBOLS = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };

export default function Card({ card, hidden, large }) {
  const sizeClass = large ? 'card-community' : '';

  if (!card || hidden || card.hidden) {
    return <div className={`card card-back ${sizeClass} card-deal`} />;
  }

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const colorClass = isRed ? 'card-red' : 'card-black';
  const suit = SUIT_SYMBOLS[card.suit];

  return (
    <div className={`card ${colorClass} ${sizeClass} card-deal`}>
      <div className="card-value-top">
        <span style={{ lineHeight: 1 }}>{card.value}</span>
        <span style={{ fontSize: large ? 11 : 9, lineHeight: 1 }}>{suit}</span>
      </div>
      <div className="card-center">{suit}</div>
      <div className="card-value-bottom">
        <span style={{ lineHeight: 1 }}>{card.value}</span>
        <span style={{ fontSize: large ? 11 : 9, lineHeight: 1 }}>{suit}</span>
      </div>
    </div>
  );
}

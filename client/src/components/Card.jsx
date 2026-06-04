const SUIT_SYMBOLS = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };

export default function Card({ card, hidden, large }) {
  const sizeClass = large ? 'card-community' : '';

  if (!card || hidden || card.hidden) {
    return <div className={`card card-back ${sizeClass}`} />;
  }

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  return (
    <div className={`card ${isRed ? 'card-red' : 'card-black'} ${sizeClass}`}>
      <div className="leading-none">{card.value}</div>
      <div className="leading-none">{SUIT_SYMBOLS[card.suit]}</div>
    </div>
  );
}

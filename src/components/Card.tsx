import type { BellyCard } from '../types';

type CardProps = {
  card: BellyCard;
  elevated?: boolean;
};

export function Card({ card, elevated = false }: CardProps) {
  return (
    <article
      className={`belly-card belly-card--${card.rarity}${
        elevated ? ' belly-card--elevated' : ''
      }`}
    >
      <div className="belly-card__shine" aria-hidden="true" />
      <div className="belly-card__media">
        <img
          className="belly-card__image"
          src={card.image}
          alt={card.name}
          loading="lazy"
        />
      </div>
      <span className="belly-card__rarity">{card.rarity}</span>
    </article>
  );
}

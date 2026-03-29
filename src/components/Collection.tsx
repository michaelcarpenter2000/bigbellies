import { Card } from './Card';
import type { BellyCard } from '../types';

type CollectionProps = {
  cards: BellyCard[];
};

export function Collection({ cards }: CollectionProps) {
  return (
    <section className="collection" aria-labelledby="collection-heading">
      <div className="section-heading">
        <p className="section-heading__eyebrow">Owned Cards</p>
        <h2 id="collection-heading">Collection</h2>
      </div>
      {cards.length === 0 ? (
        <p className="collection__empty">
          Nothing pulled yet. Hit roll and start the belly archive.
        </p>
      ) : (
        <div className="collection__grid">
          {cards.map((card) => (
            <Card key={card.id} card={card} />
          ))}
        </div>
      )}
    </section>
  );
}

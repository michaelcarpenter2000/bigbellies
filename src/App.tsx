import { startTransition, useEffect, useState } from 'react';
import { CARD_POOL } from './data/cards';
import { Collection } from './components/Collection';
import { Card } from './components/Card';
import { RollButton } from './components/RollButton';
import { getStoredCollection, mergeUniqueCard, storeCollection } from './lib/storage';
import type { BellyCard } from './types';

function getRandomCard(): BellyCard {
  const randomIndex = Math.floor(Math.random() * CARD_POOL.length);
  return CARD_POOL[randomIndex];
}

export default function App() {
  const [collection, setCollection] = useState<BellyCard[]>(() => getStoredCollection());
  const [latestCard, setLatestCard] = useState<BellyCard | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [pullCount, setPullCount] = useState(0);

  useEffect(() => {
    storeCollection(collection);
  }, [collection]);

  function handleRoll() {
    if (isRolling) {
      return;
    }

    setIsRolling(true);

    window.setTimeout(() => {
      const pulledCard = getRandomCard();
      setLatestCard(pulledCard);
      setPullCount((count) => count + 1);

      startTransition(() => {
        setCollection((currentCollection) =>
          mergeUniqueCard(currentCollection, pulledCard),
        );
      });

      setIsRolling(false);
    }, 320);
  }

  return (
    <main className="page-shell">
      <div className="app-layout">
        <section className="hero latest-pull" aria-labelledby="latest-pull-heading">
          <div className="latest-pull__slot">
            {latestCard ? (
              <div
                key={`${latestCard.id}-${pullCount}`}
                className={isRolling ? 'card-stage is-rolling' : 'card-stage is-visible'}
              >
                <Card card={latestCard} elevated />
              </div>
            ) : (
              <div className="latest-pull__placeholder">
                <p>Press roll to reveal your first belly card.</p>
              </div>
            )}
          </div>

          <div className="latest-pull__controls">
            <RollButton onClick={handleRoll} disabled={isRolling} />
            <p className="latest-pull__meta">
              {isRolling
                ? 'Rumbling the snack dimension...'
                : '10 cards in the pool. Duplicates stay out of your collection.'}
            </p>
          </div>
        </section>

        <Collection cards={collection} />
      </div>
    </main>
  );
}

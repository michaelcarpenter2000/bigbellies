import { CARD_POOL } from '../data/cards';
import type { BellyCard } from '../types';

const STORAGE_KEY = 'big-belly-cards-collection-v1';

export function getStoredCollection(): BellyCard[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue) as string[];
    const idSet = new Set(parsed);

    return CARD_POOL.filter((card) => idSet.has(card.id));
  } catch {
    return [];
  }
}

export function storeCollection(cards: BellyCard[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  const uniqueIds = Array.from(new Set(cards.map((card) => card.id)));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(uniqueIds));
}

export function mergeUniqueCard(
  collection: BellyCard[],
  nextCard: BellyCard,
): BellyCard[] {
  if (collection.some((card) => card.id === nextCard.id)) {
    return collection;
  }

  return [...collection, nextCard];
}

export type CardRarity = 'common' | 'rare' | 'legendary';

export type BellyCard = {
  id: string;
  name: string;
  description: string;
  rarity: CardRarity;
  image: string;
};

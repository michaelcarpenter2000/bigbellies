import { useEffect, useState } from 'react';

const STARTING_WEIGHT = 120;
const CALORIES_PER_POUND = 3500;
const HANDFUL_CHIP_UNLOCK_CALORIES = CALORIES_PER_POUND * 2;
const SODA_12_PACK_UNLOCK_USES = 12;
const PIZZA_RANCH_UNLOCK_USES = 6;
const MILK_JUG_UNLOCK_USES = 8;
const STORAGE_KEY = 'big-bellies-clicker-v1';
const CHARACTER_WEIGHTS = [120, 150, 180, 200, 300, 400, 600, 1000];

type MacroKey = 'carbs' | 'fat' | 'sugar' | 'protein' | 'sodium';

type Macros = {
  carbs: number;
  fat: number;
  sugar: number;
  protein: number;
  sodium: number;
};

type FoodDefinition = {
  id: string;
  name: string;
  blurb: string;
  calories: number;
  macros: Macros;
  starter?: boolean;
  unlockRequirements?: Partial<Record<MacroKey, number>>;
};

type UpgradeDefinition = {
  id: string;
  name: string;
  blurb: string;
  unlockText: string;
  unlocked: boolean;
};

const SINGLE_CHIP: FoodDefinition = {
  id: 'chips',
  name: '1 Single Chip',
  blurb: 'Tiny starter snack. Later this can scale up to handfuls and full bags.',
  calories: 10,
  macros: { carbs: 1, fat: 0.67, sugar: 0.03, protein: 0.13, sodium: 11 },
  starter: true,
};

const HANDFUL_OF_CHIPS: FoodDefinition = {
  id: 'chips',
  name: '1 Handful of Chips',
  blurb: 'Ten chips at a time. No cooldown, just a much bigger handful.',
  calories: 100,
  macros: { carbs: 10, fat: 6.7, sugar: 0.3, protein: 1.3, sodium: 110 },
  starter: true,
};

const SINGLE_SODA: FoodDefinition = {
  id: 'soda',
  name: '1 Can of Coke',
  blurb: 'A full 12 oz can. Big sugar hit with no wait now.',
  calories: 140,
  macros: { carbs: 39, fat: 0, sugar: 39, protein: 0, sodium: 85 },
  starter: true,
};

const SODA_12_PACK: FoodDefinition = {
  id: 'soda',
  name: '12 Pack of Coke',
  blurb: 'Twelve cans at a time. The soda button has fully escalated.',
  calories: 1680,
  macros: { carbs: 468, fat: 0, sugar: 468, protein: 0, sodium: 1020 },
  starter: true,
};

const SINGLE_DOMINOS_SLICE: FoodDefinition = {
  id: 'pizza',
  name: "1 Slice of Domino's Pizza",
  blurb: 'A real fast-food slice with a much heavier nutrition hit.',
  calories: 300,
  macros: { carbs: 34, fat: 14, sugar: 4, protein: 13, sodium: 680 },
  unlockRequirements: { carbs: 120, fat: 35 },
};

const DOMINOS_SLICE_WITH_RANCH: FoodDefinition = {
  id: 'pizza',
  name: "1 Slice of Domino's Pizza + Ranch",
  blurb: 'Same slice, now drowned in ranch after enough pizza repetition.',
  calories: 520,
  macros: { carbs: 36, fat: 36, sugar: 4, protein: 14, sodium: 1030 },
  unlockRequirements: { carbs: 120, fat: 35 },
};

const CUP_OF_MILK: FoodDefinition = {
  id: 'milk',
  name: '1 Cup of Milk',
  blurb: 'A simpler drink option that still adds calories and sugar.',
  calories: 149,
  macros: { carbs: 12, fat: 8, sugar: 12, protein: 8, sodium: 105 },
  unlockRequirements: { carbs: 220, sugar: 80 },
};

const JUG_OF_MILK: FoodDefinition = {
  id: 'milk',
  name: '1 Jug of Milk',
  blurb: 'Eight cups at once. The milk escalates after enough repetition.',
  calories: 1192,
  macros: { carbs: 96, fat: 64, sugar: 96, protein: 64, sodium: 840 },
  unlockRequirements: { carbs: 220, sugar: 80 },
};

const FOOD_ITEMS: FoodDefinition[] = [
  {
    id: 'mcdouble',
    name: 'McDouble',
    blurb: 'Fast food baseline. Real calories, real fat, real protein.',
    calories: 400,
    macros: { carbs: 32, fat: 20, sugar: 0, protein: 22, sodium: 920 },
    starter: true,
  },
  {
    id: 'fried-chicken',
    name: 'Fried Chicken',
    blurb: 'High calorie, high fat, enough protein to open later foods.',
    calories: 150,
    macros: { carbs: 5, fat: 10, sugar: 0, protein: 9, sodium: 430 },
    unlockRequirements: { fat: 90, protein: 40 },
  },
  {
    id: 'bbq-wings',
    name: 'BBQ Wings',
    blurb: 'Sticky wings that push sodium, fat, and protein together.',
    calories: 95,
    macros: { carbs: 4, fat: 6, sugar: 3, protein: 7, sodium: 210 },
    unlockRequirements: { fat: 120, protein: 55 },
  },
  {
    id: 'family-bucket',
    name: 'Family Bucket',
    blurb: 'A bad decision at scale. Massive calorie jump.',
    calories: 320,
    macros: { carbs: 12, fat: 20, sugar: 1, protein: 18, sodium: 980 },
    unlockRequirements: { carbs: 400, fat: 180, protein: 100 },
  },
];

function getEstimatedWeight(calories: number) {
  return STARTING_WEIGHT + calories / CALORIES_PER_POUND;
}

function getCharacterImage(weight: number) {
  const matchedWeight = CHARACTER_WEIGHTS.reduce((currentImageWeight, threshold) => {
    if (weight >= threshold) {
      return threshold;
    }

    return currentImageWeight;
  }, CHARACTER_WEIGHTS[0]);

  return `/character/${matchedWeight}.jpg`;
}

function formatMetric(value: number) {
  return Math.round(value).toString();
}

function formatRequirements(requirements: FoodDefinition['unlockRequirements']) {
  if (!requirements) {
    return 'Available now';
  }

  return Object.entries(requirements)
    .map(([macro, amount]) => `${amount} ${macro}`)
    .join(' / ');
}

function getUnlockText(item: FoodDefinition) {
  return item.unlockRequirements ? formatRequirements(item.unlockRequirements) : 'Available now';
}

function isUnlocked(item: FoodDefinition, macroTotals: Macros) {
  if (item.starter) {
    return true;
  }

  if (!item.unlockRequirements) {
    return true;
  }

  return Object.entries(item.unlockRequirements).every(([macro, amount]) => {
    return macroTotals[macro as MacroKey] >= (amount ?? 0);
  });
}

type StoredGameState = {
  totalCalories: number;
  macroTotals: Macros;
  sodaUses: number;
  pizzaUses: number;
  milkUses: number;
};

function getDefaultMacros(): Macros {
  return {
    carbs: 0,
    fat: 0,
    sugar: 0,
    protein: 0,
    sodium: 0,
  };
}

function getStoredGameState(): StoredGameState {
  if (typeof window === 'undefined') {
      return {
        totalCalories: 0,
        macroTotals: getDefaultMacros(),
        sodaUses: 0,
        pizzaUses: 0,
        milkUses: 0,
    };
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return {
      totalCalories: 0,
      macroTotals: getDefaultMacros(),
      sodaUses: 0,
      pizzaUses: 0,
      milkUses: 0,
    };
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<StoredGameState>;

    return {
      totalCalories: typeof parsed.totalCalories === 'number' ? parsed.totalCalories : 0,
      macroTotals: {
        ...getDefaultMacros(),
        ...parsed.macroTotals,
      },
      sodaUses: typeof parsed.sodaUses === 'number' ? parsed.sodaUses : 0,
      pizzaUses: typeof parsed.pizzaUses === 'number' ? parsed.pizzaUses : 0,
      milkUses: typeof parsed.milkUses === 'number' ? parsed.milkUses : 0,
    };
  } catch {
    return {
      totalCalories: 0,
      macroTotals: getDefaultMacros(),
      sodaUses: 0,
      pizzaUses: 0,
      milkUses: 0,
    };
  }
}

export default function App() {
  const [totalCalories, setTotalCalories] = useState(() => getStoredGameState().totalCalories);
  const [macroTotals, setMacroTotals] = useState<Macros>(() => getStoredGameState().macroTotals);
  const [sodaUses, setSodaUses] = useState(() => getStoredGameState().sodaUses);
  const [pizzaUses, setPizzaUses] = useState(() => getStoredGameState().pizzaUses);
  const [milkUses, setMilkUses] = useState(() => getStoredGameState().milkUses);
  const [activeTab, setActiveTab] = useState<'foods' | 'addons'>('foods');

  const estimatedWeight = getEstimatedWeight(totalCalories);
  const characterImage = getCharacterImage(estimatedWeight);
  const currentChipItem =
    totalCalories >= HANDFUL_CHIP_UNLOCK_CALORIES ? HANDFUL_OF_CHIPS : SINGLE_CHIP;
  const currentSodaItem = sodaUses >= SODA_12_PACK_UNLOCK_USES ? SODA_12_PACK : SINGLE_SODA;
  const currentPizzaItem =
    pizzaUses >= PIZZA_RANCH_UNLOCK_USES ? DOMINOS_SLICE_WITH_RANCH : SINGLE_DOMINOS_SLICE;
  const currentMilkItem = milkUses >= MILK_JUG_UNLOCK_USES ? JUG_OF_MILK : CUP_OF_MILK;
  const availableFoods = [
    currentChipItem,
    currentSodaItem,
    currentPizzaItem,
    currentMilkItem,
    ...FOOD_ITEMS,
  ];
  const upgrades: UpgradeDefinition[] = [
    {
      id: 'chips-upgrade',
      name: 'Handful of Chips',
      blurb: 'Replaces the single chip action with a 10-chip serving.',
      unlockText: `Unlocks at ${formatMetric(HANDFUL_CHIP_UNLOCK_CALORIES)} calories gained`,
      unlocked: totalCalories >= HANDFUL_CHIP_UNLOCK_CALORIES,
    },
    {
      id: 'soda-upgrade',
      name: '12 Pack of Coke',
      blurb: 'Replaces one can with a full 12-pack soda action.',
      unlockText: `Unlocks after ${SODA_12_PACK_UNLOCK_USES} cans`,
      unlocked: sodaUses >= SODA_12_PACK_UNLOCK_USES,
    },
    {
      id: 'pizza-upgrade',
      name: 'Ranch Added',
      blurb: "Replaces the slice with Domino's pizza plus ranch.",
      unlockText: `Unlocks after ${PIZZA_RANCH_UNLOCK_USES} slices`,
      unlocked: pizzaUses >= PIZZA_RANCH_UNLOCK_USES,
    },
    {
      id: 'milk-upgrade',
      name: 'Jug of Milk',
      blurb: 'Replaces a cup with a full jug of milk.',
      unlockText: `Unlocks after ${MILK_JUG_UNLOCK_USES} cups`,
      unlocked: milkUses >= MILK_JUG_UNLOCK_USES,
    },
  ];

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        totalCalories,
        macroTotals,
        sodaUses,
        pizzaUses,
        milkUses,
      } satisfies StoredGameState),
    );
  }, [macroTotals, milkUses, pizzaUses, sodaUses, totalCalories]);

  function handleFeed(item: FoodDefinition) {
    setTotalCalories((current) => current + item.calories);
    setMacroTotals((current) => ({
      carbs: current.carbs + item.macros.carbs,
      fat: current.fat + item.macros.fat,
      sugar: current.sugar + item.macros.sugar,
      protein: current.protein + item.macros.protein,
      sodium: current.sodium + item.macros.sodium,
    }));

    if (item.id === 'soda' && sodaUses < SODA_12_PACK_UNLOCK_USES) {
      setSodaUses((current) => current + 1);
    }

    if (item.id === 'pizza' && pizzaUses < PIZZA_RANCH_UNLOCK_USES) {
      setPizzaUses((current) => current + 1);
    }

    if (item.id === 'milk' && milkUses < MILK_JUG_UNLOCK_USES) {
      setMilkUses((current) => current + 1);
    }
  }

  return (
    <main className="page-shell">
      <section className="clicker-panel">
        <div className="game-layout">
          <aside className="game-sidebar">
            <div className="character-panel" aria-label="Progress stats">
              <img
                className="character-panel__image"
                src={characterImage}
                alt={`Character at ${Math.round(estimatedWeight)} pounds`}
              />
              <article className="stat-card stat-card--progress stat-card--embedded">
                <strong className="stat-card__value stat-card__value--hero">
                  {estimatedWeight.toFixed(2)} lbs
                </strong>
                <span className="stat-card__subvalue">
                  {totalCalories.toLocaleString()} calories
                </span>
              </article>
            </div>

            <div className="stats-grid" aria-label="Current game stats">
              <article className="stat-card stat-card--macro">
                <span className="stat-card__label">Carbs</span>
                <strong className="stat-card__value">{formatMetric(macroTotals.carbs)}</strong>
              </article>
              <article className="stat-card stat-card--macro">
                <span className="stat-card__label">Fat</span>
                <strong className="stat-card__value">{formatMetric(macroTotals.fat)}</strong>
              </article>
              <article className="stat-card stat-card--macro">
                <span className="stat-card__label">Sugar</span>
                <strong className="stat-card__value">{formatMetric(macroTotals.sugar)}</strong>
              </article>
              <article className="stat-card stat-card--macro">
                <span className="stat-card__label">Protein</span>
                <strong className="stat-card__value">
                  {formatMetric(macroTotals.protein)}
                </strong>
              </article>
            </div>

            <div className="summary-grid summary-grid--bottom">
              <article className="stat-card stat-card--sodium">
                <span className="stat-card__label">Sodium</span>
                <strong className="stat-card__value">
                  {formatMetric(macroTotals.sodium)} mg
                </strong>
              </article>
            </div>
          </aside>

          <section className="shop" aria-labelledby="pantry-heading">
            <div className="shop__heading">
              <div className="shop-tabs" id="pantry-heading" role="tablist" aria-label="Food sections">
                <button
                  className={`shop-tab${activeTab === 'foods' ? ' is-active' : ''}`}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'foods'}
                  onClick={() => setActiveTab('foods')}
                >
                  Available Foods
                </button>
                <button
                  className={`shop-tab${activeTab === 'addons' ? ' is-active' : ''}`}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'addons'}
                  onClick={() => setActiveTab('addons')}
                >
                  Add-ons
                </button>
              </div>
            </div>

            {activeTab === 'foods' ? (
              <div className="shop__grid">
                {availableFoods.map((item) => {
                  const unlocked = isUnlocked(item, macroTotals);

                  return (
                    <article
                      key={item.id}
                      className={`shop-item${unlocked ? '' : ' is-locked'}`}
                    >
                      <div className="shop-item__topline">
                        <div>
                          <h3>{item.name}</h3>
                          <p className="shop-item__blurb">{item.blurb}</p>
                        </div>
                        <span className="shop-item__owned">
                          {item.starter ? 'Starter' : unlocked ? 'Unlocked' : 'Locked'}
                        </span>
                      </div>

                      <div className="shop-item__stats">
                        <span>+{formatMetric(item.calories)} calories</span>
                        <span>+{formatMetric(item.macros.carbs)} carbs</span>
                        <span>+{formatMetric(item.macros.fat)} fat</span>
                        <span>+{formatMetric(item.macros.sugar)} sugar</span>
                        <span>+{formatMetric(item.macros.protein)} protein</span>
                        <span>+{formatMetric(item.macros.sodium)}mg sodium</span>
                      </div>

                      {unlocked ? (
                        <button
                          type="button"
                          className="shop-button"
                          onClick={() => handleFeed(item)}
                        >
                          Feed {item.name}
                        </button>
                      ) : (
                        <p className="shop-item__lock">
                          Unlock requirement: {getUnlockText(item)}
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="shop__grid">
                {upgrades.map((upgrade) => (
                  <article
                    key={upgrade.id}
                    className={`shop-item${upgrade.unlocked ? '' : ' is-locked'}`}
                  >
                    <div className="shop-item__topline">
                      <div>
                        <h3>{upgrade.name}</h3>
                        <p className="shop-item__blurb">{upgrade.blurb}</p>
                      </div>
                      <span className="shop-item__owned">
                        {upgrade.unlocked ? 'Unlocked' : 'Locked'}
                      </span>
                    </div>

                    <p className="shop-item__lock">{upgrade.unlockText}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

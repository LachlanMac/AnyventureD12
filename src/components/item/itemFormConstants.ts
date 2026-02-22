// Shared constants for item form components (ItemEditModal + HomebrewItemCreator)

export const rangeOptions = [
  { value: 0, label: 'None' },
  { value: 1, label: 'Adjacent' },
  { value: 2, label: 'Nearby' },
  { value: 3, label: 'Very Short' },
  { value: 4, label: 'Short' },
  { value: 5, label: 'Moderate' },
  { value: 6, label: 'Far' },
  { value: 7, label: 'Very Far' },
  { value: 8, label: 'Distant' },
];

export const detectionOptions = [
  { value: 0, label: 'None' },
  { value: 1, label: 'Adjacent' },
  { value: 2, label: 'Nearby' },
  { value: 3, label: 'Very Short' },
  { value: 4, label: 'Short' },
  { value: 5, label: 'Moderate' },
  { value: 6, label: 'Far' },
  { value: 7, label: 'Very Far' },
  { value: 8, label: 'Distant' },
];

export const itemTypes = [
  { value: 'weapon', label: 'Weapon' },
  { value: 'boots', label: 'Boots' },
  { value: 'body', label: 'Body' },
  { value: 'gloves', label: 'Gloves' },
  { value: 'headwear', label: 'Headwear' },
  { value: 'cloak', label: 'Cloak' },
  { value: 'accessory', label: 'Accessory' },
  { value: 'shield', label: 'Shield' },
  { value: 'goods', label: 'Goods' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'consumable', label: 'Consumable' },
  { value: 'tool', label: 'Tool' },
  { value: 'instrument', label: 'Instrument' },
  { value: 'ammunition', label: 'Ammunition' },
  { value: 'runes', label: 'Runes' },
  { value: 'implant', label: 'Implant' },
];

export const rarities = [
  { value: 'common', label: 'Common' },
  { value: 'uncommon', label: 'Uncommon' },
  { value: 'rare', label: 'Rare' },
  { value: 'epic', label: 'Epic' },
  { value: 'legendary', label: 'Legendary' },
  { value: 'artifact', label: 'Artifact' },
];

export const weaponCategories = [
  { value: 'simpleMelee', label: 'Simple Melee' },
  { value: 'simpleRanged', label: 'Simple Ranged' },
  { value: 'complexMelee', label: 'Complex Melee' },
  { value: 'complexRanged', label: 'Complex Ranged' },
  { value: 'brawling', label: 'Brawling' },
  { value: 'throwing', label: 'Throwing' },
];

export const consumableCategories = [
  { value: 'poisons', label: 'Poisons' },
  { value: 'elixirs', label: 'Elixirs' },
  { value: 'potions', label: 'Potions' },
  { value: 'explosives', label: 'Explosives' },
];

export const shieldCategories = [
  { value: 'light', label: 'Light' },
  { value: 'heavy', label: 'Heavy' },
];

export const damageTypes = [
  { value: 'physical', label: 'Physical' },
  { value: 'heat', label: 'Heat' },
  { value: 'cold', label: 'Cold' },
  { value: 'electric', label: 'Electric' },
  { value: 'dark', label: 'Dark' },
  { value: 'divine', label: 'Divine' },
  { value: 'aetheric', label: 'Aetheric' },
  { value: 'psychic', label: 'Psychic' },
  { value: 'toxic', label: 'Toxic' },
];

export const damageCategories = [
  { value: 'pierce', label: 'Pierce' },
  { value: 'slash', label: 'Slash' },
  { value: 'blunt', label: 'Blunt' },
  { value: 'ranged', label: 'Ranged' },
  { value: 'black_magic', label: 'Black Magic' },
  { value: 'primal_magic', label: 'Primal Magic' },
  { value: 'white_magic', label: 'White Magic' },
  { value: 'mysticism_magic', label: 'Mysticism Magic' },
  { value: 'meta_magic', label: 'Meta Magic' },
];

export const implantTypes = [
  { value: 'eye', label: 'Eye' },
  { value: 'hand', label: 'Hand' },
  { value: 'arm', label: 'Arm' },
  { value: 'leg', label: 'Leg' },
  { value: 'skin', label: 'Skin' },
  { value: 'internal', label: 'Internal' },
];

export const craftingSkillTypes = [
  { value: '', label: 'None' },
  { value: 'alchemy', label: 'Alchemy' },
  { value: 'cooking', label: 'Cooking' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'fabrication', label: 'Fabrication' },
  { value: 'glyphcraft', label: 'Glyphcraft' },
  { value: 'biosculpting', label: 'Biosculpting' },
];

export const mitigationTypes = [
  'physical', 'cold', 'heat', 'electric', 'psychic', 'dark', 'divine', 'aetheric', 'toxic',
];

export const detectionTypes = [
  'normal', 'darksight', 'infravision', 'deadsight', 'echolocation', 'tremorsense', 'truesight', 'aethersight',
];

export const immunityTypes = [
  // Mental conditions (9)
  'afraid', 'alert', 'broken', 'charmed', 'confused', 'dazed', 'maddened', 'numbed', 'stunned',
  // Physical conditions (13)
  'bleeding', 'blinded', 'deafened', 'ignited', 'impaired', 'incapacitated', 'muted',
  'obscured', 'poisoned', 'prone', 'stasis', 'unconscious', 'winded',
];

export const movementTypes = ['walk', 'swim', 'climb', 'fly'];

// Shared inline styles
export const fieldInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem',
  backgroundColor: 'var(--color-dark-surface)',
  border: '1px solid var(--color-dark-border)',
  borderRadius: '0.25rem',
  color: 'var(--color-white)',
};

export const fieldLabelStyle: React.CSSProperties = {
  color: 'var(--color-cloud)',
  display: 'block',
  marginBottom: '0.25rem',
  fontSize: '0.875rem',
};

export const smallLabelStyle: React.CSSProperties = {
  color: 'var(--color-cloud)',
  fontSize: '0.75rem',
  display: 'block',
  marginBottom: '0.25rem',
  opacity: 0.8,
};

export const sectionBoxStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-dark-elevated)',
  padding: '1.25rem',
  borderRadius: '0.5rem',
  border: '1px solid var(--color-dark-border)',
};

export const skillCardStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-dark-bg)',
  padding: '0.75rem',
  borderRadius: '0.375rem',
  border: '1px solid var(--color-dark-border)',
};

export const skillNameStyle: React.CSSProperties = {
  color: 'var(--color-white)',
  fontWeight: '600',
  display: 'block',
  marginBottom: '0.5rem',
  fontSize: '0.9rem',
  textTransform: 'capitalize',
};

export const bonusInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem',
  backgroundColor: 'var(--color-dark-surface)',
  border: '1px solid var(--color-dark-border)',
  borderRadius: '0.25rem',
  color: 'var(--color-white)',
  fontSize: '0.9rem',
};

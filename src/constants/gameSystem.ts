// Central game system constants - single source of truth for all game mechanics

// ============================================================================
// ATTRIBUTES
// ============================================================================
export const ATTRIBUTES = ['physique', 'finesse', 'mind', 'knowledge', 'social'] as const;
export type Attribute = typeof ATTRIBUTES[number];

// ============================================================================
// SKILLS BY ATTRIBUTE
// ============================================================================
export const SKILLS_BY_ATTRIBUTE = {
  physique: ['fitness', 'deflection', 'might', 'endurance'],
  finesse: ['evasion', 'stealth', 'coordination', 'thievery'],
  mind: ['resilience', 'concentration', 'senses', 'logic'],
  knowledge: ['wildcraft', 'academics', 'magic', 'medicine'],
  social: ['expression', 'presence', 'insight', 'persuasion']
} as const;

// Flat list of all skills
export const ALL_SKILLS = Object.values(SKILLS_BY_ATTRIBUTE).flat();

// Attribute skill mappings with display names (for UI)
export const ATTRIBUTE_SKILLS = {
  physique: [
    { id: 'fitness', name: 'Fitness' },
    { id: 'deflection', name: 'Deflection' },
    { id: 'might', name: 'Might' },
    { id: 'endurance', name: 'Endurance' },
  ],
  finesse: [
    { id: 'evasion', name: 'Evasion' },
    { id: 'stealth', name: 'Stealth' },
    { id: 'coordination', name: 'Coordination' },
    { id: 'thievery', name: 'Thievery' },
  ],
  mind: [
    { id: 'resilience', name: 'Resilience' },
    { id: 'concentration', name: 'Concentration' },
    { id: 'senses', name: 'Senses' },
    { id: 'logic', name: 'Logic' },
  ],
  knowledge: [
    { id: 'wildcraft', name: 'Wildcraft' },
    { id: 'academics', name: 'Academics' },
    { id: 'magic', name: 'Magic' },
    { id: 'medicine', name: 'Medicine' },
  ],
  social: [
    { id: 'expression', name: 'Expression' },
    { id: 'presence', name: 'Presence' },
    { id: 'insight', name: 'Insight' },
    { id: 'persuasion', name: 'Persuasion' },
  ],
} as const;

// ============================================================================
// WEAPON SKILLS
// ============================================================================
export const WEAPON_SKILLS = [
  { id: 'brawling', name: 'Brawling', defaultTalent: 1 },
  { id: 'throwing', name: 'Throwing', defaultTalent: 1 },
  { id: 'simpleRangedWeapons', name: 'Simple Ranged Weapons', defaultTalent: 1 },
  { id: 'simpleMeleeWeapons', name: 'Simple Melee Weapons', defaultTalent: 1 },
  { id: 'complexRangedWeapons', name: 'Complex Ranged Weapons', defaultTalent: 0 },
  { id: 'complexMeleeWeapons', name: 'Complex Melee Weapons', defaultTalent: 0 },
] as const;

export const FREE_WEAPON_TALENTS: Record<string, number> = {
  brawling: 1,
  throwing: 1,
  simpleRangedWeapons: 1,
  simpleMeleeWeapons: 1,
};

// ============================================================================
// MAGIC SKILLS
// ============================================================================
export const MAGIC_SKILLS = [
  { id: 'black', name: 'Black Magic', defaultTalent: 0 },
  { id: 'primal', name: 'Primal Magic', defaultTalent: 0 },
  { id: 'meta', name: 'Meta Magic', defaultTalent: 0 },
  { id: 'white', name: 'White Magic', defaultTalent: 0 },
  { id: 'mystic', name: 'Mystic Magic', defaultTalent: 0 },
  { id: 'arcane', name: 'Arcane Magic', defaultTalent: 0 },
] as const;

export const MAGIC_SCHOOLS = ['meta', 'black', 'white', 'mysticism', 'primal', 'arcane'] as const;
export type MagicSchool = typeof MAGIC_SCHOOLS[number];

// ============================================================================
// CRAFTING SKILLS
// ============================================================================
export const CRAFTING_SKILLS = [
  { id: 'engineering', name: 'Engineering', defaultTalent: 0 },
  { id: 'fabrication', name: 'Fabrication', defaultTalent: 0 },
  { id: 'alchemy', name: 'Alchemy', defaultTalent: 0 },
  { id: 'cooking', name: 'Cooking', defaultTalent: 0 },
  { id: 'glyphcraft', name: 'Glyphcraft', defaultTalent: 0 },
  { id: 'biosculpting', name: 'Biosculpting', defaultTalent: 0 },
] as const;

// ============================================================================
// DICE TYPES
// ============================================================================
export const DICE_TYPES = ['d4', 'd6', 'd8', 'd10', 'd12', 'd16', 'd20', 'd24'] as const;
export type DiceType = typeof DICE_TYPES[number];

// Skill level to dice type mapping (0-7 -> d4-d24)
export const SKILL_LEVEL_TO_DICE: Record<number, DiceType> = {
  0: 'd4',
  1: 'd6',
  2: 'd8',
  3: 'd10',
  4: 'd12',
  5: 'd16',
  6: 'd20',
  7: 'd24',
};

// ============================================================================
// DAMAGE TYPES
// ============================================================================
export const DAMAGE_TYPES = [
  'physical',
  'heat',
  'cold',
  'electric',
  'dark',
  'divine',
  'arcane',
  'psychic',
  'toxic'
] as const;
export type DamageType = typeof DAMAGE_TYPES[number];

// ============================================================================
// DEFENSE TYPES
// ============================================================================
export const DEFENSE_TYPES = ['evasion', 'deflection', 'resilience', 'none'] as const;
export type DefenseType = typeof DEFENSE_TYPES[number];

// ============================================================================
// ATTACK CATEGORIES
// ============================================================================
export const ATTACK_CATEGORIES = ['pierce', 'slash', 'blunt', 'ranged'] as const;
export type AttackCategory = typeof ATTACK_CATEGORIES[number];

// ============================================================================
// RANGE DEFINITIONS
// ============================================================================
export const RANGE_OPTIONS = [
  { value: 0, label: 'Self', description: 'Self', units: 0 },
  { value: 1, label: 'Adjacent', description: 'Adjacent', units: 0 },
  { value: 2, label: 'Nearby', description: 'Nearby', units: 1 },
  { value: 3, label: 'Very Short', description: 'Very Short', units: 5 },
  { value: 4, label: 'Short', description: 'Short', units: 10 },
  { value: 5, label: 'Moderate', description: 'Moderate', units: 20 },
  { value: 6, label: 'Far', description: 'Far', units: 40 },
  { value: 7, label: 'Very Far', description: 'Very Far', units: 60 },
  { value: 8, label: 'Distant', description: 'Distant', units: 100 },
] as const;

// ============================================================================
// CHARACTER CREATION
// ============================================================================
export const BASE_TALENT_POINTS = 8;
export const BASE_ATTRIBUTE_POINTS = 6;

export const CHARACTER_STEPS = [
  'Basic Info',
  'Attributes',
  'Personality & Trait',
  'Talents',
  'Background'
] as const;

export const SKILL_TYPES = ['skills', 'weaponSkills', 'magicSkills', 'craftingSkills'] as const;

export const POPULATION_FIELDS = [
  'modules.moduleId',
  'inventory.itemId',
  'ancestry.ancestryId',
  'characterCulture.cultureId',
  'traits.traitId'
] as const;

// ============================================================================
// DATAKEY PATTERNS
// ============================================================================
export const DATAKEY_PATTERNS = {
  UT: /UT=(\d+)/,  // Untyped talent bonus
  MP: /MP=(\d+)/,  // Module points (deprecated)
  TP: /TP=(\d+)/,  // Talent points (legacy)
} as const;

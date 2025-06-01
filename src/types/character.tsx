// src/types/character.ts
// Central location for all character-related type definitions

// Basic skill data structure
export interface SkillData {
  value: number; // Dice type (0-6)
  talent: number; // Number of dice (0-3)
  diceTierModifier?: number; // Dice tier modifier (-1, 0, +1)
}

// Map of skill IDs to skill data
export interface SkillMap {
  [key: string]: SkillData;
}

// Character attributes structure
export interface Attributes {
  physique: number;
  finesse: number;
  mind: number;
  knowledge: number;
  social: number;
}

// Character resources structure
export interface Resources {
  health: { current: number; max: number };
  energy: { current: number; max: number };
  resolve: { current: number; max: number };
}

// Module point structure
export interface ModulePoints {
  total: number;
  spent: number;
}

// Physical traits structure
export interface PhysicalTraits {
  size: string;
  weight: string;
  height: string;
  gender: string;
}

// Action structure
export interface Action {
  name: string;
  description: string;
  type: 'Action' | 'Reaction' | 'Free Action';
  sourceModule: string;
  sourceModuleOption: string;
}

// Trait structure
export interface Trait {
  _id: string;
  name: string;
  type: 'positive' | 'negative';
  description: string;
}

// Module option structure
export interface ModuleOption {
  name: string;
  description: string;
  location: string;
  data: string;
}

// Subchoice structure for ancestry/culture options
export interface Subchoice {
  id: string;
  name: string;
  description: string;
  data: string;
}

// Ancestry option structure (simplified, no location or cost)
export interface AncestryOption {
  name: string;
  description: string;
  data: string;
  selected?: boolean;
  subchoices?: Subchoice[];
  requiresChoice?: boolean;
  choiceType?: string;
  selectedSubchoice?: string;
}

// Culture option structure (simplified, no location or cost)
export interface CultureOption {
  name: string;
  description: string;
  data: string;
  selected?: boolean;
}

// Ancestry structure (replaces RacialModule)
export interface Ancestry {
  _id: string;
  name: string;
  description: string;
  homeworld?: string;
  img?: string;
  portrait?: string;
  lifespan?: string;
  height?: string;
  size?: string;
  home?: string;
  language?: string;
  options: AncestryOption[];
}

// Culture structure (replaces CultureModule)
export interface Culture {
  _id: string;
  name: string;
  description: string;
  options: CultureOption[];
}

// Racial Module structure (deprecated - use Ancestry instead)
export interface RacialModule {
  _id: string;
  name: string;
  mtype: string;
  ruleset: number;
  options: ModuleOption[];
  description?: string;
}

// Module structure
export interface Module {
  _id: string;
  name: string;
  mtype: 'racial' | 'core' | 'secondary' | 'cultural' | 'personality' | 'alteration' | 'planar';
  ruleset: number;
  options: ModuleOption[];
  description?: string;
  stressors?: string[];
}

// Character module structure
export interface CharacterModule {
  moduleId: string | Module;
  selectedOptions: {
    location: string;
    selectedAt: string;
  }[];
}
// CultureModule structure (deprecated - use Culture instead)
export interface CultureModule {
  _id: string;
  name: string;
  mtype: string;
  ruleset: number;
  options: ModuleOption[];
  description?: string;
}

// Item-related types
export interface SkillBonus {
  add_bonus?: number;
  set_bonus?: number;
  add_talent?: number;
  set_talent?: number;
}

export interface Damage {
  damage: string;
  damage_extra: string;
  damage_type: string;
  category: 'pierce' | 'slash' | 'blunt' | 'ranged' | 'extra';
  secondary_damage: number;
  secondary_damage_extra: number;
  secondary_damage_type: string;
  min_range: number;
  max_range: number;
}

export interface WeaponData {
  category:
    | 'simpleMelee'
    | 'simpleRanged'
    | 'complexMelee'
    | 'complexRanged'
    | 'unarmed'
    | 'throwing';
  primary: Damage;
  secondary: Damage;
}

export interface ArmorData {
  category: 'light' | 'medium' | 'heavy' | 'shield';
  base_mitigation: number;
  dexterity_limit: number;
}

export interface ItemEffect {
  type: string;
  description: string;
  data: any;
}

export interface TalentBonus {
  add_talent: number;
  set_talent: number;
}

export interface ResourceStat {
  max: number;
  recovery: number;
}

export interface Item {
  _id: string;
  name: string;
  description: string;
  weight: number;
  value: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'artifact';
  type:
    | 'weapon'
    | 'boots'
    | 'body'
    | 'gloves'
    | 'headwear'
    | 'cloak'
    | 'accessory'
    | 'shield'
    | 'trade_good'
    | 'consumable'
    | 'tool'
    | 'instrument'
    | 'ammunition';
  weapon_category?:
    | 'simpleMelee'
    | 'simpleRanged'
    | 'complexMelee'
    | 'complexRanged'
    | 'unarmed'
    | 'throwing';
  bonus_attack?: number;
  primary?: Damage;
  secondary?: Damage;
  armor_penalties?: Record<string, number>;
  health: ResourceStat;
  resolve: ResourceStat;
  energy: ResourceStat;
  movement: number;
  attributes?: Record<string, TalentBonus>;
  basic?: Record<string, SkillBonus>;
  craft?: Record<string, SkillBonus>;
  magic?: Record<string, SkillBonus>;
  weapon?: Record<string, SkillBonus>;
  mitigation: Record<string, number>;
  detections?: Record<string, number>;
  immunities?: Record<string, boolean>;
  effects?: ItemEffect[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CharacterItem {
  // Either a reference OR full item data
  itemId?: string | Item;
  itemData?: Item; // Full item data when customized
  isCustomized: boolean;
  quantity: number;
  condition: {
    current: number;
    max: number;
  };
  dateAdded: string;
  dateModified?: string | null;
  notes: string;
}

export interface EquipmentSlot {
  itemId: string | null;
  equippedAt: string | null;
}

export interface Equipment {
  hands: EquipmentSlot;
  feet: EquipmentSlot;
  body: EquipmentSlot;
  head: EquipmentSlot;
  cloak: EquipmentSlot;
  shield: EquipmentSlot;
  accessory1: EquipmentSlot;
  accessory2: EquipmentSlot;
  accessory3: EquipmentSlot;
  accessory4: EquipmentSlot;
  weapon1: EquipmentSlot;
  weapon2: EquipmentSlot;
  weapon3: EquipmentSlot;
  weapon4: EquipmentSlot;
}

// Music skills structure
export interface MusicSkills {
  vocal: number;
  percussion: number;
  wind: number;
  strings: number;
  brass: number;
}

// Language definition
export interface Language {
  id: string;
  name: string;
  description: string;
}

// Language skills structure (Map-like object)
export interface LanguageSkills {
  [languageId: string]: number; // 0-3 proficiency level
}

// Character ancestry selection
export interface CharacterAncestry {
  ancestryId: string;
  selectedOptions: string[]; // Array of selected option names
}

// Character culture selection
export interface CharacterCulture {
  cultureId: string;
  selectedOptions: string[]; // Array of selected option names
}

// Complete character structure
export interface Character {
  _id?: string;
  userId: string;
  name: string;
  race: string; // Deprecated - use ancestry instead
  culture: string; // Deprecated - use characterCulture instead
  ancestry?: CharacterAncestry;
  characterCulture?: CharacterCulture;
  portraitUrl?: string | null;
  attributes: Attributes;
  skills: SkillMap;
  weaponSkills: SkillMap;
  magicSkills: SkillMap;
  craftingSkills: SkillMap;
  musicSkills: MusicSkills;
  languageSkills: LanguageSkills;
  resources: Resources;
  modulePoints: ModulePoints;
  languages: string[];
  stances: string[];
  physicalTraits: PhysicalTraits;
  biography: string;
  appearance: string;
  actions: Action[];
  modules: CharacterModule[];
  traits: Trait[];
  level: number;
  experience: number;
  stressors: string[];
  movement: number;
  inventory: CharacterItem[];
  equipment: Equipment;
  characterCreation?: {
    attributePointsRemaining: number;
    talentStarsRemaining: number;
  };
}

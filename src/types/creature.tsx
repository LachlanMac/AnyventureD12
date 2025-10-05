// Creature type definitions

export interface CreatureAction {
  name: string;
  cost: number;
  type: string;
  magic?: boolean;
  description: string;
  attack?: {
    roll: string;
    damage: string;
    damage_extra: string;
    damage_type: string;
    secondary_damage?: string;
    secondary_damage_extra?: string;
    secondary_damage_type?: string;
    category: string;
    min_range: number;
    max_range: number;
  };
  spell?: {
    roll: string;
    damage: string;
    damage_extra: string;
    damage_type: string;
    secondary_damage?: string;
    secondary_damage_extra?: string;
    secondary_damage_type?: string;
    target_defense: string;
    defense_difficulty: number;
    min_range: number;
    max_range: number;
  };
}

export interface CreatureReaction {
  name: string;
  cost: number;
  type: 'attack' | 'spell' | 'utility' | 'movement';
  magic?: boolean;
  basic?: boolean;
  trigger?: string;
  description: string;
  attack?: {
    roll: string;
    damage: string;
    damage_extra: string;
    damage_type: string;
    secondary_damage?: string;
    secondary_damage_extra?: string;
    secondary_damage_type?: string;
    category: 'pierce' | 'slash' | 'blunt' | 'ranged';
    min_range: number;
    max_range: number;
  };
  spell?: {
    roll: string;
    damage: string;
    damage_extra: string;
    damage_type: string;
    secondary_damage?: string;
    secondary_damage_extra?: string;
    secondary_damage_type?: string;
    target_defense: 'evasion' | 'deflection' | 'resilience' | 'none';
    defense_difficulty: number;
    min_range: number;
    max_range: number;
  };
}

export interface CreatureTrait {
  name: string;
  description: string;
}

export interface CreatureSpell {
  _id: string;
  name: string;
  description: string;
  school: string;
  subschool: string;
  checkToCast: number;
  energy: number;
  damage: number;
  damageType?: string;
  range: string;
  duration: string;
  concentration: boolean;
  reaction: boolean;
  components: string[];
}

export interface CreatureCustomSpell {
  name: string;
  description: string;
  energy_cost: number;
  roll?: string;
  damage?: string;
  damage_extra?: string;
  damage_type?: string;
  target_defense?: string;
  defense_difficulty?: number;
  min_range: number;
  max_range: number;
}

export interface CreatureMovement {
  walk: number;
  climb: number;
  swim: number;
  fly: number;
}

export interface CreatureAttributes {
  physique: { talent: number };
  finesse: { talent: number };
  mind: { talent: number };
  knowledge: { talent: number };
  social: { talent: number };
}

export interface Creature {
  _id: string;
  name: string;
  description: string;
  tactics: string;
  tier: string;
  type: string;
  size: string;
  health: {
    max: number;
    current: number;
  };
  energy: {
    max: number;
    current: number;
    recovery: number;
  };
  resolve: {
    max: number;
    current: number;
    recovery: number;
  };
  movement: CreatureMovement;
  attributes: CreatureAttributes;
  skills: Record<string, { value: number; tier: number }>;
  mitigation: Record<string, number>;
  immunities: Record<string, boolean>;
  detections: Record<string, number>;
  taming?: {
    tame_check: number;
    commands: 'basic' | 'moderate' | 'advanced';
  };
  actions: CreatureAction[];
  reactions: CreatureReaction[];
  traits: CreatureTrait[];
  loot: string[];
  languages: string[];
  challenge_rating: number;
  isHomebrew: boolean;
  source: string;
  spells: CreatureSpell[];
  customSpells?: CreatureCustomSpell[];
}

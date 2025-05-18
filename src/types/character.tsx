// src/types/character.ts
// Central location for all character-related type definitions

// Basic skill data structure
export interface SkillData {
    value: number; // Dice type (1-6)
    talent: number; // Number of dice (0-3)
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
  
  // Character trait structure (for traits assigned to a character)
  export interface CharacterTrait {
    traitId: string;
    name: string;
    type: 'positive' | 'negative';
    description: string;
    dateAdded: string;
  }
  
  // Module option structure
  export interface ModuleOption {
    name: string;
    description: string;
    location: string;
    data: string;
  }
  
  // Racial Module structure (used in RaceSelection.tsx)
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
    mtype: 'racial' | 'core' | 'secondary';
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
  export interface CultureModule {
    _id: string;
    name: string;
    mtype: string;
    ruleset: number;
    options: ModuleOption[];
    description?: string;
  }

  // Complete character structure
  export interface Character {
    _id?: string;
    userId: string;
    name: string;
    race: string;
    culture: string;
    portraitUrl?: string | null;
    attributes: Attributes;
    skills: SkillMap;
    weaponSkills: SkillMap;
    magicSkills: SkillMap;
    craftingSkills: SkillMap;
    resources: Resources;
    modulePoints: ModulePoints;
    languages: string[];
    stances: string[];
    physicalTraits: PhysicalTraits;
    biography: string;
    appearance: string;
    actions: Action[];
    modules: CharacterModule[];
    traits: CharacterTrait[];
    level: number;
    experience: number;
    stressors: string[];
    movement: number;
    characterCreation?: {
      attributePointsRemaining: number;
      talentStarsRemaining: number;
    };
   
  }
// src/utils/characterUtils.ts
// Utility functions for character creation and management

import { SkillMap, Character, PhysicalTraits } from '../types/character';
import {
  ATTRIBUTE_SKILLS,
  SPECIALIZED_SKILLS,
  MAGIC_SKILLS,
  CRAFTING_SKILLS,
} from '../constants/skillConstants';

/**
 * Initialize skills for each attribute
 * @returns A map of skill IDs to their initial values
 */
export const initializeSkills = (): SkillMap => {
  const skills: SkillMap = {};

  Object.values(ATTRIBUTE_SKILLS).forEach((skillGroup) => {
    skillGroup.forEach((skill) => {
      skills[skill.id] = { value: 0, talent: 0 };
    });
  });

  return skills;
};

/**
 * Initialize weapon skills with default values
 * @returns A map of weapon skill IDs to their initial values
 */
export const initializeWeaponSkills = (): SkillMap => {
  const weaponSkills: SkillMap = {};

  SPECIALIZED_SKILLS.forEach((skill) => {
    weaponSkills[skill.id] = { value: 0, talent: skill.defaultTalent };
  });

  return weaponSkills;
};

/**
 * Initialize magic skills with default values
 * @returns A map of magic skill IDs to their initial values
 */
export const initializeMagicSkills = (): SkillMap => {
  const magicSkills: SkillMap = {};

  MAGIC_SKILLS.forEach((skill) => {
    magicSkills[skill.id] = { value: 0, talent: 0 };
  });

  return magicSkills;
};

/**
 * Initialize crafting skills with default values
 * @returns A map of crafting skill IDs to their initial values
 */
export const initializeCraftingSkills = (): SkillMap => {
  const craftingSkills: SkillMap = {};

  CRAFTING_SKILLS.forEach((skill) => {
    craftingSkills[skill.id] = { value: 0, talent: 0 };
  });

  return craftingSkills;
};

/**
 * Create a new character with default values
 * @param userId The ID of the user creating the character
 * @returns A new character object with default values
 */
export const createDefaultCharacter = (userId: string): Character => {
  return {
    userId,
    name: '',
    race: '',
    culture: '', // Add default culture field
    portraitUrl: null,
    attributes: {
      physique: 1,
      finesse: 1,
      mind: 1,
      knowledge: 1,
      social: 1,
    },
    skills: initializeSkills(),
    weaponSkills: initializeWeaponSkills(),
    magicSkills: initializeMagicSkills(),
    craftingSkills: initializeCraftingSkills(),
    resources: {
      health: { current: 20, max: 20 },
      energy: { current: 5, max: 5 },
      resolve: { current: 20, max: 20 },
    },
    modulePoints: {
      total: 10,
      spent: 0,
    },
    languages: [],
    stances: [],
    physicalTraits: {
      size: '',
      weight: '',
      height: '',
      gender: '',
    },
    biography: '',
    appearance: '',
    actions: [],
    modules: [],
    traits: [],
    level: 1,
    experience: 0,
    movement: 5,
    inventory: [],
    equipment: {
      hands: { itemId: null, equippedAt: null },
      feet: { itemId: null, equippedAt: null },
      body: { itemId: null, equippedAt: null },
      head: { itemId: null, equippedAt: null },
      cloak: { itemId: null, equippedAt: null },
      shield: { itemId: null, equippedAt: null },
      accessory1: { itemId: null, equippedAt: null },
      accessory2: { itemId: null, equippedAt: null },
      accessory3: { itemId: null, equippedAt: null },
      accessory4: { itemId: null, equippedAt: null },
    },
    public: false,
    main_hand: { itemId: null, equippedAt: null },
    off_hand: { itemId: null, equippedAt: null },
    extra_weapons: [
      { itemId: null, equippedAt: null },
      { itemId: null, equippedAt: null },
      { itemId: null, equippedAt: null }
    ],
    musicSkills: {
      vocal: 0,
      percussion: 0,
      wind: 0,
      strings: 0,
      brass: 0,
    },
    languageSkills: {},
    spells: [],
    spellSlots: 10,
    characterCreation: {
      attributePointsRemaining: 6,
      talentStarsRemaining: 8,
    },
  };
};

/**
 * Update skills' talent values based on a character's attributes
 * @param character The character whose skills to update
 * @returns The updated character
 */
export const updateSkillTalentsFromAttributes = (character: Character): Character => {
  const updatedCharacter = { ...character };
  const updatedSkills = { ...character.skills };

  Object.entries(ATTRIBUTE_SKILLS).forEach(([attributeName, skills]) => {
    const attributeValue = character.attributes[attributeName as keyof typeof character.attributes];

    skills.forEach((skill) => {
      if (updatedSkills[skill.id]) {
        updatedSkills[skill.id] = {
          ...updatedSkills[skill.id],
          talent: attributeValue,
        };
      }
    });
  });

  updatedCharacter.skills = updatedSkills;
  return updatedCharacter;
};

/**
 * Update a character's physical trait
 * @param traits The current physical traits
 * @param trait The trait to update
 * @param value The new value for the trait
 * @returns The updated physical traits
 */
export const updatePhysicalTrait = (
  traits: PhysicalTraits,
  trait: keyof PhysicalTraits,
  value: string
): PhysicalTraits => {
  return {
    ...traits,
    [trait]: value,
  };
};

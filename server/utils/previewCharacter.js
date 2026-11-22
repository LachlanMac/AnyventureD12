import Character from '../models/Character.js';

// Skills under each attribute; a skill's talent is its attribute's value
export const ATTRIBUTE_SKILLS = {
  physique: ['fitness', 'deflection', 'might', 'endurance'],
  finesse: ['evasion', 'stealth', 'coordination', 'thievery'],
  mind: ['resilience', 'concentration', 'senses', 'logic'],
  knowledge: ['wildcraft', 'academics', 'magic', 'medicine'],
  social: ['expression', 'presence', 'insight', 'persuasion']
};

// Everyone starts with 1 talent in these weapon skills
export const BASE_WEAPON_TALENTS = {
  brawling: 1,
  throwing: 1,
  simpleRangedWeapons: 1,
  complexRangedWeapons: 0,
  simpleMeleeWeapons: 1,
  complexMeleeWeapons: 0
};

const talentsToSkills = (talents = {}) =>
  Object.fromEntries(
    Object.entries(talents).map(([key, talent]) => [key, { value: 0, talent, diceTierModifier: 0 }])
  );

/**
 * Build an unsaved, plain-object character for previews (templates, random generator).
 * Uses the same base values getCharacter resets to before applying bonuses, and sets
 * each skill's talent from its attribute. Attach modules/traits/ancestry, then run
 * applyModuleBonusesToCharacter on the result.
 */
export const createPreviewCharacter = ({
  name,
  attributes,
  weaponTalents = BASE_WEAPON_TALENTS,
  magicTalents = {},
  craftingTalents = {}
}) => {
  // Mongoose fills in every other Character default (resources, movement, skills, etc.)
  const doc = new Character({
    userId: 'preview',
    name,
    attributes,
    weaponSkills: talentsToSkills(weaponTalents),
    magicSkills: talentsToSkills(magicTalents),
    craftingSkills: talentsToSkills(craftingTalents)
  });
  const character = doc.toObject();

  character.resources.health.max = 20;
  character.resources.resolve.max = 20;
  character.resources.morale.max = 10;
  character.resources.energy.max = 5;
  character.movement = 5;
  character.initiative = 0;
  character.spellSlots = 10;

  for (const [attr, skills] of Object.entries(ATTRIBUTE_SKILLS)) {
    for (const skill of skills) {
      character.skills[skill].talent = attributes[attr];
    }
  }

  return character;
};

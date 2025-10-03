import Character from '../models/Character.js';
import { applyModuleBonusesToCharacter, extractTraitsFromModules } from '../utils/characterUtils.js';

const POPULATION_FIELDS = [
  'modules.moduleId',
  'inventory.itemId',
  'ancestry.ancestryId',
  'characterCulture.cultureId',
  'traits.traitId'
];

/**
 * Reset all skill values to 0 (fixes old double-application bug)
 */
export function resetSkillValues(character) {
  const skillTypes = ['skills', 'weaponSkills', 'magicSkills', 'craftingSkills'];

  skillTypes.forEach(skillType => {
    if (character[skillType]) {
      Object.keys(character[skillType]).forEach(skillId => {
        if (character[skillType][skillId] && character[skillType][skillId].value !== undefined) {
          character[skillType][skillId].value = 0;
        }
      });
    }
  });
}

/**
 * Get a character with all populations and bonuses applied
 */
export async function getCharacterWithBonuses(characterId, options = {}) {
  const {
    populateFields = true,
    resetSkills = true,
    recalculateModulePoints = true
  } = options;

  let query = Character.findById(characterId);

  if (populateFields) {
    POPULATION_FIELDS.forEach(field => {
      query = query.populate(field);
    });
  }

  const character = await query;
  if (!character) return null;

  // Optionally recalculate module points
  if (recalculateModulePoints) {
    const recalcResult = character.recalculateModulePoints();
    if (recalcResult.corrected) {
      console.log(`Module points corrected for character ${character.name}: ${recalcResult.previousSpent} -> ${recalcResult.calculatedSpent}`);
      await character.save();
    }
  }

  const characterWithBonuses = character.toObject();

  // Reset skill values if needed (fixes double-application bug)
  if (resetSkills) {
    resetSkillValues(characterWithBonuses);
  }

  // Apply all module bonuses
  applyModuleBonusesToCharacter(characterWithBonuses);

  // Extract derived traits
  characterWithBonuses.derivedTraits = extractTraitsFromModules(characterWithBonuses);

  return characterWithBonuses;
}

/**
 * Get all characters for a user with bonuses applied
 */
export async function getUserCharactersWithBonuses(userId) {
  const characters = await Character.find({
    userId: userId.toString()
  });

  // Apply populations and bonuses to each character
  const charactersWithBonuses = await Promise.all(
    characters.map(async (character) => {
      // We already have the character, so we'll populate manually
      const populatedChar = await Character.findById(character._id);

      for (const field of POPULATION_FIELDS) {
        await populatedChar.populate(field);
      }

      const charWithBonuses = populatedChar.toObject();
      resetSkillValues(charWithBonuses);
      applyModuleBonusesToCharacter(charWithBonuses);
      charWithBonuses.derivedTraits = extractTraitsFromModules(charWithBonuses);

      return charWithBonuses;
    })
  );

  return charactersWithBonuses;
}

/**
 * Update a character field with ownership verification
 */
export async function updateCharacterField(characterId, userId, fieldName, value) {
  const character = await Character.findById(characterId);

  if (!character) {
    throw new Error('Character not found');
  }

  if (character.userId !== userId.toString()) {
    throw new Error('Not authorized to update this character');
  }

  // Update the field
  character[fieldName] = value;
  await character.save();

  // Return updated character with bonuses
  return await getCharacterWithBonuses(characterId);
}

/**
 * Verify character ownership
 */
export async function verifyCharacterOwnership(characterId, userId) {
  const character = await Character.findById(characterId).select('userId');

  if (!character) {
    return { exists: false, isOwner: false };
  }

  return {
    exists: true,
    isOwner: character.userId === userId.toString()
  };
}

/**
 * Check if a character is public or owned by the user
 */
export async function canAccessCharacter(characterId, userId) {
  const character = await Character.findById(characterId).select('userId public');

  if (!character) {
    return false;
  }

  const isOwner = userId && character.userId === userId.toString();
  const isPublic = character.public !== false; // Default to true if not set

  return isOwner || isPublic;
}
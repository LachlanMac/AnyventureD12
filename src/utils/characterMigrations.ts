import { Character } from '../types/character';
import { SKILL_TYPES } from '../constants/character';

export interface MigrationResult {
  needsMigration: boolean;
  migratedFields: string[];
}

/**
 * Migrate baseTalent fields for old characters that don't have them
 */
export function migrateBaseTalents(character: any): MigrationResult {
  const result: MigrationResult = {
    needsMigration: false,
    migratedFields: []
  };

  const skillTypesToMigrate = ['weaponSkills', 'magicSkills', 'craftingSkills'];

  skillTypesToMigrate.forEach(skillType => {
    if (character[skillType]) {
      Object.entries(character[skillType]).forEach(([skillId, skill]: [string, any]) => {
        if (skill && skill.baseTalent === undefined && skill.talent !== undefined) {
          console.log(`[MIGRATION] Setting baseTalent for ${skillType} ${skillId}: ${skill.talent}`);
          skill.baseTalent = skill.talent;
          result.needsMigration = true;
          result.migratedFields.push(`${skillType}.${skillId}`);
        }
      });
    }
  });

  return result;
}

/**
 * Reset all skill values to 0 (fixes old double-application bug)
 */
export function resetSkillValues(character: any): void {
  SKILL_TYPES.forEach(skillType => {
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
 * Migrate old characterTrait to traits array format if needed
 */
export function migrateCharacterTraitFormat(character: any): MigrationResult {
  const result: MigrationResult = {
    needsMigration: false,
    migratedFields: []
  };

  // If character has old characterTrait field but no traits array
  if (character.characterTrait && (!character.traits || character.traits.length === 0)) {
    character.traits = [{
      traitId: character.characterTrait.traitId,
      selectedOptions: character.characterTrait.selectedOptions || [],
      dateAdded: character.characterTrait.dateAdded || new Date().toISOString()
    }];

    result.needsMigration = true;
    result.migratedFields.push('traits');

    console.log('[MIGRATION] Migrated characterTrait to traits array format');
  }

  return result;
}

/**
 * Run all character migrations
 */
export function runAllMigrations(character: any): MigrationResult {
  const results: MigrationResult[] = [];

  // Run all migrations
  results.push(migrateBaseTalents(character));
  results.push(migrateCharacterTraitFormat(character));

  // Combine results
  const combinedResult: MigrationResult = {
    needsMigration: results.some(r => r.needsMigration),
    migratedFields: results.flatMap(r => r.migratedFields)
  };

  if (combinedResult.needsMigration) {
    console.log('[MIGRATION] Character needs migration. Fields:', combinedResult.migratedFields);
  }

  return combinedResult;
}
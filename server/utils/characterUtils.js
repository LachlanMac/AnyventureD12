// server/utils/characterUtils.js
import { applyDataEffects } from './moduleEffects.js';

export const applyModuleBonusesToCharacter = (character) => {
  // Store original values to track changes
  const originalValues = {
    skills: JSON.parse(JSON.stringify(character.skills)),
    craftingSkills: JSON.parse(JSON.stringify(character.craftingSkills)),
    weaponSkills: JSON.parse(JSON.stringify(character.weaponSkills)),
    mitigation: JSON.parse(JSON.stringify(character.mitigation || {})),
    immunities: [...(character.immunities || [])],
    vision: [...(character.vision || [])],
    health: character.resources.health.max,
    movement: character.movement,
    initiative: character.initiative
  };
  
  // Temporary structure to collect bonuses
  const bonuses = {
    skills: {},
    craftingSkills: {},
    weaponSkills: {},
    mitigation: {},
    immunities: [],
    vision: [],
    health: 0,
    movement: 0,
    initiative: 0
  };
  
  // Skip if modules aren't populated
  if (!character.modules || character.modules.length === 0) {
    character.moduleEffects = { applied: false, bonuses: {} };
    return character;
  }
  
  // Process each module
  for (const moduleItem of character.modules) {
    // Skip if moduleId isn't populated
    if (!moduleItem.moduleId || typeof moduleItem.moduleId === 'string') {
      continue;
    }
    
    // Get selected options
    const selectedOptions = moduleItem.selectedOptions || [];
    
    // Skip if no options are selected
    if (selectedOptions.length === 0) {
      continue;
    }
    
    // Find the actual module data
    const module = moduleItem.moduleId;
    
    // Process each selected option
    for (const selected of selectedOptions) {
      // Find the option in the module
      const option = module.options.find(opt => opt.location === selected.location);
      
      if (option && option.data) {
        // Parse the data string
        parseDataString(option.data, bonuses);
      }
    }
  }
  
  // Apply collected bonuses directly to character
  applyBonusesToCharacter(character, bonuses);
  
  // Store the module effects for reference
  character.moduleEffects = {
    applied: true,
    bonuses: bonuses,
    originalValues: originalValues
  };
  
  return character;
};

// Parse data string and collect bonuses
const parseDataString = (dataString, bonuses) => {
  if (!dataString) return;
  
  // Split by colon for multiple effects
  const effects = dataString.split(':');
  
  for (const effect of effects) {
    // Handle different types of effects
    
    // Skill bonus (AS3=1)
    const skillMatch = effect.match(/AS([0-9A-Z])=(\d+)/);
    if (skillMatch) {
      const skillCode = skillMatch[1];
      const value = parseInt(skillMatch[2]);
      const skill = mapSkillCode(skillCode);
      
      if (skill) {
        bonuses.skills[skill] = (bonuses.skills[skill] || 0) + value;
      }
      continue;
    }
    
    // Crafting skill bonus (AC3=1)
    const craftMatch = effect.match(/AC([0-9A-Z])=(\d+)/);
    if (craftMatch) {
      const craftCode = craftMatch[1];
      const value = parseInt(craftMatch[2]);
      const craftSkill = mapCraftSkillCode(craftCode);
      
      if (craftSkill) {
        bonuses.craftingSkills[craftSkill] = (bonuses.craftingSkills[craftSkill] || 0) + value;
      }
      continue;
    }
    
    // Weapon skill bonus (AZ3=1)
    const weaponMatch = effect.match(/AZ([0-9A-Z])=(\d+)/);
    if (weaponMatch) {
      const weaponCode = weaponMatch[1];
      const value = parseInt(weaponMatch[2]);
      const weaponSkill = mapWeaponSkillCode(weaponCode);
      
      if (weaponSkill) {
        bonuses.weaponSkills[weaponSkill] = (bonuses.weaponSkills[weaponSkill] || 0) + value;
      }
      continue;
    }
    
    // Defense/Mitigation bonus (AD3=1)
    const defenseMatch = effect.match(/AD([0-9A-Z])=(\d+)/);
    if (defenseMatch) {
      const defenseCode = defenseMatch[1];
      const value = parseInt(defenseMatch[2]);
      const mitigationType = mapMitigationCode(defenseCode);
      
      if (mitigationType) {
        bonuses.mitigation[mitigationType] = (bonuses.mitigation[mitigationType] || 0) + value;
      }
      continue;
    }
    
    // Health bonus (AH=5)
    const healthMatch = effect.match(/AH=(\d+)/);
    if (healthMatch) {
      const value = parseInt(healthMatch[1]);
      bonuses.health += value;
      continue;
    }
    
    // Movement bonus (AV=2)
    const movementMatch = effect.match(/AV=(\d+)/);
    if (movementMatch) {
      const value = parseInt(movementMatch[1]);
      bonuses.movement += value;
      continue;
    }
    
    // Immunity (I3)
    const immunityMatch = effect.match(/I(\d+)/);
    if (immunityMatch) {
      const immunityCode = immunityMatch[1];
      const immunity = mapImmunityCode(immunityCode);
      
      if (immunity && !bonuses.immunities.includes(immunity)) {
        bonuses.immunities.push(immunity);
      }
      continue;
    }
    
    // Vision (D1, D2, etc.)
    const visionMatch = effect.match(/D([0-9])/);
    if (visionMatch) {
      const visionCode = visionMatch[1];
      const vision = mapVisionCode(visionCode);
      
      if (vision && !bonuses.vision.includes(vision)) {
        bonuses.vision.push(vision);
      }
      continue;
    }
  }
};

// Apply collected bonuses to character
const applyBonusesToCharacter = (character, bonuses) => {
  // Apply skill bonuses
  for (const [skill, value] of Object.entries(bonuses.skills)) {
    if (character.skills[skill]) {
      character.skills[skill].value += value;
    }
  }
  
  // Apply crafting skill bonuses
  for (const [skill, value] of Object.entries(bonuses.craftingSkills)) {
    if (character.craftingSkills[skill]) {
      character.craftingSkills[skill].value += value;
    }
  }
  
  // Apply weapon skill bonuses
  for (const [skill, value] of Object.entries(bonuses.weaponSkills)) {
    if (character.weaponSkills[skill]) {
      character.weaponSkills[skill].value += value;
    }
  }
  
  // Apply mitigation bonuses
  for (const [type, value] of Object.entries(bonuses.mitigation)) {
    if (!character.mitigation) character.mitigation = {};
    if (character.mitigation[type] !== undefined) {
      character.mitigation[type] += value;
    } else {
      character.mitigation[type] = value;
    }
  }
  
  // Apply health bonus
  character.resources.health.max += bonuses.health;
  
  // Apply movement bonus
  character.movement += bonuses.movement;
  
  // Apply initiative bonus
  character.initiative += bonuses.initiative;
  
  // Apply immunities
  if (!character.immunities) character.immunities = [];
  for (const immunity of bonuses.immunities) {
    if (!character.immunities.includes(immunity)) {
      character.immunities.push(immunity);
    }
  }
  
  // Apply vision types
  if (!character.vision) character.vision = [];
  for (const vision of bonuses.vision) {
    if (!character.vision.includes(vision)) {
      character.vision.push(vision);
    }
  }
};

// Mapping functions for codes to actual names
const mapSkillCode = (code) => {
  const skillMap = {
    '1': 'fitness',
    '2': 'deflect',
    '3': 'might',
    '4': 'evade',
    '5': 'stealth',
    '6': 'coordination',
    '7': 'resilience',
    '8': 'concentration',
    '9': 'senses',
    'A': 'science',
    'B': 'technology',
    'C': 'medicine',
    'D': 'xenology',
    'E': 'negotiation',
    'F': 'behavior',
    'G': 'presence',
    'H': 'initiative'  // This is special - it maps to the initiative value
  };
  return skillMap[code];
};

const mapCraftSkillCode = (code) => {
  const craftMap = {
    '1': 'engineering',
    '2': 'fabrication',
    '3': 'biosculpting',
    '4': 'synthesis'
  };
  return craftMap[code];
};

const mapWeaponSkillCode = (code) => {
  const weaponMap = {
    '1': 'attackWithUnarmed',
    '2': 'attackWithMeleeWeapons',
    '3': 'attackWithRangedWeapons',
    '4': 'attackWithHeavyRangedWeapons',
    '5': 'attackWithWeaponSystems',
    '7': 'damageWithUnarmed',
    '8': 'damageWithMeleeWeapons',
    '9': 'damageWithRangedWeapons',
    'A': 'damageWithHeavyRangedWeapons',
    'B': 'damageWithWeaponSystems'
    // ... add other mappings as needed
  };
  return weaponMap[code];
};

const mapMitigationCode = (code) => {
  const mitigationMap = {
    '1': 'kinetic',
    '2': 'cold',
    '3': 'heat',
    '4': 'electrical',
    '5': 'mental',
    '6': 'toxic',
    '7': 'sonic',
    '8': 'radiation'
  };
  return mitigationMap[code];
};

const mapImmunityCode = (code) => {
  const immunityMap = {
    '1': 'afraid',
    '2': 'bleeding',
    '3': 'blinded',
    '4': 'confused',
    '5': 'dazed',
    '6': 'deafened',
    '7': 'exhausted',
    '8': 'hidden',
    '9': 'ignited',
    '10': 'biological',
    '11': 'prone',
    '12': 'sleeping',
    '13': 'stasis',
    '14': 'stunned',
    '15': 'trapped',
    '16': 'unconscious',
    '17': 'wounded',
    '20': 'prone'  // Additional mapping for prone
  };
  return immunityMap[code];
};

const mapVisionCode = (code) => {
  const visionMap = {
    '1': 'thermal',
    '2': 'void',
    '3': 'normal',
    '4': 'enhanced'
  };
  return visionMap[code];
};
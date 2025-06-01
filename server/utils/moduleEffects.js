// server/utils/moduleEffects.js
/**
 * Apply module data effects to a character
 * @param {Object} character - The character to apply effects to
 * @param {String} dataString - The data string containing effect codes
 */
// server/utils/moduleEffects.js - Updated parsing logic

export const applyDataEffects = (character, dataString) => {
  if (!dataString) return;
  
  // Initialize module bonuses if not exists
  if (!character.moduleBonuses) character.moduleBonuses = {};
  
  // Split the data string by colon for multiple effects
  const effects = dataString.split(':');
  
  for (const effect of effects) {
    // Skip empty effects
    if (!effect.trim()) continue;
    
    // Parse the effect code - handle both numeric values and X/Y for dice tier modifications
    const match = effect.match(/([A-Z])([ST])([0-9A-Z])=([+-]?\d+|[XY])/);
    if (!match) continue;
    
    const [_, category, type, code, valueStr] = match;
    const value = isNaN(parseInt(valueStr)) ? valueStr : parseInt(valueStr);
    
    switch(category) {
      case 'S': // Skills
        handleSkillEffect(character, type, code, value);
        break;
      case 'W': // Weapons
        handleWeaponEffect(character, type, code, value);
        break;
      case 'M': // Magic or Mitigations (check type)
        if (type === 'S' || type === 'T') {
          handleMagicEffect(character, type, code, value);
        } else {
          handleMitigationEffect(character, code, value);
        }
        break;
      case 'C': // Crafting
        handleCraftingEffect(character, type, code, value);
        break;
      case 'A': // Auto (health, resolve, etc.)
        handleAutoEffect(character, code, value);
        break;
    }
  }
};

// Handler functions for each category

const handleSkillEffect = (character, type, code, value) => {
  // Map the code to skill/attribute
  const mapping = getSkillMapping(code);
  if (!mapping) return;
  
  if (type === 'S') { // Skill modifications
    if (typeof value === 'string' && (value === 'X' || value === 'Y')) {
      // Handle dice tier modifications
      if (mapping.type === 'skill') {
        if (!character.moduleBonuses.skills) character.moduleBonuses.skills = {};
        if (!character.moduleBonuses.skills[mapping.id]) {
          character.moduleBonuses.skills[mapping.id] = { value: 0, talent: 0, diceTierModifier: 0 };
        }
        
        // X = upgrade (+1), Y = downgrade (-1)
        const modifier = value === 'X' ? 1 : -1;
        character.moduleBonuses.skills[mapping.id].diceTierModifier = 
          (character.moduleBonuses.skills[mapping.id].diceTierModifier || 0) + modifier;
        
        // Apply to character
        if (!character.skills[mapping.id]) {
          character.skills[mapping.id] = { value: 0, talent: 0, diceTierModifier: 0 };
        }
        character.skills[mapping.id].diceTierModifier = 
          (character.skills[mapping.id].diceTierModifier || 0) + modifier;
      }
    } else if (typeof value === 'number') {
      // Regular skill value increase
      if (mapping.type === 'skill') {
        if (!character.moduleBonuses.skills) character.moduleBonuses.skills = {};
        if (!character.moduleBonuses.skills[mapping.id]) {
          character.moduleBonuses.skills[mapping.id] = { value: 0, talent: 0, diceTierModifier: 0 };
        }
        character.moduleBonuses.skills[mapping.id].value += value;
        
        // Apply to character
        if (character.skills[mapping.id]) {
          character.skills[mapping.id].value += value;
        }
      }
    }
  } else if (type === 'T') { // Talent increase
    // Only attributes can have their talent increased
    if (mapping.type === 'attribute') {
      if (!character.moduleBonuses.attributes) character.moduleBonuses.attributes = {};
      if (!character.moduleBonuses.attributes[mapping.id]) character.moduleBonuses.attributes[mapping.id] = 0;
      character.moduleBonuses.attributes[mapping.id] += value;
      
      // Apply to character
      if (character.attributes[mapping.id] !== undefined) {
        character.attributes[mapping.id] += value;
      }
    }
  }
};

const handleWeaponEffect = (character, type, code, value) => {
  const weaponSkill = mapWeaponCode(code);
  if (!weaponSkill) return;
  
  if (!character.moduleBonuses.weaponSkills) character.moduleBonuses.weaponSkills = {};
  if (!character.moduleBonuses.weaponSkills[weaponSkill]) {
    character.moduleBonuses.weaponSkills[weaponSkill] = { value: 0, talent: 0 };
  }
  
  if (type === 'S') { // Skill increase
    character.moduleBonuses.weaponSkills[weaponSkill].value += value;
    if (character.weaponSkills[weaponSkill]) {
      character.weaponSkills[weaponSkill].value += value;
    }
  } else if (type === 'T') { // Talent increase
    character.moduleBonuses.weaponSkills[weaponSkill].talent += value;
    if (character.weaponSkills[weaponSkill]) {
      character.weaponSkills[weaponSkill].talent += value;
    }
  }
};

const handleMagicEffect = (character, type, code, value) => {
  const magicSkill = mapMagicCode(code);
  if (!magicSkill) return;
  
  if (!character.moduleBonuses.magicSkills) character.moduleBonuses.magicSkills = {};
  if (!character.moduleBonuses.magicSkills[magicSkill]) {
    character.moduleBonuses.magicSkills[magicSkill] = { value: 0, talent: 0 };
  }
  
  if (type === 'S') { // Skill increase
    character.moduleBonuses.magicSkills[magicSkill].value += value;
    if (character.magicSkills[magicSkill]) {
      character.magicSkills[magicSkill].value += value;
    }
  } else if (type === 'T') { // Talent increase
    character.moduleBonuses.magicSkills[magicSkill].talent += value;
    if (character.magicSkills[magicSkill]) {
      character.magicSkills[magicSkill].talent += value;
    }
  }
};

const handleCraftingEffect = (character, type, code, value) => {
  const craftingSkill = mapCraftingCode(code);
  if (!craftingSkill) return;
  
  if (!character.moduleBonuses.craftingSkills) character.moduleBonuses.craftingSkills = {};
  if (!character.moduleBonuses.craftingSkills[craftingSkill]) {
    character.moduleBonuses.craftingSkills[craftingSkill] = { value: 0, talent: 0 };
  }
  
  if (type === 'S') { // Skill increase
    character.moduleBonuses.craftingSkills[craftingSkill].value += value;
    if (character.craftingSkills[craftingSkill]) {
      character.craftingSkills[craftingSkill].value += value;
    }
  } else if (type === 'T') { // Talent increase
    character.moduleBonuses.craftingSkills[craftingSkill].talent += value;
    if (character.craftingSkills[craftingSkill]) {
      character.craftingSkills[craftingSkill].talent += value;
    }
  }
};

const handleMitigationEffect = (character, code, value) => {
  const mitigationType = mapMitigationCode(code);
  if (!mitigationType) return;
  
  if (!character.moduleBonuses.mitigation) character.moduleBonuses.mitigation = {};
  if (!character.moduleBonuses.mitigation[mitigationType]) {
    character.moduleBonuses.mitigation[mitigationType] = 0;
  }
  
  character.moduleBonuses.mitigation[mitigationType] += value;
  
  // Apply to character
  if (character.mitigation && character.mitigation[mitigationType] !== undefined) {
    character.mitigation[mitigationType] += value;
  }
};

const handleAutoEffect = (character, code, value) => {
  switch (code) {
    case '1': // Health
      if (!character.moduleBonuses.health) character.moduleBonuses.health = 0;
      character.moduleBonuses.health += value;
      character.resources.health.max += value;
      character.resources.health.current += value;
      break;
    case '2': // Resolve
      if (!character.moduleBonuses.resolve) character.moduleBonuses.resolve = 0;
      character.moduleBonuses.resolve += value;
      character.resources.resolve.max += value;
      character.resources.resolve.current += value;
      break;
    case '3': // energy
      if (!character.moduleBonuses.energy) character.moduleBonuses.energy = 0;
      character.moduleBonuses.energy += value;
      character.resources.energy.max += value;
      character.resources.energy.current += value;
      break;
    case '4': // Movement
      if (!character.moduleBonuses.movement) character.moduleBonuses.movement = 0;
      character.moduleBonuses.movement += value;
      character.movement += value;
      break;
  }
};

// Mapping functions
const getSkillMapping = (code) => {
  const attributeMap = {
    '1': { id: 'physique', type: 'attribute' },
    '2': { id: 'finesse', type: 'attribute' },
    '3': { id: 'mind', type: 'attribute' },
    '4': { id: 'knowledge', type: 'attribute' },
    '5': { id: 'social', type: 'attribute' },
  };
  
  const skillMap = {
    'A': { id: 'fitness', type: 'skill' },
    'B': { id: 'deflection', type: 'skill' },
    'C': { id: 'might', type: 'skill' },
    'D': { id: 'endurance', type: 'skill' },
    'E': { id: 'evasion', type: 'skill' },
    'F': { id: 'stealth', type: 'skill' },
    'G': { id: 'coordination', type: 'skill' },
    'H': { id: 'thievery', type: 'skill' },
    'I': { id: 'resilience', type: 'skill' },
    'J': { id: 'concentration', type: 'skill' },
    'K': { id: 'senses', type: 'skill' },
    'L': { id: 'logic', type: 'skill' },
    'M': { id: 'wildcraft', type: 'skill' },
    'N': { id: 'academics', type: 'skill' },
    'O': { id: 'magic', type: 'skill' },
    'P': { id: 'medicine', type: 'skill' },
    'Q': { id: 'expression', type: 'skill' },
    'R': { id: 'presence', type: 'skill' },
    'S': { id: 'insight', type: 'skill' },
    'T': { id: 'persuasion', type: 'skill' },
  };
  
  return attributeMap[code] || skillMap[code] || null;
};

const mapWeaponCode = (code) => {
  const map = {
    '1': 'unarmed',
    '2': 'throwing',
    '3': 'simpleMeleeWeapons',
    '4': 'simpleRangedWeapons',
    '5': 'complexMeleeWeapons',
    '6': 'complexRangedWeapons',
  };
  return map[code];
};

const mapMagicCode = (code) => {
  const map = {
    '1': 'black',
    '2': 'primal',
    '3': 'alteration',
    '4': 'divine',
    '5': 'mystic',
  };
  return map[code];
};

const mapCraftingCode = (code) => {
  const map = {
    '1': 'engineering',
    '2': 'fabrication',
    '3': 'alchemy',
    '4': 'cooking',
    '5': 'glyphcraft',
    '6': 'bioshaping',
  };
  return map[code];
};

const mapMitigationCode = (code) => {
  const map = {
    '1': 'physical',
    '2': 'heat',
    '3': 'cold',
    '4': 'lightning',
    '5': 'dark',
    '6': 'divine',
    '7': 'aetheric',
    '8': 'psychic',
    '9': 'toxic',
  };
  return map[code];
};
  /**
   * Map vision type code to actual vision type
   * @param {String} code - The vision type code
   * @returns {String|null} - The mapped vision type or null if not found
   */
  const mapVisionType = (code) => {
    const visionMap = {
      '1': 'thermal',
      '2': 'void',
      '3': 'normal',
      '4': 'enhanced'
    };
    
    return visionMap[code] || null;
  };
  
  /**
   * Map immunity code to actual immunity type
   * @param {String} code - The immunity code
   * @returns {String|null} - The mapped immunity type or null if not found
   */
  const mapImmunityType = (code) => {
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
      '17': 'wounded'
    };
    
    return immunityMap[code] || null;
  };
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
    
    // Check for action/reaction encoding first (XINE=1, ZDME=2, YINE=1, etc.)
    const actionMatch = effect.match(/^([XYZD])([IDCT])([NM])E=(\d+)$/);
    if (actionMatch) {
      const [_, type, frequency, magic, energy] = actionMatch;
      handleActionEffect(character, type, frequency, magic, parseInt(energy));
      continue;
    }
    
    // Check for conditional effects first (CA[...], CB[...], etc.)
    const conditionalMatch = effect.match(/^C([A-G])\[([^\]]+)\]$/);
    if (conditionalMatch) {
      const [_, conditionType, effects] = conditionalMatch;
      handleConditionalEffect(character, conditionType, effects);
      continue;
    }
    
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
      case 'Y': // Magic (changed from M to avoid conflict with Mitigations)
        handleMagicEffect(character, type, code, value);
        break;
      case 'M': // Mitigations
        handleMitigationEffect(character, code, value);
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
    if (!character.weaponSkills[weaponSkill]) {
      character.weaponSkills[weaponSkill] = { value: 0, talent: 0, diceTierModifier: 0 };
    }
    character.weaponSkills[weaponSkill].value += value;
  } else if (type === 'T') { // Talent increase
    character.moduleBonuses.weaponSkills[weaponSkill].talent += value;
    if (!character.weaponSkills[weaponSkill]) {
      character.weaponSkills[weaponSkill] = { value: 0, talent: 0, diceTierModifier: 0 };
    }
    character.weaponSkills[weaponSkill].talent += value;
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
    if (!character.magicSkills[magicSkill]) {
      character.magicSkills[magicSkill] = { value: 0, talent: 0, diceTierModifier: 0 };
    }
    character.magicSkills[magicSkill].value += value;
  } else if (type === 'T') { // Talent increase
    character.moduleBonuses.magicSkills[magicSkill].talent += value;
    if (!character.magicSkills[magicSkill]) {
      character.magicSkills[magicSkill] = { value: 0, talent: 0, diceTierModifier: 0 };
    }
    character.magicSkills[magicSkill].talent += value;
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
    if (!character.craftingSkills[craftingSkill]) {
      character.craftingSkills[craftingSkill] = { value: 0, talent: 0, diceTierModifier: 0 };
    }
    character.craftingSkills[craftingSkill].value += value;
  } else if (type === 'T') { // Talent increase
    character.moduleBonuses.craftingSkills[craftingSkill].talent += value;
    if (!character.craftingSkills[craftingSkill]) {
      character.craftingSkills[craftingSkill] = { value: 0, talent: 0, diceTierModifier: 0 };
    }
    character.craftingSkills[craftingSkill].talent += value;
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
    case '9': // Spell Capacity
      if (!character.moduleBonuses.spellSlots) character.moduleBonuses.spellSlots = 0;
      character.moduleBonuses.spellSlots += value;
      character.spellSlots += value;
      break;
  }
};

const handleActionEffect = (character, type, frequency, magic, energy) => {
  // Initialize action properties if not exists
  if (!character.actionProperties) {
    character.actionProperties = [];
  }
  
  // Determine action type
  let actionType = '';
  switch (type) {
    case 'X': actionType = 'Action'; break;
    case 'Z': actionType = 'Reaction'; break;
    case 'Y': actionType = 'Both'; break;  // Action & Reaction
    case 'D': actionType = 'Downtime Action'; break;
    default: return;
  }
  
  // Determine frequency type
  let frequencyType = 'instant';
  switch (frequency) {
    case 'I': frequencyType = 'instant'; break;
    case 'D': frequencyType = 'daily'; break;
    case 'C': frequencyType = 'perCombat'; break;
    case 'T': frequencyType = 'perTarget'; break;
  }
  
  // Determine if magical
  const isMagical = magic === 'M';
  
  // Create action property object
  const actionProperty = {
    type: actionType,
    frequency: frequencyType,
    magical: isMagical,
    energy: energy,
    // Source info will be added when processing module options
  };
  
  // Add to character's action properties
  character.actionProperties.push(actionProperty);
};

const handleConditionalEffect = (character, conditionType, effectsString) => {
  // Initialize conditional bonuses if not exists
  if (!character.conditionalBonuses) character.conditionalBonuses = [];

  // Map condition type to internal condition name
  let condition = '';
  switch (conditionType) {
    case 'A': condition = 'noArmor'; break;
    case 'B': condition = 'lightArmor'; break;
    case 'C': condition = 'heavyArmor'; break;
    case 'D': condition = 'anyArmor'; break;
    case 'E': condition = 'anyShield'; break;
    case 'F': condition = 'lightShield'; break;
    case 'G': condition = 'heavyShield'; break;
    default: return; // Unknown conditional type
  }

  // Parse the effects inside the brackets
  const effects = effectsString.split(',').map(e => e.trim());
  const parsedEffects = [];

  for (const effect of effects) {
    // Parse mitigation effects (M1=2, M4=1, etc.)
    const mitigationMatch = effect.match(/^M([1-9A])=(\d+)$/);
    if (mitigationMatch) {
      const [_, mitigationType, value] = mitigationMatch;
      parsedEffects.push({
        type: 'mitigation',
        subtype: getMitigationName(mitigationType),
        value: parseInt(value)
      });
      continue;
    }

    // Parse skill effects (SSB=1, SSE=1, etc.)
    const skillMatch = effect.match(/^SS([A-T])=(\d+)$/);
    if (skillMatch) {
      const [_, skillCode, value] = skillMatch;
      const skillMapping = getSkillMapping(skillCode);
      if (skillMapping && skillMapping.type === 'skill') {
        parsedEffects.push({
          type: 'skill',
          subtype: skillMapping.id,
          value: parseInt(value)
        });
      }
      continue;
    }

    // Parse immunity effects (IA=1, IB=1, etc.)
    const immunityMatch = effect.match(/^I([A-Z])=1$/);
    if (immunityMatch) {
      const [_, immunityCode] = immunityMatch;
      const immunityName = getImmunityName(immunityCode);
      if (immunityName) {
        parsedEffects.push({
          type: 'immunity',
          subtype: immunityName,
          value: true
        });
      }
    }
  }

  // Create conditional bonus object with all effects
  const conditionalBonus = {
    condition: condition,
    effects: parsedEffects
  };

  // Add to character's conditional bonuses
  character.conditionalBonuses.push(conditionalBonus);
};

// Helper function to get mitigation names
const getMitigationName = (code) => {
  const mitigationMap = {
    '1': 'physical',
    '2': 'heat',
    '3': 'cold',
    '4': 'electric',
    '5': 'dark',
    '6': 'divine',
    '7': 'aether',
    '8': 'psychic',
    '9': 'toxic',
    'A': 'true'
  };
  return mitigationMap[code] || null;
};

// Helper function to get immunity names
const getImmunityName = (code) => {
  const immunityMap = {
    'A': 'afraid',
    'B': 'bleeding',
    'C': 'blinded',
    'D': 'charmed',
    'E': 'confused',
    'F': 'dazed',
    'G': 'deafened',
    'H': 'diseased',
    'I': 'winded',
    'J': 'prone',
    'K': 'poisoned',
    'L': 'muted',
    'M': 'stunned',
    'N': 'impaired',
    'O': 'numbed',
    'P': 'broken',
    'Q': 'incapacitated',
    'R': 'ignited',
    'S': 'hidden',
    'T': 'maddened'
  };
  return immunityMap[code] || null;
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
    '3': 'meta',
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
    '4': 'electric',
    '5': 'dark',
    '6': 'divine',
    '7': 'aether',
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

/**
 * Evaluate conditional bonuses based on character's current equipment
 * @param {Object} character - The character to evaluate
 * @param {Array} equippedItems - Array of currently equipped items
 */
export const evaluateConditionalBonuses = (character, equippedItems = []) => {
  if (!character.conditionalBonuses || character.conditionalBonuses.length === 0) {
    return;
  }

  // Reset any previously applied conditional bonuses
  if (character.activeConditionalBonuses) {
    // Remove previously applied bonuses
    for (const activeBonus of character.activeConditionalBonuses) {
      if (activeBonus.bonus === 'deflection' && character.skills.deflection) {
        character.skills.deflection.value -= activeBonus.value;
      } else if (activeBonus.bonus === 'evasion' && character.skills.evasion) {
        character.skills.evasion.value -= activeBonus.value;
      }
    }
  }

  character.activeConditionalBonuses = [];

  // Check each conditional bonus
  for (const conditionalBonus of character.conditionalBonuses) {
    let shouldApply = false;

    // Check equipped armor (body slot only) and shields
    const hasLightArmor = equippedItems.some(item => item.type === 'body' && item.armor_category === 'light');
    const hasHeavyArmor = equippedItems.some(item => item.type === 'body' && item.armor_category === 'heavy');
    const hasAnyArmor = hasLightArmor || hasHeavyArmor;
    const hasLightShield = equippedItems.some(item => item.type === 'shield' && item.shield_category === 'light');
    const hasHeavyShield = equippedItems.some(item => item.type === 'shield' && item.shield_category === 'heavy');
    const hasAnyShield = hasLightShield || hasHeavyShield;

    switch (conditionalBonus.condition) {
      case 'noArmor':
        shouldApply = !hasAnyArmor;
        break;
      case 'lightArmor':
        shouldApply = hasLightArmor;
        break;
      case 'heavyArmor':
        shouldApply = hasHeavyArmor;
        break;
      case 'anyArmor':
        shouldApply = hasAnyArmor;
        break;
      case 'anyShield':
        shouldApply = hasAnyShield;
        break;
      case 'lightShield':
        shouldApply = hasLightShield;
        break;
      case 'heavyShield':
        shouldApply = hasHeavyShield;
        break;
    }

    if (shouldApply && conditionalBonus.effects) {
      // Apply each effect from the conditional
      for (const effect of conditionalBonus.effects) {
        switch (effect.type) {
          case 'skill':
            if (!character.skills[effect.subtype]) {
              character.skills[effect.subtype] = { value: 0, talent: 0, diceTierModifier: 0 };
            }
            character.skills[effect.subtype].value += effect.value;
            break;

          case 'mitigation':
            if (!character.mitigations[effect.subtype]) {
              character.mitigations[effect.subtype] = 0;
            }
            character.mitigations[effect.subtype] += effect.value;
            break;

          case 'immunity':
            if (!character.immunities[effect.subtype]) {
              character.immunities[effect.subtype] = false;
            }
            character.immunities[effect.subtype] = effect.value;
            break;
        }
      }

      // Track the applied bonuses
      character.activeConditionalBonuses.push({
        condition: conditionalBonus.condition,
        effects: conditionalBonus.effects
      });
    }
  }
};
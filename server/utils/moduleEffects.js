// server/utils/moduleEffects.js
/**
 * Apply module data effects to a character
 * @param {Object} character - The character to apply effects to
 * @param {String} dataString - The data string containing effect codes
 */
// server/utils/moduleEffects.js - Updated parsing logic

export const applyDataEffects = (character, dataString) => {
  console.log(dataString);
  if (!dataString) return;
  
  // Initialize module bonuses if not exists
  if (!character.moduleBonuses) character.moduleBonuses = {};
  
  // Initialize trait categories if not exists
  if (!character.moduleBonuses.traitCategories) character.moduleBonuses.traitCategories = {
    general: [],
    crafting: [],
    ancestry: []
  };
  
  // Split the data string by colon for multiple effects
  const effects = dataString.split(':');
  
  for (const effect of effects) {
    // Skip empty effects
    if (!effect.trim()) continue;
    
    // Handle trait category codes
    if (effect.startsWith('T')) {
      const traitCode = effect.substring(0, 2); // Get first two characters
      const traitDetail = effect.substring(2); // Get rest of the string if any
      
      switch (traitCode) {
        case 'TG':
          // Handle General Trait
          console.log('General trait found:', traitDetail);
          if (!character.moduleBonuses.traitCategories.general.includes(traitDetail)) {
            character.moduleBonuses.traitCategories.general.push(traitDetail || 'General Trait');
          }
          break;
          
        case 'TC':
          // Handle Crafting Trait
          console.log('Crafting trait found:', traitDetail);
          if (!character.moduleBonuses.traitCategories.crafting.includes(traitDetail)) {
            character.moduleBonuses.traitCategories.crafting.push(traitDetail || 'Crafting Trait');
          }
          break;
          
        case 'TA':
          // Handle Ancestry Trait
          console.log('Ancestry trait found:', traitDetail);
          if (!character.moduleBonuses.traitCategories.ancestry.includes(traitDetail)) {
            character.moduleBonuses.traitCategories.ancestry.push(traitDetail || 'Ancestry Trait');
          }
          break;
          
        default:
          // Unknown trait code
          console.log(`Unknown trait code: ${traitCode}`);
      }
      
      continue;
    }
    
    // Handle skill advancement (like SSG=1)
    const skillMatch = effect.match(/SS([A-Z])=(\d+)/);
    if (skillMatch) {
      const [_, skillCode, valueStr] = skillMatch;
      const value = parseInt(valueStr);
      
      // Map skill code to actual skill name
      const skillName = mapSkillCodeToName(skillCode);
      if (skillName && character.skills && character.skills[skillName]) {
        console.log(`Applying skill bonus: ${skillName} +${value}`);
        
        // Initialize skill bonus tracking
        if (!character.moduleBonuses.skills) character.moduleBonuses.skills = {};
        if (!character.moduleBonuses.skills[skillName]) character.moduleBonuses.skills[skillName] = 0;
        
        // Track and apply the bonus
        character.moduleBonuses.skills[skillName] += value;
        character.skills[skillName].value += value;
      }
      continue;
    }
    
    // Original pattern for standard effect codes
    const standardMatch = effect.match(/([A-Z])([ST])([0-9A-Z])=([+-]?\d+)/);
    if (standardMatch) {
      const [_, category, type, code, valueStr] = standardMatch;
      const value = parseInt(valueStr);
      
      // Process the effect based on category, type, code, and value
      switch(category) {
        case 'S': // Skills
          handleSkillEffect(character, type, code, value);
          break;
        case 'W': // Weapons
          handleWeaponEffect(character, type, code, value);
          break;
        case 'M': // Magic or Mitigations
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
      continue;
    }
    
    // Handle any other special codes here
    
    // Log unhandled effect codes for debugging
    console.log(`Unhandled effect code: ${effect}`);
  }
};


// Handler functions for each category

const handleSkillEffect = (character, type, code, value) => {
  // Map the code to skill/attribute
  const mapping = getSkillMapping(code);
  if (!mapping) return;
  
  if (type === 'S') { // Skill increase
    // Regular skills can have their value increased
    if (mapping.type === 'skill') {
      if (!character.moduleBonuses.skills) character.moduleBonuses.skills = {};
      if (!character.moduleBonuses.skills[mapping.id]) character.moduleBonuses.skills[mapping.id] = { value: 0, talent: 0 };
      character.moduleBonuses.skills[mapping.id].value += value;
      
      // Apply to character
      if (character.skills[mapping.id]) {
        character.skills[mapping.id].value += value;
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
    case '3': // Stamina
      if (!character.moduleBonuses.stamina) character.moduleBonuses.stamina = 0;
      character.moduleBonuses.stamina += value;
      character.resources.stamina.max += value;
      character.resources.stamina.current += value;
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
// Helper function to map skill codes to skill names
function mapSkillCodeToName(code) {
  const skillMap = {
    'A': 'fitness',
    'B': 'deflection',
    'C': 'might',
    'D': 'endurance',
    'E': 'evasion',
    'F': 'stealth',
    'G': 'coordination',
    'H': 'thievery',
    'I': 'resilience',
    'J': 'concentration',
    'K': 'senses',
    'L': 'logic',
    'M': 'wildcraft',
    'N': 'academics',
    'O': 'magic',
    'P': 'medicine',
    'Q': 'expression',
    'R': 'presence',
    'S': 'insight',
    'T': 'persuasion',
  };
  
  return skillMap[code];
}
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
    '7': 'arcane',
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
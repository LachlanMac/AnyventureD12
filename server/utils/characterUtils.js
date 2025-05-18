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
  console.log("*************")
  console.log(bonuses);
    console.log("*************")
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
    if (!effect.trim()) continue;
    
    // SKILLS (S) - matching SSA=3 or ST1=1 pattern
    const skillMatch = effect.match(/^S([ST])([A-T0-9])=(-?\d+)$/);
    if (skillMatch) {
      const [_, type, code, valueStr] = skillMatch;
      const value = parseInt(valueStr);
      
      if (type === 'S') { // Skill value
        if (/^[1-5]$/.test(code)) {
          // Attribute skill (e.g. SS1=1 for Physique)
          const attributeMappings = {
            '1': 'physique',
            '2': 'finesse',
            '3': 'mind',
            '4': 'knowledge',
            '5': 'social'
          };
          const attributeName = attributeMappings[code];
          if (attributeName) {
            if (!bonuses.attributes) bonuses.attributes = {};
            bonuses.attributes[attributeName] = (bonuses.attributes[attributeName] || 0) + value;
          }
        } else {
          // Regular skill (e.g. SSA=1 for Fitness)
          const skillMappings = {
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
            'T': 'persuasion'
          };
          const skillName = skillMappings[code];
          if (skillName) {
            if (!bonuses.skills) bonuses.skills = {};
            bonuses.skills[skillName] = (bonuses.skills[skillName] || 0) + value;
          }
        }
      } else if (type === 'T') { // Talent value
        if (/^[1-5]$/.test(code)) {
          console.log(code);
          // Attribute talent (e.g. ST1=1 for Physique)
          const attributeMappings = {
            '1': 'physique',
            '2': 'finesse',
            '3': 'mind',
            '4': 'knowledge',
            '5': 'social'
          };
          const attributeName = attributeMappings[code];
          if (attributeName) {
            if (!bonuses.attributeTalents) bonuses.attributeTalents = {};
            bonuses.attributeTalents[attributeName] = (bonuses.attributeTalents[attributeName] || 0) + value;
          }
        } 
      }
      continue;
    }
    
    // WEAPONS (W) - matching WS1=1 or WT3=1 pattern
    const weaponMatch = effect.match(/^W([ST])([1-6])=(-?\d+)$/);
    if (weaponMatch) {
      const [_, type, code, valueStr] = weaponMatch;
      const value = parseInt(valueStr);
      
      const weaponMappings = {
        '1': 'unarmed',
        '2': 'throwing',
        '3': 'simpleMeleeWeapons',
        '4': 'simpleRangedWeapons',
        '5': 'complexMeleeWeapons',
        '6': 'complexRangedWeapons'
      };
      
      const weaponName = weaponMappings[code];
      if (weaponName) {
        if (!bonuses.weaponSkills) bonuses.weaponSkills = {};
        if (!bonuses.weaponSkills[weaponName]) bonuses.weaponSkills[weaponName] = {};
        
        if (type === 'S') { // Skill value
          bonuses.weaponSkills[weaponName].value = (bonuses.weaponSkills[weaponName].value || 0) + value;
        } else if (type === 'T') { // Talent value
          bonuses.weaponSkills[weaponName].talent = (bonuses.weaponSkills[weaponName].talent || 0) + value;
        }
      }
      continue;
    }
    
    // MAGIC (M) - matching MS1=1 or MT3=1 pattern
    const magicMatch = effect.match(/^M([ST])([1-5])=(-?\d+)$/);
    if (magicMatch) {
      const [_, type, code, valueStr] = magicMatch;
      const value = parseInt(valueStr);
      
      const magicMappings = {
        '1': 'black',
        '2': 'primal',
        '3': 'alteration',
        '4': 'divine',
        '5': 'mystic'
      };
      
      const magicName = magicMappings[code];
      if (magicName) {
        if (!bonuses.magicSkills) bonuses.magicSkills = {};
        if (!bonuses.magicSkills[magicName]) bonuses.magicSkills[magicName] = {};
        
        if (type === 'S') { // Skill value
          bonuses.magicSkills[magicName].value = (bonuses.magicSkills[magicName].value || 0) + value;
        } else if (type === 'T') { // Talent value
          bonuses.magicSkills[magicName].talent = (bonuses.magicSkills[magicName].talent || 0) + value;
        }
      }
      continue;
    }
    
    // CRAFTING (C) - matching CS1=1 or CT3=1 pattern
    const craftingMatch = effect.match(/^C([ST])([1-6])=(-?\d+)$/);
    if (craftingMatch) {
      const [_, type, code, valueStr] = craftingMatch;
      const value = parseInt(valueStr);
      
      const craftingMappings = {
        '1': 'engineering',
        '2': 'fabrication',
        '3': 'alchemy',
        '4': 'cooking',
        '5': 'glyphcraft',
        '6': 'bioshaping'
      };
      
      const craftingName = craftingMappings[code];
      if (craftingName) {
        if (!bonuses.craftingSkills) bonuses.craftingSkills = {};
        if (!bonuses.craftingSkills[craftingName]) bonuses.craftingSkills[craftingName] = {};
        
        if (type === 'S') { // Skill value
          bonuses.craftingSkills[craftingName].value = (bonuses.craftingSkills[craftingName].value || 0) + value;
        } else if (type === 'T') { // Talent value
          bonuses.craftingSkills[craftingName].talent = (bonuses.craftingSkills[craftingName].talent || 0) + value;
        }
      }
      continue;
    }
    
    // MITIGATIONS (M) - matching M1=1 pattern
    // Since Magic and Mitigation both use M, we differentiate by checking if the second character is a number
    const mitigationMatch = effect.match(/^M([1-9])=(-?\d+)$/);
    if (mitigationMatch) {
      const [_, code, valueStr] = mitigationMatch;
      const value = parseInt(valueStr);
      
      const mitigationMappings = {
        '1': 'physical',
        '2': 'heat',
        '3': 'cold',
        '4': 'lightning',
        '5': 'dark',
        '6': 'divine',
        '7': 'arcane',
        '8': 'psychic',
        '9': 'toxic'
      };
      
      const mitigationType = mitigationMappings[code];
      if (mitigationType) {
        if (!bonuses.mitigation) bonuses.mitigation = {};
        bonuses.mitigation[mitigationType] = (bonuses.mitigation[mitigationType] || 0) + value;
      }
      continue;
    }
    
    // AUTO stats (A) - matching A1=1 pattern
    const autoMatch = effect.match(/^A([1-4])=(-?\d+)$/);
    if (autoMatch) {
      const [_, code, valueStr] = autoMatch;
      const value = parseInt(valueStr);
      
      const autoMappings = {
        '1': 'health',
        '2': 'resolve',
        '3': 'stamina',
        '4': 'movement'
      };
      
      const statType = autoMappings[code];
      if (statType) {
        bonuses[statType] = (bonuses[statType] || 0) + value;
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
  
 if (bonuses.attributeTalents) {
    for (const [attribute, value] of Object.entries(bonuses.attributeTalents)) {
      if (character.attributes && character.attributes[attribute] !== undefined) {
        character.attributes[attribute] += value;
      }
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

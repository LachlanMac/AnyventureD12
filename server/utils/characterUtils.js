
export const applyModuleBonusesToCharacter = (character) => {
  // Initialize mitigation if it doesn't exist
  if (!character.mitigation) {
    character.mitigation = {};
  }
  
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
  
  // Helper function to process any ability for bonuses
  const processAbilityForBonuses = (ability) => {
    if (ability.data) {
      const { bonuses: abilityBonuses } = parseDataCodes(ability.data);
      // Merge bonuses into main bonuses object
      Object.keys(abilityBonuses).forEach(key => {
        if (typeof abilityBonuses[key] === 'object' && !Array.isArray(abilityBonuses[key])) {
          if (!bonuses[key]) bonuses[key] = {};
          
          // Special handling for nested objects like weaponSkills, magicSkills, craftingSkills
          if (key === 'weaponSkills' || key === 'magicSkills' || key === 'craftingSkills') {
            Object.keys(abilityBonuses[key]).forEach(subKey => {
              if (!bonuses[key][subKey]) bonuses[key][subKey] = {};
              
              // Add values instead of overwriting
              Object.keys(abilityBonuses[key][subKey]).forEach(prop => {
                bonuses[key][subKey][prop] = (bonuses[key][subKey][prop] || 0) + abilityBonuses[key][subKey][prop];
              });
            });
          } 
          // Special handling for flat key-value objects like skills, skillDiceTierModifiers, attributes
          else if (key === 'skills' || key === 'skillDiceTierModifiers' || key === 'attributes' || key === 'mitigation') {
            Object.keys(abilityBonuses[key]).forEach(subKey => {
              bonuses[key][subKey] = (bonuses[key][subKey] || 0) + abilityBonuses[key][subKey];
            });
          } else {
            Object.assign(bonuses[key], abilityBonuses[key]);
          }
        } else {
          bonuses[key] = (bonuses[key] || 0) + abilityBonuses[key];
        }
      });
    }
  };

  // Apply ancestry bonuses if present
  if (character.ancestry && character.ancestry.ancestryId && character.ancestry.selectedOptions) {
    const ancestry = character.ancestry.ancestryId;
    if (ancestry.options) {
      ancestry.options.forEach(option => {
        // Find the corresponding selected option data
        const selectedOptionData = character.ancestry.selectedOptions.find(
          so => so.name === option.name
        );
        
        // Check if this option has subchoices and a selection was made
        if (option.subchoices && selectedOptionData && selectedOptionData.selectedSubchoice) {
          // Find the selected subchoice and apply its data
          const selectedSubchoice = option.subchoices.find(
            sc => sc.id === selectedOptionData.selectedSubchoice
          );
          if (selectedSubchoice) {
            processAbilityForBonuses(selectedSubchoice);
          }
        } else {
          // Regular option without subchoices
          processAbilityForBonuses(option);
        }
      });
    }
  }
  
  // Apply culture bonuses if present
  if (character.characterCulture && character.characterCulture.cultureId && character.characterCulture.selectedOptions) {
    const culture = character.characterCulture.cultureId;
    if (culture.options) {
      culture.options.forEach(option => {
        processAbilityForBonuses(option);
      });
    }
  }
  
  // Skip if modules aren't populated
  if (!character.modules || character.modules.length === 0) {
    // Apply any ancestry/culture bonuses even if no modules
    applyBonusesToCharacter(character, bonuses);
    character.moduleEffects = { applied: true, bonuses: bonuses };
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
      
      if (option) {
        // Use centralized processing
        processAbilityForBonuses(option);
      }
    }
  }
  
  // Apply collected bonuses directly to character (modules/ancestry/culture first)
  applyBonusesToCharacter(character, bonuses);
  
  // Parse and apply equipment effects AFTER module bonuses
  const equipmentEffects = parseEquipmentEffects(character);
  applyEquipmentEffects(character, equipmentEffects);
  
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
    
    // SKILLS (S) - matching SSA=3, ST1=1, SSA=X, or SSA=Y pattern
    const skillMatch = effect.match(/^S([ST])([A-T0-9])=(-?\d+|[XY])$/);
    if (skillMatch) {
      const [_, type, code, valueStr] = skillMatch;
      const value = isNaN(parseInt(valueStr)) ? valueStr : parseInt(valueStr);
      
      if (type === 'S') { // Skill value or dice tier modifier
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
          // Regular skill (e.g. SSA=1 for Fitness or SSA=X for dice tier upgrade)
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
            if (typeof value === 'string' && (value === 'X' || value === 'Y')) {
              // Handle dice tier modifications
              if (!bonuses.skillDiceTierModifiers) bonuses.skillDiceTierModifiers = {};
              const modifier = value === 'X' ? 1 : -1;
              bonuses.skillDiceTierModifiers[skillName] = (bonuses.skillDiceTierModifiers[skillName] || 0) + modifier;
            } else if (typeof value === 'number') {
              // Handle regular skill value bonuses
              if (!bonuses.skills) bonuses.skills = {};
              bonuses.skills[skillName] = (bonuses.skills[skillName] || 0) + value;
            }
          }
        }
      } else if (type === 'T') { // Talent value
        if (/^[1-5]$/.test(code)) {
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
    
    // WEAPONS (W) - matching WS1=1, WT3=1, WS1=X, or WS1=Y pattern
    const weaponMatch = effect.match(/^W([ST])([1-6])=(-?\d+|[XY])$/);
    if (weaponMatch) {
      const [_, type, code, valueStr] = weaponMatch;
      const value = isNaN(parseInt(valueStr)) ? valueStr : parseInt(valueStr);
      
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
        
        if (type === 'S') { // Skill value or dice tier modifier
          if (typeof value === 'string' && (value === 'X' || value === 'Y')) {
            // Handle dice tier modifications
            const modifier = value === 'X' ? 1 : -1;
            bonuses.weaponSkills[weaponName].diceTierModifier = (bonuses.weaponSkills[weaponName].diceTierModifier || 0) + modifier;
          } else if (typeof value === 'number') {
            bonuses.weaponSkills[weaponName].value = (bonuses.weaponSkills[weaponName].value || 0) + value;
          }
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
        '3': 'meta',
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
    
    // CRAFTING (C) - matching CS1=1, CT3=1, CS1=X, or CS1=Y pattern
    const craftingMatch = effect.match(/^C([ST])([1-6])=(-?\d+|[XY])$/);
    if (craftingMatch) {
      const [_, type, code, valueStr] = craftingMatch;
      const value = isNaN(parseInt(valueStr)) ? valueStr : parseInt(valueStr);
      
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
        
        if (type === 'S') { // Skill value or dice tier modifier
          if (typeof value === 'string' && (value === 'X' || value === 'Y')) {
            // Handle dice tier modifications
            const modifier = value === 'X' ? 1 : -1;
            bonuses.craftingSkills[craftingName].diceTierModifier = (bonuses.craftingSkills[craftingName].diceTierModifier || 0) + modifier;
          } else if (typeof value === 'number') {
            bonuses.craftingSkills[craftingName].value = (bonuses.craftingSkills[craftingName].value || 0) + value;
          }
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
        '4': 'electric',
        '5': 'dark',
        '6': 'divine',
        '7': 'aether',
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
        '3': 'energy',
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
  if (bonuses.skills) {
    for (const [skill, value] of Object.entries(bonuses.skills)) {
      if (character.skills[skill]) {
        character.skills[skill].value += value;
      }
    }
  }
  
  // Apply skill dice tier modifiers
  if (bonuses.skillDiceTierModifiers) {
    for (const [skill, modifier] of Object.entries(bonuses.skillDiceTierModifiers)) {
      if (character.skills[skill]) {
        if (!character.skills[skill].diceTierModifier) {
          character.skills[skill].diceTierModifier = 0;
        }
        character.skills[skill].diceTierModifier += modifier;
      }
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
  if (bonuses.craftingSkills) {
    for (const [skill, data] of Object.entries(bonuses.craftingSkills)) {
      if (character.craftingSkills[skill]) {
        if (data.value !== undefined) {
          character.craftingSkills[skill].value += data.value;
        }
        if (data.talent !== undefined) {
          character.craftingSkills[skill].talent += data.talent;
        }
        if (data.diceTierModifier !== undefined) {
          if (!character.craftingSkills[skill].diceTierModifier) {
            character.craftingSkills[skill].diceTierModifier = 0;
          }
          character.craftingSkills[skill].diceTierModifier += data.diceTierModifier;
        }
      }
    }
  }
  
  // Apply weapon skill bonuses
  if (bonuses.weaponSkills) {
    for (const [skill, data] of Object.entries(bonuses.weaponSkills)) {
      if (character.weaponSkills[skill]) {
        if (data.value !== undefined) {
          character.weaponSkills[skill].value += data.value;
        }
        if (data.talent !== undefined) {
          character.weaponSkills[skill].talent += data.talent;
        }
        if (data.diceTierModifier !== undefined) {
          if (!character.weaponSkills[skill].diceTierModifier) {
            character.weaponSkills[skill].diceTierModifier = 0;
          }
          character.weaponSkills[skill].diceTierModifier += data.diceTierModifier;
        }
      }
    }
  }
  
  // Apply mitigation bonuses
  if (bonuses.mitigation) {
    for (const [type, value] of Object.entries(bonuses.mitigation)) {
      if (!character.mitigation) character.mitigation = {};
      if (character.mitigation[type] !== undefined) {
        character.mitigation[type] += value;
      } else {
        character.mitigation[type] = value;
      }
    }
  }
  
  // Apply health bonus
  if (bonuses.health) {
    character.resources.health.max += bonuses.health;
  }
  
  // Apply movement bonus
  if (bonuses.movement) {
    character.movement += bonuses.movement;
  }
  
  // Apply initiative bonus
  if (bonuses.initiative) {
    character.initiative += bonuses.initiative;
  }
  
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

// Centralized data parsing function that extracts both bonuses and trait information
export const parseDataCodes = (dataString) => {
  if (!dataString) return { bonuses: {}, traitCategory: null };
  
  const bonuses = {};
  let traitCategory = null;
  
  // Check for trait codes
  if (dataString.includes('TA')) traitCategory = 'Ancestry';
  else if (dataString.includes('TG')) traitCategory = 'General';
  else if (dataString.includes('TC')) traitCategory = 'Crafting';
  else if (dataString.includes('TO')) traitCategory = 'Offensive';
  else if (dataString.includes('TD')) traitCategory = 'Defensive';
  
  // Use existing parseDataString to handle all the bonus logic
  parseDataString(dataString, bonuses);
  
  return { bonuses, traitCategory };
};

export const parseTraitCategory = (dataString) => {
  if (!dataString) return null;
  if (dataString.includes('TG')) return 'General';
  if (dataString.includes('TC')) return 'Crafting';
  if (dataString.includes('TA')) return 'Ancestry';
  if (dataString.includes('TO')) return 'Offensive';
  if (dataString.includes('TD')) return 'Defensive';
  
  return null;
};

// Helper function to process a single ability/option and extract traits
const processAbilityForTraits = (ability, sourceName, sourceType, traitCategories) => {
  if (!ability.data) return;
  
  const { traitCategory } = parseDataCodes(ability.data);
  
  if (traitCategory) {
    const trait = {
      name: ability.name,
      description: ability.description,
      source: sourceName,
      type: sourceType
    };
    
    // Use Ancestry category for both ancestry and culture traits
    const categoryKey = traitCategory === 'Ancestry' ? 'Ancestry' : traitCategory;
    traitCategories[categoryKey].push(trait);
  }
};

// Extract and categorize traits from all sources using unified parsing
// Parse equipment bonuses and penalties from equipped items
export const parseEquipmentEffects = (character) => {

  const equipmentEffects = {
    bonuses: {
      skills: {},
      weaponSkills: {},
      magicSkills: {},
      craftingSkills: {},
      attributes: {},
      mitigation: {},
      health: { max: 0, recovery: 0 },
      energy: { max: 0, recovery: 0 },
      resolve: { max: 0, recovery: 0 },
      movement: 0,
      bonusAttack: 0,
      detections: {},
      immunities: []
    },
    penalties: {
      skills: {},
      movement: 0,
      energy: 0
    },
    appliedItems: []
  };

  if (!character.equipment || !character.inventory) {
    return equipmentEffects;
  }

  // Helper function to get item data from inventory
  const getItemFromInventory = (itemId) => {
    
    const inventoryItem = character.inventory.find(item => {
      // Convert both sides to strings for comparison
      const itemIdStr = itemId.toString();
      
      if (item.itemId && typeof item.itemId === 'object') {
        // Populated item - compare _id
        return item.itemId._id.toString() === itemIdStr;
      } else if (item.itemId && typeof item.itemId === 'string') {
        // String reference
        return item.itemId === itemIdStr;
      } else if (item.itemData && item.itemData._id) {
        // Customized item
        return item.itemData._id.toString() === itemIdStr;
      }
      
      return false;
    });
    
    
    if (!inventoryItem) return null;
    
    // Return the actual item data
    if (inventoryItem.itemData) {
      return inventoryItem.itemData; // Customized item
    } else if (typeof inventoryItem.itemId === 'object') {
      return inventoryItem.itemId; // Populated item
    }
    
    return null;
  };

  // Process each equipment slot
  Object.entries(character.equipment).forEach(([slotName, slot]) => {
    if (!slot.itemId) {
      return;
    }

    const item = getItemFromInventory(slot.itemId);
    if (!item) {
      return;
    }

    equipmentEffects.appliedItems.push({
      name: item.name,
      slot: slotName,
      type: item.type
    });

    // Apply positive bonuses from item
    
    // Weapon bonuses
    if (item.bonus_attack) {
      equipmentEffects.bonuses.bonusAttack += item.bonus_attack;
    }

    // Resource bonuses
    if (item.health) {
      equipmentEffects.bonuses.health.max += item.health.max || 0;
      equipmentEffects.bonuses.health.recovery += item.health.recovery || 0;
    }
    if (item.energy) {
      equipmentEffects.bonuses.energy.max += item.energy.max || 0;
      equipmentEffects.bonuses.energy.recovery += item.energy.recovery || 0;
    }
    if (item.resolve) {
      equipmentEffects.bonuses.resolve.max += item.resolve.max || 0;
      equipmentEffects.bonuses.resolve.recovery += item.resolve.recovery || 0;
    }

    // Movement bonus
    if (item.movement) {
      equipmentEffects.bonuses.movement += item.movement;
    }

    // Attribute bonuses
    if (item.attributes) {
      Object.entries(item.attributes).forEach(([attr, bonus]) => {
        if (bonus.add_talent) {
          if (!equipmentEffects.bonuses.attributes[attr]) {
            equipmentEffects.bonuses.attributes[attr] = 0;
          }
          equipmentEffects.bonuses.attributes[attr] += bonus.add_talent;
        }
        if (bonus.set_talent) {
          equipmentEffects.bonuses.attributes[attr] = Math.max(
            equipmentEffects.bonuses.attributes[attr] || 0, 
            bonus.set_talent
          );
        }
      });
    }

    // Skill bonuses
    if (item.basic) {
      Object.entries(item.basic).forEach(([skill, bonus]) => {
        if (!equipmentEffects.bonuses.skills[skill]) {
          equipmentEffects.bonuses.skills[skill] = { value: 0, talent: 0 };
        }
        if (bonus.add_bonus) {
          equipmentEffects.bonuses.skills[skill].value += bonus.add_bonus;
        }
        if (bonus.set_bonus) {
          equipmentEffects.bonuses.skills[skill].value = Math.max(
            equipmentEffects.bonuses.skills[skill].value, 
            bonus.set_bonus
          );
        }
        if (bonus.add_talent) {
          equipmentEffects.bonuses.skills[skill].talent += bonus.add_talent;
        }
        if (bonus.set_talent) {
          equipmentEffects.bonuses.skills[skill].talent = Math.max(
            equipmentEffects.bonuses.skills[skill].talent, 
            bonus.set_talent
          );
        }
      });
    }

    // Weapon skill bonuses
    if (item.weapon) {
      Object.entries(item.weapon).forEach(([weaponType, bonus]) => {
        if (!equipmentEffects.bonuses.weaponSkills[weaponType]) {
          equipmentEffects.bonuses.weaponSkills[weaponType] = { value: 0, talent: 0 };
        }
        if (bonus.add_bonus) {
          equipmentEffects.bonuses.weaponSkills[weaponType].value += bonus.add_bonus;
        }
        if (bonus.add_talent) {
          equipmentEffects.bonuses.weaponSkills[weaponType].talent += bonus.add_talent;
        }
      });
    }

    // Magic skill bonuses
    if (item.magic) {
      Object.entries(item.magic).forEach(([magicType, bonus]) => {
        if (!equipmentEffects.bonuses.magicSkills[magicType]) {
          equipmentEffects.bonuses.magicSkills[magicType] = { value: 0, talent: 0 };
        }
        if (bonus.add_bonus) {
          equipmentEffects.bonuses.magicSkills[magicType].value += bonus.add_bonus;
        }
        if (bonus.add_talent) {
          equipmentEffects.bonuses.magicSkills[magicType].talent += bonus.add_talent;
        }
      });
    }

    // Crafting skill bonuses
    if (item.craft) {
      Object.entries(item.craft).forEach(([craftType, bonus]) => {
        if (!equipmentEffects.bonuses.craftingSkills[craftType]) {
          equipmentEffects.bonuses.craftingSkills[craftType] = { value: 0, talent: 0 };
        }
        if (bonus.add_bonus) {
          equipmentEffects.bonuses.craftingSkills[craftType].value += bonus.add_bonus;
        }
        if (bonus.add_talent) {
          equipmentEffects.bonuses.craftingSkills[craftType].talent += bonus.add_talent;
        }
      });
    }

    // Mitigation bonuses
    if (item.mitigation) {
      Object.entries(item.mitigation).forEach(([damageType, value]) => {
        if (!equipmentEffects.bonuses.mitigation[damageType]) {
          equipmentEffects.bonuses.mitigation[damageType] = 0;
        }
        equipmentEffects.bonuses.mitigation[damageType] += value;
      });
    }

    // Detection bonuses
    if (item.detections) {
      Object.entries(item.detections).forEach(([detectionType, value]) => {
        if (!equipmentEffects.bonuses.detections[detectionType]) {
          equipmentEffects.bonuses.detections[detectionType] = 0;
        }
        equipmentEffects.bonuses.detections[detectionType] += value;
      });
    }

    // Immunities
    if (item.immunities) {
      Object.entries(item.immunities).forEach(([immunityType, hasImmunity]) => {
        if (hasImmunity && !equipmentEffects.bonuses.immunities.includes(immunityType)) {
          equipmentEffects.bonuses.immunities.push(immunityType);
        }
      });
    }

    // Apply penalties (typically from armor)
    if (item.armor_penalties) {
      Object.entries(item.armor_penalties).forEach(([penaltyType, value]) => {
        // Handle movement penalty
        if (penaltyType === 'movement') {
          equipmentEffects.penalties.movement += Math.abs(value); // Convert to positive for penalty
        }
        // Handle energy penalty
        else if (penaltyType === 'energy') {
          equipmentEffects.penalties.energy += Math.abs(value);
        }
        // Handle skill penalties
        else {
          if (!equipmentEffects.penalties.skills[penaltyType]) {
            equipmentEffects.penalties.skills[penaltyType] = 0;
          }
          const penaltyAmount = Math.abs(value);
          equipmentEffects.penalties.skills[penaltyType] += penaltyAmount; // Convert to positive for penalty
        }
      });
    }
  });

  return equipmentEffects;
};

// Apply equipment effects to character
export const applyEquipmentEffects = (character, equipmentEffects) => {
  // Apply attribute bonuses
  if (equipmentEffects.bonuses.attributes) {
    Object.entries(equipmentEffects.bonuses.attributes).forEach(([attr, bonus]) => {
      if (character.attributes && character.attributes[attr] !== undefined) {
        character.attributes[attr] += bonus;
      }
    });
  }

  // Apply skill bonuses
  if (equipmentEffects.bonuses.skills) {
    Object.entries(equipmentEffects.bonuses.skills).forEach(([skill, bonusData]) => {
      if (character.skills[skill]) {
        if (bonusData.value) character.skills[skill].value += bonusData.value;
        if (bonusData.talent) character.skills[skill].talent += bonusData.talent;
        // Equipment never applies diceTierModifier - only racial size bonuses do that
      }
    });
  }

  // Apply weapon skill bonuses
  if (equipmentEffects.bonuses.weaponSkills) {
    Object.entries(equipmentEffects.bonuses.weaponSkills).forEach(([weaponType, bonusData]) => {
      if (character.weaponSkills[weaponType]) {
        if (bonusData.value) character.weaponSkills[weaponType].value += bonusData.value;
        if (bonusData.talent) character.weaponSkills[weaponType].talent += bonusData.talent;
        // Equipment never applies diceTierModifier - only racial size bonuses do that
      }
    });
  }

  // Apply magic skill bonuses
  if (equipmentEffects.bonuses.magicSkills) {
    Object.entries(equipmentEffects.bonuses.magicSkills).forEach(([magicType, bonusData]) => {
      if (character.magicSkills[magicType]) {
        if (bonusData.value) character.magicSkills[magicType].value += bonusData.value;
        if (bonusData.talent) character.magicSkills[magicType].talent += bonusData.talent;
        // Equipment never applies diceTierModifier - only racial size bonuses do that
      }
    });
  }

  // Apply crafting skill bonuses
  if (equipmentEffects.bonuses.craftingSkills) {
    Object.entries(equipmentEffects.bonuses.craftingSkills).forEach(([craftType, bonusData]) => {
      if (character.craftingSkills[craftType]) {
        if (bonusData.value) character.craftingSkills[craftType].value += bonusData.value;
        if (bonusData.talent) character.craftingSkills[craftType].talent += bonusData.talent;
        // Equipment never applies diceTierModifier - only racial size bonuses do that
      }
    });
  }

  // Apply resource bonuses
  if (equipmentEffects.bonuses.health.max) {
    const oldHealthMax = character.resources.health.max;
    character.resources.health.max += equipmentEffects.bonuses.health.max;
    // If current health was at old max, raise it to new max
    if (character.resources.health.current === oldHealthMax) {
      character.resources.health.current = character.resources.health.max;
    }
  }
  if (equipmentEffects.bonuses.energy.max) {
    const oldEnergyMax = character.resources.energy.max;
    character.resources.energy.max += equipmentEffects.bonuses.energy.max;
    // If current energy was at old max, raise it to new max
    if (character.resources.energy.current === oldEnergyMax) {
      character.resources.energy.current = character.resources.energy.max;
    }
  }
  if (equipmentEffects.bonuses.resolve.max) {
    const oldResolveMax = character.resources.resolve.max;
    character.resources.resolve.max += equipmentEffects.bonuses.resolve.max;
    // If current resolve was at old max, raise it to new max
    if (character.resources.resolve.current === oldResolveMax) {
      character.resources.resolve.current = character.resources.resolve.max;
    }
  }

  // Apply movement bonuses
  if (equipmentEffects.bonuses.movement) {
    character.movement += equipmentEffects.bonuses.movement;
  }

  // Apply mitigation bonuses
  if (equipmentEffects.bonuses.mitigation) {
    if (!character.mitigation) character.mitigation = {};
    Object.entries(equipmentEffects.bonuses.mitigation).forEach(([damageType, value]) => {
      character.mitigation[damageType] = (character.mitigation[damageType] || 0) + value;
    });
  }

  // Apply penalties
  
  // Movement penalties
  if (equipmentEffects.penalties.movement) {
    const oldMovement = character.movement;
    character.movement = Math.max(0, character.movement - equipmentEffects.penalties.movement);
  }

  // Energy penalties
  if (equipmentEffects.penalties.energy) {
    const oldEnergy = character.resources.energy.max;
    character.resources.energy.max = Math.max(1, character.resources.energy.max - equipmentEffects.penalties.energy);
  }

  // Skill penalties
  if (equipmentEffects.penalties.skills) {
    Object.entries(equipmentEffects.penalties.skills).forEach(([skill, penalty]) => {
      if (character.skills[skill]) {
        const oldValue = character.skills[skill].value;
        // Apply penalty directly to skill value (can go below 0)
        character.skills[skill].value -= penalty;
      }
    });
  }

  // Calculate sprint speed: (movement * 2) - sprint penalties
  const sprintPenalty = equipmentEffects.penalties.skills['sprint'] || 0;
  character.sprintSpeed = Math.max(1, (character.movement * 2) - sprintPenalty);
  
  // Store equipment effects for reference
  character.equipmentEffects = equipmentEffects;
};

export const extractTraitsFromModules = (character) => {
  // Define our trait categories
  const traitCategories = {
    General: [],
    Crafting: [],
    Ancestry: [],
    Offensive: [],
    Defensive: [],
    Uncategorized: []
  };
  
  // Process ancestry traits
  if (character.ancestry && character.ancestry.ancestryId && character.ancestry.selectedOptions) {
    const ancestry = character.ancestry.ancestryId;
    if (ancestry.options) {
      ancestry.options.forEach(option => {
        // Find the corresponding selected option data
        const selectedOptionData = character.ancestry.selectedOptions.find(
          so => so.name === option.name
        );
        
        // Check if this option has subchoices and a selection was made
        if (option.subchoices && selectedOptionData && selectedOptionData.selectedSubchoice) {
          // Find the selected subchoice and add it as a trait
          const selectedSubchoice = option.subchoices.find(
            sc => sc.id === selectedOptionData.selectedSubchoice
          );
          if (selectedSubchoice) {
            // Process subchoice as an ability
            processAbilityForTraits(selectedSubchoice, ancestry.name, 'ancestry-derived', traitCategories);
          }
        } else {
          // Process regular ancestry option
          processAbilityForTraits(option, ancestry.name, 'ancestry-derived', traitCategories);
        }
      });
    }
  }
  
  // Process culture traits
  if (character.characterCulture && character.characterCulture.cultureId && character.characterCulture.selectedOptions) {
    const culture = character.characterCulture.cultureId;
    if (culture.options) {
      culture.options.forEach(option => {
        processAbilityForTraits(option, culture.name, 'culture-derived', traitCategories);
      });
    }
  }
  
  // Process module traits
  if (character.modules && character.modules.length > 0) {
    character.modules.forEach(module => {
      // Skip if moduleId isn't populated
      if (!module.moduleId || typeof module.moduleId === 'string') return;
      
      // Process each selected option
      module.selectedOptions.forEach(selectedOption => {
        const option = module.moduleId.options.find(opt => opt.location === selectedOption.location);
        if (option) {
          processAbilityForTraits(option, module.moduleId.name, 'module-derived', traitCategories);
        }
      });
    });
  }
  
  return traitCategories;
};


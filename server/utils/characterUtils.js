
import { applyDataEffects } from './moduleEffects.js';

export const applyModuleBonusesToCharacter = (character) => {

  // Initialize mitigation if it doesn't exist
  if (!character.mitigation) {
    character.mitigation = {};
  }

  // Set default size if not present
  if (!character.physicalTraits) {
    character.physicalTraits = {};
  }
  if (!character.physicalTraits.size) {
    character.physicalTraits.size = 'medium';
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
    initiative: character.initiative,
    spellSlots: character.spellSlots || 10
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
    movement_walk: 0,  // Separate tracking for walk speed bonuses
    movement_swim: 0,  // Separate tracking for swim speed bonuses
    movement_climb: 0, // Separate tracking for climb speed bonuses
    movement_fly: 0,   // Separate tracking for fly speed bonuses
    initiative: 0,
    spellSlots: 0
  };
  
  // Helper function to process any ability for bonuses
  const processAbilityForBonuses = (ability) => {
    if (ability.data) {
      const { bonuses: abilityBonuses } = parseDataCodes(ability.data, character);
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
            applyDataEffects(character, selectedSubchoice.data);
          }
        } else {
          // Regular option without subchoices
          processAbilityForBonuses(option);
          applyDataEffects(character, option.data);
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

  // Apply trait bonuses if present
  if (character.traits && character.traits.length > 0) {
    character.traits.forEach(characterTrait => {
      if (characterTrait.traitId && characterTrait.traitId.options) {
        characterTrait.traitId.options.forEach(option => {
          // Find the corresponding selected option data
          const selectedOptionData = characterTrait.selectedOptions?.find(
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
              applyDataEffects(character, selectedSubchoice.data);
            }
          } else {
            // Regular option without subchoices
            processAbilityForBonuses(option);
            applyDataEffects(character, option.data);
          }
        });
      }
    });
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
        // Use centralized processing for general bonuses
        processAbilityForBonuses(option);

        // ALSO apply data effects for magic skills and other effects not handled by parseDataCodes
        applyDataEffects(character, option.data);
      }
    }
  }
  
  // Apply collected bonuses directly to character (modules/ancestry/culture first)
  applyBonusesToCharacter(character, bonuses);
  
  // Parse and apply equipment effects AFTER module bonuses
  const equipmentEffects = parseEquipmentEffects(character);
  applyEquipmentEffects(character, equipmentEffects);

  // Evaluate conditional bonuses based on equipped items
  if (character.conditionals) {
    applyEquipmentConditionals(character);
  }

  // Store the module effects for reference
  character.moduleEffects = {
    applied: true,
    bonuses: bonuses,
    originalValues: originalValues
  };

  return character;
};

// Simple function to apply conditional bonuses based on equipped armor/shields
const applyEquipmentConditionals = (character) => {
  if (!character.conditionals || !character.equipment || !character.inventory) {
    return;
  }

  // Get equipped body armor and shields
  const bodyItem = character.equipment.body ?
    character.inventory.find(item => {
      const itemId = item.itemId?._id || item.itemId || item.itemData?._id;
      const equippedId = character.equipment.body.itemId || character.equipment.body;
      return itemId && itemId.toString() === equippedId.toString();
    }) : null;

  const shieldItem = character.equipment.shield ?
    character.inventory.find(item => {
      const itemId = item.itemId?._id || item.itemId || item.itemData?._id;
      const equippedId = character.equipment.shield.itemId || character.equipment.shield;
      return itemId && itemId.toString() === equippedId.toString();
    }) : null;

  // Check body armor conditions
  const bodyData = bodyItem ? (bodyItem.itemData || bodyItem.itemId) : null;

  // Apply conditional effects based on equipment
  const applyEffects = (effects) => {
    for (const effect of effects) {
      switch (effect.type) {
        case 'skill':
          if (!character.skills[effect.subtype]) {
            character.skills[effect.subtype] = { value: 0, talent: 0, diceTierModifier: 0 };
          }
          character.skills[effect.subtype].value += effect.value;
          break;

        case 'mitigation':
          if (!character.mitigation[effect.subtype]) {
            character.mitigation[effect.subtype] = 0;
          }
          character.mitigation[effect.subtype] += effect.value;
          break;
      }
    }
  };

  // Check shield conditions
  const shieldData = shieldItem ? (shieldItem.itemData || shieldItem.itemId) : null;

  // Check each conditional and apply if condition is met
  if (!bodyData && character.conditionals.noArmor) {
    applyEffects(character.conditionals.noArmor);
  }
  if (bodyData?.armor_category === 'light' && character.conditionals.lightArmor) {
    applyEffects(character.conditionals.lightArmor);
  }
  if (bodyData?.armor_category === 'heavy' && character.conditionals.heavyArmor) {
    applyEffects(character.conditionals.heavyArmor);
  }
  if (bodyData?.armor_category && character.conditionals.anyArmor) {
    applyEffects(character.conditionals.anyArmor);
  }
  if (shieldData && character.conditionals.anyShield) {
    applyEffects(character.conditionals.anyShield);
  }
  if (shieldData?.shield_category === 'light' && character.conditionals.lightShield) {
    applyEffects(character.conditionals.lightShield);
  }
  if (shieldData?.shield_category === 'heavy' && character.conditionals.heavyShield) {
    applyEffects(character.conditionals.heavyShield);
  }
};

// Parse data string and collect bonuses
const parseDataString = (dataString, bonuses, character = null) => {
  if (!dataString) return;

  // Initialize conditionals if character provided
  if (character && !character.conditionals) {
    character.conditionals = {};
  }

  // Split by colon for multiple effects
  const effects = dataString.split(':');

  for (const effect of effects) {
    if (!effect.trim()) continue;

    // Check for conditional effects first (CC[M1=1,M7=1], CA[SSE=1], etc.)
    const conditionalMatch = effect.match(/^C([A-G])\[([^\]]+)\]$/);
    if (conditionalMatch && character) {
      const [_, conditionType, effectsString] = conditionalMatch;

      // Map condition type to readable name
      const conditionMap = {
        'A': 'noArmor',
        'B': 'lightArmor',
        'C': 'heavyArmor',
        'D': 'anyArmor',
        'E': 'anyShield',
        'F': 'lightShield',
        'G': 'heavyShield'
      };

      const conditionName = conditionMap[conditionType];
      if (conditionName) {
        // Parse effects inside brackets
        const effects = effectsString.split(',').map(e => e.trim());
        const parsedEffects = [];

        for (const effectStr of effects) {
          // Parse mitigation effects (M1=2, M7=1, etc.)
          const mitigationMatch = effectStr.match(/^M([1-9A])=(\d+)$/);
          if (mitigationMatch) {
            const mitigationMap = {
              '1': 'physical', '2': 'heat', '3': 'cold', '4': 'electric',
              '5': 'dark', '6': 'divine', '7': 'aetheric', '8': 'psychic', '9': 'toxic', 'A': 'true'
            };
            parsedEffects.push({
              type: 'mitigation',
              subtype: mitigationMap[mitigationMatch[1]],
              value: parseInt(mitigationMatch[2])
            });
          }

          // Parse skill effects (SSB=1, SSE=1, etc.)
          const skillMatch = effectStr.match(/^SS([A-T])=(\d+)$/);
          if (skillMatch) {
            const skillMap = {
              'A': 'fitness', 'B': 'deflection', 'C': 'might', 'D': 'endurance',
              'E': 'evasion', 'F': 'stealth', 'G': 'coordination', 'H': 'thievery',
              'I': 'resilience', 'J': 'concentration', 'K': 'senses', 'L': 'logic',
              'M': 'wildcraft', 'N': 'academics', 'O': 'magic', 'P': 'medicine',
              'Q': 'expression', 'R': 'presence', 'S': 'insight', 'T': 'persuasion'
            };
            const skillName = skillMap[skillMatch[1]];
            if (skillName) {
              parsedEffects.push({
                type: 'skill',
                subtype: skillName,
                value: parseInt(skillMatch[2])
              });
            }
          }
        }

        // Store conditional effects
        if (parsedEffects.length > 0) {
          if (!character.conditionals[conditionName]) {
            character.conditionals[conditionName] = [];
          }
          character.conditionals[conditionName].push(...parsedEffects);
        }
      }
      continue;
    }

    // SIZE (B) - matching B1 through B6 for size changes
    const sizeMatch = effect.match(/^B([1-6])$/);
    if (sizeMatch) {
      const sizeValue = parseInt(sizeMatch[1]);
      const sizeMap = {
        1: 'tiny',
        2: 'small',
        3: 'medium',
        4: 'large',
        5: 'huge',
        6: 'gargantuan'
      };
      bonuses.size = sizeMap[sizeValue] || 'medium';
      continue;
    }

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
        '1': 'brawling',
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

    // MAGIC (Y) - matching YS1=1 or YT3=1 pattern
    const magicMatch = effect.match(/^Y([ST])([1-5])=(-?\d+)$/);
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
        '7': 'aetheric',
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

    // AUTO stats (A) - matching A1=1 pattern (supports A1-A9)
    const autoMatch = effect.match(/^A([1-9])=(-?\d+)$/);
    if (autoMatch) {
      const [_, code, valueStr] = autoMatch;
      const value = parseInt(valueStr);

      const autoMappings = {
        '1': 'health',
        '2': 'resolve',
        '3': 'energy',
        '8': 'morale',
        '9': 'spellSlots'
      };

      const statType = autoMappings[code];
      if (statType) {
        bonuses[statType] = (bonuses[statType] || 0) + value;
      }
      continue;
    }

    // MOVEMENT (K) - matching K1=2, K2=3, K3=1, K4=6 pattern
    const movementMatch = effect.match(/^K([1-4])=(-?\d+)$/);
    if (movementMatch) {
      const [_, code, valueStr] = movementMatch;
      const value = parseInt(valueStr);

      const movementMappings = {
        '1': 'movement_walk',
        '2': 'movement_swim',
        '3': 'movement_climb',
        '4': 'movement_fly'
      };

      const movementType = movementMappings[code];
      if (movementType) {
        bonuses[movementType] = (bonuses[movementType] || 0) + value;
      }
      continue;
    }
  }
};

// Apply collected bonuses to character
// Helper: Apply bonuses to simple numeric attributes (e.g., attributes, mitigation)
const applySimpleNumericBonuses = (target, bonuses, options = {}) => {
  const { initializeIfMissing = false } = options;

  if (!bonuses) return;

  for (const [key, value] of Object.entries(bonuses)) {
    if (target[key] !== undefined) {
      target[key] += value;
    } else if (initializeIfMissing) {
      target[key] = value;
    }
  }
};

// Helper: Apply bonuses to skill categories (weapon/magic/crafting skills with value/talent/diceTierModifier)
const applySkillCategoryBonuses = (characterSkills, bonuses, fields = ['value', 'talent', 'diceTierModifier']) => {
  if (!bonuses) return;

  for (const [skillName, bonusData] of Object.entries(bonuses)) {
    if (!characterSkills[skillName]) continue;

    for (const field of fields) {
      if (bonusData[field] !== undefined) {
        if (field === 'diceTierModifier' && !characterSkills[skillName].diceTierModifier) {
          characterSkills[skillName].diceTierModifier = 0;
        }
        characterSkills[skillName][field] += bonusData[field];
      }
    }
  }
};

// Helper: Apply bonuses to simple skill values (just adding to .value property)
const applySimpleSkillBonuses = (characterSkills, bonuses) => {
  if (!bonuses) return;

  for (const [skillName, value] of Object.entries(bonuses)) {
    if (characterSkills[skillName]) {
      characterSkills[skillName].value += value;
    }
  }
};

// Helper: Add unique items to array (for immunities, vision, etc.)
const addUniqueToArray = (targetArray, items) => {
  if (!items) return;

  for (const item of items) {
    if (!targetArray.includes(item)) {
      targetArray.push(item);
    }
  }
};

const applyBonusesToCharacter = (character, bonuses) => {
  // Apply size if present
  if (bonuses.size) {
    if (!character.physicalTraits) {
      character.physicalTraits = {};
    }
    character.physicalTraits.size = bonuses.size;
  }

  // Apply simple skill bonuses (skills.value)
  applySimpleSkillBonuses(character.skills, bonuses.skills);

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

  // Apply attribute talents
  if (character.attributes) {
    applySimpleNumericBonuses(character.attributes, bonuses.attributeTalents);
  }

  // Apply skill category bonuses (crafting, weapon, magic skills)
  applySkillCategoryBonuses(character.craftingSkills, bonuses.craftingSkills);
  applySkillCategoryBonuses(character.weaponSkills, bonuses.weaponSkills);
  applySkillCategoryBonuses(character.magicSkills, bonuses.magicSkills, ['value', 'talent']); // magic skills don't have diceTierModifier

  // Apply mitigation bonuses
  if (!character.mitigation) character.mitigation = {};
  applySimpleNumericBonuses(character.mitigation, bonuses.mitigation, { initializeIfMissing: true });

  // Apply resource bonuses
  if (bonuses.health) {
    character.resources.health.max += bonuses.health;
  }

  if (bonuses.resolve) {
    character.resources.resolve.max += bonuses.resolve;
  }

  if (bonuses.energy) {
    character.resources.energy.max += bonuses.energy;
  }

  if (bonuses.morale) {
    character.resources.morale.max += bonuses.morale;
  }

  // Apply walk speed bonus (K1) - this is the only way to boost base movement now
  if (bonuses.movement_walk) {
    character.movement += bonuses.movement_walk;
  }

  // Store separate movement bonuses for later use in swimming/climbing/flying calculations
  character.movement_bonuses = {
    swim: bonuses.movement_swim || 0,
    climb: bonuses.movement_climb || 0,
    fly: bonuses.movement_fly || 0
  };

  // Apply initiative and spell slot bonuses
  if (bonuses.initiative) {
    character.initiative += bonuses.initiative;
  }

  if (bonuses.spellSlots) {
    character.spellSlots = (character.spellSlots || 10) + bonuses.spellSlots;
  }

  // Apply immunities and vision types
  if (!character.immunities) character.immunities = [];
  addUniqueToArray(character.immunities, bonuses.immunities);

  if (!character.vision) character.vision = [];
  addUniqueToArray(character.vision, bonuses.vision);
};

// Centralized data parsing function that extracts both bonuses and trait information
export const parseDataCodes = (dataString, character = null) => {
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
  parseDataString(dataString, bonuses, character);

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
    encumbrance_penalty: 0,
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
    if (item && item.bonus_attack) {
      equipmentEffects.bonuses.bonusAttack += item.bonus_attack;
    }

    // Resource bonuses
    if (item && item.health && item.health.max !== undefined) {
      equipmentEffects.bonuses.health.max += item.health.max || 0;
      equipmentEffects.bonuses.health.recovery += item.health.recovery || 0;
    }
    if (item && item.energy && item.energy.max !== undefined) {
      equipmentEffects.bonuses.energy.max += item.energy.max || 0;
      equipmentEffects.bonuses.energy.recovery += item.energy.recovery || 0;
    }
    if (item && item.resolve && item.resolve.max !== undefined) {
      equipmentEffects.bonuses.resolve.max += item.resolve.max || 0;
      equipmentEffects.bonuses.resolve.recovery += item.resolve.recovery || 0;
    }

    // Movement bonus
    if (item && item.movement) {
      equipmentEffects.bonuses.movement += item.movement;
    }

    // Attribute bonuses
    if (item && item.attributes) {
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
    if (item && item.basic) {
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
    if (item && item.weapon) {
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
    if (item && item.magic) {
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
    if (item && item.craft) {
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
    if (item && item.mitigation) {
      Object.entries(item.mitigation).forEach(([damageType, value]) => {
        if (!equipmentEffects.bonuses.mitigation[damageType]) {
          equipmentEffects.bonuses.mitigation[damageType] = 0;
        }
        equipmentEffects.bonuses.mitigation[damageType] += value;
      });
    }

    // Detection bonuses
    if (item && item.detections) {
      Object.entries(item.detections).forEach(([detectionType, value]) => {
        if (!equipmentEffects.bonuses.detections[detectionType]) {
          equipmentEffects.bonuses.detections[detectionType] = 0;
        }
        equipmentEffects.bonuses.detections[detectionType] += value;
      });
    }

    // Immunities
    if (item && item.immunities) {
      Object.entries(item.immunities).forEach(([immunityType, hasImmunity]) => {
        if (hasImmunity && !equipmentEffects.bonuses.immunities.includes(immunityType)) {
          equipmentEffects.bonuses.immunities.push(immunityType);
        }
      });
    }

    // Add up encumbrance penalty
    if (item && item.encumbrance_penalty && item.encumbrance_penalty > 0) {
      equipmentEffects.encumbrance_penalty += item.encumbrance_penalty;
    }
  });

  // Process new weapon slots (main_hand, off_hand, extra_weapons)
  const weaponSlots = [];

  // Add main_hand and off_hand if they exist
  if (character.main_hand) {
    weaponSlots.push({ slot: character.main_hand, name: 'main_hand' });
  }
  if (character.off_hand) {
    weaponSlots.push({ slot: character.off_hand, name: 'off_hand' });
  }

  // Add extra_weapons if they exist
  if (character.extra_weapons && Array.isArray(character.extra_weapons)) {
    character.extra_weapons.forEach((weaponSlot, index) => {
      if (weaponSlot) {
        weaponSlots.push({ slot: weaponSlot, name: `extra_weapons[${index}]` });
      }
    });
  }

  weaponSlots.forEach(({ slot, name }) => {
    if (!slot || !slot.itemId) {
      return;
    }

    const item = getItemFromInventory(slot.itemId);
    if (!item) {
      return;
    }

    // Additional safety check to ensure item is still defined
    if (!item) {
      return;
    }

    equipmentEffects.appliedItems.push({
      name: item.name,
      slot: name,
      type: item.type
    });

    // Apply the same item effects as regular equipment
    // This is the same logic from the equipment processing above

    // Weapon bonuses
    if (item && item.bonus_attack) {
      equipmentEffects.bonuses.bonusAttack += item.bonus_attack;
    }

    // Resource bonuses - add extra safety check for item
    if (item && item.health && item.health.max !== undefined) {
      equipmentEffects.bonuses.health.max += item.health.max || 0;
      equipmentEffects.bonuses.health.recovery += item.health.recovery || 0;
    }
    if (item && item.energy && item.energy.max !== undefined) {
      equipmentEffects.bonuses.energy.max += item.energy.max || 0;
      equipmentEffects.bonuses.energy.recovery += item.energy.recovery || 0;
    }
    if (item && item.resolve && item.resolve.max !== undefined) {
      equipmentEffects.bonuses.resolve.max += item.resolve.max || 0;
      equipmentEffects.bonuses.resolve.recovery += item.resolve.recovery || 0;
    }

    // Movement bonus
    if (item && item.movement) {
      equipmentEffects.bonuses.movement += item.movement;
    }

    // Attribute bonuses
    if (item && item.attributes) {
      Object.entries(item.attributes).forEach(([attr, bonusData]) => {
        if (!equipmentEffects.bonuses.attributes[attr]) {
          equipmentEffects.bonuses.attributes[attr] = 0;
        }
        if (bonusData.add_talent) {
          equipmentEffects.bonuses.attributes[attr] += bonusData.add_talent;
        }
        if (bonusData.set_talent !== undefined) {
          equipmentEffects.bonuses.attributes[attr] = bonusData.set_talent;
        }
      });
    }

    // Skill bonuses (basic, craft, magic, weapon)
    ['basic', 'craft', 'magic', 'weapon'].forEach(skillCategory => {
      if (item[skillCategory]) {
        Object.entries(item[skillCategory]).forEach(([skill, bonusData]) => {
          if (!equipmentEffects.bonuses.skills[skill]) {
            equipmentEffects.bonuses.skills[skill] = { value: 0, talent: 0 };
          }
          if (bonusData.add_bonus) {
            equipmentEffects.bonuses.skills[skill].value += bonusData.add_bonus;
          }
          if (bonusData.set_bonus !== undefined) {
            equipmentEffects.bonuses.skills[skill].value = bonusData.set_bonus;
          }
          if (bonusData.add_talent) {
            equipmentEffects.bonuses.skills[skill].talent += bonusData.add_talent;
          }
          if (bonusData.set_talent !== undefined) {
            equipmentEffects.bonuses.skills[skill].talent = bonusData.set_talent;
          }
        });
      }
    });

    // Mitigation bonuses
    if (item && item.mitigation) {
      Object.entries(item.mitigation).forEach(([damageType, value]) => {
        if (!equipmentEffects.bonuses.mitigation[damageType]) {
          equipmentEffects.bonuses.mitigation[damageType] = 0;
        }
        equipmentEffects.bonuses.mitigation[damageType] += value;
      });
    }

    // Detection bonuses
    if (item && item.detections) {
      Object.entries(item.detections).forEach(([detectionType, value]) => {
        if (!equipmentEffects.bonuses.detections[detectionType]) {
          equipmentEffects.bonuses.detections[detectionType] = 0;
        }
        equipmentEffects.bonuses.detections[detectionType] += value;
      });
    }

    // Immunities
    if (item && item.immunities) {
      Object.entries(item.immunities).forEach(([immunityType, hasImmunity]) => {
        if (hasImmunity && !equipmentEffects.bonuses.immunities.includes(immunityType)) {
          equipmentEffects.bonuses.immunities.push(immunityType);
        }
      });
    }

    // Add up encumbrance penalty
    if (item && item.encumbrance_penalty && item.encumbrance_penalty > 0) {
      equipmentEffects.encumbrance_penalty += item.encumbrance_penalty;
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

  // Apply encumbrance penalty and calculate checks
  // Encumbrance penalty is the sum of equipment penalties
  character.encumbrance_penalty = equipmentEffects.encumbrance_penalty;

  // Standard check equals the penalty (no +1)
  character.encumbrance_check = character.encumbrance_penalty;

  // Sprint check is penalty * 2 (or 0 if no penalty)
  character.sprint_check = character.encumbrance_penalty > 0 ? character.encumbrance_penalty * 2 : 0;

  // Calculate swimming and climbing speeds (movement / 2, rounded down, then add bonuses)
  const baseSwimSpeed = Math.floor(character.movement / 2);
  const baseClimbSpeed = Math.floor(character.movement / 2);

  character.swim_speed = baseSwimSpeed + (character.movement_bonuses?.swim || 0);
  character.climb_speed = baseClimbSpeed + (character.movement_bonuses?.climb || 0);
  character.fly_speed = character.movement_bonuses?.fly || 0;

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

  // Process character traits
  if (character.traits && character.traits.length > 0) {
    character.traits.forEach(characterTrait => {
      if (characterTrait.traitId && characterTrait.traitId.options) {
        characterTrait.traitId.options.forEach(option => {
          // Find the corresponding selected option data
          const selectedOptionData = characterTrait.selectedOptions?.find(
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
              processAbilityForTraits(selectedSubchoice, characterTrait.traitId.name, 'trait-derived', traitCategories);
            }
          } else {
            // Process regular trait option
            processAbilityForTraits(option, characterTrait.traitId.name, 'trait-derived', traitCategories);
          }
        });
      }
    });
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


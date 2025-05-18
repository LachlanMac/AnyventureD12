
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
  
  // Initialize the moduleBonuses object
  character.moduleBonuses = {
    skills: {},
    craftingSkills: {},
    weaponSkills: {},
    magicSkills: {},
    mitigation: {},
    immunities: [],
    vision: [],
    health: 0,
    movement: 0,
    initiative: 0,
    traitCategories: {
      general: [],
      crafting: [],
      ancestry: []
    }
  };
  
  // Skip if modules aren't populated
  if (!character.modules || character.modules.length === 0) {
    character.moduleEffects = { applied: false, bonuses: {} };
    return character;
  }
  
  // Process each module
  for (const moduleItem of character.modules) {
    // Skip if moduleId isn't valid
    if (!moduleItem.moduleId) {
      console.log("Skipping module with null moduleId:", moduleItem);
      continue;
    }
    
    // Get the moduleData
    const moduleData = moduleItem.moduleId;
    if (!moduleData || typeof moduleData !== 'object') {
      console.log("Skipping module without proper data:", moduleItem);
      continue;
    }
    
    // Get selected options
    const selectedOptions = moduleItem.selectedOptions || [];
    
    // Skip if no options are selected
    if (selectedOptions.length === 0) {
      continue;
    }
    
    // Process each selected option
    for (const selected of selectedOptions) {
      // Find the option in the module
      const option = moduleData.options.find(opt => opt.location === selected.location);
      
      if (option && option.data) {
        // Use the moduleEffects utility to apply data effects
        applyDataEffects(character, option.data);
      }
    }
  }
  
  // Store the module effects for reference
  character.moduleEffects = {
    applied: true,
    bonuses: character.moduleBonuses,
    originalValues: originalValues
  };
  
  return character;
};
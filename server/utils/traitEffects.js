// server/utils/traitEffects.js

/**
 * Apply trait effects to a character
 * @param {Object} character - The character to apply effects to
 * @param {Object} trait - The trait containing effects
 */
export const applyTraitEffects = async (character, trait) => {
    if (!trait) return;
    
    // Initialize trait effects if needed
    if (!character.moduleBonuses) character.moduleBonuses = {};
    if (!character.moduleBonuses.traitEffects) character.moduleBonuses.traitEffects = [];
    
    // Add trait to effects list
    character.moduleBonuses.traitEffects.push({
      name: trait.name,
      type: trait.type,
      description: trait.description
    });
    
    // If the trait has explicit effect codes, we could process them here
    if (trait.effects && trait.effects.length > 0) {
      for (const effect of trait.effects) {
        // Apply specific effect code logic here
        // This would be similar to moduleEffects.js
        // For example:
        // if (effect.startsWith('AV=')) {
        //   const value = parseInt(effect.substring(3));
        //   character.movement += value;
        // }
      }
    }
    
    // Apply effects based on trait name
    // This is a simple approach - for a more robust system,
    // you'd want to use a more structured approach with effect codes
    switch (trait.name) {
      case "Tech Savvy":
        // Apply technology-related bonuses
        if (!character.moduleBonuses.skills) character.moduleBonuses.skills = {};
        if (!character.moduleBonuses.skills.technology) character.moduleBonuses.skills.technology = 0;
        character.moduleBonuses.skills.technology += 1;
        break;
        
      case "Quick Reflexes":
        // Apply initiative bonus
        if (!character.moduleBonuses.initiative) character.moduleBonuses.initiative = 0;
        character.moduleBonuses.initiative += 2;
        character.initiative += 2;
        break;
        
      case "Fearless":
        // Add immunity to fear effects
        if (!character.moduleBonuses.immunities) character.moduleBonuses.immunities = [];
        if (!character.moduleBonuses.immunities.includes('afraid')) {
          character.moduleBonuses.immunities.push('afraid');
        }
        
        // Update character's immunities if they exist
        if (character.immunities && !character.immunities.includes('afraid')) {
          character.immunities.push('afraid');
        }
        break;
        
      // Add more trait-specific effects as needed
    }
  };
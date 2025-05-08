// server/utils/moduleEffects.js
/**
 * Apply module data effects to a character
 * @param {Object} character - The character to apply effects to
 * @param {String} dataString - The data string containing effect codes
 */
export const applyDataEffects = (character, dataString) => {
    if (!dataString) return;
    
    // Initialize module bonuses object if not exists
    if (!character.moduleBonuses) character.moduleBonuses = {};
    
    // Split the data string by colon for multiple effects
    const effects = dataString.split(':');
    
    for (const effect of effects) {
      // Special case for Trait - these don't follow the standard pattern
      if (effect.startsWith('T')) {
        applyTraitEffect(character, effect);
        continue;
      }
      
      // Special case for Immunity - these don't follow the standard pattern
      if (effect.startsWith('I')) {
        applyImmunityEffect(character, effect);
        continue;
      }
      
      // Special case for Language - these contain a string
      if (effect.startsWith('L=')) {
        const languageName = effect.substring(2).replace(/"/g, '');
        if (!character.languages.includes(languageName)) {
          character.languages.push(languageName);
        }
        continue;
      }
      
      // Special case for actions/reactions/free actions
      if (effect.startsWith('X') || effect.startsWith('Z') || effect.startsWith('Y')) {
        applyActionEffect(character, effect);
        continue;
      }
      
      // Handle When clauses
      if (effect.startsWith('W')) {
        // For now, store these as conditional effects that will be checked when relevant
        if (!character.moduleBonuses.conditionalEffects) {
          character.moduleBonuses.conditionalEffects = [];
        }
        character.moduleBonuses.conditionalEffects.push(effect);
        continue;
      }
      
      // Parse standard effect code (e.g., "AS3=1")
      const match = effect.match(/([A-Z]+)([0-9A-Z]*)=([+-]?[0-9]+)/);
      if (!match) continue;
      
      const [_, code, subcode, valueStr] = match;
      const value = parseInt(valueStr);
      
      // Apply effect based on code
      switch(code) {
        // Auto section
        case 'AV': // Movement speed
          if (!character.moduleBonuses.movement) character.moduleBonuses.movement = 0;
          character.moduleBonuses.movement += value;
          character.movement += value; // Apply directly to character movement
          break;
          
        case 'AH': // Health
          if (!character.moduleBonuses.health) character.moduleBonuses.health = 0;
          character.moduleBonuses.health += value;
          character.resources.health.max += value; // Apply directly to max health
          character.resources.health.current += value; // Also increase current health
          break;
          
        case 'AD': // Defense/Mitigation
          const mitigationType = mapMitigationType(subcode);
          if (mitigationType) {
            if (!character.moduleBonuses.mitigation) character.moduleBonuses.mitigation = {};
            if (!character.moduleBonuses.mitigation[mitigationType]) {
              character.moduleBonuses.mitigation[mitigationType] = 0;
            }
            character.moduleBonuses.mitigation[mitigationType] += value;
            
            // Also update character's mitigation if it exists
            if (character.mitigation && character.mitigation[mitigationType] !== undefined) {
              character.mitigation[mitigationType] += value;
            }
          }
          break;
          
        case 'AZ': // Weapon skill
          const weaponSkill = mapWeaponSkill(subcode);
          if (weaponSkill) {
            if (!character.moduleBonuses.weaponSkills) character.moduleBonuses.weaponSkills = {};
            if (!character.moduleBonuses.weaponSkills[weaponSkill]) {
              character.moduleBonuses.weaponSkills[weaponSkill] = 0;
            }
            character.moduleBonuses.weaponSkills[weaponSkill] += value;
            
            // Update character's weapon skills if they exist
            if (character.weaponSkills && character.weaponSkills[weaponSkill] !== undefined) {
              character.weaponSkills[weaponSkill] += value;
            }
          }
          break;
          
        case 'AS': // Skill bonus
          const skill = mapSkill(subcode);
          if (skill && character.skills[skill]) {
            if (!character.moduleBonuses.skills) character.moduleBonuses.skills = {};
            if (!character.moduleBonuses.skills[skill]) character.moduleBonuses.skills[skill] = 0;
            character.moduleBonuses.skills[skill] += value;
            
            // Apply bonus to the skill
            character.skills[skill].value += value;
          }
          break;
          
        case 'AC': // Crafting skill
          const craftSkill = mapCraftSkill(subcode);
          if (craftSkill && character.craftingSkills[craftSkill]) {
            if (!character.moduleBonuses.craftingSkills) character.moduleBonuses.craftingSkills = {};
            if (!character.moduleBonuses.craftingSkills[craftSkill]) {
              character.moduleBonuses.craftingSkills[craftSkill] = 0;
            }
            character.moduleBonuses.craftingSkills[craftSkill] += value;
            
            // Apply bonus to the crafting skill
            character.craftingSkills[craftSkill].value += value;
          }
          break;
          
        // Vision section
        case 'VD': // Vision
          const visionType = mapVisionType(subcode);
          if (visionType) {
            if (!character.moduleBonuses.vision) character.moduleBonuses.vision = [];
            if (!character.moduleBonuses.vision.includes(visionType)) {
              character.moduleBonuses.vision.push(visionType);
            }
            
            // Update character's vision if it exists
            if (character.vision && !character.vision.includes(visionType)) {
              character.vision.push(visionType);
            }
          }
          break;
      }
    }
  };
  
  /**
   * Apply trait effects to a character
   * @param {Object} character - The character to apply effects to
   * @param {String} effect - The trait effect code
   */
  const applyTraitEffect = (character, effect) => {
    // Initialize traits array if it doesn't exist
    if (!character.moduleBonuses.traits) character.moduleBonuses.traits = [];
    
    // Add the trait to the list
    if (!character.moduleBonuses.traits.includes(effect)) {
      character.moduleBonuses.traits.push(effect);
    }
    
    // For now, we're just storing the trait codes.
    // In a more sophisticated system, you'd parse these and apply specific effects.
  };
  
  /**
   * Apply immunity effects to a character
   * @param {Object} character - The character to apply effects to
   * @param {String} effect - The immunity effect code
   */
  const applyImmunityEffect = (character, effect) => {
    // Parse immunity code
    const match = effect.match(/I([0-9]+)/);
    if (!match) return;
    
    const immunityCode = match[1];
    const immunityType = mapImmunityType(immunityCode);
    
    if (!immunityType) return;
    
    // Initialize immunities array if it doesn't exist
    if (!character.moduleBonuses.immunities) character.moduleBonuses.immunities = [];
    
    // Add the immunity to the list
    if (!character.moduleBonuses.immunities.includes(immunityType)) {
      character.moduleBonuses.immunities.push(immunityType);
    }
    
    // Update character's immunities if they exist
    if (character.immunities && !character.immunities.includes(immunityType)) {
      character.immunities.push(immunityType);
    }
  };
  
  /**
   * Apply action/reaction/free action effects to a character
   * @param {Object} character - The character to apply effects to
   * @param {String} effect - The action effect code
   */
  const applyActionEffect = (character, effect) => {
    // This would be handled by the option name parser in the character model
    // The effect here is just storing information about the action's usage
    if (!character.moduleBonuses.actionUsage) character.moduleBonuses.actionUsage = {};
    
    character.moduleBonuses.actionUsage[effect] = {
      type: effect[0] === 'X' ? 'action' : effect[0] === 'Z' ? 'reaction' : 'freeAction',
      daily: effect[1] === 'D',
      uses: effect[2] ? parseInt(effect[2]) : 1
    };
  };
  
  /**
   * Map mitigation type code to actual mitigation type
   * @param {String} code - The mitigation type code
   * @returns {String|null} - The mapped mitigation type or null if not found
   */
  const mapMitigationType = (code) => {
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
    
    return mitigationMap[code] || null;
  };
  
  /**
   * Map weapon skill code to actual weapon skill
   * @param {String} code - The weapon skill code
   * @returns {String|null} - The mapped weapon skill or null if not found
   */
  const mapWeaponSkill = (code) => {
    const weaponSkillMap = {
      '1': 'attackWithUnarmed',
      '2': 'attackWithMeleeWeapons',
      '3': 'attackWithRangedWeapons',
      '4': 'attackWithHeavyRangedWeapons',
      '5': 'attackWithWeaponSystems',
      '6': 'attackWithPlasmaBlade',
      '7': 'damageWithUnarmed',
      '8': 'damageWithMeleeWeapons',
      '9': 'damageWithRangedWeapons',
      'A': 'damageWithHeavyRangedWeapons',
      'B': 'damageWithWeaponSystems',
      'C': 'damageWithPlasmaBlade',
      'D': 'critsWithUnarmed',
      'E': 'critsWithMeleeWeapons',
      'F': 'critsWithRangedWeapons',
      'G': 'critsWithHeavyRangedWeapons',
      'H': 'critsWithWeaponSystems',
      'I': 'critsWithPlasmaBlade',
      'J': 'brutalCritsWithUnarmed',
      'K': 'brutalCritsWithMeleeWeapons',
      'L': 'brutalCritsWithRangedWeapons',
      'M': 'brutalCritsWithHeavyRangedWeapons',
      'N': 'brutalCritsWithWeaponSystems',
      'O': 'brutalCritsWithPlasmaBlade',
      'P': 'upgradedUnarmed',
      'Q': 'upgradedMeleeWeapons',
      'R': 'upgradedRangedWeapons',
      'S': 'upgradedHeavyRangedWeapons',
      'T': 'upgradedWeaponSystems',
      'U': 'upgradedPlasmaBlade'
    };
    
    return weaponSkillMap[code] || null;
  };
  
  /**
   * Map skill code to actual skill name
   * @param {String} code - The skill code
   * @returns {String|null} - The mapped skill name or null if not found
   */
  const mapSkill = (code) => {
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
      'G': 'presence'
    };
    
    return skillMap[code] || null;
  };
  
  /**
   * Map craft skill code to actual craft skill name
   * @param {String} code - The craft skill code
   * @returns {String|null} - The mapped craft skill name or null if not found
   */
  const mapCraftSkill = (code) => {
    const craftSkillMap = {
      '1': 'engineering',
      '2': 'fabrication',
      '3': 'biosculpting',
      '4': 'synthesis'
    };
    
    return craftSkillMap[code] || null;
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
// src/constants/skillConstants.ts
// Central location for all skill-related constants

// Attribute skill mappings
export const ATTRIBUTE_SKILLS = {
    physique: [
      { id: 'fitness', name: 'Fitness' },
      { id: 'deflection', name: 'Deflection' },
      { id: 'might', name: 'Might' },
      { id: 'endurance', name: 'Endurance' },
    ],
    finesse: [
      { id: 'evasion', name: 'Evasion' },
      { id: 'stealth', name: 'Stealth' },
      { id: 'coordination', name: 'Coordination' },
      { id: 'thievery', name: 'Thievery' },
    ],
    mind: [
      { id: 'resilience', name: 'Resilience' },
      { id: 'concentration', name: 'Concentration' },
      { id: 'senses', name: 'Senses' },
      { id: 'logic', name: 'Logic' },
    ],
    knowledge: [
      { id: 'wildcraft', name: 'Wildcraft' },
      { id: 'academics', name: 'Academics' },
      { id: 'magic', name: 'Magic' },
      { id: 'medicine', name: 'Medicine' },
    ],
    social: [
      { id: 'expression', name: 'Expression' },
      { id: 'presence', name: 'Presence' },
      { id: 'insight', name: 'Insight' },
      { id: 'persuasion', name: 'Persuasion' },
    ],
  };
  
  // Weapon skills
  export const SPECIALIZED_SKILLS = [
    { id: 'unarmed', name: 'Unarmed', defaultTalent: 0 },
    { id: 'throwing', name: 'Throwing', defaultTalent: 0 },
    { id: 'rangedWeapons', name: 'Ranged Weapons', defaultTalent: 1 },
    { id: 'simpleMeleeWeapons', name: 'Simple Melee Weapons', defaultTalent: 1 },
    { id: 'complexMeleeWeapons', name: 'Complex Melee Weapons', defaultTalent: 0 },
  ];
  

  export const MAGIC_SKILLS = [
    { id: 'black', name: 'Black', defaultTalent: 0 },         
    { id: 'primal', name: 'Primal', defaultTalent: 0 },       
    { id: 'alteration', name: 'Alteration', defaultTalent: 0 }, 
    { id: 'divine', name: 'Divine', defaultTalent: 0 },       
    { id: 'mystic', name: 'Mystic', defaultTalent: 0 },       
  ];
  
  // Crafting skills
  export const CRAFTING_SKILLS = [
    { id: 'engineering', name: 'Engineering', defaultTalent: 0 },
    { id: 'fabrication', name: 'Fabrication', defaultTalent: 0 },
    { id: 'alchemy', name: 'Alchemy', defaultTalent: 0 },
    { id: 'cooking', name: 'Cooking', defaultTalent: 0 },
    { id: 'glyphcraft', name: 'Glyphcraft', defaultTalent: 0 },
  ];
  
  // Dice type mapping
  export const DICE_TYPES = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];
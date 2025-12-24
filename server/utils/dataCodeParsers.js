// Data Code Parsing Registry - Cleaner, more maintainable data key parsing

// ============================================================================
// CODE MAPPINGS
// ============================================================================

const SKILL_MAPPINGS = {
  'A': 'fitness', 'B': 'deflection', 'C': 'might', 'D': 'endurance',
  'E': 'evasion', 'F': 'stealth', 'G': 'coordination', 'H': 'thievery',
  'I': 'resilience', 'J': 'concentration', 'K': 'senses', 'L': 'logic',
  'M': 'wildcraft', 'N': 'academics', 'O': 'magic', 'P': 'medicine',
  'Q': 'expression', 'R': 'presence', 'S': 'insight', 'T': 'persuasion'
};

const ATTRIBUTE_MAPPINGS = {
  '1': 'physique',
  '2': 'finesse',
  '3': 'mind',
  '4': 'knowledge',
  '5': 'social'
};

const WEAPON_MAPPINGS = {
  '1': 'brawling',
  '2': 'throwing',
  '3': 'simpleMeleeWeapons',
  '4': 'simpleRangedWeapons',
  '5': 'complexMeleeWeapons',
  '6': 'complexRangedWeapons'
};

const MAGIC_MAPPINGS = {
  '1': 'black',
  '2': 'primal',
  '3': 'meta',
  '4': 'white',
  '5': 'mystic',
  '6': 'arcane'
};

const CRAFTING_MAPPINGS = {
  '1': 'engineering',
  '2': 'fabrication',
  '3': 'alchemy',
  '4': 'cooking',
  '5': 'glyphcraft',
  '6': 'biosculpting'
};

const MITIGATION_MAPPINGS = {
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

const AUTO_STAT_MAPPINGS = {
  '1': 'health',
  '2': 'resolve',
  '3': 'energy',
  '8': 'morale',
  '9': 'spellSlots'
};

const MOVEMENT_MAPPINGS = {
  '1': 'movement_walk',
  '2': 'movement_swim',
  '3': 'movement_climb',
  '4': 'movement_fly'
};

const SIZE_MAPPINGS = {
  1: 'tiny',
  2: 'small',
  3: 'medium',
  4: 'large',
  5: 'huge',
  6: 'gargantuan'
};

const CONDITION_MAPPINGS = {
  'A': 'noArmor',
  'B': 'lightArmor',
  'C': 'heavyArmor',
  'D': 'anyArmor',
  'E': 'anyShield',
  'F': 'lightShield',
  'G': 'heavyShield'
};

// ============================================================================
// PARSER REGISTRY
// ============================================================================

const PARSERS = [
  {
    name: 'Size',
    pattern: /^B([1-6])$/,
    parse: (match, bonuses) => {
      bonuses.size = SIZE_MAPPINGS[parseInt(match[1])] || 'medium';
    }
  },
  {
    name: 'Skills',
    pattern: /^S([STB])([A-T0-9])=(-?\d+|[XY])$/,
    parse: (match, bonuses) => {
      const [_, type, code, valueStr] = match;
      const value = isNaN(parseInt(valueStr)) ? valueStr : parseInt(valueStr);

      if (type === 'S') {
        // Attribute skill (SS1=1) or regular skill (SSA=1)
        if (/^[1-5]$/.test(code)) {
          const attrName = ATTRIBUTE_MAPPINGS[code];
          if (attrName) {
            if (!bonuses.attributes) bonuses.attributes = {};
            bonuses.attributes[attrName] = (bonuses.attributes[attrName] || 0) + value;
          }
        } else {
          const skillName = SKILL_MAPPINGS[code];
          if (skillName) {
            if (value === 'X' || value === 'Y') {
              if (!bonuses.skillDiceTierModifiers) bonuses.skillDiceTierModifiers = {};
              bonuses.skillDiceTierModifiers[skillName] = (bonuses.skillDiceTierModifiers[skillName] || 0) + (value === 'X' ? 1 : -1);
            } else {
              if (!bonuses.skills) bonuses.skills = {};
              bonuses.skills[skillName] = (bonuses.skills[skillName] || 0) + value;
            }
          }
        }
      } else if (type === 'T') {
        // Attribute talent (ST1=1)
        if (/^[1-5]$/.test(code)) {
          const attrName = ATTRIBUTE_MAPPINGS[code];
          if (attrName) {
            if (!bonuses.attributeTalents) bonuses.attributeTalents = {};
            bonuses.attributeTalents[attrName] = (bonuses.attributeTalents[attrName] || 0) + value;
          }
        }
      } else if (type === 'B') {
        // Bonus/Penalty dice for skills (SBA=1, SBR=-1)
        const skillName = SKILL_MAPPINGS[code];
        if (skillName) {
          if (!bonuses.skillBonusDice) bonuses.skillBonusDice = {};
          bonuses.skillBonusDice[skillName] = (bonuses.skillBonusDice[skillName] || 0) + value;
        }
      }
    }
  },
  {
    name: 'Weapons',
    pattern: /^W([STB])([1-6])=(-?\d+|[XY])$/,
    parse: (match, bonuses) => {
      const [_, type, code, valueStr] = match;
      const value = isNaN(parseInt(valueStr)) ? valueStr : parseInt(valueStr);
      const weaponName = WEAPON_MAPPINGS[code];

      if (weaponName) {
        if (!bonuses.weaponSkills) bonuses.weaponSkills = {};
        if (!bonuses.weaponSkills[weaponName]) bonuses.weaponSkills[weaponName] = {};

        if (type === 'S') {
          if (value === 'X' || value === 'Y') {
            bonuses.weaponSkills[weaponName].diceTierModifier = (bonuses.weaponSkills[weaponName].diceTierModifier || 0) + (value === 'X' ? 1 : -1);
          } else {
            bonuses.weaponSkills[weaponName].value = (bonuses.weaponSkills[weaponName].value || 0) + value;
          }
        } else if (type === 'T') {
          bonuses.weaponSkills[weaponName].talent = (bonuses.weaponSkills[weaponName].talent || 0) + value;
        } else if (type === 'B') {
          // Bonus/Penalty dice for weapon checks (WB1=1)
          if (!bonuses.weaponBonusDice) bonuses.weaponBonusDice = {};
          bonuses.weaponBonusDice[weaponName] = (bonuses.weaponBonusDice[weaponName] || 0) + value;
        }
      }
    }
  },
  {
    name: 'Magic',
    pattern: /^Y([STB])([1-6])=(-?\d+)$/,
    parse: (match, bonuses) => {
      const [_, type, code, valueStr] = match;
      const value = parseInt(valueStr);
      const magicName = MAGIC_MAPPINGS[code];

      if (magicName) {
        if (!bonuses.magicSkills) bonuses.magicSkills = {};
        if (!bonuses.magicSkills[magicName]) bonuses.magicSkills[magicName] = {};

        if (type === 'S') {
          bonuses.magicSkills[magicName].value = (bonuses.magicSkills[magicName].value || 0) + value;
        } else if (type === 'T') {
          bonuses.magicSkills[magicName].talent = (bonuses.magicSkills[magicName].talent || 0) + value;
        } else if (type === 'B') {
          // Bonus/Penalty dice for magic checks (YB1=1)
          if (!bonuses.magicBonusDice) bonuses.magicBonusDice = {};
          bonuses.magicBonusDice[magicName] = (bonuses.magicBonusDice[magicName] || 0) + value;
        }
      }
    }
  },
  {
    name: 'Crafting',
    pattern: /^C([STB])([1-6])=(-?\d+|[XY])$/,
    parse: (match, bonuses) => {
      const [_, type, code, valueStr] = match;
      const value = isNaN(parseInt(valueStr)) ? valueStr : parseInt(valueStr);
      const craftingName = CRAFTING_MAPPINGS[code];

      if (craftingName) {
        if (!bonuses.craftingSkills) bonuses.craftingSkills = {};
        if (!bonuses.craftingSkills[craftingName]) bonuses.craftingSkills[craftingName] = {};

        if (type === 'S') {
          if (value === 'X' || value === 'Y') {
            bonuses.craftingSkills[craftingName].diceTierModifier = (bonuses.craftingSkills[craftingName].diceTierModifier || 0) + (value === 'X' ? 1 : -1);
          } else {
            bonuses.craftingSkills[craftingName].value = (bonuses.craftingSkills[craftingName].value || 0) + value;
          }
        } else if (type === 'T') {
          bonuses.craftingSkills[craftingName].talent = (bonuses.craftingSkills[craftingName].talent || 0) + value;
        } else if (type === 'B') {
          // Bonus/Penalty dice for crafting checks (CB1=1)
          if (!bonuses.craftingBonusDice) bonuses.craftingBonusDice = {};
          bonuses.craftingBonusDice[craftingName] = (bonuses.craftingBonusDice[craftingName] || 0) + value;
        }
      }
    }
  },
  {
    name: 'Mitigation',
    pattern: /^M([1-9])=(-?\d+)$/,
    parse: (match, bonuses) => {
      const [_, code, valueStr] = match;
      const value = parseInt(valueStr);
      const mitigationType = MITIGATION_MAPPINGS[code];

      if (mitigationType) {
        if (!bonuses.mitigation) bonuses.mitigation = {};
        bonuses.mitigation[mitigationType] = (bonuses.mitigation[mitigationType] || 0) + value;
      }
    }
  },
  {
    name: 'Auto Stats',
    pattern: /^A([1-9])=(-?\d+)$/,
    parse: (match, bonuses) => {
      const [_, code, valueStr] = match;
      const value = parseInt(valueStr);
      const statType = AUTO_STAT_MAPPINGS[code];

      if (statType) {
        bonuses[statType] = (bonuses[statType] || 0) + value;
      }
    }
  },
  {
    name: 'Movement',
    pattern: /^K([1-4])=(-?\d+)$/,
    parse: (match, bonuses) => {
      const [_, code, valueStr] = match;
      const value = parseInt(valueStr);
      const movementType = MOVEMENT_MAPPINGS[code];

      if (movementType) {
        bonuses[movementType] = (bonuses[movementType] || 0) + value;
      }
    }
  },
  {
    name: 'Abilities',
    pattern: /^([XZDY])([IDC])([NM])E=(\d+)$/,
    parse: (match, bonuses) => {
      // Abilities don't modify bonuses, they define actions/reactions
      // Just parse and store in bonuses.abilities for reference
      const [_, type, frequency, magic, energy] = match;

      if (!bonuses.abilities) bonuses.abilities = [];

      bonuses.abilities.push({
        type: type === 'X' ? 'action' : type === 'Z' ? 'reaction' : type === 'D' ? 'downtime' : 'both',
        frequency: frequency === 'I' ? 'instant' : frequency === 'D' ? 'daily' : 'combat',
        magical: magic === 'M',
        energy: parseInt(energy)
      });
    }
  },
  {
    name: 'Vision',
    pattern: /^V([1-8])=([0-9])$/,
    parse: (match, bonuses) => {
      const [_, visionType, range] = match;
      const visionTypes = {
        '1': 'normal', '2': 'darksight', '3': 'infravision', '4': 'deadsight',
        '5': 'echolocation', '6': 'tremorsense', '7': 'truesight', '8': 'aethersight'
      };

      if (!bonuses.vision) bonuses.vision = [];
      bonuses.vision.push({
        type: visionTypes[visionType],
        range: parseInt(range)
      });
    }
  },
  {
    name: 'Immunities',
    pattern: /^I([A-Z])$/,
    parse: (match, bonuses) => {
      const immunityMap = {
        'A': 'afraid', 'B': 'bleeding', 'C': 'blinded', 'D': 'charmed', 'E': 'confused',
        'F': 'dazed', 'G': 'deafened', 'H': 'diseased', 'I': 'winded', 'J': 'prone',
        'K': 'poisoned', 'L': 'muted', 'M': 'stunned', 'N': 'impaired', 'O': 'numbed',
        'P': 'broken', 'Q': 'incapacitated', 'R': 'ignited', 'S': 'hidden', 'T': 'maddened'
      };

      const immunity = immunityMap[match[1]];
      if (immunity) {
        if (!bonuses.immunities) bonuses.immunities = [];
        if (!bonuses.immunities.includes(immunity)) {
          bonuses.immunities.push(immunity);
        }
      }
    }
  },
  {
    name: 'Flags',
    pattern: /^F([A-J])$/,
    parse: (match, bonuses) => {
      const flagMap = {
        'A': 'no_comforts', 'B': 'embrace_suffering', 'C': 'urban_comfort', 'D': 'badge_of_honor',
        'E': 'weapon_collector', 'F': 'twin_fury', 'G': 'passive_shell', 'H': 'efficient_weaponry',
        'I': 'dark_sight', 'J': 'first_to_fight'
      };

      const flag = flagMap[match[1]];
      if (flag) {
        if (!bonuses.flags) bonuses.flags = [];
        if (!bonuses.flags.includes(flag)) {
          bonuses.flags.push(flag);
        }
      }
    }
  }
];

// ============================================================================
// MAIN PARSING FUNCTION
// ============================================================================

export function parseDataString(dataString, bonuses = {}, character = null) {
  if (!dataString) return bonuses;

  // Initialize conditionals if character provided
  if (character && !character.conditionals) {
    character.conditionals = {};
  }

  // Split by colon or comma for multiple effects (support both formats)
  const effects = dataString.split(/[:,]/);

  for (const effect of effects) {
    if (!effect.trim()) continue;

    // Check for conditional effects first (CC[M1=1,M7=1], CA[SSE=1], etc.)
    const conditionalMatch = effect.match(/^C([A-G])\[([^\]]+)\]$/);
    if (conditionalMatch && character) {
      parseConditionalEffect(conditionalMatch, character);
      continue;
    }

    // Try each parser in the registry
    let parsed = false;
    for (const parser of PARSERS) {
      const match = effect.match(parser.pattern);
      if (match) {
        parser.parse(match, bonuses);
        parsed = true;
        break;
      }
    }

    // If no parser matched, log warning (optional)
    if (!parsed) {
      // Ignore certain codes that are intentionally not parsed:
      // - Trait category codes (T*)
      // - Character creation codes (UT, UP, etc.) - only relevant during creation
      // - Conditional codes (C*[...]) - only parsed when character is provided
      const ignoredPatterns = [
        /^T[A-Z]+$/,    // Trait categories
        /^U[A-Z]=\d+$/,  // Character creation bonuses (handled separately)
        /^C[A-G]\[.+\]$/  // Conditional effects (only parsed with character context)
      ];

      const shouldIgnore = ignoredPatterns.some(pattern => pattern.test(effect));
      if (!shouldIgnore) {
        console.warn(`[DataCodeParser] Unknown data code: ${effect}`);
      }
    }
  }

  return bonuses;
}

// Helper for parsing conditional effects
function parseConditionalEffect(match, character) {
  const [_, conditionType, effectsString] = match;
  const conditionName = CONDITION_MAPPINGS[conditionType];

  if (!conditionName) return;

  const effects = effectsString.split(',').map(e => e.trim());
  const parsedEffects = [];

  for (const effectStr of effects) {
    // Parse mitigation effects
    const mitigationMatch = effectStr.match(/^M([1-9A])=(\d+)$/);
    if (mitigationMatch) {
      const mitigationMap = {
        ...MITIGATION_MAPPINGS,
        'A': 'true'
      };
      parsedEffects.push({
        type: 'mitigation',
        subtype: mitigationMap[mitigationMatch[1]],
        value: parseInt(mitigationMatch[2])
      });
    }

    // Parse skill effects
    const skillMatch = effectStr.match(/^SS([A-T])=(\d+)$/);
    if (skillMatch) {
      const skillName = SKILL_MAPPINGS[skillMatch[1]];
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

// Helper to extract trait category
export function parseTraitCategory(dataString) {
  if (!dataString) return null;
  if (dataString.includes('TG')) return 'General';
  if (dataString.includes('TC')) return 'Crafting';
  if (dataString.includes('TA')) return 'Ancestry';
  if (dataString.includes('TO')) return 'Offensive';
  if (dataString.includes('TD')) return 'Defensive';
  return null;
}

// Unified parsing function that extracts both bonuses and trait category
export function parseDataCodes(dataString, character = null) {
  if (!dataString) return { bonuses: {}, traitCategory: null };

  const bonuses = {};
  const traitCategory = parseTraitCategory(dataString);

  parseDataString(dataString, bonuses, character);

  return { bonuses, traitCategory };
}

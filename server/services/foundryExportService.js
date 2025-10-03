import { getCharacterWithBonuses } from './characterService.js';

// Helper function to convert MongoDB ObjectId to Foundry-compatible 16-char ID
const convertToFoundryId = (mongoId) => {
  const idString = mongoId.toString();
  return idString.substring(0, 16);
};

// Helper function to get size dimensions
const getSizeFromCharacter = (size) => {
  const sizeMap = {
    'tiny': { width: 0.5, height: 0.5 },
    'small': { width: 1, height: 1 },
    'medium': { width: 1, height: 1 },
    'large': { width: 2, height: 2 },
    'huge': { width: 4, height: 4 },
    'gargantuan': { width: 8, height: 8 }
  };
  return sizeMap[size?.toLowerCase()] || { width: 1, height: 1 };
};

// Helper function to get icon based on type and properties
const getGenericIcon = (data, type) => {
  // For items, traits, modules, and spells, check for foundry_icon first
  if ((type === 'item' || type === 'trait' || type === 'module' || type === 'spell') &&
      data.foundry_icon && data.foundry_icon.trim() !== '') {
    return data.foundry_icon;
  }

  const iconBase = "systems/anyventure/artwork/icons/ui/";

  switch (type) {
    case 'module':
      return `${iconBase}module1.webp`;
    case 'spell':
      return `${iconBase}spell1.webp`;
    case 'ancestry':
      const ancestryName = data.name.toLowerCase().replace(/\s+/g, '-');
      return `systems/anyventure/artwork/icons/ancestries/${ancestryName}.png`;
    case 'culture':
      const cultureName = data.name.toLowerCase().replace(/\s+/g, '-');
      return `systems/anyventure/artwork/icons/cultures/${cultureName}.png`;
    case 'trait':
      return `${iconBase}skill1.webp`;
    case 'item':
      const itemType = data.type;
      const weaponCategory = data.weapon_category;
      const consumableCategory = data.consumable_category;

      // Weapons (all types)
      if (itemType === 'weapon' || weaponCategory) {
        return `${iconBase}weapon2.webp`;
      }
      // Throwing weapons and ammunition
      if (itemType === 'ammunition' || weaponCategory === 'throwing') {
        return `${iconBase}ammunition.webp`;
      }
      // Shields
      if (itemType === 'shield') {
        return `${iconBase}shield2.webp`;
      }
      // Consumables
      if (itemType === 'consumable') {
        if (consumableCategory === 'potions' || consumableCategory === 'elixirs') {
          return `${iconBase}potion1.webp`;
        }
        return `${iconBase}goods1.webp`;
      }
      // Armor pieces
      if (itemType === 'headwear') return `${iconBase}headwear2.webp`;
      if (itemType === 'body') return `${iconBase}body2.webp`;
      if (itemType === 'boots') return `${iconBase}feet2.webp`;
      if (itemType === 'gloves') return `${iconBase}hands2.webp`;
      if (itemType === 'cloak') return `${iconBase}cloak2.webp`;
      if (itemType === 'legs') return `${iconBase}legs2.webp`;
      if (itemType === 'accessory') return `${iconBase}accessory2.webp`;

      // Trade goods
      if (itemType === 'trade_good') {
        const name = data.name.toLowerCase();
        if (name.includes('metal') || name.includes('iron') || name.includes('steel') ||
            name.includes('copper') || name.includes('silver') || name.includes('gold')) {
          return `${iconBase}metal1.webp`;
        }
        if (name.includes('gem') || name.includes('diamond') || name.includes('ruby') ||
            name.includes('emerald') || name.includes('sapphire') || name.includes('crystal')) {
          return `${iconBase}gems1.webp`;
        }
        return `${iconBase}goods1.webp`;
      }

      // Tools
      if (itemType === 'tool' || data.category === 'tools') {
        return `${iconBase}tools1.webp`;
      }

      // Default for items
      return `${iconBase}goods1.webp`;

    default:
      return `${iconBase}skill1.webp`;
  }
};

/**
 * Export a character to FoundryVTT format
 */
export async function exportCharacterToFoundry(characterId, userId, isPublic = false) {
  console.log('🔥 EXPORT SERVICE - Character ID:', characterId);

  // Get character with all bonuses applied
  const character = await getCharacterWithBonuses(characterId, {
    populateFields: true,
    resetSkills: true,
    recalculateModulePoints: false
  });

  if (!character) {
    throw new Error('Character not found');
  }

  // Check authorization
  if (character.userId !== userId?.toString() && !character.public && !isPublic) {
    throw new Error('Not authorized to export this character');
  }

  // Get token size
  const tokenSize = getSizeFromCharacter(character.physicalTraits?.size);

  // Process portrait URL
  let portraitUrl = character.portraitUrl || "icons/svg/mystery-man.svg";
  if (portraitUrl.startsWith('/uploads/')) {
    const assetsBaseUrl = process.env.ASSETS_BASE_URL || 'http://localhost:4000';
    portraitUrl = `${assetsBaseUrl}${portraitUrl}`;
  }

  // Build the FoundryVTT actor structure
  const foundryActor = {
    _id: character.foundry_id || convertToFoundryId(character._id),
    name: character.name,
    type: "character",
    img: portraitUrl,
    prototypeToken: {
      actorLink: true,
      width: tokenSize.width,
      height: tokenSize.height,
      texture: {
        src: portraitUrl,
        anchorX: 0.5,
        anchorY: 0.5,
        offsetX: 0,
        offsetY: 0,
        fit: "contain",
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        tint: "#ffffff",
        alphaThreshold: 0.75
      }
    },
    system: buildFoundrySystemData(character)
  };

  // Add items collection
  foundryActor.items = await buildFoundryItems(character);

  return foundryActor;
}

/**
 * Build the system data for a FoundryVTT character
 */
function buildFoundrySystemData(character) {
  return {
    // Core attributes
    attributes: {
      physique: {
        value: character.attributes.physique,
        min: 1,
        max: 5,
        baseValue: character.attributes.basePhysique || character.attributes.physique
      },
      finesse: {
        value: character.attributes.finesse,
        min: 1,
        max: 5,
        baseValue: character.attributes.baseFinesse || character.attributes.finesse
      },
      mind: {
        value: character.attributes.mind,
        min: 1,
        max: 5,
        baseValue: character.attributes.baseMind || character.attributes.mind
      },
      knowledge: {
        value: character.attributes.knowledge,
        min: 1,
        max: 5,
        baseValue: character.attributes.baseKnowledge || character.attributes.knowledge
      },
      social: {
        value: character.attributes.social,
        min: 1,
        max: 5,
        baseValue: character.attributes.baseSocial || character.attributes.social
      }
    },

    // Resources
    resources: {
      health: {
        value: character.resources?.health?.current || 0,
        max: character.resources?.health?.max || 0,
        temp: 0
      },
      resolve: {
        value: character.resources?.resolve?.current || 0,
        max: character.resources?.resolve?.max || 0,
        temp: 0
      },
      morale: {
        value: character.resources?.morale?.current || 0,
        max: character.resources?.morale?.max || 0,
        temp: 0
      },
      energy: {
        value: character.resources?.energy?.current || 5,
        max: character.resources?.energy?.max || 5,
        temp: 0
      }
    },

    // Movement
    movement: {
      walk: 5, // Base movement
      swim: 0,
      climb: 0,
      fly: 0
    },

    // Mitigation
    mitigation: {
      physical: 0,
      heat: 0,
      cold: 0,
      electric: 0,
      dark: 0,
      divine: 0,
      aether: 0,
      psychic: 0,
      toxic: 0
    },

    // Basic skills
    basic: buildBasicSkills(character),

    // Weapon skills
    weapon: buildWeaponSkills(character),

    // Magic skills
    magic: buildMagicSkills(character),

    // Crafting skills
    crafting: buildCraftingSkills(character),

    // Music skills
    music: buildMusicSkills(character),

    // Languages
    languages: buildLanguages(character),

    // Equipment slots
    equipment: buildEquipmentSlots(character),

    // Character details
    details: {
      appearance: character.appearance || "",
      biography: character.biography || "",
      culture: character.characterCulture?.cultureId?.name || character.culture || "",
      ancestry: character.ancestry?.ancestryId?.name || character.race || "",
      size: character.physicalTraits?.size || "medium",
      level: character.level || 1,
      modulePoints: {
        total: character.modulePoints?.total || 10,
        spent: character.modulePoints?.spent || 0
      },
      spellSlots: {
        value: character.spellSlots || 10,
        max: character.spellSlots || 10
      }
    }
  };
}

/**
 * Build equipment slots object for Foundry
 * Maps equipped inventory items to Foundry's 12 equipment slots
 */
function buildEquipmentSlots(character) {
  // Initialize empty equipment slots
  const equipment = {
    head: null,
    body: null,
    back: null,
    hand: null,
    boots: null,
    accessory1: null,
    accessory2: null,
    mainhand: null,
    offhand: null,
    extra1: null,
    extra2: null,
    extra3: null
  };

  if (!character.inventory) {
    return equipment;
  }

  // Track which slots have been filled
  const accessoryCount = { current: 0, max: 2 };
  const extraCount = { current: 0, max: 3 };

  // Filter for equipped items only
  const equippedItems = character.inventory.filter(invItem => invItem.equipped);

  // Map item types to slot names
  const itemTypeToSlot = {
    'headwear': 'head',
    'body': 'body',
    'cloak': 'back',
    'gloves': 'hand',
    'boots': 'boots'
  };

  for (const inventoryItem of equippedItems) {
    if (!inventoryItem.itemId) continue;

    const item = inventoryItem.itemId;
    const itemType = item.type;
    const weaponCategory = item.weapon_category;

    // Create the slot data structure
    const slotData = {
      item: {
        _id: convertToFoundryId(inventoryItem._id || item._id),
        name: inventoryItem.customName || item.name,
        img: inventoryItem.customIcon || getGenericIcon(item, 'item'),
        type: mapItemTypeToFoundry(itemType),
        system: {
          description: inventoryItem.customDescription || item.description || "",
          weight: item.weight || 0,
          value: item.value || 0,
          rarity: item.rarity || "common"
        }
      },
      equippedAt: Date.now(),
      quantity: inventoryItem.quantity || 1
    };

    // Add type-specific properties
    if (itemType === 'weapon' || weaponCategory) {
      Object.assign(slotData.item.system, {
        damage: item.damage || 0,
        extra_damage: item.extra_damage || 0,
        damage_type: item.damage_type || "physical",
        weapon_category: weaponCategory || "",
        range: item.range || 0,
        thrown_range: item.thrown_range || 0,
        versatile: item.versatile || false,
        hands: item.hands || 1
      });
    }

    if (itemType === 'shield') {
      Object.assign(slotData.item.system, {
        defense: item.defense || 0,
        shield_type: item.shield_type || "light"
      });
    }

    // Map items to slots
    let targetSlot = null;

    // Direct armor piece mapping
    if (itemTypeToSlot[itemType]) {
      targetSlot = itemTypeToSlot[itemType];
    }
    // Weapons go to mainhand/offhand
    else if (itemType === 'weapon' || weaponCategory) {
      if (!equipment.mainhand) {
        targetSlot = 'mainhand';
      } else if (!equipment.offhand) {
        targetSlot = 'offhand';
      } else if (extraCount.current < extraCount.max) {
        targetSlot = `extra${extraCount.current + 1}`;
        extraCount.current++;
      }
    }
    // Shields go to offhand
    else if (itemType === 'shield') {
      targetSlot = 'offhand';
    }
    // Accessories
    else if (itemType === 'accessory') {
      if (accessoryCount.current < accessoryCount.max) {
        targetSlot = `accessory${accessoryCount.current + 1}`;
        accessoryCount.current++;
      } else if (extraCount.current < extraCount.max) {
        targetSlot = `extra${extraCount.current + 1}`;
        extraCount.current++;
      }
    }
    // Everything else goes to extra slots
    else {
      if (extraCount.current < extraCount.max) {
        targetSlot = `extra${extraCount.current + 1}`;
        extraCount.current++;
      }
    }

    // Assign to slot
    if (targetSlot && !equipment[targetSlot]) {
      equipment[targetSlot] = slotData;
    }
  }

  return equipment;
}

/**
 * Build basic skills object for Foundry
 */
function buildBasicSkills(character) {
  const skills = {};
  const skillList = [
    'fitness', 'deflection', 'might', 'endurance',
    'evasion', 'stealth', 'coordination', 'thievery',
    'resilience', 'concentration', 'senses', 'logic',
    'wildcraft', 'academics', 'magic', 'medicine',
    'expression', 'presence', 'insight', 'persuasion'
  ];

  const attributeMap = {
    fitness: "physique", deflection: "physique", might: "physique", endurance: "physique",
    evasion: "finesse", stealth: "finesse", coordination: "finesse", thievery: "finesse",
    resilience: "mind", concentration: "mind", senses: "mind", logic: "mind",
    wildcraft: "knowledge", academics: "knowledge", magic: "knowledge", medicine: "knowledge",
    expression: "social", presence: "social", insight: "social", persuasion: "social"
  };

  skillList.forEach(skillName => {
    skills[skillName] = {
      value: character.skills?.[skillName]?.value || 0,
      tier: character.skills?.[skillName]?.diceTierModifier || 0,
      attribute: attributeMap[skillName]
    };
  });

  return skills;
}

/**
 * Build weapon skills object for Foundry
 */
function buildWeaponSkills(character) {
  return {
    brawling: {
      value: character.weaponSkills?.brawling?.value || 0,
      talent: character.weaponSkills?.brawling?.talent || 1,
      baseTalent: character.weaponSkills?.brawling?.baseTalent || 1
    },
    throwing: {
      value: character.weaponSkills?.throwing?.value || 0,
      talent: character.weaponSkills?.throwing?.talent || 1,
      baseTalent: character.weaponSkills?.throwing?.baseTalent || 1
    },
    simpleMeleeWeapons: {
      value: character.weaponSkills?.simpleMeleeWeapons?.value || 0,
      talent: character.weaponSkills?.simpleMeleeWeapons?.talent || 1,
      baseTalent: character.weaponSkills?.simpleMeleeWeapons?.baseTalent || 1
    },
    simpleRangedWeapons: {
      value: character.weaponSkills?.simpleRangedWeapons?.value || 0,
      talent: character.weaponSkills?.simpleRangedWeapons?.talent || 1,
      baseTalent: character.weaponSkills?.simpleRangedWeapons?.baseTalent || 1
    },
    complexMeleeWeapons: {
      value: character.weaponSkills?.complexMeleeWeapons?.value || 0,
      talent: character.weaponSkills?.complexMeleeWeapons?.talent || 0,
      baseTalent: character.weaponSkills?.complexMeleeWeapons?.baseTalent || 0
    },
    complexRangedWeapons: {
      value: character.weaponSkills?.complexRangedWeapons?.value || 0,
      talent: character.weaponSkills?.complexRangedWeapons?.talent || 0,
      baseTalent: character.weaponSkills?.complexRangedWeapons?.baseTalent || 0
    }
  };
}

/**
 * Build magic skills object for Foundry
 */
function buildMagicSkills(character) {
  return {
    black: {
      value: character.magicSkills?.black?.value || 0,
      talent: character.magicSkills?.black?.talent || 0,
      baseTalent: character.magicSkills?.black?.baseTalent || 0
    },
    primal: {
      value: character.magicSkills?.primal?.value || 0,
      talent: character.magicSkills?.primal?.talent || 0,
      baseTalent: character.magicSkills?.primal?.baseTalent || 0
    },
    metamagic: {
      value: character.magicSkills?.meta?.value || 0,
      talent: character.magicSkills?.meta?.talent || 0,
      baseTalent: character.magicSkills?.meta?.baseTalent || 0
    },
    divine: {
      value: character.magicSkills?.divine?.value || 0,
      talent: character.magicSkills?.divine?.talent || 0,
      baseTalent: character.magicSkills?.divine?.baseTalent || 0
    },
    mysticism: {
      value: character.magicSkills?.mystic?.value || 0,
      talent: character.magicSkills?.mystic?.talent || 0,
      baseTalent: character.magicSkills?.mystic?.baseTalent || 0
    }
  };
}

/**
 * Build crafting skills object for Foundry
 */
function buildCraftingSkills(character) {
  return {
    engineering: {
      value: character.craftingSkills?.engineering?.value || 0,
      talent: character.craftingSkills?.engineering?.talent || 0,
      baseTalent: character.craftingSkills?.engineering?.baseTalent || 0
    },
    fabrication: {
      value: character.craftingSkills?.fabrication?.value || 0,
      talent: character.craftingSkills?.fabrication?.talent || 0,
      baseTalent: character.craftingSkills?.fabrication?.baseTalent || 0
    },
    alchemy: {
      value: character.craftingSkills?.alchemy?.value || 0,
      talent: character.craftingSkills?.alchemy?.talent || 0,
      baseTalent: character.craftingSkills?.alchemy?.baseTalent || 0
    },
    cooking: {
      value: character.craftingSkills?.cooking?.value || 0,
      talent: character.craftingSkills?.cooking?.talent || 0,
      baseTalent: character.craftingSkills?.cooking?.baseTalent || 0
    },
    glyphcraft: {
      value: character.craftingSkills?.glyphcraft?.value || 0,
      talent: character.craftingSkills?.glyphcraft?.talent || 0,
      baseTalent: character.craftingSkills?.glyphcraft?.baseTalent || 0
    },
    bioshaping: {
      value: character.craftingSkills?.bioshaping?.value || 0,
      talent: character.craftingSkills?.bioshaping?.talent || 0,
      baseTalent: character.craftingSkills?.bioshaping?.baseTalent || 0
    }
  };
}

/**
 * Build music skills object for Foundry
 */
function buildMusicSkills(character) {
  return {
    percussion: {
      value: 0,
      talent: character.musicSkills?.percussion || 0,
      baseTalent: character.musicSkills?.percussion || 0
    },
    strings: {
      value: 0,
      talent: character.musicSkills?.strings || 0,
      baseTalent: character.musicSkills?.strings || 0
    },
    wind: {
      value: 0,
      talent: character.musicSkills?.wind || 0,
      baseTalent: character.musicSkills?.wind || 0
    },
    vocals: {
      value: 0,
      talent: character.musicSkills?.vocal || 0,
      baseTalent: character.musicSkills?.vocal || 0
    }
  };
}

/**
 * Build languages object for Foundry
 */
function buildLanguages(character) {
  const languages = {};

  if (character.languageSkills) {
    // Convert Map to object if needed
    const langEntries = character.languageSkills instanceof Map
      ? Array.from(character.languageSkills.entries())
      : Object.entries(character.languageSkills);

    langEntries.forEach(([lang, value]) => {
      languages[lang] = typeof value === 'number' ? value : 0;
    });
  }

  return languages;
}

/**
 * Build items collection for Foundry actor
 */
async function buildFoundryItems(character) {
  const items = [];

  // Add ancestry as an item
  if (character.ancestry?.ancestryId) {
    const ancestry = character.ancestry.ancestryId;
    items.push({
      _id: convertToFoundryId(ancestry._id),
      name: ancestry.name,
      type: "ancestry",
      img: getGenericIcon(ancestry, 'ancestry'),
      system: {
        description: ancestry.description || "",
        options: ancestry.options || [],
        selectedOptions: character.ancestry.selectedOptions || []
      }
    });
  }

  // Add culture as an item
  if (character.characterCulture?.cultureId) {
    const culture = character.characterCulture.cultureId;
    items.push({
      _id: convertToFoundryId(culture._id),
      name: culture.name,
      type: "culture",
      img: getGenericIcon(culture, 'culture'),
      system: {
        description: culture.description || "",
        selectedRestriction: character.characterCulture.selectedRestriction || null,
        selectedBenefit: character.characterCulture.selectedBenefit || null,
        selectedStartingItem: character.characterCulture.selectedStartingItem || null
      }
    });
  }

  // Add traits
  if (character.traits) {
    for (const trait of character.traits) {
      if (trait.traitId) {
        const traitData = trait.traitId;
        items.push({
          _id: convertToFoundryId(traitData._id),
          name: traitData.name,
          type: "trait",
          img: getGenericIcon(traitData, 'trait'),
          system: {
            description: traitData.description || "",
            options: traitData.options || [],
            selectedOptions: trait.selectedOptions || [],
            trait_type: traitData.trait_type || "general",
            rarity: traitData.rarity || "common"
          }
        });
      }
    }
  }

  // Add modules
  if (character.modules) {
    for (const module of character.modules) {
      if (module.moduleId) {
        const moduleData = module.moduleId;
        items.push({
          _id: convertToFoundryId(moduleData._id),
          name: moduleData.name,
          type: "module",
          img: getGenericIcon(moduleData, 'module'),
          system: {
            description: moduleData.description || "",
            mtype: moduleData.mtype || "primary",
            module_category: moduleData.module_category || "general",
            options: moduleData.options || [],
            selectedOptions: module.selectedOptions || [],
            tier_data: moduleData.tier_data || {},
            tiers: moduleData.tiers || {}
          }
        });
      }
    }
  }

  // Add spells
  if (character.spells) {
    for (const spell of character.spells) {
      if (spell.spellId) {
        const spellData = spell.spellId;
        items.push({
          _id: convertToFoundryId(spellData._id),
          name: spellData.name,
          type: "spell",
          img: getGenericIcon(spellData, 'spell'),
          system: {
            description: spellData.description || "",
            school: spellData.school || "",
            subschool: spellData.subschool || "",
            range: spellData.range || "0",
            radius: spellData.radius || "0",
            duration: spellData.duration || "instant",
            difficulty: spellData.difficulty || 8,
            damage: spellData.damage || "",
            damage_type: spellData.damage_type || "",
            shape: spellData.shape || "",
            component: spellData.component || ""
          }
        });
      }
    }
  }

  // Add inventory items
  if (character.inventory) {
    for (const inventoryItem of character.inventory) {
      if (inventoryItem.itemId) {
        const item = inventoryItem.itemId;
        const foundryItem = {
          _id: convertToFoundryId(inventoryItem._id || item._id),
          name: inventoryItem.customName || item.name,
          type: mapItemTypeToFoundry(item.type),
          img: inventoryItem.customIcon || getGenericIcon(item, 'item'),
          system: {
            description: inventoryItem.customDescription || item.description || "",
            quantity: inventoryItem.quantity || 1,
            stack_limit: item.stack_limit || 1,
            weight: item.weight || 0,
            value: item.value || 0,
            equipped: inventoryItem.equipped || false,
            rarity: item.rarity || "common"
          }
        };

        // Add type-specific properties
        if (item.type === 'weapon' || item.weapon_category) {
          Object.assign(foundryItem.system, {
            damage: item.damage || 0,
            extra_damage: item.extra_damage || 0,
            damage_type: item.damage_type || "physical",
            weapon_category: item.weapon_category || "",
            range: item.range || 0,
            thrown_range: item.thrown_range || 0,
            versatile: item.versatile || false,
            hands: item.hands || 1
          });
        }

        if (item.type === 'shield') {
          Object.assign(foundryItem.system, {
            defense: item.defense || 0,
            shield_type: item.shield_type || "light"
          });
        }

        if (item.type === 'consumable') {
          Object.assign(foundryItem.system, {
            consumable_category: item.consumable_category || "",
            uses: item.uses || 1
          });
        }

        items.push(foundryItem);
      }
    }
  }

  return items;
}

/**
 * Map our item types to Foundry item types
 */
function mapItemTypeToFoundry(type) {
  const typeMap = {
    'weapon': 'weapon',
    'shield': 'armor',
    'headwear': 'armor',
    'body': 'armor',
    'boots': 'armor',
    'gloves': 'armor',
    'cloak': 'armor',
    'legs': 'armor',
    'accessory': 'equipment',
    'consumable': 'consumable',
    'trade_good': 'loot',
    'tool': 'equipment',
    'container': 'container',
    'ammunition': 'consumable'
  };

  return typeMap[type] || 'equipment';
}
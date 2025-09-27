import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Module from '../models/Module.js';
import Ancestry from '../models/Ancestry.js';
import Culture from '../models/Culture.js';
import Trait from '../models/Trait.js';
import Item from '../models/Item.js';
import Spell from '../models/Spell.js';
import Song from '../models/Song.js';
import Language from '../models/Language.js';
import Injury from '../models/Injury.js';
import Creature from '../models/Creature.js';
import { generateFoundryId } from '../utils/foundryIdGenerator.js';

// Helper function to generate a deterministic 16-character alphanumeric ID from a seed
const generateDeterministicFoundryId = (seed) => {
  // Create a simple hash from the seed string
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Use the hash as a seed for a simple PRNG
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  let result = '';
  let currentSeed = Math.abs(hash);

  for (let i = 0; i < 16; i++) {
    // Simple LCG (Linear Congruential Generator) for deterministic randomness
    currentSeed = (currentSeed * 1664525 + 1013904223) % Math.pow(2, 32);
    result += chars.charAt(currentSeed % chars.length);
  }

  return result;
};

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to convert MongoDB ObjectId to Foundry-compatible 16-char ID
const convertToFoundryId = (mongoId) => {
  const idString = mongoId.toString();

  // Handle temporary IDs from DevCreatureDesigner
  if (idString.startsWith('temp')) {
    // Generate a deterministic but valid 16-character alphanumeric ID
    // Use a hash-like approach to ensure consistency
    let hash = 0;
    for (let i = 0; i < idString.length; i++) {
      const char = idString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    // Convert to base 36 and pad/truncate to 16 characters
    const base36 = Math.abs(hash).toString(36);
    const timestamp = Date.now().toString(36).slice(-8);
    const combined = (base36 + timestamp + '0000000000000000').slice(0, 16);

    // Ensure the ID starts with a letter (Foundry requirement)
    return 'c' + combined.slice(1);
  }

  // Take the first 16 characters of the hex string
  // MongoDB ObjectIds are 24 hex chars, Foundry wants 16
  return idString.substring(0, 16);
};

// Helper function to expand trait options with subchoices
const expandTraitOptions = (options) => {
  if (!options) return [];

  const expandedOptions = [];

  for (const option of options) {
    // Add the main option
    const mainOption = {
      _id: option._id,
      name: option.name,
      description: option.description,
      data: option.data,
      selected: option.selected || false,
      requiresChoice: option.requiresChoice || false,
      choiceType: option.choiceType || ""
    };
    expandedOptions.push(mainOption);

    // Add subchoices as separate options
    if (option.subchoices && option.subchoices.length > 0) {
      for (const subchoice of option.subchoices) {
        const subchoiceOption = {
          _id: subchoice.id || subchoice._id,
          name: subchoice.name,
          description: subchoice.description,
          data: subchoice.data || "",
          selected: false,
          isSubchoice: true,
          parentOption: option.name
        };
        expandedOptions.push(subchoiceOption);
      }
    }
  }

  return expandedOptions;
};

// Helper function to get icon based on type and properties
const getGenericIcon = (data, type) => {
  // If this is an item, trait, module, language, injury, spell, or song and it has a foundry_icon, use that first
  if ((type === 'item' || type === 'trait' || type === 'module' || type === 'language' || type === 'injury' || type === 'spell' || type === 'song') && data.foundry_icon && data.foundry_icon.trim() !== '') {
    return data.foundry_icon;
  }

  const iconBase = "systems/anyventure/artwork/icons/ui/";

  switch (type) {
    case 'module':
      return `${iconBase}module1.webp`;

    case 'spell':
      return `${iconBase}spell1.webp`;

    case 'song':
      // Fallback icons if foundry_icon isn't set
      if (data.type === 'ballad') {
        return 'icons/sundries/scrolls/scroll-writing-silver-brown.webp';
      } else {
        return 'icons/tools/instruments/harp-yellow-teal.webp';
      }

    case 'ancestry':
      // Map to specific ancestry icon based on name
      const ancestryName = data.name.toLowerCase().replace(/\s+/g, '-');
      return `systems/anyventure/artwork/icons/ancestries/${ancestryName}.png`;

    case 'culture':
      // Map to specific culture icon based on name
      const cultureName = data.name.toLowerCase().replace(/\s+/g, '-');
      return `systems/anyventure/artwork/icons/cultures/${cultureName}.png`;

    case 'trait':
      // Use skill icon for character traits
      return `${iconBase}skill1.webp`;

    case 'item':
      // Map based on item type and properties
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
        // Other consumables use goods
        return `${iconBase}goods1.webp`;
      }

      // Armor pieces
      if (itemType === 'headwear') {
        return `${iconBase}headwear2.webp`;
      }
      if (itemType === 'body') {
        return `${iconBase}body2.webp`;
      }
      if (itemType === 'boots') {
        return `${iconBase}feet2.webp`;
      }
      if (itemType === 'gloves') {
        return `${iconBase}hands2.webp`;
      }
      if (itemType === 'cloak') {
        return `${iconBase}cloak2.webp`;
      }
      if (itemType === 'legs') {
        return `${iconBase}legs2.webp`; // Purple version as requested
      }

      // Accessories
      if (itemType === 'accessory') {
        return `${iconBase}accessory2.webp`;
      }

      // Trade goods
      if (itemType === 'trade_good') {
        // Check if it's a metal or gem
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

      // Tools and instruments
      if (itemType === 'tool' || itemType === 'instrument') {
        return `${iconBase}goods1.webp`;
      }

      // Default for unknown items
      return `${iconBase}goods1.webp`;

    case 'language':
      // Language icons are already handled by foundry_icon field check above
      // But provide fallback based on magic property
      if (data.magic === 1) {
        return 'icons/sundries/scrolls/scroll-writing-orange-black.webp';
      } else {
        return 'icons/sundries/scrolls/scroll-plain-tan.webp';
      }

    case 'injury':
      // Map injury icons based on type
      switch (data.type) {
        case 'cosmetic_injury':
          return 'icons/skills/wounds/injury-face-mask-red.webp';
        case 'missing_part':
          return 'icons/skills/wounds/bone-broken-marrow-yellow.webp';
        case 'lingering_injury':
          return 'icons/skills/wounds/blood-cells-vessel-red.webp';
        case 'severe_wound':
          return 'icons/skills/wounds/injury-triple-slash-blood.webp';
        default:
          return 'icons/skills/wounds/injury-pain-body-orange.webp';
      }

    case 'creature':
      // Generic creature icon - could be customized based on creature type
      return 'icons/creatures/abilities/bear-roar-red-brown.webp';

    case 'action':
      // Generic action icon
      return 'icons/skills/melee/sword-damaged-broken-glow-red.webp';

    case 'reaction':
      // Generic reaction icon
      return 'icons/skills/movement/arrow-upward-yellow.webp';

    default:
      return `${iconBase}goods1.webp`;
  }
};

// Helper function to convert web data to Foundry format
const convertToFoundryFormat = (data, type) => {
  // Validate that essential fields exist
  if (!data || !data.name || data.name.trim() === '') {
    console.error(`[FoundryAPI] Item missing or empty name field:`, {
      _id: data?._id,
      type,
      hasName: !!data?.name,
      nameValue: JSON.stringify(data?.name),
      nameType: typeof data?.name,
      data: JSON.stringify(data, null, 2)
    });
    throw new Error(`Item ${data?._id || 'unknown'} has invalid name field`);
  }

  // Additional validation for critical fields
  if (!data._id) {
    console.error(`[FoundryAPI] Item missing _id field:`, { type, data: JSON.stringify(data, null, 2) });
    throw new Error(`Item is missing _id field`);
  }

  // No mapping needed - our system now matches exactly!
  const baseFoundryDoc = {
    _id: data.foundry_id || convertToFoundryId(data._id), // Use foundry_id if available (languages)
    name: data.name,
    type: type, // Use the type directly - no mapping needed
    img: getGenericIcon(data, type), // Use generalized icon mapping
    system: {},
    flags: {
      anyventure: {
        version: "1.0.0",
        originalId: data._id.toString() // Store original MongoDB ID in flags
      }
    }
  };

  switch (type) {
    case 'module':
      baseFoundryDoc.system = {
        mtype: data.mtype,
        ruleset: data.ruleset,
        description: data.description,
        options: data.options
      };
      break;

    case 'ancestry':
      baseFoundryDoc.system = {
        description: data.description,
        homeworld: data.homeworld,
        lifespan: data.lifespan,
        height: data.height,
        size: data.size,
        home: data.home,
        language: data.language,
        options: data.options
      };
      break;

    case 'culture':
      baseFoundryDoc.system = {
        description: data.description,
        culturalRestrictions: data.culturalRestrictions,
        benefits: data.benefits,
        startingItems: data.startingItems,
        options: data.options || []
      };
      break;

    case 'trait':
      baseFoundryDoc.system = {
        type: data.type,
        description: data.description,
        options: expandTraitOptions(data.options)
      };
      break;

    case 'item':
      baseFoundryDoc.system = {
        description: data.description,
        itemType: data.type, // Store the specific item type (weapon, shield, body, etc.)
        weight: data.weight,
        value: data.value,
        rarity: data.rarity,
        weapon_category: data.weapon_category,
        hands: data.hands,
        stack_limit: data.stack_limit,
        holdable: data.holdable,
        shield_category: data.shield_category,
        consumable_category: data.consumable_category,
        primary: data.primary,
        secondary: data.secondary,
        bonus_attack: data.bonus_attack,
        encumbrance_penalty: data.encumbrance_penalty,
        health: data.health,
        energy: data.energy,
        resolve: data.resolve,
        movement: data.movement,
        attributes: data.attributes,
        basic: data.basic,
        weapon: data.weapon,
        magic: data.magic,
        craft: data.craft,
        mitigation: data.mitigation,
        detections: data.detections,
        immunities: data.immunities,
        effects: data.effects,
        properties: data.properties
      };
      break;

    case 'spell':
      baseFoundryDoc.system = {
        description: data.description,
        school: data.school,
        subschool: data.subschool,
        charge: data.charge,
        duration: data.duration,
        range: data.range,
        checkToCast: data.checkToCast,
        components: data.components,
        ritualDuration: data.ritualDuration,
        concentration: data.concentration,
        reaction: data.reaction,
        energy: data.energy,
        damage: data.damage,
        damageType: data.damageType,
        fizzled: false, // Default for FoundryVTT
        foundry_icon: data.foundry_icon || ''
      };
      break;

    case 'song':
      baseFoundryDoc.system = {
        description: data.description,
        type: data.type,
        magical: data.magical,
        difficulty: data.difficulty,
        effect: data.effect,
        harmony_1: data.harmony_1,
        harmony_2: data.harmony_2,
        used: false, // Default for FoundryVTT
        foundry_icon: data.foundry_icon || ''
      };
      break;

    case 'language':
      baseFoundryDoc.system = {
        description: data.description,
        magic: data.magic,
        talent: 0 // Default talent level
      };
      break;

    case 'injury':
      baseFoundryDoc.system = {
        description: data.description,
        injuryType: data.type,
        cause: "",
        data: data.data || ""
      };
      break;

    case 'creature':
      baseFoundryDoc.type = 'npc'; // Foundry uses 'npc' type for creatures
      // Convert foundry_portrait filename to full URL
      let portraitUrl = '';
      if (data.foundry_portrait && data.foundry_portrait.trim() !== '') {
        const assetsBaseUrl = process.env.ASSETS_BASE_URL || 'http://localhost:4000';
        portraitUrl = `${assetsBaseUrl}/assets/monsters/${data.foundry_portrait}`;
      }

      baseFoundryDoc.img = portraitUrl || getGenericIcon(data, 'creature');

      // Add prototypeToken based on creature size
      const getSizeFromCreature = (size) => {
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

      const tokenSize = getSizeFromCreature(data.size);
      baseFoundryDoc.prototypeToken = {
        actorLink: false,
        width: tokenSize.width,
        height: tokenSize.height,
        texture: {
          src: portraitUrl || "icons/svg/mystery-man.svg",
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
      };

      // Initialize the items array for the creature
      baseFoundryDoc.items = [];

      // Convert creature traits to trait items
      if (data.traits && data.traits.length > 0) {
        for (const trait of data.traits) {
          // Create a unique seed for this trait based on creature and trait name
          const seed = `${data.name}-trait-${trait.name}`;
          const traitItem = {
            _id: generateDeterministicFoundryId(seed),
            name: trait.name,
            type: "trait",
            img: getGenericIcon({ type: 'supernatural' }, 'trait'),
            system: {
              description: trait.description || "",
              type: "supernatural",
              options: []
            },
            flags: {
              anyventure: {
                version: "1.0.0",
                isCreatureTrait: true
              }
            }
          };
          baseFoundryDoc.items.push(traitItem);
        }
      }

      // Convert creature actions to action items
      if (data.actions && data.actions.length > 0) {
        for (const action of data.actions) {
          // Create a unique seed for this action based on creature and action name
          const seed = `${data.name}-action-${action.name}`;
          const actionItem = {
            _id: generateDeterministicFoundryId(seed),
            name: action.name,
            type: "action",
            img: getGenericIcon(action, 'action'),
            system: {
              description: action.description || "",
              energy: action.cost || 0,
              daily: false,
              used: false,
              anyventure_id: "",
              magic: action.magic || false,
              abilityType: action.type || "action",
              // Add attackData to system section
              roll: action.attack?.roll || "2d6",
              damage: action.attack?.damage || "0",
              damage_extra: action.attack?.damage_extra || "0",
              damage_type: action.attack?.damage_type || "physical",
              secondary_damage: action.attack?.secondary_damage || "0",
              secondary_damage_extra: action.attack?.secondary_damage_extra || "0",
              secondary_damage_type: action.attack?.secondary_damage_type || "",
              category: action.attack?.category || "slash",
              min_range: action.attack?.min_range || 1,
              max_range: action.attack?.max_range || 1
            },
            flags: {
              anyventure: {
                version: "1.0.0",
                isCreatureAction: true,
                actionType: action.type || "utility"
              }
            }
          };
          baseFoundryDoc.items.push(actionItem);
        }
      }

      // Convert creature reactions to reaction items
      if (data.reactions && data.reactions.length > 0) {
        for (const reaction of data.reactions) {
          // Create a unique seed for this reaction based on creature and reaction name
          const seed = `${data.name}-reaction-${reaction.name}`;
          const reactionItem = {
            _id: generateDeterministicFoundryId(seed),
            name: reaction.name,
            type: "reaction",
            img: getGenericIcon(reaction, 'reaction'),
            system: {
              description: reaction.description || "",
              energy: reaction.cost || 0,
              daily: false,
              used: false,
              anyventure_id: "",
              magic: false,
              abilityType: reaction.type || "reaction",
              roll: reaction.attack?.roll || "2d6",
              damage: reaction.attack?.damage || "0",
              damage_extra: reaction.attack?.damage_extra || "0",
              damage_type: reaction.attack?.damage_type || "physical",
              secondary_damage: reaction.attack?.secondary_damage || "0",
              secondary_damage_extra: reaction.attack?.secondary_damage_extra || "0",
              secondary_damage_type: reaction.attack?.secondary_damage_type || "",
              category: reaction.attack?.category || "slash",
              min_range: reaction.attack?.min_range || 1,
              max_range: reaction.attack?.max_range || 1
            },
            flags: {
              anyventure: {
                version: "1.0.0",
                isCreatureReaction: true,
                trigger: reaction.trigger || ""
              }
            }
          };
          baseFoundryDoc.items.push(reactionItem);
        }
      }

      // Add spells as spell items (if creature has spells)
      if (data.spells && data.spells.length > 0) {
        // Note: This assumes data.spells contains populated spell objects
        // If they're just IDs, we'd need to populate them first
        for (const spell of data.spells) {
          if (spell && spell.name) {
            const spellItem = {
              _id: spell.foundry_id || convertToFoundryId(spell._id),
              name: spell.name,
              type: "spell",
              img: spell.foundry_icon || getGenericIcon(spell, 'spell'),
              system: {
                description: spell.description || "",
                school: spell.school || "",
                subschool: spell.subschool || "",
                charge: spell.charge || "",
                duration: spell.duration || "Instantaneous",
                range: spell.range || "Self",
                checkToCast: spell.checkToCast || 4,
                components: spell.components || [],
                ritualDuration: spell.ritualDuration || "",
                concentration: spell.concentration || false,
                reaction: spell.reaction || false,
                energy: spell.energy || 1,
                damage: spell.damage || 0,
                damageType: spell.damageType || "",
                fizzled: false,
                foundry_icon: spell.foundry_icon || ''
              },
              flags: {
                anyventure: {
                  version: "1.0.0",
                  originalId: spell._id ? spell._id.toString() : ""
                }
              }
            };
            baseFoundryDoc.items.push(spellItem);
          }
        }
      }

      baseFoundryDoc.system = {
        // Creature-specific fields
        creatureTier: data.tier || "standard",
        challengeRating: data.challenge_rating || 1,
        modules: [],
        actions: [], // Keep empty - actions are now items
        conditions: [],
        physicalTraits: {
          size: data.size || "medium",
          creatureType: data.type || "",
          description: data.description || "",
          appearance: data.tactics || ""
        },
        loot: {
          coins: {
            copper: 0,
            silver: 0,
            gold: 0
          },
          items: data.loot || []
        },
        behavior: {
          aggressive: true,
          territorial: false,
          pack: false,
          intelligent: data.attributes?.knowledge?.talent > 0 || true
        },
        biography: data.tactics || "",
        spells: [], // Keep empty - spells are now items

        // Base template fields (inherited by NPCs)
        attributes: {
          physique: {
            value: data.attributes?.physique?.talent || 1,
            min: 1,
            max: 5
          },
          finesse: {
            value: data.attributes?.finesse?.talent || 1,
            min: 1,
            max: 5
          },
          mind: {
            value: data.attributes?.mind?.talent || 1,
            min: 1,
            max: 5
          },
          knowledge: {
            value: data.attributes?.knowledge?.talent || 1,
            min: 1,
            max: 5
          },
          social: {
            value: data.attributes?.social?.talent || 1,
            min: 1,
            max: 5
          }
        },
        resources: {
          health: {
            value: data.health?.current || 10,
            max: data.health?.max || 10,
            temp: 0
          },
          resolve: {
            value: data.resolve?.current || 5,
            max: data.resolve?.max || 5,
            temp: 0
          },
          morale: {
            value: 0,
            max: 0,
            temp: 0
          },
          energy: {
            value: data.energy?.current || 5,
            max: data.energy?.max || 5,
            temp: 0
          }
        },
        movement: {
          walk: data.movement?.walk || data.movement || 5,
          swim: data.movement?.swim || 0,
          climb: data.movement?.climb || 0,
          fly: data.movement?.fly || 0
        },
        mitigation: data.mitigation || {
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
        detection: data.detections || {
          normal: 8,
          darksight: 0,
          infravision: 0,
          deadsight: 0,
          echolocation: 0,
          tremorsense: 0,
          truesight: 0,
          aethersight: 0
        },
        immunity: data.immunities || {
          afraid: false,
          bleeding: false,
          blinded: false,
          broken: false,
          charmed: false,
          confused: false,
          dazed: false,
          deafened: false,
          diseased: false,
          hidden: false,
          ignited: false,
          impaired: false,
          incapacitated: false,
          maddened: false,
          muted: false,
          numbed: false,
          poisoned: false,
          prone: false,
          stunned: false,
          winded: false
        },

        // Skills template fields (flattened into system, matching character export)
        basic: {
          fitness: {
            value: data.skills?.fitness?.value || data.skills?.fitness || 0,
            tier: data.skills?.fitness?.tier || 0,
            attribute: "physique"
          },
          deflection: {
            value: data.skills?.deflection?.value || data.skills?.deflection || 0,
            tier: data.skills?.deflection?.tier || 0,
            attribute: "physique"
          },
          might: {
            value: data.skills?.might?.value || data.skills?.might || 0,
            tier: data.skills?.might?.tier || 0,
            attribute: "physique"
          },
          endurance: {
            value: data.skills?.endurance?.value || data.skills?.endurance || 0,
            tier: data.skills?.endurance?.tier || 0,
            attribute: "physique"
          },
          evasion: {
            value: data.skills?.evasion?.value || data.skills?.evasion || 0,
            tier: data.skills?.evasion?.tier || 0,
            attribute: "finesse"
          },
          stealth: {
            value: data.skills?.stealth?.value || data.skills?.stealth || 0,
            tier: data.skills?.stealth?.tier || 0,
            attribute: "finesse"
          },
          coordination: {
            value: data.skills?.coordination?.value || data.skills?.coordination || 0,
            tier: data.skills?.coordination?.tier || 0,
            attribute: "finesse"
          },
          thievery: {
            value: data.skills?.thievery?.value || data.skills?.thievery || 0,
            tier: data.skills?.thievery?.tier || 0,
            attribute: "finesse"
          },
          resilience: {
            value: data.skills?.resilience?.value || data.skills?.resilience || 0,
            tier: data.skills?.resilience?.tier || 0,
            attribute: "mind"
          },
          concentration: {
            value: data.skills?.concentration?.value || data.skills?.concentration || 0,
            tier: data.skills?.concentration?.tier || 0,
            attribute: "mind"
          },
          senses: {
            value: data.skills?.senses?.value || data.skills?.senses || 0,
            tier: data.skills?.senses?.tier || 0,
            attribute: "mind"
          },
          logic: {
            value: data.skills?.logic?.value || data.skills?.logic || 0,
            tier: data.skills?.logic?.tier || 0,
            attribute: "mind"
          },
          wildcraft: {
            value: data.skills?.wildcraft?.value || data.skills?.wildcraft || 0,
            tier: data.skills?.wildcraft?.tier || 0,
            attribute: "knowledge"
          },
          academics: {
            value: data.skills?.academics?.value || data.skills?.academics || 0,
            tier: data.skills?.academics?.tier || 0,
            attribute: "knowledge"
          },
          magic: {
            value: data.skills?.magic?.value || data.skills?.magic || 0,
            tier: data.skills?.magic?.tier || 0,
            attribute: "knowledge"
          },
          medicine: {
            value: data.skills?.medicine?.value || data.skills?.medicine || 0,
            tier: data.skills?.medicine?.tier || 0,
            attribute: "knowledge"
          },
          expression: {
            value: data.skills?.expression?.value || data.skills?.expression || 0,
            tier: data.skills?.expression?.tier || 0,
            attribute: "social"
          },
          presence: {
            value: data.skills?.presence?.value || data.skills?.presence || 0,
            tier: data.skills?.presence?.tier || 0,
            attribute: "social"
          },
          insight: {
            value: data.skills?.insight?.value || data.skills?.insight || 0,
            tier: data.skills?.insight?.tier || 0,
            attribute: "social"
          },
          persuasion: {
            value: data.skills?.persuasion?.value || data.skills?.persuasion || 0,
            tier: data.skills?.persuasion?.tier || 0,
            attribute: "social"
          }
        },
        weapon: {
          brawling: {
            value: 0,
            talent: 1
          },
          throwing: {
            value: 0,
            talent: 1
          },
          simpleMeleeWeapons: {
            value: 0,
            talent: 1
          },
          simpleRangedWeapons: {
            value: 0,
            talent: 1
          },
          complexMeleeWeapons: {
            value: 0,
            talent: 0
          },
          complexRangedWeapons: {
            value: 0,
            talent: 0
          }
        },
        magic: {
          black: {
            value: 0,
            talent: 0
          },
          primal: {
            value: 0,
            talent: 0
          },
          metamagic: {
            value: 0,
            talent: 0
          },
          divine: {
            value: 0,
            talent: 0
          },
          mysticism: {
            value: 0,
            talent: 0
          }
        },
        crafting: {
          engineering: {
            value: 0,
            talent: 0
          },
          fabrication: {
            value: 0,
            talent: 0
          },
          alchemy: {
            value: 0,
            talent: 0
          },
          cooking: {
            value: 0,
            talent: 0
          },
          glyphcraft: {
            value: 0,
            talent: 0
          },
          bioshaping: {
            value: 0,
            talent: 0
          }
        },
        music: {
          percussion: {
            value: 0,
            talent: 0
          },
          strings: {
            value: 0,
            talent: 0
          },
          wind: {
            value: 0,
            talent: 0
          },
          vocals: {
            value: 0,
            talent: 0
          },
          brass: {
            value: 0,
            talent: 0
          }
        }
      };
      break;

    default:
      baseFoundryDoc.system = data;
  }

  return baseFoundryDoc;
};

// Get all modules for Foundry
router.get('/modules', async (req, res) => {
  try {
    const modules = await Module.find({});
    const foundryModules = modules.map(module => convertToFoundryFormat(module.toObject(), 'module'));

    res.json({
      type: 'compendium-data',
      documentType: 'Item', // Or whatever Foundry document type you use
      data: foundryModules,
      metadata: {
        count: foundryModules.length,
        version: "1.0.0",
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching modules for Foundry:', error);
    res.status(500).json({ error: 'Failed to fetch modules' });
  }
});

// Get all ancestries for Foundry
router.get('/ancestries', async (req, res) => {
  try {
    const ancestries = await Ancestry.find({});
    const foundryAncestries = ancestries.map(ancestry => convertToFoundryFormat(ancestry.toObject(), 'ancestry'));

    res.json({
      type: 'compendium-data',
      documentType: 'Item',
      data: foundryAncestries,
      metadata: {
        count: foundryAncestries.length,
        version: "1.0.0",
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching ancestries for Foundry:', error);
    res.status(500).json({ error: 'Failed to fetch ancestries' });
  }
});

// Get all cultures for Foundry
router.get('/cultures', async (req, res) => {
  try {
    const cultures = await Culture.find({});
    const foundryCultures = cultures.map(culture => convertToFoundryFormat(culture.toObject(), 'culture'));

    res.json({
      type: 'compendium-data',
      documentType: 'Item',
      data: foundryCultures,
      metadata: {
        count: foundryCultures.length,
        version: "1.0.0",
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching cultures for Foundry:', error);
    res.status(500).json({ error: 'Failed to fetch cultures' });
  }
});

// Get all character traits for Foundry
router.get('/traits', async (req, res) => {
  try {
    const traits = await Trait.find({});
    const foundryTraits = traits.map(trait => convertToFoundryFormat(trait.toObject(), 'trait'));

    res.json({
      type: 'compendium-data',
      documentType: 'Item',
      data: foundryTraits,
      metadata: {
        count: foundryTraits.length,
        version: "1.0.0",
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching traits for Foundry:', error);
    res.status(500).json({ error: 'Failed to fetch traits' });
  }
});

// Get all items for Foundry
router.get('/items', async (req, res) => {
  try {
    const items = await Item.find({});
    const foundryItems = [];
    const errorItems = [];

    for (const item of items) {
      try {
        const foundryItem = convertToFoundryFormat(item.toObject(), 'item');
        foundryItems.push(foundryItem);
      } catch (itemError) {
        console.error(`Error converting item ${item._id}:`, itemError.message);
        errorItems.push({ _id: item._id, name: item.name, error: itemError.message });
      }
    }

    if (errorItems.length > 0) {
      console.error(`Failed to convert ${errorItems.length} items:`, errorItems);
    }

    res.json({
      type: 'compendium-data',
      documentType: 'Item',
      data: foundryItems,
      metadata: {
        count: foundryItems.length,
        version: "1.0.0",
        lastUpdated: new Date().toISOString(),
        errors: errorItems.length > 0 ? errorItems : undefined
      }
    });
  } catch (error) {
    console.error('Error fetching items for Foundry:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Get all spells for Foundry
router.get('/spells', async (req, res) => {
  try {
    const spells = await Spell.find({});
    const foundrySpells = spells.map(spell => convertToFoundryFormat(spell.toObject(), 'spell'));

    res.json({
      type: 'compendium-data',
      documentType: 'Item',
      data: foundrySpells,
      metadata: {
        count: foundrySpells.length,
        version: "1.0.0",
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching spells for Foundry:', error);
    res.status(500).json({ error: 'Failed to fetch spells' });
  }
});

// Get all songs for Foundry
router.get('/songs', async (req, res) => {
  try {
    const songs = await Song.find({});
    const foundrySongs = songs.map(song => convertToFoundryFormat(song.toObject(), 'song'));

    res.json({
      type: 'compendium-data',
      documentType: 'Item',
      data: foundrySongs,
      metadata: {
        count: foundrySongs.length,
        version: "1.0.0",
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching songs for Foundry:', error);
    res.status(500).json({ error: 'Failed to fetch songs' });
  }
});

// Get all languages for Foundry
router.get('/languages', async (req, res) => {
  try {
    const languages = await Language.find({});
    const foundryLanguages = languages.map(language => convertToFoundryFormat(language.toObject(), 'language'));

    res.json({
      type: 'compendium-data',
      documentType: 'Item',
      data: foundryLanguages,
      metadata: {
        count: foundryLanguages.length,
        version: "1.0.0",
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching languages for Foundry:', error);
    res.status(500).json({ error: 'Failed to fetch languages' });
  }
});

// Get all injuries for Foundry
router.get('/injuries', async (req, res) => {
  try {
    const injuries = await Injury.find({});
    const foundryInjuries = injuries.map(injury => convertToFoundryFormat(injury.toObject(), 'injury'));

    res.json({
      type: 'compendium-data',
      documentType: 'Item',
      data: foundryInjuries,
      metadata: {
        count: foundryInjuries.length,
        version: "1.0.0",
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching injuries for Foundry:', error);
    res.status(500).json({ error: 'Failed to fetch injuries' });
  }
});

// Get all creatures for Foundry
router.get('/creatures', async (req, res) => {
  try {
    const creatures = await Creature.find({}).populate('spells');
    const foundryCreatures = creatures.map(creature => convertToFoundryFormat(creature.toObject(), 'creature'));

    res.json({
      type: 'compendium-data',
      documentType: 'Actor',
      data: foundryCreatures,
      metadata: {
        count: foundryCreatures.length,
        version: "1.0.0",
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching creatures for Foundry:', error);
    res.status(500).json({ error: 'Failed to fetch creatures' });
  }
});

// Convert a single creature to Foundry format (for DevCreatureDesigner)
router.post('/convert-creature', async (req, res) => {
  try {
    const creatureData = req.body;

    if (!creatureData || !creatureData.name) {
      return res.status(400).json({ error: 'Invalid creature data' });
    }

    // Convert the creature to Foundry format
    const foundryCreature = convertToFoundryFormat(creatureData, 'creature');

    res.json(foundryCreature);
  } catch (error) {
    console.error('Error converting creature to Foundry format:', error);
    res.status(500).json({ error: 'Failed to convert creature to Foundry format' });
  }
});

// Get all data in one call (for bulk updates)
router.get('/all', async (req, res) => {
  try {
    const [modules, ancestries, cultures, traits, items, spells, songs, languages, injuries, creatures] = await Promise.all([
      Module.find({}),
      Ancestry.find({}),
      Culture.find({}),
      Trait.find({}),
      Item.find({}),
      Spell.find({}),
      Song.find({}),
      Language.find({}),
      Injury.find({}),
      Creature.find({}).populate('spells')
    ]);

    const foundryData = {
      modules: modules.map(m => convertToFoundryFormat(m.toObject(), 'module')),
      ancestries: ancestries.map(a => convertToFoundryFormat(a.toObject(), 'ancestry')),
      cultures: cultures.map(c => convertToFoundryFormat(c.toObject(), 'culture')),
      traits: traits.map(t => convertToFoundryFormat(t.toObject(), 'trait')),
      items: items.filter(i => i.name).map(i => convertToFoundryFormat(i.toObject(), 'item')),
      spells: spells.map(s => convertToFoundryFormat(s.toObject(), 'spell')),
      songs: songs.map(s => convertToFoundryFormat(s.toObject(), 'song')),
      languages: languages.map(l => convertToFoundryFormat(l.toObject(), 'language')),
      injuries: injuries.map(i => convertToFoundryFormat(i.toObject(), 'injury')),
      creatures: creatures.map(c => convertToFoundryFormat(c.toObject(), 'creature'))
    };

    res.json({
      type: 'bulk-compendium-data',
      data: foundryData,
      metadata: {
        counts: {
          modules: foundryData.modules.length,
          ancestries: foundryData.ancestries.length,
          cultures: foundryData.cultures.length,
          traits: foundryData.traits.length,
          items: foundryData.items.length,
          spells: foundryData.spells.length,
          songs: foundryData.songs.length,
          languages: foundryData.languages.length,
          injuries: foundryData.injuries.length,
          creatures: foundryData.creatures.length
        },
        version: "1.0.0",
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching all data for Foundry:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Get datakey.txt content
router.get('/datakey', (req, res) => {
  try {
    const datakeyPath = path.join(__dirname, '../../helper/datakey.txt');
    const datakeyContent = fs.readFileSync(datakeyPath, 'utf8');

    res.json({
      type: 'datakey-reference',
      content: datakeyContent,
      metadata: {
        version: "1.0.0",
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error reading datakey.txt:', error);
    res.status(500).json({ error: 'Failed to read datakey.txt' });
  }
});

// Health check endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'FoundryVTT API endpoints are running',
    version: "1.0.0",
    availableEndpoints: [
      '/fvtt/modules',
      '/fvtt/ancestries',
      '/fvtt/cultures',
      '/fvtt/traits',
      '/fvtt/items',
      '/fvtt/spells',
      '/fvtt/songs',
      '/fvtt/languages',
      '/fvtt/injuries',
      '/fvtt/creatures',
      '/fvtt/all',
      '/fvtt/datakey'
    ]
  });
});

export default router;
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
import Language from '../models/Language.js';
import Injury from '../models/Injury.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to convert MongoDB ObjectId to Foundry-compatible 16-char ID
const convertToFoundryId = (mongoId) => {
  // Take the first 16 characters of the hex string
  // MongoDB ObjectIds are 24 hex chars, Foundry wants 16
  const idString = mongoId.toString();
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
  // If this is an item, trait, module, language, or injury and it has a foundry_icon, use that first
  if ((type === 'item' || type === 'trait' || type === 'module' || type === 'language' || type === 'injury') && data.foundry_icon && data.foundry_icon.trim() !== '') {
    return data.foundry_icon;
  }

  const iconBase = "systems/anyventure/artwork/icons/ui/";

  switch (type) {
    case 'module':
      return `${iconBase}module1.webp`;

    case 'spell':
      return `${iconBase}spell1.webp`;

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

    default:
      return `${iconBase}goods1.webp`;
  }
};

// Helper function to convert web data to Foundry format
const convertToFoundryFormat = (data, type) => {
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
        level: data.level,
        castingTime: data.castingTime,
        range: data.range,
        duration: data.duration,
        components: data.components,
        damage: data.damage,
        effects: data.effects
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
    const foundryItems = items.map(item => convertToFoundryFormat(item.toObject(), 'item'));

    res.json({
      type: 'compendium-data',
      documentType: 'Item',
      data: foundryItems,
      metadata: {
        count: foundryItems.length,
        version: "1.0.0",
        lastUpdated: new Date().toISOString()
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

// Get all data in one call (for bulk updates)
router.get('/all', async (req, res) => {
  try {
    const [modules, ancestries, cultures, traits, items, spells, languages, injuries] = await Promise.all([
      Module.find({}),
      Ancestry.find({}),
      Culture.find({}),
      Trait.find({}),
      Item.find({}),
      Spell.find({}),
      Language.find({}),
      Injury.find({})
    ]);

    const foundryData = {
      modules: modules.map(m => convertToFoundryFormat(m.toObject(), 'module')),
      ancestries: ancestries.map(a => convertToFoundryFormat(a.toObject(), 'ancestry')),
      cultures: cultures.map(c => convertToFoundryFormat(c.toObject(), 'culture')),
      traits: traits.map(t => convertToFoundryFormat(t.toObject(), 'trait')),
      items: items.map(i => convertToFoundryFormat(i.toObject(), 'item')),
      spells: spells.map(s => convertToFoundryFormat(s.toObject(), 'spell')),
      languages: languages.map(l => convertToFoundryFormat(l.toObject(), 'language')),
      injuries: injuries.map(i => convertToFoundryFormat(i.toObject(), 'injury'))
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
          languages: foundryData.languages.length,
          injuries: foundryData.injuries.length
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
      '/fvtt/languages',
      '/fvtt/injuries',
      '/fvtt/all',
      '/fvtt/datakey'
    ]
  });
});

export default router;
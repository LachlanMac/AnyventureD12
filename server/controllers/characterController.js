import Character from '../models/Character.js';
import { applyModuleBonusesToCharacter,extractTraitsFromModules } from '../utils/characterUtils.js';
import { v4 as uuidv4 } from 'uuid';


// @desc    Get all characters for a user
// @route   GET /api/characters
// @access  Private
export const getCharacters = async (req, res) => {
  try {
    // Get the user ID from the authenticated user
    const userId = req.user ? req.user._id : null;
    
    if (!userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    
    // Find characters by userId (stored as string)
    const characters = await Character.find({ 
      userId: userId.toString() 
    })
      .populate('ancestry.ancestryId')
      .populate('characterCulture.cultureId')
      .populate('traits.traitId');
    
    res.json(characters);
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single character (public or owned)
// @route   GET /api/characters/:id
// @access  Private (for owned characters) or Public (for public characters)
export const getCharacter = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;

    // Find character by ID and populate the modules with their data
    const character = await Character.findById(req.params.id)
      .populate('modules.moduleId')
      .populate('inventory.itemId')
      .populate('ancestry.ancestryId')
      .populate('characterCulture.cultureId')
      .populate('traits.traitId');


    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    // Check if character belongs to user or is public
    const isOwner = character.userId === userId?.toString();
    const isPublic = character.public !== false; // Default to true if not set

    if (!isOwner && !isPublic) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Create a copy of the character
    const characterWithBonuses = character.toObject();

    // Apply module bonuses directly to the character's attributes
    applyModuleBonusesToCharacter(characterWithBonuses);
    characterWithBonuses.derivedTraits = extractTraitsFromModules(characterWithBonuses);
    
    
    res.json(characterWithBonuses);
  } catch (error) {
    console.error('Error fetching character:', error);
    res.status(500).json({ message: error.message });
  }
};
// @desc    Create a new character
// @route   POST /api/characters
// @access  Private
export const createCharacter = async (req, res) => {
  try {

    // Get the user ID from the authenticated user
    const userId = req.user ? req.user._id : null;
    
    if (!userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Create a new character
    const characterData = {
      ...req.body,
      userId: userId.toString() // Set the user ID from the authenticated user as string
    };
    
    
    const character = new Character(characterData);
    
    // If a trait is selected, populate it before saving so trait effects apply
    if (character.characterTrait) {
      await character.populate('characterTrait');
    }

    const savedCharacter = await character.save();
    
    
    res.status(201).json(savedCharacter);
  } catch (error) {
    console.error('Error creating character:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: error.message });
  }
};



// @desc    Update a character
// @route   PUT /api/characters/:id
// @access  Private
export const updateCharacter = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    
    
    const character = await Character.findById(req.params.id);
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    // Check ownership
    const isOwner = character.userId === userId?.toString();
                    
    if (!isOwner) {
      return res.status(403).json({ message: 'Access denied' });
    }
    await Character.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    // Re-fetch the character with proper population, like in getCharacter
    const updatedCharacter = await Character.findById(req.params.id)
      .populate('modules.moduleId')
      .populate('inventory.itemId')
      .populate('ancestry.ancestryId')
      .populate('characterCulture.cultureId')
      .populate('traits.traitId');
    
    // Apply module bonuses like in getCharacter
    const characterWithBonuses = updatedCharacter.toObject();
    applyModuleBonusesToCharacter(characterWithBonuses);
    characterWithBonuses.derivedTraits = extractTraitsFromModules(characterWithBonuses);
    
    res.json(characterWithBonuses);
  } catch (error) {
    console.error('Error updating character:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a character
// @route   DELETE /api/characters/:id
// @access  Private
export const deleteCharacter = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    const character = await Character.findById(req.params.id);
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    // Check ownership
    const isOwner = character.userId === userId?.toString();
                    
    if (!isOwner) {
      return res.status(403).json({ message: 'Access denied' });
    }
  
    await Character.findByIdAndDelete(req.params.id);
    res.json({ message: 'Character removed' });
  } catch (error) {
    console.error('Error deleting character:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add item to character inventory
// @route   POST /api/characters/:id/inventory
// @access  Private
export const addItemToInventory = async (req, res) => {
  try {
    const { itemId, quantity = 1 } = req.body;
    const character = await Character.findById(req.params.id);
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    const result = await character.addItem(itemId, quantity);
    
    if (result.success) {
      res.json(character);
    } else {
      res.status(400).json({ message: result.message });
    }
  } catch (error) {
    console.error('Error adding item to inventory:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove item from character inventory
// @route   DELETE /api/characters/:id/inventory/:itemId
// @access  Private
export const removeItemFromInventory = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity = 1 } = req.body;
    const character = await Character.findById(req.params.id);
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    const result = await character.removeItem(itemId, quantity);
    
    if (result.success) {
      res.json(character);
    } else {
      res.status(400).json({ message: result.message });
    }
  } catch (error) {
    console.error('Error removing item from inventory:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Equip item to character equipment slot
// @route   PUT /api/characters/:id/equipment/:slotName
// @access  Private
export const equipItem = async (req, res) => {
  try {
    const { itemId } = req.body;
    const { slotName } = req.params;
    const character = await Character.findById(req.params.id)
      .populate('inventory.itemId');
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    const result = await character.equipItem(itemId, slotName);
    
    if (result.success) {
      // Re-fetch the character with proper population, like in getCharacter
      const updatedCharacter = await Character.findById(req.params.id)
        .populate('modules.moduleId')
        .populate('inventory.itemId')
        .populate('ancestry.ancestryId')
        .populate('characterCulture.cultureId');
      
      // Apply module bonuses and equipment effects
      const characterWithBonuses = updatedCharacter.toObject();
      applyModuleBonusesToCharacter(characterWithBonuses);
      characterWithBonuses.derivedTraits = extractTraitsFromModules(characterWithBonuses);
      
      res.json(characterWithBonuses);
    } else {
      res.status(400).json({ message: result.message });
    }
  } catch (error) {
    console.error('Error equipping item:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unequip item from character equipment slot
// @route   DELETE /api/characters/:id/equipment/:slotName
// @access  Private
export const unequipItem = async (req, res) => {
  try {
    const { slotName } = req.params;
    const character = await Character.findById(req.params.id)
      .populate('inventory.itemId');
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    const result = await character.unequipItem(slotName);
    
    if (result.success) {
      // Re-fetch the character with proper population, like in getCharacter
      const updatedCharacter = await Character.findById(req.params.id)
        .populate('modules.moduleId')
        .populate('inventory.itemId')
        .populate('ancestry.ancestryId')
        .populate('characterCulture.cultureId');
      
      // Apply module bonuses and equipment effects
      const characterWithBonuses = updatedCharacter.toObject();
      applyModuleBonusesToCharacter(characterWithBonuses);
      characterWithBonuses.derivedTraits = extractTraitsFromModules(characterWithBonuses);
      
      res.json(characterWithBonuses);
    } else {
      res.status(400).json({ message: result.message });
    }
  } catch (error) {
    console.error('Error unequipping item:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Customize an item in character inventory
// @route   POST /api/characters/:id/inventory/:index/customize
// @access  Private
export const customizeItem = async (req, res) => {
  try {
    const { index } = req.params;
    const { modifications } = req.body;
    const character = await Character.findById(req.params.id);
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    const result = await character.customizeItem(parseInt(index), modifications);
    
    if (result.success) {
      // Re-fetch the character with proper population, like in getCharacter
      const updatedCharacter = await Character.findById(req.params.id)
        .populate('modules.moduleId')
        .populate('inventory.itemId')
        .populate('ancestry.ancestryId')
        .populate('characterCulture.cultureId');
      
      // Apply module bonuses and equipment effects
      const characterWithBonuses = updatedCharacter.toObject();
      applyModuleBonusesToCharacter(characterWithBonuses);
      characterWithBonuses.derivedTraits = extractTraitsFromModules(characterWithBonuses);
      
      res.json(characterWithBonuses);
    } else {
      res.status(400).json({ message: result.message });
    }
  } catch (error) {
    console.error('Error customizing item:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update item quantity in character inventory
// @route   PUT /api/characters/:id/inventory/:index/quantity
// @access  Private
export const updateItemQuantity = async (req, res) => {
  try {
    const { index } = req.params;
    const { quantity } = req.body;
    const character = await Character.findById(req.params.id);
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    const result = await character.updateItemQuantity(parseInt(index), parseInt(quantity));
    
    if (result.success) {
      // Re-fetch the character with proper population, like in getCharacter
      const updatedCharacter = await Character.findById(req.params.id)
        .populate('modules.moduleId')
        .populate('inventory.itemId')
        .populate('ancestry.ancestryId')
        .populate('characterCulture.cultureId');
      
      // Apply module bonuses and equipment effects
      const characterWithBonuses = updatedCharacter.toObject();
      applyModuleBonusesToCharacter(characterWithBonuses);
      characterWithBonuses.derivedTraits = extractTraitsFromModules(characterWithBonuses);
      
      res.json(characterWithBonuses);
    } else {
      res.status(400).json({ message: result.message });
    }
  } catch (error) {
    console.error('Error updating item quantity:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add trait to character with selected options
// @route   POST /api/characters/:id/traits
// @access  Private
export const addTrait = async (req, res) => {
  try {
    const { traitId, selectedOptions } = req.body;
    const character = await Character.findById(req.params.id);

    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    // Check if trait already exists
    const existingTrait = character.traits.find(t => t.traitId.toString() === traitId);
    if (existingTrait) {
      return res.status(400).json({ message: 'Trait already added to character' });
    }

    // Add trait with selected options
    character.traits.push({
      traitId,
      selectedOptions: selectedOptions || [],
      dateAdded: Date.now()
    });

    await character.save();

    // Re-fetch with populations
    const updatedCharacter = await Character.findById(req.params.id)
      .populate('modules.moduleId')
      .populate('inventory.itemId')
      .populate('ancestry.ancestryId')
      .populate('characterCulture.cultureId')
      .populate('traits.traitId');

    // Apply bonuses
    const characterWithBonuses = updatedCharacter.toObject();
    applyModuleBonusesToCharacter(characterWithBonuses);
    characterWithBonuses.derivedTraits = extractTraitsFromModules(characterWithBonuses);

    res.json(characterWithBonuses);
  } catch (error) {
    console.error('Error adding trait:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove trait from character
// @route   DELETE /api/characters/:id/traits/:traitId
// @access  Private
export const removeTrait = async (req, res) => {
  try {
    const { traitId } = req.params;
    const character = await Character.findById(req.params.id);

    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    // Find and remove the trait
    const traitIndex = character.traits.findIndex(t => t.traitId.toString() === traitId);
    if (traitIndex === -1) {
      return res.status(404).json({ message: 'Trait not found on character' });
    }

    character.traits.splice(traitIndex, 1);
    await character.save();

    // Re-fetch with populations
    const updatedCharacter = await Character.findById(req.params.id)
      .populate('modules.moduleId')
      .populate('inventory.itemId')
      .populate('ancestry.ancestryId')
      .populate('characterCulture.cultureId')
      .populate('traits.traitId');

    // Apply bonuses
    const characterWithBonuses = updatedCharacter.toObject();
    applyModuleBonusesToCharacter(characterWithBonuses);
    characterWithBonuses.derivedTraits = extractTraitsFromModules(characterWithBonuses);

    res.json(characterWithBonuses);
  } catch (error) {
    console.error('Error removing trait:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update trait options/subchoices
// @route   PUT /api/characters/:id/traits/:traitId
// @access  Private
export const updateTraitOptions = async (req, res) => {
  try {
    const { traitId } = req.params;
    const { selectedOptions } = req.body;
    const character = await Character.findById(req.params.id);

    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    // Find the trait
    const trait = character.traits.find(t => t.traitId.toString() === traitId);
    if (!trait) {
      return res.status(404).json({ message: 'Trait not found on character' });
    }

    // Update selected options
    trait.selectedOptions = selectedOptions || [];
    await character.save();

    // Re-fetch with populations
    const updatedCharacter = await Character.findById(req.params.id)
      .populate('modules.moduleId')
      .populate('inventory.itemId')
      .populate('ancestry.ancestryId')
      .populate('characterCulture.cultureId')
      .populate('traits.traitId');

    // Apply bonuses
    const characterWithBonuses = updatedCharacter.toObject();
    applyModuleBonusesToCharacter(characterWithBonuses);
    characterWithBonuses.derivedTraits = extractTraitsFromModules(characterWithBonuses);

    res.json(characterWithBonuses);
  } catch (error) {
    console.error('Error updating trait options:', error);
    res.status(500).json({ message: error.message });
  }
};

// Helper function to convert MongoDB ObjectId to Foundry-compatible 16-char ID
const convertToFoundryId = (mongoId) => {
  const idString = mongoId.toString();
  return idString.substring(0, 16);
};

// Helper function to get icon based on type and properties (reuse from foundryRoutes.js)
const getGenericIcon = (data, type) => {
  // For items, check for foundry_icon first
  if (type === 'item' && data.foundry_icon && data.foundry_icon.trim() !== '') {
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

      return `${iconBase}goods1.webp`;
    default:
      return `${iconBase}goods1.webp`;
  }
};

// @desc    Export character to FoundryVTT JSON format
// @route   GET /api/characters/:id/export-foundry
// @access  Private
export const exportCharacterToFoundry = async (req, res) => {
  try {
    const character = await Character.findById(req.params.id)
      .populate('modules.moduleId')
      .populate('spells.spellId')
      .populate('ancestry.ancestryId')
      .populate('characterCulture.cultureId')
      .populate('traits.traitId')
      .populate('inventory.itemId');

    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    // Check if user owns this character or if it's public
    if (character.userId !== req.user._id.toString() && !character.public) {
      return res.status(403).json({ message: 'Not authorized to export this character' });
    }

    // Apply bonuses to get computed values
    const characterWithBonuses = character.toObject();
    applyModuleBonusesToCharacter(characterWithBonuses);

    // Create FoundryVTT actor structure matching our new template.json
    const foundryActor = {
      _id: character.foundry_id || convertToFoundryId(character._id),
      name: character.name,
      type: "character",
      img: character.portraitUrl || "icons/svg/mystery-man.svg",
      system: {
        // Core attributes
        attributes: {
          physique: { value: character.attributes.physique, min: 1, max: 5 },
          finesse: { value: character.attributes.finesse, min: 1, max: 5 },
          mind: { value: character.attributes.mind, min: 1, max: 5 },
          knowledge: { value: character.attributes.knowledge, min: 1, max: 5 },
          social: { value: character.attributes.social, min: 1, max: 5 }
        },

        // Resources - preserve current values, max will be calculated in FoundryVTT
        resources: {
          health: {
            value: character.resources?.health?.current || 0,
            max: character.resources?.health?.max || 0, // Include current max but FoundryVTT will recalculate
            temp: 0
          },
          resolve: {
            value: character.resources?.resolve?.current || 0,
            max: character.resources?.resolve?.max || 0, // Include current max but FoundryVTT will recalculate
            temp: 0
          },
          morale: {
            value: character.resources?.morale?.current || 0,
            max: character.resources?.morale?.max || 0, // Include current max but FoundryVTT will recalculate
            temp: 0
          },
          energy: {
            value: character.resources?.energy?.current || 5,
            max: character.resources?.energy?.max || 5, // Include current max but FoundryVTT will recalculate
            temp: 0
          }
        },

        // Movement - base value only, bonuses will be calculated in FoundryVTT
        movement: {
          standard: 5, // Base movement, bonuses will be added in FoundryVTT
          current: 5,
          swim: 0,
          climb: 0,
          fly: 0
        },

        // Mitigation - base values only, bonuses will be calculated in FoundryVTT
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

        // Skills (now matching template.json structure)
        basic: {
          fitness: { value: character.skills?.fitness?.value || 0, attribute: "physique" },
          deflection: { value: character.skills?.deflection?.value || 0, attribute: "physique" },
          might: { value: character.skills?.might?.value || 0, attribute: "physique" },
          endurance: { value: character.skills?.endurance?.value || 0, attribute: "physique" },
          evasion: { value: character.skills?.evasion?.value || 0, attribute: "finesse" },
          stealth: { value: character.skills?.stealth?.value || 0, attribute: "finesse" },
          coordination: { value: character.skills?.coordination?.value || 0, attribute: "finesse" },
          thievery: { value: character.skills?.thievery?.value || 0, attribute: "finesse" },
          resilience: { value: character.skills?.resilience?.value || 0, attribute: "mind" },
          concentration: { value: character.skills?.concentration?.value || 0, attribute: "mind" },
          senses: { value: character.skills?.senses?.value || 0, attribute: "mind" },
          logic: { value: character.skills?.logic?.value || 0, attribute: "mind" },
          wildcraft: { value: character.skills?.wildcraft?.value || 0, attribute: "knowledge" },
          academics: { value: character.skills?.academics?.value || 0, attribute: "knowledge" },
          magic: { value: character.skills?.magic?.value || 0, attribute: "knowledge" },
          medicine: { value: character.skills?.medicine?.value || 0, attribute: "knowledge" },
          expression: { value: character.skills?.expression?.value || 0, attribute: "social" },
          presence: { value: character.skills?.presence?.value || 0, attribute: "social" },
          insight: { value: character.skills?.insight?.value || 0, attribute: "social" },
          persuasion: { value: character.skills?.persuasion?.value || 0, attribute: "social" }
        },

        // Weapon skills
        weapon: {
          unarmed: {
            value: character.weaponSkills?.unarmed?.value || 0,
            talent: character.weaponSkills?.unarmed?.talent || 1
          },
          throwing: {
            value: character.weaponSkills?.throwing?.value || 0,
            talent: character.weaponSkills?.throwing?.talent || 1
          },
          simpleMeleeWeapons: {
            value: character.weaponSkills?.simpleMeleeWeapons?.value || 0,
            talent: character.weaponSkills?.simpleMeleeWeapons?.talent || 1
          },
          simpleRangedWeapons: {
            value: character.weaponSkills?.simpleRangedWeapons?.value || 0,
            talent: character.weaponSkills?.simpleRangedWeapons?.talent || 1
          },
          complexMeleeWeapons: {
            value: character.weaponSkills?.complexMeleeWeapons?.value || 0,
            talent: character.weaponSkills?.complexMeleeWeapons?.talent || 0
          },
          complexRangedWeapons: {
            value: character.weaponSkills?.complexRangedWeapons?.value || 0,
            talent: character.weaponSkills?.complexRangedWeapons?.talent || 0
          }
        },

        // Magic skills
        magic: {
          black: {
            value: character.magicSkills?.black?.value || 0,
            talent: character.magicSkills?.black?.talent || 0
          },
          primal: {
            value: character.magicSkills?.primal?.value || 0,
            talent: character.magicSkills?.primal?.talent || 0
          },
          metamagic: {
            value: character.magicSkills?.metamagic?.value || 0,
            talent: character.magicSkills?.metamagic?.talent || 0
          },
          divine: {
            value: character.magicSkills?.divine?.value || 0,
            talent: character.magicSkills?.divine?.talent || 0
          },
          mysticism: {
            value: character.magicSkills?.mysticism?.value || 0,
            talent: character.magicSkills?.mysticism?.talent || 0
          }
        },

        // Crafting skills
        crafting: {
          engineering: {
            value: character.craftingSkills?.engineering?.value || 0,
            talent: character.craftingSkills?.engineering?.talent || 0
          },
          fabrication: {
            value: character.craftingSkills?.fabrication?.value || 0,
            talent: character.craftingSkills?.fabrication?.talent || 0
          },
          alchemy: {
            value: character.craftingSkills?.alchemy?.value || 0,
            talent: character.craftingSkills?.alchemy?.talent || 0
          },
          cooking: {
            value: character.craftingSkills?.cooking?.value || 0,
            talent: character.craftingSkills?.cooking?.talent || 0
          },
          glyphcraft: {
            value: character.craftingSkills?.glyphcraft?.value || 0,
            talent: character.craftingSkills?.glyphcraft?.talent || 0
          },
          bioshaping: {
            value: character.craftingSkills?.bioshaping?.value || 0,
            talent: character.craftingSkills?.bioshaping?.talent || 0
          }
        },

        // Language skills
        language: {
          common: { value: 3, talent: 0 }
        },

        // Music skills
        music: {
          percussion: {
            value: character.musicSkills?.percussion || 0,
            talent: 0
          },
          strings: {
            value: character.musicSkills?.strings || 0,
            talent: 0
          },
          wind: {
            value: character.musicSkills?.wind || 0,
            talent: 0
          },
          vocals: {
            value: character.musicSkills?.vocal || 0,
            talent: 0
          }
        },

        // Character details
        details: {
          race: character.ancestry?.ancestryId?.name || character.race || "",
          culture: character.characterCulture?.cultureId?.name || character.culture || "",
          biography: character.biography || "",
          appearance: character.appearance || "",
          portraitUrl: character.portraitUrl || ""
        },

        // Character creation info
        characterCreation: {
          attributePointsRemaining: character.characterCreation?.attributePointsRemaining || 0,
          talentStarsRemaining: character.characterCreation?.talentStarsRemaining || 0
        },

        // Module points
        modulePoints: {
          total: character.modulePoints?.total || 0,
          spent: character.modulePoints?.spent || 0,
          available: (character.modulePoints?.total || 0) - (character.modulePoints?.spent || 0)
        },

        // Spell slots
        spellSlots: {
          current: character.spells?.length || 0,
          max: character.spellSlots || 10
        },

        // Languages array
        languages: character.languages || [],
        immunities: [],
        vision: [],

        // Physical traits
        physicalTraits: {
          size: character.physicalTraits?.size || "",
          weight: character.physicalTraits?.weight || "",
          height: character.physicalTraits?.height || "",
          gender: character.physicalTraits?.gender || ""
        },

        // Arrays for complex data
        modules: [],
        spells: [],
        actions: character.actions || [],
        conditions: []
      },
      items: [],
      effects: [],
      flags: {
        anyventure: {
          originalId: character._id.toString(),
          exportedAt: new Date().toISOString()
        }
      },
      ownership: {
        default: 0
      },
      _stats: {
        systemId: "anyventure",
        systemVersion: "1.0.0",
        coreVersion: "13",
        createdTime: Date.now(),
        modifiedTime: Date.now(),
        lastModifiedBy: character.foundry_id || convertToFoundryId(character._id) // Use a valid 16-char ID
      }
    };

    // Convert modules to items using new format
    if (character.modules) {
      for (const charModule of character.modules) {
        if (charModule.moduleId) {
          const moduleItem = {
            _id: charModule.moduleId.foundry_id,
            name: charModule.moduleId.name,
            type: "module",
            img: getGenericIcon(charModule.moduleId, 'module'),
            system: {
              description: charModule.moduleId.description || "",
              mtype: charModule.moduleId.mtype || "core",
              ruleset: charModule.moduleId.ruleset || 1,
              options: charModule.moduleId.options || []
            },
            effects: [],
            flags: {
              anyventure: {
                originalId: charModule.moduleId._id.toString(),
                selectedOptions: charModule.selectedOptions || []
              }
            },
            ownership: { default: 0 }
          };

          foundryActor.items.push(moduleItem);
        }
      }
    }

    // Convert spells to items using new format
    if (character.spells) {
      for (const charSpell of character.spells) {
        if (charSpell.spellId) {
          const spellItem = {
            _id: charSpell.spellId.foundry_id,
            name: charSpell.spellId.name,
            type: "spell",
            img: getGenericIcon(charSpell.spellId, 'spell'),
            system: {
              description: charSpell.spellId.description || "",
              school: charSpell.spellId.school || "",
              level: charSpell.spellId.level || 1,
              castingTime: charSpell.spellId.castingTime || "",
              range: charSpell.spellId.range || "",
              duration: charSpell.spellId.duration || "",
              components: charSpell.spellId.components || "",
              damage: charSpell.spellId.damage || "",
              effects: charSpell.spellId.effects || []
            },
            effects: [],
            flags: {
              anyventure: {
                originalId: charSpell.spellId._id.toString(),
                favorite: charSpell.favorite || false,
                dateAdded: charSpell.dateAdded,
                notes: charSpell.notes || ""
              }
            },
            ownership: { default: 0 }
          };

          foundryActor.items.push(spellItem);
        }
      }
    }

    // Convert inventory items using new format
    if (character.inventory) {
      for (const invItem of character.inventory) {
        const item = invItem.isCustomized ? invItem.itemData : invItem.itemId;
        if (item) {
          const foundryItem = {
            _id: item.foundry_id,
            name: item.name,
            type: "item", // All items are now type "item"
            img: getGenericIcon(item, 'item'),
            system: {
              description: item.description || "",
              itemType: item.type, // Store the specific item type
              weight: item.weight || 0,
              value: item.value || 0,
              rarity: item.rarity || "common",
              weapon_category: item.weapon_category,
              hands: item.hands,
              shield_category: item.shield_category,
              consumable_category: item.consumable_category,
              primary: item.primary,
              secondary: item.secondary,
              bonus_attack: item.bonus_attack,
              encumbrance_penalty: item.encumbrance_penalty,
              health: item.health,
              energy: item.energy,
              resolve: item.resolve,
              movement: item.movement,
              attributes: item.attributes,
              basic: item.basic,
              weapon: item.weapon,
              magic: item.magic,
              craft: item.craft,
              mitigation: item.mitigation,
              detections: item.detections,
              immunities: item.immunities,
              effects: item.effects,
              properties: item.properties
            },
            effects: [],
            flags: {
              anyventure: {
                originalId: item._id.toString(),
                quantity: invItem.quantity || 1,
                condition: invItem.condition,
                dateAdded: invItem.dateAdded,
                notes: invItem.notes || "",
                isCustomized: invItem.isCustomized
              }
            },
            ownership: { default: 0 }
          };

          foundryActor.items.push(foundryItem);
        }
      }
    }

    // Add ancestry and culture as items if they exist
    if (character.ancestry?.ancestryId) {
      const ancestryItem = {
        _id: character.ancestry.ancestryId.foundry_id,
        name: character.ancestry.ancestryId.name,
        type: "ancestry",
        img: getGenericIcon(character.ancestry.ancestryId, 'ancestry'),
        system: {
          description: character.ancestry.ancestryId.description || "",
          source: character.ancestry.ancestryId.source || "",
          homeworld: character.ancestry.ancestryId.homeworld || "",
          lifespan: character.ancestry.ancestryId.lifespan || "",
          height: character.ancestry.ancestryId.height || "",
          size: character.ancestry.ancestryId.size || "",
          home: character.ancestry.ancestryId.home || "",
          language: character.ancestry.ancestryId.language || "",
          options: character.ancestry.ancestryId.options || []
        },
        flags: {
          anyventure: {
            originalId: character.ancestry.ancestryId._id.toString(),
            selectedOptions: character.ancestry.selectedOptions || []
          }
        },
        ownership: { default: 0 }
      };
      foundryActor.items.push(ancestryItem);
    }

    if (character.characterCulture?.cultureId) {
      const cultureItem = {
        _id: character.characterCulture.cultureId.foundry_id,
        name: character.characterCulture.cultureId.name,
        type: "culture",
        img: getGenericIcon(character.characterCulture.cultureId, 'culture'),
        system: {
          description: character.characterCulture.cultureId.description || "",
          culturalRestrictions: character.characterCulture.cultureId.culturalRestrictions || [],
          benefits: character.characterCulture.cultureId.benefits || [],
          startingItems: character.characterCulture.cultureId.startingItems || [],
          options: character.characterCulture.cultureId.options || []
        },
        flags: {
          anyventure: {
            originalId: character.characterCulture.cultureId._id.toString(),
            selectedRestriction: character.characterCulture.selectedRestriction,
            selectedBenefit: character.characterCulture.selectedBenefit,
            selectedStartingItem: character.characterCulture.selectedStartingItem
          }
        },
        ownership: { default: 0 }
      };
      foundryActor.items.push(cultureItem);
    }

    // Set response headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${character.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_foundry.json"`);

    res.json(foundryActor);

  } catch (error) {
    console.error('Error exporting character to FoundryVTT:', error);
    res.status(500).json({ message: error.message });
  }
};
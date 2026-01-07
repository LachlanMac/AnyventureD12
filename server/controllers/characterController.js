import Character from '../models/Character.js';
import Item from '../models/Item.js';
import Trait from '../models/Trait.js';
import { applyModuleBonusesToCharacter,extractTraitsFromModules } from '../utils/characterUtils.js';
import { generateRandomCharacterData } from '../utils/randomCharacterGenerator.js';
import { generateFoundryId } from '../utils/foundryIdGenerator.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

// Helper function to expand trait/ancestry options with subchoices
const expandTraitOptions = (options) => {
  if (!options) return [];

  const expandedOptions = [];

  for (const option of options) {
    // Add the main option
    const plainOption = option.toObject ? option.toObject() : option;
    const mainOption = {
      _id: plainOption._id,
      name: plainOption.name,
      description: plainOption.description,
      data: plainOption.data,
      selected: plainOption.selected || false,
      requiresChoice: plainOption.requiresChoice || false,
      choiceType: plainOption.choiceType || ""
    };
    expandedOptions.push(mainOption);

    // Add subchoices as separate options
    if (plainOption.subchoices && plainOption.subchoices.length > 0) {
      for (const subchoice of plainOption.subchoices) {
        const subchoiceOption = {
          _id: subchoice.id || subchoice._id,
          name: subchoice.name,
          description: subchoice.description,
          data: subchoice.data || "",
          selected: false,
          isSubchoice: true,
          parentOption: plainOption.name
        };
        expandedOptions.push(subchoiceOption);
      }
    }
  }

  return expandedOptions;
};

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
      .populate('modules.moduleId')
      .populate('ancestry.ancestryId')
      .populate('characterCulture.cultureId')
      .populate('traits.traitId');

    // Apply module bonuses to each character
    const charactersWithBonuses = characters.map(character => {
      const characterWithBonuses = character.toObject();
      applyModuleBonusesToCharacter(characterWithBonuses);
      characterWithBonuses.derivedTraits = extractTraitsFromModules(characterWithBonuses);

      // Set deprecated race and culture fields from populated data for frontend compatibility
      if (characterWithBonuses.ancestry?.ancestryId?.name) {
        characterWithBonuses.race = characterWithBonuses.ancestry.ancestryId.name;
      }
      if (characterWithBonuses.characterCulture?.cultureId?.name) {
        characterWithBonuses.culture = characterWithBonuses.characterCulture.cultureId.name;
      }

      return characterWithBonuses;
    });

    res.json(charactersWithBonuses);
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

    // Recalculate module points to ensure accuracy
    const recalcResult = character.recalculateModulePoints();
    if (recalcResult.corrected) {
      console.log(`Module points corrected for character ${character.name}: ${recalcResult.previousSpent} -> ${recalcResult.calculatedSpent}`);
      await character.save();
    }

    // Create a copy of the character
    const characterWithBonuses = character.toObject();

    // Reset all skill/weapon/magic/crafting values to 0 to recalculate fresh
    // This fixes characters that had bonuses baked in from the old double-application bug
    Object.keys(characterWithBonuses.skills || {}).forEach(skill => {
      if (characterWithBonuses.skills[skill]) {
        characterWithBonuses.skills[skill].value = 0;
      }
    });
    Object.keys(characterWithBonuses.weaponSkills || {}).forEach(skill => {
      if (characterWithBonuses.weaponSkills[skill]) {
        characterWithBonuses.weaponSkills[skill].value = 0;
      }
    });
    Object.keys(characterWithBonuses.magicSkills || {}).forEach(skill => {
      if (characterWithBonuses.magicSkills[skill]) {
        characterWithBonuses.magicSkills[skill].value = 0;
      }
    });
    Object.keys(characterWithBonuses.craftingSkills || {}).forEach(skill => {
      if (characterWithBonuses.craftingSkills[skill]) {
        characterWithBonuses.craftingSkills[skill].value = 0;
      }
    });

    // Reset resources to base values to recalculate fresh
    // This fixes the double-application of trait bonuses like Born to Adventure
    if (characterWithBonuses.resources) {
      if (characterWithBonuses.resources.health) {
        characterWithBonuses.resources.health.max = 20;
      }
      if (characterWithBonuses.resources.resolve) {
        characterWithBonuses.resources.resolve.max = 20;
      }
      if (characterWithBonuses.resources.morale) {
        characterWithBonuses.resources.morale.max = 10;
      }
      if (characterWithBonuses.resources.energy) {
        characterWithBonuses.resources.energy.max = 5;
      }
    }

    // Reset other values that can be modified by bonuses
    characterWithBonuses.movement = 5;
    characterWithBonuses.initiative = 0;
    characterWithBonuses.spellSlots = 10;

    // Reset mitigation to 0 for all damage types
    characterWithBonuses.mitigation = {
      physical: 0,
      cold: 0,
      heat: 0,
      electric: 0,
      psychic: 0,
      dark: 0,
      divine: 0,
      aetheric: 0,
      toxic: 0
    };

    // Apply module bonuses directly to the character's attributes
    applyModuleBonusesToCharacter(characterWithBonuses);
    characterWithBonuses.derivedTraits = extractTraitsFromModules(characterWithBonuses);

    // Set deprecated race and culture fields from populated data for frontend compatibility
    if (characterWithBonuses.ancestry?.ancestryId?.name) {
      characterWithBonuses.race = characterWithBonuses.ancestry.ancestryId.name;
    }
    if (characterWithBonuses.characterCulture?.cultureId?.name) {
      characterWithBonuses.culture = characterWithBonuses.characterCulture.cultureId.name;
    }

    res.json(characterWithBonuses);
  } catch (error) {
    console.error('Error fetching character:', error);
    res.status(500).json({ message: error.message });
  }
};

// Helper function to load starting gear pack
const loadStartingGear = async (tier, pack) => {
  if (!tier || !pack) return null;

  try {
    const gearFilePath = path.join(process.cwd(), 'data', 'gear', tier, `${pack}.json`);

    if (!fs.existsSync(gearFilePath)) {
      console.error(`Gear file not found: ${gearFilePath}`);
      return null;
    }

    const gearData = JSON.parse(fs.readFileSync(gearFilePath, 'utf8'));
    return gearData;
  } catch (error) {
    console.error('Error loading starting gear:', error);
    return null;
  }
};

// Helper function to apply starting gear to character
const applyStartingGear = async (character, startingGearTier, startingGearPack) => {
  const gearData = await loadStartingGear(startingGearTier, startingGearPack);

  if (!gearData) return character;

  console.log(`Applying starting gear: ${gearData.name}`);

  // Add coins
  if (gearData.gold) character.wealth.gold += gearData.gold;
  if (gearData.silver) character.wealth.silver += gearData.silver;

  // Process items
  if (gearData.items && gearData.items.length > 0) {
    for (const gearItem of gearData.items) {
      try {
        // Find the item in the database by name
        const dbItem = await Item.findOne({ name: gearItem.base_item });

        if (dbItem) {
          // Create character item with the found database item
          const characterItem = {
            _id: uuidv4(),
            name: dbItem.name,
            description: dbItem.description,
            type: dbItem.type,
            subtype: dbItem.subtype,
            price: dbItem.price,
            weight: dbItem.weight,
            data: dbItem.data,
            quantity: gearItem.quantity || 1,
            equipped: false,
            source: 'starting_gear'
          };

          character.inventory.push(characterItem);
          console.log(`Added item: ${characterItem.name} (x${characterItem.quantity})`);
        } else {
          console.warn(`Item not found in database: ${gearItem.base_item}`);
        }
      } catch (error) {
        console.error(`Error adding item ${gearItem.base_item}:`, error);
      }
    }
  }

  return character;
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
    
    // Extract starting gear from request body
    const { startingGearTier, startingGearPack, ...characterData } = req.body;

    // Create character data with user ID
    const finalCharacterData = {
      ...characterData,
      userId: userId.toString() // Set the user ID from the authenticated user as string
    };

    // Ensure languageSkills default is preserved if not provided
    if (!finalCharacterData.languageSkills) {
      finalCharacterData.languageSkills = new Map([['common', 2]]);
    }

    // Ensure default size is set
    if (!finalCharacterData.physicalTraits) {
      finalCharacterData.physicalTraits = {};
    }
    if (!finalCharacterData.physicalTraits.size) {
      finalCharacterData.physicalTraits.size = 'Medium';
    } else {
      // Clean up size value - remove any leading numbers and capitalize (fixes legacy "0large" issue)
      let cleanSize = finalCharacterData.physicalTraits.size.toString().replace(/^\d+/, '');
      cleanSize = cleanSize.charAt(0).toUpperCase() + cleanSize.slice(1);
      finalCharacterData.physicalTraits.size = cleanSize;
    }

    const character = new Character(finalCharacterData);

    // Apply starting gear if provided (before saving)
    // TODO: Implement starting gear system
    // if (startingGearTier && startingGearPack) {
    //   await applyStartingGear(character, startingGearTier, startingGearPack);
    // }

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

    // Recalculate module points to ensure accuracy
    const recalcResult = updatedCharacter.recalculateModulePoints();
    if (recalcResult.corrected) {
      console.log(`Module points corrected for character ${updatedCharacter.name}: ${recalcResult.previousSpent} -> ${recalcResult.calculatedSpent}`);
      await updatedCharacter.save();
    }

    // Apply module bonuses like in getCharacter
    const characterWithBonuses = updatedCharacter.toObject();

    // Reset all skill/weapon/magic/crafting values to 0 to recalculate fresh
    Object.keys(characterWithBonuses.skills || {}).forEach(skill => {
      if (characterWithBonuses.skills[skill]) characterWithBonuses.skills[skill].value = 0;
    });
    Object.keys(characterWithBonuses.weaponSkills || {}).forEach(skill => {
      if (characterWithBonuses.weaponSkills[skill]) characterWithBonuses.weaponSkills[skill].value = 0;
    });
    Object.keys(characterWithBonuses.magicSkills || {}).forEach(skill => {
      if (characterWithBonuses.magicSkills[skill]) characterWithBonuses.magicSkills[skill].value = 0;
    });
    Object.keys(characterWithBonuses.craftingSkills || {}).forEach(skill => {
      if (characterWithBonuses.craftingSkills[skill]) characterWithBonuses.craftingSkills[skill].value = 0;
    });

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

// @desc    Purchase item and add to inventory
// @route   POST /api/characters/:id/purchase-item
// @access  Private
export const purchaseItem = async (req, res) => {
  try {
    const { itemId, quantity = 1 } = req.body;
    const character = await Character.findById(req.params.id);

    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    // Get the item to check its cost
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Calculate total cost (value is in silver per item)
    const totalCostInSilver = (item.value || 0) * quantity;

    // Convert character's wealth to silver
    const totalWealthInSilver = (character.wealth?.gold || 0) * 10 + (character.wealth?.silver || 0);

    // Check if character can afford it
    if (totalWealthInSilver < totalCostInSilver) {
      return res.status(400).json({
        message: 'Insufficient funds',
        required: totalCostInSilver,
        available: totalWealthInSilver
      });
    }

    // Deduct cost from wealth
    const newWealthInSilver = totalWealthInSilver - totalCostInSilver;
    character.wealth.gold = Math.floor(newWealthInSilver / 10);
    character.wealth.silver = newWealthInSilver % 10;

    // Add item to inventory
    const result = await character.addItem(itemId, quantity);

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    await character.save();
    res.json(character);
  } catch (error) {
    console.error('Error purchasing item:', error);
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

    // itemId can be either an actual item ObjectId or an inventory index (as string)
    // For customized items, the frontend sends the inventory index
    const result = await character.equipItem(itemId, slotName);

    if (result.success) {
      // Re-fetch the character with proper population, like in getCharacter
      const updatedCharacter = await Character.findById(req.params.id)
        .populate('modules.moduleId')
        .populate('inventory.itemId')
        .populate('ancestry.ancestryId')
        .populate('characterCulture.cultureId')
        .populate('traits.traitId');

      // Apply module bonuses and equipment effects
      const characterWithBonuses = updatedCharacter.toObject();

      // Reset all skill/weapon/magic/crafting values and diceTierModifiers to recalculate fresh
      Object.keys(characterWithBonuses.skills || {}).forEach(skill => {
        if (characterWithBonuses.skills[skill]) {
          characterWithBonuses.skills[skill].value = 0;
          characterWithBonuses.skills[skill].diceTierModifier = 0;
        }
      });
      Object.keys(characterWithBonuses.weaponSkills || {}).forEach(skill => {
        if (characterWithBonuses.weaponSkills[skill]) {
          characterWithBonuses.weaponSkills[skill].value = 0;
          characterWithBonuses.weaponSkills[skill].diceTierModifier = 0;
        }
      });
      Object.keys(characterWithBonuses.magicSkills || {}).forEach(skill => {
        if (characterWithBonuses.magicSkills[skill]) {
          characterWithBonuses.magicSkills[skill].value = 0;
          characterWithBonuses.magicSkills[skill].diceTierModifier = 0;
        }
      });
      Object.keys(characterWithBonuses.craftingSkills || {}).forEach(skill => {
        if (characterWithBonuses.craftingSkills[skill]) {
          characterWithBonuses.craftingSkills[skill].value = 0;
          characterWithBonuses.craftingSkills[skill].diceTierModifier = 0;
        }
      });

      // Reset resources to base values
      if (characterWithBonuses.resources) {
        if (characterWithBonuses.resources.health) characterWithBonuses.resources.health.max = 20;
        if (characterWithBonuses.resources.resolve) characterWithBonuses.resources.resolve.max = 20;
        if (characterWithBonuses.resources.morale) characterWithBonuses.resources.morale.max = 10;
        if (characterWithBonuses.resources.energy) characterWithBonuses.resources.energy.max = 5;
      }

      // Reset other values
      characterWithBonuses.movement = 5;
      characterWithBonuses.initiative = 0;
      characterWithBonuses.spellSlots = 10;
      characterWithBonuses.mitigation = {
        physical: 0, cold: 0, heat: 0, electric: 0,
        psychic: 0, dark: 0, divine: 0, aetheric: 0, toxic: 0
      };

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
        .populate('characterCulture.cultureId')
        .populate('traits.traitId');

      // Apply module bonuses and equipment effects
      const characterWithBonuses = updatedCharacter.toObject();

      // Reset all skill/weapon/magic/crafting values and diceTierModifiers to recalculate fresh
      Object.keys(characterWithBonuses.skills || {}).forEach(skill => {
        if (characterWithBonuses.skills[skill]) {
          characterWithBonuses.skills[skill].value = 0;
          characterWithBonuses.skills[skill].diceTierModifier = 0;
        }
      });
      Object.keys(characterWithBonuses.weaponSkills || {}).forEach(skill => {
        if (characterWithBonuses.weaponSkills[skill]) {
          characterWithBonuses.weaponSkills[skill].value = 0;
          characterWithBonuses.weaponSkills[skill].diceTierModifier = 0;
        }
      });
      Object.keys(characterWithBonuses.magicSkills || {}).forEach(skill => {
        if (characterWithBonuses.magicSkills[skill]) {
          characterWithBonuses.magicSkills[skill].value = 0;
          characterWithBonuses.magicSkills[skill].diceTierModifier = 0;
        }
      });
      Object.keys(characterWithBonuses.craftingSkills || {}).forEach(skill => {
        if (characterWithBonuses.craftingSkills[skill]) {
          characterWithBonuses.craftingSkills[skill].value = 0;
          characterWithBonuses.craftingSkills[skill].diceTierModifier = 0;
        }
      });

      // Reset resources to base values
      if (characterWithBonuses.resources) {
        if (characterWithBonuses.resources.health) characterWithBonuses.resources.health.max = 20;
        if (characterWithBonuses.resources.resolve) characterWithBonuses.resources.resolve.max = 20;
        if (characterWithBonuses.resources.morale) characterWithBonuses.resources.morale.max = 10;
        if (characterWithBonuses.resources.energy) characterWithBonuses.resources.energy.max = 5;
      }

      // Reset other values
      characterWithBonuses.movement = 5;
      characterWithBonuses.initiative = 0;
      characterWithBonuses.spellSlots = 10;
      characterWithBonuses.mitigation = {
        physical: 0, cold: 0, heat: 0, electric: 0,
        psychic: 0, dark: 0, divine: 0, aetheric: 0, toxic: 0
      };

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
        .populate('characterCulture.cultureId')
        .populate('traits.traitId');

      // Apply module bonuses and equipment effects
      const characterWithBonuses = updatedCharacter.toObject();

      // Reset all skill/weapon/magic/crafting values and diceTierModifiers to recalculate fresh
      Object.keys(characterWithBonuses.skills || {}).forEach(skill => {
        if (characterWithBonuses.skills[skill]) {
          characterWithBonuses.skills[skill].value = 0;
          characterWithBonuses.skills[skill].diceTierModifier = 0;
        }
      });
      Object.keys(characterWithBonuses.weaponSkills || {}).forEach(skill => {
        if (characterWithBonuses.weaponSkills[skill]) {
          characterWithBonuses.weaponSkills[skill].value = 0;
          characterWithBonuses.weaponSkills[skill].diceTierModifier = 0;
        }
      });
      Object.keys(characterWithBonuses.magicSkills || {}).forEach(skill => {
        if (characterWithBonuses.magicSkills[skill]) {
          characterWithBonuses.magicSkills[skill].value = 0;
          characterWithBonuses.magicSkills[skill].diceTierModifier = 0;
        }
      });
      Object.keys(characterWithBonuses.craftingSkills || {}).forEach(skill => {
        if (characterWithBonuses.craftingSkills[skill]) {
          characterWithBonuses.craftingSkills[skill].value = 0;
          characterWithBonuses.craftingSkills[skill].diceTierModifier = 0;
        }
      });

      // Reset resources to base values
      if (characterWithBonuses.resources) {
        if (characterWithBonuses.resources.health) characterWithBonuses.resources.health.max = 20;
        if (characterWithBonuses.resources.resolve) characterWithBonuses.resources.resolve.max = 20;
        if (characterWithBonuses.resources.morale) characterWithBonuses.resources.morale.max = 10;
        if (characterWithBonuses.resources.energy) characterWithBonuses.resources.energy.max = 5;
      }

      // Reset other values
      characterWithBonuses.movement = 5;
      characterWithBonuses.initiative = 0;
      characterWithBonuses.spellSlots = 10;
      characterWithBonuses.mitigation = {
        physical: 0, cold: 0, heat: 0, electric: 0,
        psychic: 0, dark: 0, divine: 0, aetheric: 0, toxic: 0
      };

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
        .populate('characterCulture.cultureId')
        .populate('traits.traitId');

      // Apply module bonuses and equipment effects
      const characterWithBonuses = updatedCharacter.toObject();

      // Reset all skill/weapon/magic/crafting values and diceTierModifiers to recalculate fresh
      Object.keys(characterWithBonuses.skills || {}).forEach(skill => {
        if (characterWithBonuses.skills[skill]) {
          characterWithBonuses.skills[skill].value = 0;
          characterWithBonuses.skills[skill].diceTierModifier = 0;
        }
      });
      Object.keys(characterWithBonuses.weaponSkills || {}).forEach(skill => {
        if (characterWithBonuses.weaponSkills[skill]) {
          characterWithBonuses.weaponSkills[skill].value = 0;
          characterWithBonuses.weaponSkills[skill].diceTierModifier = 0;
        }
      });
      Object.keys(characterWithBonuses.magicSkills || {}).forEach(skill => {
        if (characterWithBonuses.magicSkills[skill]) {
          characterWithBonuses.magicSkills[skill].value = 0;
          characterWithBonuses.magicSkills[skill].diceTierModifier = 0;
        }
      });
      Object.keys(characterWithBonuses.craftingSkills || {}).forEach(skill => {
        if (characterWithBonuses.craftingSkills[skill]) {
          characterWithBonuses.craftingSkills[skill].value = 0;
          characterWithBonuses.craftingSkills[skill].diceTierModifier = 0;
        }
      });

      // Reset resources to base values
      if (characterWithBonuses.resources) {
        if (characterWithBonuses.resources.health) characterWithBonuses.resources.health.max = 20;
        if (characterWithBonuses.resources.resolve) characterWithBonuses.resources.resolve.max = 20;
        if (characterWithBonuses.resources.morale) characterWithBonuses.resources.morale.max = 10;
        if (characterWithBonuses.resources.energy) characterWithBonuses.resources.energy.max = 5;
      }

      // Reset other values
      characterWithBonuses.movement = 5;
      characterWithBonuses.initiative = 0;
      characterWithBonuses.spellSlots = 10;
      characterWithBonuses.mitigation = {
        physical: 0, cold: 0, heat: 0, electric: 0,
        psychic: 0, dark: 0, divine: 0, aetheric: 0, toxic: 0
      };

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

    // Fetch the trait to check if it's "Extra Training"
    const trait = await Trait.findById(traitId);
    if (!trait) {
      return res.status(404).json({ message: 'Trait not found' });
    }

    // Special validation for "Extra Training" trait
    if (trait.name === 'Extra Training') {
      // Calculate max allowed Extra Training traits based on module points
      const maxExtraTraining = Math.floor((character.modulePoints?.total || 0) / 10);

      // Count existing Extra Training traits
      const existingExtraTrainingCount = character.traits.filter(t =>
        t.traitId && t.traitId.toString() === traitId
      ).length;

      // Check if adding another would exceed the limit
      if (existingExtraTrainingCount >= maxExtraTraining) {
        return res.status(400).json({
          message: `Cannot add more Extra Training traits. Maximum allowed: ${maxExtraTraining} (based on ${character.modulePoints?.total || 0} module points)`
        });
      }

      // Extract all selected skill data codes from existing Extra Training traits
      const existingSkillDataCodes = new Set();
      for (const charTrait of character.traits) {
        if (charTrait.traitId && charTrait.traitId.toString() === traitId) {
          // For each selected option in this Extra Training instance
          for (const selectedOption of charTrait.selectedOptions || []) {
            // If this option has a selectedSubchoice, find its data code
            if (selectedOption.selectedSubchoice) {
              // Find the subchoice in the trait's options
              for (const option of trait.options || []) {
                for (const subchoice of option.subchoices || []) {
                  if (subchoice._id.toString() === selectedOption.selectedSubchoice.toString()) {
                    if (subchoice.data) {
                      existingSkillDataCodes.add(subchoice.data);
                    }
                  }
                }
              }
            }
          }
        }
      }

      // Check if the new selection's data code is already used
      for (const selectedOption of selectedOptions || []) {
        if (selectedOption.selectedSubchoice) {
          // Find the subchoice in the trait's options
          for (const option of trait.options || []) {
            for (const subchoice of option.subchoices || []) {
              if (subchoice._id.toString() === selectedOption.selectedSubchoice.toString()) {
                if (subchoice.data && existingSkillDataCodes.has(subchoice.data)) {
                  return res.status(400).json({
                    message: `This skill (${subchoice.name}) has already been selected in another Extra Training trait. Each skill can only be selected once.`
                  });
                }
              }
            }
          }
        }
      }
    }

    // Check if trait already exists (for non-Extra Training traits)
    if (trait.name !== 'Extra Training') {
      const existingTrait = character.traits.find(t => t.traitId.toString() === traitId);
      if (existingTrait) {
        return res.status(400).json({ message: 'Trait already added to character' });
      }
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

    // Try to find by instance _id first (for multi-instance traits like Extra Training)
    let traitIndex = character.traits.findIndex(t => t._id.toString() === traitId);

    // If not found by instance _id, try to find by traitId (for single-instance traits)
    if (traitIndex === -1) {
      traitIndex = character.traits.findIndex(t => t.traitId.toString() === traitId);
    }

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
  // For items, traits, modules, and spells, check for foundry_icon first
  if ((type === 'item' || type === 'trait' || type === 'module' || type === 'spell') && data.foundry_icon && data.foundry_icon.trim() !== '') {
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

// @desc    Update character culture selections
// @route   PUT /api/characters/:id/culture-selections
// @access  Private
export const updateCultureSelections = async (req, res) => {
  try {
    const { cultureId, selectedRestriction, selectedBenefit, selectedStartingItem } = req.body;

    const character = await Character.findById(req.params.id);

    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    // Check if user owns this character
    if (character.userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this character' });
    }

    // Update culture selections
    character.characterCulture = {
      cultureId: cultureId,
      selectedRestriction: selectedRestriction,
      selectedBenefit: selectedBenefit,
      selectedStartingItem: selectedStartingItem
    };

    await character.save();

    // Return the updated character with populated culture
    const updatedCharacter = await Character.findById(character._id)
      .populate('characterCulture.cultureId');

    res.json({
      message: 'Culture selections updated successfully',
      character: updatedCharacter
    });
  } catch (error) {
    console.error('Error updating culture selections:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export character to FoundryVTT JSON format
// @route   GET /api/characters/:id/export-foundry
// @access  Private
export const exportCharacterToFoundry = async (req, res) => {
  console.log('🔥 EXPORT CALLED - Character ID:', req.params.id);
  try {
    const character = await Character.findById(req.params.id)
      .populate('modules.moduleId')
      .populate('spells.spellId')
      .populate('ancestry.ancestryId')
      .populate('characterCulture.cultureId')
      .populate('traits.traitId')
      .populate('inventory.itemId')
      .populate('equipment.head.itemId')
      .populate('equipment.body.itemId')
      .populate('equipment.back.itemId')
      .populate('equipment.hand.itemId')
      .populate('equipment.boots.itemId')
      .populate('equipment.accessory1.itemId')
      .populate('equipment.accessory2.itemId')
      .populate('equipment.mainhand.itemId')
      .populate('equipment.offhand.itemId')
      .populate('equipment.extra1.itemId')
      .populate('equipment.extra2.itemId')
      .populate('equipment.extra3.itemId');

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

    const tokenSize = getSizeFromCharacter(character.physicalTraits?.size);

    // Use the portrait URL for both img and token texture
    let portraitUrl = character.portraitUrl || "icons/svg/mystery-man.svg";

    // For Foundry export, prepend ASSETS_BASE_URL if it's a local upload
    if (portraitUrl.startsWith('/uploads/')) {
      const assetsBaseUrl = process.env.ASSETS_BASE_URL || 'http://localhost:4000';
      portraitUrl = `${assetsBaseUrl}${portraitUrl}`;
    }

    // Create FoundryVTT actor structure matching our new template.json
    const foundryActor = {
      _id: character.foundry_id || convertToFoundryId(character._id),
      name: character.name,
      type: "character",
      img: portraitUrl,
      prototypeToken: {
        actorLink: true,
        width: tokenSize.width,
        height: tokenSize.height,
        disposition: 1, // 1 = Friendly, 0 = Neutral, -1 = Hostile
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
        },
        sight: {
          enabled: true,
          range: 0, // 0 = unlimited in lit areas
          angle: 360,
          visionMode: "basic",
          color: null,
          attenuation: 0,
          brightness: 0,
          saturation: 0,
          contrast: 0
        },
        detectionModes: [
          {
            id: "basicSight",
            enabled: true,
            range: 0
          }
        ]
      },
      system: {
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

        // Resources - BASE values only, Foundry will recalculate max values
        resources: {
          health: {
            value: character.resources?.health?.current || 20,
            max: 20, // Base value, bonuses will be calculated in FoundryVTT
            temp: 0
          },
          resolve: {
            value: character.resources?.resolve?.current || 20,
            max: 20, // Base value, bonuses will be calculated in FoundryVTT
            temp: 0
          },
          morale: {
            value: character.resources?.morale?.current || 10,
            max: 10, // Base value, bonuses will be calculated in FoundryVTT
            temp: 0
          },
          energy: {
            value: character.resources?.energy?.current || 5,
            max: 5, // Base value, bonuses will be calculated in FoundryVTT
            temp: 0
          }
        },

        // Movement - base value only, bonuses will be calculated in FoundryVTT
        movement: {
          walk: 5, // Base movement, bonuses will be added in FoundryVTT
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

        // Skills (now matching template.json structure) - BASE values only, Foundry will recalculate bonuses
        basic: {
          fitness: { value: 0, tier: 0, attribute: "physique" },
          deflection: { value: 0, tier: 0, attribute: "physique" },
          might: { value: 0, tier: 0, attribute: "physique" },
          endurance: { value: 0, tier: 0, attribute: "physique" },
          evasion: { value: 0, tier: 0, attribute: "finesse" },
          stealth: { value: 0, tier: 0, attribute: "finesse" },
          coordination: { value: 0, tier: 0, attribute: "finesse" },
          thievery: { value: 0, tier: 0, attribute: "finesse" },
          resilience: { value: 0, tier: 0, attribute: "mind" },
          concentration: { value: 0, tier: 0, attribute: "mind" },
          senses: { value: 0, tier: 0, attribute: "mind" },
          logic: { value: 0, tier: 0, attribute: "mind" },
          wildcraft: { value: 0, tier: 0, attribute: "knowledge" },
          academics: { value: 0, tier: 0, attribute: "knowledge" },
          magic: { value: 0, tier: 0, attribute: "knowledge" },
          medicine: { value: 0, tier: 0, attribute: "knowledge" },
          expression: { value: 0, tier: 0, attribute: "social" },
          presence: { value: 0, tier: 0, attribute: "social" },
          insight: { value: 0, tier: 0, attribute: "social" },
          persuasion: { value: 0, tier: 0, attribute: "social" }
        },

        // Weapon skills - BASE values only, Foundry will recalculate bonuses
        weapon: {
          brawling: {
            value: 0,
            talent: character.weaponSkills?.brawling?.baseTalent || character.weaponSkills?.brawling?.talent || 1,
            baseTalent: character.weaponSkills?.brawling?.baseTalent || character.weaponSkills?.brawling?.talent || 1
          },
          throwing: {
            value: 0,
            talent: character.weaponSkills?.throwing?.baseTalent || character.weaponSkills?.throwing?.talent || 1,
            baseTalent: character.weaponSkills?.throwing?.baseTalent || character.weaponSkills?.throwing?.talent || 1
          },
          simpleMeleeWeapons: {
            value: 0,
            talent: character.weaponSkills?.simpleMeleeWeapons?.baseTalent || character.weaponSkills?.simpleMeleeWeapons?.talent || 1,
            baseTalent: character.weaponSkills?.simpleMeleeWeapons?.baseTalent || character.weaponSkills?.simpleMeleeWeapons?.talent || 1
          },
          simpleRangedWeapons: {
            value: 0,
            talent: character.weaponSkills?.simpleRangedWeapons?.baseTalent || character.weaponSkills?.simpleRangedWeapons?.talent || 1,
            baseTalent: character.weaponSkills?.simpleRangedWeapons?.baseTalent || character.weaponSkills?.simpleRangedWeapons?.talent || 1
          },
          complexMeleeWeapons: {
            value: 0,
            talent: character.weaponSkills?.complexMeleeWeapons?.baseTalent || character.weaponSkills?.complexMeleeWeapons?.talent || 0,
            baseTalent: character.weaponSkills?.complexMeleeWeapons?.baseTalent || character.weaponSkills?.complexMeleeWeapons?.talent || 0
          },
          complexRangedWeapons: {
            value: 0,
            talent: character.weaponSkills?.complexRangedWeapons?.baseTalent || character.weaponSkills?.complexRangedWeapons?.talent || 0,
            baseTalent: character.weaponSkills?.complexRangedWeapons?.baseTalent || character.weaponSkills?.complexRangedWeapons?.talent || 0
          }
        },

        // Magic skills - BASE values only, Foundry will recalculate bonuses
        magic: {
          black: {
            value: 0,
            talent: character.magicSkills?.black?.baseTalent || character.magicSkills?.black?.talent || 0,
            baseTalent: character.magicSkills?.black?.baseTalent || character.magicSkills?.black?.talent || 0
          },
          primal: {
            value: 0,
            talent: character.magicSkills?.primal?.baseTalent || character.magicSkills?.primal?.talent || 0,
            baseTalent: character.magicSkills?.primal?.baseTalent || character.magicSkills?.primal?.talent || 0
          },
          meta: {
            value: 0,
            talent: character.magicSkills?.meta?.baseTalent || character.magicSkills?.meta?.talent || 0,
            baseTalent: character.magicSkills?.meta?.baseTalent || character.magicSkills?.meta?.talent || 0
          },
          white: {
            value: 0,
            talent: character.magicSkills?.white?.baseTalent || character.magicSkills?.white?.talent || 0,
            baseTalent: character.magicSkills?.white?.baseTalent || character.magicSkills?.white?.talent || 0
          },
          mysticism: {
            value: 0,
            talent: character.magicSkills?.mystic?.baseTalent || character.magicSkills?.mystic?.talent || 0,
            baseTalent: character.magicSkills?.mystic?.baseTalent || character.magicSkills?.mystic?.talent || 0
          }
        },

        // Crafting skills
        crafting: {
          engineering: {
            value: character.craftingSkills?.engineering?.value || 0,
            talent: character.craftingSkills?.engineering?.talent || 0,
            baseTalent: character.craftingSkills?.engineering?.baseTalent || character.craftingSkills?.engineering?.talent || 0
          },
          fabrication: {
            value: character.craftingSkills?.fabrication?.value || 0,
            talent: character.craftingSkills?.fabrication?.talent || 0,
            baseTalent: character.craftingSkills?.fabrication?.baseTalent || character.craftingSkills?.fabrication?.talent || 0
          },
          alchemy: {
            value: character.craftingSkills?.alchemy?.value || 0,
            talent: character.craftingSkills?.alchemy?.talent || 0,
            baseTalent: character.craftingSkills?.alchemy?.baseTalent || character.craftingSkills?.alchemy?.talent || 0
          },
          cooking: {
            value: character.craftingSkills?.cooking?.value || 0,
            talent: character.craftingSkills?.cooking?.talent || 0,
            baseTalent: character.craftingSkills?.cooking?.baseTalent || character.craftingSkills?.cooking?.talent || 0
          },
          glyphcraft: {
            value: character.craftingSkills?.glyphcraft?.value || 0,
            talent: character.craftingSkills?.glyphcraft?.talent || 0,
            baseTalent: character.craftingSkills?.glyphcraft?.baseTalent || character.craftingSkills?.glyphcraft?.talent || 0
          },
          biosculpting: {
            value: character.craftingSkills?.biosculpting?.value || 0,
            talent: character.craftingSkills?.biosculpting?.talent || 0,
            baseTalent: character.craftingSkills?.biosculpting?.baseTalent || character.craftingSkills?.biosculpting?.talent || 0
          }
        },


        // Music skills
        music: {
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
          },
          brass: {
            value: 0,
            talent: character.musicSkills?.brass || 0,
            baseTalent: character.musicSkills?.brass || 0
          }
        },

        // Equipment slots
        equipment: {
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
          // Process options to mark selected ones - use toObject() to avoid Mongoose properties
          const selectedLocations = new Set((charModule.selectedOptions || []).map(opt => opt.location));
          const processedOptions = (charModule.moduleId.options || []).map(option => {
            const plainOption = option.toObject ? option.toObject() : option;
            return {
              _id: plainOption._id,
              name: plainOption.name,
              description: plainOption.description,
              location: plainOption.location,
              data: plainOption.data,
              selected: selectedLocations.has(plainOption.location)
            };
          });

          const moduleItem = {
            _id: charModule.moduleId.foundry_id,
            name: charModule.moduleId.name,
            type: "module",
            img: getGenericIcon(charModule.moduleId, 'module'),
            system: {
              description: charModule.moduleId.description || "",
              mtype: charModule.moduleId.mtype || "core",
              ruleset: charModule.moduleId.ruleset || 1,
              options: processedOptions
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

    // Convert spells to items using correct template format
    if (character.spells) {
      for (const charSpell of character.spells) {
        if (charSpell.spellId) {
          const spellItem = {
            _id: charSpell.spellId.foundry_id,
            name: charSpell.spellId.name,
            type: "spell",
            img: getGenericIcon(charSpell.spellId, 'spell'),
            system: {
              description: charSpell.spellId.description,
              school: charSpell.spellId.school,
              subschool: charSpell.spellId.subschool,
              charge: charSpell.spellId.charge || "",
              duration: charSpell.spellId.duration,
              range: charSpell.spellId.range,
              checkToCast: charSpell.spellId.checkToCast,
              components: charSpell.spellId.components || [],
              ritualDuration: charSpell.spellId.ritualDuration || "",
              concentration: charSpell.spellId.concentration,
              reaction: charSpell.spellId.reaction,
              energy: charSpell.spellId.energy,
              damage: charSpell.spellId.damage,
              damageType: charSpell.spellId.damageType || "",
              fizzled: false,
              foundry_icon: charSpell.spellId.foundry_icon || ""
            },
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
              quantity: invItem.quantity || 1,
              stack_limit: item.stack_limit || 0,
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

    // Populate equipment slots from character.equipment
    if (character.equipment) {
      const slotNames = ['head', 'body', 'back', 'hand', 'boots', 'accessory1', 'accessory2', 'mainhand', 'offhand', 'extra1', 'extra2', 'extra3'];

      for (const slotName of slotNames) {
        const slot = character.equipment[slotName];

        // Skip empty slots
        if (!slot || !slot.itemId) continue;

        // Check if this item is customized in inventory
        // Equipment slot stores the base item ID, but we need to check if there's a customized version
        let item = slot.itemId;
        const slotItemId = slot.itemId._id.toString();

        // Find matching inventory item
        // For customized items, their originalItemId will match the equipment slot's itemId
        const inventoryItem = character.inventory?.find(invItem => {
          // Check customized items by originalItemId
          if (invItem.isCustomized && invItem.itemData?.originalItemId) {
            return invItem.itemData.originalItemId.toString() === slotItemId;
          }
          // Check regular items by itemId
          return invItem.itemId?._id?.toString() === slotItemId;
        });

        // If we found a customized version in inventory, use that instead of base item
        if (inventoryItem?.isCustomized && inventoryItem.itemData) {
          item = inventoryItem.itemData;
        }

        // Create the slot data structure for Foundry
        foundryActor.system.equipment[slotName] = {
          item: {
            _id: item.foundry_id,
            name: item.name,
            img: item.foundry_icon || getGenericIcon(item, 'item'),
            type: "item",
            system: {
              description: item.description || "",
              itemType: item.type,
              weight: item.weight || 0,
              value: item.value || 0,
              rarity: item.rarity || "common",
              weapon_category: item.weapon_category,
              hands: item.hands,
              shield_category: item.shield_category,
              damage: item.damage,
              extra_damage: item.extra_damage,
              damage_type: item.damage_type,
              range: item.range,
              thrown_range: item.thrown_range,
              versatile: item.versatile,
              defense: item.defense,
              shield_type: item.shield_type,
              armor_value: item.armor_value,
              armor_type: item.armor_type,
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
            }
          },
          equippedAt: slot.equippedAt || Date.now(),
          quantity: 1
        };
      }
    }

    // Add ancestry and culture as items if they exist
    if (character.ancestry?.ancestryId) {
      // Process ancestry options (flatten subchoices, remove location) and mark selections by name
      const norm = (v) => (v || "").toString().trim().toLowerCase();
      const selectedOptionNames = new Set((character.ancestry.selectedOptions || []).map(opt => norm(opt.name)));
      const selectedSubchoices = {};
      (character.ancestry.selectedOptions || []).forEach(opt => {
        if (opt.selectedSubchoice) {
          selectedSubchoices[opt.name] = opt.selectedSubchoice;
        }
      });

      const expandedAncestryOptions = expandTraitOptions(character.ancestry.ancestryId.options || []);
      const processedAncestryOptions = expandedAncestryOptions.map(option => {
        if (!option.isSubchoice) {
          return {
            _id: option._id,
            name: option.name,
            description: option.description,
            data: option.data,
            selected: selectedOptionNames.has(norm(option.name)),
            requiresChoice: option.requiresChoice || false,
            choiceType: option.choiceType || ""
          };
        }
        const isSelectedSubchoice = selectedSubchoices[option.parentOption] === option._id;
        return {
          _id: option._id,
          name: option.name,
          description: option.description,
          data: option.data,
          selected: !!isSelectedSubchoice,
          isSubchoice: true,
          parentOption: option.parentOption
        };
      });

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
          options: processedAncestryOptions
        },
        flags: {
          anyventure: {
            originalId: character.ancestry.ancestryId._id.toString()
          }
        },
        ownership: { default: 0 }
      };
      foundryActor.items.push(ancestryItem);
    }

    if (character.characterCulture?.cultureId) {
      // Build a complete list of culture options (selected and unselected)
      const cultureOptions = [];

      // Helper: robust normalize (case/whitespace/punctuation-insensitive)
      const norm = (v) => (v || "")
        .toString()
        .normalize('NFKC')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();

      // Normalize selected names from character (support string or object)
      const selectedRestrictionObj = character.characterCulture.selectedRestriction;
      const selectedBenefitObj = character.characterCulture.selectedBenefit;
      const selectedStartingItemObj = character.characterCulture.selectedStartingItem;
      const selectedRitualObj = character.characterCulture.selectedRitual;

      const selectedRestrictionName = selectedRestrictionObj
        ? norm(typeof selectedRestrictionObj === 'string' ? selectedRestrictionObj : selectedRestrictionObj.name)
        : null;
      const selectedRestrictionDesc = selectedRestrictionObj && typeof selectedRestrictionObj !== 'string'
        ? norm(selectedRestrictionObj.description)
        : null;

      const selectedBenefitName = selectedBenefitObj
        ? norm(typeof selectedBenefitObj === 'string' ? selectedBenefitObj : selectedBenefitObj.name)
        : null;
      const selectedBenefitDesc = selectedBenefitObj && typeof selectedBenefitObj !== 'string'
        ? norm(selectedBenefitObj.description)
        : null;

      const selectedStartingItemName = selectedStartingItemObj
        ? norm(typeof selectedStartingItemObj === 'string' ? selectedStartingItemObj : selectedStartingItemObj.name)
        : null;
      const selectedStartingItemDesc = selectedStartingItemObj && typeof selectedStartingItemObj !== 'string'
        ? norm(selectedStartingItemObj.description)
        : null;

      const selectedRitualName = selectedRitualObj
        ? norm(typeof selectedRitualObj === 'string' ? selectedRitualObj : selectedRitualObj.name)
        : null;
      const selectedRitualDesc = selectedRitualObj && typeof selectedRitualObj !== 'string'
        ? norm(selectedRitualObj.description)
        : null;

      // Include all restrictions
      (character.characterCulture.cultureId.culturalRestrictions || []).forEach(r => {
        const name = r?.name || '';
        cultureOptions.push({
          _id: `restriction_${name.toLowerCase().replace(/\s+/g, '_')}`,
          name,
          description: r?.description || '',
          data: (r && r.data != null ? r.data : 'TX'),
          selected: !!(
            (selectedRestrictionName && norm(name) === selectedRestrictionName) ||
            (selectedRestrictionDesc && norm(r?.description || '') === selectedRestrictionDesc)
          ),
          requiresChoice: false,
          choiceType: '',
          isSubchoice: false,
          parentOption: ''
        });
      });

      // Include all benefits
      (character.characterCulture.cultureId.benefits || []).forEach(b => {
        const name = b?.name || '';
        cultureOptions.push({
          _id: `benefit_${name.toLowerCase().replace(/\s+/g, '_')}`,
          name,
          description: b?.description || '',
          data: (b && b.data != null ? b.data : 'TX'),
          selected: !!(
            (selectedBenefitName && norm(name) === selectedBenefitName) ||
            (selectedBenefitDesc && norm(b?.description || '') === selectedBenefitDesc)
          ),
          requiresChoice: false,
          choiceType: '',
          isSubchoice: false,
          parentOption: ''
        });
      });

      // Include all starting items
      (character.characterCulture.cultureId.startingItems || []).forEach(s => {
        const name = s?.name || '';
        cultureOptions.push({
          _id: `item_${name.toLowerCase().replace(/\s+/g, '_')}`,
          name,
          description: s?.description || '',
          data: (s && s.data != null ? s.data : ''), // Use provided data if any
          selected: !!(
            (selectedStartingItemName && norm(name) === selectedStartingItemName) ||
            (selectedStartingItemDesc && norm(s?.description || '') === selectedStartingItemDesc)
          ),
          requiresChoice: false,
          choiceType: '',
          isSubchoice: false,
          parentOption: ''
        });
      });

      // Include selected ritual (if any) as a distinct option entry
      if (character.characterCulture.selectedRitual) {
        const ritual = typeof character.characterCulture.selectedRitual === 'string'
          ? { name: character.characterCulture.selectedRitual, description: '' }
          : character.characterCulture.selectedRitual;
        const rName = ritual?.name || '';
        if (norm(rName)) {
          cultureOptions.push({
            _id: `ritual_${rName.toLowerCase().replace(/\s+/g, '_')}`,
            name: rName,
            description: ritual?.description || '',
            data: 'TX',
            selected: !!(
              (selectedRitualName && norm(rName) === selectedRitualName) ||
              (selectedRitualDesc && norm(ritual?.description || '') === selectedRitualDesc)
            ),
            requiresChoice: false,
            choiceType: '',
            isSubchoice: false,
            parentOption: ''
          });
        }
      }

      const cultureItem = {
        _id: character.characterCulture.cultureId.foundry_id,
        name: character.characterCulture.cultureId.name,
        type: "culture",
        img: getGenericIcon(character.characterCulture.cultureId, 'culture'),
        system: {
          description: character.characterCulture.cultureId.description || "",
          options: cultureOptions
        },
        flags: {
          anyventure: {
            originalId: character.characterCulture.cultureId._id.toString()
          }
        },
        ownership: { default: 0 }
      };
      foundryActor.items.push(cultureItem);
    }

    // Add traits as items if they exist
    if (character.traits) {
      for (const charTrait of character.traits) {
        if (charTrait.traitId) {
          // Special handling for Extra Training - export as simple "training" type
          if (charTrait.traitId.name === 'Extra Training') {
            // Find the selected subchoice to get the skill name and data
            let selectedSkillName = 'Unknown Skill';
            let selectedSkillData = '';

            // Extract the selected subchoice
            for (const selectedOption of charTrait.selectedOptions || []) {
              if (selectedOption.selectedSubchoice) {
                // Find the subchoice in the trait's options
                for (const option of charTrait.traitId.options || []) {
                  for (const subchoice of option.subchoices || []) {
                    if (subchoice._id.toString() === selectedOption.selectedSubchoice.toString() ||
                        subchoice.id === selectedOption.selectedSubchoice.toString()) {
                      selectedSkillName = subchoice.name;
                      selectedSkillData = subchoice.data || '';
                      break;
                    }
                  }
                  if (selectedSkillData) break;
                }
              }
            }

            // Generate a unique 16-character foundry_id for this instance
            // Use instance ID as seed to create deterministic unique ID
            const generateDeterministicId = (seed) => {
              let hash = 0;
              for (let i = 0; i < seed.length; i++) {
                const char = seed.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
              }
              const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
              let result = '';
              let currentSeed = Math.abs(hash);
              for (let i = 0; i < 16; i++) {
                currentSeed = (currentSeed * 1664525 + 1013904223) % Math.pow(2, 32);
                result += chars.charAt(currentSeed % chars.length);
              }
              return result;
            };
            const uniqueFoundryId = generateDeterministicId(`extra-training-${charTrait._id.toString()}`);

            // Create simple "training" type item - Foundry will handle the rest
            const trainingItem = {
              _id: uniqueFoundryId,
              name: `Extra Training: ${selectedSkillName}`,
              type: "training",
              img: getGenericIcon(charTrait.traitId, 'trait'),
              system: {
                description: `Through dedicated practice and experience, the character has improved their ${selectedSkillName} skill by 1.`,
                data: selectedSkillData
              },
              flags: {
                anyventure: {
                  originalId: charTrait.traitId._id.toString(),
                  instanceId: charTrait._id.toString()
                }
              },
              ownership: { default: 0 }
            };
            foundryActor.items.push(trainingItem);
          } else {
            // Normal trait handling (all other traits)
            const norm = (v) => (v || "").toString().trim().toLowerCase();
            const selectedNames = new Set((charTrait.selectedOptions || []).map(opt => norm(opt.name)));

            // Create a map of selected subchoices for each parent option
            const selectedSubchoices = {};
            (charTrait.selectedOptions || []).forEach(opt => {
              if (opt.selectedSubchoice) {
                selectedSubchoices[opt.name] = opt.selectedSubchoice;
              }
            });

            const expandedOptions = expandTraitOptions(charTrait.traitId.options || []);
            const processedTraitOptions = expandedOptions.map(option => {
              // Main option
              if (!option.isSubchoice) {
                return {
                  _id: option._id,
                  name: option.name,
                  description: option.description,
                  data: option.data,
                  selected: selectedNames.has(norm(option.name)),
                  requiresChoice: option.requiresChoice || false,
                  choiceType: option.choiceType || ""
                };
              }

              // Subchoice
              const isSelectedSubchoice = selectedSubchoices[option.parentOption] === option._id;
              return {
                _id: option._id,
                name: option.name,
                description: option.description,
                data: option.data,
                selected: !!isSelectedSubchoice,
                isSubchoice: true,
                parentOption: option.parentOption
              };
            });

            const traitItem = {
              _id: charTrait.traitId.foundry_id,
              name: charTrait.traitId.name,
              type: "trait",
              img: getGenericIcon(charTrait.traitId, 'trait'),
              system: {
                description: charTrait.traitId.description || "",
                category: charTrait.traitId.category || "",
                rarity: charTrait.traitId.rarity || "",
                effects: charTrait.traitId.effects || [],
                options: processedTraitOptions
              },
              flags: {
                anyventure: {
                  originalId: charTrait.traitId._id.toString()
                }
              },
              ownership: { default: 0 }
            };
            foundryActor.items.push(traitItem);
          }
        }
      }
    }

    // Add languages as items if they exist
    if (character.languageSkills) {
      // Import Language model to get the foundry_id
      const Language = (await import('../models/Language.js')).default;

      // Get all languages from database to match with character's languages
      const allLanguages = await Language.find({});
      const languageMap = new Map(allLanguages.map(l => [l.id, l]));

      // Convert languageSkills to language items
      const languageEntries = character.languageSkills instanceof Map
        ? Array.from(character.languageSkills.entries())
        : Object.entries(character.languageSkills);

      for (const [langId, talent] of languageEntries) {
        const languageData = languageMap.get(langId);

        if (languageData) {
          const languageItem = {
            _id: languageData.foundry_id,
            name: languageData.name,
            type: "language",
            img: languageData.foundry_icon || getGenericIcon(languageData, 'language'),
            system: {
              description: languageData.description || "",
              magic: languageData.magic || 0,
              talent: talent || 0
            },
            flags: {
              anyventure: {
                originalId: languageData._id.toString(),
                characterTalent: talent // Store the character's specific talent level
              }
            },
            ownership: { default: 0 }
          };
          foundryActor.items.push(languageItem);
        }
      }
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

// @desc    Generate a random character (fresh, no modules invested)
// @route   POST /api/characters/random
// @access  Private
export const generateRandomCharacter = async (req, res) => {
  try {
    // Get the user ID from the authenticated user
    const userId = req.user ? req.user._id : null;

    if (!userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Generate random character data (no options needed - always fresh)
    const characterData = await generateRandomCharacterData();

    // Add user ID
    characterData.userId = userId.toString();

    // Handle pending traits - create them in the database first
    const pendingTraits = characterData._pendingTraits || [];
    delete characterData._pendingTraits; // Remove from character data

    const createdTraits = [];
    console.log(`\n📝 Creating ${pendingTraits.length} traits in database...`);

    for (const traitData of pendingTraits) {
      // Check if a trait with this name already exists (name is unique in DB)
      let existingTrait = await Trait.findOne({
        name: traitData.name
      });

      if (existingTrait) {
        // Reuse existing trait
        console.log(`  ♻️  Reusing existing trait: ${traitData.name}`);
        createdTraits.push({
          traitId: existingTrait._id,
          selectedOptions: existingTrait.options.length > 0 ? [{
            name: existingTrait.options[0].name,
            selectedSubchoice: null
          }] : []
        });
      } else {
        // Create a new trait in the database
        // Put the data in an option since that's how the system expects it
        // Add TG (General Trait) category code if data exists
        let dataWithCategory = traitData.data || '';
        if (dataWithCategory && !dataWithCategory.includes('TG')) {
          dataWithCategory = 'TG:' + dataWithCategory;
        } else if (!dataWithCategory) {
          dataWithCategory = 'TG';
        }

        const traitOption = {
          name: traitData.name,
          description: traitData.description,
          data: dataWithCategory,
          selected: true
        };

        const trait = new Trait({
          name: traitData.name,
          description: traitData.description,
          foundry_id: generateFoundryId(),
          options: [traitOption]
        });
        const savedTrait = await trait.save();
        console.log(`  ✅ Created new trait: ${traitData.name} (ID: ${savedTrait._id})`);
        createdTraits.push({
          traitId: savedTrait._id,
          selectedOptions: [{
            name: traitData.name,
            selectedSubchoice: null
          }]
        });
      }
    }

    console.log(`\n💾 Adding ${createdTraits.length} traits to character...`);
    // Add the traits to character data
    characterData.traits = createdTraits;

    // Create and save the character
    const character = new Character(characterData);
    const savedCharacter = await character.save();
    console.log(`\n✅ Character saved! ID: ${savedCharacter._id}`);
    console.log(`   Ancestry: ${savedCharacter.ancestry?.ancestryId || 'none'}`);
    console.log(`   Culture: ${savedCharacter.characterCulture?.cultureId || 'none'}`);
    console.log(`   Traits: ${savedCharacter.traits?.length || 0}`);

    // Populate and return the character with bonuses applied
    const populatedCharacter = await Character.findById(savedCharacter._id)
      .populate('modules.moduleId')
      .populate('ancestry.ancestryId')
      .populate('characterCulture.cultureId')
      .populate('traits.traitId');

    const characterWithBonuses = populatedCharacter.toObject();
    applyModuleBonusesToCharacter(characterWithBonuses);
    characterWithBonuses.derivedTraits = extractTraitsFromModules(characterWithBonuses);

    res.status(201).json(characterWithBonuses);
  } catch (error) {
    console.error('Error generating random character:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate AI biography for character
// @route   POST /api/characters/:id/generate-biography
// @access  Private
export const generateAIBiography = async (req, res) => {
  try {
    // Configuration variables (easy to modify)
    const LLM_HOST = '192.168.1.170';
    const LLM_PORT = 8080;
    const LLM_ENDPOINT = '/v1/chat/completions';
    const LLM_MODEL = 'llama3';
    const LLM_TIMEOUT = 120000; // 2 minutes
    const MAX_TOKENS = 1000;
    const TEMPERATURE = 0.8;

    const SYSTEM_PROMPT = `You are a creative writer specializing in fantasy tabletop RPG character biographies. You write engaging, immersive character backstories for the AnyventureD12 TTRPG system.

IMPORTANT: You must write ONLY in English. Do not use any other language.

Your biographies should be:
- Written in English language
- Written in 3rd person explaining the life of the character
- 3-4 paragraphs long
- Rich with personality and detail
- Include specific events and moments from their past
- Reflect their traits, quirks, and background
- Avoid generic fantasy tropes
- Be narratively compelling and unique`;

    const characterId = req.params.id;

    // Fetch character with all populated data
    const character = await Character.findById(characterId)
      .populate('modules.moduleId')
      .populate('ancestry.ancestryId')
      .populate('characterCulture.cultureId')
      .populate('traits.traitId');

    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    // Check ownership
    if (character.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this character' });
    }

    // Build comprehensive character facts
    const characterFacts = [];

    // Basic info
    characterFacts.push(`Name: ${character.name}`);
    characterFacts.push(`Age: ${character.age || 'unknown'}`);

    // Ancestry
    if (character.ancestry?.ancestryId) {
      const ancestry = character.ancestry.ancestryId;
      characterFacts.push(`Ancestry: ${ancestry.name}`);

      // Ancestry options (like half-races)
      if (character.ancestry.selectedOptions && character.ancestry.selectedOptions.length > 0) {
        character.ancestry.selectedOptions.forEach(opt => {
          if (opt.selectedSubchoice) {
            characterFacts.push(`${opt.name}: ${opt.selectedSubchoice}`);
          }
        });
      }
    }

    // Culture
    if (character.characterCulture?.cultureId) {
      characterFacts.push(`Culture: ${character.characterCulture.cultureId.name}`);
    }

    // Physical traits
    if (character.physicalTraits) {
      if (character.physicalTraits.gender) {
        characterFacts.push(`Gender: ${character.physicalTraits.gender}`);
      }
      if (character.physicalTraits.height) {
        characterFacts.push(`Height: ${character.physicalTraits.height}`);
      }
      if (character.physicalTraits.weight) {
        characterFacts.push(`Weight: ${character.physicalTraits.weight}`);
      }
      if (character.physicalTraits.size) {
        characterFacts.push(`Size: ${character.physicalTraits.size}`);
      }
      if (character.physicalTraits.eyes) {
        characterFacts.push(`Eyes: ${character.physicalTraits.eyes}`);
      }
      if (character.physicalTraits.hair) {
        characterFacts.push(`Hair: ${character.physicalTraits.hair}`);
      }
      if (character.physicalTraits.skin) {
        characterFacts.push(`Skin: ${character.physicalTraits.skin}`);
      }
    }

    // Attributes
    if (character.attributes) {
      const attrs = [];
      if (character.attributes.physique) attrs.push(`Physique ${character.attributes.physique}`);
      if (character.attributes.finesse) attrs.push(`Finesse ${character.attributes.finesse}`);
      if (character.attributes.mind) attrs.push(`Mind ${character.attributes.mind}`);
      if (character.attributes.knowledge) attrs.push(`Knowledge ${character.attributes.knowledge}`);
      if (character.attributes.social) attrs.push(`Social ${character.attributes.social}`);
      if (attrs.length > 0) {
        characterFacts.push(`Attributes: ${attrs.join(', ')}`);
      }
    }

    // Traits with descriptions
    if (character.traits && character.traits.length > 0) {
      const traitDescriptions = character.traits
        .filter(t => t.traitId)
        .map(t => `${t.traitId.name}${t.traitId.description ? ` (${t.traitId.description})` : ''}`)
        .join('; ');
      if (traitDescriptions) {
        characterFacts.push(`Traits: ${traitDescriptions}`);
      }
    }

    // Modules (their training/specializations)
    if (character.modules && character.modules.length > 0) {
      const moduleNames = character.modules
        .filter(m => m.moduleId)
        .map(m => m.moduleId.name)
        .join(', ');
      if (moduleNames) {
        characterFacts.push(`Training/Specializations: ${moduleNames}`);
      }
    }

    // Background text (if it exists from random generation)
    if (character.biography && character.biography.length > 0) {
      characterFacts.push(`Existing Background Notes: ${character.biography}`);
    }

    // Build the user prompt
    const USER_PROMPT = `Generate a compelling third-person fantasy biography for this character based on these facts:

${characterFacts.join('\n')}

Write a 3-5 paragraph biography in THIRD PERSON that brings this character to life. Describe their specific memories, formative experiences, and defining moments that explain how they became who they are today. Refer to them by name or as "they/them/he/she". Make it unique and memorable. /nothink`;

    console.log('\n🤖 Generating AI Biography...');
    console.log(`📡 LLM Endpoint: http://${LLM_HOST}:${LLM_PORT}${LLM_ENDPOINT}`);
    console.log(`📝 Character: ${character.name}`);
    console.log(`📝 Character Facts: ${characterFacts}`);
    // Make request to local LLM
    const llmResponse = await axios.post(
      `http://${LLM_HOST}:${LLM_PORT}${LLM_ENDPOINT}`,
      {
        model: LLM_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: USER_PROMPT }
        ],
        max_tokens: MAX_TOKENS,
        temperature: TEMPERATURE,
        stream: false
      },
      {
        timeout: LLM_TIMEOUT,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract the generated biography
    let generatedBiography = llmResponse.data.choices?.[0]?.message?.content;

    // Try alternative response formats
    if (!generatedBiography || generatedBiography.trim().length === 0) {
      // GLM models without /nothink put content in reasoning_content
      generatedBiography = llmResponse.data.choices?.[0]?.message?.reasoning_content;
    }
    if (!generatedBiography) {
      // Some servers return text directly
      generatedBiography = llmResponse.data.choices?.[0]?.text;
    }
    if (!generatedBiography) {
      // llama.cpp format
      generatedBiography = llmResponse.data.content;
    }

    if (!generatedBiography || generatedBiography.trim().length === 0) {
      console.error('❌ No content found in response');
      console.log('📦 Full response:', JSON.stringify(llmResponse.data, null, 2));
      throw new Error('No biography generated from LLM');
    }

    // Clean up any chat template tags that might remain
    generatedBiography = generatedBiography.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    generatedBiography = generatedBiography.replace(/<\|assistant\|>/g, '').trim();
    generatedBiography = generatedBiography.replace(/<\|user\|>/g, '').trim();
    generatedBiography = generatedBiography.replace(/<\|system\|>/g, '').trim();

    console.log(`✅ Biography generated (${generatedBiography.length} characters)`);

    // Update character's biography
    character.biography = generatedBiography;
    await character.save();

    // Return updated character with bonuses
    const updatedCharacter = await Character.findById(characterId)
      .populate('modules.moduleId')
      .populate('ancestry.ancestryId')
      .populate('characterCulture.cultureId')
      .populate('traits.traitId');

    const characterWithBonuses = updatedCharacter.toObject();
    applyModuleBonusesToCharacter(characterWithBonuses);
    characterWithBonuses.derivedTraits = extractTraitsFromModules(characterWithBonuses);

    res.json({
      success: true,
      biography: generatedBiography,
      character: characterWithBonuses
    });

  } catch (error) {
    console.error('❌ Error generating AI biography:', error.message);

    // Provide helpful error messages
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        message: 'Cannot connect to LLM server. Please ensure the LLM server is running.',
        error: error.message
      });
    }

    if (error.code === 'ETIMEDOUT') {
      return res.status(504).json({
        message: 'LLM server request timed out. The server may be overloaded.',
        error: error.message
      });
    }

    res.status(500).json({
      message: 'Failed to generate biography',
      error: error.message
    });
  }
};

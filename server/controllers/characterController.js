import Character from '../models/Character.js';
import { applyModuleBonusesToCharacter,extractTraitsFromModules } from '../utils/characterUtils.js';


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
      .populate('characterTrait');
    
    res.json(characters);
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single character
// @route   GET /api/characters/:id
// @access  Private
export const getCharacter = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    
    // Find character by ID and populate the modules with their data
    const character = await Character.findById(req.params.id)
      .populate('modules.moduleId')
      .populate('inventory.itemId')
      .populate('ancestry.ancestryId')
      .populate('characterCulture.cultureId')
      .populate('characterTrait');

    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    // Check if character belongs to user
    const isOwner = character.userId === userId?.toString();
                    
    if (!isOwner) {
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
      .populate('characterTrait');
    
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
    const character = await Character.findById(req.params.id);
    
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
    const character = await Character.findById(req.params.id);
    
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
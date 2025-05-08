// server/controllers/traitController.js
import Trait from '../models/Trait.js';
import Character from '../models/Character.js';

// @desc    Get all traits
// @route   GET /api/traits
// @access  Public
export const getTraits = async (req, res) => {
  try {
    const traits = await Trait.find({});
    res.json(traits);
  } catch (error) {
    console.error('Error fetching traits:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single trait
// @route   GET /api/traits/:id
// @access  Public
export const getTrait = async (req, res) => {
  try {
    const trait = await Trait.findById(req.params.id);
    
    if (!trait) {
      return res.status(404).json({ message: 'Trait not found' });
    }
    
    res.json(trait);
  } catch (error) {
    console.error('Error fetching trait:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get traits by type
// @route   GET /api/traits/type/:type
// @access  Public
export const getTraitsByType = async (req, res) => {
  try {
    const { type } = req.params;
    
    // Validate type
    if (!['positive', 'negative'].includes(type)) {
      return res.status(400).json({ message: 'Invalid trait type' });
    }
    
    const traits = await Trait.find({ type });
    res.json(traits);
  } catch (error) {
    console.error('Error fetching traits by type:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get character traits
// @route   GET /api/characters/:characterId/traits
// @access  Private
export const getCharacterTraits = async (req, res) => {
  try {
    const character = await Character.findById(req.params.characterId);
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    // Check authorization - character should belong to user
    if (character.userId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    res.json(character.traits);
  } catch (error) {
    console.error('Error fetching character traits:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a trait to a character
// @route   POST /api/characters/:characterId/traits/:traitId
// @access  Private
export const addTraitToCharacter = async (req, res) => {
  try {
    const character = await Character.findById(req.params.characterId);
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    // Check authorization - character should belong to user
    if (character.userId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const trait = await Trait.findById(req.params.traitId);
    
    if (!trait) {
      return res.status(404).json({ message: 'Trait not found' });
    }
    
    // Check if character already has 3 traits
    if (character.traits.length >= 3) {
      return res.status(400).json({ 
        message: 'Character already has the maximum of 3 traits' 
      });
    }
    
    // Check if there are enough module points for positive traits
    if (trait.type === 'positive') {
      const availablePoints = character.modulePoints.total - character.modulePoints.spent;
      if (availablePoints < 1) {
        return res.status(400).json({
          message: 'Not enough module points to add positive trait'
        });
      }
    }
    
    // Add trait to character
    const success = await character.addTrait(trait);
    
    if (!success) {
      return res.status(400).json({ 
        message: 'Could not add trait. Check if it already exists.' 
      });
    }
    
    await character.save();
    
    res.json(character);
  } catch (error) {
    console.error('Error adding trait to character:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove a trait from a character
// @route   DELETE /api/characters/:characterId/traits/:traitId
// @access  Private
export const removeTraitFromCharacter = async (req, res) => {
  try {
    const character = await Character.findById(req.params.characterId);
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    // Check authorization - character should belong to user
    if (character.userId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Remove trait from character
    const success = await character.removeTrait(req.params.traitId);
    
    if (!success) {
      return res.status(400).json({ 
        message: 'Could not remove trait. Check if it exists.' 
      });
    }
    
    await character.save();
    
    res.json(character);
  } catch (error) {
    console.error('Error removing trait from character:', error);
    res.status(500).json({ message: error.message });
  }
};
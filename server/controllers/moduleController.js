// server/controllers/moduleController.js
import Module from '../models/Module.js';
import Character from '../models/Character.js';

// @desc    Get all modules
// @route   GET /api/modules
// @access  Public
export const getModules = async (req, res) => {
  try {
    const modules = await Module.find({});
    res.json(modules);
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single module
// @route   GET /api/modules/:id
// @access  Public
export const getModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    
    res.json(module);
  } catch (error) {
    console.error('Error fetching module:', error);
    res.status(500).json({ message: error.message });
  }
};



// @desc    Get modules by type
// @route   GET /api/modules/type/:type
// @access  Public
export const getModulesByType = async (req, res) => {
  try {
    const { type } = req.params;
    
    // Validate type
    if (!['racial', 'core', 'secondary'].includes(type)) {
      return res.status(400).json({ message: 'Invalid module type' });
    }
    
    const modules = await Module.find({ mtype: type });
    res.json(modules);
  } catch (error) {
    console.error('Error fetching modules by type:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get character modules
// @route   GET /api/characters/:characterId/modules
// @access  Private
export const getCharacterModules = async (req, res) => {
  try {
    const character = await Character.findById(req.params.characterId)
      .populate('modules.moduleId');
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    // Check authorization - character should belong to user
    if (character.userId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    
    res.json(character.modules);
  } catch (error) {
    console.error('Error fetching character modules:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update these controller functions in server/controllers/moduleController.js

// @desc    Add a module to a character
// @route   POST /api/characters/:characterId/modules/:moduleId
// @access  Private
export const addModuleToCharacter = async (req, res) => {
  try {
    const character = await Character.findById(req.params.characterId);
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    // Check authorization - character should belong to user
    if (character.userId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const module = await Module.findById(req.params.moduleId);
    
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    
    // Add module to character with new simplified cost structure
    const success = await character.addModule(module._id);
    
    if (!success) {
      return res.status(400).json({ 
        message: 'Could not add module. Check if it already exists or if you have enough points.' 
      });
    }
    
    await character.save();
    
    // Return updated character with populated modules
    const updatedCharacter = await Character.findById(character._id)
      .populate('modules.moduleId');
    
    res.json(updatedCharacter);
  } catch (error) {
    console.error('Error adding module to character:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Select a module option for a character
// @route   POST /api/characters/:characterId/modules/:moduleId/options
// @access  Private
export const selectModuleOption = async (req, res) => {
  try {
    const { location } = req.body;
    
    if (!location) {
      return res.status(400).json({ message: 'Option location is required' });
    }
    
    const character = await Character.findById(req.params.characterId);
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    // Check authorization - character should belong to user
    if (character.userId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Select option with new simplified cost structure
    const success = await character.selectOption(req.params.moduleId, location);
    
    if (!success) {
      return res.status(400).json({ 
        message: 'Could not select option. Check if the module exists, option is available, or if you have enough points.' 
      });
    }
    
    await character.save();
    
    // Return updated character with populated modules
    const updatedCharacter = await Character.findById(character._id)
      .populate('modules.moduleId');
    
    res.json(updatedCharacter);
  } catch (error) {
    console.error('Error selecting module option:', error);
    res.status(500).json({ message: error.message });
  }
};
// @desc    Remove a module from a character
// @route   DELETE /api/characters/:characterId/modules/:moduleId
// @access  Private
export const removeModuleFromCharacter = async (req, res) => {
  try {
    const character = await Character.findById(req.params.characterId);
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    // Check authorization - character should belong to user
    if (character.userId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Remove module from character
    const success = character.removeModule(req.params.moduleId);
    
    if (!success) {
      return res.status(400).json({ message: 'Could not remove module. Check if it exists.' });
    }
    
    await character.save();
    
    // Return updated character with populated modules
    const updatedCharacter = await Character.findById(character._id)
      .populate('modules.moduleId');
    
    res.json(updatedCharacter);
  } catch (error) {
    console.error('Error removing module from character:', error);
    res.status(500).json({ message: error.message });
  }
};


// @desc    Deselect a module option for a character
// @route   DELETE /api/characters/:characterId/modules/:moduleId/options/:location
// @access  Private
export const deselectModuleOption = async (req, res) => {
  try {
    const character = await Character.findById(req.params.characterId);
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    // Check authorization - character should belong to user
    if (character.userId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Deselect option
    const success = await character.deselectOption(req.params.moduleId, req.params.location);
    
    if (!success) {
      return res.status(400).json({ 
        message: 'Could not deselect option. Check if it exists or if it has dependent options.' 
      });
    }
    
    await character.save();
    
    // Return updated character with populated modules
    const updatedCharacter = await Character.findById(character._id)
      .populate('modules.moduleId');
    
    res.json(updatedCharacter);
  } catch (error) {
    console.error('Error deselecting module option:', error);
    res.status(500).json({ message: error.message });
  }
};
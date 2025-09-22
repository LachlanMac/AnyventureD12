// server/controllers/traitController.js
import Trait from '../models/Trait.js';

// @desc    Get all traits
// @route   GET /api/traits
// @access  Public
export const getTraits = async (req, res) => {
  try {
    const traits = await Trait.find({});

    // Sort traits to put "Born to Adventure" first
    traits.sort((a, b) => {
      if (a.name === 'Born to Adventure') return -1;
      if (b.name === 'Born to Adventure') return 1;
      return a.name.localeCompare(b.name);
    });

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

// @desc    Get trait by name
// @route   GET /api/traits/name/:name
// @access  Public
export const getTraitByName = async (req, res) => {
  try {
    const { name } = req.params;
    const trait = await Trait.findOne({ name: new RegExp(name, 'i') });
    
    if (!trait) {
      return res.status(404).json({ message: 'Trait not found' });
    }
    
    res.json(trait);
  } catch (error) {
    console.error('Error fetching trait by name:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get traits by type
// @route   GET /api/traits/type/:type
// @access  Public
export const getTraitsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const traits = await Trait.find({ type: new RegExp(type, 'i') });
    
    res.json(traits);
  } catch (error) {
    console.error('Error fetching traits by type:', error);
    res.status(500).json({ message: error.message });
  }
};
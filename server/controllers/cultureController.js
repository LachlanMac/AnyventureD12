// server/controllers/cultureController.js
import Culture from '../models/Culture.js';

// @desc    Get all cultures
// @route   GET /api/cultures
// @access  Public
export const getCultures = async (req, res) => {
  try {
    const cultures = await Culture.find({});
    res.json(cultures);
  } catch (error) {
    console.error('Error fetching cultures:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single culture
// @route   GET /api/cultures/:id
// @access  Public
export const getCulture = async (req, res) => {
  try {
    const culture = await Culture.findById(req.params.id);
    
    if (!culture) {
      return res.status(404).json({ message: 'Culture not found' });
    }
    
    res.json(culture);
  } catch (error) {
    console.error('Error fetching culture:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get culture by name
// @route   GET /api/cultures/name/:name
// @access  Public
export const getCultureByName = async (req, res) => {
  try {
    const { name } = req.params;
    const culture = await Culture.findOne({ name: new RegExp(name, 'i') });
    
    if (!culture) {
      return res.status(404).json({ message: 'Culture not found' });
    }
    
    res.json(culture);
  } catch (error) {
    console.error('Error fetching culture by name:', error);
    res.status(500).json({ message: error.message });
  }
};
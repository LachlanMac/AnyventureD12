// server/controllers/ancestryController.js
import Ancestry from '../models/Ancestry.js';

// @desc    Get all ancestries
// @route   GET /api/ancestries
// @access  Public
export const getAncestries = async (req, res) => {
  try {
    const ancestries = await Ancestry.find({});
    res.json(ancestries);
  } catch (error) {
    console.error('Error fetching ancestries:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single ancestry
// @route   GET /api/ancestries/:id
// @access  Public
export const getAncestry = async (req, res) => {
  try {
    const ancestry = await Ancestry.findById(req.params.id);
    
    if (!ancestry) {
      return res.status(404).json({ message: 'Ancestry not found' });
    }
    
    res.json(ancestry);
  } catch (error) {
    console.error('Error fetching ancestry:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get ancestry by name
// @route   GET /api/ancestries/name/:name
// @access  Public
export const getAncestryByName = async (req, res) => {
  try {
    const { name } = req.params;
    const ancestry = await Ancestry.findOne({ name: new RegExp(name, 'i') });
    
    if (!ancestry) {
      return res.status(404).json({ message: 'Ancestry not found' });
    }
    
    res.json(ancestry);
  } catch (error) {
    console.error('Error fetching ancestry by name:', error);
    res.status(500).json({ message: error.message });
  }
};
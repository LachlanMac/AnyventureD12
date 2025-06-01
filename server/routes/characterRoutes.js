// server/routes/characterRoutes.js
import express from 'express';
import {
  getCharacters,
  getCharacter,
  createCharacter,
  updateCharacter,
  deleteCharacter,
  addItemToInventory,
  removeItemFromInventory,
  equipItem,
  unequipItem,
  customizeItem,
  updateItemQuantity
} from '../controllers/characterController.js';
import { protect } from '../middleware/auth.js';
import characterModuleRoutes from './characterModuleRoutes.js';
import characterSpellRoutes from './characterSpellRoutes.js';
import Character from '../models/Character.js';

const router = express.Router();

// Apply authentication middleware to all character routes
router.use(protect);

// Mount the module routes
router.use('/:characterId/modules', characterModuleRoutes);
router.use('/:characterId/spells', characterSpellRoutes);

// Routes for /api/characters
router.route('/')
  .get(getCharacters)
  .post(createCharacter);

router.route('/:id')
  .get(getCharacter)
  .put(updateCharacter)
  .delete(deleteCharacter);

// Inventory management routes
router.route('/:id/inventory')
  .post(addItemToInventory);

router.route('/:id/inventory/:itemId')
  .delete(removeItemFromInventory);

// Equipment management routes
router.route('/:id/equipment/:slotName')
  .put(equipItem)
  .delete(unequipItem);

// Item customization and quantity routes
router.route('/:id/inventory/:index/customize')
  .post(customizeItem);

router.route('/:id/inventory/:index/quantity')
  .put(updateItemQuantity);

// Music skills update route
router.patch('/:id/music-skills', async (req, res) => {
  try {
    const { musicSkills } = req.body;
    
    // First find the character to verify ownership
    const character = await Character.findById(req.params.id);
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    // Check if the character belongs to the user
    if (character.userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this character' });
    }
    
    // Update the music skills
    character.musicSkills = musicSkills;
    await character.save();
    
    res.json(character);
  } catch (error) {
    console.error('Error updating music skills:', error);
    res.status(500).json({ message: error.message });
  }
});

// Language skills update route
router.patch('/:id/language-skills', async (req, res) => {
  try {
    const { languageSkills } = req.body;
    
    // First find the character to verify ownership
    const character = await Character.findById(req.params.id);
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    // Check if the character belongs to the user
    if (character.userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this character' });
    }
    
    // Update the language skills
    // Convert object to Map for MongoDB
    character.languageSkills = new Map(Object.entries(languageSkills));
    await character.save();
    
    res.json(character);
  } catch (error) {
    console.error('Error updating language skills:', error);
    res.status(500).json({ message: error.message });
  }
});

// Resources update route
router.patch('/:id/resources', async (req, res) => {
  try {
    const { resources } = req.body;
    
    // First find the character to verify ownership
    const character = await Character.findById(req.params.id);
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    // Check if the character belongs to the user
    if (character.userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this character' });
    }
    
    // Update the resources
    character.resources = resources;
    await character.save();
    
    res.json(character);
  } catch (error) {
    console.error('Error updating resources:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
// server/routes/characterRoutes.js
import express from 'express';
import { applyModuleBonusesToCharacter, extractTraitsFromModules } from '../utils/characterUtils.js';
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
    
    // Re-fetch the character with proper population, like in getCharacter
    const updatedCharacter = await Character.findById(req.params.id)
      .populate('modules.moduleId')
      .populate('inventory.itemId')
      .populate('ancestry.ancestryId')
      .populate('characterCulture.cultureId');
    
    // Apply module bonuses like in getCharacter
    const characterWithBonuses = updatedCharacter.toObject();
    applyModuleBonusesToCharacter(characterWithBonuses);
    characterWithBonuses.derivedTraits = extractTraitsFromModules(characterWithBonuses);
    
    res.json(characterWithBonuses);
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
    
    // Re-fetch the character with proper population, like in getCharacter
    const updatedCharacter = await Character.findById(req.params.id)
      .populate('modules.moduleId')
      .populate('inventory.itemId')
      .populate('ancestry.ancestryId')
      .populate('characterCulture.cultureId');
    
    // Apply module bonuses like in getCharacter
    const characterWithBonuses = updatedCharacter.toObject();
    applyModuleBonusesToCharacter(characterWithBonuses);
    characterWithBonuses.derivedTraits = extractTraitsFromModules(characterWithBonuses);
    
    res.json(characterWithBonuses);
  } catch (error) {
    console.error('Error updating language skills:', error);
    res.status(500).json({ message: error.message });
  }
});

// Resources update route
router.patch('/:id/resources', async (req, res) => {
  try {
    const { resources } = req.body;
    
    // First find the character to verify ownership and get effective max values
    const character = await Character.findById(req.params.id)
      .populate('modules.moduleId')
      .populate('inventory.itemId')
      .populate('ancestry.ancestryId')
      .populate('characterCulture.cultureId');
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    // Check if the character belongs to the user
    if (character.userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this character' });
    }
    
    // Apply bonuses to get effective max values
    const characterCopy = character.toObject();
    applyModuleBonusesToCharacter(characterCopy);
    
    // Validate that current resources don't exceed effective max
    const effectiveMaxHealth = characterCopy.resources.health.max;
    const effectiveMaxEnergy = characterCopy.resources.energy.max;
    const effectiveMaxResolve = characterCopy.resources.resolve.max;
    const effectiveMaxMorale = characterCopy.resources.morale.max;
    
    // Validate and cap resources at effective max
    const validatedResources = {
      health: {
        current: Math.max(0, Math.min(resources.health.current, effectiveMaxHealth)),
        max: resources.health.max // Keep the base max as is
      },
      energy: {
        current: Math.max(0, Math.min(resources.energy.current, effectiveMaxEnergy)),
        max: resources.energy.max
      },
      resolve: {
        current: Math.max(0, Math.min(resources.resolve.current, effectiveMaxResolve)),
        max: resources.resolve.max
      },
      morale: {
        current: Math.max(0, Math.min(resources.morale.current, effectiveMaxMorale)),
        max: resources.morale.max
      }
    };
    
    console.log(`Resource validation: Health ${resources.health.current} -> ${validatedResources.health.current} (max: ${effectiveMaxHealth})`);
    console.log(`Resource validation: Energy ${resources.energy.current} -> ${validatedResources.energy.current} (max: ${effectiveMaxEnergy})`);
    console.log(`Resource validation: Resolve ${resources.resolve.current} -> ${validatedResources.resolve.current} (max: ${effectiveMaxResolve})`);
    console.log(`Resource validation: Morale ${resources.morale.current} -> ${validatedResources.morale.current} (max: ${effectiveMaxMorale})`);
    
    // Update the resources with validated values
    character.resources = validatedResources;
    await character.save();
    
    // Re-fetch the character with proper population, like in getCharacter
    const updatedCharacter = await Character.findById(req.params.id)
      .populate('modules.moduleId')
      .populate('inventory.itemId')
      .populate('ancestry.ancestryId')
      .populate('characterCulture.cultureId');
    
    // Apply module bonuses like in getCharacter
    const characterWithBonuses = updatedCharacter.toObject();
    applyModuleBonusesToCharacter(characterWithBonuses);
    characterWithBonuses.derivedTraits = extractTraitsFromModules(characterWithBonuses);
    
    res.json(characterWithBonuses);
  } catch (error) {
    console.error('Error updating resources:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
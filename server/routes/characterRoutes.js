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

export default router;
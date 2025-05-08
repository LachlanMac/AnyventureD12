// server/routes/characterRoutes.js
import express from 'express';
import {
  getCharacters,
  getCharacter,
  createCharacter,
  updateCharacter,
  deleteCharacter
} from '../controllers/characterController.js';
import { protect } from '../middleware/auth.js';
import characterModuleRoutes from './characterModuleRoutes.js';

const router = express.Router();

// Apply authentication middleware to all character routes
router.use(protect);

// Mount the module routes
router.use('/:characterId/modules', characterModuleRoutes);

// Routes for /api/characters
router.route('/')
  .get(getCharacters)
  .post(createCharacter);

router.route('/:id')
  .get(getCharacter)
  .put(updateCharacter)
  .delete(deleteCharacter);

export default router;
import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getCreatures,
  getCreatureById,
  createCreature,
  updateCreature,
  deleteCreature,
  getCreaturesByType,
  getCreatureStats
} from '../controllers/creatureController.js';

const router = express.Router();

// Public routes
router.get('/', getCreatures);
router.get('/stats', getCreatureStats);
router.get('/type/:type', getCreaturesByType);
router.get('/:id', getCreatureById);

// Protected routes (require authentication)
router.post('/', protect, createCreature);
router.put('/:id', protect, updateCreature);
router.delete('/:id', protect, deleteCreature);

export default router;
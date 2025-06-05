import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createHomebrewCreature,
  getHomebrewCreatures,
  updateHomebrewCreature,
  deleteHomebrewCreature,
  voteHomebrewCreature
} from '../controllers/homebrewController.js';

const router = express.Router();

// GET /api/homebrew/creatures - Get all homebrew creatures (public)
router.get('/', getHomebrewCreatures);

// POST /api/homebrew/creatures - Create new homebrew creature (private)
router.post('/', protect, createHomebrewCreature);

// PUT /api/homebrew/creatures/:id - Update homebrew creature (private)
router.put('/:id', protect, updateHomebrewCreature);

// DELETE /api/homebrew/creatures/:id - Delete homebrew creature (private)
router.delete('/:id', protect, deleteHomebrewCreature);

// POST /api/homebrew/creatures/:id/vote - Vote on homebrew creature (private)
router.post('/:id/vote', protect, voteHomebrewCreature);

export default router;
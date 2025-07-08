import express from 'express';
import { protect, requirePermanentUser } from '../middleware/auth.js';
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

// POST /api/homebrew/creatures - Create new homebrew creature (require permanent user)
router.post('/', requirePermanentUser, createHomebrewCreature);

// PUT /api/homebrew/creatures/:id - Update homebrew creature (require permanent user)
router.put('/:id', requirePermanentUser, updateHomebrewCreature);

// DELETE /api/homebrew/creatures/:id - Delete homebrew creature (require permanent user)
router.delete('/:id', requirePermanentUser, deleteHomebrewCreature);

// POST /api/homebrew/creatures/:id/vote - Vote on homebrew creature (require permanent user)
router.post('/:id/vote', requirePermanentUser, voteHomebrewCreature);

export default router;
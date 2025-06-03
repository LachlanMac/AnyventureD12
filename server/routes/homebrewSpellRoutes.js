// server/routes/homebrewSpellRoutes.js
import express from 'express';
import {
  createHomebrewSpell,
  getHomebrewSpells,
  getHomebrewSpell,
  updateHomebrewSpell,
  deleteHomebrewSpell,
  publishHomebrewSpell,
  voteHomebrewSpell,
  reportHomebrewSpell,
  forkHomebrewSpell,
  approveHomebrewSpell,
  rejectHomebrewSpell
} from '../controllers/homebrewSpellController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/spells', getHomebrewSpells);
router.get('/spells/:id', getHomebrewSpell);

// Protected routes
router.post('/spells', protect, createHomebrewSpell);
router.put('/spells/:id', protect, updateHomebrewSpell);
router.delete('/spells/:id', protect, deleteHomebrewSpell);
router.post('/spells/:id/publish', protect, publishHomebrewSpell);
router.post('/spells/:id/vote', protect, voteHomebrewSpell);
router.post('/spells/:id/report', protect, reportHomebrewSpell);
router.post('/spells/:id/fork', protect, forkHomebrewSpell);

// Admin routes (TODO: Add admin middleware)
router.post('/admin/spells/:id/approve', protect, approveHomebrewSpell);
router.post('/admin/spells/:id/reject', protect, rejectHomebrewSpell);

export default router;
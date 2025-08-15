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
import { protect, requirePermanentUser } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/spells', getHomebrewSpells);
router.get('/spells/:id', getHomebrewSpell);

// Protected routes (require permanent user)
router.post('/spells', requirePermanentUser, createHomebrewSpell);
router.put('/spells/:id', requirePermanentUser, updateHomebrewSpell);
router.delete('/spells/:id', requirePermanentUser, deleteHomebrewSpell);
router.post('/spells/:id/publish', requirePermanentUser, publishHomebrewSpell);
router.post('/spells/:id/vote', requirePermanentUser, voteHomebrewSpell);
router.post('/spells/:id/report', requirePermanentUser, reportHomebrewSpell);
router.post('/spells/:id/fork', requirePermanentUser, forkHomebrewSpell);

// Admin routes (TODO: Add admin middleware)
router.post('/admin/spells/:id/approve', protect, approveHomebrewSpell);
router.post('/admin/spells/:id/reject', protect, rejectHomebrewSpell);

export default router;
// server/routes/homebrewRoutes.js
import express from 'express';
import { protect, requirePermanentUser } from '../middleware/auth.js';
import {
  createHomebrewItem,
  getHomebrewItems,
  getHomebrewItem,
  updateHomebrewItem,
  deleteHomebrewItem,
  publishHomebrewItem,
  voteHomebrewItem,
  reportHomebrewItem,
  forkHomebrewItem,
  approveHomebrewItem,
  rejectHomebrewItem
} from '../controllers/homebrewController.js';

const router = express.Router();

// Public routes
router.get('/items', getHomebrewItems);
router.get('/items/:id', getHomebrewItem);

// Protected routes (require permanent user for creation/modification)
router.post('/items', requirePermanentUser, createHomebrewItem);
router.put('/items/:id', requirePermanentUser, updateHomebrewItem);
router.delete('/items/:id', requirePermanentUser, deleteHomebrewItem);
router.post('/items/:id/publish', requirePermanentUser, publishHomebrewItem);
router.post('/items/:id/vote', requirePermanentUser, voteHomebrewItem);
router.post('/items/:id/report', requirePermanentUser, reportHomebrewItem);
router.post('/items/:id/fork', requirePermanentUser, forkHomebrewItem);

// Admin routes (TODO: Add admin middleware)
router.post('/admin/items/:id/approve', protect, approveHomebrewItem);
router.post('/admin/items/:id/reject', protect, rejectHomebrewItem);

export default router;
// server/routes/homebrewRoutes.js
import express from 'express';
import { protect } from '../middleware/auth.js';
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

// Protected routes
router.post('/items', protect, createHomebrewItem);
router.put('/items/:id', protect, updateHomebrewItem);
router.delete('/items/:id', protect, deleteHomebrewItem);
router.post('/items/:id/publish', protect, publishHomebrewItem);
router.post('/items/:id/vote', protect, voteHomebrewItem);
router.post('/items/:id/report', protect, reportHomebrewItem);
router.post('/items/:id/fork', protect, forkHomebrewItem);

// Admin routes (TODO: Add admin middleware)
router.post('/admin/items/:id/approve', protect, approveHomebrewItem);
router.post('/admin/items/:id/reject', protect, rejectHomebrewItem);

export default router;
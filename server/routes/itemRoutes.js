// server/routes/itemRoutes.js
import express from 'express';
import {
  getItems,
  getItem,
  getItemsByTypeRoute,
  getWeaponsByCategoryRoute,
  createItem,
  updateItem,
  deleteItem
} from '../controllers/itemController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getItems);
router.get('/type/:type', getItemsByTypeRoute);
router.get('/weapons/:category', getWeaponsByCategoryRoute);
router.get('/:id', getItem);

// Admin routes - protected (removed admin middleware for now)
router.post('/', protect, createItem);
router.put('/:id', protect, updateItem);
router.delete('/:id', protect, deleteItem);

export default router;
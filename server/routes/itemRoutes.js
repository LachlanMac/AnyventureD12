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
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getItems);
router.get('/type/:type', getItemsByTypeRoute);
router.get('/weapons/:category', getWeaponsByCategoryRoute);
router.get('/:id', getItem);

// Admin routes - protected
router.post('/', protect, admin, createItem);
router.put('/:id', protect, admin, updateItem);
router.delete('/:id', protect, admin, deleteItem);

export default router;

// Don't forget to add this middleware function to your auth.js if it doesn't exist
// This is just an example of what the admin middleware might look like:
/*
export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};
*/
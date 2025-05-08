// server/routes/traitRoutes.js
import express from 'express';
import {
  getTraits,
  getTrait,
  getTraitsByType
} from '../controllers/traitController.js';

const router = express.Router();

// Public trait routes
router.route('/')
  .get(getTraits);

router.route('/type/:type')
  .get(getTraitsByType);

router.route('/:id')
  .get(getTrait);

export default router;
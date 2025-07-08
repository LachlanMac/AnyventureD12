// server/routes/traitRoutes.js
import express from 'express';
import {
  getTraits,
  getTrait,
  getTraitByName,
  getTraitsByType
} from '../controllers/traitController.js';

const router = express.Router();

// Public trait routes
router.route('/')
  .get(getTraits);

router.route('/name/:name')
  .get(getTraitByName);

router.route('/type/:type')
  .get(getTraitsByType);

router.route('/:id')
  .get(getTrait);

export default router;
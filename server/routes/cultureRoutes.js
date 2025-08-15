// server/routes/cultureRoutes.js
import express from 'express';
import {
  getCultures,
  getCulture,
  getCultureByName
} from '../controllers/cultureController.js';

const router = express.Router();

// Public culture routes
router.route('/')
  .get(getCultures);

router.route('/name/:name')
  .get(getCultureByName);

router.route('/:id')
  .get(getCulture);

export default router;
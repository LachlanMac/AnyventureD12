// server/routes/ancestryRoutes.js
import express from 'express';
import {
  getAncestries,
  getAncestry,
  getAncestryByName
} from '../controllers/ancestryController.js';

const router = express.Router();

// Public ancestry routes
router.route('/')
  .get(getAncestries);

router.route('/name/:name')
  .get(getAncestryByName);

router.route('/:id')
  .get(getAncestry);

export default router;
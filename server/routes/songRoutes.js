import express from 'express';
import { getSongs, getSong } from '../controllers/songController.js';

const router = express.Router();

// Public: list songs from data/songs
router.get('/', getSongs);
router.get('/:id', getSong);

export default router;

import express from 'express';
import { protect } from '../middleware/auth.js';
import { getCharacterSongs, addSongToCharacter, removeSongFromCharacter } from '../controllers/songController.js';

const router = express.Router({ mergeParams: true });

router.use(protect);

router.route('/')
  .get(getCharacterSongs);

router.route('/:songId')
  .post(addSongToCharacter)
  .delete(removeSongFromCharacter);

export default router;


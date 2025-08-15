// server/routes/characterSpellRoutes.js
import express from 'express';
import {
  getCharacterSpells,
  addSpellToCharacter,
  removeSpellFromCharacter
} from '../controllers/spellController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// All routes need authentication
router.use(protect);

router.route('/')
  .get(getCharacterSpells);

router.route('/:spellId')
  .post(addSpellToCharacter)
  .delete(removeSpellFromCharacter);

export default router;
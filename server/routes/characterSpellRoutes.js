// server/routes/characterSpellRoutes.js
import express from 'express';
import {
  getCharacterSpells,
  addSpellToCharacter,
  removeSpellFromCharacter,
  addSorcererSpell,
  removeSorcererSpell,
  addThiefSpell,
  removeThiefSpell
} from '../controllers/spellController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// All routes need authentication
router.use(protect);

router.route('/')
  .get(getCharacterSpells);

router.route('/sorcerer/:spellId')
  .post(addSorcererSpell)
  .delete(removeSorcererSpell);

router.route('/thief/:spellId')
  .post(addThiefSpell)
  .delete(removeThiefSpell);

router.route('/:spellId')
  .post(addSpellToCharacter)
  .delete(removeSpellFromCharacter);

export default router;
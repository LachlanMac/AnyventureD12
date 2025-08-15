// server/routes/spellRoutes.js
import express from 'express';
import {
  getSpells,
  getSpell,
  getSpellsBySchool,
  getSpellsBySubschool,
} from '../controllers/spellController.js';


const router = express.Router();

// Public spell routes
router.route('/')
  .get(getSpells);

router.route('/school/:school')
  .get(getSpellsBySchool);

router.route('/subschool/:subschool')
  .get(getSpellsBySubschool);

router.route('/:id')
  .get(getSpell);

export default router;
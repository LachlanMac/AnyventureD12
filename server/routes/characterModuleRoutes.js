// server/routes/characterModuleRoutes.js
import express from 'express';
import {
  getCharacterModules,
  addModuleToCharacter,
  removeModuleFromCharacter,
  selectModuleOption,
  deselectModuleOption
} from '../controllers/moduleController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// All routes need authentication
router.use(protect);

router.route('/')
  .get(getCharacterModules);

router.route('/:moduleId')
  .post(addModuleToCharacter)
  .delete(removeModuleFromCharacter);

router.route('/:moduleId/options')
  .post(selectModuleOption);

router.route('/:moduleId/options/:location')
  .delete(deselectModuleOption);

export default router;
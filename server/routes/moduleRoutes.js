// server/routes/moduleRoutes.js
import express from 'express';
import {
  getModules,
  getModule,
  getModulesByType
} from '../controllers/moduleController.js';

const router = express.Router();

// Public module routes
router.route('/')
  .get(getModules);

router.route('/type/:type')
  .get(getModulesByType);

router.route('/:id')
  .get(getModule);

export default router;

// This file would be separate: server/routes/characterModuleRoutes.js
// import express from 'express';
// import {
//   getCharacterModules,
//   addModuleToCharacter,
//   removeModuleFromCharacter,
//   selectModuleOption,
//   deselectModuleOption
// } from '../controllers/moduleController.js';
// import { protect } from '../middleware/auth.js';

// const router = express.Router({ mergeParams: true });

// // All routes need authentication
// router.use(protect);

// router.route('/')
//   .get(getCharacterModules);
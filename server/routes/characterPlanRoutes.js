import express from 'express';
import Character from '../models/Character.js';
import Module from '../models/Module.js';
import { protect } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.use(protect);

// GET planned modules
router.get('/', async (req, res) => {
  try {
    const character = await Character.findById(req.params.characterId)
      .populate('plannedModules.moduleId')
      .lean();
    if (!character) return res.status(404).json({ message: 'Character not found' });
    res.json(character.plannedModules || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT replace entire plan
router.put('/', async (req, res) => {
  try {
    const character = await Character.findById(req.params.characterId);
    if (!character) return res.status(404).json({ message: 'Character not found' });
    if (character.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    character.plannedModules = req.body.plannedModules || [];
    await character.save();

    const updated = await Character.findById(character._id)
      .populate('plannedModules.moduleId')
      .lean();
    res.json(updated.plannedModules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET export plan as template JSON
router.get('/export', async (req, res) => {
  try {
    const character = await Character.findById(req.params.characterId)
      .populate('plannedModules.moduleId')
      .populate('modules.moduleId')
      .lean();
    if (!character) return res.status(404).json({ message: 'Character not found' });

    const template = {
      name: `${character.name} Template`,
      description: '',
      attributes: character.attributes,
      weaponTalents: character.weaponTalents,
      magicTalents: character.magicTalents,
      craftingTalents: character.craftingTalents,
      plannedModules: (character.plannedModules || []).map(pm => ({
        moduleId: pm.moduleId?._id || pm.moduleId,
        moduleName: pm.moduleId?.name || 'Unknown',
        moduleType: pm.moduleId?.mtype || 'unknown',
        selectedOptions: pm.selectedOptions,
        progressionTier: pm.progressionTier
      })),
      spells: (character.spells || []).map(s => ({
        spellId: s.spellId,
        name: s.name
      }))
    };

    res.json(template);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

import express from 'express';
import Character from '../models/Character.js';
import Module from '../models/Module.js';
import fs from 'fs';
import path from 'path';
import Template from '../models/Template.js';
import { protect, requireAdmin } from '../middleware/auth.js';
import {
  buildTemplateFromCharacter,
  checkStagePoints,
  checkTemplateBudget,
  checkTierOrder,
  serializeTemplate,
  templateFileName
} from '../utils/templateExport.js';
import { templatesDir, upsertOfficialTemplate } from '../utils/templateSeeder.js';

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

const loadCharacterForExport = (characterId) =>
  Character.findById(characterId)
    .populate('modules.moduleId')
    .populate('plannedModules.moduleId')
    .populate('spells.spellId')
    .populate('sorcererSpells.spellId')
    .populate('thiefSpells.spellId')
    .populate('traits.traitId')
    .lean();

// All export rules: creation budget (stars, attribute points, extra training) plus every
// stage used being exactly 15 / 25 / 35 / 45 module points.
const checkExportRules = (character, template) => {
  const docsByName = new Map();
  for (const m of character.plannedModules || []) {
    if (m.moduleId && typeof m.moduleId === 'object') docsByName.set(m.moduleId.name, m.moduleId);
  }
  const stages = checkStagePoints(
    template.modules.map(m => ({ moduleDoc: docsByName.get(m.module), options: m.options }))
  );
  const budget = checkTemplateBudget(template);
  return {
    ...budget,
    stageTotals: stages.totals,
    maxStage: stages.maxStage,
    errors: [
      ...stages.errors,
      ...checkTierOrder(template.modules.map(m => ({ name: m.module, options: m.options }))),
      ...budget.errors
    ]
  };
};

// GET the template JSON this character would export to (no side effects)
router.get('/export', async (req, res) => {
  try {
    const character = await loadCharacterForExport(req.params.characterId);
    if (!character) return res.status(404).json({ message: 'Character not found' });
    if (character.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const template = buildTemplateFromCharacter(character, req.query);
    res.json({ template, budget: checkExportRules(character, template) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST save this character as an official template (admin only).
// Writes data/templates/<name>.json and loads it into the database.
// Body: { name, description, playstyle, category, overwrite }
router.post('/export', requireAdmin, async (req, res) => {
  try {
    const { name, overwrite = false } = req.body || {};
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'Template name is required' });
    }

    const character = await loadCharacterForExport(req.params.characterId);
    if (!character) return res.status(404).json({ message: 'Character not found' });

    const data = buildTemplateFromCharacter(character, req.body);
    if (data.modules.length === 0) {
      return res.status(400).json({ message: 'This character has no planned modules' });
    }

    // Exact stage points, plus the base creation budget (templates ignore ancestry and trait)
    const budget = checkExportRules(character, data);
    if (budget.errors.length > 0) {
      return res.status(400).json({ message: budget.errors.join(' '), budget });
    }

    const fileName = templateFileName(data.name);
    const filePath = path.join(templatesDir, fileName);
    const existing = await Template.findOne({
      name: { $regex: `^${data.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
    });

    if ((fs.existsSync(filePath) || existing) && !overwrite) {
      return res.status(409).json({
        message: `A template named "${data.name}" already exists (${fileName}). Overwrite it?`,
        exists: true,
        fileName
      });
    }

    // Keep the existing template's exact name so the seeder matches it and keeps its _id
    if (existing) data.name = existing.name;

    fs.mkdirSync(templatesDir, { recursive: true });
    fs.writeFileSync(filePath, serializeTemplate(data), 'utf8');

    const { template, warnings } = await upsertOfficialTemplate(data);
    res.json({ templateId: template._id, fileName, warnings, template: data });
  } catch (err) {
    console.error('Error exporting template:', err);
    res.status(500).json({ message: err.message });
  }
});

export default router;

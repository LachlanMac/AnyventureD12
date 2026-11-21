import express from 'express';
import Template from '../models/Template.js';
import Character from '../models/Character.js';
import Module from '../models/Module.js';
import Spell from '../models/Spell.js';
import { applyModuleBonusesToCharacter, extractTraitsFromModules } from '../utils/characterUtils.js';
import { parseDataString } from '../utils/dataCodeParsers.js';
import { STAGE_POINTS, moduleCost } from '../utils/templateExport.js';

const router = express.Router();

// Die faces by skill value (0 = d6 ... 7 = d30), with dice tier up/down shifts
const DIE_FACES = [6, 8, 10, 12, 16, 20, 24, 30];
const DIE_FACES_UP = [8, 10, 12, 16, 20, 24, 30, 36];
const DIE_FACES_DOWN = [4, 6, 8, 10, 12, 16, 20, 24];
const SPELL_SCHOOL_TO_MAGIC = {
  black: 'black', primal: 'primal', meta: 'meta', white: 'white', mysticism: 'mystic', arcane: 'arcane'
};

// Highest number a magic skill can roll; 0 if it has no talent (can't roll at all)
const maxMagicRoll = (skill) => {
  if (!skill || (skill.talent ?? 0) < 1) return 0;
  const v = Math.max(0, Math.min(skill.value ?? 0, 7));
  const mod = skill.diceTierModifier ?? 0;
  return (mod > 0 ? DIE_FACES_UP : mod < 0 ? DIE_FACES_DOWN : DIE_FACES)[v];
};

const ATTRIBUTE_SKILLS = {
  physique: ['fitness', 'deflection', 'might', 'endurance'],
  finesse: ['evasion', 'stealth', 'coordination', 'thievery'],
  mind: ['resilience', 'concentration', 'senses', 'logic'],
  knowledge: ['wildcraft', 'academics', 'magic', 'medicine'],
  social: ['expression', 'presence', 'insight', 'persuasion']
};

// Highest stage any option in the template is picked at
const getMaxStage = (template) => {
  let max = 1;
  for (const m of template.modules) {
    for (const stage of m.selectedOptions.values()) {
      if (stage > max) max = stage;
    }
  }
  return max;
};

// Build an unsaved character from a template at a given stage and run it through
// the same bonus/trait pipeline the character sheet uses.
const buildPreviewCharacter = async (template, stage) => {
  const moduleIds = template.modules.map(m => m.moduleId).filter(Boolean);
  const moduleDocs = await Module.find({ _id: { $in: moduleIds } }).lean();
  const moduleById = new Map(moduleDocs.map(m => [m._id.toString(), m]));

  const weaponSkills = {};
  for (const [key, talent] of Object.entries(template.weaponTalents.toObject())) {
    weaponSkills[key] = { value: 0, talent, diceTierModifier: 0 };
  }
  const magicSkills = {};
  for (const [key, talent] of Object.entries(template.magicTalents.toObject())) {
    magicSkills[key] = { value: 0, talent, diceTierModifier: 0 };
  }
  const craftingSkills = {};
  for (const [key, talent] of Object.entries(template.craftingTalents.toObject())) {
    craftingSkills[key] = { value: 0, talent, diceTierModifier: 0 };
  }

  const attributes = template.attributes.toObject();

  // Mongoose fills in every other Character default (resources, movement, skills, etc.)
  const doc = new Character({
    userId: 'template-preview',
    name: template.name,
    attributes,
    weaponSkills,
    magicSkills,
    craftingSkills
  });
  const character = doc.toObject();

  // Same base values getCharacter resets to before applying bonuses
  character.resources.health.max = 20;
  character.resources.resolve.max = 20;
  character.resources.morale.max = 10;
  character.resources.energy.max = 5;
  character.movement = 5;
  character.initiative = 0;
  character.spellSlots = 10;

  for (const [attr, skills] of Object.entries(ATTRIBUTE_SKILLS)) {
    for (const skill of skills) {
      character.skills[skill].talent = attributes[attr];
    }
  }

  // Modules with only the options picked at or before this stage, in tier order
  const modules = [];
  const moduleSummaries = [];
  let pointsSpent = 0;

  for (const tm of template.modules) {
    const moduleDoc = tm.moduleId ? moduleById.get(tm.moduleId.toString()) : null;
    const picks = [...tm.selectedOptions.entries()]
      .filter(([, s]) => s <= stage)
      .map(([loc]) => loc)
      .sort();

    moduleSummaries.push({
      moduleId: moduleDoc?._id ?? null,
      name: tm.moduleName,
      mtype: moduleDoc?.mtype ?? null,
      found: !!moduleDoc,
      options: [...tm.selectedOptions.entries()]
        .map(([location, s]) => ({
          location,
          stage: s,
          name: moduleDoc?.options.find(o => o.location === location)?.name ?? '(unknown option)'
        }))
        .sort((a, b) => a.location.localeCompare(b.location))
    });

    if (!moduleDoc || picks.length === 0) continue;
    pointsSpent += moduleCost(moduleDoc, picks);
    modules.push({
      moduleId: moduleDoc,
      selectedOptions: picks.map(location => ({ location }))
    });
  }

  character.modules = modules;

  // Spells: same shape as Character.spells so the character SpellsTab can render them
  for (const listKey of ['spells', 'sorcererSpells', 'thiefSpells']) {
    character[listKey] = (template[listKey] || [])
      .filter(s => s.spellId)
      .map(s => ({ _id: s.spellId, spellId: s.spellId }));
  }
  const missingSpells = ['spells', 'sorcererSpells', 'thiefSpells'].flatMap(listKey =>
    (template[listKey] || []).filter(s => !s.spellId).map(s => s.spellName)
  );

  // Extra Training: one pick per 10 module points, so the nth pick unlocks at stage n
  const trainingSlots = Math.floor(STAGE_POINTS[stage] / 10);
  const extraTraining = (template.extraTraining || []).map((t, i) => ({
    name: t.name,
    stage: i + 1,
    unlocked: i < trainingSlots,
    found: !!t.data
  }));
  (template.extraTraining || []).slice(0, trainingSlots).forEach(t => {
    if (!t.data) return;
    const b = parseDataString(t.data, {});
    for (const [skill, v] of Object.entries(b.skills || {})) {
      if (character.skills[skill]) character.skills[skill].value += v;
    }
    for (const group of ['weaponSkills', 'magicSkills', 'craftingSkills']) {
      for (const [skill, v] of Object.entries(b[group] || {})) {
        if (character[group][skill] && v.value) character[group][skill].value += v.value;
      }
    }
  });

  applyModuleBonusesToCharacter(character);

  // Only show spells this stage can actually cast: the school's magic skill must be able to
  // roll the spell's RC (talent >= 1 and die size >= RC). Spells it can't reach yet aren't
  // known at this stage, so they're also left out of slot counts.
  const allSpellIds = ['spells', 'sorcererSpells', 'thiefSpells']
    .flatMap(k => character[k].map(s => s.spellId));
  const spellDocs = await Spell.find({ _id: { $in: allSpellIds } }).select('name school checkToCast').lean();
  const spellById = new Map(spellDocs.map(sp => [sp._id.toString(), sp]));
  const lockedSpells = [];
  for (const listKey of ['spells', 'sorcererSpells', 'thiefSpells']) {
    character[listKey] = character[listKey].filter(s => {
      const sp = spellById.get(s.spellId.toString());
      if (!sp) return false;
      const magicKey = SPELL_SCHOOL_TO_MAGIC[sp.school];
      const maxRoll = maxMagicRoll(character.magicSkills?.[magicKey]);
      if (maxRoll >= (sp.checkToCast ?? 0)) return true;
      lockedSpells.push({ name: sp.name, list: listKey, school: sp.school, rc: sp.checkToCast, maxRoll });
      return false;
    });
  }

  character.derivedTraits = extractTraitsFromModules(character);

  return {
    character,
    moduleSummaries,
    missingSpells,
    lockedSpells,
    extraTraining,
    stage,
    maxStage: getMaxStage(template),
    pointsSpent,
    stagePoints: STAGE_POINTS[stage]
  };
};

// GET all templates
router.get('/', async (req, res) => {
  try {
    const templates = await Template.find().sort({ category: 1, name: 1 });
    res.json(templates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single template by id
router.get('/:id', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template not found' });
    res.json(template);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET the computed character a template produces at a given stage (?stage=1-4)
router.get('/:id/preview', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template not found' });

    const requested = parseInt(req.query.stage, 10);
    const maxStage = getMaxStage(template);
    const stage = Number.isNaN(requested) ? 1 : Math.min(Math.max(requested, 1), maxStage);

    const preview = await buildPreviewCharacter(template, stage);
    res.json({ template, ...preview });
  } catch (err) {
    console.error('Error building template preview:', err);
    res.status(500).json({ message: err.message });
  }
});

export default router;

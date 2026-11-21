import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Template from '../models/Template.js';
import Module from '../models/Module.js';
import Spell from '../models/Spell.js';
import Trait from '../models/Trait.js';
import {
  checkStagePoints,
  checkTemplateBudget,
  checkTierOrder,
  TEMPLATE_SPELL_LISTS
} from './templateExport.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const templatesDir = path.resolve(__dirname, '../../data/templates');

const VERBOSE_LOGGING = true;

const readTemplatesFromFS = () => {
  try {
    if (!fs.existsSync(templatesDir)) {
      console.log('Templates directory not found, creating it...');
      fs.mkdirSync(templatesDir, { recursive: true });
      return { templates: [], templateNames: [] };
    }

    const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.json'));
    const templates = [];
    const templateNames = [];

    for (const file of files) {
      const filePath = path.join(templatesDir, file);
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        if (!data.name) {
          console.error(`Template in ${filePath} is missing a name property`);
          continue;
        }

        templates.push(data);
        templateNames.push(data.name.toLowerCase());
      } catch (err) {
        console.error(`Error parsing ${filePath}: ${err.message}`);
      }
    }

    return { templates, templateNames };
  } catch (err) {
    console.error(`Error reading templates directory: ${err.message}`);
    return { templates: [], templateNames: [] };
  }
};

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const findByNameCI = (Model, name, extra = {}) =>
  Model.findOne({ name: { $regex: `^${escapeRegex(name)}$`, $options: 'i' }, ...extra });


// Template JSON refers to modules and spells by name:
//   "modules": [{ "module": "Melee Specialist", "options": { "1": 1, "2a": 1 } }]
//   "spells": ["Firebolt"], "sorcererSpells": [...], "thiefSpells": [...]
// Resolve names to ObjectIds and collect warnings for anything that doesn't match.
export const resolveTemplateRefs = async (data) => {
  const warnings = [];
  const modules = [];
  const costEntries = []; // for the exact stage points check

  for (const entry of data.modules || []) {
    const moduleName = entry.module || entry.moduleName;
    if (!moduleName) {
      warnings.push('A module entry has no name');
      continue;
    }

    const moduleDoc = await findByNameCI(Module, moduleName);
    if (!moduleDoc) warnings.push(`Module "${moduleName}" not found`);

    const options = entry.options || entry.selectedOptions || {};
    if (moduleDoc) {
      const validLocations = new Set(moduleDoc.options.map(o => o.location));
      for (const loc of Object.keys(options)) {
        if (!validLocations.has(loc)) {
          warnings.push(`${moduleDoc.name} has no option at location "${loc}"`);
        }
      }
    }

    if (moduleDoc) costEntries.push({ moduleDoc, options });

    modules.push({
      moduleId: moduleDoc ? moduleDoc._id : null,
      moduleName: moduleDoc ? moduleDoc.name : moduleName,
      selectedOptions: options
    });
  }

  const spellLists = {};
  for (const listKey of TEMPLATE_SPELL_LISTS) {
    spellLists[listKey] = [];
    for (const entry of data[listKey] || []) {
      const spellName = typeof entry === 'string' ? entry : entry?.spellName || entry?.name;
      if (!spellName) continue;
      // Prefer official spells; fall back to any spell with the name
      const spellDoc =
        (await findByNameCI(Spell, spellName, { isHomebrew: { $ne: true } })) ||
        (await findByNameCI(Spell, spellName));
      if (!spellDoc) warnings.push(`Spell "${spellName}" (${listKey}) not found`);
      spellLists[listKey].push({
        spellId: spellDoc ? spellDoc._id : null,
        spellName: spellDoc ? spellDoc.name : spellName
      });
    }
  }

  warnings.push(...checkStagePoints(costEntries).errors);
  warnings.push(...checkTierOrder(modules.map(m => ({ name: m.moduleName, options: m.selectedOptions }))));

  // Extra Training: names like "Evasion" or "Complex Melee Weapons" -> the subchoice's data code
  const extraTraining = [];
  if ((data.extraTraining || []).length > 0) {
    const trait = await Trait.findOne({ name: 'Extra Training' }).lean();
    const subchoices = (trait?.options || []).flatMap(o => o.subchoices || []);
    for (const entry of data.extraTraining) {
      const name = typeof entry === 'string' ? entry : entry?.name;
      if (!name) continue;
      const lower = name.toLowerCase();
      const sub = subchoices.find(sc => sc.name?.toLowerCase() === lower || sc.id === lower);
      if (!sub) warnings.push(`Extra Training "${name}" not found`);
      extraTraining.push({ name: sub ? sub.name : name, data: sub ? sub.data : null });
    }
  }

  return { data: { ...data, modules, ...spellLists, extraTraining }, warnings };
};

// Create or replace one official template from its JSON data. Keeps the existing _id.
export const upsertOfficialTemplate = async (raw) => {
  if (!raw?.name || typeof raw.name !== 'string') {
    throw new Error('Template is missing a valid name');
  }

  const { data, warnings } = await resolveTemplateRefs(raw);
  warnings.push(...checkTemplateBudget(raw).errors);
  for (const w of warnings) console.error(`Template "${raw.name}": ${w}`);

  const existing = await Template.findOne({ name: data.name });
  let template;
  if (existing) {
    if (VERBOSE_LOGGING) console.log(`Updating existing template: ${data.name}`);
    await Template.replaceOne({ _id: existing._id }, { ...data, _id: existing._id, source: 'official' });
    template = await Template.findById(existing._id);
  } else {
    if (VERBOSE_LOGGING) console.log(`Creating new template: ${data.name}`);
    template = await Template.create({ ...data, source: 'official' });
  }

  return { template, warnings };
};

export const seedTemplates = async () => {
  try {
    const { templates, templateNames } = readTemplatesFromFS();

    if (!templates.length) {
      console.log('No template data found.');
      return;
    }

    console.log(`Found ${templates.length} templates to seed.`);

    for (const raw of templates) {
      try {
        await upsertOfficialTemplate(raw);
      } catch (error) {
        console.error(`Error processing template ${raw?.name || 'unknown'}: ${error.message}`);
      }
    }

    // Delete templates from DB that no longer exist in JSON (official only)
    const allDbTemplates = await Template.find({ source: 'official' });
    const toDelete = allDbTemplates.filter(
      t => t.name && !templateNames.includes(t.name.toLowerCase())
    );

    if (toDelete.length > 0) {
      console.log(`Deleting ${toDelete.length} templates not in JSON files...`);
      for (const t of toDelete) {
        if (VERBOSE_LOGGING) console.log(`Deleting template: ${t.name}`);
        await Template.deleteOne({ _id: t._id });
      }
    }

    console.log('Template seeding completed successfully.');
  } catch (err) {
    console.error(`Error seeding templates: ${err.message}`);
  }
};

export const resetAndReseedTemplates = async () => {
  try {
    console.log('Starting template reset and reseed...');
    await seedTemplates();
    console.log('Template reset and reseed completed successfully!');
    return true;
  } catch (err) {
    console.error(`Error during template reset: ${err.message}`);
    return false;
  }
};

export const initializeTemplates = async () => {
  try {
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
      console.log('Created templates directory.');
    }
    await seedTemplates();
  } catch (err) {
    console.error(`Error initializing templates: ${err.message}`);
  }
};

import mongoose from 'mongoose';
const { Schema } = mongoose;

// Progression stages a template option can be picked at.
// 1 = Starter (15 pts), 2 = Advanced (25), 3 = Veteran (35), 4 = Elite (45)
export const TEMPLATE_STAGES = [1, 2, 3, 4];

const TemplateModuleSchema = new Schema({
  // Resolved from moduleName by the seeder. Null if the module could not be found.
  moduleId: { type: Schema.Types.ObjectId, ref: 'Module', default: null },
  moduleName: { type: String, required: true },
  // location ("1", "2a", "3", ...) -> stage the option is picked at (1-4)
  selectedOptions: { type: Map, of: Number, default: {} }
}, { _id: false });

const TemplateSpellSchema = new Schema({
  // Resolved from spellName by the seeder. Null if the spell could not be found.
  spellId: { type: Schema.Types.ObjectId, ref: 'Spell', default: null },
  spellName: { type: String, required: true }
}, { _id: false });

const talentBlock =(keys, defaults = {}) =>
  Object.fromEntries(keys.map(k => [k, { type: Number, default: defaults[k] ?? 0 }]));

const TemplateSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  // Short "how to play this" text shown on the detail page
  playstyle: { type: String, default: '' },
  category: {
    type: String,
    enum: ['martial', 'magic', 'hybrid', 'support', 'utility'],
    default: 'martial'
  },
  modules: [TemplateModuleSchema],
  // Spells have no stage; the preview compares them to the slots available at each stage
  spells: [TemplateSpellSchema],
  sorcererSpells: [TemplateSpellSchema],
  thiefSpells: [TemplateSpellSchema],
  // Extra Training picks in order: the 1st unlocks at stage 1 (15 pts), 2nd at stage 2, ...
  // (one per 10 module points). `data` is resolved from the Extra Training trait by the seeder.
  extraTraining: [new Schema({
    name: { type: String, required: true },
    data: { type: String, default: null }
  }, { _id: false })],
  attributes: talentBlock(['physique', 'finesse', 'mind', 'knowledge', 'social'], {
    physique: 1, finesse: 1, mind: 1, knowledge: 1, social: 1
  }),
  // Keys match Character.weaponSkills / magicSkills / craftingSkills so they copy straight across
  weaponTalents: talentBlock(
    ['brawling', 'throwing', 'simpleRangedWeapons', 'complexRangedWeapons', 'simpleMeleeWeapons', 'complexMeleeWeapons'],
    { brawling: 1, throwing: 1, simpleRangedWeapons: 1, simpleMeleeWeapons: 1 }
  ),
  magicTalents: talentBlock(['black', 'primal', 'meta', 'white', 'mystic', 'arcane']),
  craftingTalents: talentBlock(['engineering', 'fabrication', 'alchemy', 'cooking', 'glyphcraft', 'biosculpting']),
  source: {
    type: String,
    enum: ['official', 'community'],
    default: 'official'
  }
}, { timestamps: true });

const Template = mongoose.model('Template', TemplateSchema);
export default Template;

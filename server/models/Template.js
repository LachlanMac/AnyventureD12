import mongoose from 'mongoose';
const { Schema } = mongoose;

const TemplateModuleSchema = new Schema({
  moduleId: { type: Number, required: true },
  moduleName: { type: String, required: true },
  selectedOptions: { type: Map, of: String, default: {} },
  progressionTier: { type: Number, required: true, min: 1, max: 4 }
}, { _id: false });

const TemplateSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  category: {
    type: String,
    enum: ['martial', 'magic', 'hybrid', 'support', 'utility'],
    default: 'martial'
  },
  tier: {
    type: String,
    enum: ['starter', 'advanced', 'veteran', 'elite'],
    default: 'starter'
  },
  modulePoints: { type: Number, default: 15 },
  modules: [TemplateModuleSchema],
  attributes: {
    physique: { type: Number, default: 1 },
    finesse: { type: Number, default: 1 },
    mind: { type: Number, default: 1 },
    knowledge: { type: Number, default: 1 },
    social: { type: Number, default: 1 }
  },
  weaponTalents: {
    unarmed: { type: Number, default: 0 },
    throwing: { type: Number, default: 0 },
    simpleMelee: { type: Number, default: 0 },
    simpleRanged: { type: Number, default: 0 },
    complexMelee: { type: Number, default: 0 },
    complexRanged: { type: Number, default: 0 }
  },
  magicTalents: {
    black: { type: Number, default: 0 },
    primal: { type: Number, default: 0 },
    metamagic: { type: Number, default: 0 },
    white: { type: Number, default: 0 },
    mysticism: { type: Number, default: 0 },
    arcane: { type: Number, default: 0 }
  },
  craftingTalents: {
    engineering: { type: Number, default: 0 },
    fabrication: { type: Number, default: 0 },
    alchemy: { type: Number, default: 0 },
    cooking: { type: Number, default: 0 },
    glyphcraft: { type: Number, default: 0 },
    biosculpting: { type: Number, default: 0 }
  },
  source: {
    type: String,
    enum: ['official', 'community'],
    default: 'official'
  }
}, { timestamps: true });

const Template = mongoose.model('Template', TemplateSchema);
export default Template;

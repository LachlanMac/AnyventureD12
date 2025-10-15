// server/models/Injury.js
import mongoose from 'mongoose';
import { generateFoundryId } from '../utils/foundryIdGenerator.js';

const { Schema } = mongoose;

const InjurySchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['cosmetic_injury', 'missing_part', 'physical_injury', 'mental_injury']
  },
  severity: {
    type: String,
    enum: ['minor', 'major', 'severe'],
    default: null
  },
  data: {
    type: String,
    default: ''
  },
  pain: {
    type: Number,
    required: true,
    default: 0
  },
  stress: {
    type: Number,
    default: 0
  },
  recovery_dc: {
    type: Number,
    default: null
  },
  recovery_stat: {
    type: String,
    enum: ['endurance', 'resilience'],
    default: null
  },
  foundry_icon: {
    type: String,
    default: ''
  },
  foundry_id: {
    type: String,
    unique: true,
    default: generateFoundryId
  }
}, {
  timestamps: true
});

// Index for efficient queries
InjurySchema.index({ type: 1 });
InjurySchema.index({ id: 1 });

export default mongoose.model('Injury', InjurySchema);
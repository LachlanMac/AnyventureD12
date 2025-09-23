// server/models/Language.js
import mongoose from 'mongoose';
import { generateFoundryId } from '../utils/foundryIdGenerator.js';

const { Schema } = mongoose;

const LanguageSchema = new Schema({
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
  code: {
    type: String,
    default: ''
  },
  magic: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 1
  },
  foundry_icon: {
    type: String,
    required: true
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
LanguageSchema.index({ magic: 1 });

export default mongoose.model('Language', LanguageSchema);
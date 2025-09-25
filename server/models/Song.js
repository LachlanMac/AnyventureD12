import mongoose from 'mongoose';
const { Schema } = mongoose;

const HarmonySchema = new Schema({
  instrument: { type: String, enum: ['vocal', 'percussion', 'wind', 'strings', 'brass', 'any'], required: true },
  effect: { type: String, default: '' }
}, { _id: false });

const SongSchema = new Schema({
  id: { type: Number, required: false },
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['song', 'ballad'], required: true },
  magical: { type: Boolean, default: false },
  difficulty: { type: Number, default: 0 },
  description: { type: String, default: '' },
  effect: { type: String, default: '' },
  harmony_1: { type: HarmonySchema, default: null },
  harmony_2: { type: HarmonySchema, default: null },
  foundry_id: {
    type: String,
    required: true,
    unique: true,
    minlength: 16,
    maxlength: 16
  },
  foundry_icon: {
    type: String,
    required: false,
    default: ''
  }
}, { timestamps: true });

const Song = mongoose.model('Song', SongSchema);
export default Song;

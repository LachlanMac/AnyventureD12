// server/models/Trait.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const TraitSchema = new Schema({
  name: { 
    type: String, 
    required: true,
    unique: true 
  },
  type: { 
    type: String, 
    enum: ['positive', 'negative'],
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  effects: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

const Trait = mongoose.model('Trait', TraitSchema);

export default Trait;
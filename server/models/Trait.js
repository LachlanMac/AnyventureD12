// server/models/Trait.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const TraitOptionSchema = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  data: { 
    type: String, 
    default: "" 
  },
  selected: { 
    type: Boolean, 
    default: false 
  }
});

const TraitSchema = new Schema({
  name: { 
    type: String, 
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  options: [TraitOptionSchema]
}, {
  timestamps: true
});

const Trait = mongoose.model('Trait', TraitSchema);

export default Trait;
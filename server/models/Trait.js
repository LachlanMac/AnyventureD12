// server/models/Trait.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const SubchoiceSchema = new Schema({
  id: {
    type: String,
    required: true
  },
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
  }
});

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
  },
  subchoices: [SubchoiceSchema],
  requiresChoice: {
    type: Boolean,
    default: false
  },
  choiceType: {
    type: String,
    default: ""
  },
  selectedSubchoice: {
    type: String,
    default: ""
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
  options: [TraitOptionSchema],
  foundry_id: {
    type: String,
    required: true,
    unique: true,
    minlength: 16,
    maxlength: 16
  }
}, {
  timestamps: true
});

const Trait = mongoose.model('Trait', TraitSchema);

export default Trait;
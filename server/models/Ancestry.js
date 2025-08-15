// server/models/Ancestry.js
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

const AncestryOptionSchema = new Schema({
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
  }
});

const AncestrySchema = new Schema({
  name: { 
    type: String, 
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  homeworld: {
    type: String,
    required: false
  },
  img: {
    type: String,
    required: false
  },
  portrait: {
    type: String,
    required: false
  },
  lifespan: {
    type: String,
    required: false
  },
  height: {
    type: String,
    required: false
  },
  size: {
    type: String,
    required: false,
    default: "Medium"
  },
  home: {
    type: String,
    required: false
  },
  language: {
    type: String,
    required: false
  },
  options: [AncestryOptionSchema]
}, {
  timestamps: true
});

const Ancestry = mongoose.model('Ancestry', AncestrySchema);

export default Ancestry;
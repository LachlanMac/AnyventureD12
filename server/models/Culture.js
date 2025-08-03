// server/models/Culture.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const CultureRestrictionSchema = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  }
}, { _id: false });

const CultureBenefitSchema = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  }
}, { _id: false });

const CultureStartingItemSchema = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  }
}, { _id: false });

const CultureOptionSchema = new Schema({
  name: { 
    type: String,
    default: ""
  },
  description: { 
    type: String,
    default: ""
  },
  data: {
    type: String,
    default: ""
  }
}, { _id: false });

const CultureSchema = new Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: { 
    type: String, 
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  portrait: {
    type: String,
    default: ""
  },
  culturalRestrictions: [CultureRestrictionSchema],
  benefits: [CultureBenefitSchema],
  startingItems: [CultureStartingItemSchema],
  options: {
    type: [CultureOptionSchema],
    default: []
  }
}, {
  timestamps: true
});

const Culture = mongoose.model('Culture', CultureSchema);

export default Culture;
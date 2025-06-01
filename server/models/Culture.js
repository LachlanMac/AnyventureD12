// server/models/Culture.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const CultureOptionSchema = new Schema({
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

const CultureSchema = new Schema({
  name: { 
    type: String, 
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  options: [CultureOptionSchema]
}, {
  timestamps: true
});

const Culture = mongoose.model('Culture', CultureSchema);

export default Culture;
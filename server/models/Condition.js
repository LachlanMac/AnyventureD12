import mongoose from 'mongoose';

const conditionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Mental', 'Physical']
  },
  description: {
    type: String,
    required: true
  },
  table: {
    type: {
      type: String,
      enum: ['roll', 'tier']
    },
    columns: [String],
    rows: [[String]]
  }
}, {
  timestamps: true
});

const Condition = mongoose.model('Condition', conditionSchema);

export default Condition;

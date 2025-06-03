// server/models/Spell.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const SpellSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    default: 'Instantaneous'
  },
  range: {
    type: String,
    default: 'Self'
  },
  school: {
    type: String,
    required: true,
    enum: ['alteration', 'black', 'divine', 'mysticism', 'primal']
  },
  subschool: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        const validSubschools = {
          alteration: ['fey', 'illusion', 'transmutation'],
          black: ['fiend', 'necromancy', 'witchcraft'],
          divine: ['celestial', 'radiant', 'protection'],
          mysticism: ['spirit', 'divination', 'cosmic'],
          primal: ['draconic', 'elemental', 'nature']
        };
        return validSubschools[this.school] && validSubschools[this.school].includes(v);
      },
      message: props => `${props.value} is not a valid subschool for the school ${this.school}`
    }
  },
  checkToCast: {
    type: Number,
    required: true,
    min: 1
  },
  components: {
    type: [String],
    default: []
  },
  ritualDuration: {
    type: String,
    default: null
  },
  concentration: {
    type: Boolean,
    default: false
  },
  reaction: {
    type: Boolean,
    default: false
  },
  energy: {
    type: Number,
    required: true,
    min: 1
  },
  damage: {
    type: Number,
    required: true,
    min: 0
  },
  damageType: {
    type: String,
    required: false,
    enum: [
      'dark',
      'divine',
      'psychic',
      'heat',
      'cold',
      'lightning',
      'aether',
      'toxic',
      'physical',
      'true'
    ]
  },
  // Meta data
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Automatically handle createdAt and updatedAt
});

// Create indexes for faster querying
SpellSchema.index({ school: 1, subschool: 1 });
SpellSchema.index({ name: 1 });
SpellSchema.index({ checkToCast: 1 });

const Spell = mongoose.model('Spell', SpellSchema);

export default Spell;
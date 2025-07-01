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
  charge: {
    type: String,
    required: false,
    default: null
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
      'Dark',
      'Divine',
      'Psychic',
      'Heat',
      'Cold',
      'Lightning',
      'Aetheric',
      'Toxic',
      'Physical',
      'True'
    ]
  },
  // Homebrew fields
  isHomebrew: {
    type: Boolean,
    default: false
  },
  creatorId: {
    type: String, // Discord ID
    required: false
  },
  creatorName: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['draft', 'private', 'published', 'approved', 'rejected'],
    default: 'draft'
  },
  tags: {
    type: [String],
    default: []
  },
  source: {
    type: String, // Campaign or source book
    required: false
  },
  balanceNotes: {
    type: String,
    required: false
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  timesUsed: {
    type: Number,
    default: 0
  },
  votes: [{
    userId: String,
    vote: {
      type: String,
      enum: ['up', 'down']
    }
  }],
  reports: [{
    userId: String,
    reason: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  publishedAt: {
    type: Date,
    default: null
  },
  forkedFrom: {
    type: Schema.Types.ObjectId,
    ref: 'Spell'
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
SpellSchema.index({ isHomebrew: 1, status: 1 });
SpellSchema.index({ creatorId: 1 });

const Spell = mongoose.model('Spell', SpellSchema);

export default Spell;
// server/models/Action.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const ActionSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Action', 'Reaction', 'Both', 'Downtime Action'],
    required: true
  },
  energy: {
    type: Number,
    default: 1, // Default energy cost
    min: 0
  },
  daily: {
    type: Boolean,
    default: false // Can only be used once per day
  },
  magical: {
    type: Boolean,
    default: false // Is this a magical ability
  },
  requirements: {
    // Optional requirements for using this action
    skill: String, // Required skill check (e.g., "medicine")
    skillCheck: Number, // DC for skill check
    range: String, // Range requirement (e.g., "adjacent", "sprint distance")
    condition: String, // Conditional requirements (e.g., "ally at 0 health")
  },
  effects: {
    // Structured effects of the action
    damage: {
      amount: Number,
      type: String // damage type
    },
    healing: {
      amount: Number,
      type: String // "health", "resolve", "energy"
    },
    conditions: [String], // Conditions applied/removed
    duration: String, // Duration of effects
    target: String // "self", "ally", "enemy", "area"
  },
  source: {
    module: String, // Source module name
    moduleId: {
      type: Schema.Types.ObjectId,
      ref: 'Module'
    },
    optionLocation: String // Location in module (e.g., "2a", "5")
  },
  restrictions: {
    perCombat: Number, // Max uses per combat
    perTarget: Boolean, // Can only use once per target
    circumstances: String // Special circumstances text
  },
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

// Helper method to parse action from module option
ActionSchema.statics.fromModuleOption = function(moduleOption, moduleName, moduleId) {
  // Parse the name to determine type
  let type = 'Action';
  let name = moduleOption.name;
  
  if (name.includes('Reaction')) {
    type = 'Reaction';
  } else if (name.includes('Free Action')) {
    type = 'Free Action';
  } else if (name.includes('Downtime Action')) {
    type = 'Downtime Action';
  }
  
  // Clean the name (remove type prefix)
  name = name.replace(/^(Action|Reaction|Free Action|Downtime Action)\s*:\s*/i, '');
  
  return {
    name,
    description: moduleOption.description,
    type,
    source: {
      module: moduleName,
      moduleId: moduleId,
      optionLocation: moduleOption.location
    }
  };
};

const Action = mongoose.model('Action', ActionSchema);

export default Action;
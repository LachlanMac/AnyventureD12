import mongoose from 'mongoose';

const actionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cost: { type: Number, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['attack', 'spell', 'utility', 'movement']
  },
  magic: { type: Boolean, default: false },
  description: { type: String, required: true },
  attack: {
    roll: String, // e.g., "2d6", "3d10", "1d12+2"
    damage: String,
    damage_extra: String,
    damage_type: {
      type: String,
      enum: ['physical', 'heat', 'cold', 'electric', 'dark', 'divine', 'aether', 'psychic', 'toxic']
    },
    secondary_damage: String,
    secondary_damage_extra: String,
    secondary_damage_type: {
      type: String,
      enum: ['physical', 'heat', 'cold', 'electric', 'dark', 'divine', 'aether', 'psychic', 'toxic']
    },
    category: {
      type: String,
      enum: ['pierce', 'slash', 'blunt', 'ranged']
    },
    min_range: Number,
    max_range: Number
  },
  spell: {
    roll: String, // e.g., "3d10", "2d8+1"
    damage: String,
    damage_extra: String,
    damage_type: {
      type: String,
      enum: ['physical', 'heat', 'cold', 'electric', 'dark', 'divine', 'aether', 'psychic', 'toxic']
    },
    secondary_damage: String,
    secondary_damage_extra: String,
    secondary_damage_type: {
      type: String,
      enum: ['physical', 'heat', 'cold', 'electric', 'dark', 'divine', 'aether', 'psychic', 'toxic']
    },
    target_defense: {
      type: String,
      enum: ['evasion', 'deflection', 'resilience', 'none']
    },
    defense_difficulty: Number, // DC for the target to avoid/resist
    min_range: Number,
    max_range: Number
  }
}, { _id: false });

const movementSchema = new mongoose.Schema({
  walk: { type: Number, min: 0, required: true },
  climb: { type: Number, min: 0, default: 0 },
  swim: { type: Number, min: 0, default: 0 },
  fly: { type: Number, min: 0, default: 0 }
}, { _id: false });

const toNonNegativeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }
  return parsed;
};

const normalizeMovement = (movement) => {
  if (movement == null) {
    return movement;
  }

  if (typeof movement === 'number') {
    const normalized = toNonNegativeNumber(movement, 0);
    return {
      walk: normalized,
      climb: 0,
      swim: 0,
      fly: 0
    };
  }

  if (typeof movement === 'object') {
    return {
      walk: toNonNegativeNumber(movement.walk, 0),
      climb: toNonNegativeNumber(movement.climb, 0),
      swim: toNonNegativeNumber(movement.swim, 0),
      fly: toNonNegativeNumber(movement.fly, 0)
    };
  }

  return {
    walk: 0,
    climb: 0,
    swim: 0,
    fly: 0
  };
};

const reactionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cost: { type: Number, required: true },
  trigger: { type: String, required: true },
  description: { type: String, required: true }
}, { _id: false });

const traitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true }
}, { _id: false });

const creatureSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  tactics: { type: String, required: true },
  tier: {
    type: String,
    required: true,
    enum: ['minion', 'grunt', 'standard', 'champion', 'elite', 'legend', 'mythic']
  },
  type: {
    type: String,
    required: true,
    enum: ['dark', 'undead', 'divine', 'monster', 'humanoid', 'construct', 'plantoid', 'fey', 'elemental', 'beast']
  },
  size: {
    type: String,
    required: true,
    enum: ['tiny', 'small', 'medium', 'large', 'huge', 'gargantuan']
  },
  health: {
    max: { type: Number, required: true },
    current: { type: Number, required: true }
  },
  energy: {
    max: { type: Number, required: true },
    current: { type: Number, required: true },
    recovery: { type: Number, default: 2 }
  },
  resolve: {
    max: { type: Number, required: true },
    current: { type: Number, required: true },
    recovery: { type: Number, default: 1 }
  },
  movement: { type: movementSchema, required: true },
  
  // Attributes
  attributes: {
    physique: {
      talent: { type: Number, min: -1, max: 6, required: true }
    },
    finesse: {
      talent: { type: Number, min: -1, max: 6, required: true }
    },
    mind: {
      talent: { type: Number, min: -1, max: 6, required: true }
    },
    knowledge: {
      talent: { type: Number, min: -1, max: 6, required: true }
    },
    social: {
      talent: { type: Number, min: -1, max: 6, required: true }
    }
  },

  // Skills (basic only, no weapon/magic/craft) - now with nested structure
  skills: {
    fitness: {
      value: { type: Number, min: 0, max: 6, default: 0 },
      tier: { type: Number, min: -1, max: 1, default: 0 }
    },
    deflection: {
      value: { type: Number, min: 0, max: 6, default: 0 },
      tier: { type: Number, min: -1, max: 1, default: 0 }
    },
    might: {
      value: { type: Number, min: 0, max: 6, default: 0 },
      tier: { type: Number, min: -1, max: 1, default: 0 }
    },
    endurance: {
      value: { type: Number, min: 0, max: 6, default: 0 },
      tier: { type: Number, min: -1, max: 1, default: 0 }
    },
    evasion: {
      value: { type: Number, min: 0, max: 6, default: 0 },
      tier: { type: Number, min: -1, max: 1, default: 0 }
    },
    stealth: {
      value: { type: Number, min: 0, max: 6, default: 0 },
      tier: { type: Number, min: -1, max: 1, default: 0 }
    },
    coordination: {
      value: { type: Number, min: 0, max: 6, default: 0 },
      tier: { type: Number, min: -1, max: 1, default: 0 }
    },
    thievery: {
      value: { type: Number, min: 0, max: 6, default: 0 },
      tier: { type: Number, min: -1, max: 1, default: 0 }
    },
    resilience: {
      value: { type: Number, min: 0, max: 6, default: 0 },
      tier: { type: Number, min: -1, max: 1, default: 0 }
    },
    concentration: {
      value: { type: Number, min: 0, max: 6, default: 0 },
      tier: { type: Number, min: -1, max: 1, default: 0 }
    },
    senses: {
      value: { type: Number, min: 0, max: 6, default: 0 },
      tier: { type: Number, min: -1, max: 1, default: 0 }
    },
    logic: {
      value: { type: Number, min: 0, max: 6, default: 0 },
      tier: { type: Number, min: -1, max: 1, default: 0 }
    },
    wildcraft: {
      value: { type: Number, min: 0, max: 6, default: 0 },
      tier: { type: Number, min: -1, max: 1, default: 0 }
    },
    academics: {
      value: { type: Number, min: 0, max: 6, default: 0 },
      tier: { type: Number, min: -1, max: 1, default: 0 }
    },
    magic: {
      value: { type: Number, min: 0, max: 6, default: 0 },
      tier: { type: Number, min: -1, max: 1, default: 0 }
    },
    medicine: {
      value: { type: Number, min: 0, max: 6, default: 0 },
      tier: { type: Number, min: -1, max: 1, default: 0 }
    },
    expression: {
      value: { type: Number, min: 0, max: 6, default: 0 },
      tier: { type: Number, min: -1, max: 1, default: 0 }
    },
    presence: {
      value: { type: Number, min: 0, max: 6, default: 0 },
      tier: { type: Number, min: -1, max: 1, default: 0 }
    },
    insight: {
      value: { type: Number, min: 0, max: 6, default: 0 },
      tier: { type: Number, min: -1, max: 1, default: 0 }
    },
    persuasion: {
      value: { type: Number, min: 0, max: 6, default: 0 },
      tier: { type: Number, min: -1, max: 1, default: 0 }
    }
  },

  // Defenses
  mitigation: {
    physical: { type: Number, min: 0, default: 0 },
    cold: { type: Number, min: 0, default: 0 },
    heat: { type: Number, min: 0, default: 0 },
    electric: { type: Number, min: 0, default: 0 },
    psychic: { type: Number, min: 0, default: 0 },
    dark: { type: Number, min: 0, default: 0 },
    divine: { type: Number, min: 0, default: 0 },
    aether: { type: Number, min: 0, default: 0 },
    toxic: { type: Number, min: 0, default: 0 }
  },

  immunities: { type: mongoose.Schema.Types.Mixed, default: {} },
  
  detections: {
    normal: { type: Number, min: 0, max: 8, default: 5 },
    darksight: { type: Number, min: 0, max: 8, default: 0 },
    infravision: { type: Number, min: 0, max: 8, default: 0 },
    deadsight: { type: Number, min: 0, max: 8, default: 0 },
    echolocation: { type: Number, min: 0, max: 8, default: 0 },
    tremorsense: { type: Number, min: 0, max: 8, default: 0 },
    truesight: { type: Number, min: 0, max: 8, default: 0 },
    aethersight: { type: Number, min: 0, max: 8, default: 0 }
  },

  // Combat abilities
  actions: [actionSchema],
  reactions: [reactionSchema],
  traits: [traitSchema],

  // Additional info
  loot: [{ type: String }],
  languages: [{ type: String }],
  challenge_rating: { type: Number, min: 1, required: true },
  
  // Spells - references to actual spell documents
  spells: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Spell'
  }],
  
  // Custom spells defined inline for homebrew creatures
  customSpells: [{
    name: { type: String, required: true },
    energy_cost: { type: Number, min: 0, default: 1 },
    roll: { type: String },
    damage: { type: String },
    damage_extra: { type: String },
    damage_type: {
      type: String,
      enum: ['physical', 'heat', 'cold', 'electric', 'dark', 'divine', 'aether', 'psychic', 'toxic'],
      default: 'aether'
    },
    target_defense: {
      type: String,
      enum: ['evasion', 'deflection', 'resilience', 'none'],
      default: 'evasion'
    },
    defense_difficulty: { type: Number, min: 1, max: 20, default: 6 },
    min_range: { type: Number, min: 0, default: 1 },
    max_range: { type: Number, min: 0, default: 5 },
    description: { type: String }
  }],

  // Foundry integration
  foundry_id: {
    type: String,
    unique: true,
    sparse: true
  },
  foundry_portrait: {
    type: String,
    default: ''
  },

  // Metadata
  source: { type: String, default: 'Official' },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isHomebrew: { type: Boolean, default: false },
  
  // Homebrew fields
  creatorName: { type: String },
  status: {
    type: String,
    enum: ['draft', 'private', 'published', 'approved', 'rejected'],
    default: 'draft'
  },
  tags: [{ type: String }],
  balanceNotes: { type: String },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  timesUsed: { type: Number, default: 0 },
  publishedAt: { type: Date },
  approvedAt: { type: Date },
  rejectionReason: { type: String }
}, {
  timestamps: true
});

creatureSchema.path('movement').set(normalizeMovement);
creatureSchema.path('movement').get((movement) => normalizeMovement(movement));

// Index for searching
creatureSchema.index({ name: 'text', description: 'text' });
creatureSchema.index({ type: 1, tier: 1 });
creatureSchema.index({ challenge_rating: 1 });

export default mongoose.model('Creature', creatureSchema);

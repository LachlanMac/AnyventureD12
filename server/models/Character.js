// server/models/Character.js
import mongoose from 'mongoose';
import { applyDataEffects } from '../utils/moduleEffects.js';
const { Schema } = mongoose;

const ModuleOptionSchema = new Schema({
  id: Number,
  name: String,
  description: String,
  mtype: String,
  location: String,
  cost: Number,
  data: String,
  selected: { type: Boolean, default: false }
});

const ModuleSchema = new Schema({
  id: Number,
  name: String,
  mtype: String,
  ruleset: Number,
  options: [ModuleOptionSchema]
});

// Updated skill schema with talent stars
const SkillSchema = new Schema({
  value: { type: Number, default: 1 },   // Dice type (1d4, 1d6, etc.) - ranges from 1-6
  talent: { type: Number, default: 0 }   // Number of dice to roll - ranges from 0-3
});

const CraftSchema = new Schema({
  value: { type: Number, default: 1 },   // Dice type (1d4, 1d6, etc.) - ranges from 1-6
  talent: { type: Number, default: 0 }   // Number of dice to roll - ranges from 0-3
});

const WeaponSkillSchema = new Schema({
  value: { type: Number, default: 1 },   // Dice type (1d4, 1d6, etc.) - ranges from 1-6
  talent: { type: Number, default: 0 }   // Number of dice to roll - ranges from 0-3
});

const ActionSchema = new Schema({
  name: String,
  description: String,
  type: { type: String, enum: ['Action', 'Reaction', 'Free Action'] },
  sourceModule: String,
  sourceModuleOption: String
});

// Character's selected modules
const CharacterModuleSchema = new Schema({
  moduleId: {
    type: Schema.Types.ObjectId,
    ref: 'Module',
    required: true
  },
  selectedOptions: [{
    location: { type: String, required: true },
    selectedAt: { type: Date, default: Date.now }
  }],
  dateAdded: {
    type: Date,
    default: Date.now
  }
});

// Add this new schema after the existing schemas in Character.js
const TraitSchema = new Schema({
  traitId: {
    type: Schema.Types.ObjectId,
    ref: 'Trait',
    required: true
  },
  name: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['positive', 'negative'],
    required: true
  },
  description: { 
    type: String,
    required: true
  },
  dateAdded: {
    type: Date,
    default: Date.now
  }
});


const CharacterSchema = new Schema({
  userId: {
    type: String,
    required: [true, 'User ID is required']
  },
  name: {
    type: String,
    required: [true, 'Character name is required'],
    trim: true
  },
  portraitUrl: {
    type: String,
    default: null
  },
  race: {
    type: String,
    required: [true, 'Race is required']
  },
  
  // Core Attributes (each now starts at 1 and has max of 3)
  attributes: {
    physique: { type: Number, default: 1, min: 1, max: 3 },
    agility: { type: Number, default: 1, min: 1, max: 3 },
    mind: { type: Number, default: 1, min: 1, max: 3 },
    knowledge: { type: Number, default: 1, min: 1, max: 3 },
    social: { type: Number, default: 1, min: 1, max: 3 }
  },
  
  // Skills based on attributes - now using updated SkillSchema
  skills: {
    // Physique Skills
    fitness: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.physique.default }) },
    deflect: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.physique.default }) },
    might: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.physique.default }) },
    
    // Agility Skills
    evade: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.agility.default }) },
    stealth: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.agility.default }) },
    coordination: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.agility.default }) },
    
    // Mind Skills
    resilience: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.mind.default }) },
    concentration: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.mind.default }) },
    senses: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.mind.default }) },
    
    // Knowledge Skills
    science: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.knowledge.default }) },
    technology: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.knowledge.default }) },
    medicine: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.knowledge.default }) },
    xenology: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.knowledge.default }) },
    
    // Social Skills
    negotiation: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.social.default }) },
    behavior: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.social.default }) },
    presence: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.social.default }) }
  },
  
  // Specialized skills that don't depend on attributes
  weaponSkills: {
    rangedWeapons: { type: WeaponSkillSchema, default: () => ({ value: 0, talent: 1 }) },
    meleeWeapons: { type: WeaponSkillSchema, default: () => ({ value: 0, talent: 1 }) },
    weaponSystems: { type: WeaponSkillSchema, default: () => ({ value: 0, talent: 0 }) },
    heavyRangedWeapons: { type: WeaponSkillSchema, default: () => ({ value: 0, talent: 0 }) }
  },
  
  // Crafting Skills
  craftingSkills: {
    engineering: { type: CraftSchema, default: () => ({ value: 0, talent: 0 }) },
    fabrication: { type: CraftSchema, default: () => ({ value: 0, talent: 0 }) },
    biosculpting: { type: CraftSchema, default: () => ({ value: 0, talent: 0 }) },
    synthesis: { type: CraftSchema, default: () => ({ value: 0, talent: 0 }) }
  },
  
  // Track remaining talent stars for character creation
  characterCreation: {
    attributePointsRemaining: { type: Number, default: 5 },
    talentStarsRemaining: { type: Number, default: 5 }
  },
  
  // Resources
  resources: {
    health: { 
      current: { type: Number, default: 0 },
      max: { type: Number, default: 0 }
    },
    stamina: {
      current: { type: Number, default: 0 },
      max: { type: Number, default: 0 }
    },
    resolve: {
      current: { type: Number, default: 0 },
      max: { type: Number, default: 0 }
    }
  },

  // Module points
  modulePoints: {
    total: { type: Number, default: 5 }, // Total points earned
    spent: { type: Number, default: 0 }  // Points spent on modules
  },
  
  // Languages and Stances
  languages: [String],
  stances: [String],
  
  // Physical Characteristics
  physicalTraits: {
    size: String,
    weight: String,
    height: String,
    gender: String
  },
  
  // Biography and Descriptions
  biography: { type: String, default: '' },
  appearance: { type: String, default: '' },
  
  // Actions, Reactions, and Free Actions
  actions: [ActionSchema],
  
  // Modules
  modules: [CharacterModuleSchema],
  
  // Legacy modules field (for backward compatibility)
  legacyModules: [ModuleSchema],
  
  // Level and Experience
  level: { type: Number, default: 1 },
  experience: { type: Number, default: 0 },
  
  // Stats directly modified by modules
  initiative: { type: Number, default: 0 },
  movement: { type: Number, default: 5 },
  
  // Extra fields for module bonuses
  immunities: [String],
  vision: [String],
  mitigation: {
    kinetic: { type: Number, default: 0 },
    cold: { type: Number, default: 0 },
    heat: { type: Number, default: 0 },
    electrical: { type: Number, default: 0 },
    mental: { type: Number, default: 0 },
    toxic: { type: Number, default: 0 },
    sonic: { type: Number, default: 0 },
    radiation: { type: Number, default: 0 }
  },
  traits: [TraitSchema],
  // Store module bonuses separately to track what came from modules
  moduleBonuses: Schema.Types.Mixed
}, {
  timestamps: true
});



// Pre-save middleware to calculate derived values
CharacterSchema.pre('save', function(next) {
  // Set skill talents based on attributes
  // Physique Skills
  this.skills.fitness.talent = this.attributes.physique;
  this.skills.deflect.talent = this.attributes.physique;
  this.skills.might.talent = this.attributes.physique;
  
  // Agility Skills
  this.skills.evade.talent = this.attributes.agility;
  this.skills.stealth.talent = this.attributes.agility;
  this.skills.coordination.talent = this.attributes.agility;
  
  // Mind Skills
  this.skills.resilience.talent = this.attributes.mind;
  this.skills.concentration.talent = this.attributes.mind;
  this.skills.senses.talent = this.attributes.mind;
  
  // Knowledge Skills
  this.skills.science.talent = this.attributes.knowledge;
  this.skills.technology.talent = this.attributes.knowledge;
  this.skills.medicine.talent = this.attributes.knowledge;
  this.skills.xenology.talent = this.attributes.knowledge;
  
  // Social Skills
  this.skills.negotiation.talent = this.attributes.social;
  this.skills.behavior.talent = this.attributes.social;
  this.skills.presence.talent = this.attributes.social;
  
  // Calculate resources
  this.resources.health.max = 8 + (this.attributes.physique * 2);
  this.resources.stamina.max = 5 + (this.attributes.physique);
  this.resources.resolve.max = 5 + (this.attributes.mind);
  
  // Ensure current resources don't exceed max
  if (!this.resources.health.current || this.resources.health.current > this.resources.health.max) {
    this.resources.health.current = this.resources.health.max;
  }
  if (!this.resources.stamina.current || this.resources.stamina.current > this.resources.stamina.max) {
    this.resources.stamina.current = this.resources.stamina.max;
  }
  if (!this.resources.resolve.current || this.resources.resolve.current > this.resources.resolve.max) {
    this.resources.resolve.current = this.resources.resolve.max;
  }
  
  // Set initiative based on attributes
  this.initiative = this.attributes.agility + this.attributes.mind;

  // Apply module effects
  this.applyModuleEffects();
  this.applyTraitEffects();
  next();
});
/**
* Add a module to the character
* @param {ObjectId} moduleId - The ID of the module to add
* @returns {boolean} - True if the module was added successfully, false otherwise
*/
CharacterSchema.methods.addModule = async function(moduleId) {
 try {
   // Check if module already exists
   if (this.modules.some(m => m.moduleId.toString() === moduleId.toString())) {
     return false; // Module already added
   }
   
   // Check if character has enough module points
   const availablePoints = this.modulePoints.total - this.modulePoints.spent;
   if (availablePoints < 1) {
     return false; // Not enough points
   }
   
   // Add module to character
   this.modules.push({
     moduleId,
     selectedOptions: [],
     dateAdded: Date.now()
   });
   
   // Deduct points for adding the module (new simplified cost = 1)
   this.modulePoints.spent += 1;
   
   return true;
 } catch (error) {
   console.error('Error adding module:', error);
   return false;
 }
};

/**
* Select a module option
* @param {ObjectId} moduleId - The ID of the module
* @param {string} location - The location of the option to select
* @returns {boolean} - True if the option was selected successfully, false otherwise
*/
CharacterSchema.methods.selectOption = async function(moduleId, location) {
  try {
    // Find the module
    const moduleIndex = this.modules.findIndex(m => 
      m.moduleId.toString() === moduleId.toString()
    );
    
    if (moduleIndex === -1) {
      return false; // Module not found
    }
    
    // Check if option is already selected
    if (this.modules[moduleIndex].selectedOptions.some(o => o.location === location)) {
      return false; // Option already selected
    }
    
    // Check if character has enough module points
    const availablePoints = this.modulePoints.total - this.modulePoints.spent;
    
    // New simplified cost structure - all options cost 1 point
    const optionCost = 1;
    
    // Don't charge for Tier 1 option (location === '1') if this is the first option selected
    // for this module (i.e., the module was just added)
    const isFirstOptionForModule = this.modules[moduleIndex].selectedOptions.length === 0;
    const isTierOne = location === '1';
    
    // Only charge points if it's not a Tier 1 option on a module with no options yet
    const shouldChargePoints = !(isTierOne && isFirstOptionForModule);
    
    if (shouldChargePoints && availablePoints < optionCost) {
      return false; // Not enough points
    }
    
    // Add option to selected options
    this.modules[moduleIndex].selectedOptions.push({
      location,
      selectedAt: Date.now()
    });
    
    // Deduct points only if we should charge points
    if (shouldChargePoints) {
      this.modulePoints.spent += optionCost;
    }
    
    return true;
  } catch (error) {
    console.error('Error selecting module option:', error);
    return false;
  }
};

/**
* Remove a module from the character
* @param {ObjectId} moduleId - The ID of the module to remove
* @returns {boolean} - True if the module was removed successfully, false otherwise
*/
// Current module removal logic
CharacterSchema.methods.removeModule = async function(moduleId) {
  try {
    // Find the module
    const moduleIndex = this.modules.findIndex(m => 
      m.moduleId.toString() === moduleId.toString()
    );
    
    if (moduleIndex === -1) {
      return false; // Module not found
    }
    
    // Get the module's selected options
    const selectedOptions = this.modules[moduleIndex].selectedOptions;
    
    // Calculate points to refund
    // Base cost of the module (1 point)
    let pointsToRefund = 1;
    
    // Add 1 point for each selected option EXCEPT the Tier 1 option (if it exists)
    const hasTierOneOption = selectedOptions.some(o => o.location === '1');
    
    // If there is a Tier 1 option, count all other options
    // If no Tier 1 option, count all options
    if (hasTierOneOption) {
      // Don't count the Tier 1 option in the refund (since it wasn't charged)
      pointsToRefund += selectedOptions.filter(o => o.location !== '1').length;
    } else {
      // No Tier 1 option, count all options
      pointsToRefund += selectedOptions.length;
    }
    
    // Remove module
    this.modules.splice(moduleIndex, 1);
    
    // Refund points
    this.modulePoints.spent = Math.max(0, this.modulePoints.spent - pointsToRefund);
    
    return true;
  } catch (error) {
    console.error('Error removing module:', error);
    return false;
  }
}
/**
* Deselect a module option
* @param {ObjectId} moduleId - The ID of the module
* @param {string} location - The location of the option to deselect
* @returns {boolean} - True if the option was deselected successfully, false otherwise
*/
CharacterSchema.methods.deselectOption = async function(moduleId, location) {
  try {
    // Special case: If deselecting Tier 1 option, remove the entire module
    if (location === '1') {
      return this.removeModule(moduleId);
    }
    
    // Find the module
    const moduleIndex = this.modules.findIndex(m => 
      m.moduleId.toString() === moduleId.toString()
    );
    
    if (moduleIndex === -1) {
      return false; // Module not found
    }
    
    // Find the option
    const optionIndex = this.modules[moduleIndex].selectedOptions.findIndex(o => 
      o.location === location
    );
    
    if (optionIndex === -1) {
      return false; // Option not found
    }
    
    // Check if any other options are dependent on this one
    const tierNumber = parseInt(location.charAt(0));
    const nextTierNumber = tierNumber + 1;
    
    // Check if any selected options are from the next tier (which would depend on this one)
    const hasDependentOptions = this.modules[moduleIndex].selectedOptions.some(o => 
      parseInt(o.location.charAt(0)) === nextTierNumber
    );
    
    if (hasDependentOptions) {
      return false; // Cannot deselect option with dependent options
    }
    
    // Remove option
    this.modules[moduleIndex].selectedOptions.splice(optionIndex, 1);
    
    // Refund points (1 point per option)
    this.modulePoints.spent = Math.max(0, this.modulePoints.spent - 1);
    
    return true;
  } catch (error) {
    console.error('Error deselecting module option:', error);
    return false;
  }
};


// Continue with the rest of the character model methods...
CharacterSchema.methods.applyModuleEffects = async function() {
  // Reset module bonuses
  this.moduleBonuses = {
    skills: {},
    craftingSkills: {},
    weaponSkills: {},
    mitigation: {},
    traits: [],
    immunities: [],
    vision: [],
    conditionalEffects: [],
    health: 0,
    movement: 0,
    initiative: 0
  };
  
  // Apply module effects logic here...
  // (This is just a stub - the actual implementation would be more complex)
};


CharacterSchema.methods.applyTraitEffects = async function() {
  // Reset trait bonuses
  if (!this.moduleBonuses) this.moduleBonuses = {};
  if (!this.moduleBonuses.traitEffects) this.moduleBonuses.traitEffects = [];
  
  this.moduleBonuses.traitEffects = [];
  
  // Apply each trait's effects
  if (this.traits && this.traits.length > 0) {
    for (const trait of this.traits) {
      // Store trait information in moduleBonuses.traitEffects
      this.moduleBonuses.traitEffects.push({
        name: trait.name,
        type: trait.type,
        effects: trait.effects || []
      });
      
      // If we have a trait effects utility, we would call it here:
      // await applyTraitEffects(this, trait);
    }
  }
};

// Add method to add a trait to the character
CharacterSchema.methods.addTrait = async function(trait) {
  // Check if the trait already exists
  const existingTrait = this.traits.find(t => 
    t.traitId.toString() === trait._id.toString()
  );
  
  if (existingTrait) {
    return false; // Trait already added
  }
  
  // Add the trait
  this.traits.push({
    traitId: trait._id,
    name: trait.name,
    type: trait.type,
    description: trait.description
  });
  
  // If this is a positive trait, deduct 1 module point
  if (trait.type === 'positive') {
    this.modulePoints.spent += 1;
  }
  
  return true;
};

// Add method to remove a trait from the character
CharacterSchema.methods.removeTrait = async function(traitId) {
  // Find the trait in the array
  const traitIndex = this.traits.findIndex(t => 
    t.traitId.toString() === traitId.toString()
  );
  
  if (traitIndex === -1) {
    return false; // Trait not found
  }
  
  // Store the trait before removing
  const trait = this.traits[traitIndex];
  
  // Remove the trait
  this.traits.splice(traitIndex, 1);
  
  // If it was a positive trait, refund 1 module point
  if (trait.type === 'positive') {
    this.modulePoints.spent -= 1;
  }
  
  return true;
};

// Add other methods as needed

const Character = mongoose.model('Character', CharacterSchema);

export default Character;
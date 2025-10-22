// server/models/Character.js
import mongoose from 'mongoose';
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

const SkillSchema = new Schema({
  value: { type: Number, default: 0 },  
  talent: { type: Number, default: 0 },
  diceTierModifier: { type: Number, default: 0 }
});

const CraftSchema = new Schema({
  value: { type: Number, default: 0 },   
  talent: { type: Number, default: 0 },
  diceTierModifier: { type: Number, default: 0 }
});

const WeaponSkillSchema = new Schema({
  value: { type: Number, default: 0 },   
  talent: { type: Number, default: 0 },
  diceTierModifier: { type: Number, default: 0 }
});

const ActionSchema = new Schema({
  name: String,
  description: String,
  type: { type: String, enum: ['Action', 'Reaction', 'Free Action'] },
  sourceModule: String,
  sourceModuleOption: String
});


const CharacterSpellSchema = new Schema({
  spellId: {
    type: Schema.Types.ObjectId,
    ref: 'Spell',
    required: true
  },
  dateAdded: {
    type: Date,
    default: Date.now
  },
  favorite: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    default: ''
  }
});

const CharacterSongSchema = new Schema({
  songId: { type: Schema.Types.ObjectId, ref: 'Song', required: true },
  dateAdded: { type: Date, default: Date.now },
  favorite: { type: Boolean, default: false },
  notes: { type: String, default: '' }
});

const CharacterItemSchema = new Schema({
  // Either a reference OR full item data
  itemId: {
    type: Schema.Types.ObjectId,
    ref: 'Item',
    required: false // Not required if we have itemData
  },
  
  // Full item data (only populated when customized)
  itemData: {
    type: Schema.Types.Mixed,
    default: null
  },
  
  // Flag to indicate if this is customized
  isCustomized: {
    type: Boolean,
    default: false
  },
  
  // Common fields for both cases
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  
  condition: {
    current: { type: Number, default: 100 },
    max: { type: Number, default: 100 }
  },
  
  dateAdded: {
    type: Date,
    default: Date.now
  },
  
  dateModified: {
    type: Date,
    default: null
  },
  
  notes: {
    type: String,
    default: ''
  }
});

// Virtual to get the effective item data
CharacterItemSchema.virtual('item').get(function() {
  if (this.isCustomized && this.itemData) {
    return this.itemData;
  }
  return this.itemId; // Will be populated
});

const EquipmentSlotSchema = new Schema({
  itemId: {
    type: Schema.Types.ObjectId,
    ref: 'Item',
    default: null
  },
  equippedAt: {
    type: Date,
    default: null
  }
}, { _id: false });

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
  public: {
    type: Boolean,
    default: true
  },
  portraitUrl: {
    type: String,
    default: null
  },
  race: {
    type: String,
    required: false // Deprecated - use ancestry instead
  },
  culture: {
    type: String,
    required: false // Deprecated - use characterCulture instead
  },
  // New ancestry format
  ancestry: {
    ancestryId: {
      type: Schema.Types.ObjectId,
      ref: 'Ancestry',
      required: false
    },
    selectedOptions: [{
      name: {
        type: String,
        required: true
      },
      selectedSubchoice: {
        type: String,
        default: null
      },
      _id: false  // Disable automatic _id for subdocuments
    }]
  },
  // Traits with options and subchoices
  traits: [{
    traitId: {
      type: Schema.Types.ObjectId,
      ref: 'Trait',
      required: true
    },
    selectedOptions: [{
      name: {
        type: String,
        required: true
      },
      selectedSubchoice: {
        type: String,
        default: null
      },
      _id: false  // Disable automatic _id for subdocuments
    }],
    dateAdded: {
      type: Date,
      default: Date.now
    }
  }],
  // New culture format
  characterCulture: {
    cultureId: {
      type: Schema.Types.ObjectId,
      ref: 'Culture',
      required: false
    },
    selectedRestriction: {
      name: String,
      description: String
    },
    selectedBenefit: {
      name: String,
      description: String
    },
    selectedRitual: {
      name: String,
      description: String,
      frequency: String
    },
    selectedStartingItem: {
      name: String,
      description: String
    }
  },
  spellSlots: {
    type: Number,
    default: 10,
    min: 0
  },
  spells: [CharacterSpellSchema],
  songs: [CharacterSongSchema],
  
  // Inventory system
  inventory: [CharacterItemSchema],

  // Wealth/Currency
  wealth: {
    gold: { type: Number, default: 0 },
    silver: { type: Number, default: 0 }
  },

  // Equipment slots (matching FoundryVTT structure)
  equipment: {
    // Gear slots
    hand: { type: EquipmentSlotSchema, default: () => ({}) }, // gloves/gauntlets
    boots: { type: EquipmentSlotSchema, default: () => ({}) }, // footwear
    body: { type: EquipmentSlotSchema, default: () => ({}) }, // armor
    head: { type: EquipmentSlotSchema, default: () => ({}) }, // headwear
    back: { type: EquipmentSlotSchema, default: () => ({}) }, // cloaks
    accessory1: { type: EquipmentSlotSchema, default: () => ({}) },
    accessory2: { type: EquipmentSlotSchema, default: () => ({}) },
    // Weapon and shield slots
    mainhand: { type: EquipmentSlotSchema, default: () => ({}) },
    offhand: { type: EquipmentSlotSchema, default: () => ({}) }, // shields or weapons
    extra1: { type: EquipmentSlotSchema, default: () => ({}) },
    extra2: { type: EquipmentSlotSchema, default: () => ({}) },
    extra3: { type: EquipmentSlotSchema, default: () => ({}) }
  },

  // Conditional flags for special abilities (matching FoundryVTT)
  conditionals: {
    flags: {
      WEAPON_COLLECTOR: { type: Boolean, default: false }, // Allows complex weapons in extra slots
      PASSIVE_SHELL: { type: Boolean, default: false }, // Allows shields with 2-handed weapons
    }
  },
  // Core Attributes (each now starts at 1 and has max of 3)
  attributes: {
    physique: { type: Number, default: 1, min: 1, max: 4 },
    finesse : { type: Number, default: 1, min: 1, max: 4 },
    mind: { type: Number, default: 1, min: 1, max: 4 },
    knowledge: { type: Number, default: 1, min: 1, max: 4 },
    social: { type: Number, default: 1, min: 1, max: 4 }
  },


    detection :{
    normal:  { type: Number, default: 9 },
    darksight:  { type: Number, default: 0 }, 
    infravision:  { type: Number, default: 0 }, 
    deadsight:  { type: Number, default: 0 },    
    echolocation:  { type: Number, default: 0 }, 
    tremorsense:  { type: Number, default: 0 }, 
    truesight:  { type: Number, default: 0 }, 
    aethersight:  { type: Number, default: 0 }, 
  },
  immunity: {
    afraid:         { type: Boolean, default: false },
    bleeding:       { type: Boolean, default: false },
    blinded:        { type: Boolean, default: false },
    broken:         { type: Boolean, default: false },
    charmed:        { type: Boolean, default: false },
    confused:       { type: Boolean, default: false },
    dazed:          { type: Boolean, default: false },
    deafened:       { type: Boolean, default: false },
    diseased:       { type: Boolean, default: false },
    hidden:         { type: Boolean, default: false },
    ignited:        { type: Boolean, default: false },
    impaired:       { type: Boolean, default: false },
    incapacitated:  { type: Boolean, default: false },
    maddened:       { type: Boolean, default: false },
    muted:          { type: Boolean, default: false },
    numbed:         { type: Boolean, default: false },
    poisoned:       { type: Boolean, default: false },
    prone:          { type: Boolean, default: false },
    stunned:        { type: Boolean, default: false },
    winded:         { type: Boolean, default: false }
  },
  // Skills based on attributes - now using updated SkillSchema
  skills: {
    // Physique Skills
    fitness: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.physique.default }) },
    deflection: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.physique.default }) },
    might: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.physique.default }) },
    endurance: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.physique.default }) },
    // Agility Skills
    evasion: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.finesse.default }) },
    stealth: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.finesse.default }) },
    coordination: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.finesse.default }) },
    thievery: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.finesse.default }) },
    // Mind Skills
    resilience: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.mind.default }) },
    concentration: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.mind.default }) },
    senses: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.mind.default }) },
    logic: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.mind.default }) },
    // Knowledge Skills
    wildcraft: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.knowledge.default }) },
    academics: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.knowledge.default }) },
    magic: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.knowledge.default }) },
    medicine: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.knowledge.default }) },
    // Social Skills
    expression: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.social.default }) },
    presence: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.social.default }) },
    insight: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.social.default }) },
    persuasion: { type: SkillSchema, default: () => ({ value: 0, talent: attributes.social.default }) }
  },
  

  musicSkills: {
    vocal: { type: Number, default: 0 },
    percussion: { type: Number, default: 0 },
    wind: { type: Number, default: 0 },
    strings: { type: Number, default: 0 },
    brass:{ type: Number, default: 0 }
  },

  // Specialized skills that don't depend on attributes
  weaponSkills: {
    brawling: { type: WeaponSkillSchema, default: () => ({ value: 0, talent: 0, diceTierModifier: 0 }) },
    throwing: { type: WeaponSkillSchema, default: () => ({ value: 0, talent: 0, diceTierModifier: 0 }) },
    simpleRangedWeapons: { type: WeaponSkillSchema, default: () => ({ value: 0, talent: 0, diceTierModifier: 0 }) },
    complexRangedWeapons: { type: WeaponSkillSchema, default: () => ({ value: 0, talent: 0, diceTierModifier: 0 }) },
    simpleMeleeWeapons: { type: WeaponSkillSchema, default: () => ({ value: 0, talent: 0, diceTierModifier: 0 }) },
    complexMeleeWeapons: { type: WeaponSkillSchema, default: () => ({ value: 0, talent: 0, diceTierModifier: 0 }) }
  },

  magicSkills:{
    black: { type: WeaponSkillSchema, default: () => ({ value: 0, talent: 0, diceTierModifier: 0 }) }, //necromancy, witchcraft  (fiend)
    primal: { type: WeaponSkillSchema, default: () => ({ value: 0, talent: 0, diceTierModifier: 0 }) }, //elemental, nature      (draconic)
    meta: { type: WeaponSkillSchema, default: () => ({ value: 0, talent: 0, diceTierModifier: 0 }) }, //transmutation, illusion (fey)
    white: { type: WeaponSkillSchema, default: () => ({ value: 0, talent: 0, diceTierModifier: 0 }) }, //protection, radiant (celestial)
    mystic: { type: WeaponSkillSchema, default: () => ({ value: 0, talent: 0, diceTierModifier: 0 }) }, //spirit, divination  (cosmic)
    arcane: { type: WeaponSkillSchema, default: () => ({ value: 0, talent: 0, diceTierModifier: 0 }) }, //conjuration, enchantment (chaos)
  },

  // Exotic school access (unlocked via modules/traits)
  exoticSchools: {
    fiend: { type: Boolean, default: false },      // Black magic exotic
    draconic: { type: Boolean, default: false },   // Primal magic exotic
    fey: { type: Boolean, default: false },        // Meta magic exotic
    celestial: { type: Boolean, default: false },  // White magic exotic
    cosmic: { type: Boolean, default: false },     // Mysticism magic exotic
    chaos: { type: Boolean, default: false }       // Arcane magic exotic
  },

  // Crafting Skills
  craftingSkills: {
    engineering: { type: CraftSchema, default: () => ({ value: 0, talent: 0 }) },
    fabrication: { type: CraftSchema, default: () => ({ value: 0, talent: 0 }) },
    alchemy: { type: CraftSchema, default: () => ({ value: 0, talent: 0 }) },
    cooking: { type: CraftSchema, default: () => ({ value: 0, talent: 0 }) },
    glyphcraft: { type: CraftSchema, default: () => ({ value: 0, talent: 0 }) },
    biosculpting: { type: CraftSchema, default: () => ({ value: 0, talent: 0 }) },
  },
  
  characterCreation: {
    attributePointsRemaining: { type: Number, default: 6 },
    talentStarsRemaining: { type: Number, default: 8 }
  },
  
  // Resources
  resources: {
    health: { 
      current: { type: Number, default: 0 },
      max: { type: Number, default: 0 }
    },
    energy: {
      current: { type: Number, default: 0 },
      max: { type: Number, default: 0 }
    },
    resolve: {
      current: { type: Number, default: 0 },
      max: { type: Number, default: 0 }
    },
    morale: {
      current: { type: Number, default: 0 },
      max: { type: Number, default: 0 }
    }
  },

  // Module points
  modulePoints: {
    total: { type: Number, default: 5 }, // Total points earned
    spent: { type: Number, default: 0 }  // Points spent on modules
  },
  
  // Languages with proficiency levels (0-3 stars)
  languageSkills: {
    type: Map,
    of: Number,
    default: new Map([['common', 2]]) // All characters start with Common at proficiency 2
  },
  
  // Legacy languages field (for backward compatibility)
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
  
  // Character Trait (from character creation)
  characterTrait: {
    type: Schema.Types.ObjectId,
    ref: 'Trait',
    default: null
  },
  
  // Legacy modules field (for backward compatibility)
  legacyModules: [ModuleSchema],


  // Level and Experience
  level: { type: Number, default: 1 },
  experience: { type: Number, default: 0 },
  
  // Stats directly modified by modules
  initiative: { type: Number, default: 0 },
  movement: { type: Number, default: 5 },
  encumbrance_penalty: { type: Number, default: 0 },
  encumbrance_check: { type: Number, default: 0 },
  sprint_check: { type: Number, default: 0 },
  swim_speed: { type: Number, default: 0 },
  climb_speed: { type: Number, default: 0 },
  fly_speed: { type: Number, default: 0 },
  movement_bonuses: {
    swim: { type: Number, default: 0 },
    climb: { type: Number, default: 0 },
    fly: { type: Number, default: 0 }
  },
  
  // Extra fields for module bonuses
  immunities: [String],
  vision: [String],
  mitigation: {
    physical: { type: Number, default: 0 },
    cold: { type: Number, default: 0 },
    heat: { type: Number, default: 0 },
    electric: { type: Number, default: 0 },
    psychic: { type: Number, default: 0 },
    dark: { type: Number, default: 0 },
    divine: { type: Number, default: 0 },
    aether: { type: Number, default: 0 },
    toxic: { type: Number, default: 0 },
  },
  moduleBonuses: Schema.Types.Mixed
}, {
  timestamps: true
});



// Pre-save middleware to calculate derived values
CharacterSchema.pre('save', function(next) {
  // Set skill talents based on attributes
  // Physique Skills
  this.skills.fitness.talent = this.attributes.physique;
  this.skills.deflection.talent = this.attributes.physique;
  this.skills.might.talent = this.attributes.physique;
  this.skills.endurance.talent = this.attributes.physique;

  // Agility Skills
  this.skills.evasion.talent = this.attributes.finesse;
  this.skills.stealth.talent = this.attributes.finesse;
  this.skills.coordination.talent = this.attributes.finesse;
  this.skills.thievery.talent = this.attributes.finesse;

  // Mind Skills
  this.skills.resilience.talent = this.attributes.mind;
  this.skills.concentration.talent = this.attributes.mind;
  this.skills.senses.talent = this.attributes.mind;
  this.skills.logic.talent = this.attributes.mind;
  // Knowledge Skills
  this.skills.academics.talent = this.attributes.knowledge;
  this.skills.medicine.talent = this.attributes.knowledge;
  this.skills.magic.talent = this.attributes.knowledge;
  this.skills.wildcraft.talent = this.attributes.knowledge;
  
  // Social Skills
  this.skills.expression.talent = this.attributes.social;
  this.skills.insight.talent = this.attributes.social;
  this.skills.presence.talent = this.attributes.social;
  this.skills.persuasion.talent = this.attributes.social;

  // Calculate resources
  this.resources.health.max = 20;
  this.resources.energy.max = 5;
  this.resources.resolve.max = 20;
  this.resources.morale.max = 10;

  // Initialize current resources if not set (but don't cap them here - equipment may increase max)
  if (!this.resources.health.current) {
    this.resources.health.current = this.resources.health.max;
  }
  if (!this.resources.energy.current) {
    this.resources.energy.current = this.resources.energy.max;
  }
  if (!this.resources.resolve.current) {
    this.resources.resolve.current = this.resources.resolve.max;
  }
  if (!this.resources.morale.current) {
    this.resources.morale.current = 0;
  }

  // NOTE: Module and trait effects are applied at READ time in applyModuleBonusesToCharacter()
  // NOT at save time - bonuses should never be baked into the DB

  // Initialize equipment for existing characters (migrate old structure)
  if (!this.equipment) {
    this.equipment = {};
  }

  // Migrate old weapon slots to new structure
  if (this.main_hand && this.main_hand.itemId && !this.equipment.mainhand?.itemId) {
    this.equipment.mainhand = this.main_hand;
    this.main_hand = undefined;
  }
  if (this.off_hand && this.off_hand.itemId && !this.equipment.offhand?.itemId) {
    this.equipment.offhand = this.off_hand;
    this.off_hand = undefined;
  }
  if (this.extra_weapons && this.extra_weapons.length > 0) {
    if (this.extra_weapons[0]?.itemId && !this.equipment.extra1?.itemId) {
      this.equipment.extra1 = this.extra_weapons[0];
    }
    if (this.extra_weapons[1]?.itemId && !this.equipment.extra2?.itemId) {
      this.equipment.extra2 = this.extra_weapons[1];
    }
    if (this.extra_weapons[2]?.itemId && !this.equipment.extra3?.itemId) {
      this.equipment.extra3 = this.extra_weapons[2];
    }
    this.extra_weapons = undefined;
  }

  // Migrate old slot names
  if (this.equipment.hands && !this.equipment.hand) {
    this.equipment.hand = this.equipment.hands;
    this.equipment.hands = undefined;
  }
  if (this.equipment.feet && !this.equipment.boots) {
    this.equipment.boots = this.equipment.feet;
    this.equipment.feet = undefined;
  }
  if (this.equipment.cloak && !this.equipment.back) {
    this.equipment.back = this.equipment.cloak;
    this.equipment.cloak = undefined;
  }
  if (this.equipment.shield && !this.equipment.offhand?.itemId) {
    // Only migrate shield if offhand is empty
    this.equipment.offhand = this.equipment.shield;
    this.equipment.shield = undefined;
  }

  // Initialize conditional flags
  if (!this.conditionals) {
    this.conditionals = { flags: {} };
  }
  if (!this.conditionals.flags) {
    this.conditionals.flags = {};
  }

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
    const moduleIndex = this.modules.findIndex(m => 
      m.moduleId.toString() === moduleId.toString()
    );
    if (moduleIndex === -1) {
      return false; 
    }
    if (this.modules[moduleIndex].selectedOptions.some(o => o.location === location)) {
      return false; 
    }
    const availablePoints = this.modulePoints.total - this.modulePoints.spent;
    const optionCost = 1;
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

CharacterSchema.methods.addSpell = async function(spellId) {
  try {
    // Check if spell already exists in character's spells
    if (this.spells.some(s => s.spellId.toString() === spellId.toString())) {
      return { success: false, message: 'Spell already added to character' };
    }
    
    // Check if character has available spell slots
    if (this.spells.length >= this.spellSlots) {
      return { success: false, message: 'No spell slots available' };
    }
    
    // Add the spell
    this.spells.push({
      spellId,
      dateAdded: Date.now()
    });
    
    await this.save();
    return { success: true, message: 'Spell added successfully' };
  } catch (error) {
    console.error('Error adding spell to character:', error);
    return { success: false, message: error.message };
  }
};

CharacterSchema.methods.removeSpell = async function(spellId) {
  try {
    // Check if spell exists in character's spells
    const spellIndex = this.spells.findIndex(s => s.spellId.toString() === spellId.toString());
    
    if (spellIndex === -1) {
      return { success: false, message: 'Spell not found on character' };
    }
    
    // Remove the spell
    this.spells.splice(spellIndex, 1);
    
    await this.save();
    return { success: true, message: 'Spell removed successfully' };
  } catch (error) {
    console.error('Error removing spell from character:', error);
    return { success: false, message: error.message };
  }
};

// Inventory management methods
CharacterSchema.methods.addItem = async function(itemId, quantity = 1) {
  try {
    // Check if item already exists in inventory (non-customized items only)
    const existingItemIndex = this.inventory.findIndex(i => 
      !i.isCustomized && i.itemId && i.itemId.toString() === itemId.toString()
    );
    
    if (existingItemIndex !== -1) {
      // Item exists, increase quantity
      this.inventory[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to inventory
      this.inventory.push({
        itemId,
        quantity,
        isCustomized: false,
        dateAdded: Date.now()
      });
    }
    
    await this.save();
    return { success: true, message: 'Item added to inventory successfully' };
  } catch (error) {
    console.error('Error adding item to inventory:', error);
    return { success: false, message: error.message };
  }
};

CharacterSchema.methods.removeItem = async function(itemId, quantity = 1) {
  try {
    const itemIndex = this.inventory.findIndex(i => i.itemId.toString() === itemId.toString());
    
    if (itemIndex === -1) {
      return { success: false, message: 'Item not found in inventory' };
    }
    
    const currentItem = this.inventory[itemIndex];
    
    if (currentItem.quantity <= quantity) {
      // Remove entire item entry
      this.inventory.splice(itemIndex, 1);

      // Unequip the item from all equipment slots if it was equipped
      this.unequipItemFromAllSlots(itemId);
    } else {
      // Decrease quantity
      currentItem.quantity -= quantity;
    }
    
    await this.save();
    return { success: true, message: 'Item removed from inventory successfully' };
  } catch (error) {
    console.error('Error removing item from inventory:', error);
    return { success: false, message: error.message };
  }
};

// Helper method to unequip an item from all equipment slots
CharacterSchema.methods.unequipItemFromAllSlots = function(itemId) {
  // Check regular equipment slots
  if (this.equipment) {
    Object.keys(this.equipment).forEach(slotName => {
      if (this.equipment[slotName]?.itemId?.toString() === itemId.toString()) {
        this.equipment[slotName] = { itemId: null, equippedAt: null };
      }
    });
  }

  // Check weapon slots
  if (this.main_hand?.itemId?.toString() === itemId.toString()) {
    this.main_hand = { itemId: null, equippedAt: null };
  }

  if (this.off_hand?.itemId?.toString() === itemId.toString()) {
    this.off_hand = { itemId: null, equippedAt: null };
  }

  // Check extra weapon slots
  if (this.extra_weapons && Array.isArray(this.extra_weapons)) {
    this.extra_weapons.forEach((slot, index) => {
      if (slot?.itemId?.toString() === itemId.toString()) {
        this.extra_weapons[index] = { itemId: null, equippedAt: null };
      }
    });
  }
};

// Validate if an item can be equipped to a specific slot (matching FoundryVTT logic)
CharacterSchema.methods.validateItemSlot = function(item, slotName) {
  const itemType = item.type;
  const weaponCategory = item.weapon_category || '';
  const isComplexWeapon = weaponCategory === 'complexMeleeWeapons' || weaponCategory === 'complexRangedWeapons' ||
                         weaponCategory === 'complexMelee' || weaponCategory === 'complexRanged';
  const isTwoHanded = item.hands === 2;
  const conditionalFlags = this.conditionals?.flags || {};

  // Strict slot validation for non-weapons
  const slotRestrictions = {
    'body': ['body'],
    'headwear': ['head'],
    'cloak': ['back'],
    'gloves': ['hand'],
    'boots': ['boots'],
    'accessory': ['accessory1', 'accessory2']
  };

  // Handle weapons
  if (itemType === 'weapon') {
    const weaponSlots = ['mainhand', 'offhand', 'extra1', 'extra2', 'extra3'];
    if (!weaponSlots.includes(slotName)) {
      return { valid: false, message: 'Weapons can only be equipped in weapon slots' };
    }

    // Check complex weapon restrictions for extra slots
    if (isComplexWeapon && ['extra1', 'extra2', 'extra3'].includes(slotName)) {
      if (!conditionalFlags.WEAPON_COLLECTOR) {
        return { valid: false, message: 'Complex weapons cannot be equipped to extra slots without Weapon Collector trait' };
      }
    }

    // Two-handed weapons can only go in mainhand or extra slots
    if (isTwoHanded && slotName === 'offhand') {
      return { valid: false, message: 'Two-handed weapons cannot be equipped in offhand' };
    }

    return { valid: true };
  }

  // Handle shields
  if (itemType === 'shield') {
    if (slotName !== 'offhand') {
      return { valid: false, message: 'Shields can only be equipped in offhand slot' };
    }

    // Check if a 2-handed weapon is equipped in mainhand
    const mainhandItem = this.equipment.mainhand?.itemId;
    if (mainhandItem) {
      // Get item data to check if it's 2-handed
      const mainhandItemData = this.getEquippedItemData(mainhandItem);
      if (mainhandItemData && mainhandItemData.hands === 2) {
        if (!conditionalFlags.PASSIVE_SHELL) {
          return { valid: false, message: 'Cannot equip shield with 2-handed weapon without Passive Shell trait' };
        }
      }
    }

    return { valid: true };
  }

  // Check other item types
  const allowedSlots = slotRestrictions[itemType];
  if (allowedSlots) {
    if (!allowedSlots.includes(slotName)) {
      return { valid: false, message: `${itemType} items can only be equipped to ${allowedSlots.join(', ')} slots` };
    }
    return { valid: true };
  }

  // Default to accessory slots for unknown types
  if (['accessory1', 'accessory2'].includes(slotName)) {
    return { valid: true };
  }

  return { valid: false, message: 'Invalid item type for this slot' };
};

// Helper method to get item data from equipped item (handles both populated and unpopulated items)
CharacterSchema.methods.getEquippedItemData = function(itemId) {
  if (!itemId) return null;

  // Find in inventory
  const inventoryItem = this.inventory.find(i => {
    const invItemId = typeof i.itemId === 'object' && i.itemId._id ? i.itemId._id.toString() : i.itemId.toString();
    const targetId = typeof itemId === 'object' && itemId._id ? itemId._id.toString() : itemId.toString();
    return invItemId === targetId;
  });

  if (inventoryItem) {
    return inventoryItem.isCustomized ? inventoryItem.itemData : inventoryItem.itemId;
  }

  return null;
};

CharacterSchema.methods.equipItem = async function(itemIdentifier, slotName) {
  try {
    // itemIdentifier can be either:
    // 1. An inventory index (for customized items) - e.g., "0", "1", "2"
    // 2. An item ObjectId (for regular items)

    let inventoryItem;
    let inventoryIndex;

    // Try to parse as inventory index first
    const parsedIndex = parseInt(itemIdentifier);
    if (!isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex < this.inventory.length) {
      // It's a valid inventory index
      inventoryIndex = parsedIndex;
      inventoryItem = this.inventory[parsedIndex];
    } else {
      // Try to find by itemId (for non-customized items)
      inventoryIndex = this.inventory.findIndex(i => {
        // Skip customized items (they don't have itemId)
        if (i.isCustomized || !i.itemId) return false;

        const inventoryItemId = typeof i.itemId === 'object' && i.itemId._id
          ? i.itemId._id.toString()
          : i.itemId.toString();
        return inventoryItemId === itemIdentifier.toString();
      });

      if (inventoryIndex !== -1) {
        inventoryItem = this.inventory[inventoryIndex];
      }
    }

    if (!inventoryItem) {
      return { success: false, message: 'Item not found in inventory' };
    }

    // Get item data
    const itemData = inventoryItem.isCustomized ? inventoryItem.itemData : inventoryItem.itemId;
    if (!itemData) {
      return { success: false, message: 'Invalid item data' };
    }


    // Validate the item can be equipped to this slot
    const validation = this.validateItemSlot(itemData, slotName);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    // Initialize equipment if it doesn't exist
    if (!this.equipment) {
      this.equipment = {};
    }

    // Handle special equipping logic
    const conditionalFlags = this.conditionals?.flags || {};

    // Special handling for 2-handed weapons
    if (itemData.type === 'weapon' && itemData.hands === 2 && slotName === 'mainhand') {
      const offhandItem = this.equipment.offhand?.itemId;

      // Check if a shield is equipped in offhand
      if (offhandItem) {
        const offhandItemData = this.getEquippedItemData(offhandItem);
        if (offhandItemData && offhandItemData.type === 'shield') {
          if (!conditionalFlags.PASSIVE_SHELL) {
            return { success: false, message: 'Cannot equip 2-handed weapon with shield equipped without Passive Shell trait' };
          }
          // With PASSIVE_SHELL, shield can stay equipped
        } else {
          // Unequip non-shield offhand item when equipping 2-handed weapon
          this.equipment.offhand = { itemId: null, equippedAt: null };
        }
      }
    }

    // If slot is occupied, unequip current item first
    if (this.equipment[slotName]?.itemId) {
      await this.unequipItem(slotName);
    }

    // Determine the item ID to store in equipment slot
    // For customized items, use the originalItemId; for regular items, use the itemId
    let equipmentItemId;
    if (inventoryItem.isCustomized && inventoryItem.itemData?.originalItemId) {
      equipmentItemId = inventoryItem.itemData.originalItemId;
    } else if (inventoryItem.itemId) {
      equipmentItemId = typeof inventoryItem.itemId === 'object' && inventoryItem.itemId._id
        ? inventoryItem.itemId._id
        : inventoryItem.itemId;
    } else {
      return { success: false, message: 'Cannot determine item ID for equipment slot' };
    }

    // Equip the item
    this.equipment[slotName] = {
      itemId: equipmentItemId,
      equippedAt: new Date().toISOString()
    };

    await this.save();
    return { success: true, message: 'Item equipped successfully' };
  } catch (error) {
    console.error('Error equipping item:', error);
    return { success: false, message: error.message };
  }
};

CharacterSchema.methods.unequipItem = async function(slotName) {
  try {
    // Initialize equipment if it doesn't exist
    if (!this.equipment) {
      this.equipment = {};
    }

    // Check if it's a valid equipment slot
    const validSlots = [
      'hand', 'boots', 'body', 'head', 'back', 'accessory1', 'accessory2',
      'mainhand', 'offhand', 'extra1', 'extra2', 'extra3'
    ];

    if (!validSlots.includes(slotName)) {
      return { success: false, message: 'Invalid equipment slot' };
    }

    // Clear the slot
    this.equipment[slotName] = {
      itemId: null,
      equippedAt: null
    };

    await this.save();
    return { success: true, message: 'Item unequipped successfully' };
  } catch (error) {
    console.error('Error unequipping item:', error);
    return { success: false, message: error.message };
  }
};

// Method to customize an item (copy-on-write)
CharacterSchema.methods.customizeItem = async function(inventoryIndex, modifications) {
  try {
    const inventoryItem = this.inventory[inventoryIndex];
    
    if (!inventoryItem) {
      return { success: false, message: 'Item not found in inventory' };
    }
    
    // If not already customized, copy the base item data
    if (!inventoryItem.isCustomized) {
      // Need to populate the base item if it's just an ID
      if (!inventoryItem.itemId.name) {
        await this.populate(`inventory.${inventoryIndex}.itemId`);
      }
      
      // Copy all base item data
      const baseItem = inventoryItem.itemId;
      inventoryItem.itemData = {
        ...baseItem.toObject(),
        _id: undefined, // Remove the base item's ID
        originalItemId: baseItem._id, // Keep reference to original
        __v: undefined,
        createdAt: undefined,
        updatedAt: undefined
      };
      
      // Clear the reference and mark as customized
      inventoryItem.itemId = undefined;
      inventoryItem.isCustomized = true;
    }
    
    // Apply modifications
    Object.assign(inventoryItem.itemData, modifications);
    inventoryItem.dateModified = Date.now();
    
    // Mark the inventory subdocument as modified
    this.markModified(`inventory.${inventoryIndex}.itemData`);
    
    await this.save();
    return { success: true, message: 'Item customized successfully' };
  } catch (error) {
    console.error('Error customizing item:', error);
    return { success: false, message: error.message };
  }
};

// Method to get effective item data
CharacterSchema.methods.getInventoryItemData = async function(inventoryIndex) {
  const inventoryItem = this.inventory[inventoryIndex];
  
  if (!inventoryItem) return null;
  
  if (inventoryItem.isCustomized) {
    return inventoryItem.itemData;
  } else {
    // Populate if needed
    if (!inventoryItem.itemId || !inventoryItem.itemId.name) {
      await this.populate(`inventory.${inventoryIndex}.itemId`);
    }
    return inventoryItem.itemId;
  }
};

// Method to update item quantity
CharacterSchema.methods.updateItemQuantity = async function(inventoryIndex, newQuantity) {
  try {
    const inventoryItem = this.inventory[inventoryIndex];
    
    if (!inventoryItem) {
      return { success: false, message: 'Item not found in inventory' };
    }
    
    if (newQuantity < 1) {
      // Remove item if quantity is 0 or less
      const itemId = inventoryItem.itemId;
      this.inventory.splice(inventoryIndex, 1);

      // Unequip the item from all equipment slots if it was equipped
      this.unequipItemFromAllSlots(itemId);
    } else {
      inventoryItem.quantity = newQuantity;
    }
    
    await this.save();
    return { success: true, message: 'Quantity updated successfully' };
  } catch (error) {
    console.error('Error updating item quantity:', error);
    return { success: false, message: error.message };
  }
};

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


/**
 * Recalculate module points spent based on actual modules and options
 * Should be called when loading/editing a character to ensure accuracy
 * @returns {object} - Object with { calculatedSpent, previousSpent, corrected }
 */
CharacterSchema.methods.recalculateModulePoints = function() {
  let calculatedSpent = 0;

  // Count points from modules
  for (const module of this.modules) {
    const moduleData = module.moduleId && typeof module.moduleId === 'object' ? module.moduleId : null;

    // Check if this is a personality module (free to obtain, but options beyond tier 1 cost points)
    const isPersonalityModule = moduleData?.mtype === 'personality';
    const isSocialModule = moduleData?.module_category === 'social';

    // Count selected options
    const selectedOptions = module.selectedOptions || [];

    if (isPersonalityModule) {
      // Personality modules: the module itself is free, tier 1 is free, but other options cost points
      const additionalOptions = selectedOptions.filter(o => o.location !== '1').length;
      calculatedSpent += additionalOptions;
      continue;
    }

    if (isSocialModule) {
      // Social modules are completely free - skip them entirely
      continue;
    }

    // Regular module: costs 1 point for the module itself
    let modulePoints = 1;

    // Check if there's a Tier 1 option (location === '1')
    const hasTierOneOption = selectedOptions.some(o => o.location === '1');

    if (hasTierOneOption) {
      // Tier 1 is free on first selection, so count all other options
      const additionalOptions = selectedOptions.filter(o => o.location !== '1').length;
      modulePoints += additionalOptions;
    } else {
      // No Tier 1 option, all options cost points
      modulePoints += selectedOptions.length;
    }

    calculatedSpent += modulePoints;
  }

  const previousSpent = this.modulePoints.spent;
  const corrected = previousSpent !== calculatedSpent;

  // Update the spent value
  this.modulePoints.spent = calculatedSpent;

  return {
    calculatedSpent,
    previousSpent,
    corrected
  };
};

// Continue with the rest of the character model methods...
CharacterSchema.methods.applyModuleEffects = async function() {
  // Reset module bonuses
  this.moduleBonuses = {
    skills: {},
    craftingSkills: {},
    weaponSkills: {},
    magicSkills: {},
    mitigation: {},
    traits: [],
    immunities: [],
    vision: [],
    conditionalEffects: [],
    health: 0,
    movement: 0,
  };
  
  // Apply module effects logic here...
  // (This is just a stub - the actual implementation would be more complex)
};

// Apply trait effects (synchronous version for pre-save hook)
CharacterSchema.methods.applyTraitEffectsSync = function() {
  // Only apply if a trait is selected and already populated
  if (!this.characterTrait || typeof this.characterTrait === 'string') return;
  
  try {
    const trait = this.characterTrait;
    if (!trait || !trait.options) return;
    
    // Apply all options from the trait
    for (const option of trait.options) {
      if (!option.data) continue;
      
      // Parse the data string (e.g., "H=5", "R=10", "MP=3", "UT=2")
      // Handle both comma-separated and single values
      const dataParts = option.data.includes(',') ? option.data.split(',') : [option.data];
      
      for (const part of dataParts) {
        if (!part.includes('=')) continue;
        const [key, value] = part.trim().split('=');
        const numValue = parseInt(value) || 0;
        
        switch (key) {
          case 'H': // Health
            this.resources.health.max += numValue;
            break;
          case 'E': // Energy
            this.resources.energy.max += numValue;
            break;
          case 'R': // Morale (using R for moRale)
            this.resources.morale.max += numValue;
            break;
          case 'MP': // Module Points
            this.modulePoints.total += numValue;
            break;
          case 'UT': // Talent Points (User Talent points)
            // Note: Talent points would need to be handled during character creation
            // This is stored for reference but applied elsewhere
            break;
          // Add more cases as needed for other trait bonuses
        }
      }
    }
  } catch (error) {
    console.error('Error applying trait effects:', error);
  }
};

// Keep async version for other use cases
CharacterSchema.methods.applyTraitEffects = async function() {
  // Only apply if a trait is selected
  if (!this.characterTrait) return;
  
  try {
    // Populate the trait if needed
    if (typeof this.characterTrait === 'string' || !this.characterTrait.options) {
      await this.populate('characterTrait');
    }
    
    // Call the sync version after population
    this.applyTraitEffectsSync();
  } catch (error) {
    console.error('Error applying trait effects:', error);
  }
};



// Pre-save hook to debug ancestry data
CharacterSchema.pre('save', function(next) {
  if (this.ancestry && this.ancestry.selectedOptions) {
    this.ancestry.selectedOptions.forEach((opt, index) => {
    });
  }
  next();
});

const Character = mongoose.model('Character', CharacterSchema);

export default Character;

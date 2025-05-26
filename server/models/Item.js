// server/models/Item.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

// Define the skill data structure used throughout the schema
const SkillBonusSchema = new Schema({
  add_bonus: { type: Number, default: 0 },
  set_bonus: { type: Number, default: 0 },
}, { _id: false });

const TalentBonusSchema = new Schema({
  add_talent: { type: Number, default: 0 },
  set_talent: { type: Number, default: 0 }
}, { _id: false });


const SkillTalentBonusSchema = new Schema({
  add_bonus: { type: Number, default: 0 },
  set_bonus: { type: Number, default: 0 },
  add_talent: { type: Number, default: 0 },
  set_talent: { type: Number, default: 0 }
}, { _id: false });


// Define weapon damage structure
const DamageSchema = new Schema({
  damage: { type: String, default: "0" },           // Base damage value as string to allow dice notation
  damage_extra: { type: String, default: "0" },     // Additional damage as string
  damage_type: { type: String, default: "physical" }, 
  category: { 
    type: String, 
    enum: ["pierce", "slash", "blunt", "ranged", "extra"],
    default: "blunt" 
  },
  secondary_damage: { type: Number, default: 0 },
  secondary_damage_extra: { type: Number, default: 0 },
  secondary_damage_type: { type: String, default: "none" },
  min_range: { type: Number, default: 0 },
  max_range: { type: Number, default: 0 }
}, { _id: false });

// Main Item Schema
const ItemSchema = new Schema({
  // Basic item information
  name: { type: String, required: true },
  description: { type: String, default: "" },
  weight: { type: Number, default: 1 },
  value: { type: Number, default: 0 },
  rarity: { 
    type: String, 
    enum: ["common", "uncommon", "rare", "epic", "legendary", "artifact"],
    default: "common"
  },
  
  // Item type information
  type: { 
    type: String, 
    enum: ["weapon", "boots", "body", "gloves", "headwear", "cloak", "accessory", "shield", "trade_good", "consumable", "tool", "instrument", "ammunition" ],
    required: true 
  },

  weapon_category: { 
      type: String, 
      enum: ["simpleMelee", "simpleRanged", "complexMelee", "complexRanged", "unarmed", "throwing"],
    },
  primary: DamageSchema,
  secondary: DamageSchema,


 armor_penalties:{
    movement: {type:Number, default:0},
    energy: {type:Number, default:0},
    fitness: {type:Number, default:0},
    stealth: {type:Number, default:0},
    coordination: {type:Number, default:0},
    evasion: {type:Number, default:0},
    deflection: {type:Number, default:0},
    senses: {type:Number, default:0},
 },
 

 health: {
    max:      { type: Number, default: 0 },   
    recovery: { type: Number, default: 0 }    
  },
  resolve: {
    max:      { type: Number, default: 0 },   
    recovery: { type: Number, default: 0 }    
  },
  energy: {
    max:      { type: Number, default: 0 },   
    recovery: { type: Number, default: 0 }    
  },

  movement: {                               
    type: Number,
    default: 0
  },
  
  attributes :{
      physique: { type: TalentBonusSchema, default: () => ({}) },
      finesse: { type: TalentBonusSchema, default: () => ({}) },
      mind: { type: TalentBonusSchema, default: () => ({}) },
      knowledge: { type: TalentBonusSchema, default: () => ({}) },
      social: { type: TalentBonusSchema, default: () => ({}) },
  },

  // Skill bonuses
  basic: {
    // Basic skills
    fitness: { type: SkillBonusSchema, default: () => ({}) },
    deflection: { type: SkillBonusSchema, default: () => ({}) },
    might: { type: SkillBonusSchema, default: () => ({}) },
    endurance: { type: SkillBonusSchema, default: () => ({}) },
    evasion: { type: SkillBonusSchema, default: () => ({}) },
    stealth: { type: SkillBonusSchema, default: () => ({}) },
    coordination: { type: SkillBonusSchema, default: () => ({}) },
    thievery: { type: SkillBonusSchema, default: () => ({}) },
    resilience: { type: SkillBonusSchema, default: () => ({}) },
    concentration: { type: SkillBonusSchema, default: () => ({}) },
    senses: { type: SkillBonusSchema, default: () => ({}) },
    logic: { type: SkillBonusSchema, default: () => ({}) },
    wildcraft: { type: SkillBonusSchema, default: () => ({}) },
    academics: { type: SkillBonusSchema, default: () => ({}) },
    magic: { type: SkillBonusSchema, default: () => ({}) },
    medicine: { type: SkillBonusSchema, default: () => ({}) },
    expression: { type: SkillBonusSchema, default: () => ({}) },
    presence: { type: SkillBonusSchema, default: () => ({}) },
    insight: { type: SkillBonusSchema, default: () => ({}) },
    persuasion: { type: SkillBonusSchema, default: () => ({}) }
  },
  
  // Crafting skill bonuses
  craft: {
    engineering: { type: SkillTalentBonusSchema, default: () => ({}) },
    fabrication: { type: SkillTalentBonusSchema, default: () => ({}) },
    alchemy: { type: SkillTalentBonusSchema, default: () => ({}) },
    cooking: { type: SkillTalentBonusSchema, default: () => ({}) },
    glyphcraft: { type: SkillTalentBonusSchema, default: () => ({}) },
    bioSculpting: { type: SkillTalentBonusSchema, default: () => ({}) }
  },
  
  // Magic skill bonuses
  magic: {
    black: { type: SkillTalentBonusSchema, default: () => ({}) },
    primal: { type: SkillTalentBonusSchema, default: () => ({}) },
    alteration: { type: SkillTalentBonusSchema, default: () => ({}) },
    divine: { type: SkillTalentBonusSchema, default: () => ({}) },
    mystic: { type: SkillTalentBonusSchema, default: () => ({}) }
  },
  
  // Weapon skill bonuses
  weapon: {
    unarmed: { type: SkillTalentBonusSchema, default: () => ({}) },
    throwing: { type: SkillTalentBonusSchema, default: () => ({}) },
    simpleRangedWeapons: { type: SkillTalentBonusSchema, default: () => ({}) },
    simpleMeleeWeapons: { type: SkillTalentBonusSchema, default: () => ({}) },
    complexRangedWeapons: { type: SkillTalentBonusSchema, default: () => ({}) },
    complexMeleeWeapons: { type: SkillTalentBonusSchema, default: () => ({}) }
  },
  
  // Mitigation bonuses
  mitigation: {
    physical: { type: Number, default: 0 },
    cold: { type: Number, default: 0 },
    heat: { type: Number, default: 0 },
    lightning: { type: Number, default: 0 },
    psychic: { type: Number, default: 0 },
    dark: { type: Number, default: 0 },
    divine: { type: Number, default: 0 },
    aether: { type: Number, default: 0 },
    toxic: { type: Number, default: 0 }
  },
  
  // Detections - vision types with range values
  detections: {
    normal: { type: Number, default: 0 },
    darksight: { type: Number, default: 0 },
    infravision: { type: Number, default: 0 },
    deadsight: { type: Number, default: 0 },
    echolocation: { type: Number, default: 0 },
    tremorsense: { type: Number, default: 0 },
    truesight: { type: Number, default: 0 },
    aethersight: { type: Number, default: 0 }
  },
  
  // Immunities - condition immunities
  immunities: {
    afraid: { type: Boolean, default: false },
    bleeding: { type: Boolean, default: false },
    blinded: { type: Boolean, default: false },
    charmed: { type: Boolean, default: false },
    confused: { type: Boolean, default: false },
    dazed: { type: Boolean, default: false },
    diseased: { type: Boolean, default: false },
    exhausted: { type: Boolean, default: false },
    frightened: { type: Boolean, default: false },
    grappled: { type: Boolean, default: false },
    incapacitated: { type: Boolean, default: false },
    invisible: { type: Boolean, default: false },
    paralyzed: { type: Boolean, default: false },
    petrified: { type: Boolean, default: false },
    poisoned: { type: Boolean, default: false },
    prone: { type: Boolean, default: false },
    restrained: { type: Boolean, default: false },
    stunned: { type: Boolean, default: false },
    unconscious: { type: Boolean, default: false }
  },
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true // Automatically handle createdAt and updatedAt
});

const Item = mongoose.model('Item', ItemSchema);

export default Item;
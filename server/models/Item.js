// server/models/Item.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

// Define the skill data structure used throughout the schema
const SkillBonusSchema = new Schema({
  add_bonus: { type: Number, default: 0 },
  set_bonus: { type: Number, default: -1 },
  add_talent: { type: Number, default: 0 },
  set_talent: { type: Number, default: -1 }
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
    enum: ["weapon", "armor", "gear", "consumable", "container", "currency"],
    required: true 
  },
  
  // For weapons
  weapon_data: {
    category: { 
      type: String, 
      enum: ["simpleMelee", "simpleRanged", "complexMelee", "complexRanged", "unarmed", "throwing"],
      required: function() { return this.type === 'weapon'; }
    },
    flags: [{ 
      type: String, 
      enum: ["heavy", "light", "silvered", "blackened", "masterwork", "magical", "cursed", "two-handed", "versatile", "reach", "finesse", "ammunition", "loading", "special"]
    }],
    primary: DamageSchema,
    secondary: DamageSchema
  },
  
  // For armor
  armor_data: {
    category: { 
      type: String, 
      enum: ["light", "medium", "heavy", "shield"],
      required: function() { return this.type === 'armor'; }
    },
    base_mitigation: { type: Number, default: 0 },
    dexterity_limit: { type: Number, default: 0 }
  },
  
  // Character attribute modifications
  health: { type: Number, default: 0 },
  resolve: { type: Number, default: 0 },
  stamina: { type: Number, default: 0 },
  movement: { type: Number, default: 0 },
  
  // Skill bonuses
  skills: {
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
  crafts: {
    engineering: { type: SkillBonusSchema, default: () => ({}) },
    fabrication: { type: SkillBonusSchema, default: () => ({}) },
    alchemy: { type: SkillBonusSchema, default: () => ({}) },
    cooking: { type: SkillBonusSchema, default: () => ({}) },
    glyphcraft: { type: SkillBonusSchema, default: () => ({}) },
    bioSculpting: { type: SkillBonusSchema, default: () => ({}) }
  },
  
  // Magic skill bonuses
  magic: {
    black: { type: SkillBonusSchema, default: () => ({}) },
    primal: { type: SkillBonusSchema, default: () => ({}) },
    alteration: { type: SkillBonusSchema, default: () => ({}) },
    divine: { type: SkillBonusSchema, default: () => ({}) },
    mystic: { type: SkillBonusSchema, default: () => ({}) }
  },
  
  // Weapon skill bonuses
  weaponSkills: {
    unarmed: { type: SkillBonusSchema, default: () => ({}) },
    throwing: { type: SkillBonusSchema, default: () => ({}) },
    simpleRangedWeapons: { type: SkillBonusSchema, default: () => ({}) },
    simpleMeleeWeapons: { type: SkillBonusSchema, default: () => ({}) },
    complexRangedWeapons: { type: SkillBonusSchema, default: () => ({}) },
    complexMeleeWeapons: { type: SkillBonusSchema, default: () => ({}) }
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
    arcane: { type: Number, default: 0 }
  },
  
  // Special effects and custom game logic
  effects: [{
    type: { type: String, required: true },
    description: { type: String, default: "" },
    data: { type: Schema.Types.Mixed } // For custom effect data
  }],
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true // Automatically handle createdAt and updatedAt
});

const Item = mongoose.model('Item', ItemSchema);

export default Item;
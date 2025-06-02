import mongoose from 'mongoose';
import crypto from 'crypto';

const playerSlotSchema = new mongoose.Schema({
  character: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Character',
    default: null
  },
  inviteToken: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values
  },
  isOpen: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startingTalents: {
    type: Number,
    required: true,
    min: 0,
    max: 20,
    default: 6
  },
  startingModulePoints: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 10
  },
  picture: {
    type: String,
    default: null
  },
  playerSlots: [playerSlotSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate unique invite token for a slot
campaignSchema.methods.generateInviteToken = function(slotIndex) {
  const token = crypto.randomBytes(16).toString('hex');
  this.playerSlots[slotIndex].inviteToken = token;
  this.playerSlots[slotIndex].isOpen = true;
  return token;
};

// Find campaign by invite token
campaignSchema.statics.findByInviteToken = function(token) {
  return this.findOne({
    'playerSlots.inviteToken': token,
    'playerSlots.isOpen': true,
    isActive: true
  }).populate([
    { path: 'owner', select: 'username' },
    { path: 'playerSlots.character' }
  ]);
};

// Get available slot by invite token
campaignSchema.methods.getSlotByInviteToken = function(token) {
  return this.playerSlots.find(slot => 
    slot.inviteToken === token && 
    slot.isOpen && 
    !slot.character
  );
};

// Join campaign with character
campaignSchema.methods.joinCampaign = function(token, characterId) {
  const slot = this.getSlotByInviteToken(token);
  if (!slot) {
    throw new Error('Invalid or expired invite token');
  }
  
  slot.character = characterId;
  slot.isOpen = false;
  slot.inviteToken = undefined;
  
  return this.save();
};

// Remove player from campaign
campaignSchema.methods.removePlayer = function(characterId) {
  const slot = this.playerSlots.find(slot => 
    slot.character && slot.character.toString() === characterId.toString()
  );
  
  if (slot) {
    slot.character = null;
    slot.isOpen = false;
    slot.inviteToken = undefined;
  }
  
  return this.save();
};

// Create empty player slots
campaignSchema.methods.createPlayerSlots = function(count) {
  this.playerSlots = [];
  for (let i = 0; i < count; i++) {
    this.playerSlots.push({
      character: null,
      // Don't set inviteToken at all to avoid unique constraint issues
      isOpen: false
    });
  }
};

// Virtual for occupied slots count
campaignSchema.virtual('occupiedSlots').get(function() {
  return this.playerSlots.filter(slot => slot.character).length;
});

// Ensure virtuals are included in JSON
campaignSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Campaign', campaignSchema);
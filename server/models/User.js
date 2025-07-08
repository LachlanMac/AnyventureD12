import mongoose from 'mongoose';
const { Schema } = mongoose;

const UserSchema = new Schema({
  discordId: {
    type: String,
    required: function() { return !this.isTemporary; },
    unique: true,
    sparse: true, // Allows undefined/null values for temporary users
    default: undefined // Ensure temporary users don't get null
  },
  username: {
    type: String,
    required: true
  },
  isTemporary: {
    type: Boolean,
    default: false
  },
  tempSessionId: {
    type: String,
    unique: true,
    sparse: true // Only temporary users will have this
  },
  expiresAt: {
    type: Date,
    // Only set for temporary users, will be handled in pre-save
  },
  usernameCustomized: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: String
  },
  email: {
    type: String
  },
  discriminator: {
    type: String
  },
  accessToken: {
    type: String
  },
  refreshToken: {
    type: String
  },
  guilds: {
    type: Array,
    default: []
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Pre-save middleware to set expiration for temporary users
UserSchema.pre('save', function(next) {
  if (this.isTemporary && !this.expiresAt) {
    // Set expiration to 24 hours from now
    this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
  next();
});

// Index for automatic cleanup of expired temporary users
UserSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const User = mongoose.model('User', UserSchema);

export default User;
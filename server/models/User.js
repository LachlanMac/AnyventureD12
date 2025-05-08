import mongoose from 'mongoose';
const { Schema } = mongoose;

const UserSchema = new Schema({
  discordId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
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

const User = mongoose.model('User', UserSchema);

export default User;
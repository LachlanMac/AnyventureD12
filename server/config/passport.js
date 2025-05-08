import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import User from '../models/User.js';

// Set up Discord Strategy
const setupPassport = () => {
  // Serialize user to the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  // Discord Strategy
  passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_CALLBACK_URL,
    scope: ['identify', 'email', 'guilds']
  }, 
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      let user = await User.findOne({ discordId: profile.id });
      
      // If not, create a new user
      if (!user) {
        user = await User.create({
          discordId: profile.id,
          username: profile.username,
          avatar: profile.avatar,
          email: profile.email,
          discriminator: profile.discriminator,
          accessToken,
          refreshToken,
          guilds: profile.guilds
        });
      } else {
        // Update existing user
        user.username = profile.username;
        user.avatar = profile.avatar;
        user.email = profile.email;
        user.discriminator = profile.discriminator;
        user.accessToken = accessToken;
        user.refreshToken = refreshToken;
        user.guilds = profile.guilds;
        user.lastLogin = Date.now();
        
        await user.save();
      }
      
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }));
};

export default setupPassport;
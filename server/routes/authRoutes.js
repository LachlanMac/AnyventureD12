import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User.js';

const router = express.Router();

// Discord login route
router.get('/discord', passport.authenticate('discord'));

// Discord callback route
router.get('/discord/callback', 
  passport.authenticate('discord', { 
    failureRedirect: '/login',
    session: false
  }),
  (req, res) => {
    // Generate JWT
    const token = jwt.sign(
      { 
        id: req.user._id,
        discordId: req.user.discordId,
        username: req.user.username
      }, 
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Token expires in 7 days
    );
    
    // Set JWT as HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure in production
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    // Redirect to the frontend
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:5174');
  }
);

// Logout route
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
});

// Check authentication status
router.get('/me', async (req, res) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ authenticated: false });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Return user info
    res.status(200).json({
      authenticated: true,
      user: {
        id: decoded.id,
        discordId: decoded.discordId || null,
        username: decoded.username,
        isTemporary: decoded.isTemporary || false
      }
    });
  } catch (err) {
    res.status(401).json({ authenticated: false });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { username } = req.body;
    
    // Validate username
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ message: 'Username is required' });
    }
    
    if (username.length < 1 || username.length > 32) {
      return res.status(400).json({ message: 'Username must be between 1 and 32 characters' });
    }
    
    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      decoded.id,
      { 
        username: username.trim(),
        usernameCustomized: true
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Generate new JWT with updated username
    const newToken = jwt.sign(
      { 
        id: updatedUser._id,
        discordId: updatedUser.discordId,
        username: updatedUser.username
      }, 
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Set new JWT as HttpOnly cookie
    res.cookie('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    // Return updated user info
    res.status(200).json({
      id: updatedUser._id,
      discordId: updatedUser.discordId,
      username: updatedUser.username
    });
  } catch (err) {
    console.error('Profile update error:', err);
    if (err.name === 'JsonWebTokenError') {
      res.status(401).json({ message: 'Invalid token' });
    } else {
      res.status(500).json({ message: 'Failed to update profile' });
    }
  }
});

// Create temporary session route
router.post('/temp-session', async (req, res) => {
  try {
    const { existingSessionId } = req.body;
    let tempUser;

    // Try to reuse existing session if provided
    if (existingSessionId) {
      tempUser = await User.findOne({ 
        tempSessionId: existingSessionId,
        isTemporary: true,
        expiresAt: { $gt: new Date() } // Make sure it hasn't expired
      });
      
      if (tempUser) {
        console.log('Reusing existing temporary session:', existingSessionId);
        // Update last login time
        tempUser.lastLogin = new Date();
        await tempUser.save();
      }
    }

    // Create new temporary user if no existing session found
    if (!tempUser) {
      // Generate a unique session ID
      const tempSessionId = uuidv4();
      
      // Create a temporary user document manually to avoid validation issues
      const tempUserData = {
        username: `Guest_${tempSessionId.slice(0, 8)}`,
        isTemporary: true,
        tempSessionId: tempSessionId,
        lastLogin: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        // Explicitly NOT setting discordId
      };
      
      tempUser = new User(tempUserData);
      await tempUser.save();
      console.log('Created new temporary session:', tempSessionId);
    }
    
    // Generate JWT for temporary user
    const token = jwt.sign(
      { 
        id: tempUser._id,
        username: tempUser.username,
        isTemporary: true,
        tempSessionId: tempUser.tempSessionId
      }, 
      process.env.JWT_SECRET,
      { expiresIn: '24h' } // Temporary sessions expire in 24 hours
    );
    
    // Set JWT as HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    res.status(200).json({
      authenticated: true,
      user: {
        id: tempUser._id,
        username: tempUser.username,
        isTemporary: true,
        tempSessionId: tempUser.tempSessionId // Return session ID for client storage
      }
    });
  } catch (error) {
    console.error('Error creating temporary session:', error);
    res.status(500).json({ message: 'Failed to create temporary session' });
  }
});

export default router;
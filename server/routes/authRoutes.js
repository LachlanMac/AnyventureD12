import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

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
        discordId: decoded.discordId,
        username: decoded.username
      }
    });
  } catch (err) {
    res.status(401).json({ authenticated: false });
  }
});

export default router;
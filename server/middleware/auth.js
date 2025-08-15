import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to protect routes
export const protect = async (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from the token
    const user = await User.findById(decoded.id).select('-accessToken -refreshToken');
    
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }
    
    // Set user in request
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Not authorized' });
  }
};

// Middleware to add user to request if authenticated
export const getUser = async (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;
    
    if (!token) {
      // Continue without setting user
      return next();
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from the token
    const user = await User.findById(decoded.id).select('-accessToken -refreshToken');
    
    if (user) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Continue without setting user
    next();
  }
};

// Middleware to block temporary users from homebrew features
export const blockTemporaryUsers = (req, res, next) => {
  if (req.user && req.user.isTemporary) {
    return res.status(403).json({ 
      message: 'Homebrew features are not available for temporary sessions. Please sign in with Discord to access homebrew content.',
      isTemporaryUser: true
    });
  }
  next();
};

// Middleware to ensure only permanent users can access
export const requirePermanentUser = async (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from the token
    const user = await User.findById(decoded.id).select('-accessToken -refreshToken');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    if (user.isTemporary) {
      return res.status(403).json({ 
        message: 'This feature requires a permanent account. Please sign in with Discord.',
        isTemporaryUser: true
      });
    }
    
    // Set user in request
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Not authorized' });
  }
};
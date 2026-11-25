import jwt from 'jsonwebtoken';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

let apiWhitelist = [];
try {
  const whitelistPath = join(__dirname, '../../data/api_whitelist.json');
  apiWhitelist = JSON.parse(readFileSync(whitelistPath, 'utf-8'));
} catch (e) {
  console.warn('Could not load API whitelist:', e.message);
}

// Middleware to protect routes (supports cookie auth and API key auth)
export const protect = async (req, res, next) => {
  try {
    // Check for API key first
    const apiKey = req.headers['x-api-key'];
    if (apiKey) {
      if (!apiWhitelist.includes(apiKey)) {
        return res.status(401).json({ message: 'Invalid API key' });
      }
      const user = await User.findOne({ apiKey }).select('-accessToken -refreshToken');
      if (!user) {
        return res.status(401).json({ message: 'Invalid API key' });
      }
      req.user = user;
      return next();
    }

    // Fall back to cookie auth
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

// Only whitelisted users (their apiKey is in data/api_whitelist.json) may change core game data.
// Works for Foundry (x-api-key header) and for a whitelisted user's browser session alike.
const checkWhitelisted = (req, res, next) => {
  const key = req.user?.apiKey;
  if (!key || !apiWhitelist.includes(key)) {
    return res.status(403).json({ message: 'Not authorized to change core game data' });
  }
  next();
};
export const requireWhitelisted = [protect, checkWhitelisted];

export const isWhitelistedUser = (user) => !!user?.apiKey && apiWhitelist.includes(user.apiKey);

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

// Middleware to require admin access
export const requireAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-accessToken -refreshToken');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(401).json({ message: 'Not authorized' });
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
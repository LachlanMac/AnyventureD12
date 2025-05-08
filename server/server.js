import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import passport from 'passport';
import cookieParser from 'cookie-parser';

// Import routes
import characterRoutes from './routes/characterRoutes.js';
import authRoutes from './routes/authRoutes.js';
import moduleRoutes from './routes/moduleRoutes.js';
import traitRoutes from './routes/traitRoutes.js';
import portraitRoutes from './routes/portraitRoutes.js';
// Import middleware
import { getUser } from './middleware/auth.js';

// Import config and utils
import setupPassport from './config/passport.js';
import { initializeModules } from './utils/moduleSeeder.js';
import { initializeTraits } from './utils/traitSeeder.js';

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize express
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:6000',
  credentials: true  // Allow cookies to be sent
}));
app.use(express.json());
app.use(cookieParser());

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());
setupPassport();

// Add user to request if authenticated
app.use(getUser);

// Connect to MongoDB and initialize modules
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/starventured12');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Initialize modules after database connection is established
    console.log('Initializing modules...');
    await initializeModules();
    console.log('Modules initialized');
    console.log('Initializing traits...');
    await initializeTraits();
    console.log('Traits initialized');
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/traits', traitRoutes);
app.use('/api/portraits', portraitRoutes);

// Root route for API health check
app.get('/api', (req, res) => {
  res.json({ message: 'API is running' });
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Handle 404 errors for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// Error handling middleware for API routes
app.use((err, req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.error(err.stack);
    res.status(500).json({
      message: err.message || 'Something went wrong on the server',
      stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
  } else {
    next(err);
  }
});

// Serve static assets in production
console.log(`Current environment: ${process.env.NODE_ENV}`);
console.log(`Static files path: ${path.join(__dirname, '../dist')}`);

// Static file serving - make sure this path is correct
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

// For any route that doesn't match above, send the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Define port
const PORT = process.env.PORT || 6000;

// Connect to database, then start server
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Server accessible at http://localhost:${PORT}`);
  });
});
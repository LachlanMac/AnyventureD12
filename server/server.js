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
import portraitRoutes from './routes/portraitRoutes.js';
import spellRoutes from './routes/spellRoutes.js';
import characterSpellRoutes from './routes/characterSpellRoutes.js';
import characterSongRoutes from './routes/characterSongRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import ancestryRoutes from './routes/ancestryRoutes.js';
import cultureRoutes from './routes/cultureRoutes.js';
import traitRoutes from './routes/traitRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import homebrewRoutes from './routes/homebrewRoutes.js';
import homebrewSpellRoutes from './routes/homebrewSpellRoutes.js';
import homebrewCreatureRoutes from './routes/homebrewCreatureRoutes.js';
import creatureRoutes from './routes/creatureRoutes.js';
import songRoutes from './routes/songRoutes.js';
import foundryRoutes from './routes/foundryRoutes.js';
// Import middleware
import { getUser } from './middleware/auth.js';

// Import config and utils
import setupPassport from './config/passport.js';
import { initializeItems } from './utils/itemSeeder.js';
import { initializeModules } from './utils/moduleSeeder.js';
import { initializeSpells } from './utils/spellSeeder.js';
import { initializeSongs } from './utils/songSeeder.js';
import { initializeAncestries } from './utils/ancestrySeeder.js';
import { initializeCultures } from './utils/cultureSeeder.js';
import { initializeTraits } from './utils/traitSeeder.js';
import { initializeInjuries } from './utils/injurySeeder.js';
import { loadCreaturesFromJson } from './utils/creatureSeeder.js';
// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize express
const app = express();

// Middleware
// Configure CORS to allow both React frontend and FoundryVTT
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5174',
  'http://localhost:30000', // FoundryVTT default port
  'http://localhost:5174'   // React dev server
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // For development, allow all origins. Change to callback(new Error('Not allowed by CORS')) for production
    }
  },
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
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/anyventuredx');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    console.log('Initializing items...');
    await initializeItems();
    console.log('Initializing modules...');
    await initializeModules();
    console.log('Initializing spells...');
    await initializeSpells();
    console.log('Initializing songs...');
    await initializeSongs();
    console.log('Initializing ancestries...');
    await initializeAncestries();
    console.log('Initializing cultures...');
    await initializeCultures();
    console.log('Initializing traits...');
    await initializeTraits();
    console.log('Initializing injuries...');
    await initializeInjuries();
    console.log('Initializing creatures...');
    await loadCreaturesFromJson();
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/ancestries', ancestryRoutes);
app.use('/api/cultures', cultureRoutes);
app.use('/api/traits', traitRoutes);
app.use('/api/portraits', portraitRoutes);
app.use('/api/spells', spellRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/homebrew', homebrewRoutes);
app.use('/api/homebrew', homebrewSpellRoutes);
app.use('/api/homebrew/creatures', homebrewCreatureRoutes);
app.use('/api/creatures', creatureRoutes);
app.use('/api/characters/:characterId/spells', characterSpellRoutes);
app.use('/api/characters/:characterId/songs', characterSongRoutes);
app.use('/fvtt', foundryRoutes);
// Root route for API health check
app.get('/api', (req, res) => {
  res.json({ message: 'API is running' });
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve data files (for languages, etc.)
app.use('/data', express.static(path.join(__dirname, '../data')));

// Serve monster images
app.use('/assets/monsters', express.static(path.join(__dirname, '../public/assets/monsters')));

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
const PORT = process.env.PORT || 4000;

// Connect to database, then start server
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Server accessible at http://localhost:${PORT}`);
  });
});

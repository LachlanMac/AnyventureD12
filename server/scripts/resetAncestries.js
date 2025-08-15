// server/scripts/resetAncestries.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { purgeAllAncestries, initializeAncestries } from '../utils/ancestrySeeder.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/anyventuredx';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    return true;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    return false;
  }
};

// Main function
const main = async () => {
  // Connect to database
  const connected = await connectDB();
  if (!connected) {
    process.exit(1);
  }
  
  try {
    // Reset and reseed ancestries
    console.log('Starting ancestry reset and reseed process...');
    
    // First purge all existing ancestries
    console.log('Step 1: Purging all ancestries from database...');
    const purged = await purgeAllAncestries();
    
    if (!purged) {
      console.log('❌ Failed to purge ancestries.');
      process.exit(1);
    }
    
    // Then initialize ancestries from JSON files
    console.log('Step 2: Reinitializing ancestries from JSON files...');
    const success = await initializeAncestries();
    
    if (success) {
      console.log('✅ Ancestry reset and reseed completed successfully!');
    } else {
      console.log('❌ Ancestry reset and reseed process failed.');
    }
  } catch (err) {
    console.error('Error during reset process:', err);
  } finally {
    // Disconnect from database
    await mongoose.disconnect();
    console.log('Database connection closed.');
    process.exit(0);
  }
};

// Run the main function
main();
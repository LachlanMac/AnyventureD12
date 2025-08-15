// server/scripts/resetCreatures.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { loadCreaturesFromJson } from '../utils/creatureSeeder.js';

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
    // Reset and reseed creatures
    console.log('Starting creature reset and reseed process...');
    
    const result = await loadCreaturesFromJson();
    
    if (result) {
      console.log('✅ Creature reset and reseed completed successfully!');
      console.log(`📊 Final Summary: ${result.loadedCount} new creatures loaded, ${result.updatedCount} creatures updated`);
    } else {
      console.log('❌ Creature reset and reseed process failed.');
    }
  } catch (err) {
    console.error('Error during reset process:', err);
  } finally {
    // Disconnect from database
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the script
main();
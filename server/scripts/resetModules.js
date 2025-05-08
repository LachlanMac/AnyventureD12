// server/scripts/resetModules.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { resetAndReseedModules } from '../utils/moduleSeeder.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/starventuredb';
    
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
    // Reset and reseed modules
    console.log('Starting module reset and reseed process...');
    
    const success = await resetAndReseedModules();
    
    if (success) {
      console.log('✅ Module reset and reseed completed successfully!');
    } else {
      console.log('❌ Module reset and reseed process failed.');
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
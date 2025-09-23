// server/scripts/resetLanguages.js
// Script to reset and reseed language data

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { resetAndReseedLanguages } from '../utils/languageSeeder.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/anyventure';

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
  console.log('========================================');
  console.log('       LANGUAGE RESET SCRIPT            ');
  console.log('========================================\n');

  // Connect to database
  const connected = await connectDB();
  if (!connected) {
    process.exit(1);
  }

  try {
    const success = await resetAndReseedLanguages();

    if (success) {
      console.log('\n✅ Languages reset completed successfully!');
      console.log('All languages now have persistent foundry_id values.');
    } else {
      console.error('\n❌ Language reset failed. Check logs above for details.');
    }
  } catch (err) {
    console.error('\n❌ Critical error:', err);
    process.exit(1);
  } finally {
    // Disconnect from database
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the script
main();
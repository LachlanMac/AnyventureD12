// Migration script to set usernameCustomized flag for existing users
import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const migrateUsernameCustomized = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update all existing users to have usernameCustomized: false
    // This allows them to receive Discord username updates until they customize
    const result = await User.updateMany(
      { usernameCustomized: { $exists: false } }, // Only update users who don't have this field yet
      { $set: { usernameCustomized: false } }
    );

    console.log(`Updated ${result.modifiedCount} users with usernameCustomized: false`);

    // Close connection
    await mongoose.connection.close();
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

// Run the migration
migrateUsernameCustomized();
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedConditions } from '../utils/conditionSeeder.js';

dotenv.config();

const resetConditions = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/anyventuredx');
    console.log('MongoDB Connected');

    // Seed conditions
    console.log('Resetting conditions...');
    const count = await seedConditions();
    console.log(`✓ Successfully reset ${count} conditions`);

    // Disconnect
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting conditions:', error);
    process.exit(1);
  }
};

resetConditions();

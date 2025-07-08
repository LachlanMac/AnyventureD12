import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedCultures } from '../utils/cultureSeeder.js';

dotenv.config();

const resetCultures = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/anyventuredx';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    await seedCultures();
    
    console.log('Culture reset complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting cultures:', error);
    process.exit(1);
  }
};

resetCultures();
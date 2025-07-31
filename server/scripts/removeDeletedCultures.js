import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Culture from '../models/Culture.js';

dotenv.config();

const removeDeletedCultures = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/anyventuredx';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // List of cultures to remove
    const culturesToRemove = ['Secretive', 'Exiled', 'Artisans'];
    
    console.log('Removing deleted cultures...');
    
    for (const cultureName of culturesToRemove) {
      const result = await Culture.deleteOne({ name: cultureName });
      if (result.deletedCount > 0) {
        console.log(`Removed culture: ${cultureName}`);
      } else {
        console.log(`Culture not found: ${cultureName}`);
      }
    }
    
    console.log('Culture removal complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error removing cultures:', error);
    process.exit(1);
  }
};

removeDeletedCultures();
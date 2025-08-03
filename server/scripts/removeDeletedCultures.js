import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Culture from '../models/Culture.js';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

dotenv.config();

const removeDeletedCultures = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/anyventuredx';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Get all culture files from the data directory
    const culturesDir = join(process.cwd(), 'data', 'cultures');
    const cultureFiles = readdirSync(culturesDir).filter(file => file.endsWith('.json'));
    
    // Get culture names from JSON files
    const existingCultureNames = new Set();
    for (const file of cultureFiles) {
      const filePath = join(culturesDir, file);
      const cultureData = JSON.parse(readFileSync(filePath, 'utf8'));
      if (cultureData.name) {
        existingCultureNames.add(cultureData.name);
      }
    }
    
    console.log(`Found ${existingCultureNames.size} cultures in JSON files:`, Array.from(existingCultureNames));
    
    // Get all cultures from database
    const dbCultures = await Culture.find({}, 'name');
    console.log(`Found ${dbCultures.length} cultures in database`);
    
    // Find cultures that are in DB but not in files
    const culturesToRemove = dbCultures.filter(culture => !existingCultureNames.has(culture.name));
    
    console.log(`Removing ${culturesToRemove.length} deleted cultures...`);
    
    for (const culture of culturesToRemove) {
      const result = await Culture.deleteOne({ _id: culture._id });
      if (result.deletedCount > 0) {
        console.log(`Removed culture: ${culture.name}`);
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
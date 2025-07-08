import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Culture from '../models/Culture.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cleanupCultures = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/anyventuredx';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Get all culture files from the data/cultures directory
    const cultureDir = path.join(__dirname, '../../data/cultures');
    const cultureFiles = fs.readdirSync(cultureDir)
      .filter(file => file.endsWith('.json'));
    
    // Extract culture names from filenames
    const validCultureNames = new Set();
    
    for (const file of cultureFiles) {
      const filePath = path.join(cultureDir, file);
      const cultureData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (cultureData.name) {
        validCultureNames.add(cultureData.name);
      }
    }

    console.log(`Found ${validCultureNames.size} valid cultures in files:`);
    console.log(Array.from(validCultureNames).sort().join(', '));

    // Find all cultures in database
    const dbCultures = await Culture.find({});
    console.log(`\nFound ${dbCultures.length} cultures in database`);

    // Find cultures that exist in DB but not in files
    const culturesToDelete = [];
    for (const culture of dbCultures) {
      if (!validCultureNames.has(culture.name)) {
        culturesToDelete.push(culture);
      }
    }

    if (culturesToDelete.length > 0) {
      console.log(`\nFound ${culturesToDelete.length} cultures in database that don't exist in files:`);
      culturesToDelete.forEach(culture => {
        console.log(`- ${culture.name} (ID: ${culture._id})`);
      });

      // Delete orphaned cultures
      const deleteIds = culturesToDelete.map(c => c._id);
      const result = await Culture.deleteMany({ _id: { $in: deleteIds } });
      console.log(`\nDeleted ${result.deletedCount} orphaned cultures from database`);
    } else {
      console.log('\nNo orphaned cultures found in database');
    }

    // Optional: Check for missing cultures (in files but not in DB)
    const dbCultureNames = new Set(dbCultures.map(c => c.name));
    const missingCultures = Array.from(validCultureNames).filter(name => !dbCultureNames.has(name));
    
    if (missingCultures.length > 0) {
      console.log(`\nFound ${missingCultures.length} cultures in files but not in database:`);
      console.log(missingCultures.join(', '));
      console.log('\nRun npm run reset-cultures to seed missing cultures');
    }

    console.log('\nCleanup complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

cleanupCultures();
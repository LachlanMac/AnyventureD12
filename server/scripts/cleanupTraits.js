import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Trait from '../models/Trait.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cleanupTraits = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/anyventuredx';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Get all trait files from the data/traits directory
    const traitDir = path.join(__dirname, '../../data/traits');
    const traitFiles = fs.readdirSync(traitDir)
      .filter(file => file.endsWith('.json'));
    
    // Extract trait names from files
    const validTraitNames = new Set();
    
    for (const file of traitFiles) {
      const filePath = path.join(traitDir, file);
      const traitData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (traitData.name) {
        validTraitNames.add(traitData.name);
      }
    }

    console.log(`Found ${validTraitNames.size} valid traits in files:`);
    console.log(Array.from(validTraitNames).sort().join(', '));

    // Find all traits in database
    const dbTraits = await Trait.find({});
    console.log(`\nFound ${dbTraits.length} traits in database`);

    // Find traits that exist in DB but not in files
    const traitsToDelete = [];
    for (const trait of dbTraits) {
      if (!validTraitNames.has(trait.name)) {
        traitsToDelete.push(trait);
      }
    }

    if (traitsToDelete.length > 0) {
      console.log(`\nFound ${traitsToDelete.length} traits in database that don't exist in files:`);
      traitsToDelete.forEach(trait => {
        console.log(`- ${trait.name} (ID: ${trait._id})`);
      });

      // Delete orphaned traits
      const deleteIds = traitsToDelete.map(t => t._id);
      const result = await Trait.deleteMany({ _id: { $in: deleteIds } });
      console.log(`\nDeleted ${result.deletedCount} orphaned traits from database`);
    } else {
      console.log('\nNo orphaned traits found in database');
    }

    // Check for missing traits (in files but not in DB)
    const dbTraitNames = new Set(dbTraits.map(t => t.name));
    const missingTraits = Array.from(validTraitNames).filter(name => !dbTraitNames.has(name));
    
    if (missingTraits.length > 0) {
      console.log(`\nFound ${missingTraits.length} traits in files but not in database:`);
      console.log(missingTraits.join(', '));
      console.log('\nRun npm run reset-traits to seed missing traits');
    }

    console.log('\nCleanup complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

cleanupTraits();
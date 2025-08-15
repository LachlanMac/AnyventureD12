// server/utils/ancestrySeeder.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Ancestry from '../models/Ancestry.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to ancestries data directory
const ancestriesDir = path.resolve(__dirname, '../../data/ancestries');

// Configuration flags
const PURGE_ANCESTRIES_BEFORE_SEED = false; // Set to true to purge all ancestries before seeding
const VERBOSE_LOGGING = true; // Set to false to reduce console output

// Function to purge all ancestries from the database
export const purgeAllAncestries = async () => {
  try {
    console.log('Purging all ancestries from the database...');
    const result = await Ancestry.deleteMany({});
    console.log(`Successfully purged ${result.deletedCount} ancestries.`);
    return true;
  } catch (err) {
    console.error(`Error purging ancestries: ${err.message}`);
    return false;
  }
};

// Function to read JSON ancestries from the filesystem
const readAncestriesFromFS = async () => {
  try {
    const files = fs.readdirSync(ancestriesDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    const ancestries = [];
    
    for (const file of jsonFiles) {
      const filePath = path.join(ancestriesDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      try {
        const ancestry = JSON.parse(fileContent);
        ancestries.push(ancestry);
      } catch (parseErr) {
        console.error(`Error parsing ${file}: ${parseErr.message}`);
      }
    }
    
    if (VERBOSE_LOGGING) {
      console.log(`Found ${ancestries.length} ancestry files.`);
    }
    
    return ancestries;
  } catch (err) {
    console.error(`Error reading ancestries from filesystem: ${err.message}`);
    return [];
  }
};

// Function to seed ancestries into the database
const seedAncestries = async (ancestries) => {
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const ancestryData of ancestries) {
    try {
      const existingAncestry = await Ancestry.findOne({ name: ancestryData.name });
      
      if (existingAncestry) {
        // Update existing ancestry
        const updatedAncestry = await Ancestry.findOneAndUpdate(
          { name: ancestryData.name },
          ancestryData,
          { new: true, upsert: true }
        );
        
        if (VERBOSE_LOGGING) {
          console.log(`Updated ancestry: ${updatedAncestry.name}`);
        }
        updated++;
      } else {
        // Create new ancestry
        const newAncestry = new Ancestry(ancestryData);
        await newAncestry.save();
        
        if (VERBOSE_LOGGING) {
          console.log(`Created ancestry: ${newAncestry.name}`);
        }
        created++;
      }
    } catch (err) {
      console.error(`Error processing ancestry ${ancestryData.name}: ${err.message}`);
      skipped++;
    }
  }

  console.log(`Ancestry seeding complete: ${created} created, ${updated} updated, ${skipped} skipped.`);
  return { created, updated, skipped };
};

// Main initialization function
export const initializeAncestries = async () => {
  try {
    console.log('Starting ancestry initialization...');
    
    // Purge all ancestries if configured
    if (PURGE_ANCESTRIES_BEFORE_SEED) {
      await purgeAllAncestries();
    }
    
    // Read ancestries from filesystem
    const ancestries = await readAncestriesFromFS();
    
    if (ancestries.length === 0) {
      console.log('No ancestries found to seed.');
      return false;
    }
    
    // Seed ancestries into database
    await seedAncestries(ancestries);
    
    console.log('Ancestry initialization complete!');
    return true;
  } catch (err) {
    console.error(`Error during ancestry initialization: ${err.message}`);
    return false;
  }
};
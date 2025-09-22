// server/utils/ancestrySeeder.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Ancestry from '../models/Ancestry.js';
import { generateFoundryId } from './foundryIdGenerator.js';

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
      // Add foundry_id if not present
      if (!ancestryData.foundry_id) {
        ancestryData.foundry_id = generateFoundryId();
      }

      const existingAncestry = await Ancestry.findOne({ name: ancestryData.name });

      if (existingAncestry) {
        // Update existing ancestry, generate foundry_id if missing
        if (!existingAncestry.foundry_id) {
          ancestryData.foundry_id = generateFoundryId();
        } else {
          ancestryData.foundry_id = existingAncestry.foundry_id; // Keep existing foundry_id
        }

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

// Function to reset and reseed all ancestries (preserving references)
export const resetAndReseedAncestries = async () => {
  try {
    console.log('Updating and reseeding all ancestries (preserving references)...');

    // Get list of ancestry names from JSON files
    const validAncestryNames = [];
    if (fs.existsSync(ancestriesDir)) {
      const files = fs.readdirSync(ancestriesDir).filter(file => file.endsWith('.json'));
      for (const file of files) {
        try {
          const filePath = path.join(ancestriesDir, file);
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const ancestryData = JSON.parse(fileContent);
          if (ancestryData.name) {
            validAncestryNames.push(ancestryData.name);
          }
        } catch (err) {
          console.error(`Error reading ${file}: ${err.message}`);
        }
      }
    }

    // Delete ancestries that are not in JSON files
    if (validAncestryNames.length > 0) {
      const deleteResult = await Ancestry.deleteMany({
        name: { $nin: validAncestryNames }
      });
      if (deleteResult.deletedCount > 0) {
        console.log(`Deleted ${deleteResult.deletedCount} orphaned ancestries not found in JSON files.`);
      }
    }

    // Now seed/update ancestries from JSON files (this preserves ObjectIds)
    const ancestries = await readAncestriesFromFS();
    const result = await seedAncestries(ancestries);

    if (result) {
      const newAncestryCount = await Ancestry.countDocuments();
      console.log(`Successfully reseeded ${newAncestryCount} ancestries.`);
      return true;
    }

    return false;
  } catch (err) {
    console.error(`Error resetting ancestries: ${err.message}`);
    return false;
  }
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
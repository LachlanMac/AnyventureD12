// server/utils/cultureSeeder.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Culture from '../models/Culture.js';
import { generateFoundryId } from './foundryIdGenerator.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to cultures data directory
const culturesDir = path.resolve(__dirname, '../../data/cultures');

// Configuration flags
const PURGE_CULTURES_BEFORE_SEED = false; // Set to true to purge all cultures before seeding
const VERBOSE_LOGGING = true; // Set to false to reduce console output

// Function to purge all cultures from the database
export const purgeAllCultures = async () => {
  try {
    console.log('Purging all cultures from the database...');
    const result = await Culture.deleteMany({});
    console.log(`Successfully purged ${result.deletedCount} cultures.`);
    return true;
  } catch (err) {
    console.error(`Error purging cultures: ${err.message}`);
    return false;
  }
};

// Function to read JSON cultures from the filesystem
const readCulturesFromFS = async () => {
  try {
    const files = fs.readdirSync(culturesDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    const cultures = [];
    for (const file of jsonFiles) {
      const filePath = path.join(culturesDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');

      try {
        const culture = JSON.parse(fileContent);
        cultures.push(culture);
      } catch (parseErr) {
        console.error(`Error parsing ${file}: ${parseErr.message}`);
      }
    }

    if (VERBOSE_LOGGING) {
      console.log(`Found ${cultures.length} culture files.`);
    }

    return cultures;
  } catch (err) {
    console.error(`Error reading cultures from filesystem: ${err.message}`);
    return [];
  }
};

// Function to seed cultures into the database
const seedCultures = async (cultures) => {
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const cultureData of cultures) {
    try {
      // Add foundry_id if not present
      if (!cultureData.foundry_id) {
        cultureData.foundry_id = generateFoundryId();
      }

      const existingCulture = await Culture.findOne({ name: cultureData.name });

      if (existingCulture) {
        // Update existing culture, generate foundry_id if missing
        if (!existingCulture.foundry_id) {
          cultureData.foundry_id = generateFoundryId();
        } else {
          cultureData.foundry_id = existingCulture.foundry_id; // Keep existing foundry_id
        }

        const updatedCulture = await Culture.findOneAndUpdate(
          { name: cultureData.name },
          cultureData,
          { new: true, upsert: true }
        );

        if (VERBOSE_LOGGING) {
          console.log(`Updated culture: ${updatedCulture.name}`);
        }
        updated++;
      } else {
        // Create new culture
        const newCulture = new Culture(cultureData);
        await newCulture.save();

        if (VERBOSE_LOGGING) {
          console.log(`Created culture: ${newCulture.name}`);
        }
        created++;
      }
    } catch (err) {
      console.error(`Error processing culture ${cultureData.name}: ${err.message}`);
      skipped++;
    }
  }

  console.log(`Culture seeding complete: ${created} created, ${updated} updated, ${skipped} skipped.`);
  return { created, updated, skipped };
};

// Function to reset and reseed all cultures (preserving references)
export const resetAndReseedCultures = async () => {
  try {
    console.log('Updating and reseeding all cultures (preserving references)...');

    // Get list of culture names from JSON files
    const validCultureNames = [];
    if (fs.existsSync(culturesDir)) {
      const files = fs.readdirSync(culturesDir).filter(file => file.endsWith('.json'));
      for (const file of files) {
        try {
          const filePath = path.join(culturesDir, file);
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const cultureData = JSON.parse(fileContent);
          if (cultureData.name) {
            validCultureNames.push(cultureData.name);
          }
        } catch (err) {
          console.error(`Error reading ${file}: ${err.message}`);
        }
      }
    }

    // Delete cultures that are not in JSON files
    if (validCultureNames.length > 0) {
      const deleteResult = await Culture.deleteMany({
        name: { $nin: validCultureNames }
      });
      if (deleteResult.deletedCount > 0) {
        console.log(`Deleted ${deleteResult.deletedCount} orphaned cultures not found in JSON files.`);
      }
    }

    // Now seed/update cultures from JSON files (this preserves ObjectIds)
    const cultures = await readCulturesFromFS();
    const result = await seedCultures(cultures);

    if (result) {
      const newCultureCount = await Culture.countDocuments();
      console.log(`Successfully reseeded ${newCultureCount} cultures.`);
      return true;
    }

    return false;
  } catch (err) {
    console.error(`Error resetting cultures: ${err.message}`);
    return false;
  }
};

// Main initialization function
export const initializeCultures = async () => {
  try {
    console.log('Starting culture initialization...');

    // Purge all cultures if configured
    if (PURGE_CULTURES_BEFORE_SEED) {
      await purgeAllCultures();
    }

    // Read cultures from filesystem
    const cultures = await readCulturesFromFS();
    if (cultures.length === 0) {
      console.log('No cultures found to seed.');
      return false;
    }

    // Seed cultures into database
    await seedCultures(cultures);

    console.log('Culture initialization complete!');
    return true;
  } catch (err) {
    console.error(`Error during culture initialization: ${err.message}`);
    return false;
  }
};
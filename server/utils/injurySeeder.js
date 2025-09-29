import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Injury from '../models/Injury.js';
import { generateFoundryId } from './foundryIdGenerator.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to injuries data directory
const injuriesDir = path.resolve(__dirname, '../../data/injuries');

// Function to read all injury JSON files from the injuries directory and subfolders
const readInjuriesFromDirectory = (directory) => {
  const injuries = [];

  if (!fs.existsSync(directory)) {
    console.log('Injuries directory does not exist.');
    return injuries;
  }

  // Get all entries in the injuries directory
  const entries = fs.readdirSync(directory, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.json')) {
      // Handle JSON files in the root directory (for backward compatibility)
      const fullPath = path.join(directory, entry.name);
      try {
        const fileContent = fs.readFileSync(fullPath, 'utf8');
        const injuryData = JSON.parse(fileContent);

        // Add source file information for debugging
        injuryData._source = entry.name;

        injuries.push(injuryData);
      } catch (err) {
        console.error(`Error reading injury file ${entry.name}: ${err.message}`);
      }
    } else if (entry.isDirectory()) {
      // Handle subdirectories (injury type folders)
      const subDirPath = path.join(directory, entry.name);
      const subDirFiles = fs.readdirSync(subDirPath, { withFileTypes: true });

      for (const subFile of subDirFiles) {
        if (subFile.isFile() && subFile.name.endsWith('.json')) {
          const fullPath = path.join(subDirPath, subFile.name);
          try {
            const fileContent = fs.readFileSync(fullPath, 'utf8');
            const injuryData = JSON.parse(fileContent);

            // Add source file information for debugging
            injuryData._source = path.join(entry.name, subFile.name);

            injuries.push(injuryData);
          } catch (err) {
            console.error(`Error reading injury file ${path.join(entry.name, subFile.name)}: ${err.message}`);
          }
        }
      }
    }
  }

  return injuries;
};

// Function to seed injuries from JSON files
export const seedInjuries = async () => {
  try {
    console.log('Initializing injuries...');

    // Read all injuries from the directory
    const injuriesData = readInjuriesFromDirectory(injuriesDir);

    if (injuriesData.length === 0) {
      console.log('No injury data found.');
      return true;
    }

    console.log(`Found ${injuriesData.length} injuries to seed.`);

    // Process each injury
    let createdCount = 0;
    let updatedCount = 0;

    for (const data of injuriesData) {
      try {
        // Use injury id as a unique identifier
        const existingInjury = await Injury.findOne({ id: data.id });

        if (existingInjury) {
          // Update existing injury but preserve the foundry_id
          console.log(`Updating existing injury: ${data.name}`);

          // Remove the _source metadata when updating the database
          const { _source, ...updateData } = data;
          updateData.foundry_id = existingInjury.foundry_id; // Preserve existing foundry_id

          await Injury.updateOne(
            { _id: existingInjury._id },
            { $set: updateData }
          );

          updatedCount++;
        } else {
          // Create new injury
          console.log(`Creating new injury: ${data.name}`);

          // Remove the _source metadata when saving to the database
          const { _source, ...injuryData } = data;

          // Generate foundry_id if missing
          if (!injuryData.foundry_id) {
            injuryData.foundry_id = generateFoundryId();
          }

          await Injury.create(injuryData);
          createdCount++;
        }
      } catch (err) {
        console.error(`Error processing injury ${data.name}: ${err.message}`);
      }
    }

    console.log(`Successfully seeded ${createdCount} new injuries and updated ${updatedCount} existing injuries.`);
    return true;
  } catch (error) {
    console.error('Error seeding injuries:', error);
    return false;
  }
};

// Function to reset and reseed all injuries
export const resetAndReseedInjuries = async () => {
  try {
    console.log('Updating and reseeding all injuries...');

    // Get list of injury IDs from JSON files (including subfolders)
    const validInjuryIds = [];
    if (fs.existsSync(injuriesDir)) {
      const entries = fs.readdirSync(injuriesDir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.json')) {
          // Handle files in root directory
          try {
            const filePath = path.join(injuriesDir, entry.name);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const injuryData = JSON.parse(fileContent);
            if (injuryData.id) {
              validInjuryIds.push(injuryData.id);
            }
          } catch (err) {
            console.error(`Error reading ${entry.name}: ${err.message}`);
          }
        } else if (entry.isDirectory()) {
          // Handle files in subdirectories
          const subDirPath = path.join(injuriesDir, entry.name);
          const subFiles = fs.readdirSync(subDirPath).filter(file => file.endsWith('.json'));

          for (const subFile of subFiles) {
            try {
              const filePath = path.join(subDirPath, subFile);
              const fileContent = fs.readFileSync(filePath, 'utf8');
              const injuryData = JSON.parse(fileContent);
              if (injuryData.id) {
                validInjuryIds.push(injuryData.id);
              }
            } catch (err) {
              console.error(`Error reading ${path.join(entry.name, subFile)}: ${err.message}`);
            }
          }
        }
      }
    }

    // Delete injuries that are not in JSON files
    if (validInjuryIds.length > 0) {
      const deleteResult = await Injury.deleteMany({
        id: { $nin: validInjuryIds }
      });
      if (deleteResult.deletedCount > 0) {
        console.log(`Deleted ${deleteResult.deletedCount} orphaned injuries not found in JSON files.`);
      }
    }

    // Now seed/update injuries from JSON files
    const success = await seedInjuries();

    if (success) {
      const newInjuryCount = await Injury.countDocuments();
      console.log(`Successfully reseeded ${newInjuryCount} injuries.`);
      return true;
    }

    return false;
  } catch (err) {
    console.error(`Error resetting injuries: ${err.message}`);
    return false;
  }
};

// Function to initialize injuries (used by server.js)
export const initializeInjuries = async () => {
  try {
    // Count existing injuries in database
    const injuryCount = await Injury.countDocuments();
    console.log(`Found ${injuryCount} existing injuries in database.`);

    // Seed injuries if needed
    await seedInjuries();

    console.log('Injury initialization complete.');
    return true;
  } catch (error) {
    console.error('Error initializing injuries:', error);
    return false;
  }
};
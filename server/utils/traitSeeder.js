// server/utils/traitSeeder.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Trait from '../models/Trait.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to traits data directory
const traitsDir = path.resolve(__dirname, '../../data/traits');

// Configuration flags
const PURGE_TRAITS_BEFORE_SEED = false; // Set to true to purge all traits before seeding
const VERBOSE_LOGGING = true; // Set to false to reduce console output

// Function to purge all traits from the database
export const purgeAllTraits = async () => {
  try {
    console.log('Purging all traits from the database...');
    const result = await Trait.deleteMany({});
    console.log(`Successfully purged ${result.deletedCount} traits.`);
    return true;
  } catch (err) {
    console.error(`Error purging traits: ${err.message}`);
    return false;
  }
};

// Function to read JSON traits from the filesystem
const readTraitsFromFS = async () => {
  try {
    // Check if traits directory exists
    if (!fs.existsSync(traitsDir)) {
      console.log('Traits directory does not exist, creating...');
      fs.mkdirSync(traitsDir, { recursive: true });
      return { traits: [], traitNames: [] };
    }
    
    // Get all JSON files in the directory
    const files = fs.readdirSync(traitsDir)
      .filter(file => file.endsWith('.json'));
    
    const traits = [];
    const traitNames = [];
    
    // Process each JSON file
    for (const file of files) {
      const filePath = path.join(traitsDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      try {
        const traitData = JSON.parse(fileContent);
        
        traits.push(traitData);
        traitNames.push(traitData.name.toLowerCase());
      } catch (err) {
        console.error(`Error parsing ${filePath}: ${err.message}`);
      }
    }
    
    return { traits, traitNames };
  } catch (err) {
    console.error(`Error reading traits directory: ${err.message}`);
    return { traits: [], traitNames: [] };
  }
};

// Function to seed traits to the database
export const seedTraits = async () => {
  try {
    // Optionally purge existing traits first
    if (PURGE_TRAITS_BEFORE_SEED) {
      const purgeSuccess = await purgeAllTraits();
      if (!purgeSuccess) {
        console.log('Skipping seed operation due to purge failure.');
        return;
      }
    }
    
    // Read traits from the filesystem
    const { traits: traitData, traitNames } = await readTraitsFromFS();
    

    
    console.log(`Found ${traitData.length} traits to seed.`);
    
    // Process each trait
    for (const data of traitData) {
      // Look for existing trait with the same name
      const existingTrait = await Trait.findOne({ name: data.name });
      
      if (existingTrait) {
        // Update existing trait without changing _id
        if (VERBOSE_LOGGING) {
          console.log(`Updating existing trait: ${data.name}`);
        }
        
        await Trait.updateOne(
          { _id: existingTrait._id },
          { 
            $set: {
              type: data.type,
              description: data.description,
              effects: data.effects || []
            }
          }
        );
      } else {
        // Create new trait
        if (VERBOSE_LOGGING) {
          console.log(`Creating new trait: ${data.name}`);
        }
        await Trait.create(data);
        if (VERBOSE_LOGGING) {
        console.log(`Created Trait  ${data.name}`);
        }
      }
    }
    
    // Find and delete traits that don't exist in JSON files
    const allDbTraits = await Trait.find({});
    const traitsToDelete = allDbTraits.filter(
      trait => !traitNames.includes(trait.name.toLowerCase())
    );
    
    if (traitsToDelete.length > 0) {
      console.log(`Deleting ${traitsToDelete.length} traits that don't exist in JSON files...`);
      
      for (const trait of traitsToDelete) {
        if (VERBOSE_LOGGING) {
          console.log(`Deleting trait: ${trait.name}`);
        }
        await Trait.deleteOne({ _id: trait._id });
      }
    } else {
      console.log('No traits need to be deleted.');
    }
    
    console.log('Trait seeding completed successfully.');
  } catch (err) {
    console.error(`Error seeding traits: ${err.message}`);
  }
};


// Export a function to run at server startup
export const initializeTraits = async () => {
  try {
    // Check if traits directory exists, create if not
    if (!fs.existsSync(traitsDir)) {
      console.log('Creating traits directory...');
      fs.mkdirSync(traitsDir, { recursive: true });
    }
    
    // Count existing traits in database
    const traitCount = await Trait.countDocuments();
    

    console.log(`Found ${traitCount} existing traits in database.`);

    
    // Seed traits from files
    await seedTraits();
    
  } catch (err) {
    console.error(`Error initializing traits: ${err.message}`);
  }
};
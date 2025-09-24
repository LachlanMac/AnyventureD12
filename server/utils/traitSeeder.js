// server/utils/traitSeeder.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Trait from '../models/Trait.js';
import { generateFoundryId } from './foundryIdGenerator.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to traits data directory
const traitsDir = path.resolve(__dirname, '../../data/traits');

// Function to seed traits from JSON files
export const seedTraits = async () => {
  try {
    // Check if traits directory exists
    if (!fs.existsSync(traitsDir)) {
      console.log('Traits directory does not exist. Skipping trait seeding.');
      return true;
    }

    // Get all JSON files in traits directory
    const files = fs.readdirSync(traitsDir).filter(file => file.endsWith('.json'));
    
    if (files.length === 0) {
      console.log('No trait files found.');
      return true;
    }

    let traitCount = 0;
    
    for (const file of files) {
      const filePath = path.join(traitsDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      try {
        const traitData = JSON.parse(fileContent);
        
        // Check if trait already exists
        const existingTrait = await Trait.findOne({ name: traitData.name });
        
        if (existingTrait) {
          // Update existing trait
          await Trait.findByIdAndUpdate(existingTrait._id, traitData);
          console.log(`Updated trait: ${traitData.name}`);
        } else {
          // Create new trait
          // Generate foundry_id if missing
          if (!traitData.foundry_id) {
            traitData.foundry_id = generateFoundryId();
          }
          await Trait.create(traitData);
          console.log(`Created trait: ${traitData.name}`);
          traitCount++;
        }
      } catch (err) {
        console.error(`Error processing ${filePath}: ${err.message}`);
      }
    }
    
    console.log(`Successfully seeded ${traitCount} new traits`);
    return true;
  } catch (error) {
    console.error('Error seeding traits:', error);
    return false;
  }
};

// Function to reset and reseed all traits
export const resetAndReseedTraits = async () => {
  try {
    console.log('Updating and reseeding all traits...');

    // Get list of trait names from JSON files
    const validTraitNames = [];
    if (fs.existsSync(traitsDir)) {
      const files = fs.readdirSync(traitsDir).filter(file => file.endsWith('.json'));
      for (const file of files) {
        try {
          const filePath = path.join(traitsDir, file);
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const traitData = JSON.parse(fileContent);
          if (traitData.name) {
            validTraitNames.push(traitData.name);
          }
        } catch (err) {
          console.error(`Error reading ${file}: ${err.message}`);
        }
      }
    }

    // Delete traits that are not in JSON files
    if (validTraitNames.length > 0) {
      const deleteResult = await Trait.deleteMany({
        name: { $nin: validTraitNames }
      });
      if (deleteResult.deletedCount > 0) {
        console.log(`Deleted ${deleteResult.deletedCount} orphaned traits not found in JSON files.`);
      }
    }

    // Now seed/update traits from JSON files
    const success = await seedTraits();

    if (success) {
      const newTraitCount = await Trait.countDocuments();
      console.log(`Successfully reseeded ${newTraitCount} traits.`);
      return true;
    }

    return false;
  } catch (err) {
    console.error(`Error resetting traits: ${err.message}`);
    return false;
  }
};

// Export a function to run at server startup
export const initializeTraits = async () => {
  try {
    // Count existing traits in database
    const traitCount = await Trait.countDocuments();
    console.log(`Found ${traitCount} existing traits in database.`);
    
    // Seed traits if needed
    await seedTraits();
    
    console.log('Trait initialization complete.');
    return true;
  } catch (err) {
    console.error(`Error initializing traits: ${err.message}`);
    return false;
  }
};
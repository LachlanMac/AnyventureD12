// server/utils/spellSeeder.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Spell from '../models/Spell.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to spells data directory
const spellsDir = path.resolve(__dirname, '../../data/spells');

// Function to seed spells from JSON files
export const seedSpells = async () => {
  try {
    const schools = ['meta', 'black', 'divine', 'mysticism', 'primal'];
    let spellCount = 0;
    
    for (const school of schools) {
      const schoolDir = path.join(spellsDir, school);
        console.log("Checking ", schoolDir);
      // Skip if directory doesn't exist
      if (!fs.existsSync(schoolDir)) {
        console.log(`Directory for school ${school} not found, skipping...`);
        continue;
      }
      
      const subschools = fs.readdirSync(schoolDir)
        .filter(file => fs.statSync(path.join(schoolDir, file)).isDirectory());
     
      for (const subschool of subschools) {
        const subschoolDir = path.join(schoolDir, subschool);
       
        // Get all JSON files in the subschool directory
        const files = fs.readdirSync(subschoolDir)
          .filter(file => file.endsWith('.json'));
        
        for (const file of files) {
          const filePath = path.join(subschoolDir, file);
          const fileContent = fs.readFileSync(filePath, 'utf8');
          
          try {
            const spellData = JSON.parse(fileContent);
            
            // Add school and subschool if not present
            spellData.school = school;
            spellData.subschool = subschool;
            
            // Ensure official spells are marked as not homebrew
            spellData.isHomebrew = false;
            
            // Check if spell already exists
            const existingSpell = await Spell.findOne({ name: spellData.name });
            
            if (existingSpell) {
              // Update existing spell
              await Spell.findByIdAndUpdate(existingSpell._id, spellData);
            } else {
              // Create new spell
              await Spell.create(spellData);
              spellCount++;
            }
          } catch (err) {
            console.error(`Error processing ${filePath}: ${err.message}`);
          }
        }
      }
    }
    
    console.log(`Successfully seeded ${spellCount} new spells`);
    return true;
  } catch (error) {
    console.error('Error seeding spells:', error);
    return false;
  }
};

// Function to reset and reseed all spells
export const resetAndReseedSpells = async () => {
  try {
    console.log('Updating and reseeding all spells (preserving references)...');
    
    // This will update existing spells and create new ones (preserving ObjectIds)
    const success = await seedSpells();
    
    if (success) {
      const newSpellCount = await Spell.countDocuments();
      console.log(`Successfully reseeded ${newSpellCount} spells.`);
      return true;
    }
    
    return false;
  } catch (err) {
    console.error(`Error resetting spells: ${err.message}`);
    return false;
  }
};

// Export a function to run at server startup
export const initializeSpells = async () => {
  try {
    // Count existing spells in database
    const spellCount = await Spell.countDocuments();
    console.log(`Found ${spellCount} existing spells in database.`);
    
    // Seed spells if needed
  
    await seedSpells();
    
    
    console.log('Spell initialization complete.');
    return true;
  } catch (err) {
    console.error(`Error initializing spells: ${err.message}`);
    return false;
  }
};
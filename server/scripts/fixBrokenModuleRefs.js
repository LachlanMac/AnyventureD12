// server/scripts/fixBrokenModuleRefs.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Character from '../models/Character.js';
import Module from '../models/Module.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/anyventuredx';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    return true;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    return false;
  }
};

// Main function to fix broken module references
const fixBrokenModuleRefs = async () => {
  try {
    // Get all modules indexed by name
    const modules = await Module.find({});
    const modulesByName = {};
    modules.forEach(module => {
      modulesByName[module.name] = module;
    });
    
    console.log(`Found ${modules.length} modules in database`);
    
    // Get all characters
    const characters = await Character.find({});
    console.log(`Found ${characters.length} characters to check`);
    
    let fixedCount = 0;
    
    for (const character of characters) {
      let needsSave = false;
      const updatedModules = [];
      
      // Check each module reference
      for (const charModule of character.modules) {
        try {
          // Try to find the module by ID first
          const moduleExists = await Module.findById(charModule.moduleId);
          
          if (!moduleExists) {
            console.log(`Character ${character.name} has broken module reference: ${charModule.moduleId}`);
            
            // Try to find module by checking populated data or other means
            // This is a placeholder - you'd need to implement logic to determine
            // which module this was supposed to be (maybe by selectedOptions pattern)
            console.log(`  - Unable to automatically fix this reference`);
            console.log(`  - Selected options were:`, charModule.selectedOptions);
            
            // Skip this module for now
            continue;
          } else {
            // Module exists, keep it
            updatedModules.push(charModule);
          }
        } catch (err) {
          console.log(`Error checking module ${charModule.moduleId} for character ${character.name}: ${err.message}`);
        }
      }
      
      // Update character if modules were removed
      if (updatedModules.length !== character.modules.length) {
        character.modules = updatedModules;
        await character.save();
        fixedCount++;
        console.log(`Updated character ${character.name} - removed ${character.modules.length - updatedModules.length} broken references`);
      }
    }
    
    console.log(`\nFixed ${fixedCount} characters with broken module references`);
    console.log('Note: This script only removes broken references. You may need to manually re-add modules.');
    
  } catch (err) {
    console.error('Error fixing module references:', err);
  }
};

// Main execution
const main = async () => {
  const connected = await connectDB();
  if (!connected) {
    process.exit(1);
  }
  
  await fixBrokenModuleRefs();
  
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
  process.exit(0);
};

main();
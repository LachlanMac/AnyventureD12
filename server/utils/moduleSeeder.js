// server/utils/moduleSeeder.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Module from '../models/Module.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to modules data directory
const modulesDir = path.resolve(__dirname, '../../data/modules');

// Configuration flags
const PURGE_MODULES_BEFORE_SEED = false; // Set to true to purge all modules before seeding
const VERBOSE_LOGGING = true; // Set to false to reduce console output

// Function to generate descriptions for racial modules if they don't exist
function generateRaceDescription(raceName) {
  switch (raceName.toLowerCase()) {
    case 'human':
      return 'Adaptable and innovative, humans are versatile explorers who have spread throughout the galaxy, establishing colonies and trade networks.';
    case 'jhen':
      return 'Amphibious beings with enhanced sensory abilities, the Jhen are naturally attuned to water environments and excel at navigation and exploration.';
    case 'protoelf':
      return 'Descendants of ancient genetic engineers, Protoelves have enhanced reflexes and mental capabilities along with extended lifespans.';
    case 'vxyahlian':
      return 'Insect-like beings with exoskeletons and heightened engineering skills, Vxyahlians are natural builders and technologists.';
    case 'zssesh':
      return 'Reptilian species with natural resilience to harsh environments, the Zssesh have remarkable regenerative capabilities and physical endurance.';
    default:
      return 'A unique species with distinctive physiological and cultural traits.';
  }
}

// Function to purge all modules from the database
export const purgeAllModules = async () => {
  try {
    console.log('Purging all modules from the database...');
    const result = await Module.deleteMany({});
    console.log(`Successfully purged ${result.deletedCount} modules.`);
    return true;
  } catch (err) {
    console.error(`Error purging modules: ${err.message}`);
    return false;
  }
};

// Function to read JSON modules from the filesystem
const readModulesFromFS = async () => {
  try {
    // Get all module type directories
    const moduleTypes = fs.readdirSync(modulesDir)
      .filter(file => fs.statSync(path.join(modulesDir, file)).isDirectory());
    
    const modules = [];
    const moduleNames = []; // Track names for comparison later
    
    // Process each module type directory
    for (const moduleType of moduleTypes) {
      const typeDir = path.join(modulesDir, moduleType);
      
      // Get all JSON files in the directory
      const files = fs.readdirSync(typeDir)
        .filter(file => file.endsWith('.json'));
      
      // Process each JSON file
      for (const file of files) {
        const filePath = path.join(typeDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        try {
          const moduleData = JSON.parse(fileContent);
          
          // Ensure the module has the correct type based on directory
          moduleData.mtype = moduleType;
          
          // Add description for racial modules if it doesn't exist
          if (moduleType === 'racial' && !moduleData.description) {
            moduleData.description = generateRaceDescription(moduleData.name);
          }
          
          modules.push(moduleData);
          moduleNames.push(moduleData.name.toLowerCase()); // Store lowercase name for case-insensitive comparison
        } catch (err) {
          console.error(`Error parsing ${filePath}: ${err.message}`);
        }
      }
    }
    
    return { modules, moduleNames };
  } catch (err) {
    console.error(`Error reading modules directory: ${err.message}`);
    return { modules: [], moduleNames: [] };
  }
};

// Function to seed modules to the database
export const seedModules = async () => {
  try {
    // Optionally purge existing modules first
    if (PURGE_MODULES_BEFORE_SEED) {
      const purgeSuccess = await purgeAllModules();
      if (!purgeSuccess) {
        console.log('Skipping seed operation due to purge failure.');
        return;
      }
    }
    
    // Read modules from the filesystem
    const { modules: moduleData, moduleNames } = await readModulesFromFS();
    
    if (!moduleData.length) {
      console.log('No module data found.');
      return;
    }
    
    console.log(`Found ${moduleData.length} modules to seed.`);
    
    // Process each module
    for (const data of moduleData) {
      // Look for existing module with the same name
      const existingModule = await Module.findOne({ name: data.name });
      
      if (existingModule) {
        // Update existing module without changing _id
        if (VERBOSE_LOGGING) {
          console.log(`Updating existing module: ${data.name}`);
        }
        
        await Module.updateOne(
          { _id: existingModule._id },
          { 
            $set: {
              mtype: data.mtype,
              ruleset: data.ruleset,
              options: data.options,
              description: data.description || existingModule.description
            }
          }
        );
      } else {
        // Create new module
        if (VERBOSE_LOGGING) {
          console.log(`Creating new module: ${data.name}`);
        }
        await Module.create(data);
      }
    }
    
    // Find and delete modules that don't exist in JSON files
    const allDbModules = await Module.find({});
    const modulesToDelete = allDbModules.filter(
      module => !moduleNames.includes(module.name.toLowerCase())
    );
    
    if (modulesToDelete.length > 0) {
      console.log(`Deleting ${modulesToDelete.length} modules that don't exist in JSON files...`);
      
      for (const module of modulesToDelete) {
        if (VERBOSE_LOGGING) {
          console.log(`Deleting module: ${module.name}`);
        }
        await Module.deleteOne({ _id: module._id });
      }
    } else {
      console.log('No modules need to be deleted.');
    }
    
    console.log('Module seeding completed successfully.');
  } catch (err) {
    console.error(`Error seeding modules: ${err.message}`);
  }
};

// Export a function to run at server startup
export const initializeModules = async () => {
  try {
    // Check if modules directory exists, create if not
    if (!fs.existsSync(modulesDir)) {
      console.log('Creating modules directory structure...');
      
      fs.mkdirSync(modulesDir, { recursive: true });
      
      // Create subdirectories for each module type
      fs.mkdirSync(path.join(modulesDir, 'racial'), { recursive: true });
      fs.mkdirSync(path.join(modulesDir, 'core'), { recursive: true });
      fs.mkdirSync(path.join(modulesDir, 'secondary'), { recursive: true });
      
      // Create sample module
      const sampleModule = {
        name: "Acrobat",
        description: "A specialist in movement and agility, capable of impressive feats of balance and grace.",
        ruleset: 0,
        options: [
          {
            name: "Acrobat",
            description: "Gain +1 Acrobatics and +1 Initiative.",
            location: "1",
            data: "AS3=1:ASH=1"
          },
          {
            name: "Safe Fall",
            description: "You take half Damage from falling that is applied after the Acrobatics Check to Mitigate the Damage. Additionally, you take no Damage when falling 6 Units or less.",
            location: "2a",
            data: "TG"
          },
          {
            name: "Aerialist",
            description: "Your Acrobatics Modifier replaces your Athletics for determining the distance you can Jump and checks that involve Climbing.",
            location: "2b",
            data: "TG"
          },
          {
            name: "Reaction : Rolling Dodge",
            description: "Gain +1 Dodge until the start of your next turn. Each time you Dodge an Attack successfully, gain another +1 Dodge until the start of your next turn",
            location: "3",
            data: "ZX2"
          },
          {
            name: "Action : Parkour Strike",
            description: "Make an Attack with a +2 Modifier. If your Attack hits, you can bounce off your Target 1 unit plus a distance equal to your Melee Range and avoid provoking Reactions.",
            location: "4a",
            data: ""
          },
          {
            name: "Quick Dodge",
            description: "You can use your Dodge Modifier to Defend against Ray Attacks",
            location: "4b",
            data: "TD"
          },
          {
            name: "Master Acrobat",
            description: "Gain +1 Dodge, +1 Movement Speed and +1 Acrobatics",
            location: "5",
            data: "AD2=1:AV=1:AS3=1"
          }
        ]
      };
      
      // Write sample module to file
      fs.writeFileSync(
        path.join(modulesDir, 'secondary', 'acrobat.json'),
        JSON.stringify(sampleModule, null, 2)
      );
      
      console.log('Created sample module: Acrobat');
    }
    
    // Seed modules from files
    await seedModules();
    
  } catch (err) {
    console.error(`Error initializing modules: ${err.message}`);
  }
};

// Function to manually purge and reseed all modules
export const resetAndReseedModules = async () => {
  try {
    // Force purge regardless of flag
    console.log('Starting complete database reset...');
    await purgeAllModules();
    
    // Then seed all modules
    console.log('Reseeding all modules...');
    const { modules: moduleData } = await readModulesFromFS();
    console.log(`Found ${moduleData.length} modules to seed.`);
    
    for (const data of moduleData) {
      await Module.create(data);
      if (VERBOSE_LOGGING) {
        console.log(`Created module: ${data.name}`);
      }
    }
    
    console.log('Module reset and reseed completed successfully!');
    return true;
  } catch (err) {
    console.error(`Error during reset and reseed: ${err.message}`);
    return false;
  }
};
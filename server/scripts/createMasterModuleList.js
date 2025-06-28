import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const secondaryModulesPath = path.join(__dirname, '../../data/modules/secondary');
const outputPath = path.join(__dirname, '../../data/moduletest/master-module-list.json');
const outputDir = path.dirname(outputPath);

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to condense a module
function condenseModule(module) {
  const condensed = {
    name: module.name,
    id: module.id
  };

  // Process each option
  module.options.forEach(option => {
    const location = option.location;
    condensed[`option_${location}_name`] = option.name;
    condensed[`option_${location}_desc`] = option.description;
    condensed[`option_${location}_data`] = option.data;
  });

  return condensed;
}

// Main function
async function createMasterModuleList() {
  try {
    console.log('Creating master module list...');
    
    // Read all files in secondary modules directory
    const files = fs.readdirSync(secondaryModulesPath)
      .filter(file => file.endsWith('.json'));
    
    const condensedModules = [];
    
    // Process each file
    for (const file of files) {
      const filePath = path.join(secondaryModulesPath, file);
      try {
        const moduleData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const condensed = condenseModule(moduleData);
        condensedModules.push(condensed);
        console.log(`✓ Processed: ${file}`);
      } catch (error) {
        console.error(`✗ Error processing ${file}:`, error.message);
      }
    }
    
    // Sort by name for consistency
    condensedModules.sort((a, b) => a.name.localeCompare(b.name));
    
    // Write output file
    fs.writeFileSync(outputPath, JSON.stringify(condensedModules, null, 2));
    
    console.log(`\n✅ Master module list created successfully!`);
    console.log(`📁 Output: ${outputPath}`);
    console.log(`📊 Total modules: ${condensedModules.length}`);
    
  } catch (error) {
    console.error('Failed to create master module list:', error);
    process.exit(1);
  }
}

// Run the script
createMasterModuleList();
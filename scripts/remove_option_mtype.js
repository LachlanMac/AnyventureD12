#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to modules directory
const modulesDir = path.join(__dirname, '..', 'data', 'modules');

// Statistics tracking
let filesProcessed = 0;
let filesModified = 0;
let totalMtypesRemoved = 0;

// Function to recursively process all JSON files in a directory
function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively process subdirectories
      processDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      // Process JSON files
      processModuleFile(fullPath);
    }
  }
}

// Function to process a single module JSON file
function processModuleFile(filePath) {
  filesProcessed++;
  
  try {
    // Read the file
    const content = fs.readFileSync(filePath, 'utf8');
    const module = JSON.parse(content);
    
    let modified = false;
    let mtypesRemoved = 0;
    
    // Process options array if it exists
    if (module.options && Array.isArray(module.options)) {
      for (const option of module.options) {
        if ('mtype' in option) {
          delete option.mtype;
          modified = true;
          mtypesRemoved++;
        }
      }
      
      if (mtypesRemoved > 0) {
        console.log(`  Removed ${mtypesRemoved} mtype field(s) from options in: ${module.name}`);
      }
    }
    
    // If any modifications were made, write the file back
    if (modified) {
      const updatedContent = JSON.stringify(module, null, 2);
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      filesModified++;
      totalMtypesRemoved += mtypesRemoved;
      console.log(`✅ Updated: ${path.relative(modulesDir, filePath)}`);
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Main function
function main() {
  console.log('🔍 Starting module option mtype removal process...');
  console.log(`📁 Processing modules in: ${modulesDir}`);
  console.log('ℹ️  Note: This will keep mtype in the main module but remove it from all options');
  console.log('');
  
  // Check if modules directory exists
  if (!fs.existsSync(modulesDir)) {
    console.error(`❌ Modules directory not found: ${modulesDir}`);
    process.exit(1);
  }
  
  // Process all module files
  processDirectory(modulesDir);
  
  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary:');
  console.log(`  Files processed: ${filesProcessed}`);
  console.log(`  Files modified: ${filesModified}`);
  console.log(`  Total mtype fields removed from options: ${totalMtypesRemoved}`);
  
  if (filesModified === 0) {
    console.log('\n✨ No mtype fields found in options. All modules are already clean!');
  } else {
    console.log(`\n✨ Successfully removed ${totalMtypesRemoved} mtype field(s) from options in ${filesModified} file(s)!`);
    console.log('💡 Main module mtype fields were preserved as intended.');
  }
}

// Run the script
main();
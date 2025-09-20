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
let totalCostsRemoved = 0;

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
    let costsRemoved = 0;
    
    // Check if the module itself has a cost field
    if ('cost' in module) {
      delete module.cost;
      modified = true;
      costsRemoved++;
      console.log(`  Removed cost from module: ${module.name}`);
    }
    
    // Check if any options have cost fields
    if (module.options && Array.isArray(module.options)) {
      for (const option of module.options) {
        if ('cost' in option) {
          delete option.cost;
          modified = true;
          costsRemoved++;
        }
      }
      
      if (costsRemoved > 0 && module.options.length > 0) {
        console.log(`  Removed ${costsRemoved} cost field(s) from options in: ${module.name}`);
      }
    }
    
    // If any modifications were made, write the file back
    if (modified) {
      const updatedContent = JSON.stringify(module, null, 2);
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      filesModified++;
      totalCostsRemoved += costsRemoved;
      console.log(`✅ Updated: ${path.relative(modulesDir, filePath)}`);
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Main function
function main() {
  console.log('🔍 Starting module cost removal process...');
  console.log(`📁 Processing modules in: ${modulesDir}`);
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
  console.log(`  Total cost fields removed: ${totalCostsRemoved}`);
  
  if (filesModified === 0) {
    console.log('\n✨ No cost fields found. All modules are already clean!');
  } else {
    console.log(`\n✨ Successfully removed ${totalCostsRemoved} cost field(s) from ${filesModified} file(s)!`);
  }
}

// Run the script
main();
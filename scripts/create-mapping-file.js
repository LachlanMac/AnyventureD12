import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createMappingFile() {
  const itemsDir = path.join(__dirname, '../data/items');
  const outputFile = path.join(__dirname, '../data/foundry/map.txt');
  const items = [];

  function processDirectory(dir) {
    const entries = fs.readdirSync(dir);

    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        processDirectory(fullPath);
      } else if (entry.endsWith('.json')) {
        try {
          const itemData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
          items.push(itemData.name);
        } catch (error) {
          console.error(`Error reading ${entry}:`, error.message);
        }
      }
    }
  }

  console.log('Collecting all item names...');
  processDirectory(itemsDir);

  // Sort items alphabetically for easier manual mapping
  items.sort();

  // Create the mapping file
  const mappingContent = items.map(itemName => `${itemName}->`).join('\n');

  fs.writeFileSync(outputFile, mappingContent);

  console.log(`✓ Created mapping file: ${outputFile}`);
  console.log(`✓ Total items: ${items.length}`);
  console.log('\nFile format: itemname->');
  console.log('You can now manually add foundry icon paths after each arrow.');
}

createMappingFile();
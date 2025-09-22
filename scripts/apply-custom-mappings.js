import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function applyCustomMappings() {
  // Read the custom mapping file
  const mappingFile = path.join(__dirname, '../data/foundry/newmap.txt');
  const mappingContent = fs.readFileSync(mappingFile, 'utf8');

  // Parse the mappings
  const mappings = new Map();
  const lines = mappingContent.split('\n').filter(line => line.trim());

  for (const line of lines) {
    const [itemName, iconPath] = line.split('->');
    if (itemName && iconPath && iconPath.trim()) {
      mappings.set(itemName.trim(), iconPath.trim());
    }
  }

  console.log(`Loaded ${mappings.size} custom mappings from newmap.txt`);

  // Process all items
  const itemsDir = path.join(__dirname, '../data/items');
  let updatedCount = 0;
  let notFoundCount = 0;
  let errorCount = 0;

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
          const itemName = itemData.name;

          if (mappings.has(itemName)) {
            const newIcon = mappings.get(itemName);
            const oldIcon = itemData.foundry_icon || 'none';

            itemData.foundry_icon = newIcon;
            fs.writeFileSync(fullPath, JSON.stringify(itemData, null, 2));

            console.log(`✓ Updated ${itemName}: ${newIcon}`);
            updatedCount++;
          } else {
            console.log(`⚠ No mapping found for: ${itemName}`);
            notFoundCount++;
          }

        } catch (error) {
          console.error(`✗ Error processing ${entry}:`, error.message);
          errorCount++;
        }
      }
    }
  }

  console.log('\nApplying custom foundry icon mappings...');
  processDirectory(itemsDir);

  console.log(`\n=== SUMMARY ===`);
  console.log(`Updated: ${updatedCount}`);
  console.log(`Not found in mappings: ${notFoundCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Total mappings available: ${mappings.size}`);
}

applyCustomMappings();
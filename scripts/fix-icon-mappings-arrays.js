import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fixIconMappingsInArrays() {
  // Define the corrected mappings
  const corrections = new Map([
    // Remaining items from user's list
    ['Aetherium Mail', 'icons/commodities/metal/mail-chain-steel.webp'],
    ['Aetherium Plates', 'icons/tools/smithing/plate-steel-grey.webp'],
    ['Aetherium Point', 'icons/commodities/metal/arrowhead-steel.webp'],
    ['Iron Heavy Blade', 'icons/commodities/metal/barstock-heated-steel.webp'],
    ['Iron Light Blade', 'icons/commodities/metal/barstock-heated-steel.webp'],
    ['Iron Mail', 'icons/commodities/metal/mail-chain-steel.webp'],
    ['Iron Plates', 'icons/tools/smithing/plate-steel-grey.webp'],
    ['Iron Point', 'icons/commodities/metal/arrowhead-steel.webp'],
    ['Leather Lash', 'icons/weapons/misc/whip-red-yellow.webp'],
    ['Metal Short Shaft', 'icons/weapons/staves/staff-animal-bird.webp'],
    ['Starsteel Heavy Blade', 'icons/commodities/metal/barstock-heated-steel.webp'],
    ['Starsteel Light Blade', 'icons/commodities/metal/barstock-heated-steel.webp'],
    ['Starsteel Mail', 'icons/commodities/metal/mail-chain-steel.webp'],
    ['Starsteel Plates', 'icons/tools/smithing/plate-steel-grey.webp'],
    ['Starsteel Point', 'icons/commodities/metal/arrowhead-steel.webp'],
    ['Steel Heavy Blade', 'icons/commodities/metal/barstock-heated-steel.webp'],
    ['Steel Light Blade', 'icons/commodities/metal/barstock-heated-steel.webp'],
    ['Steel Mail', 'icons/commodities/metal/mail-chain-steel.webp'],
    ['Steel Plates', 'icons/tools/smithing/plate-steel-grey.webp'],
    ['Steel Point', 'icons/commodities/metal/arrowhead-steel.webp'],
    ['Studded Hide', 'icons/equipment/feet/boots-armored-leather-brown.webp'],
    ['Thick Hide', 'icons/equipment/feet/boots-armored-leather-brown.webp'],
    ['True Steel Heavy Blade', 'icons/commodities/metal/barstock-heated-steel.webp'],
    ['True Steel Light Blade', 'icons/commodities/metal/barstock-heated-steel.webp'],
    ['True Steel Mail', 'icons/commodities/metal/mail-chain-steel.webp'],
    ['True Steel Plates', 'icons/tools/smithing/plate-steel-grey.webp'],
    ['True Steel Point', 'icons/commodities/metal/arrowhead-steel.webp'],

    // All Greater Cores - using radiant blue gem
    ['Greater Heat Core', 'icons/commodities/gems/gem-faceted-radiant-blue.webp'],
    ['Greater Cold Core', 'icons/commodities/gems/gem-faceted-radiant-blue.webp'],
    ['Greater Electric Core', 'icons/commodities/gems/gem-faceted-radiant-blue.webp'],
    ['Greater Aetheric Core', 'icons/commodities/gems/gem-faceted-radiant-blue.webp'],
    ['Greater Dark Core', 'icons/commodities/gems/gem-faceted-radiant-blue.webp'],
    ['Greater Divine Core', 'icons/commodities/gems/gem-faceted-radiant-blue.webp'],
    ['Greater Psychic Core', 'icons/commodities/gems/gem-faceted-radiant-blue.webp'],
    ['Greater Earth Core', 'icons/commodities/gems/gem-faceted-radiant-blue.webp'],

    // All Lesser Cores - using diamond blue gem
    ['Lesser Heat Core', 'icons/commodities/gems/gem-faceted-diamond-blue.webp'],
    ['Lesser Cold Core', 'icons/commodities/gems/gem-faceted-diamond-blue.webp'],
    ['Lesser Electric Core', 'icons/commodities/gems/gem-faceted-diamond-blue.webp'],
    ['Lesser Aetheric Core', 'icons/commodities/gems/gem-faceted-diamond-blue.webp'],
    ['Lesser Dark Core', 'icons/commodities/gems/gem-faceted-diamond-blue.webp'],
    ['Lesser Divine Core', 'icons/commodities/gems/gem-faceted-diamond-blue.webp'],
    ['Lesser Psychic Core', 'icons/commodities/gems/gem-faceted-diamond-blue.webp'],
    ['Lesser Earth Core', 'icons/commodities/gems/gem-faceted-diamond-blue.webp']
  ]);

  console.log(`Loaded ${corrections.size} icon corrections to apply`);

  // Process all items
  const itemsDir = path.join(__dirname, '../data/items');
  let updatedCount = 0;
  let fileCount = 0;
  let errorCount = 0;
  const updatedItems = [];

  function processDirectory(dir) {
    const entries = fs.readdirSync(dir);

    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        processDirectory(fullPath);
      } else if (entry.endsWith('.json')) {
        try {
          const fileContent = fs.readFileSync(fullPath, 'utf8');
          const data = JSON.parse(fileContent);
          let fileModified = false;

          // Handle both single objects and arrays
          const items = Array.isArray(data) ? data : [data];

          for (const itemData of items) {
            const itemName = itemData.name;

            if (corrections.has(itemName)) {
              const newIcon = corrections.get(itemName);
              const oldIcon = itemData.foundry_icon || 'none';

              itemData.foundry_icon = newIcon;
              fileModified = true;

              console.log(`✓ Updated ${itemName}: ${oldIcon} -> ${newIcon}`);
              updatedItems.push(itemName);
              updatedCount++;
            }
          }

          // Write file back if modified
          if (fileModified) {
            fs.writeFileSync(fullPath, JSON.stringify(Array.isArray(data) ? items : items[0], null, 2));
            fileCount++;
          }

        } catch (error) {
          console.error(`✗ Error processing ${entry}:`, error.message);
          errorCount++;
        }
      }
    }
  }

  console.log('\nApplying icon corrections to arrays and objects...');
  processDirectory(itemsDir);

  // Check for any corrections that weren't applied
  const notApplied = [];
  for (const [itemName, icon] of corrections) {
    if (!updatedItems.includes(itemName)) {
      notApplied.push(itemName);
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Items updated: ${updatedCount}`);
  console.log(`Files modified: ${fileCount}`);
  console.log(`Items not found: ${notApplied.length}`);
  console.log(`Errors: ${errorCount}`);

  if (notApplied.length > 0) {
    console.log(`\nItems still not found:`);
    notApplied.forEach(item => console.log(`  - ${item}`));
  }
}

fixIconMappingsInArrays();
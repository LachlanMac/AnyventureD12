import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fixIconMappings() {
  // Define the corrected mappings
  const corrections = new Map([
    // Fixed mappings from user
    ['Aetherium Mail', 'icons/commodities/metal/mail-chain-steel.webp'],
    ['Aetherium Plates', 'icons/tools/smithing/plate-steel-grey.webp'],
    ['Aetherium Point', 'icons/commodities/metal/arrowhead-steel.webp'],
    ['Aetherium Shavings', 'icons/commodities/metal/fragments-sword-steel.webp'],
    ['Belt', 'icons/equipment/chest/breastplate-leather-brown-belted.webp'],
    ['Bracer', 'icons/equipment/wrist/bracer-armored-steel-blue.webp'],
    ['Cobalt Shavings', 'icons/commodities/metal/fragments-sword-steel.webp'],
    ['Crossbow', 'icons/weapons/crossbows/crossbow-blue.webp'],
    ['Dagger', 'icons/weapons/daggers/dagger-black.webp'],
    ['Electrum Nugget', 'icons/commodities/stone/ore-pile-nuggets-gold.webp'],
    ['Electrum Shavings', 'icons/commodities/metal/fragments-sword-steel.webp'],
    ['Fur Gloves', 'icons/equipment/hand/gloves-leather-tan.webp'],
    ['Glaive', 'icons/weapons/polearms/glaive-hooked-steel.webp'],
    ['Great-Sword', 'icons/weapons/swords/greatsword-blue.webp'],
    ['Halberd', 'icons/weapons/polearms/halberd-crescent-engraved-steel.webp'],
    ['Iron Heavy Blade', 'icons/commodities/metal/barstock-heated-steel.webp'],
    ['Iron Light Blade', 'icons/commodities/metal/barstock-heated-steel.webp'],
    ['Iron Mail', 'icons/commodities/metal/mail-chain-steel.webp'],
    ['Iron Plates', 'icons/tools/smithing/plate-steel-grey.webp'],
    ['Iron Point', 'icons/commodities/metal/arrowhead-steel.webp'],
    ['Leather Gloves', 'icons/equipment/hand/gloves-leather-tan.webp'],
    ['Leather Lash', 'icons/weapons/misc/whip-red-yellow.webp'],
    ['Metal Short Shaft', 'icons/weapons/staves/staff-animal-bird.webp'],
    ['Nickel Shavings', 'icons/commodities/metal/fragments-sword-steel.webp'],
    ['Quartz', 'icons/commodities/stone/stone-white-quartz-ball.webp'],
    ['Scroll', 'icons/sundries/scrolls/scroll-bound-black-brown.webp'],
    ['Shooting Trap Kit', 'icons/sundries/survival/leather-strap-brown.webp'],
    ['Spear', 'icons/weapons/polearms/spear-barbed-silver.webp'],
    ['Starsteel Heavy Blade', 'icons/commodities/metal/barstock-heated-steel.webp'],
    ['Starsteel Light Blade', 'icons/commodities/metal/barstock-heated-steel.webp'],
    ['Starsteel Mail', 'icons/commodities/metal/mail-chain-steel.webp'],
    ['Starsteel Plates', 'icons/tools/smithing/plate-steel-grey.webp'],
    ['Starsteel Point', 'icons/commodities/metal/arrowhead-steel.webp'],
    ['Starsteel Shavings', 'icons/commodities/metal/fragments-sword-steel.webp'],
    ['Steel Heavy Blade', 'icons/commodities/metal/barstock-heated-steel.webp'],
    ['Steel Light Blade', 'icons/commodities/metal/barstock-heated-steel.webp'],
    ['Steel Mail', 'icons/commodities/metal/mail-chain-steel.webp'],
    ['Steel Plates', 'icons/tools/smithing/plate-steel-grey.webp'],
    ['Steel Point', 'icons/commodities/metal/arrowhead-steel.webp'],
    ['Steel Shavings', 'icons/commodities/metal/fragments-sword-steel.webp'],
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
    ['Lesser Earth Core', 'icons/commodities/gems/gem-faceted-diamond-blue.webp'],

    // Special case: Move chainmail to armor/chests folder
    ['Chainmail', 'icons/equipment/chest/breastplate-scale-steel.webp']
  ]);

  console.log(`Loaded ${corrections.size} icon corrections to apply`);

  // Process all items
  const itemsDir = path.join(__dirname, '../data/items');
  let updatedCount = 0;
  let notFoundCount = 0;
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
          const itemData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
          const itemName = itemData.name;

          if (corrections.has(itemName)) {
            const newIcon = corrections.get(itemName);
            const oldIcon = itemData.foundry_icon || 'none';

            itemData.foundry_icon = newIcon;
            fs.writeFileSync(fullPath, JSON.stringify(itemData, null, 2));

            console.log(`✓ Updated ${itemName}: ${oldIcon} -> ${newIcon}`);
            updatedItems.push(itemName);
            updatedCount++;
          }

        } catch (error) {
          console.error(`✗ Error processing ${entry}:`, error.message);
          errorCount++;
        }
      }
    }
  }

  console.log('\nApplying icon corrections...');
  processDirectory(itemsDir);

  // Check for any corrections that weren't applied
  const notApplied = [];
  for (const [itemName, icon] of corrections) {
    if (!updatedItems.includes(itemName)) {
      notApplied.push(itemName);
      notFoundCount++;
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Updated: ${updatedCount}`);
  console.log(`Not found: ${notFoundCount}`);
  console.log(`Errors: ${errorCount}`);

  if (notApplied.length > 0) {
    console.log(`\nItems not found in data files:`);
    notApplied.forEach(item => console.log(`  - ${item}`));
  }
}

fixIconMappings();
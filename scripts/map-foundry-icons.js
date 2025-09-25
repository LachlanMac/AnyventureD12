import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load icon mappings
const weaponIcons = fs.readFileSync(path.join(__dirname, '../data/foundry/fvtt_weapon_map.txt'), 'utf8')
  .split('\n').filter(line => line.trim());
const consumableIcons = fs.readFileSync(path.join(__dirname, '../data/foundry/fvtt_consumable_map.txt'), 'utf8')
  .split('\n').filter(line => line.trim());
const toolIcons = fs.readFileSync(path.join(__dirname, '../data/foundry/fvtt_tools_map.txt'), 'utf8')
  .split('\n').filter(line => line.trim());
const sundriesIcons = fs.readFileSync(path.join(__dirname, '../data/foundry/fvtt_sundries_map.txt'), 'utf8')
  .split('\n').filter(line => line.trim());

// Helper function to find best matching icon
function findBestIcon(itemName, itemType, weaponCategory, iconList, searchTerms = []) {
  const name = itemName.toLowerCase();
  const allTerms = [name, ...searchTerms];

  // Look for exact or close matches
  for (const term of allTerms) {
    const found = iconList.find(icon =>
      icon.toLowerCase().includes(term) ||
      term.split(/[\s_-]+/).some(word => word.length > 2 && icon.toLowerCase().includes(word))
    );
    if (found) return found;
  }

  return null;
}

// Mapping function for weapons
function mapWeaponIcon(item) {
  const { name, type, weapon_category } = item;
  const searchTerms = [];

  // Add weapon category to search terms
  if (weapon_category) {
    const categoryMap = {
      'simpleMelee': ['dagger', 'club', 'knife'],
      'complexMelee': ['sword', 'axe', 'hammer', 'mace'],
      'simpleRanged': ['shortbow', 'sling'],
      'complexRanged': ['longbow', 'crossbow'],
      'throwing': ['dagger', 'javelin', 'throwing'],
      'brawling': ['claw', 'fist', 'knuckles']
    };
    if (categoryMap[weapon_category]) {
      searchTerms.push(...categoryMap[weapon_category]);
    }
  }

  // Specific weapon name mappings
  const weaponMap = {
    'battle_axe': ['axe-battle'],
    'battle_axe.json': ['axe-battle'],
    'greataxe': ['axe-battle', 'axe-double'],
    'greatsword': ['greatsword'],
    'greathammer': ['hammer-double', 'hammer-war'],
    'arbalest': ['crossbow-heavy'],
    'club': ['club-simple'],
    'dagger': ['dagger-simple'],
    'shortsword': ['shortsword'],
    'longsword': ['sword-guard'],
    'longbow': ['longbow'],
    'shortbow': ['shortbow'],
    'crossbow': ['crossbow-simple'],
    'spear': ['spear-simple'],
    'mace': ['mace-round'],
    'hammer': ['hammer-simple'],
    'staff': ['staff-simple'],
    'wand': ['wand-gem']
  };

  // Check specific mappings first
  const fileName = name.toLowerCase().replace(/\s+/g, '_');
  if (weaponMap[fileName]) {
    searchTerms.push(...weaponMap[fileName]);
  }

  return findBestIcon(name, type, weapon_category, weaponIcons, searchTerms) ||
         weaponIcons.find(icon => icon.includes('sword-guard')) || // Default to generic sword
         weaponIcons[0];
}

// Mapping function for armor and equipment
function mapArmorIcon(item) {
  const { name, type } = item;

  const armorMap = {
    'boots': ['footwear', 'boot', 'shoe'],
    'gloves': ['gloves', 'gauntlet', 'hand'],
    'headwear': ['helmet', 'hat', 'crown', 'head'],
    'body': ['armor', 'chest', 'tunic', 'robe'],
    'cloak': ['cloak', 'cape', 'mantle'],
    'shield': ['shield'],
    'accessory': ['ring', 'amulet', 'necklace', 'belt', 'bracer']
  };

  // For armor, we might need to look in sundries or create generic mappings
  const searchTerms = armorMap[type] || [type];

  // Try sundries first for non-weapon equipment
  return findBestIcon(name, type, null, sundriesIcons, searchTerms) ||
         findBestIcon(name, type, null, toolIcons, searchTerms) ||
         sundriesIcons.find(icon => icon.includes('misc')) ||
         sundriesIcons[0];
}

// Mapping function for consumables
function mapConsumableIcon(item) {
  const { name, type, consumable_category } = item;
  const searchTerms = [];

  if (consumable_category) {
    const categoryMap = {
      'potions': ['potion', 'bottle', 'vial'],
      'elixirs': ['elixir', 'bottle', 'vial'],
      'poisons': ['poison', 'vial'],
      'explosives': ['bomb', 'explosive', 'dynamite']
    };
    if (categoryMap[consumable_category]) {
      searchTerms.push(...categoryMap[consumable_category]);
    }
  }

  // Food and drink mappings
  if (name.toLowerCase().includes('food') || name.toLowerCase().includes('bread') ||
      name.toLowerCase().includes('meat') || name.toLowerCase().includes('cheese')) {
    searchTerms.push('food', 'bread', 'cheese', 'meat');
  }

  if (name.toLowerCase().includes('drink') || name.toLowerCase().includes('ale') ||
      name.toLowerCase().includes('wine') || name.toLowerCase().includes('water')) {
    searchTerms.push('drink', 'alcohol', 'wine', 'water');
  }

  return findBestIcon(name, type, null, consumableIcons, searchTerms) ||
         consumableIcons.find(icon => icon.includes('potion')) ||
         consumableIcons[0];
}

// Mapping function for tools
function mapToolIcon(item) {
  const { name, type } = item;
  const searchTerms = [];

  // Tool-specific mappings
  const toolMap = {
    'fishing': ['fishing'],
    'cooking': ['cooking', 'pot', 'pan', 'knife'],
    'smithing': ['hammer', 'tongs', 'bellows'],
    'lock': ['lock', 'key'],
    'rope': ['rope', 'cord'],
    'torch': ['torch', 'light'],
    'shovel': ['shovel', 'spade'],
    'saw': ['saw'],
    'needle': ['needle', 'sewing']
  };

  for (const [key, terms] of Object.entries(toolMap)) {
    if (name.toLowerCase().includes(key)) {
      searchTerms.push(...terms);
    }
  }

  return findBestIcon(name, type, null, toolIcons, searchTerms) ||
         findBestIcon(name, type, null, sundriesIcons, searchTerms) ||
         toolIcons.find(icon => icon.includes('misc')) ||
         toolIcons[0];
}

// Mapping function for goods and materials
function mapGoodsIcon(item) {
  const { name, type } = item;
  const searchTerms = [];

  // Material mappings
  if (name.toLowerCase().includes('metal') || name.toLowerCase().includes('ingot') ||
      name.toLowerCase().includes('nugget') || name.toLowerCase().includes('ore')) {
    searchTerms.push('metal', 'ingot', 'ore');
  }

  if (name.toLowerCase().includes('gem') || name.toLowerCase().includes('crystal') ||
      name.toLowerCase().includes('stone')) {
    searchTerms.push('gem', 'crystal', 'stone');
  }

  if (name.toLowerCase().includes('herb') || name.toLowerCase().includes('bundle') ||
      name.toLowerCase().includes('plant')) {
    searchTerms.push('herb', 'plant', 'leaf');
  }

  if (name.toLowerCase().includes('book') || name.toLowerCase().includes('journal') ||
      name.toLowerCase().includes('scroll')) {
    searchTerms.push('book', 'scroll', 'tome');
  }

  return findBestIcon(name, type, null, sundriesIcons, searchTerms) ||
         findBestIcon(name, type, null, consumableIcons, searchTerms) ||
         sundriesIcons.find(icon => icon.includes('misc')) ||
         sundriesIcons[0];
}

// Main mapping function
function mapItemToFoundryIcon(item) {
  const { type, weapon_category, consumable_category } = item;

  if (type === 'weapon' || weapon_category) {
    return mapWeaponIcon(item);
  }

  if (type === 'consumable' || consumable_category) {
    return mapConsumableIcon(item);
  }

  if (['boots', 'gloves', 'headwear', 'body', 'cloak', 'shield', 'accessory'].includes(type)) {
    return mapArmorIcon(item);
  }

  if (type === 'tool' || type === 'instrument') {
    return mapToolIcon(item);
  }

  if (['goods', 'trade_good', 'adventure'].includes(type)) {
    return mapGoodsIcon(item);
  }

  // Default fallback
  return sundriesIcons.find(icon => icon.includes('misc')) || sundriesIcons[0];
}

// Process all item files
function processAllItems() {
  const itemsDir = path.join(__dirname, '../data/items');
  let processedCount = 0;
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

          // Skip if already has foundry_icon
          if (itemData.foundry_icon && itemData.foundry_icon.trim() !== '') {
            console.log(`Skipping ${entry} - already has foundry_icon`);
            continue;
          }

          // Map the icon
          const foundryIcon = mapItemToFoundryIcon(itemData);
          itemData.foundry_icon = foundryIcon;

          // Write back to file
          fs.writeFileSync(fullPath, JSON.stringify(itemData, null, 2));

          console.log(`✓ ${entry}: ${foundryIcon}`);
          processedCount++;

        } catch (error) {
          console.error(`✗ Error processing ${entry}:`, error.message);
          errorCount++;
        }
      }
    }
  }

  console.log('Starting foundry icon mapping...');
  processDirectory(itemsDir);
  console.log(`\nCompleted! Processed: ${processedCount}, Errors: ${errorCount}`);
}

// Run the script
processAllItems();
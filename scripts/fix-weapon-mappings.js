import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load weapon icons
const weaponIcons = fs.readFileSync(path.join(__dirname, '../data/foundry/fvtt_weapon_map.txt'), 'utf8')
  .split('\n').filter(line => line.trim());

// Smart weapon mapping based on actual weapon characteristics
const weaponMappings = {
  // Single-handed curved swords
  'falchion': () => weaponIcons.find(icon => icon.includes('scimitar')) || weaponIcons.find(icon => icon.includes('sword-guard')),
  'scimitar': () => weaponIcons.find(icon => icon.includes('scimitar')),
  'cutlass': () => weaponIcons.find(icon => icon.includes('scimitar')),

  // Single-handed straight swords
  'short_sword': () => weaponIcons.find(icon => icon.includes('shortsword')),
  'shortsword': () => weaponIcons.find(icon => icon.includes('shortsword')),
  'longsword': () => weaponIcons.find(icon => icon.includes('sword-guard')),
  'rapier': () => weaponIcons.find(icon => icon.includes('sword-guard')) || weaponIcons.find(icon => icon.includes('shortsword')),

  // Two-handed swords
  'greatsword': () => weaponIcons.find(icon => icon.includes('greatsword')),
  'bastard_sword': () => weaponIcons.find(icon => icon.includes('greatsword')),
  'claymore': () => weaponIcons.find(icon => icon.includes('greatsword')),

  // Axes
  'battle_axe': () => weaponIcons.find(icon => icon.includes('axe-battle')),
  'battleaxe': () => weaponIcons.find(icon => icon.includes('axe-battle')),
  'greataxe': () => weaponIcons.find(icon => icon.includes('axe-double')) || weaponIcons.find(icon => icon.includes('axe-battle')),
  'handaxe': () => weaponIcons.find(icon => icon.includes('shortaxe')) || weaponIcons.find(icon => icon.includes('axe-simple')),
  'hatchet': () => weaponIcons.find(icon => icon.includes('shortaxe')) || weaponIcons.find(icon => icon.includes('axe-simple')),

  // Hammers
  'warhammer': () => weaponIcons.find(icon => icon.includes('hammer-war')),
  'greathammer': () => weaponIcons.find(icon => icon.includes('hammer-double')),
  'mace': () => weaponIcons.find(icon => icon.includes('mace-round')),
  'maul': () => weaponIcons.find(icon => icon.includes('hammer-double')),

  // Polearms
  'spear': () => weaponIcons.find(icon => icon.includes('spear-simple')),
  'pike': () => weaponIcons.find(icon => icon.includes('pike')),
  'halberd': () => weaponIcons.find(icon => icon.includes('halberd')),
  'glaive': () => weaponIcons.find(icon => icon.includes('glaive')),
  'trident': () => weaponIcons.find(icon => icon.includes('trident')),

  // Flails and chains
  'flail': () => weaponIcons.find(icon => icon.includes('flail')),
  'morningstar': () => weaponIcons.find(icon => icon.includes('mace-spiked')),

  // Simple weapons
  'club': () => weaponIcons.find(icon => icon.includes('club-simple')),
  'quarterstaff': () => weaponIcons.find(icon => icon.includes('staff-simple')),
  'dagger': () => weaponIcons.find(icon => icon.includes('dagger-simple')),

  // Ranged weapons
  'longbow': () => weaponIcons.find(icon => icon.includes('longbow')),
  'shortbow': () => weaponIcons.find(icon => icon.includes('shortbow')),
  'crossbow': () => weaponIcons.find(icon => icon.includes('crossbow-simple')),
  'hand_crossbow': () => weaponIcons.find(icon => icon.includes('handcrossbow')),
  'arbalest': () => weaponIcons.find(icon => icon.includes('crossbow-heavy')),
  'warbow': () => weaponIcons.find(icon => icon.includes('longbow')),
  'sling': () => weaponIcons.find(icon => icon.includes('slingshot')),

  // Whips
  'whip': () => weaponIcons.find(icon => icon.includes('whip')),

  // Magical weapons
  'flame_staff': () => weaponIcons.find(icon => icon.includes('staff-ornate') && icon.includes('red')),
  'ice_staff': () => weaponIcons.find(icon => icon.includes('staff') && icon.includes('blue')),
  'earthen_staff': () => weaponIcons.find(icon => icon.includes('staff') && icon.includes('brown')),
  'mind_staff': () => weaponIcons.find(icon => icon.includes('staff-ornate') && icon.includes('purple')),
  'spirit_staff': () => weaponIcons.find(icon => icon.includes('staff-ornate')),
  'prayer_staff': () => weaponIcons.find(icon => icon.includes('staff') && icon.includes('gold')),
  'jolting_staff': () => weaponIcons.find(icon => icon.includes('staff') && icon.includes('blue')),
  'twisted_staff': () => weaponIcons.find(icon => icon.includes('staff-skull')),

  'flame_wand': () => weaponIcons.find(icon => icon.includes('wand') && icon.includes('red')),
  'ice_wand': () => weaponIcons.find(icon => icon.includes('wand') && icon.includes('blue')),
  'earthen_wand': () => weaponIcons.find(icon => icon.includes('wand') && icon.includes('brown')),
  'mind_wand': () => weaponIcons.find(icon => icon.includes('wand') && icon.includes('purple')),
  'spirit_wand': () => weaponIcons.find(icon => icon.includes('wand-gem')),
  'prayer_wand': () => weaponIcons.find(icon => icon.includes('wand') && icon.includes('gold')),
  'jolting_wand': () => weaponIcons.find(icon => icon.includes('wand') && icon.includes('blue')),
  'twisted_wand': () => weaponIcons.find(icon => icon.includes('wand-skull'))
};

// Function to get better weapon icon
function getBetterWeaponIcon(weaponName) {
  const normalizedName = weaponName.toLowerCase().replace(/[^a-z]/g, '_');

  // Try exact match first
  if (weaponMappings[normalizedName]) {
    const icon = weaponMappings[normalizedName]();
    if (icon) return icon;
  }

  // Try partial matches
  for (const [key, mapFunc] of Object.entries(weaponMappings)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      const icon = mapFunc();
      if (icon) return icon;
    }
  }

  // Fallback to weapon category-based matching
  return null;
}

// Process weapon files
function fixWeaponMappings() {
  const weaponsDir = path.join(__dirname, '../data/items/weapons');
  let fixedCount = 0;
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

          // Only process weapons
          if (itemData.type !== 'weapon' && !itemData.weapon_category) {
            continue;
          }

          const currentIcon = itemData.foundry_icon?.trim();
          const betterIcon = getBetterWeaponIcon(itemData.name);

          if (betterIcon && betterIcon !== currentIcon) {
            itemData.foundry_icon = betterIcon;
            fs.writeFileSync(fullPath, JSON.stringify(itemData, null, 2));
            console.log(`✓ Fixed ${entry}: ${itemData.name} → ${betterIcon}`);
            fixedCount++;
          } else if (!currentIcon || currentIcon === 'icons/weapons/swords/greatsword-blue.webp') {
            // Try to fix weapons that got the generic greatsword icon
            const fallbackIcon = getBetterWeaponIcon(itemData.name) ||
              weaponIcons.find(icon => icon.includes('sword-guard')) ||
              weaponIcons[0];

            if (fallbackIcon && fallbackIcon !== currentIcon) {
              itemData.foundry_icon = fallbackIcon;
              fs.writeFileSync(fullPath, JSON.stringify(itemData, null, 2));
              console.log(`✓ Fixed generic ${entry}: ${itemData.name} → ${fallbackIcon}`);
              fixedCount++;
            }
          }

        } catch (error) {
          console.error(`✗ Error processing ${entry}:`, error.message);
          errorCount++;
        }
      }
    }
  }

  console.log('Fixing weapon icon mappings...');
  processDirectory(weaponsDir);
  console.log(`\nCompleted! Fixed: ${fixedCount}, Errors: ${errorCount}`);
}

// Run the script
fixWeaponMappings();
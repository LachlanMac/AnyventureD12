import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const weaponsDir = path.resolve(__dirname, '../data/items/weapons');

// Recursively find all weapon JSON files
function findWeaponFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findWeaponFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(fullPath);
    }
  }

  return files;
}

// Main function
function generateWeaponTable() {
  const weaponFiles = findWeaponFiles(weaponsDir);
  const weapons = [];

  for (const filePath of weaponFiles) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const weapon = JSON.parse(fileContent);

      if (weapon.type !== 'weapon') continue;

      const category = weapon.weapon_category || 'unknown';
      const hands = weapon.hands || 1;
      const energy = weapon.primary?.energy || 0;
      const primaryDmg = weapon.primary?.damage || '0';
      const primaryExtra = weapon.primary?.damage_extra || '0';
      const secondaryDmg = weapon.secondary?.damage || null;
      const secondaryExtra = weapon.secondary?.damage_extra || null;

      // Determine type description
      let typeDesc = '';
      if (category.includes('complex')) {
        typeDesc = hands === 2 ? 'Complex 2H' : 'Complex';
      } else if (category.includes('simple')) {
        typeDesc = hands === 2 ? 'Simple 2H' : 'Simple';
      } else {
        typeDesc = category.charAt(0).toUpperCase() + category.slice(1);
      }

      weapons.push({
        name: weapon.name,
        category: category,
        type: typeDesc,
        hands: hands,
        primary: `${primaryDmg}/${primaryExtra}`,
        secondary: secondaryDmg ? `${secondaryDmg}/${secondaryExtra}` : '-',
        energy: energy
      });

    } catch (err) {
      console.error(`Error processing ${filePath}: ${err.message}`);
    }
  }

  // Sort weapons by category, then name
  weapons.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.name.localeCompare(b.name);
  });

  // Generate table
  console.log('\n# WEAPON DAMAGE TABLE (Post-Nerf)\n');
  console.log('| Weapon | Type | Hands | Primary (Dmg/Extra) | Secondary (Dmg/Extra) | Energy |');
  console.log('|--------|------|-------|---------------------|----------------------|--------|');

  for (const w of weapons) {
    console.log(`| ${w.name} | ${w.type} | ${w.hands} | ${w.primary} | ${w.secondary} | ${w.energy} |`);
  }

  // Generate summary by category
  console.log('\n\n# SUMMARY BY CATEGORY\n');

  const categories = {
    'complexMelee': [],
    'complexRanged': [],
    'simpleMelee': [],
    'simpleRanged': [],
    'throwing': [],
    'unarmed': [],
    'staves': [],
    'wands': []
  };

  for (const w of weapons) {
    if (categories[w.category]) {
      categories[w.category].push(w);
    }
  }

  for (const [cat, weaps] of Object.entries(categories)) {
    if (weaps.length > 0) {
      console.log(`\n## ${cat.toUpperCase()}`);
      console.log('| Weapon | Hands | Primary | Secondary | Energy |');
      console.log('|--------|-------|---------|-----------|--------|');
      for (const w of weaps) {
        console.log(`| ${w.name} | ${w.hands} | ${w.primary} | ${w.secondary} | ${w.energy} |`);
      }
    }
  }
}

// Run the script
generateWeaponTable();

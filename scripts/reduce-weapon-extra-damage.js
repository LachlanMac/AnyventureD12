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
function reduceWeaponExtraDamage() {
  console.log('Starting weapon extra damage reduction...\n');

  const weaponFiles = findWeaponFiles(weaponsDir);
  console.log(`Found ${weaponFiles.length} weapon files\n`);

  let modifiedCount = 0;
  let skippedCount = 0;

  for (const filePath of weaponFiles) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const weapon = JSON.parse(fileContent);

      // Skip if not a weapon or if it's the dagger
      if (weapon.type !== 'weapon') {
        console.log(`Skipping ${weapon.name} - not a weapon type`);
        skippedCount++;
        continue;
      }

      if (weapon.name === 'Dagger') {
        console.log(`Skipping ${weapon.name} - explicitly excluded`);
        skippedCount++;
        continue;
      }

      let modified = false;

      // Reduce primary damage_extra
      if (weapon.primary && weapon.primary.damage_extra) {
        const oldExtra = parseInt(weapon.primary.damage_extra);
        if (oldExtra > 0) {
          weapon.primary.damage_extra = String(oldExtra - 1);
          console.log(`${weapon.name} (primary): ${oldExtra} → ${oldExtra - 1}`);
          modified = true;
        }
      }

      // Reduce secondary damage_extra if it exists
      if (weapon.secondary && weapon.secondary.damage_extra) {
        const oldExtra = parseInt(weapon.secondary.damage_extra);
        if (oldExtra > 0) {
          weapon.secondary.damage_extra = String(oldExtra - 1);
          console.log(`${weapon.name} (secondary): ${oldExtra} → ${oldExtra - 1}`);
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(weapon, null, 2) + '\n');
        modifiedCount++;
      } else {
        skippedCount++;
      }

    } catch (err) {
      console.error(`Error processing ${filePath}: ${err.message}`);
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Modified: ${modifiedCount} weapons`);
  console.log(`Skipped: ${skippedCount} weapons`);
  console.log(`Total: ${weaponFiles.length} files`);
}

// Run the script
reduceWeaponExtraDamage();

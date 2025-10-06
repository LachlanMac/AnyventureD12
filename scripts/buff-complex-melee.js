import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const complexMeleeDir = path.resolve(__dirname, '../data/items/weapons/complexMelee');

// Weapons that should NOT be buffed (reach polearms)
const excludeWeapons = ['Glaive', 'Halberd', 'Ranseur', 'Lucerne Hammer'];

function buffComplexMelee() {
  console.log('Buffing complex melee weapons by +1 primary damage...\n');

  const files = fs.readdirSync(complexMeleeDir);
  let modifiedCount = 0;
  let skippedCount = 0;

  for (const file of files) {
    if (!file.endsWith('.json')) continue;

    const filePath = path.join(complexMeleeDir, file);

    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const weapon = JSON.parse(fileContent);

      if (weapon.type !== 'weapon') {
        skippedCount++;
        continue;
      }

      // Skip reach polearms
      if (excludeWeapons.includes(weapon.name)) {
        console.log(`Skipping ${weapon.name} - reach polearm excluded`);
        skippedCount++;
        continue;
      }

      let modified = false;

      // Buff primary damage by +1
      if (weapon.primary && weapon.primary.damage) {
        const oldDamage = parseInt(weapon.primary.damage);
        const newDamage = oldDamage + 1;
        weapon.primary.damage = String(newDamage);
        console.log(`${weapon.name} (primary): ${oldDamage} → ${newDamage}`);
        modified = true;
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
}

buffComplexMelee();

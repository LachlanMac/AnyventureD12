/**
 * Migration script: Update module data codes from old M-only mitigation to M (floor) + N (ceiling) codes
 * Based on confirmed design decisions.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Map of file -> option name -> old data code pattern -> new data code replacement
// Only the mitigation portion is replaced; rest of code preserved
const MIGRATIONS = [
  // CORE MODULES
  { file: 'core/arcane_magic.json', option: 'Aetheric Absorption', old: 'M7=2', new: 'M7=1:N7=-1' },
  { file: 'core/black_magic.json', option: 'Corrupted Soul', old: 'M6=3:M5=3', new: 'N5=-2:N6=-2' },
  { file: 'core/fabricator.json', option: 'Forge Labor', old: 'M2=1', new: 'M2=2' },
  { file: 'core/meta_magic.json', option: 'Immutable', old: 'M7=2', new: 'M7=1:N7=-1' },
  { file: 'core/mysticism_magic.json', option: 'Otherworldly Focus', old: 'M8=1', new: 'M8=1:N8=-1' },
  { file: 'core/primal_magic.json', option: 'Of the Elements', old: 'M2=1:M3=1:M4=1', new: 'N2=-1:N3=-1:N4=-1' },
  { file: 'core/white_magic.json', option: 'Halo', old: 'M6=2', new: 'M6=1:N6=-1' },

  // SECONDARY MODULES
  { file: 'secondary/abjurer.json', option: 'Divine Might', old: 'M6=1:M6=1', new: 'M6=1:N6=-1' },
  { file: 'secondary/abjurer.json', option: 'Mystic Resilience', old: 'M7=1:M7=1', new: 'M7=1:N7=-1' },
  { file: 'secondary/acolyte.json', option: 'Unshakeable Belief', old: 'M5=1:M6=1', new: 'M5=1:N6=-1:M6=1:N5=-1' },
  { file: 'secondary/barbarian.json', option: 'Fear Unburdened', old: 'M8=1', new: 'M8=1' }, // unchanged
  { file: 'secondary/berserker.json', option: 'Scarred Veteran', old: 'M1=1', new: 'N1=-1' },
  { file: 'secondary/bulwark.json', option: 'Glancing Blows', old: 'M1=1', new: 'M1=1' }, // unchanged
  { file: 'secondary/counselor.json', option: 'Professional Detachment', old: 'M8=2', new: 'M8=1:N8=-1' },
  { file: 'secondary/devout.json', option: 'Sacred Vessel', old: 'M7=2', new: 'M7=1:N7=-1' },
  { file: 'secondary/devout.json', option: 'Fortified from Darkness', old: 'M5=2', new: 'M5=1:N5=-1' },
  { file: 'secondary/diplomat.json', option: 'Iron Composure', old: 'M8=2', new: 'M8=1:N8=-1' },
  { file: 'secondary/elementalist.json', option: 'Fully Attuned', old: 'M2=2:M3=2:M4=2', new: 'M2=1:M3=1:M4=1' },
  { file: 'secondary/fearmonger.json', option: 'Master of Nightmares', old: 'M8=2', new: 'M8=1:N8=-1' },
  { file: 'secondary/headsman.json', option: 'Executioner', old: 'M8=2', new: 'M8=1:N8=-1' },
  { file: 'secondary/hordeslayer.json', option: 'In the Fray', old: 'M1=1', new: 'M1=1' }, // unchanged
  { file: 'secondary/inner_flame.json', option: 'Flame Ascendant', old: 'M7=1:M8=1', new: 'M7=1:N7=-1:M8=1:N8=-1' },
  { file: 'secondary/inquisitor.json', option: 'Hunter of Shadows', old: 'M5=2:M7=1', new: 'M5=1:N5=-1:M7=1' },
  { file: 'secondary/inquisitor.json', option: 'Hunter of Light', old: 'M6=2:M7=1', new: 'M6=1:N6=-1:M7=1' },
  { file: 'secondary/investigator.json', option: 'Skeptic', old: 'M8=1', new: 'M8=1' }, // unchanged
  { file: 'secondary/juggernaut.json', option: 'Stubborn Body', old: 'M1=1:M9=1', new: 'M1=1:M9=1' }, // unchanged
  { file: 'secondary/juggernaut.json', option: 'Stubborn Will', old: 'M7=1:M8=1', new: 'M7=1:M8=1' }, // unchanged
  { file: 'secondary/knight.json', option: 'Second Skin', old: 'M1=1,M7=1', new: 'N1=-1,N7=-1' }, // inside CC[...]
  { file: 'secondary/naturalist.json', option: 'Rugged Conditions', old: 'M2=1:M3=1', new: 'N2=-1:N3=-1' },
  { file: 'secondary/oracle.json', option: 'Fortified Soul', old: 'M7=2', new: 'M7=1:N7=-1' },
  { file: 'secondary/pavise_guard.json', option: 'Heavy Shield Mastery', old: 'M2=1:M3=1:M4=1', new: 'N2=-1:N3=-1:N4=-1' }, // inside CG[...]
  { file: 'secondary/scout.json', option: 'Ranger', old: 'M2=1:M3=1', new: 'N2=-1:N3=-1' },
  { file: 'secondary/sentinel.json', option: 'Calm in the Storm', old: 'M8=1:M7=1', new: 'M8=1:N7=-1' },
  { file: 'secondary/shadow_caster.json', option: 'Protective Silhouette', old: 'M5=1:M7=1:M8=1', new: 'M5=1:M7=1:M8=1' }, // unchanged
  { file: 'secondary/shaman.json', option: 'Ancestral Protection', old: 'M7=1', new: 'M7=1' }, // unchanged
  { file: 'secondary/sporekeeper.json', option: 'Potent Spores', old: 'M9=1', new: 'M9=1' }, // unchanged
  { file: 'secondary/war_mage.json', option: 'Armored Caster', old: 'M7=1,M2=1,M3=1,M9=1', new: 'N7=-1,N2=-1,N3=-1,N9=-1' }, // inside CC[...]
  { file: 'secondary/witch.json', option: 'Darkcraft', old: 'M5=1', new: 'M5=1:N5=-1' },

  // PERSONALITY
  { file: 'personality/outsider.json', option: 'Lone Wolf', old: 'M8=3', new: 'M8=2:N8=-2' },
];

const modulesDir = path.join(__dirname, '..', 'data', 'modules');

let changed = 0;
let skipped = 0;
let errors = 0;

for (const migration of MIGRATIONS) {
  // Skip unchanged ones
  if (migration.old === migration.new) {
    skipped++;
    continue;
  }

  const filePath = path.join(modulesDir, migration.file);

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);

    // Find the option by name in the tiers array
    let found = false;
    for (const tier of data.options) {
      if (tier.name === migration.option) {
        // Replace the old mitigation codes with new ones in the data string
        const oldData = tier.data;
        const newData = oldData.replace(migration.old, migration.new);

        if (oldData === newData) {
          console.log(`  WARNING: No match for '${migration.old}' in ${migration.file} -> ${migration.option}`);
          console.log(`    Actual data: ${tier.data}`);
          errors++;
        } else {
          tier.data = newData;
          found = true;
          console.log(`  MIGRATED: ${migration.file} -> ${migration.option}`);
          console.log(`    ${oldData} => ${newData}`);
        }
        break;
      }
    }

    if (!found && !errors) {
      console.log(`  WARNING: Option '${migration.option}' not found in ${migration.file}`);
      errors++;
    }

    if (found) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
      changed++;
    }
  } catch (e) {
    console.log(`  ERROR: ${migration.file} - ${e.message}`);
    errors++;
  }
}

console.log(`\nDone! Changed: ${changed}, Skipped (unchanged): ${skipped}, Errors: ${errors}`);

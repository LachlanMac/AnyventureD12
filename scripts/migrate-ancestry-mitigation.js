/**
 * Migration script: Update ancestry data codes for min/max mitigation system
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATIONS = [
  { file: 'arah-ka.json', option: 'Raised in Flames', old: 'M2=5', new: 'M2=4' },
  { file: 'dragonkind.json', option: 'Red Dragon Heritage', old: 'TA:M1=1:M2=3', new: 'TA:M1=1:M2=3' }, // unchanged
  { file: 'dragonkind.json', option: 'Blue Dragon Heritage', old: 'TA:M1=1:M4=3', new: 'TA:M1=1:M4=3' }, // unchanged
  { file: 'dragonkind.json', option: 'White Dragon Heritage', old: 'TA:M1=1:M3=3', new: 'TA:M1=1:M3=3' }, // unchanged
  { file: 'elf.json', option: 'Keydaran Blood', old: 'M5=4:M6=4', new: 'M5=3:M6=3' },
  { file: 'gnome.json', option: 'Fractured Minds', old: 'M8=-3', new: 'N8=5' },
  { file: 'half-giant.json', option: "Giant's Blood", old: 'M3=2', new: 'M3=2' }, // unchanged
  { file: 'human.json', option: 'Half-Orc', old: 'TA:M1=1', new: 'TA:M1=1' }, // unchanged
  { file: 'human.json', option: 'Half-Elf', old: 'TA:M5=2:M6=2', new: 'TA:M5=2:M6=2' }, // unchanged
  { file: 'human.json', option: 'Half-Arakhan', old: 'TA:M2=3', new: 'TA:M2=3' }, // unchanged
  { file: 'kobold.json', option: 'Fragile', old: 'A1=-5:M1=-1', new: 'A1=-5:N1=5' },
  { file: 'lizardfolk.json', option: 'Cold Blooded', old: 'M3=-4', new: 'M3=2:M2=2:N3=4:N2=4' },
  { file: 'minotaur.json', option: 'Dark Blood of the Ancients', old: 'M6=-3', new: 'N6=5' },
  { file: 'stout-folk.json', option: 'Stout-Folk Skin', old: 'M9=1:M4=1:M3=1:M2=1', new: 'M9=2:N2=-1:N3=-1:N4=-1' },
  { file: 'tidewalker.json', option: 'Tidewalking', old: 'M1=1', new: 'M1=1' }, // unchanged
];

const ancestriesDir = path.join(__dirname, '..', 'data', 'ancestries');

let changed = 0;
let skipped = 0;
let errors = 0;

for (const migration of MIGRATIONS) {
  if (migration.old === migration.new) {
    skipped++;
    continue;
  }

  const filePath = path.join(ancestriesDir, migration.file);

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);

    let found = false;

    // Search in options array
    const searchOptions = (options) => {
      for (const opt of options) {
        if (opt.name === migration.option) {
          const oldData = opt.data;
          const newData = oldData.replace(migration.old, migration.new);
          if (oldData === newData) {
            console.log(`  WARNING: No match for '${migration.old}' in ${migration.file} -> ${migration.option}`);
            console.log(`    Actual data: ${opt.data}`);
            errors++;
          } else {
            opt.data = newData;
            found = true;
            console.log(`  MIGRATED: ${migration.file} -> ${migration.option}`);
            console.log(`    ${oldData} => ${newData}`);
          }
          return;
        }
        // Check subchoices
        if (opt.subchoices) {
          for (const sub of opt.subchoices) {
            if (sub.name === migration.option) {
              const oldData = sub.data;
              const newData = oldData.replace(migration.old, migration.new);
              if (oldData === newData) {
                console.log(`  WARNING: No match for '${migration.old}' in ${migration.file} -> ${migration.option}`);
                errors++;
              } else {
                sub.data = newData;
                found = true;
                console.log(`  MIGRATED: ${migration.file} -> ${migration.option} (subchoice)`);
                console.log(`    ${oldData} => ${newData}`);
              }
              return;
            }
          }
        }
      }
    };

    searchOptions(data.options);

    if (found) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
      changed++;
    } else if (!errors) {
      console.log(`  WARNING: Option '${migration.option}' not found in ${migration.file}`);
    }
  } catch (e) {
    console.log(`  ERROR: ${migration.file} - ${e.message}`);
    errors++;
  }
}

console.log(`\nDone! Changed: ${changed}, Skipped (unchanged): ${skipped}, Errors: ${errors}`);

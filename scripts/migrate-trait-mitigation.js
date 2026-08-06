/**
 * Migration script: Update trait and random trait data codes for min/max mitigation system
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// TRAITS
const TRAIT_MIGRATIONS = [
  { file: 'traits/awakened.json', option: 'Sensitive Mind', old: 'A2=-3:M8=-3:SSJ=X', new: 'A2=-3:N8=5:SSJ=X' },
  { file: 'traits/fey_touched.json', option: 'Court of the Wild', old: 'M7=1:IE=1', new: 'M7=1:IE=1' }, // unchanged
  { file: 'traits/living_dead.json', option: 'Unnatural Resilience', old: 'IH=1:IK=1:IB=1:IP=1:IO=1:M5=5', new: 'IH=1:IK=1:IB=1:IP=1:IO=1:M5=5' }, // unchanged
  { file: 'traits/lycanthropy.json', option: 'Weakness to Fire', old: 'M2=-2', new: 'N2=5' },
  { file: 'traits/lycanthropy.json', option: 'Weakness to Water', old: 'M3=-2', new: 'N3=5' },
  { file: 'traits/planar.json', option: 'Fire (Infernal)', old: 'YT1=1:M2=3:M6=-4', new: 'YT1=1:M2=3:N6=5' },
  { file: 'traits/planar.json', option: 'Water (Abyssal)', old: 'YT1=1:M3=3:M6=-4', new: 'YT1=1:M3=3:N6=5' },
  { file: 'traits/planar.json', option: 'Sky (Aeron)', old: 'YT4=1:M4=3:M5=-4', new: 'YT4=1:M4=3:N5=5' },
  { file: 'traits/planar.json', option: 'Earth (Okkor)', old: 'YT4=1:M1=1:M5=-4', new: 'YT4=1:M1=1:N5=5' },
  { file: 'traits/vampirism.json', option: 'Strigoi Bloodline', old: 'SSC=X:SSK=X:M1=1', new: 'SSC=X:SSK=X:M1=1' }, // unchanged
  { file: 'traits/vampirism.json', option: 'Nosferatu Bloodline', old: 'SSF=X:SSM=X:M9=3', new: 'SSF=X:SSM=X:M9=3' }, // unchanged
  { file: 'traits/vampirism.json', option: 'Dracul Bloodline', old: 'SST=X:SSL=X:M8=3', new: 'SST=X:SSL=X:M8=3' }, // unchanged
];

// RANDOM TRAITS (these use comma separators, not colons)
const RANDOM_TRAIT_MIGRATIONS = [
  { file: 'random/traits/physical_traits.json', name: 'Albino', old: 'SBK=-1,SSR=1,M3=1', new: 'SBK=-1,SSR=1,M3=1' }, // unchanged
  { file: 'random/traits/physical_traits.json', name: 'Always Cold', old: 'M2=-1,M3=2', new: 'N2=2,M3=2' },
  { file: 'random/traits/physical_traits.json', name: 'Always Hot', old: 'M3=-1,M2=2', new: 'N3=2,M2=2' },
  { file: 'random/traits/physical_traits.json', name: 'Hairy', old: 'M3=1', new: 'M3=1' }, // unchanged
  { file: 'random/traits/physical_traits.json', name: 'Hardy', old: 'A1=2,SSD=2,M9=1', new: 'A1=2,SSD=2,M9=1' }, // unchanged
  { file: 'random/traits/physical_traits.json', name: 'Hunch Back', old: 'A2=-1,SSA=-2,K1=-2,M1=1', new: 'A2=-1,SSA=-2,K1=-2,M1=1' }, // unchanged
  { file: 'random/traits/physical_traits.json', name: 'Pale', old: 'SBD=-1,H1=-2,M2=-1', new: 'SBD=-1,H1=-2,N2=1' },
  { file: 'random/traits/physical_traits.json', name: 'Sickly', old: 'A1=-1,SSD=-1,M9=-2', new: 'A1=-1,SSD=-1,N9=3' },
  { file: 'random/traits/physical_traits.json', name: 'Thick', old: 'A2=-1,SBE=-1,SSB=1,M1=1', new: 'A2=-1,SBE=-1,SSB=1,M1=1' }, // unchanged
  { file: 'random/traits/physical_traits.json', name: 'Unhealthy', old: 'H1=-5,SSD=-1,M9=-1', new: 'H1=-5,SSD=-1,N9=2' },
  { file: 'random/birth/birth_circumstances.json', name: 'Winter Born', old: 'M3=1,SSD=1', new: 'M3=1,SSD=1' }, // unchanged
];

const dataDir = path.join(__dirname, '..', 'data');
let changed = 0;
let skipped = 0;
let errors = 0;

// Process trait files
for (const migration of TRAIT_MIGRATIONS) {
  if (migration.old === migration.new) { skipped++; continue; }

  const filePath = path.join(dataDir, migration.file);
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    let found = false;

    const search = (options) => {
      if (!options) return;
      for (const opt of options) {
        if (opt.name === migration.option) {
          const oldData = opt.data;
          const newData = oldData.replace(migration.old, migration.new);
          if (oldData !== newData) {
            opt.data = newData;
            found = true;
            console.log(`  MIGRATED: ${migration.file} -> ${migration.option}`);
            console.log(`    ${oldData} => ${newData}`);
          } else {
            console.log(`  WARNING: No match in ${migration.file} -> ${migration.option}`);
            console.log(`    Looking for: ${migration.old}`);
            console.log(`    Actual: ${opt.data}`);
            errors++;
          }
          return;
        }
        if (opt.subchoices) {
          for (const sub of opt.subchoices) {
            if (sub.name === migration.option) {
              const oldData = sub.data;
              const newData = oldData.replace(migration.old, migration.new);
              if (oldData !== newData) {
                sub.data = newData;
                found = true;
                console.log(`  MIGRATED: ${migration.file} -> ${migration.option} (subchoice)`);
                console.log(`    ${oldData} => ${newData}`);
              }
              return;
            }
          }
        }
        // Check nested options array
        if (opt.options) search(opt.options);
      }
    };

    search(data.options || data.traits || [data]);
    if (found) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
      changed++;
    }
  } catch (e) {
    console.log(`  ERROR: ${migration.file} - ${e.message}`);
    errors++;
  }
}

// Process random trait files (different structure - array of trait objects with "data" field)
for (const migration of RANDOM_TRAIT_MIGRATIONS) {
  if (migration.old === migration.new) { skipped++; continue; }

  const filePath = path.join(dataDir, migration.file);
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    let found = false;

    // Random traits are arrays of objects or have a traits/options array
    const searchArray = (arr) => {
      if (!arr) return;
      for (const item of arr) {
        if (item.name === migration.name && item.data) {
          const oldData = item.data;
          const newData = oldData.replace(migration.old, migration.new);
          if (oldData !== newData) {
            item.data = newData;
            found = true;
            console.log(`  MIGRATED: ${migration.file} -> ${migration.name}`);
            console.log(`    ${oldData} => ${newData}`);
          }
          return;
        }
        // Check nested arrays
        if (item.options) searchArray(item.options);
        if (item.traits) searchArray(item.traits);
      }
    };

    if (Array.isArray(data)) {
      searchArray(data);
    } else if (data.options) {
      searchArray(data.options);
    } else if (data.traits) {
      searchArray(data.traits);
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

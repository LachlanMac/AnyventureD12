/**
 * Migration script: Convert creature mitigation from flat values to min/max format
 *
 * Old format: "mitigation": { "physical": 3, "psychic": 25 }
 * New format: "mitigation": { "physical": { "min": 3, "max": 20 }, "psychic": { "min": 25, "max": 0 } }
 *
 * For creatures:
 * - Old mitigation value becomes the min (damage floor)
 * - Max defaults to 20 (standard ceiling)
 * - Values >= 25 are treated as immune (min: 25, max: 0 — effectively immune)
 * - Negative values on min stay as-is (vulnerability to floor)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data', 'monsters');

function processFile(filePath, relativePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    return;
  }

  if (!data.mitigation || typeof data.mitigation !== 'object') return;

  // Check if already migrated
  const firstValue = Object.values(data.mitigation)[0];
  if (firstValue && typeof firstValue === 'object' && ('min' in firstValue || 'max' in firstValue)) {
    console.log(`  SKIP (already migrated): ${relativePath}`);
    return;
  }

  const newMitigation = {};
  for (const [type, value] of Object.entries(data.mitigation)) {
    if (typeof value === 'number') {
      if (value >= 25) {
        // Immune: set min high enough to block everything, max to 0
        newMitigation[type] = { min: 25, max: 0 };
      } else {
        newMitigation[type] = { min: value, max: 20 };
      }
    }
  }

  data.mitigation = newMitigation;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
  console.log(`  MIGRATED: ${relativePath}`);
}

function walkDir(dir, baseDir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, baseDir);
    } else if (entry.name.endsWith('.json')) {
      const relativePath = path.relative(baseDir, fullPath);
      processFile(fullPath, relativePath);
    }
  }
}

console.log('Migrating creature mitigation to min/max format...\n');
walkDir(dataDir, dataDir);
console.log('\nDone!');

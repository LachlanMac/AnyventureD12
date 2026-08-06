/**
 * Migration script: Convert item mitigation from flat values to min/max format
 *
 * Old format: "mitigation": { "physical": 3 }
 * New format: "mitigation": { "physical": { "min": 3, "max": -3 } }
 *
 * Specific armor values are set per the design decisions below.
 * Items not in the override map get a default symmetric conversion (min = old value, max = -old value).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data', 'items');

// Override map for specific items that need non-default values
// Format: filename -> { damageType: { min, max } }
const OVERRIDES = {
  // Body armor (already migrated via Edit but included for completeness/safety)
  'body/plate_armor.json': { physical: { min: 5, max: -2 } },
  'body/scalemail.json': { physical: { min: 3, max: -3 } },
  'body/chainmail.json': { physical: { min: 4, max: -2 } },
  'body/leather_armor.json': { physical: { min: 2, max: -1 }, heat: { min: 1, max: -1 }, cold: { min: 1, max: -1 } },
  'body/studded_leather.json': { physical: { min: 2, max: -2 }, heat: { min: 1, max: -1 }, cold: { min: 1, max: -1 } },

  // Head - accessories mostly lower max
  'head/plate_helmet.json': { physical: { min: 0, max: -1 } },
  'head/reinforced_helmet.json': { physical: { min: 0, max: -1 } },
  'head/leather_helmet.json': { cold: { min: 0, max: -1 } },
  'head/fur_hat.json': { cold: { min: 1, max: 0 } },

  // Gloves
  'gloves/plate_gloves.json': { physical: { min: 0, max: -1 } },
  'gloves/reinforced_gloves.json': { physical: { min: 0, max: -1 } },
  'gloves/leather_gloves.json': { heat: { min: 0, max: -1 }, cold: { min: 0, max: -1 } },
  'gloves/fur_gloves.json': { cold: { min: 1, max: -1 } },
  'gloves/cloth_gloves.json': { cold: { min: 0, max: -1 } },

  // Boots
  'boots/plate_boots.json': { physical: { min: 0, max: -1 } },
  'boots/reinforced_boots.json': { physical: { min: 0, max: -1 } },
  'boots/reinforced_leather_boots.json': { physical: { min: 0, max: -1 }, heat: { min: 1, max: -1 }, cold: { min: 1, max: -1 } },
  'boots/leather_boots.json': { heat: { min: 0, max: -1 }, cold: { min: 0, max: -1 } },
  'boots/fur_boots.json': { cold: { min: 1, max: -1 } },

  // Cloaks
  'cloaks/fur_cloak.json': { cold: { min: 1, max: -1 } },
  'cloaks/traveler_cloak.json': { cold: { min: 0, max: -1 } },

  // Shields - remove mitigation entirely (block only)
  'shields/tower_shield.json': '__REMOVE__',
  'shields/kite_shield.json': '__REMOVE__',

  // Accessories
  'accessories/belt_of_grounding.json': { electric: { min: 4, max: 0 } },
};

function processFile(filePath, relativePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    return; // skip non-JSON or malformed
  }

  if (!data.mitigation || typeof data.mitigation !== 'object') return;

  // Check if already migrated (has min/max objects)
  const firstValue = Object.values(data.mitigation)[0];
  if (firstValue && typeof firstValue === 'object' && ('min' in firstValue || 'max' in firstValue)) {
    console.log(`  SKIP (already migrated): ${relativePath}`);
    return;
  }

  // Check if all values are 0 or empty
  const hasValues = Object.values(data.mitigation).some(v => v !== 0);
  if (!hasValues) {
    // Convert empty mitigations to new format with zeros
    const newMitigation = {};
    for (const [type, value] of Object.entries(data.mitigation)) {
      newMitigation[type] = { min: 0, max: 0 };
    }
    data.mitigation = newMitigation;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
    console.log(`  MIGRATED (empty): ${relativePath}`);
    return;
  }

  const override = OVERRIDES[relativePath];

  if (override === '__REMOVE__') {
    // Remove mitigation from shields
    data.mitigation = {};
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
    console.log(`  REMOVED mitigation: ${relativePath}`);
    return;
  }

  if (override) {
    data.mitigation = override;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
    console.log(`  MIGRATED (override): ${relativePath}`);
    return;
  }

  // Default conversion: min = old value, max = -old value (symmetric)
  const newMitigation = {};
  for (const [type, value] of Object.entries(data.mitigation)) {
    if (typeof value === 'number') {
      newMitigation[type] = { min: value, max: value > 0 ? -value : 0 };
    }
  }
  data.mitigation = newMitigation;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
  console.log(`  MIGRATED (default): ${relativePath}`);
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

console.log('Migrating item mitigation to min/max format...\n');
walkDir(dataDir, dataDir);
console.log('\nDone!');

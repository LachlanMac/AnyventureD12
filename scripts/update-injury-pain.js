import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pain values for each specific injury (1-3 scale, 0 for none)
const injuryPainMap = {
  // Cosmetic injuries - 0 pain (just visual/cosmetic)
  'bite_mark': 0,
  'brand_mark': 0,
  'bruising': 0,
  'burn': 0,
  'scar': 0,
  'scratch_marks': 0,

  // Lingering injuries - varying pain (0-2)
  'combat_stress': 0,           // Mental, not physical pain
  'concussion': 1,              // Headaches, dizziness
  'lingering_blindness': 0,     // Vision loss, not painful
  'lingering_deafness': 0,      // Hearing loss, not painful
  'nerve_damage': 2,            // Chronic nerve pain
  'persistent_wound': 2,        // Ongoing painful wound

  // Missing parts - phantom pain/residual (0-2)
  'missing_appendage': 0,       // Finger/toe, minimal pain
  'missing_arm': 1,             // Phantom limb pain
  'missing_eye': 0,             // Socket healed, no pain
  'missing_fingers': 0,         // Healed stumps
  'missing_foot': 1,            // Phantom limb pain
  'missing_hand': 1,            // Phantom limb pain
  'missing_leg': 1,             // Phantom limb pain
  'missing_tongue': 1,          // Mouth/speech pain

  // Severe wounds - high pain (2-3)
  'broken_arm': 3,              // Severe fracture pain
  'broken_leg': 3,              // Severe fracture pain
  'internal_bleeding': 3,       // Internal trauma pain
  'lung_damage': 2,             // Breathing pain
  'permanent_damage': 2,        // Chronic tissue damage
  'severe_burns': 3,            // Extreme burn pain
  'spinal_injury': 3,           // Back/nerve pain
  'traumatic_shock': 2          // Body-wide trauma
};

const injuriesDir = path.join(__dirname, '../data/injuries');
const results = [];

// Process all injury types
const injuryTypes = ['cosmetic_injury', 'lingering_injury', 'missing_part', 'severe_wound'];

for (const injuryType of injuryTypes) {
  const typeDir = path.join(injuriesDir, injuryType);

  if (!fs.existsSync(typeDir)) {
    console.log(`Directory not found: ${typeDir}`);
    continue;
  }

  const files = fs.readdirSync(typeDir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(typeDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const injuryId = data.id;

    // Get pain value from map
    const painValue = injuryPainMap[injuryId] ?? data.pain ?? 0;

    // Update pain field
    data.pain = painValue;

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');

    // Track results
    results.push({
      type: injuryType,
      name: data.name,
      id: injuryId,
      pain: painValue
    });
  }
}

// Sort results by type and name
results.sort((a, b) => {
  const typeOrder = {
    'cosmetic_injury': 1,
    'lingering_injury': 2,
    'missing_part': 3,
    'severe_wound': 4
  };
  if (typeOrder[a.type] !== typeOrder[b.type]) {
    return typeOrder[a.type] - typeOrder[b.type];
  }
  return a.name.localeCompare(b.name);
});

// Print results grouped by type
console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║         INJURY PAIN VALUES (0-3 scale)                   ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

let currentType = '';
for (const result of results) {
  if (result.type !== currentType) {
    currentType = result.type;
    const typeTitle = currentType.replace(/_/g, ' ').toUpperCase();
    console.log(`\n━━━ ${typeTitle} ━━━`);
  }

  const painEmoji = result.pain === 0 ? '⚪' :
                   result.pain === 1 ? '🟡' :
                   result.pain === 2 ? '🟠' : '🔴';

  console.log(`${painEmoji} ${result.name.padEnd(30)} Pain: ${result.pain}`);
}

console.log('\n✓ Updated pain values for all injuries!\n');

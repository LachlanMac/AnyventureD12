import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pain values by injury type
const painValues = {
  'cosmetic_injury': 0,
  'lingering_injury': 1,
  'missing_part': 1,
  'severe_wound': 2
};

// Process all injury directories
const injuriesDir = path.join(__dirname, '../data/injuries');

for (const [injuryType, painValue] of Object.entries(painValues)) {
  const typeDir = path.join(injuriesDir, injuryType);

  if (!fs.existsSync(typeDir)) {
    console.log(`Directory not found: ${typeDir}`);
    continue;
  }

  const files = fs.readdirSync(typeDir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(typeDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Add pain field
    data.pain = painValue;

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
  }

  console.log(`✓ Added pain: ${painValue} to ${files.length} ${injuryType} files`);
}

console.log('✓ Complete!');

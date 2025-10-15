import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const injuriesDir = path.join(__dirname, '../data/injuries');
const injuryTypes = ['cosmetic_injury', 'lingering_injury', 'missing_part', 'severe_wound'];

console.log('\n═══════════════════════════════════════════════════════');
console.log('           INJURY AUDIT - Missing Mechanics');
console.log('═══════════════════════════════════════════════════════\n');

const needsAttention = [];

for (const injuryType of injuryTypes) {
  const typeDir = path.join(injuriesDir, injuryType);

  if (!fs.existsSync(typeDir)) continue;

  const files = fs.readdirSync(typeDir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(typeDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const hasData = data.data && data.data.trim().length > 0;
    const hasPainStatement =
      data.description.includes('increases pain by') ||
      data.description.includes('causes no pain') ||
      data.description.includes('causes 1d4 bleeding');

    // Skip cosmetic injuries (they're all 0 pain and don't need mechanics)
    if (injuryType === 'cosmetic_injury') continue;

    // Check if needs attention
    if (!hasData || !hasPainStatement) {
      needsAttention.push({
        type: injuryType,
        name: data.name,
        id: data.id,
        pain: data.pain,
        hasData: hasData,
        dataValue: data.data || '',
        hasPainStatement: hasPainStatement
      });
    }
  }
}

// Group by type
const byType = {
  'lingering_injury': [],
  'missing_part': [],
  'severe_wound': []
};

needsAttention.forEach(item => {
  if (byType[item.type]) {
    byType[item.type].push(item);
  }
});

// Print results
for (const [type, items] of Object.entries(byType)) {
  if (items.length === 0) continue;

  const typeTitle = type.replace(/_/g, ' ').toUpperCase();
  console.log(`\n━━━ ${typeTitle} ━━━`);

  items.forEach(item => {
    console.log(`\n${item.name} (Pain: ${item.pain})`);
    if (!item.hasData) {
      console.log(`  ⚠️  NO DATA CODE`);
    } else {
      console.log(`  ✓ Data: ${item.dataValue}`);
    }
    if (!item.hasPainStatement) {
      console.log(`  ⚠️  NO PAIN STATEMENT IN DESCRIPTION`);
    }
  });
}

console.log(`\n\n✓ Found ${needsAttention.length} injuries needing attention\n`);

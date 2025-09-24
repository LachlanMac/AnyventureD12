// Adds a "data" field (default "") to every option-like entry
// in data/cultures: culturalRestrictions[], benefits[], startingItems[]
// Usage: node scripts/addDataFieldToCultureOptions.js

import fs from 'fs';
import path from 'path';

const root = path.resolve(process.cwd(), 'data', 'cultures');

function ensureDataField(arr) {
  if (!Array.isArray(arr)) return arr;
  return arr.map((entry) => {
    if (entry && typeof entry === 'object') {
      if (!('data' in entry)) {
        return { ...entry, data: '' };
      }
    }
    return entry;
  });
}

function processFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const json = JSON.parse(raw);

  json.culturalRestrictions = ensureDataField(json.culturalRestrictions);
  json.benefits = ensureDataField(json.benefits);
  json.startingItems = ensureDataField(json.startingItems);

  fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8');
}

const files = fs.readdirSync(root).filter((f) => f.endsWith('.json'));
for (const f of files) {
  const p = path.join(root, f);
  processFile(p);
  console.log(`Updated: ${p}`);
}


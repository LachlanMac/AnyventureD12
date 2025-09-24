// Force data codes in culture JSONs:
// - culturalRestrictions[].data = "TX"
// - benefits[].data = "TX"
// - startingItems[].data = "" (blank)
// Usage: node scripts/setCultureDataCodes.js

import fs from 'fs';
import path from 'path';

const root = path.resolve(process.cwd(), 'data', 'cultures');

function setData(arr, value) {
  if (!Array.isArray(arr)) return arr;
  return arr.map((entry) => ({ ...(entry || {}), data: value }));
}

function processFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const json = JSON.parse(raw);

  json.culturalRestrictions = setData(json.culturalRestrictions, 'TX');
  json.benefits = setData(json.benefits, 'TX');
  json.startingItems = setData(json.startingItems, '');

  fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8');
}

const files = fs.readdirSync(root).filter((f) => f.endsWith('.json'));
for (const f of files) {
  const p = path.join(root, f);
  processFile(p);
  console.log(`Set data codes: ${p}`);
}


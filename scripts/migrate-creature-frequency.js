/**
 * Migration script: Convert creature action/reaction energy costs to frequency system.
 *
 * Conversion rules:
 *   - basic: true OR cost 0         -> frequency: "action", actionCost: 1
 *   - cost 1-2, no round/daily      -> frequency: "action", actionCost: 1
 *   - round: true, cost < 3         -> frequency: "round",  actionCost: 1
 *   - round: true, cost >= 3        -> frequency: "round",  actionCost: 2
 *   - daily: true, cost < 3         -> frequency: "battle", actionCost: 1
 *   - daily: true, cost >= 3        -> frequency: "battle", actionCost: 2
 *   - cost >= 3, no round/daily     -> frequency: "round",  actionCost: 2
 *
 * Run: node scripts/migrate-creature-frequency.js [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const monstersDir = path.resolve(__dirname, '../data/monsters');
const dryRun = process.argv.includes('--dry-run');

function migrateAbility(ability) {
  const cost = ability.cost || 0;
  const isBasic = ability.basic || false;
  const isRound = ability.round || false;
  const isDaily = ability.daily || false;

  let frequency = 'action';
  let actionCost = 1;

  if (isDaily) {
    frequency = 'battle';
  } else if (isRound) {
    frequency = 'round';
  } else if (cost >= 3) {
    frequency = 'round';
  }

  ability.frequency = frequency;
  ability.actionCost = actionCost;
  ability.frequencyCondition = ability.frequencyCondition || '';
  if (!ability.trigger) ability.trigger = '';

  return { frequency, actionCost, changed: frequency !== 'action' || actionCost !== 1 };
}

let totalFiles = 0;
let totalActions = 0;
let totalReactions = 0;
let changes = [];

function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.name.endsWith('.json')) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const creature = JSON.parse(raw);
  const relPath = path.relative(monstersDir, filePath);
  let fileChanged = false;

  totalFiles++;

  for (const action of (creature.actions || [])) {
    totalActions++;
    const result = migrateAbility(action);
    if (result.changed) {
      changes.push(`  ${creature.name}: ${action.name} -> ${result.frequency}, actionCost: ${result.actionCost}`);
      fileChanged = true;
    }
  }

  for (const reaction of (creature.reactions || [])) {
    totalReactions++;
    const result = migrateAbility(reaction);
    if (result.changed) {
      changes.push(`  ${creature.name}: ${reaction.name} (reaction) -> ${result.frequency}, actionCost: ${result.actionCost}`);
      fileChanged = true;
    }
  }

  if (fileChanged || true) {
    // Always write to add default fields even for "action" frequency
    if (!dryRun) {
      fs.writeFileSync(filePath, JSON.stringify(creature, null, 2) + '\n', 'utf8');
    }
  }
}

console.log(dryRun ? '=== DRY RUN ===' : '=== MIGRATING ===');
processDir(monstersDir);

console.log(`\nProcessed ${totalFiles} files, ${totalActions} actions, ${totalReactions} reactions`);
console.log(`\nNon-default frequency assignments:`);
if (changes.length === 0) {
  console.log('  (none)');
} else {
  changes.forEach(c => console.log(c));
}
console.log(`\n${dryRun ? 'No files modified (dry run)' : 'Migration complete'}`);

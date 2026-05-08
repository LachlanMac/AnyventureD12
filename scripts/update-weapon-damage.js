import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const weaponsDir = path.resolve(__dirname, '../data/items/weapons');

// Weapon damage chart: { base, growth, aimed } for primary and secondary attacks
// Formula: total damage = base + (growth * hits)
// "aimed" means first die doesn't count (skip tier 1)
const weaponChart = {
  // === SIMPLE MELEE ===
  // Easy group (old 4/1): base 6, growth 2
  'Club':         { primary: { base: '6', growth: '2' } },
  'Dagger':       { primary: { base: '6', growth: '2' } },
  'Short Sword':  { primary: { base: '6', growth: '2' }, secondary: { base: '4', growth: '2' } },
  'Shortsword':   { primary: { base: '6', growth: '2' }, secondary: { base: '4', growth: '2' } },
  'Whip':         { primary: { base: '4', growth: '2' } },
  // Skilled group (old 2/2): base 3, growth 3
  'Handaxe':      { primary: { base: '3', growth: '3' } },
  'Mace':         { primary: { base: '3', growth: '3' } },
  'Scimitar':     { primary: { base: '3', growth: '3' } },
  'Short Staff':  { primary: { base: '3', growth: '3' } },
  'Spear':        { primary: { base: '3', growth: '3' } },
  // Simple 2H: base 6, growth 3
  'Great Club':   { primary: { base: '6', growth: '3' } },
  'Greatclub':    { primary: { base: '6', growth: '3' } },
  'Woodaxe':      { primary: { base: '6', growth: '3' } },
  'Quarterstaff': { primary: { base: '6', growth: '3' } },

  // === COMPLEX MELEE 1H === base 5, growth 4
  'Battle Axe':   { primary: { base: '5', growth: '4' } },
  'Battleaxe':    { primary: { base: '5', growth: '4' } },
  'Longsword':    { primary: { base: '5', growth: '4' }, secondary: { base: '3', growth: '4' } },
  'Rapier':       { primary: { base: '5', growth: '4' } },
  'Falchion':     { primary: { base: '5', growth: '4' } },
  'Flail':        { primary: { base: '5', growth: '4' } },
  'Warhammer':    { primary: { base: '5', growth: '4' } },
  'War Spear':    { primary: { base: '5', growth: '4' } },

  // === COMPLEX MELEE 2H POLEARMS === base 6, growth 4
  'Glaive':          { primary: { base: '6', growth: '4' }, secondary: { base: '4', growth: '4' } },
  'Halberd':         { primary: { base: '6', growth: '4' }, secondary: { base: '4', growth: '4' } },
  'Lucerne Hammer':  { primary: { base: '6', growth: '4' }, secondary: { base: '4', growth: '4' } },
  'Ranseur':         { primary: { base: '6', growth: '4' }, secondary: { base: '4', growth: '4' } },

  // === COMPLEX MELEE 2H GREATS === base 8, growth 4
  'Great-Axe':     { primary: { base: '8', growth: '4' } },
  'Great-Hammer':  { primary: { base: '8', growth: '4' } },
  'Great-Sword':   { primary: { base: '8', growth: '4' } },
  'Estoc':         { primary: { base: '8', growth: '4' } },

  // === SIMPLE RANGED ===
  'Sling':           { primary: { base: '4', growth: '2', aimed: true } },
  'Hand Crossbow':   { primary: { base: '6', growth: '2' } },
  'Short Bow':       { primary: { base: '4', growth: '3', aimed: true } },
  'Crossbow':        { primary: { base: '6', growth: '2' } },

  // === COMPLEX RANGED ===
  'Warbow':          { primary: { base: '4', growth: '4', aimed: true } },
  'Chu-Ko-Nu':       { primary: { base: '6', growth: '0' } },  // flat 6 always, max 3 dice
  'Chu-ko-nu':       { primary: { base: '6', growth: '0' } },
  'Longbow':         { primary: { base: '6', growth: '4', aimed: true } },
  'Arbalest':        { primary: { base: '10', growth: '2' } },
  'Pistol':          { primary: { base: '8', growth: '3', aimed: true } },
  'Musket':          { primary: { base: '10', growth: '3', aimed: true } },
  'Blunderbuss':     { primary: { base: '12', growth: '3', aimed: true } },

  // === THROWING ===
  'Dart':             { primary: { base: '2', growth: '1' } },
  'Shuriken':         { primary: { base: '3', growth: '1' } },
  'Throwing Knife':   { primary: { base: '3', growth: '2' } },
  'Chakram':          { primary: { base: '2', growth: '3' } },
  'Throwing Hammer':  { primary: { base: '5', growth: '3' } },
  'Tomahawk':         { primary: { base: '5', growth: '3' } },
  'Javelin':          { primary: { base: '5', growth: '4' } },
  'Bola':             { primary: { base: '0', growth: '0' } },

  // === STAVES (magic attack) === base 4, growth 4, aimed
  'Arcana Staff':  { primary: { base: '4', growth: '4', aimed: true }, secondary: { base: '6', growth: '3' } },
  'Earthen Staff': { primary: { base: '4', growth: '4', aimed: true }, secondary: { base: '6', growth: '3' } },
  'Flame Staff':   { primary: { base: '4', growth: '4', aimed: true }, secondary: { base: '6', growth: '3' } },
  'Ice Staff':     { primary: { base: '4', growth: '4', aimed: true }, secondary: { base: '6', growth: '3' } },
  'Jolting Staff': { primary: { base: '4', growth: '4', aimed: true }, secondary: { base: '6', growth: '3' } },
  'Mind Staff':    { primary: { base: '4', growth: '4', aimed: true }, secondary: { base: '6', growth: '3' } },
  'Prayer Staff':  { primary: { base: '4', growth: '4', aimed: true }, secondary: { base: '6', growth: '3' } },
  'Spirit Staff':  { primary: { base: '4', growth: '4', aimed: true }, secondary: { base: '6', growth: '3' } },
  'Twisted Staff': { primary: { base: '4', growth: '4', aimed: true }, secondary: { base: '6', growth: '3' } },

  // === WANDS (magic attack) === base 4, growth 4, aimed
  'Arcana Wand':  { primary: { base: '4', growth: '4', aimed: true } },
  'Earthen Wand': { primary: { base: '4', growth: '4', aimed: true } },
  'Flame Wand':   { primary: { base: '4', growth: '4', aimed: true } },
  'Ice Wand':     { primary: { base: '4', growth: '4', aimed: true } },
  'Jolting Wand': { primary: { base: '4', growth: '4', aimed: true } },
  'Mind Wand':    { primary: { base: '4', growth: '4', aimed: true } },
  'Prayer Wand':  { primary: { base: '4', growth: '4', aimed: true } },
  'Spirit Wand':  { primary: { base: '4', growth: '4', aimed: true } },
  'Twisted Wand': { primary: { base: '4', growth: '4', aimed: true } },

  // === UNARMED ===
  'Bladed Ulak':  { primary: { base: '3', growth: '3' } },
};

function findWeaponFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findWeaponFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(fullPath);
    }
  }
  return files;
}

function updateWeapons() {
  const weaponFiles = findWeaponFiles(weaponsDir);
  let updated = 0;
  let skipped = 0;
  const notFound = [];

  for (const filePath of weaponFiles) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const weapon = JSON.parse(fileContent);

    if (weapon.type !== 'weapon') continue;

    const chart = weaponChart[weapon.name];
    if (!chart) {
      notFound.push(weapon.name);
      skipped++;
      continue;
    }

    // Update primary attack
    if (chart.primary && weapon.primary) {
      weapon.primary.damage = chart.primary.base;
      weapon.primary.damage_extra = chart.primary.growth;
      if (chart.primary.aimed) {
        weapon.primary.aimed = true;
      }
    }

    // Update secondary attack
    if (chart.secondary && weapon.secondary) {
      weapon.secondary.damage = chart.secondary.base;
      weapon.secondary.damage_extra = chart.secondary.growth;
      if (chart.secondary.aimed) {
        weapon.secondary.aimed = true;
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(weapon, null, 2) + '\n');
    updated++;

    // Show damage chart
    const base = parseInt(chart.primary.base);
    const growth = parseInt(chart.primary.growth);
    const aimed = chart.primary.aimed || false;
    const maxHits = weapon.hands === 2 ? 6 : 5;
    const tiers = [];
    for (let i = 1; i <= maxHits; i++) {
      if (aimed && i === 1) tiers.push('—');
      else { const effectiveHits = aimed ? i - 1 : i; tiers.push(base + growth * effectiveHits); }
    }
    console.log(`  ✓ ${weapon.name.padEnd(20)} [${tiers.join(', ')}]`);
  }

  console.log(`\nUpdated: ${updated}, Skipped: ${skipped}`);
  if (notFound.length > 0) {
    console.log(`\nNot found in chart: ${notFound.join(', ')}`);
  }
}

updateWeapons();

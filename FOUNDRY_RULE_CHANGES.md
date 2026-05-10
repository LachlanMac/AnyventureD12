# Foundry VTT Rule Changes Instructions

These changes update the Anyventure Foundry VTT system to match the new rules. NO data model changes are needed. The fields `damage` and `damage_extra` stay the same in `template.json` and all data. We just change how they're interpreted, labeled, and calculated.

---

## 1. Weapon Damage: Base/Growth Chart System

### What Changed
- `damage` is now called **"Base"** in the UI
- `damage_extra` is now called **"Growth"** in the UI
- The old formula was: first hit = `damage`, each additional hit adds `damage_extra`
- The NEW formula is: `damage chart = base + (growth * hits)` where hits = 1, 2, 3, 4, 5, 6

### The Damage Chart Formula
```js
// base = system.damage (or system.primary.damage for items)
// growth = system.damage_extra (or system.primary.damage_extra for items)
// hands = system.hands (1 or 2) - determines chart length
// 1-handed weapons have 5 entries (max 5 hits), 2-handed weapons have 6 entries (max 6 hits)
function getDamageChart(base, growth, aimed = false, hands = 1) {
  const maxHits = hands === 2 ? 6 : 5;
  const chart = [];
  for (let i = 1; i <= maxHits; i++) {
    if (aimed && i === 1) {
      chart.push(0); // aimed weapons: first hit slot = no damage
    } else {
      chart.push(base + (growth * i));
    }
  }
  return chart;
}

// Example: Longsword 1H (base=5, growth=4) => [9, 13, 17, 21, 25]
// Example: Estoc 2H (base=8, growth=4) => [12, 16, 20, 24, 28, 32]
// Example: Shortbow 2H (base=4, growth=3, aimed=true) => [0, 10, 13, 16, 19, 22]
```

### Changes to `attack-roll-dialog.mjs` (around line 344-393)
Replace the old damage calculation:
```js
// OLD CODE (REMOVE):
// let totalPrimaryDamage = mainDamage;
// if (hits.length > 1) {
//   totalPrimaryDamage += (hits.length - 1) * extraDamage;
// }
// totalPrimaryDamage += crits.length * extraDamage;

// NEW CODE:
const base = Number(this.attackData.damage) || 0;
const growth = Number(this.attackData.damageExtra) || 0;
const aimed = this.attackData.aimed || false;

let effectiveHits = hits.length;

// Aimed weapons: first successful die is for aiming, doesn't count as a hit
if (aimed && effectiveHits > 0) {
  effectiveHits = effectiveHits - 1;
}

let totalPrimaryDamage = 0;
if (effectiveHits > 0) {
  totalPrimaryDamage = base + (growth * effectiveHits);
}
```

Do the same for secondary damage (around line 373-384):
```js
const secondaryBase = Number(this.attackData.secondaryDamage) || 0;
const secondaryGrowth = Number(this.attackData.secondaryDamageExtra) || 0;

let totalSecondaryDamage = 0;
if (effectiveHits > 0) {
  totalSecondaryDamage = secondaryBase + (secondaryGrowth * effectiveHits);
}
```

Remove all crit-related extra damage code. Crits no longer exist as a separate mechanic.

### Label Changes in Templates/Sheets
Anywhere the UI shows "Damage" and "Extra Damage" for weapons, change labels to:
- "Damage" -> **"Base"**
- "Extra Damage" -> **"Growth"**

Search all `.hbs` template files for references to "Extra Damage", "damage_extra", "damageExtra" labels and update the display text. The field names in the data stay the same (`damage_extra`), only the visible label changes.

### Displaying Damage Charts
Where weapon stats are shown on item sheets or chat cards, display the full damage chart instead of just "X damage + Y extra":
```js
// In item sheet or chat output:
const hands = item.system.hands || 1;
const chart = getDamageChart(base, growth, aimed, hands);
const chartDisplay = aimed
  ? `[-, ${chart.slice(1).join(', ')}]`
  : `[${chart.join(', ')}]`;
// 1H example: "[9, 13, 17, 21, 25]"
// 2H example: "[12, 16, 20, 24, 28, 32]"
// 2H aimed:   "[-, 10, 13, 16, 19, 22]"
```

---

## 2. NPC Static Defense Checks

### What Changed
NPCs no longer roll dice for evasion, deflection, or resilience. Instead they have a **static defense value** that attackers must beat.

### Calculating Static Defense
For NPC actors (type === "npc"), calculate a static defense value from their skill data:

```js
// The die size map: skill value -> die size -> median value
const SKILL_TO_STATIC = {
  0: 2,   // d4 median
  1: 3,   // d6 median
  2: 4,   // d8 median
  3: 5,   // d10 median
  4: 6,   // d12 median
  5: 8,   // d16 median
  6: 10,  // d20 median
  7: 12   // d24 median
};

function getStaticDefense(skillValue) {
  return SKILL_TO_STATIC[skillValue] || 2;
}

// For an NPC with evasion skill value of 3:
// Static evasion = 5 (median of d10)
```

### Where to Apply
- **NPC Sheet**: Display static values for evasion, deflection, and resilience instead of dice pools
- **Attack Resolution**: When a player attacks an NPC, each attack die is compared against the NPC's static defense number. Each die that meets or exceeds it counts as a hit.
- **Player vs Player or Player Defense**: Players still roll dice normally. This only affects NPCs.

### NPC Sheet Display
Add a computed `staticDefense` section to the NPC sheet context:
```js
// In actor-sheet.mjs prepareData or getData for NPCs:
if (actorData.type === 'npc') {
  const skills = actorData.system.basic;
  actorData.system.staticDefense = {
    evasion: getStaticDefense(skills.evasion.value),
    deflection: getStaticDefense(skills.deflection.value),
    resilience: getStaticDefense(skills.resilience.value)
  };
}
```

---

## 3. Spell Attack System

### What Changed
Spells no longer have hardcoded defense checks (e.g., "defense check of 8"). Instead:
- The caster rolls their magic skill pool (e.g., 3d10 for 3 talent black magic, skill 3)
- The **highest die** is the "spell check" value
- This spell check serves double duty: it must beat the RC (Required Check / checkToCast) to cast successfully AND it's compared against the target's static defense (for NPCs) or rolled defense (for players)
- Spell damage is flat (not per-hit like weapons)

### Implementation
When a spell is channeled:
1. Roll the caster's magic skill pool (talent dice of the appropriate magic school)
2. Take the highest die = spell check
3. If spell check >= checkToCast, the spell is channeled successfully
4. For damage/effect spells: compare the spell check against the target's relevant static defense (evasion, deflection, resilience, etc. depending on the spell)
5. If spell check > target's defense, apply the spell's flat damage

### New Spell Data Fields
Two new fields have been added to every spell:

- **`targetCheck`**: What stat the target defends with. Values: `null`, `"defense"`, `"resilience"`, `"endurance"`, `"concentration"`, `"fitness"`, `"coordination"`, `"logic"`, `"might"`, `"senses"`
- **`delivery`**: How the spell reaches the target. Values: `null`, `"projectile"`, `"direct"`, `"area"`

These allow Foundry to automatically determine:
1. Which static defense value to compare the spell check against
2. Whether the deflection halving penalty applies (`projectile` triggers it, `area` triggers evasion/deflection halving, `direct` has no penalty)

Examples:
- Dark Missile: `targetCheck: "defense"`, `delivery: "projectile"`
- Fear: `targetCheck: "resilience"`, `delivery: "direct"`
- Fireball: `targetCheck: "defense"`, `delivery: "area"`
- Ebony Shield: `targetCheck: null`, `delivery: null` (buff, no attack)

The spell's `damage` field is the flat damage dealt. There is no `damage_extra` or growth for spells. A spell either hits for its full damage or misses entirely.

---

## 4. Condition Text Updates

The conditions compendium data has been updated with neutral language. When you re-sync compendiums from the API, the new text will flow through automatically. Key changes:
- "penalty dice to defense checks" -> "-1 penalty to defense checks"
- "bonus dice to defense checks" -> "+1 bonus to defense checks"

This ensures conditions work identically for both rolled (player) and static (NPC) defense values.

---

## 5. Summary of Files to Modify

| File | Changes |
|------|---------|
| `modules/sheets/attack-roll-dialog.mjs` | New damage formula: `base + (growth * hits)`, remove crit extra damage, add aimed weapon logic |
| `modules/sheets/actor-sheet.mjs` | Add `staticDefense` computation for NPCs, update damage label text from "Extra Damage" to "Growth" |
| `templates/*.hbs` (item/weapon sheets) | Change "Extra Damage" labels to "Growth", add damage chart display |
| `templates/*.hbs` (NPC sheet) | Display static defense values for evasion/deflection/resilience |
| `modules/utils/character-parser.js` | No changes needed (field names unchanged) |
| `template.json` | **NO CHANGES** - `damage_extra` field stays as-is |

---

## 6. Important: What NOT to Change

- Do NOT rename `damage_extra` in `template.json` or any data files
- Do NOT rename `damage_extra` in the API export (`foundryRoutes.js`)
- Do NOT change `secondary_damage_extra` anywhere in the data layer
- The internal field name stays `damage_extra` everywhere. Only the UI label changes to "Growth"

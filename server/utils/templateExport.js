export const TEMPLATE_SPELL_LISTS = ['spells', 'sorcererSpells', 'thiefSpells'];

const WEAPON_KEYS = [
  'brawling', 'throwing', 'simpleRangedWeapons', 'complexRangedWeapons', 'simpleMeleeWeapons', 'complexMeleeWeapons'
];
const MAGIC_KEYS = ['black', 'primal', 'meta', 'white', 'mystic', 'arcane'];
const CRAFTING_KEYS = ['engineering', 'fabrication', 'alchemy', 'cooking', 'glyphcraft', 'biosculpting'];
const ATTRIBUTE_KEYS = ['physique', 'finesse', 'mind', 'knowledge', 'social'];

export const TEMPLATE_CATEGORIES = ['martial', 'magic', 'hybrid', 'support', 'utility'];

const pickTalents = (skills = {}, keys) =>
  Object.fromEntries(keys.map(k => [k, skills?.[k]?.talent ?? 0]));

const sortLocations = (a, b) => a.localeCompare(b, undefined, { numeric: true });

// File name for a template: "Blade Dancer" -> "blade_dancer.json"
export const templateFileName = (name) =>
  `${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'template'}.json`;

/**
 * Build template JSON (the data/templates file format) from a character.
 *
 * Expects a lean character with these populated:
 *   modules.moduleId, plannedModules.moduleId, spells.spellId, sorcererSpells.spellId, thiefSpells.spellId
 *
 * Talents come from the stored character values, NOT from applyModuleBonusesToCharacter,
 * otherwise module bonuses would be counted twice when the template preview reapplies them.
 *
 * Module options come only from the planner (plannedModules) with their planned stages.
 * What the character has actually taken or spent is ignored; the plan is the template.
 */
export const buildTemplateFromCharacter = (character, meta = {}) => {
  const byModule = new Map(); // moduleId string -> { name, options: { location: stage } }

  const entryFor = (moduleDoc) => {
    if (!moduleDoc || typeof moduleDoc !== 'object' || !moduleDoc.name) return null;
    const key = moduleDoc._id.toString();
    if (!byModule.has(key)) byModule.set(key, { name: moduleDoc.name, options: {} });
    return byModule.get(key);
  };

  for (const pm of character.plannedModules || []) {
    const entry = entryFor(pm.moduleId);
    if (!entry) continue;
    const planned = pm.selectedOptions instanceof Map
      ? Object.fromEntries(pm.selectedOptions)
      : (pm.selectedOptions || {});
    for (const [location, stage] of Object.entries(planned)) {
      const n = parseInt(stage, 10);
      if (n >= 1 && n <= 4) entry.options[location] = n;
    }
  }

  const modules = [...byModule.values()]
    .filter(e => Object.keys(e.options).length > 0)
    .sort((a, b) =>
      Math.min(...Object.values(a.options)) - Math.min(...Object.values(b.options)) ||
      a.name.localeCompare(b.name)
    )
    .map(e => ({
      module: e.name,
      options: Object.fromEntries(
        Object.entries(e.options).sort(([a], [b]) => sortLocations(a, b))
      )
    }));

  const spellNames = (list = []) =>
    list
      .map(s => (s.spellId && typeof s.spellId === 'object' ? s.spellId.name : null))
      .filter(Boolean);

  // Extra Training traits in the order they were taken. Each picks one subchoice.
  const extraTraining = [];
  for (const t of character.traits || []) {
    const trait = t.traitId;
    if (!trait || typeof trait !== 'object' || trait.name !== 'Extra Training') continue;
    const chosen = t.selectedOptions?.[0]?.selectedSubchoice?.toString();
    if (!chosen) continue;
    const sub = (trait.options || [])
      .flatMap(o => o.subchoices || [])
      .find(sc => sc._id?.toString() === chosen || sc.id === chosen);
    if (sub) extraTraining.push(sub.name);
  }

  const spellLists = Object.fromEntries(
    TEMPLATE_SPELL_LISTS.map(key => [key, spellNames(character[key])])
  );

  return {
    name: (meta.name || `${character.name} Template`).trim(),
    description: meta.description || '',
    playstyle: meta.playstyle || '',
    category: TEMPLATE_CATEGORIES.includes(meta.category) ? meta.category : 'martial',
    attributes: Object.fromEntries(ATTRIBUTE_KEYS.map(k => [k, character.attributes?.[k] ?? 1])),
    weaponTalents: pickTalents(character.weaponSkills, WEAPON_KEYS),
    magicTalents: pickTalents(character.magicSkills, MAGIC_KEYS),
    craftingTalents: pickTalents(character.craftingSkills, CRAFTING_KEYS),
    ...spellLists,
    extraTraining,
    modules
  };
};

/**
 * Serialize template data for data/templates. JSON.stringify always puts number-like keys
 * first ("1", "3", "2a"), so module options are written by hand in natural order on one
 * line: { "1": 1, "2a": 1, "3": 2 }.
 */
export const serializeTemplate = (data) => {
  const modulesJson = (data.modules || [])
    .map(m => {
      const opts = Object.entries(m.options || {})
        .sort(([a], [b]) => sortLocations(a, b))
        .map(([loc, stage]) => `${JSON.stringify(loc)}: ${stage}`)
        .join(', ');
      return `    {\n      "module": ${JSON.stringify(m.module)},\n      "options": { ${opts} }\n    }`;
    })
    .join(',\n');

  const json = JSON.stringify({ ...data, modules: '__MODULES__' }, null, 2);
  return json.replace('"__MODULES__"', modulesJson ? `[\n${modulesJson}\n  ]` : '[]') + '\n';
};

// Character creation budgets. Templates ignore ancestry and starting trait, so they must
// fit the base budget: extra stars from UT codes (Human +1, Talented +2) can't be used.
export const TEMPLATE_TALENT_STARS = 8;
export const TEMPLATE_ATTRIBUTE_POINTS = 6;
export const MAX_EXTRA_TRAINING = 4;
const CREATION_MAX = 4;
const FREE_WEAPON_TALENT = { brawling: 1, throwing: 1, simpleRangedWeapons: 1, simpleMeleeWeapons: 1 };

/**
 * Check a template's attributes and talents against the character creation rules.
 * Returns what was spent and a list of problems (empty when the template is legal).
 */
export const checkTemplateBudget = (data) => {
  const errors = [];
  const attrs = data.attributes || {};
  let attributePoints = 0;
  for (const k of ATTRIBUTE_KEYS) {
    const v = attrs[k] ?? 1;
    if (v < 1 || v > CREATION_MAX) errors.push(`${k} is ${v}; attributes must be 1-${CREATION_MAX} at creation`);
    attributePoints += v - 1;
  }

  let talentStars = 0;
  const checkMax = (label, v) => {
    if (v > CREATION_MAX) errors.push(`${label} talent is ${v}; max ${CREATION_MAX} at creation`);
  };
  for (const k of WEAPON_KEYS) {
    const v = data.weaponTalents?.[k] ?? FREE_WEAPON_TALENT[k] ?? 0;
    checkMax(k, v);
    talentStars += Math.max(0, v - (FREE_WEAPON_TALENT[k] || 0));
  }
  for (const k of MAGIC_KEYS) {
    const v = data.magicTalents?.[k] ?? 0;
    checkMax(k, v);
    talentStars += v;
  }
  for (const k of CRAFTING_KEYS) {
    const v = data.craftingTalents?.[k] ?? 0;
    checkMax(k, v);
    // The first star in a crafting skill grants 2 talent, so 1 isn't reachable
    if (v === 1) errors.push(`${k} talent is 1; the first crafting star grants 2`);
    talentStars += v > 0 ? v - 1 : 0;
  }

  // One Extra Training per 10 module points: 1 per stage, so at most 4, each skill once
  const training = (data.extraTraining || []).map(e => (typeof e === 'string' ? e : e?.name));
  if (training.length > MAX_EXTRA_TRAINING) {
    errors.push(`Has ${training.length} Extra Training picks; max ${MAX_EXTRA_TRAINING} (one per stage)`);
  }
  const dupes = training.filter((n, i) => training.findIndex(m => m?.toLowerCase() === n?.toLowerCase()) !== i);
  if (dupes.length) errors.push(`Extra Training repeats ${[...new Set(dupes)].join(', ')}; each skill can only be trained once`);

  if (attributePoints > TEMPLATE_ATTRIBUTE_POINTS) {
    errors.push(`Uses ${attributePoints} attribute points; templates get ${TEMPLATE_ATTRIBUTE_POINTS}`);
  }
  if (talentStars > TEMPLATE_TALENT_STARS) {
    errors.push(
      `Uses ${talentStars} talent stars; templates get ${TEMPLATE_TALENT_STARS} (extra stars from ancestry or trait, like Human or Talented, can't be used)`
    );
  }

  return { attributePoints, talentStars, errors };
};

export const STAGE_POINTS = { 1: 15, 2: 25, 3: 35, 4: 45 };
const STAGE_LABELS = { 1: 'Starter', 2: 'Advanced', 3: 'Veteran', 4: 'Elite' };

// Module point cost: every option costs 1, and taking tier 1 is what selects the module
// (so 1 module selected = 1 point). Exception: the social (personality) module's tier 1 is
// auto-granted at character creation, so it's free. Same count as the module planner.
export const moduleCost = (moduleDoc, locations) => {
  if (!moduleDoc) return 0;
  if (moduleDoc.mtype === 'personality') return locations.filter(l => l !== '1').length;
  return locations.length;
};

/**
 * Cumulative module points at each stage, and whether every stage used is exactly full.
 * entries: [{ moduleDoc, options: { location: stage } }]
 * Every stage from Starter up to the template's highest stage must total exactly
 * 15 / 25 / 35 / 45, so a template is always a complete build at each step.
 */
export const checkStagePoints = (entries) => {
  let maxStage = 1;
  for (const e of entries) for (const s of Object.values(e.options || {})) maxStage = Math.max(maxStage, Number(s));

  const totals = {};
  const errors = [];
  for (let stage = 1; stage <= Math.min(maxStage, 4); stage++) {
    totals[stage] = entries.reduce((sum, e) => {
      const picks = Object.entries(e.options || {}).filter(([, s]) => Number(s) <= stage).map(([l]) => l);
      return sum + moduleCost(e.moduleDoc, picks);
    }, 0);
    if (totals[stage] !== STAGE_POINTS[stage]) {
      errors.push(
        `${STAGE_LABELS[stage]} uses ${totals[stage]} module points; it must be exactly ${STAGE_POINTS[stage]}`
      );
    }
  }
  return { totals, maxStage: Math.min(maxStage, 4), errors };
};

/**
 * Check each module's picks follow the tree: an option at tier n (n > 1) needs an option
 * from tier n-1 planned at the same stage or earlier, and each tier allows only one pick.
 * entries: [{ name, options: { location: stage } }]
 */
export const checkTierOrder = (entries) => {
  const errors = [];
  for (const { name, options = {} } of entries) {
    const byTier = {};
    for (const [loc, stage] of Object.entries(options)) {
      const tier = parseInt(loc, 10);
      (byTier[tier] ||= []).push({ loc, stage: Number(stage) });
    }
    for (const [tierStr, picks] of Object.entries(byTier)) {
      const tier = Number(tierStr);
      if (picks.length > 1) {
        errors.push(`${name}: tier ${tier} has ${picks.map(p => p.loc).join(' and ')}; only one is allowed`);
      }
      if (tier === 1) continue;
      for (const p of picks) {
        const prev = byTier[tier - 1] || [];
        const earliest = prev.length ? Math.min(...prev.map(x => x.stage)) : null;
        if (earliest === null) {
          errors.push(`${name} ${p.loc} needs a tier ${tier - 1} option, but none is planned`);
        } else if (earliest > p.stage) {
          errors.push(
            `${name} ${p.loc} is planned at ${STAGE_LABELS[p.stage]} but its tier ${tier - 1} option isn't until ${STAGE_LABELS[earliest]}`
          );
        }
      }
    }
  }
  return errors;
};

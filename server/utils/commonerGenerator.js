import fs from 'fs';
import path from 'path';
import Ancestry from '../models/Ancestry.js';
import Culture from '../models/Culture.js';
import Injury from '../models/Injury.js';
import Trait from '../models/Trait.js';
import Module from '../models/Module.js';
import { applyModuleBonusesToCharacter, extractTraitsFromModules } from './characterUtils.js';
import { createPreviewCharacter } from './previewCharacter.js';
import { buildBiographyBrief, rollParents } from './commonerBiography.js';
import {
  aggregateAndAssignModules,
  generatePhysicalCharacteristics,
  generateRandomQuirks,
  getCompatiblePersonalityTraits,
  getWeightedRandom
} from './randomCharacterGenerator.js';

// Random commoner generator: rolls background tables from data/random and builds a
// preview character (nothing saved). Tables change talents/skills through data codes;
// the only modules are ones the rolled tables grant.

const RANDOM_DIR = path.join(process.cwd(), 'data', 'random');
const ATTRIBUTE_KEYS = ['physique', 'finesse', 'mind', 'knowledge', 'social'];
const GENDERS = ['Male', 'Female', 'Non-binary'];
const CREATION_ATTRIBUTE_POINTS = 6;
const ATTRIBUTE_MIN = 1;
const ATTRIBUTE_MAX = 4;

// Rollable background tables; each can be switched off or locked to one entry
export const BACKGROUND_TABLES = [
  { key: 'birth', label: 'Birth' },
  { key: 'childhood', label: 'Childhood' },
  { key: 'origin', label: 'Origin' },
  { key: 'occupation', label: 'Occupation' }
];

const pick = (array) => array[Math.floor(Math.random() * array.length)];
const entryName = (e) => e.name || e.positive || e.negative || e.neutral;
const sameName = (a, b) => a.toLowerCase() === b.toLowerCase();

const readJson = (relPath) => {
  const full = path.join(RANDOM_DIR, relPath);
  if (!fs.existsSync(full)) return null;
  return JSON.parse(fs.readFileSync(full, 'utf8'));
};

// Read fresh each call so edits to the JSON show up without a restart
const loadTables = () => ({
  birth: readJson('birth/birth_circumstances.json')?.births || [],
  childhood: readJson('childhood/childhoods.json')?.childhoods || [],
  origin: readJson('origin/origins.json')?.origins || [],
  occupation: readJson('occupation/occupations.json')?.occupations || [],
  personality: readJson('traits/personality_traits.json')?.traits || [],
  physical: readJson('traits/physical_traits.json')?.traits || [],
  ageGroups: readJson('age/age_effects.json')?.ageGroups || {},
  special: readJson('traits/special_traits.json') || { chance: 0, weights: {} },
  lifespans: readJson('ancestry_data.json')?.ancestries || {}
});

const namesFor = (ancestryName, file) => {
  const folder = ancestryName.toLowerCase().replace(/\s+/g, '-');
  return readJson(`names/${folder}/${file}.json`)?.names || [];
};

// Table entries grant modules as { key: points } where points is a number or a [min, max]
// range rolled each time (e.g. occupations: [1, 5], or [3, 7] for martial trades)
const rollModulePoints = (modules = {}) =>
  Object.fromEntries(
    Object.entries(modules).map(([key, pts]) => [
      key,
      Array.isArray(pts) ? pts[0] + Math.floor(Math.random() * (pts[1] - pts[0] + 1)) : pts
    ])
  );

// Injuries that can't stack on one body (two arm losses, two leg losses, ...)
const INJURY_GROUPS = {
  missing_arm: 'arm',
  missing_hand: 'arm',
  missing_fingers: 'arm',
  missing_leg: 'leg',
  missing_foot: 'leg',
  missing_eye: 'eye',
  missing_tongue: 'tongue'
};
const injuryGroups = (entry) =>
  (entry.injuries || []).map(id => INJURY_GROUPS[id] || id);

// Pick a locked entry by name, or a random one
const pickEntry = (list, lockedName, label) => {
  if (lockedName) {
    const found = list.find(e => sameName(entryName(e), lockedName));
    if (!found) throw Object.assign(new Error(`Unknown ${label}: ${lockedName}`), { status: 400 });
    return found;
  }
  return pick(list);
};

// Dropdown values for the generator page
export const getGeneratorOptions = async () => {
  const tables = loadTables();
  const ancestries = await Ancestry.find({}).select('name').sort({ name: 1 }).lean();
  const cultures = await Culture.find({}).select('name').sort({ name: 1 }).lean();
  const social = await Module.find({ mtype: 'personality' }).select('name').sort({ name: 1 }).lean();
  const names = (list) => list.map(entryName).sort((a, b) => a.localeCompare(b));
  return {
    ancestries: ancestries.map(a => a.name),
    culture: cultures.map(c => c.name),
    social: social.map(m => m.name),
    genders: GENDERS,
    ageGroups: Object.entries(tables.ageGroups).map(([key, g]) => ({ key, name: g.name })),
    birth: names(tables.birth),
    childhood: names(tables.childhood),
    origin: names(tables.origin),
    occupation: names(tables.occupation),
    special: Object.keys(tables.special.weights || {}).sort((a, b) => a.localeCompare(b)),
    specialChance: tables.special.chance ?? 0,
    personality: names(tables.personality),
    physical: names(tables.physical)
  };
};

// 6 points over attributes that start at 1, capped at the creation max of 4
const rollAttributes = () => {
  const attributes = Object.fromEntries(ATTRIBUTE_KEYS.map(k => [k, ATTRIBUTE_MIN]));
  for (let i = 0; i < CREATION_ATTRIBUTE_POINTS; i++) {
    const open = ATTRIBUTE_KEYS.filter(k => attributes[k] < ATTRIBUTE_MAX);
    attributes[pick(open)]++;
  }
  return attributes;
};

const rollName = (ancestryName, gender) => {
  const fileFor = (g) => (g === 'Female' ? 'femme_names' : 'masc_names');
  const listGender = gender === 'Non-binary' ? pick(['Male', 'Female']) : gender;
  let first = namesFor(ancestryName, fileFor(listGender));
  let last = namesFor(ancestryName, 'surnames');
  if (first.length === 0) first = namesFor('human', fileFor(listGender));
  if (last.length === 0) last = namesFor('human', 'surnames');
  return [pick(first), last.length ? pick(last) : null].filter(Boolean).join(' ');
};

// Age group (weighted, or locked) and an age within the ancestry's lifespan
const rollAge = (tables, ancestryName, lockedGroup) => {
  const groups = Object.entries(tables.ageGroups).map(([key, g]) => ({ key, ...g }));
  const group = lockedGroup
    ? groups.find(g => g.key === lockedGroup || sameName(g.name, lockedGroup))
    : getWeightedRandom(groups, 'weight');
  if (!group) throw Object.assign(new Error(`Unknown age group: ${lockedGroup}`), { status: 400 });

  const lifespanKey = Object.keys(tables.lifespans).find(k => sameName(k, ancestryName));
  const { mature = 18, average = 80 } = tables.lifespans[lifespanKey] || {};
  const span = average - mature;
  const minAge = mature + Math.floor(span * (group.percentageRange.min / 100));
  const maxAge = mature + Math.floor(span * (group.percentageRange.max / 100));
  const age = minAge + Math.floor(Math.random() * (maxAge - minAge + 1));

  // Guaranteed effects plus 3 random potential ones (repeats allowed), as before
  const potential = group.potentialData || [];
  const data = [
    ...(group.guaranteedData || []),
    ...(potential.length ? [0, 1, 2].map(() => pick(potential)) : [])
  ].join(',');

  return {
    age,
    group: group.name,
    socialChance: group.socialChance,
    element: { category: 'Age', name: group.name, description: group.description, data, modules: {} }
  };
};

// Social module depth: 1 free point, then keep adding points while a roll beats the chance,
// halving the chance each time (e.g. 90% -> 45% -> 22.5%). Capped at the 7 tiers.
const DEFAULT_SOCIAL_CHANCE = 60;
const MODULE_TIERS = 7;
export const rollSocialPoints = (baseChance = DEFAULT_SOCIAL_CHANCE) => {
  let points = 1;
  let chance = (baseChance ?? DEFAULT_SOCIAL_CHANCE) / 100;
  while (points < MODULE_TIERS && Math.random() < chance) {
    points++;
    chance /= 2;
  }
  return points;
};

// Pick ancestry options; required choices get a random subchoice (stored by its id)
const rollAncestryOptions = (ancestry) =>
  (ancestry.options || []).map(option => {
    if (option.requiresChoice && option.subchoices?.length) {
      const sub = pick(option.subchoices);
      return { name: option.name, selectedSubchoice: sub.id, subchoiceName: sub.name };
    }
    return { name: option.name, selectedSubchoice: null, subchoiceName: null };
  });

// Rare game trait (Vampirism, Lycanthropy, ...): a locked one always applies, otherwise roll
// special_traits.json's chance, then a weighted pick. Every option with choices gets a random one.
const rollSpecialTrait = async (special, lockedName) => {
  let traitName = lockedName;
  if (!traitName) {
    if (Math.random() * 100 >= (special.chance ?? 0)) return null;
    const weighted = Object.entries(special.weights || {}).map(([name, weight]) => ({ name, weight }));
    if (weighted.length === 0) return null;
    traitName = getWeightedRandom(weighted, 'weight').name;
  }
  const trait = await Trait.findOne({ name: new RegExp(`^${traitName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }).lean();
  if (!trait) {
    if (lockedName) throw Object.assign(new Error(`Unknown trait: ${lockedName}`), { status: 400 });
    return null;
  }
  const selectedOptions = (trait.options || []).map(option => {
    if (option.subchoices?.length) {
      const sub = pick(option.subchoices);
      return { name: option.name, selectedSubchoice: sub.id, subchoiceName: sub.name };
    }
    return { name: option.name, selectedSubchoice: null, subchoiceName: null };
  });
  return { trait, selectedOptions };
};

// Background element -> trait-shaped object the bonus/trait pipeline understands
const asTrait = (element, index) => ({
  traitId: {
    _id: `random-${index}`,
    name: element.name,
    options: [{ name: element.name, description: element.description, data: element.data || '' }]
  },
  selectedOptions: []
});

/**
 * Roll a commoner.
 * include: { culture, social, birth, childhood, origin, occupation, age, personality, physical, quirks,
 *            special, parents }
 *          (default all true)
 * locks:   { ancestry, gender, culture, social, ageGroup, birth, childhood, origin, occupation,
 *            personality, physical, special }
 * counts:  { personality = 2, physical = 1 }
 */
export const generateCommoner = async ({ include = {}, locks = {}, counts = {} } = {}) => {
  const on = (key) => include[key] !== false;
  const tables = loadTables();

  // Ancestry (always rolled; it decides names, lifespan and size)
  const ancestries = await Ancestry.find({}).lean();
  const ancestry = locks.ancestry
    ? ancestries.find(a => sameName(a.name, locks.ancestry))
    : pick(ancestries);
  if (!ancestry) throw Object.assign(new Error(`Unknown ancestry: ${locks.ancestry}`), { status: 400 });
  const ancestryOptions = rollAncestryOptions(ancestry);

  const gender = locks.gender && GENDERS.includes(locks.gender) ? locks.gender : pick(GENDERS);
  const name = rollName(ancestry.name, gender);
  const birthplaces = namesFor(ancestry.name, 'birthplaces');
  const birthplace = birthplaces.length ? pick(birthplaces) : null;

  // Age first: it sets how deep the social module goes. Its effects are added in story order below.
  const age = on('age') ? rollAge(tables, ancestry.name, locks.ageGroup) : null;

  // Background elements, in story order
  const elements = [];

  // Culture: one restriction, one benefit and one starting item, like character creation
  let culture = null;
  if (on('culture')) {
    const cultures = await Culture.find({}).lean();
    const doc = locks.culture ? cultures.find(c => sameName(c.name, locks.culture)) : pick(cultures);
    if (!doc) throw Object.assign(new Error(`Unknown culture: ${locks.culture}`), { status: 400 });
    const choose = (list) => (list?.length ? pick(list) : null);
    culture = {
      name: doc.name,
      restriction: choose(doc.culturalRestrictions),
      benefit: choose(doc.benefits),
      startingItem: choose(doc.startingItems)
    };
    for (const [label, entry] of [['Culture Restriction', culture.restriction], ['Culture Benefit', culture.benefit]]) {
      if (!entry) continue;
      elements.push({
        category: label,
        name: entry.name,
        description: entry.description || '',
        data: entry.data || '',
        modules: {}
      });
    }
  }

  // Social module: everyone starts with one, its tier 1 granted free at creation. Older
  // commoners are likelier to have grown further into it: each extra point rolls against the
  // age group's socialChance, and the chance halves after every success.
  if (on('social')) {
    const socials = await Module.find({ mtype: 'personality' }).lean();
    const mod = locks.social ? socials.find(m => sameName(m.name, locks.social)) : pick(socials);
    if (!mod) throw Object.assign(new Error(`Unknown social module: ${locks.social}`), { status: 400 });
    elements.push({
      category: 'Social',
      name: mod.name,
      description: mod.description || '',
      data: '',
      modules: { [mod.name.toLowerCase().replace(/\s+/g, '_')]: rollSocialPoints(age?.socialChance) }
    });
  }
  for (const { key, label } of BACKGROUND_TABLES) {
    if (!on(key) || tables[key].length === 0) continue;
    const entry = pickEntry(tables[key], locks[key], label.toLowerCase());
    elements.push({
      category: label,
      name: entryName(entry),
      description: entry.description || '',
      data: entry.data || '',
      modules: rollModulePoints(entry.modules),
      injuries: entry.injuries || [],
      wealth: entry.wealth,
      items: entry.items
    });
  }

  if (age?.element.data) elements.push(age.element);

  if (on('personality')) {
    const count = Math.max(0, Math.min(Number(counts.personality ?? 2), 5));
    const locked = locks.personality
      ? pickEntry(tables.personality, locks.personality, 'personality trait')
      : null;
    // Locked trait first, then fill with traits compatible with it
    const pool = locked
      ? tables.personality.filter(
          t =>
            entryName(t) !== entryName(locked) &&
            !(locked.incompatible || []).includes(entryName(t)) &&
            !(t.incompatible || []).includes(entryName(locked))
        )
      : tables.personality;
    const rest = getCompatiblePersonalityTraits(pool, Math.max(0, count - (locked ? 1 : 0)));
    for (const t of [locked, ...rest].filter(Boolean).slice(0, Math.max(count, locked ? 1 : 0))) {
      const tone = t.positive ? 'positive' : t.negative ? 'negative' : 'neutral';
      elements.push({
        category: 'Personality',
        tone,
        name: entryName(t),
        description: t.description || '',
        data: t.data || '',
        modules: rollModulePoints(t.modules),
        injuries: t.injuries || []
      });
    }
  }

  const physicalPicks = [];
  if (on('physical')) {
    const count = Math.max(0, Math.min(Number(counts.physical ?? 1), 4));
    const locked = locks.physical ? pickEntry(tables.physical, locks.physical, 'physical trait') : null;
    const pool = [...tables.physical.filter(t => t !== locked)].sort(() => Math.random() - 0.5);
    const wanted = Math.max(count, locked ? 1 : 0);
    const usedGroups = new Set();
    for (const t of [locked, ...pool].filter(Boolean)) {
      if (physicalPicks.length >= wanted) break;
      const groups = injuryGroups(t);
      if (t !== locked && groups.some(g => usedGroups.has(g))) continue;
      groups.forEach(g => usedGroups.add(g));
      physicalPicks.push(t);
    }
    for (const t of physicalPicks) {
      elements.push({
        category: 'Physical',
        name: t.name,
        description: t.description || '',
        data: t.data || '',
        modules: rollModulePoints(t.modules),
        injuries: t.injuries || []
      });
    }
  }

  const quirks = on('quirks') ? generateRandomQuirks() : [];

  const special = on('special') ? await rollSpecialTrait(tables.special, locks.special) : null;
  if (special) {
    const choices = special.selectedOptions.filter(o => o.subchoiceName).map(o => o.subchoiceName);
    elements.push({
      category: 'Trait',
      name: special.trait.name,
      description: [special.trait.description, choices.length ? `(${choices.join(', ')})` : '']
        .filter(Boolean)
        .join(' '),
      data: '',
      modules: {},
      special: true // applied as the real trait below, not as a stand-in
    });
  }

  // Height/weight/size from the existing helper (it matches size subchoices by name)
  const physique = generatePhysicalCharacteristics(
    ancestry,
    physicalPicks,
    ancestryOptions.map(o => ({ name: o.name, selectedSubchoice: o.subchoiceName }))
  );

  // Modules granted by the rolled tables (tier 1 upward, random choice options)
  const granted = await aggregateAndAssignModules(elements);
  const moduleDocs = await Module.find({ _id: { $in: granted.map(m => m.moduleId) } }).lean();
  const moduleById = new Map(moduleDocs.map(m => [m._id.toString(), m]));
  const modules = granted
    .filter(m => moduleById.has(m.moduleId.toString()))
    .map(m => ({
      moduleId: moduleById.get(m.moduleId.toString()),
      selectedOptions: m.selectedOptions.map(o => ({ location: o.location }))
    }));

  // Injuries granted by rolled traits (pain/stress come from these, like on a character sheet)
  const injuryIds = [...new Set(elements.flatMap(e => e.injuries || []))];
  const injuryDocs = injuryIds.length ? await Injury.find({ id: { $in: injuryIds } }).lean() : [];
  const injuryById = new Map(injuryDocs.map(i => [i.id, i]));
  const injuries = elements.flatMap(e =>
    (e.injuries || [])
      .filter(id => injuryById.has(id))
      .map(id => ({ injuryId: injuryById.get(id), notes: `${e.category}: ${e.name}` }))
  );

  const attach = (character) => {
    character.ancestry = {
      ancestryId: ancestry,
      selectedOptions: ancestryOptions.map(({ name: n, selectedSubchoice }) => ({ name: n, selectedSubchoice }))
    };
    character.traits = [
      ...elements.filter(e => !e.special).map(asTrait),
      ...(special
        ? [{
            traitId: special.trait,
            selectedOptions: special.selectedOptions.map(({ name: n, selectedSubchoice }) => ({ name: n, selectedSubchoice }))
          }]
        : [])
    ];
    character.modules = modules;
    character.injuries = injuries;
    return character;
  };

  // Attribute changes from rolls (ST codes) also change every skill's talent under that
  // attribute, so find the final attributes first, then build the real preview from them.
  const baseAttributes = rollAttributes();
  const probe = attach(createPreviewCharacter({ name, attributes: { ...baseAttributes } }));
  applyModuleBonusesToCharacter(probe);
  const attributes = Object.fromEntries(
    ATTRIBUTE_KEYS.map(k => [k, Math.max(ATTRIBUTE_MIN, Math.min(ATTRIBUTE_MAX, probe.attributes[k]))])
  );

  const character = attach(createPreviewCharacter({ name, attributes: { ...attributes } }));
  applyModuleBonusesToCharacter(character);
  character.attributes = attributes; // bonuses were already folded in above
  character.derivedTraits = extractTraitsFromModules(character);
  character.age = age?.age ?? null;
  character.gender = gender;

  const occupation = elements.find(e => e.category === 'Occupation');

  const lifespanKey = Object.keys(tables.lifespans).find(k => sameName(k, ancestry.name));
  const parents = on('parents')
    ? rollParents({
        childName: name,
        childAge: age?.age ?? null,
        lifespan: tables.lifespans[lifespanKey],
        namesFor: (file) => namesFor(ancestry.name, file),
        occupations: tables.occupation.map(entryName)
      })
    : [];

  const result = {
    character,
    parents,
    profile: {
      name,
      gender,
      ancestry: ancestry.name,
      ancestryOptions: ancestryOptions.map(o => ({ name: o.name, choice: o.subchoiceName })),
      age: age?.age ?? null,
      ageGroup: age?.group ?? null,
      birthplace,
      height: physique.height,
      weight: physique.weight,
      size: physique.size,
      baseAttributes,
      culture: culture
        ? {
            name: culture.name,
            restriction: culture.restriction?.name ?? null,
            benefit: culture.benefit?.name ?? null,
            startingItem: culture.startingItem
              ? { name: culture.startingItem.name, description: culture.startingItem.description || '' }
              : null
          }
        : null,
      wealth: occupation?.wealth ?? null,
      items: [...(occupation?.items || []), ...(culture?.startingItem ? [culture.startingItem.name] : [])]
    },
    background: elements.map(({ category, tone, name: n, description, data, modules: m, injuries: inj }) => ({
      category,
      tone: tone || null,
      name: n,
      description,
      data,
      modules: m,
      injuries: (inj || []).map(id => injuryById.get(id)?.name ?? id)
    })),
    quirks,
    modules: modules.map(m => ({
      name: m.moduleId.name,
      options: m.selectedOptions.map(o => ({
        location: o.location,
        name: m.moduleId.options.find(opt => opt.location === o.location)?.name ?? o.location
      }))
    }))
  };
  result.biography = buildBiographyBrief(result);
  return result;
};

// Parents and a plain-text biography brief for a rolled commoner. The brief is a list of
// facts meant to be handed to an AI model to write a fun biography from.

const pick = (array) => array[Math.floor(Math.random() * array.length)];
const randInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

// Parents' fate: 30% both dead, 20% only father alive, 20% only mother alive,
// 20% unknown, 10% both alive
const PARENT_FATES = [
  { weight: 30, mother: 'dead', father: 'dead' },
  { weight: 20, mother: 'dead', father: 'alive' },
  { weight: 20, mother: 'alive', father: 'dead' },
  { weight: 20, mother: 'unknown', father: 'unknown' },
  { weight: 10, mother: 'alive', father: 'alive' }
];

const rollFate = () => {
  let roll = Math.random() * PARENT_FATES.reduce((sum, f) => sum + f.weight, 0);
  for (const fate of PARENT_FATES) {
    roll -= fate.weight;
    if (roll < 0) return fate;
  }
  return PARENT_FATES[0];
};

/**
 * Roll a mother and father: first name from the ancestry's lists plus the character's
 * family name, an occupation, an age, and whether they are alive.
 * lifespan: { mature, average } for the ancestry; childAge may be null (age disabled).
 */
export const rollParents = ({ childName, childAge, lifespan, namesFor, occupations }) => {
  const familyName = childName.split(' ').slice(1).join(' ');
  const { mature = 18, average = 80 } = lifespan || {};
  const fate = rollFate();

  const parent = (role, nameFile) => {
    const firstNames = namesFor(nameFile);
    const first = firstNames.length ? pick(firstNames) : role === 'mother' ? 'Mother' : 'Father';
    // Had the child somewhere in the first ~35% of adult life
    const ageAtBirth = mature + randInt(0, Math.max(1, Math.floor((average - mature) * 0.35)));
    let status = fate[role];
    let age = childAge !== null && childAge !== undefined ? childAge + ageAtBirth : null;
    let diedYearsAgo = null;
    let cause = null;

    // Someone well past their ancestry's lifespan has died of old age
    if (status === 'alive' && age !== null && age > average * 1.2) {
      status = 'dead';
      cause = 'old age';
    }
    if (status === 'dead' && childAge) {
      diedYearsAgo = randInt(1, Math.max(1, childAge));
      if (cause === 'old age') diedYearsAgo = Math.max(1, Math.min(diedYearsAgo, age - Math.floor(average * 1.1)));
      age = age !== null ? age - diedYearsAgo : null; // age when they died
    }

    return {
      role,
      name: [first, familyName].filter(Boolean).join(' '),
      occupation: occupations.length ? pick(occupations) : null,
      status,
      age, // current age if alive, age at death if dead, null if unknown/no age
      diedYearsAgo,
      cause
    };
  };

  return [parent('mother', 'femme_names'), parent('father', 'masc_names')];
};

const PRONOUNS = {
  Male: { subject: 'he', object: 'him', possessive: 'his' },
  Female: { subject: 'she', object: 'her', possessive: 'her' },
  'Non-binary': { subject: 'they', object: 'them', possessive: 'their' }
};

const DIE_BY_VALUE = ['d6', 'd8', 'd10', 'd12', 'd16', 'd20', 'd24', 'd30'];
const SKILL_LABELS = {
  simpleMeleeWeapons: 'simple melee weapons',
  complexMeleeWeapons: 'complex melee weapons',
  simpleRangedWeapons: 'simple ranged weapons',
  complexRangedWeapons: 'complex ranged weapons'
};
const MAGIC_LABELS = {
  black: 'black magic', primal: 'primal magic', meta: 'metamagic',
  white: 'white magic', mystic: 'mysticism', arcane: 'arcane magic'
};

// "an" before vowel sounds, including numbers read that way (8, 80-89, 800..., 11, 18)
const article = (word) => {
  const w = String(word).trim();
  if (/^\d/.test(w)) return /^(8|1[18](\D|$))/.test(w) ? 'an' : 'a';
  return /^[aeiou]/i.test(w) ? 'an' : 'a';
};
const lowerFirst = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);
const listJoin = (items) =>
  items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

// Skills worth mentioning: the character's strongest rolls (talent dice and die size)
const notableSkills = (character) => {
  const entries = [];
  const add = (group, labels = {}) => {
    for (const [key, s] of Object.entries(character[group] || {})) {
      if (!s || typeof s !== 'object' || (s.talent ?? 0) < 1) continue;
      const value = Math.max(0, Math.min(7, (s.value ?? 0) + (s.diceTierModifier ?? 0)));
      entries.push({
        name: labels[key] || key.replace(/([A-Z])/g, ' $1').toLowerCase(),
        talent: s.talent,
        value,
        dice: `${s.talent}${DIE_BY_VALUE[value]}`,
        score: value * 2 + s.talent
      });
    }
  };
  add('skills');
  add('weaponSkills', SKILL_LABELS);
  add('magicSkills', MAGIC_LABELS);
  add('craftingSkills');
  // Must have actually trained it (value 2+) or be very talented with some training
  return entries
    .filter(e => e.value >= 2 || (e.talent >= 3 && e.value >= 1))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
};

const parentLine = (subjectName, p) => {
  const role = p.role;
  const job = p.occupation ? `${article(p.occupation)} ${p.occupation.toLowerCase()}` : null;
  if (p.status === 'unknown') {
    return `${subjectName}'s ${role}, ${p.name}, has an unknown fate${job ? ` (last known to be ${job})` : ''}.`;
  }
  if (p.status === 'dead') {
    const when = p.diedYearsAgo ? ` ${p.diedYearsAgo} year${p.diedYearsAgo === 1 ? '' : 's'} ago` : '';
    const atAge = p.age !== null ? ` at the age of ${p.age}` : '';
    const how = p.cause ? ` of ${p.cause}` : '';
    return `${subjectName}'s ${role}, ${p.name}${job ? `, was ${job} and` : ','} died${how}${when}${atAge}.`;
  }
  const age = p.age !== null ? `, ${p.age} years old,` : '';
  return `${subjectName}'s ${role}, ${p.name}${age} is alive${job ? ` and works as ${job}` : ''}.`;
};

/**
 * Plain-text biography brief: identity, family, upbringing, appearance, personality,
 * abilities and possessions, as facts for an AI to turn into a biography.
 */
export const buildBiographyBrief = (result) => {
  const { profile, background, quirks, modules, character, parents } = result;
  const p = PRONOUNS[profile.gender] || PRONOUNS['Non-binary'];
  const first = profile.name.split(' ')[0];
  const byCategory = (cat) => background.filter(e => e.category === cat);
  const one = (cat) => byCategory(cat)[0];
  const lines = [];
  const section = (title, items) => {
    const kept = items.filter(Boolean);
    if (kept.length) lines.push(`## ${title}`, ...kept.map(i => `- ${i}`), '');
  };

  // Identity
  const ageText = profile.age !== null ? `${profile.age}-year-old ${(profile.ageGroup || '').toLowerCase()} ` : '';
  const identity = [
    `${profile.name} is ${article(ageText || profile.ancestry)} ${ageText}${profile.ancestry} (${profile.gender.toLowerCase()}, pronouns ${p.subject}/${p.object}).`,
    profile.birthplace ? `${first} was born ${lowerFirst(profile.birthplace)}.` : null,
    profile.culture ? `${first} was raised in the ${profile.culture.name} culture.` : null,
    `${first} is ${profile.size.toLowerCase()}-sized, ${profile.height} tall and weighs ${profile.weight}.`
  ];
  const ancestryChoices = profile.ancestryOptions.filter(o => o.choice).map(o => `${o.name}: ${o.choice}`);
  if (ancestryChoices.length) identity.push(`Ancestry details: ${ancestryChoices.join('; ')}.`);
  section('Identity', identity);

  // Family
  if (parents?.length) section('Family', parents.map(par => parentLine(first, par)));

  // Background story, each with its table description as a note for the writer
  const story = [];
  const describe = (label, e) =>
    e ? `${label}: ${e.name}. ${e.description ? `(Notes: ${e.description})` : ''}`.trim() : null;
  story.push(describe('Birth', one('Birth')));
  story.push(describe('Childhood', one('Childhood')));
  story.push(describe('Origin', one('Origin')));
  story.push(describe('Occupation', one('Occupation')));
  story.push(describe('Stage of life', one('Age')));
  section('Background', story);

  if (profile.culture) {
    section('Culture', [
      profile.culture.restriction ? `Cultural restriction: ${profile.culture.restriction}. ${byCategory('Culture Restriction')[0]?.description || ''}`.trim() : null,
      profile.culture.benefit ? `Cultural benefit: ${profile.culture.benefit}. ${byCategory('Culture Benefit')[0]?.description || ''}`.trim() : null
    ]);
  }

  // Personality and quirks
  const personality = byCategory('Personality').map(e =>
    `${e.name}${e.tone ? ` (${e.tone})` : ''}${e.description ? `: ${e.description}` : ''}`
  );
  const social = one('Social');
  if (social) {
    const depth = Object.values(social.modules || {})[0] || 1;
    personality.unshift(`Social nature: ${social.name} (developed to rank ${depth} of 7)${social.description ? `: ${social.description}` : ''}`);
  }
  personality.push(...quirks.map(q => `Quirk: ${q.text}`));
  section('Personality', personality);

  // Body: physical traits, injuries, rare traits
  const body = byCategory('Physical').map(e => `${e.name}${e.description ? `: ${e.description}` : ''}`);
  const injuries = (character.injuries || []).map(i => i.injuryId?.name).filter(Boolean);
  if (injuries.length) body.push(`Lasting injuries: ${listJoin(injuries)}.`);
  section('Body and appearance', body);

  const rare = one('Trait');
  if (rare) section('Unusual nature', [`${rare.name}: ${rare.description}`]);

  // Abilities
  const abilities = notableSkills(character).map(s => `Notably good at ${s.name} (rolls ${s.dice}).`);
  for (const m of modules) {
    abilities.push(`Trained as ${article(m.name)} ${m.name}: ${m.options.map(o => o.name.replace(/^(Daily )?(Action|Reaction)\s*:\s*/i, '')).join(', ')}.`);
  }
  section('Abilities', abilities);

  // Possessions
  const possessions = [];
  if (profile.items.length) possessions.push(`${first} has in ${p.possessive} possession: ${listJoin(profile.items)}.`);
  if (profile.culture?.startingItem?.description) {
    possessions.push(`About the ${profile.culture.startingItem.name}: ${profile.culture.startingItem.description}`);
  }
  if (profile.wealth !== null && profile.wealth !== undefined) possessions.push(`Wealth: ${profile.wealth}.`);
  section('Possessions', possessions);

  return lines.join('\n').trim();
};

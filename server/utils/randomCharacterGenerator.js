import fs from 'fs';
import path from 'path';
import Ancestry from '../models/Ancestry.js';
import Culture from '../models/Culture.js';
import Module from '../models/Module.js';

// Helper function to get random element from array
const getRandomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

// Helper function for weighted random selection
const getWeightedRandom = (items, weightKey) => {
  const totalWeight = items.reduce((sum, item) => sum + item[weightKey], 0);
  let random = Math.random() * totalWeight;

  for (const item of items) {
    random -= item[weightKey];
    if (random <= 0) {
      return item;
    }
  }

  return items[items.length - 1]; // Fallback
};

// Helper function to load JSON data
const loadJsonData = (filePath) => {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      console.error(`File not found: ${fullPath}`);
      return null;
    }
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  } catch (error) {
    console.error(`Error loading JSON from ${filePath}:`, error);
    return null;
  }
};

// Generate random name based on ancestry
export const generateRandomName = async (ancestry) => {
  const ancestryName = ancestry.name.toLowerCase().replace(/\s+/g, '-');

  // Randomly pick gender for name generation
  const gender = Math.random() > 0.5 ? 'femme' : 'masc';
  const genderFile = gender === 'femme' ? 'femme_names.json' : 'masc_names.json';

  const firstNamesData = loadJsonData(`data/random/names/${ancestryName}/${genderFile}`);
  const surnamesData = loadJsonData(`data/random/names/${ancestryName}/surnames.json`);

  // Fallback to human names if ancestry names don't exist
  let firstName, surname;
  if (firstNamesData && firstNamesData.names && firstNamesData.names.length > 0) {
    firstName = getRandomElement(firstNamesData.names);
  } else {
    // Fallback to human names
    const humanFirstNames = loadJsonData(`data/random/names/human/${genderFile}`);
    firstName = humanFirstNames ? getRandomElement(humanFirstNames.names) : 'Unnamed';
  }

  if (surnamesData && surnamesData.names && surnamesData.names.length > 0) {
    surname = getRandomElement(surnamesData.names);
  } else {
    // Fallback to human surnames
    const humanSurnames = loadJsonData('data/random/names/human/surnames.json');
    surname = humanSurnames ? getRandomElement(humanSurnames.names) : 'Adventurer';
  }

  return `${firstName} ${surname}`;
};

// Generate random quirks with topics
const generateRandomQuirks = (attempts = 3, chancePerAttempt = 0.3) => {
  const quirksData = loadJsonData('data/random/topics/quirks.json');
  const topicsData = loadJsonData('data/random/topics/topics.json');
  const animalsData = loadJsonData('data/random/topics/animals.json');
  const conceptsData = loadJsonData('data/random/topics/concepts.json');

  if (!quirksData || !topicsData || !animalsData || !conceptsData) {
    return [];
  }

  const quirks = quirksData.quirks || [];
  const allTopicCategories = [
    { name: 'topics', data: topicsData.topics || [] },
    { name: 'animals', data: animalsData.animals || [] },
    { name: 'concepts', data: conceptsData.concepts || [] }
  ];

  const generatedQuirks = [];
  const usedQuirks = new Set(); // Track used quirk IDs to avoid duplicates

  for (let i = 0; i < attempts; i++) {
    if (quirks.length === 0) break;

    // 30% chance to generate a quirk each attempt
    if (Math.random() > chancePerAttempt) continue;

    // Select a random quirk template that hasn't been used
    let quirk;
    let attempts = 0;
    do {
      quirk = getRandomElement(quirks);
      attempts++;
    } while (usedQuirks.has(quirk.id) && attempts < 10);

    if (usedQuirks.has(quirk.id)) continue; // Skip if we couldn't find a unique quirk
    usedQuirks.add(quirk.id);

    // Select a random topic category
    const category = getRandomElement(allTopicCategories);

    // Select a random topic from that category
    if (category.data.length === 0) continue;
    const topic = getRandomElement(category.data);

    // Fill in the template
    const quirkText = quirk.template.replace('{topic}', topic.name);

    generatedQuirks.push({
      text: quirkText,
      type: quirk.type,
      category: category.name,
      topic: topic.name
    });
  }

  return generatedQuirks;
};

// Generate random background with data keys
export const generateRandomBackground = () => {
  const childhoodsData = loadJsonData('data/random/childhood/childhoods.json');
  const occupationsData = loadJsonData('data/random/occupation/occupations.json');
  const traitsData = loadJsonData('data/random/traits/personality_traits.json');
  const originsData = loadJsonData('data/random/origin/origins.json');
  const birthsData = loadJsonData('data/random/birth/birth_circumstances.json');

  const childhood = childhoodsData ? getRandomElement(childhoodsData.childhoods) : null;
  const occupation = occupationsData ? getRandomElement(occupationsData.occupations) : null;
  const trait1 = traitsData ? getRandomElement(traitsData.traits) : null;
  const trait2 = traitsData ? getRandomElement(traitsData.traits.filter(t => t !== trait1)) : null;
  const origin = originsData ? getRandomElement(originsData.origins) : null;
  const birth = birthsData ? getRandomElement(birthsData.births) : null;

  // Build a narrative background
  let background = '';
  if (birth) {
    background += `${birth.description} `;
  }
  if (origin) {
    background += `Originally from ${origin.name.toLowerCase()}, `;
  }
  if (childhood) {
    background += `${childhood.description.toLowerCase()} `;
  }
  if (occupation) {
    background += `Before adventuring, you worked as a ${occupation.name.toLowerCase()}. `;
  }
  if (trait1 || trait2) {
    background += '\n\nPersonality: ';
    if (trait1) {
      const traitKey = trait1.positive || trait1.negative || trait1.neutral;
      background += `${traitKey}`;
    }
    if (trait2) {
      const traitKey = trait2.positive || trait2.negative || trait2.neutral;
      background += ` and ${traitKey.toLowerCase()}`;
    }
    background += '.';
  }

  // Generate random quirks (3 attempts, 30% chance each)
  const quirks = generateRandomQuirks(3, 0.3);
  if (quirks.length > 0) {
    background += '\n\nQuirks: ';
    background += quirks.map(q => q.text).join('. ') + '.';
  }

  // Collect all data keys from background elements
  const backgroundTraits = [];

  if (birth && birth.data) {
    backgroundTraits.push({
      name: `Birth: ${birth.name}`,
      description: birth.description,
      data: birth.data,
      type: 'birth'
    });
  }

  if (childhood && childhood.data) {
    backgroundTraits.push({
      name: `Background: ${childhood.name}`,
      description: childhood.description,
      data: childhood.data,
      type: 'childhood'
    });
  }

  if (occupation && occupation.data) {
    backgroundTraits.push({
      name: `Background: ${occupation.name}`,
      description: occupation.description,
      data: occupation.data,
      type: 'occupation'
    });
  }

  if (origin && origin.data) {
    backgroundTraits.push({
      name: `Background: ${origin.name}`,
      description: origin.description,
      data: origin.data,
      type: 'origin'
    });
  }

  if (trait1 && trait1.data) {
    const traitKey = trait1.positive || trait1.negative || trait1.neutral;
    backgroundTraits.push({
      name: `Personality: ${traitKey}`,
      description: trait1.description,
      data: trait1.data,
      type: 'personality'
    });
  }

  if (trait2 && trait2.data) {
    const traitKey = trait2.positive || trait2.negative || trait2.neutral;
    backgroundTraits.push({
      name: `Personality: ${traitKey}`,
      description: trait2.description,
      data: trait2.data,
      type: 'personality'
    });
  }

  return {
    text: background,
    birth,
    childhood,
    occupation,
    traits: [trait1, trait2].filter(Boolean),
    origin,
    backgroundTraits,
    quirks
  };
};

// Generate random age based on ancestry and weighted age group
export const generateRandomAge = (ancestryName) => {
  const ancestryData = loadJsonData('data/random/ancestry_data.json');
  const ageEffectsData = loadJsonData('data/random/age/age_effects.json');

  if (!ancestryData || !ageEffectsData) {
    return { age: 25, ageGroup: 'adult', ageTrait: null };
  }

  const lifespan = ancestryData.ancestries[ancestryName];
  if (!lifespan) {
    console.error(`No lifespan data for ancestry: ${ancestryName}`);
    return { age: 25, ageGroup: 'adult', ageTrait: null };
  }

  // Prepare weighted age groups
  const ageGroups = Object.entries(ageEffectsData.ageGroups).map(([key, group]) => ({
    key,
    ...group
  }));

  // Select age group using weighted random
  const selectedGroup = getWeightedRandom(ageGroups, 'weight');

  // Calculate age range based on percentage
  const { mature, average } = lifespan;
  const lifeRange = average - mature;

  const minAge = mature + Math.floor(lifeRange * (selectedGroup.percentageRange.min / 100));
  const maxAge = mature + Math.floor(lifeRange * (selectedGroup.percentageRange.max / 100));

  // Random age within the range
  const age = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;

  // Build dynamic age trait data by combining guaranteed + 3 random potential effects
  const guaranteedData = selectedGroup.guaranteedData || [];
  const potentialData = selectedGroup.potentialData || [];

  // Pick 3 random potential effects (allowing repeats)
  const randomPotentialEffects = [];
  for (let i = 0; i < 3; i++) {
    if (potentialData.length > 0) {
      randomPotentialEffects.push(getRandomElement(potentialData));
    }
  }

  // Combine all data into a single comma-separated string
  const allData = [...guaranteedData, ...randomPotentialEffects];
  const combinedData = allData.join(',');

  // Build age trait if there's data
  const ageTrait = combinedData ? {
    name: `Age: ${selectedGroup.name}`,
    description: selectedGroup.description,
    data: combinedData,
    type: 'age'
  } : null;

  return { age, ageGroup: selectedGroup.name, ageTrait };
};

// Randomly distribute attribute points (6 points like normal character creation)
export const generateRandomAttributes = (totalPoints = 6) => {
  const attributes = {
    physique: 1,
    finesse: 1,
    mind: 1,
    knowledge: 1,
    social: 1
  };

  const attributeKeys = Object.keys(attributes);

  // Distribute points randomly
  for (let i = 0; i < totalPoints; i++) {
    const randomAttr = getRandomElement(attributeKeys);
    // Cap at 4 (since starting at 1, max total is 5 which gives 4 talent)
    if (attributes[randomAttr] < 5) {
      attributes[randomAttr]++;
    } else {
      // If we hit max, redistribute to another attribute
      i--;
    }
  }

  return attributes;
};

// Aggregate modules from background elements and assign tiers with random option selection
export const aggregateAndAssignModules = async (backgroundElements) => {
  // Aggregate module points from all background elements
  const modulePoints = {};

  for (const element of backgroundElements) {
    if (element.modules && Object.keys(element.modules).length > 0) {
      for (const [moduleName, points] of Object.entries(element.modules)) {
        if (!modulePoints[moduleName]) {
          modulePoints[moduleName] = 0;
        }
        modulePoints[moduleName] += points;
      }
    }
  }

  // If no modules, return empty array
  if (Object.keys(modulePoints).length === 0) {
    return [];
  }

  console.log('=== MODULE POINTS AGGREGATED ===');
  Object.entries(modulePoints).forEach(([moduleName, points]) => {
    console.log(`  ${moduleName}: ${points} points`);
  });
  console.log('');

  // Fetch all modules from database
  const allModules = await Module.find({});
  const moduleMap = {};
  allModules.forEach(mod => {
    moduleMap[mod.name.toLowerCase().replace(/\s+/g, '_')] = mod;
  });

  // Location progression: "1" -> "2" (choice) -> "3" -> "4" (choice) -> "5" -> "6" (choice) -> "7"
  // All options cost 1 point now (simplified pricing)
  const locationProgression = ['1', '2', '3', '4', '5', '6', '7'];
  const choiceLocations = ['2', '4', '6']; // These have multiple options (2a, 2b, etc.)

  // Build character modules with option assignment
  const characterModules = [];

  for (const [moduleName, totalPoints] of Object.entries(modulePoints)) {
    const moduleData = moduleMap[moduleName];

    if (!moduleData) {
      console.warn(`Module not found in database: ${moduleName}`);
      continue;
    }

    // Check if module has options defined
    if (!moduleData.options || !Array.isArray(moduleData.options) || moduleData.options.length === 0) {
      console.warn(`Module "${moduleName}" (${moduleData.name}) has no options defined, skipping`);
      continue;
    }

    // Determine which locations can be unlocked with total points
    let remainingPoints = totalPoints;
    const selectedOptions = [];

    for (const location of locationProgression) {
      if (remainingPoints <= 0) break;

      // Find all options at this location
      const optionsAtLocation = moduleData.options.filter(opt => {
        const optLocation = opt.location.replace(/[a-z]/g, ''); // Remove letter suffix
        return optLocation === location;
      });

      if (optionsAtLocation.length === 0) {
        // No options at this location, skip
        continue;
      }

      // For choice locations, randomly select one option
      if (choiceLocations.includes(location)) {
        const selectedOption = getRandomElement(optionsAtLocation);
        selectedOptions.push({
          optionId: selectedOption._id,
          location: selectedOption.location,
          name: selectedOption.name
        });
        remainingPoints -= 1; // All options cost 1 point
      } else {
        // For non-choice locations, there should only be one option
        const option = optionsAtLocation[0];
        selectedOptions.push({
          optionId: option._id,
          location: option.location,
          name: option.name
        });
        remainingPoints -= 1; // All options cost 1 point
      }
    }

    if (selectedOptions.length > 0) {
      characterModules.push({
        moduleId: moduleData._id,
        selectedOptions
      });
    }
  }

  return characterModules;
};

// Note: Module selection is removed - characters start with no modules invested
// The GM will award module points and players will invest them manually

// Helper function to select N random unique items from an array
const getRandomTraits = (traitsArray, count) => {
  const shuffled = [...traitsArray].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

// Helper function to select compatible personality traits
const getCompatiblePersonalityTraits = (traitsArray, count) => {
  const selected = [];
  const maxAttempts = 1000; // Prevent infinite loops
  let attempts = 0;

  while (selected.length < count && attempts < maxAttempts) {
    attempts++;

    // Get a random trait
    const candidateTrait = traitsArray[Math.floor(Math.random() * traitsArray.length)];
    const candidateName = candidateTrait.positive || candidateTrait.negative || candidateTrait.neutral;

    // Check if already selected
    if (selected.some(t => {
      const tName = t.positive || t.negative || t.neutral;
      return tName === candidateName;
    })) {
      continue;
    }

    // Check for incompatibilities with already selected traits
    const isCompatible = selected.every(selectedTrait => {
      const selectedName = selectedTrait.positive || selectedTrait.negative || selectedTrait.neutral;
      const candidateIncompatible = candidateTrait.incompatible || [];
      const selectedIncompatible = selectedTrait.incompatible || [];

      // Check if candidate is incompatible with this selected trait
      if (candidateIncompatible.includes(selectedName)) {
        return false;
      }

      // Check if selected trait is incompatible with candidate
      if (selectedIncompatible.includes(candidateName)) {
        return false;
      }

      return true;
    });

    if (isCompatible) {
      selected.push(candidateTrait);
    }
  }

  // If we couldn't find enough compatible traits, just fill with what we have
  if (selected.length < count) {
    console.warn(`Could only find ${selected.length} compatible personality traits out of ${count} requested`);
  }

  return selected;
};

// Generate random personality and physical traits
export const generateRandomTraits = () => {
  const personalityTraitsData = loadJsonData('data/random/traits/personality_traits.json');
  const physicalTraitsData = loadJsonData('data/random/traits/physical_traits.json');

  const personalityTraits = personalityTraitsData?.traits || [];
  const physicalTraits = physicalTraitsData?.traits || [];

  // Select 3 compatible random personality traits
  const selectedPersonalityTraits = getCompatiblePersonalityTraits(personalityTraits, 3);

  console.log('=== RANDOM PERSONALITY TRAITS ===');
  selectedPersonalityTraits.forEach((trait, index) => {
    const traitName = trait.positive || trait.negative || trait.neutral;
    console.log(`  ${index + 1}. ${traitName} (data: "${trait.data || 'none'}")`);
  });

  // Select 2 random physical traits (no compatibility check needed)
  const selectedPhysicalTraits = getRandomTraits(physicalTraits, 2);

  console.log('=== RANDOM PHYSICAL TRAITS ===');
  selectedPhysicalTraits.forEach((trait, index) => {
    console.log(`  ${index + 1}. ${trait.name} (data: "${trait.data || 'none'}")`);
  });

  // Format traits for character data
  const formattedTraits = [
    ...selectedPersonalityTraits.map(trait => {
      const traitName = trait.positive || trait.negative || trait.neutral;
      return {
        name: traitName,
        description: trait.description,
        data: trait.data || '',
        source: 'random',
        category: 'personality'
      };
    }),
    ...selectedPhysicalTraits.map(trait => ({
      name: trait.name,
      description: trait.description,
      data: trait.data || '',
      source: 'random',
      category: 'physical'
    }))
  ];

  return formattedTraits;
};

// Generate random ancestry option selections
const generateAncestryOptions = (ancestry) => {
  const selectedOptions = [];

  console.log('\n=== ANCESTRY OPTIONS ===');

  if (!ancestry.options || ancestry.options.length === 0) {
    console.log('  No options to select');
    return selectedOptions;
  }

  for (const option of ancestry.options) {
    // Check if this option has subchoices that require selection
    if (option.subchoices && option.subchoices.length > 0 && option.requiresChoice) {
      // Randomly select one subchoice
      const selectedSubchoice = getRandomElement(option.subchoices);

      selectedOptions.push({
        name: option.name,
        selectedSubchoice: selectedSubchoice.name
      });

      console.log(`  ${option.name}: ${selectedSubchoice.name}`);
    } else {
      // No subchoices, just select the option itself
      selectedOptions.push({
        name: option.name,
        selectedSubchoice: null
      });

      console.log(`  ${option.name}`);
    }
  }

  return selectedOptions;
};

// Generate physical characteristics with trait modifiers
const generatePhysicalCharacteristics = (ancestry, physicalTraits, ancestryOptions) => {
  // Parse ancestry height range (format: "150-190")
  const heightRange = ancestry.height || "150-190";
  let [minHeight, maxHeight] = heightRange.split('-').map(Number);

  // Check if ancestry has a size selection that affects height range
  // (e.g., Stout-Folk can be Small or Medium)
  if (ancestryOptions && ancestryOptions.length > 0) {
    for (const option of ancestryOptions) {
      if (option.selectedSubchoice) {
        if (option.selectedSubchoice === 'Small') {
          // Small size: use lower 60% of height range
          const range = maxHeight - minHeight;
          maxHeight = minHeight + Math.floor(range * 0.6);
        } else if (option.selectedSubchoice === 'Medium' && option.name === 'Variable Size') {
          // Medium size from Variable Size option: use upper 60% of height range
          const range = maxHeight - minHeight;
          minHeight = minHeight + Math.floor(range * 0.4);
        }
      }
    }
  }

  // Generate base height within (possibly adjusted) ancestry range
  let baseHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

  // Check for size-modifying physical traits
  const sizeTraits = {
    'Giant': { min: 1.25, max: 1.4 },      // +25-40%
    'Small': { min: 0.70, max: 0.80 },     // -30-20%
    'Tall': { min: 1.08, max: 1.12 },      // +8-12%
    'Short': { min: 0.88, max: 0.92 },     // -12-8%
    'Runt': { min: 0.80, max: 0.88 },      // -20-12%
    'One Legged': { min: 0.95, max: 0.98 }  // Slightly shorter due to prosthetic/injury
  };

  let heightModifier = 1.0;
  let modifierTraitName = null;

  // Apply the first size-modifying trait found
  for (const trait of physicalTraits) {
    if (sizeTraits[trait.name]) {
      const range = sizeTraits[trait.name];
      heightModifier = range.min + Math.random() * (range.max - range.min);
      modifierTraitName = trait.name;
      break;
    }
  }

  // Apply modifier
  const finalHeight = Math.round(baseHeight * heightModifier);

  // Generate gender
  const genders = ['Male', 'Female', 'Non-binary'];
  const gender = genders[Math.floor(Math.random() * genders.length)];

  // Generate weight based on height and ancestry build
  // Base formula: roughly 0.5-1.0 kg per cm of height depending on build
  const buildFactors = {
    'Gnome': 0.35,       // Light build
    'Goblin': 0.40,      // Wiry build
    'Kobold': 0.30,      // Very light
    'Gloxy': 0.45,       // Slender
    'Elf': 0.50,         // Lean build
    'Human': 0.65,       // Average build
    'Stout-Folk': 0.80,  // Stocky build
    'Orc': 0.85,         // Muscular build
    'Gnoll': 0.75,       // Lean but tall
    'Lizardfolk': 0.70,  // Reptilian build
    'Dragonkind': 0.75,  // Scaled build
    'Minotaur': 1.00,    // Very heavy build
    'Half-Giant': 1.10,  // Massive build
    'Tidewalker': 0.60,  // Aquatic build
    'Orycotal': 0.55,    // Rabbit-like
    'Vethi': 0.60,       // Cat-like
    'Arah-Ka': 0.65      // Desert elf
  };

  let buildFactor = buildFactors[ancestry.name] || 0.65;

  // Adjust build factor based on physical traits
  const buildTraits = {
    'Muscular': 1.15,
    'Strong': 1.10,
    'Gaunt': 0.75,
    'Frail': 0.70,
    'Hardy': 1.08,
    'Sickly': 0.85,
    'Thick': 1.25,
    'Physically Fit': 1.05,
    'Dumb Brute': 1.20,
    'Decrepit': 0.65,
    'One Armed': 0.95,
    'One Legged': 0.92
  };

  for (const trait of physicalTraits) {
    if (buildTraits[trait.name]) {
      buildFactor *= buildTraits[trait.name];
    }
  }

  const baseWeight = finalHeight * buildFactor;
  const weightVariation = baseWeight * 0.15; // ±15% variation
  const finalWeight = Math.round(baseWeight + (Math.random() * 2 - 1) * weightVariation);

  // Convert to imperial units
  const totalInches = Math.round(finalHeight / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  const heightImperial = `${feet}'${inches}"`;
  const heightDisplay = `${heightImperial} (${finalHeight} cm)`;

  const pounds = Math.round(finalWeight * 2.20462);
  const weightDisplay = `${pounds} lbs (${finalWeight} kg)`;

  // Get ancestry size category (normalize to proper case)
  let size = ancestry.size || 'Medium';
  // Remove any numbers and normalize case
  size = size.replace(/\d+/g, '').trim();
  if (!size) size = 'Medium';

  console.log('\n=== PHYSICAL CHARACTERISTICS ===');
  console.log(`  Gender: ${gender}`);
  console.log(`  Height: ${heightDisplay} (base: ${baseHeight} cm${modifierTraitName ? `, ${modifierTraitName}: x${heightModifier.toFixed(2)}` : ''})`);
  console.log(`  Weight: ${weightDisplay}`);
  console.log(`  Size: ${size}`);

  return {
    gender,
    height: heightDisplay,
    weight: weightDisplay,
    size: size,
    eyes: '',
    hair: '',
    skin: ''
  };
};

// Generate complete random character data
export const generateRandomCharacterData = async () => {
  try {
    console.log('\n========================================');
    console.log('🎲 GENERATING RANDOM CHARACTER');
    console.log('========================================\n');

    // Get random ancestry
    const ancestries = await Ancestry.find({});
    if (ancestries.length === 0) {
      throw new Error('No ancestries found in database');
    }
    const randomAncestry = getRandomElement(ancestries);
    console.log(`📜 ANCESTRY: ${randomAncestry.name}`);

    // Get random culture
    const cultures = await Culture.find({});
    if (cultures.length === 0) {
      throw new Error('No cultures found in database');
    }
    const randomCulture = getRandomElement(cultures);

    // Select culture options
    const selectedRestriction = randomCulture.culturalRestrictions && randomCulture.culturalRestrictions.length > 0
      ? getRandomElement(randomCulture.culturalRestrictions)
      : null;
    const selectedBenefit = randomCulture.benefits && randomCulture.benefits.length > 0
      ? getRandomElement(randomCulture.benefits)
      : null;
    const selectedStartingItem = randomCulture.startingItems && randomCulture.startingItems.length > 0
      ? getRandomElement(randomCulture.startingItems)
      : null;

    console.log(`🏛️  CULTURE: ${randomCulture.name}`);
    if (selectedRestriction) {
      console.log(`   Restriction: ${selectedRestriction.name}`);
    }
    if (selectedBenefit) {
      console.log(`   Benefit: ${selectedBenefit.name}`);
    }
    if (selectedStartingItem) {
      console.log(`   Starting Item: ${selectedStartingItem.name}`);
    }

    // Generate random name
    const name = await generateRandomName(randomAncestry);
    console.log(`✨ NAME: ${name}\n`);

    // Generate background
    const background = generateRandomBackground();
    console.log('=== BACKGROUND ELEMENTS ===');
    if (background.birth) {
      console.log(`  Birth: ${background.birth.name} (data: "${background.birth.data || 'none'}")`);
    }
    if (background.childhood) {
      console.log(`  Childhood: ${background.childhood.name} (data: "${background.childhood.data || 'none'}")`);
    }
    if (background.occupation) {
      console.log(`  Occupation: ${background.occupation.name} (data: "${background.occupation.data || 'none'}")`);
    }
    if (background.origin) {
      console.log(`  Origin: ${background.origin.name} (data: "${background.origin.data || 'none'}")`);
    }
    if (background.traits && background.traits.length > 0) {
      background.traits.forEach((trait, index) => {
        const traitKey = trait.positive || trait.negative || trait.neutral;
        console.log(`  Personality ${index + 1}: ${traitKey} (data: "${trait.data || 'none'}")`);
      });
    }
    if (background.quirks && background.quirks.length > 0) {
      background.quirks.forEach((quirk, index) => {
        console.log(`  Quirk ${index + 1}: ${quirk.text} [${quirk.category}]`);
      });
    }
    console.log('');

    // Generate random age based on ancestry
    const ageData = generateRandomAge(randomAncestry.name);
    console.log(`🎂 AGE: ${ageData.age} (${ageData.ageGroup})`);
    if (ageData.ageTrait) {
      console.log(`   Age Effects: ${ageData.ageTrait.data}\n`);
    }

    // Generate random attributes (6 points like normal character creation)
    const attributes = generateRandomAttributes();
    console.log('=== ATTRIBUTES ===');
    console.log(`  Physique: ${attributes.physique}`);
    console.log(`  Finesse: ${attributes.finesse}`);
    console.log(`  Mind: ${attributes.mind}`);
    console.log(`  Knowledge: ${attributes.knowledge}`);
    console.log(`  Social: ${attributes.social}\n`);

    // Collect all background elements for module aggregation
    const backgroundElements = [
      background.birth,
      background.childhood,
      background.occupation,
      background.origin,
      ...background.traits
    ].filter(Boolean);

    // Aggregate modules from background elements
    const characterModules = await aggregateAndAssignModules(backgroundElements);

    console.log('=== MODULES FROM BACKGROUND ===');
    if (characterModules.length === 0) {
      console.log('  No modules awarded from background\n');
    } else {
      characterModules.forEach(mod => {
        const optionList = mod.selectedOptions.map(opt => `${opt.location}: ${opt.name}`).join(', ');
        console.log(`  Module: ${mod.moduleId}`);
        console.log(`    Selected: ${optionList}`);
      });
      console.log('');
    }

    // Generate random personality and physical traits
    const randomTraits = generateRandomTraits();

    // Extract physical traits for height/weight calculation
    const physicalTraitsOnly = randomTraits.filter(t => t.category === 'physical');

    // Generate ancestry options (including subchoices like half-races)
    const ancestryOptions = generateAncestryOptions(randomAncestry);

    // Generate physical characteristics with trait modifiers
    // (pass ancestryOptions so size selections like Small/Medium affect height)
    const physicalCharacteristics = generatePhysicalCharacteristics(randomAncestry, physicalTraitsOnly, ancestryOptions);

    // Build character data object
    const characterData = {
      name,
      age: ageData.age,
      appearance: `A ${ageData.ageGroup.toLowerCase()} ${randomAncestry.name} adventurer.`,
      background: background.text,
      personality: '',
      goals: '',

      // Ancestry
      ancestry: {
        ancestryId: randomAncestry._id,
        selectedOptions: ancestryOptions
      },

      // Culture - use pre-selected options
      characterCulture: {
        cultureId: randomCulture._id,
        selectedRestriction,
        selectedBenefit,
        selectedStartingItem
      },

      // Attributes (6 points distributed like normal character creation)
      attributes: {
        physique: attributes.physique,
        finesse: attributes.finesse,
        mind: attributes.mind,
        knowledge: attributes.knowledge,
        social: attributes.social
      },

      // Modules from background aggregation
      modules: characterModules,

      // Traits will be stored separately for now since they don't have database IDs
      // The character creation will handle saving these as custom traits
      // We'll return them in a separate field for the controller to process
      _pendingTraits: [
        ...background.backgroundTraits.map(trait => {
          // Remove prefix from name (e.g., "Birth: Summer Blessed" -> "Summer Blessed")
          const cleanName = trait.name.replace(/^(Birth|Background|Personality):\s*/, '');
          return {
            name: cleanName,
            description: trait.description,
            data: trait.data,
            source: 'background',
            category: trait.type
          };
        }),
        // Add age trait if it exists
        ...(ageData.ageTrait ? [{
          name: ageData.ageTrait.name.replace(/^Age:\s*/, ''),
          description: ageData.ageTrait.description,
          data: ageData.ageTrait.data,
          source: 'background',
          category: ageData.ageTrait.type
        }] : []),
        // Add random personality and physical traits
        ...randomTraits
      ],

      // Resources (defaults)
      resources: {
        health: { current: 20, max: 20 },
        resolve: { current: 20, max: 20 },
        morale: { current: 10, max: 10 },
        energy: { current: 5, max: 5 }
      },

      // Starting wealth
      wealth: {
        gold: Math.floor(Math.random() * 50),
        silver: Math.floor(Math.random() * 100),
        copper: Math.floor(Math.random() * 100)
      },

      // Other defaults
      movement: 5,
      spellSlots: 10,
      languageSkills: new Map([['common', 2]]),
      physicalTraits: physicalCharacteristics,
      gender: physicalCharacteristics.gender
    };

    console.log('=== SUMMARY ===');
    console.log(`  Total Traits: ${characterData._pendingTraits.length}`);
    console.log(`  Total Modules: ${characterData.modules.length}`);
    console.log(`  Starting Wealth: ${characterData.wealth.gold}g ${characterData.wealth.silver}s ${characterData.wealth.copper}c`);
    console.log('\n✅ Character generation complete!');
    console.log('========================================\n');

    return characterData;
  } catch (error) {
    console.error('Error generating random character:', error);
    throw error;
  }
};

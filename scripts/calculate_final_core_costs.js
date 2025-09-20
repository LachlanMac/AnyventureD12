import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== FINAL CORE COST ANALYSIS ===\n');

// Current gem prices after all our changes
const currentGemPrices = {
    // Lesser core gems (our new balanced prices)
    'Garnet': 500,        // Heat
    'Citrine': 500,       // Electric  
    'Aquamarine': 500,    // Cold
    'Shadow Onyx': 700,   // Dark
    'Moonstone': 700,     // Aetheric
    'Amethyst': 600,      // Psychic
    'Pearl': 600,         // Divine (using pearl as cheaper alternative)
    
    // Greater core gems (our balanced prices)
    'Ruby': 5000,         // Heat
    'Storm Topaz': 5000,  // Electric
    'Frost Sapphire': 5000, // Cold
    'Black Diamond': 10000, // Dark
    'Spirit Moonstone': 6500, // Aetheric 
    'Void Amethyst': 6500,   // Psychic
    'Diamond': 10000         // Divine
};

// Metal costs
const electrumShavings = 50;  // Used in Lesser cores
const platinumShavings = 500; // Used in Greater cores

console.log('=== UPDATED GEM PRICES ===\n');
Object.entries(currentGemPrices).forEach(([gem, price]) => {
    console.log(`${gem}: ${price}s`);
});

console.log('\n=== LESSER CORE COSTS ===\n');

const lesserCores = [
    { name: 'Lesser Heat Core', gem: 'Garnet' },
    { name: 'Lesser Electric Core', gem: 'Citrine' },
    { name: 'Lesser Cold Core', gem: 'Aquamarine' },
    { name: 'Lesser Dark Core', gem: 'Shadow Onyx' },
    { name: 'Lesser Aetheric Core', gem: 'Moonstone' },
    { name: 'Lesser Psychic Core', gem: 'Amethyst' },
    { name: 'Lesser Divine Core', gem: 'Pearl' }
];

console.log('Core Type | Gem | Ingredient Cost | 20% Markup | Rounded to 50s');
console.log('-'.repeat(70));

lesserCores.forEach(({ name, gem }) => {
    const gemCost = currentGemPrices[gem];
    const ingredientCost = gemCost + electrumShavings;
    const withMarkup = ingredientCost * 1.2;
    const roundedValue = Math.round(withMarkup / 50) * 50;
    
    console.log(`${name} | ${gem} | ${ingredientCost}s | ${withMarkup.toFixed(0)}s | ${roundedValue}s`);
});

console.log('\n=== GREATER CORE COSTS ===\n');

const greaterCores = [
    { name: 'Greater Heat Core', gem: 'Ruby' },
    { name: 'Greater Electric Core', gem: 'Storm Topaz' },
    { name: 'Greater Cold Core', gem: 'Frost Sapphire' },
    { name: 'Greater Dark Core', gem: 'Black Diamond' },
    { name: 'Greater Aetheric Core', gem: 'Spirit Moonstone' },
    { name: 'Greater Psychic Core', gem: 'Void Amethyst' },
    { name: 'Greater Divine Core', gem: 'Diamond' }
];

console.log('Core Type | Gem | Ingredient Cost | 20% Markup | Rounded to 50s');
console.log('-'.repeat(70));

greaterCores.forEach(({ name, gem }) => {
    const gemCost = currentGemPrices[gem];
    const ingredientCost = gemCost + platinumShavings;
    const withMarkup = ingredientCost * 1.2;
    const roundedValue = Math.round(withMarkup / 50) * 50;
    
    console.log(`${name} | ${gem} | ${ingredientCost}s | ${withMarkup.toFixed(0)}s | ${roundedValue}s`);
});

console.log('\n=== SUMMARY ===\n');

// Calculate ranges
const lesserValues = lesserCores.map(({ gem }) => {
    const ingredientCost = currentGemPrices[gem] + electrumShavings;
    const withMarkup = ingredientCost * 1.2;
    return Math.round(withMarkup / 50) * 50;
});

const greaterValues = greaterCores.map(({ gem }) => {
    const ingredientCost = currentGemPrices[gem] + platinumShavings;
    const withMarkup = ingredientCost * 1.2;
    return Math.round(withMarkup / 50) * 50;
});

const lesserRange = { min: Math.min(...lesserValues), max: Math.max(...lesserValues) };
const greaterRange = { min: Math.min(...greaterValues), max: Math.max(...greaterValues) };

console.log(`Lesser Core Values: ${lesserRange.min}s - ${lesserRange.max}s`);
console.log(`Greater Core Values: ${greaterRange.min}s - ${greaterRange.max}s`);
console.log(`\nLesser Core Range: ${lesserRange.max - lesserRange.min}s spread`);
console.log(`Greater Core Range: ${greaterRange.max - greaterRange.min}s spread`);

// Show profit margins
console.log('\n=== PROFIT ANALYSIS ===\n');
console.log('All cores now have exactly 20% profit margin over ingredient costs');
console.log('Values are rounded to nearest 50s for clean pricing');
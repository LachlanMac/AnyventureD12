import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the audit files
const itemAuditPath = path.join(__dirname, '..', 'item_audit.json');
const recipeAuditPath = path.join(__dirname, '..', 'recipe_audit.json');

const itemAudit = JSON.parse(fs.readFileSync(itemAuditPath, 'utf8'));
const recipeAudit = JSON.parse(fs.readFileSync(recipeAuditPath, 'utf8'));

// Create a map of item names to values for quick lookup
const itemValueMap = {};
itemAudit.forEach(item => {
    if (item.value !== 'NO VALUE' && typeof item.value === 'number') {
        itemValueMap[item.name.toLowerCase().trim()] = item.value;
    }
});

console.log('=== CORE PRICING ANALYSIS ===\n');

// Find all cores from the audit
const cores = itemAudit.filter(item => 
    item.name.toLowerCase().includes('core') && 
    (item.name.includes('Greater') || item.name.includes('Lesser'))
);

// Group by type
const coreTypes = {};
cores.forEach(core => {
    const type = core.name.replace('Greater ', '').replace('Lesser ', '');
    if (!coreTypes[type]) {
        coreTypes[type] = { lesser: null, greater: null };
    }
    if (core.name.includes('Lesser')) {
        coreTypes[type].lesser = core;
    } else {
        coreTypes[type].greater = core;
    }
});

// Get gem prices
console.log('=== GEM PRICES ===');
const gems = [
    'Ruby', 'Frost Sapphire', 'Storm Topaz', 'Spirit Moonstone', 
    'Shadow Onyx', 'Black Diamond', 'Diamond', 'Void Amethyst'
];

const gemPrices = {};
gems.forEach(gem => {
    const gemPrice = itemValueMap[gem.toLowerCase()];
    gemPrices[gem] = gemPrice;
    console.log(`${gem}: ${gemPrice || 'NOT FOUND'}s`);
});

// Metal prices
const electrumPrice = itemValueMap['electrum shavings'] || 0;
const platinumPrice = itemValueMap['platinum shavings'] || 0;

console.log(`\nElectrum Shavings: ${electrumPrice}s`);
console.log(`Platinum Shavings: ${platinumPrice}s`);

console.log('\n=== CORE PRICING BREAKDOWN ===\n');

Object.entries(coreTypes).forEach(([type, data]) => {
    console.log(`${type.toUpperCase()} CORES:`);
    
    if (data.lesser) {
        const lesserRecipe = recipeAudit.find(r => r.name === data.lesser.name);
        let lesserCost = 'Unknown';
        if (lesserRecipe && lesserRecipe.ingredients) {
            const gemName = lesserRecipe.ingredients[0];
            const gemCost = gemPrices[gemName] || 0;
            lesserCost = gemCost + electrumPrice;
        }
        console.log(`  Lesser: ${data.lesser.value}s (ingredients cost: ${lesserCost}s)`);
    }
    
    if (data.greater) {
        const greaterRecipe = recipeAudit.find(r => r.name === data.greater.name);
        let greaterCost = 'Unknown';
        if (greaterRecipe && greaterRecipe.ingredients) {
            const gemName = greaterRecipe.ingredients[0];
            const gemCost = gemPrices[gemName] || 0;
            greaterCost = gemCost + platinumPrice;
        }
        console.log(`  Greater: ${data.greater.value}s (ingredients cost: ${greaterCost}s)`);
        
        if (typeof greaterCost === 'number' && data.greater.value < greaterCost) {
            const loss = greaterCost - data.greater.value;
            const lossPercent = ((loss / greaterCost) * 100).toFixed(1);
            console.log(`    ❌ LOSING ${loss}s (${lossPercent}% loss)`);
        }
    }
    console.log('');
});

console.log('=== PRICING INCONSISTENCIES ===\n');

// Find the most expensive and cheapest greater cores
const greaterCores = cores.filter(c => c.name.includes('Greater'));
greaterCores.sort((a, b) => b.value - a.value);

console.log('Greater Core Values (highest to lowest):');
greaterCores.forEach(core => {
    console.log(`  ${core.name}: ${core.value}s`);
});

const highest = greaterCores[0];
const lowest = greaterCores[greaterCores.length - 1];
const variance = highest.value - lowest.value;
const percentDiff = ((variance / lowest.value) * 100).toFixed(1);

console.log(`\nPrice Variance: ${variance}s (${percentDiff}% difference between highest and lowest)`);

console.log('\n=== RECOMMENDATIONS ===\n');

console.log('PROBLEM: Greater cores are priced based on their gem ingredients, but:');
console.log('- Black Diamond (20,000s) makes Greater Dark Core extremely expensive');
console.log('- Regular Diamond (10,000s) makes Greater Divine Core expensive');
console.log('- Other gems are much cheaper (700-1,000s range)');
console.log('');

console.log('SOLUTIONS:');
console.log('1. CREATE NEW GEMS: Add mid-tier gems (2,000-4,000s) for all cores');
console.log('2. REDUCE GEM COSTS: Lower Black Diamond and Diamond prices');
console.log('3. STANDARDIZE CORES: Set all Greater cores to similar price regardless of gem');
console.log('4. TIERED SYSTEM: Accept price variance but ensure cores are profitable to craft');

// Calculate what gems should cost to make cores profitable
console.log('\n=== SUGGESTED GEM PRICE ADJUSTMENTS ===\n');

const targetGreaterCorePrice = 1200; // Reasonable target
const targetProfitMargin = 0.2; // 20% profit
const maxGemCost = (targetGreaterCorePrice / (1 + targetProfitMargin)) - platinumPrice;

console.log(`If we target Greater cores at ${targetGreaterCorePrice}s with 20% profit margin:`);
console.log(`Maximum gem cost should be: ${Math.floor(maxGemCost)}s`);
console.log('');
console.log('Current gems that exceed this:');
gems.forEach(gem => {
    const price = gemPrices[gem];
    if (price && price > maxGemCost) {
        console.log(`  ${gem}: ${price}s (should be ≤ ${Math.floor(maxGemCost)}s)`);
    }
});
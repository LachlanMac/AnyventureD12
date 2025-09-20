import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the audit files
const itemAuditPath = path.join(__dirname, '..', 'item_audit.json');
const itemAudit = JSON.parse(fs.readFileSync(itemAuditPath, 'utf8'));

// Create a map of item names to values for quick lookup
const itemValueMap = {};
itemAudit.forEach(item => {
    if (item.value !== 'NO VALUE' && typeof item.value === 'number') {
        itemValueMap[item.name.toLowerCase().trim()] = item.value;
    }
});

console.log('=== LESSER CORE GEM ANALYSIS ===\n');

// Based on the core file, Lesser cores use these gems:
const lesserCoreGems = [
    { core: 'Heat', gem: 'Ruby' },
    { core: 'Cold', gem: 'Frost Sapphire' }, 
    { core: 'Electric', gem: 'Storm Topaz' },
    { core: 'Aetheric', gem: 'Spirit Moonstone' },
    { core: 'Dark', gem: 'Shadow Onyx' },
    { core: 'Divine', gem: 'Diamond' },
    { core: 'Psychic', gem: 'Void Amethyst' }
];

// Get electrum shavings price (used in all Lesser cores)
const electrumPrice = itemValueMap['electrum shavings'] || 0;
console.log(`Electrum Shavings (used in all Lesser cores): ${electrumPrice}s\n`);

console.log('=== LESSER CORE GEMS (sorted by price) ===\n');

// Get gem prices and calculate total ingredient costs
const gemData = lesserCoreGems.map(({ core, gem }) => {
    const gemPrice = itemValueMap[gem.toLowerCase()] || 'NOT FOUND';
    const totalIngredientCost = typeof gemPrice === 'number' ? gemPrice + electrumPrice : 'Unknown';
    
    return {
        core,
        gem,
        gemPrice,
        totalIngredientCost
    };
});

// Sort by gem price
gemData.sort((a, b) => {
    if (typeof a.gemPrice === 'number' && typeof b.gemPrice === 'number') {
        return a.gemPrice - b.gemPrice;
    }
    return 0;
});

// Display results
gemData.forEach(({ core, gem, gemPrice, totalIngredientCost }) => {
    console.log(`${core.toUpperCase()} CORE : ${gem} : ${gemPrice}s (Total ingredient cost: ${totalIngredientCost}s)`);
});

console.log('\n=== LESSER CORE VALUES vs INGREDIENT COSTS ===\n');

// Get Lesser core values from our data
const lesserCores = itemAudit.filter(item => 
    item.name.toLowerCase().includes('lesser') && 
    item.name.toLowerCase().includes('core')
);

lesserCores.forEach(core => {
    const coreType = core.name.replace('Lesser ', '').replace(' Core', '');
    const gemInfo = gemData.find(g => g.core.toLowerCase() === coreType.toLowerCase());
    
    if (gemInfo && typeof gemInfo.totalIngredientCost === 'number') {
        const profit = core.value - gemInfo.totalIngredientCost;
        const profitPercent = ((profit / gemInfo.totalIngredientCost) * 100).toFixed(1);
        const profitStatus = profit < 0 ? '❌ LOSS' : profit < gemInfo.totalIngredientCost * 0.2 ? '⚠️ LOW PROFIT' : '✅ PROFITABLE';
        
        console.log(`${core.name}: ${core.value}s`);
        console.log(`  Ingredients cost: ${gemInfo.totalIngredientCost}s (${gemInfo.gem} + Electrum)`);
        console.log(`  Profit: ${profit}s (${profitPercent}%) ${profitStatus}`);
        console.log('');
    }
});

// Summary statistics
console.log('=== SUMMARY ===\n');
const priceRange = {
    min: Math.min(...gemData.filter(g => typeof g.gemPrice === 'number').map(g => g.gemPrice)),
    max: Math.max(...gemData.filter(g => typeof g.gemPrice === 'number').map(g => g.gemPrice))
};

const variance = priceRange.max - priceRange.min;
const percentDiff = ((variance / priceRange.min) * 100).toFixed(1);

console.log(`Lesser core gem price range: ${priceRange.min}s to ${priceRange.max}s`);
console.log(`Price variance: ${variance}s (${percentDiff}% difference)`);
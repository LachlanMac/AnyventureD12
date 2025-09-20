import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the audit files
const itemAuditPath = path.join(__dirname, '..', 'item_audit.json');
const itemAudit = JSON.parse(fs.readFileSync(itemAuditPath, 'utf8'));

console.log('=== GEMS IN 2000-5000s PRICE RANGE ===\n');

// Find all gems in the target price range
const gemsInRange = itemAudit
    .filter(item => 
        item.category === 'goods/gemstones' && 
        typeof item.value === 'number' && 
        item.value >= 2000 && 
        item.value <= 5000
    )
    .sort((a, b) => a.value - b.value);

console.log('Available gems sorted by price:\n');
gemsInRange.forEach(gem => {
    console.log(`${gem.name} : ${gem.value}s`);
});

console.log('\n=== PROPOSED LESSER CORE GEM MAPPING ===\n');

// Current Lesser core types and their themes
const coreTypes = [
    { core: 'Heat', theme: 'fire/thermal', currentGem: 'Ruby' },
    { core: 'Cold', theme: 'ice/frost', currentGem: 'Frost Sapphire' },
    { core: 'Electric', theme: 'lightning/storm', currentGem: 'Storm Topaz' },
    { core: 'Dark', theme: 'shadow/void', currentGem: 'Shadow Onyx' },
    { core: 'Aetheric', theme: 'mystical/spiritual', currentGem: 'Spirit Moonstone' },
    { core: 'Divine', theme: 'holy/radiant', currentGem: 'Diamond' },
    { core: 'Psychic', theme: 'mental/mind', currentGem: 'Void Amethyst' }
];

// Try to map suitable gems based on names and themes
const gemMapping = [];

coreTypes.forEach(({ core, theme, currentGem }) => {
    // Look for gems that might thematically match
    const suitableGems = gemsInRange.filter(gem => {
        const name = gem.name.toLowerCase();
        
        switch(core.toLowerCase()) {
            case 'heat':
                return name.includes('garnet') || name.includes('carnelian') || name.includes('amber') || name.includes('fire');
            case 'cold':
                return name.includes('aquamarine') || name.includes('moonstone') || name.includes('pearl') || name.includes('ice');
            case 'electric':
                return name.includes('topaz') || name.includes('citrine') || name.includes('amber');
            case 'dark':
                return name.includes('onyx') || name.includes('obsidian') || name.includes('hematite') || name.includes('shadow');
            case 'aetheric':
                return name.includes('moonstone') || name.includes('opal') || name.includes('quartz');
            case 'divine':
                return name.includes('pearl') || name.includes('moonstone') || name.includes('quartz');
            case 'psychic':
                return name.includes('amethyst') || name.includes('lapis') || name.includes('opal');
            default:
                return false;
        }
    });
    
    gemMapping.push({
        core,
        theme,
        currentGem,
        suitableAlternatives: suitableGems,
        bestAlternative: suitableGems[0] || null
    });
});

// Display the mapping
gemMapping.forEach(({ core, currentGem, suitableAlternatives, bestAlternative }) => {
    console.log(`${core.toUpperCase()} CORE:`);
    console.log(`  Current: ${currentGem}`);
    console.log(`  Alternatives in range:`);
    
    if (suitableAlternatives.length > 0) {
        suitableAlternatives.forEach(gem => {
            console.log(`    ${gem.name} : ${gem.value}s`);
        });
    } else {
        console.log(`    No thematically suitable gems found in range`);
    }
    
    if (bestAlternative) {
        const newIngredientCost = bestAlternative.value + 50; // +50 for electrum shavings
        console.log(`  RECOMMENDED: ${bestAlternative.name} (${newIngredientCost}s total ingredient cost)`);
    }
    console.log('');
});

console.log('\n=== COST COMPARISON ===\n');

// Show cost savings
gemMapping.forEach(({ core, bestAlternative }) => {
    if (bestAlternative) {
        const newCost = bestAlternative.value + 50;
        console.log(`${core}: ${bestAlternative.name} = ${newCost}s ingredient cost`);
    }
});

console.log('\nWith these changes, Lesser cores would need to be priced around:');
console.log('- For 20% profit margin: ~1,800-3,600s per core');
console.log('- For reasonable profit: ~1,200-2,400s per core');
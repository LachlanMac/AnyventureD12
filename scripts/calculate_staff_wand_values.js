import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== STAFF & WAND VALUE CALCULATION ===\n');

// Updated Lesser core values (from our recent changes)
const lesserCoreValues = {
    'Heat Core': 650,         // Lesser Heat Core
    'Cold Core': 650,         // Lesser Cold Core  
    'Electric Core': 650,     // Lesser Electric Core
    'Dark Core': 900,         // Lesser Dark Core
    'Aetheric Core': 900,     // Lesser Aetheric Core
    'Psychic Core': 800,      // Lesser Psychic Core
    'Divine Core': 800        // Lesser Divine Core
};

// Base ingredient costs
const ashWoodCost = 15;       // From ash_wood.json
const bindingsCost = 15;      // From bindings.json

console.log('=== INGREDIENT COSTS ===\n');
console.log('Ash Wood: 15s');
console.log('Bindings: 15s');
console.log('\nLesser Core Values:');
Object.entries(lesserCoreValues).forEach(([core, value]) => {
    console.log(`${core}: ${value}s`);
});

console.log('\n=== STAFF CALCULATIONS ===\n');
console.log('Core Type | Core Cost | Base Ingredients | Total Cost | 20% Markup | Rounded');
console.log('-'.repeat(80));

const staffCalculations = {};
Object.entries(lesserCoreValues).forEach(([core, coreValue]) => {
    const baseIngredients = ashWoodCost + bindingsCost; // 30s
    const totalCost = coreValue + baseIngredients;
    const withMarkup = totalCost * 1.2;
    const roundedValue = Math.round(withMarkup / 50) * 50;
    
    staffCalculations[core] = roundedValue;
    console.log(`${core} | ${coreValue}s | ${baseIngredients}s | ${totalCost}s | ${withMarkup.toFixed(0)}s | ${roundedValue}s`);
});

console.log('\n=== WAND CALCULATIONS ===\n');
console.log('Core Type | Core Cost | Base Ingredients | Total Cost | 20% Markup | Rounded');
console.log('-'.repeat(80));

const wandCalculations = {};
Object.entries(lesserCoreValues).forEach(([core, coreValue]) => {
    const baseIngredients = ashWoodCost + bindingsCost; // 30s
    const totalCost = coreValue + baseIngredients;
    const withMarkup = totalCost * 1.2;
    const roundedValue = Math.round(withMarkup / 50) * 50;
    
    wandCalculations[core] = roundedValue;
    console.log(`${core} | ${coreValue}s | ${baseIngredients}s | ${totalCost}s | ${withMarkup.toFixed(0)}s | ${roundedValue}s`);
});

console.log('\n=== SUMMARY ===\n');

const staffValues = Object.values(staffCalculations);
const wandValues = Object.values(wandCalculations);

console.log(`Staff Values: ${Math.min(...staffValues)}s - ${Math.max(...staffValues)}s`);
console.log(`Wand Values: ${Math.min(...wandValues)}s - ${Math.max(...wandValues)}s`);

// Export the mappings for updating files
console.log('\n=== CORE TO VALUE MAPPING ===\n');
console.log('Staff/Wand values (both use same calculation):');
Object.entries(staffCalculations).forEach(([core, value]) => {
    console.log(`${core}: ${value}s`);
});
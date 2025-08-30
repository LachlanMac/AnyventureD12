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
        // Normalize the name for better matching
        const normalizedName = item.name.toLowerCase().trim();
        itemValueMap[normalizedName] = item.value;
        
        // Also store without 's' at the end for plurals
        if (normalizedName.endsWith('s')) {
            itemValueMap[normalizedName.slice(0, -1)] = item.value;
        }
    }
});

console.log('=== PRICING ANALYSIS REPORT ===\n');

// 1. Find items with extremely low or high values
console.log('=== EXTREME VALUES ===\n');
const extremeItems = itemAudit
    .filter(item => typeof item.value === 'number')
    .sort((a, b) => a.value - b.value);

console.log('LOWEST VALUE ITEMS (< 10 silver):');
extremeItems
    .filter(item => item.value < 10 && item.value > 0)
    .slice(0, 10)
    .forEach(item => {
        console.log(`  ${item.value}s - ${item.name} (${item.category})`);
    });

console.log('\nHIGHEST VALUE ITEMS (> 10,000 silver):');
extremeItems
    .filter(item => item.value > 10000)
    .forEach(item => {
        console.log(`  ${item.value}s - ${item.name} (${item.category})`);
    });

// 2. Analyze recipes where we can calculate ingredient costs
console.log('\n\n=== RECIPE VALUE ANALYSIS ===\n');
console.log('Items where recipe ingredients can be valued:\n');

const recipeAnalysis = [];

recipeAudit.forEach(recipe => {
    if (!recipe.ingredients || recipe.value === 'NO VALUE') return;
    
    let totalIngredientCost = 0;
    let unknownIngredients = [];
    let knownIngredients = [];
    
    recipe.ingredients.forEach(ingredient => {
        let ingredientName = ingredient;
        let quantity = 1;
        
        // Parse quantity from strings like "2x Iron Ingot"
        if (typeof ingredient === 'string') {
            const match = ingredient.match(/^(\d+)x?\s+(.+)$/i);
            if (match) {
                quantity = parseInt(match[1]);
                ingredientName = match[2];
            }
        } else if (ingredient.item) {
            ingredientName = ingredient.item;
            quantity = ingredient.quantity || 1;
        }
        
        // Try to find the ingredient value
        const normalizedIngredient = ingredientName.toLowerCase().trim();
        let ingredientValue = itemValueMap[normalizedIngredient];
        
        // Try without 's' if not found
        if (!ingredientValue && normalizedIngredient.endsWith('s')) {
            ingredientValue = itemValueMap[normalizedIngredient.slice(0, -1)];
        }
        
        if (ingredientValue) {
            totalIngredientCost += ingredientValue * quantity;
            knownIngredients.push(`${quantity}x ${ingredientName} (${ingredientValue * quantity}s)`);
        } else {
            unknownIngredients.push(`${quantity}x ${ingredientName}`);
        }
    });
    
    // Only analyze if we know at least some ingredient values
    if (knownIngredients.length > 0) {
        const profit = recipe.value - totalIngredientCost;
        const profitMargin = totalIngredientCost > 0 ? 
            ((profit / totalIngredientCost) * 100).toFixed(1) : 'N/A';
        
        recipeAnalysis.push({
            name: recipe.name,
            file: recipe.file,
            value: recipe.value,
            ingredientCost: totalIngredientCost,
            profit: profit,
            profitMargin: profitMargin,
            knownIngredients: knownIngredients,
            unknownIngredients: unknownIngredients,
            recipeType: recipe.recipe_type
        });
    }
});

// Sort by profit margin (items losing money first)
recipeAnalysis.sort((a, b) => a.profit - b.profit);

console.log('ITEMS WITH NEGATIVE PROFIT (losing money on craft):');
console.log('-'.repeat(60));
recipeAnalysis
    .filter(r => r.profit < 0)
    .forEach(recipe => {
        console.log(`\n${recipe.name} (${recipe.recipeType})`);
        console.log(`  File: ${recipe.file}`);
        console.log(`  Sell Value: ${recipe.value}s`);
        console.log(`  Ingredient Cost: ${recipe.ingredientCost}s`);
        console.log(`  LOSS: ${Math.abs(recipe.profit)}s (${recipe.profitMargin}%)`);
        console.log(`  Known Ingredients: ${recipe.knownIngredients.join(', ')}`);
        if (recipe.unknownIngredients.length > 0) {
            console.log(`  Unknown Ingredients: ${recipe.unknownIngredients.join(', ')}`);
        }
    });

console.log('\n\nITEMS WITH LOW PROFIT MARGIN (< 20%):');
console.log('-'.repeat(60));
recipeAnalysis
    .filter(r => r.profit > 0 && r.profit < r.ingredientCost * 0.2)
    .slice(0, 10)
    .forEach(recipe => {
        console.log(`\n${recipe.name} (${recipe.recipeType})`);
        console.log(`  Sell Value: ${recipe.value}s, Ingredient Cost: ${recipe.ingredientCost}s`);
        console.log(`  Profit: ${recipe.profit}s (${recipe.profitMargin}%)`);
    });

console.log('\n\nITEMS WITH EXTREME PROFIT MARGIN (> 500%):');
console.log('-'.repeat(60));
recipeAnalysis
    .filter(r => r.profit > r.ingredientCost * 5)
    .slice(0, 10)
    .forEach(recipe => {
        console.log(`\n${recipe.name} (${recipe.recipeType})`);
        console.log(`  Sell Value: ${recipe.value}s, Ingredient Cost: ${recipe.ingredientCost}s`);
        console.log(`  Profit: ${recipe.profit}s (${recipe.profitMargin}%)`);
    });

// 3. Find similar items with very different prices
console.log('\n\n=== PRICE CONSISTENCY ANALYSIS ===\n');

// Group items by category and find outliers
const categoryGroups = {};
itemAudit.forEach(item => {
    if (typeof item.value !== 'number') return;
    
    const mainCategory = item.category.split('/')[0];
    if (!categoryGroups[mainCategory]) {
        categoryGroups[mainCategory] = [];
    }
    categoryGroups[mainCategory].push(item);
});

Object.keys(categoryGroups).forEach(category => {
    const items = categoryGroups[category];
    if (items.length < 3) return; // Skip small categories
    
    // Calculate average and standard deviation
    const values = items.map(i => i.value);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // Find outliers (items more than 2 standard deviations away)
    const outliers = items.filter(item => Math.abs(item.value - avg) > stdDev * 2);
    
    if (outliers.length > 0 && stdDev > 100) { // Only show if there's significant variance
        console.log(`\n${category.toUpperCase()} - Average: ${Math.round(avg)}s, StdDev: ${Math.round(stdDev)}s`);
        outliers.forEach(item => {
            const deviation = ((item.value - avg) / avg * 100).toFixed(0);
            const sign = deviation > 0 ? '+' : '';
            console.log(`  ${item.name}: ${item.value}s (${sign}${deviation}% from average)`);
        });
    }
});

console.log('\n\n=== SUMMARY ===');
console.log(`Total items analyzed: ${itemAudit.length}`);
console.log(`Items with recipes: ${recipeAudit.length}`);
console.log(`Recipes with analyzable costs: ${recipeAnalysis.length}`);
console.log(`Items with negative profit margin: ${recipeAnalysis.filter(r => r.profit < 0).length}`);
console.log(`Items with low profit margin (<20%): ${recipeAnalysis.filter(r => r.profit > 0 && r.profit < r.ingredientCost * 0.2).length}`);
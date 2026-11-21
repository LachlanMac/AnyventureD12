#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base paths
const itemsPath = path.join(__dirname, '..', 'data', 'items');
const weaponsPath = path.join(itemsPath, 'weapons');

// Helper function to read JSON file
function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

// Name mapping for recipe ingredients to actual part names
const recipeNameMapping = {
  'Handle': ['Wooden Handle', 'Leather Handle', 'Metal Handle'],
  'Point': ['Iron Point', 'Steel Point', 'True Steel Point', 'Starsteel Point'],
  'Light Blade': ['Iron Light Blade', 'Steel Light Blade', 'True Steel Light Blade', 'Starsteel Light Blade'],
  'Heavy Blade': ['Iron Heavy Blade', 'Steel Heavy Blade', 'True Steel Heavy Blade', 'Starsteel Heavy Blade'],
  'Heavy Blades': ['Iron Heavy Blade', 'Steel Heavy Blade', 'True Steel Heavy Blade', 'Starsteel Heavy Blade'], // Handle plural form
  'Light Head': ['Iron Light Head', 'Steel Light Head', 'True Steel Light Head', 'Starsteel Light Head'],
  'Heavy Head': ['Iron Heavy Head', 'Steel Heavy Head', 'True Steel Heavy Head', 'Starsteel Heavy Head'],
  'Heavy Heads': ['Iron Heavy Head', 'Steel Heavy Head', 'True Steel Heavy Head', 'Starsteel Heavy Head'], // Handle plural form
  'Short Shaft': ['Wooden Short Shaft', 'Metal Short Shaft'], // These don't follow Iron/Steel pattern
  'Long Shaft': ['Wooden Long Shaft', 'Metal Long Shaft', 'Reinforced Long Shaft', 'Flexible Long Shaft'], // Check what exists
  'Light Limbs': ['Iron Light Limbs', 'Steel Light Limbs', 'True Steel Light Limbs', 'Starsteel Light Limbs'],
  'Heavy Limbs': ['Iron Heavy Limbs', 'Steel Heavy Limbs', 'True Steel Heavy Limbs', 'Starsteel Heavy Limbs'],
  'Bowstring': ['Simple Bowstring', 'Reinforced Bowstring', 'Enchanted Bowstring'],
  'Simple Blade': ['Iron Light Blade', 'Steel Light Blade', 'True Steel Light Blade', 'Starsteel Light Blade'],
  'Lash': ['Leather Lash', 'Truesteel Chainlinked Lash'],
  'Cloth': ['Simple Cloth', 'Reinforced Cloth', 'Enchanted Cloth'],
  'Short Chain': ['Simple Short Chain', 'Reinforced Short Chain', 'Heavy Short Chain']
};

// Helper function to write JSON file
function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error.message);
    return false;
  }
}

// Function to find item value by name
function findItemValue(itemName) {
  // Check if this is a mapped recipe name and get possible alternatives
  const possibleNames = recipeNameMapping[itemName] || [itemName];
  
  // If we have multiple possibilities, always find the cheapest
  if (possibleNames.length > 1) {
    console.log(`Finding cheapest option for ${itemName} among: ${possibleNames.join(', ')}`);
    let cheapestValue = Infinity;
    let cheapestName = '';
    let found = false;
    
    for (const possibleName of possibleNames) {
      const value = findItemValueExact(possibleName);
      if (value > 0 && value < cheapestValue) {
        cheapestValue = value;
        cheapestName = possibleName;
        found = true;
      }
    }
    
    if (found) {
      console.log(`Using cheapest option: ${cheapestName} at ${cheapestValue} silver`);
      return cheapestValue;
    }
  }
  
  // Single name or fallback - find exact match
  const value = findItemValueExact(itemName);
  if (value > 0) {
    return value;
  }
  
  console.warn(`⚠️  Item not found: ${itemName}`);
  return 0;
}

// Helper function to find exact item name without mapping
function findItemValueExact(itemName) {
  const searchPaths = [
    'goods/parts',
    'goods/components', 
    'goods/metals/ingots',
    'goods/wood',
    'goods/bundles',
    'goods/gemstones',
    'goods',
    'tools'
  ];

  for (const searchPath of searchPaths) {
    const fullPath = path.join(itemsPath, searchPath);
    if (!fs.existsSync(fullPath)) continue;
    
    const files = fs.readdirSync(fullPath, { recursive: true })
      .filter(file => file.endsWith('.json'));
    
    for (const file of files) {
      const filePath = path.join(fullPath, file);
      const data = readJsonFile(filePath);
      
      if (!data) continue;
      
      // Handle both single items and arrays of items
      const items = Array.isArray(data) ? data : [data];
      
      for (const item of items) {
        if (item.name === itemName || 
            item.name?.toLowerCase() === itemName.toLowerCase()) {
          return item.value || 0;
        }
      }
    }
  }
  
  return 0;
}

// Function to calculate recipe cost
function calculateRecipeCost(ingredients) {
  if (!ingredients || !Array.isArray(ingredients)) return 0;
  
  let totalCost = 0;
  console.log(`  Calculating recipe cost:`);
  
  for (const rawIngredient of ingredients) {
    // Clean up ingredient name - remove annotations and extract quantity
    let ingredient = rawIngredient;
    let quantity = 1;
    
    // Handle quantity prefixes like "2 Heavy Heads"
    const quantityMatch = ingredient.match(/^(\d+)\s+(.+)$/);
    if (quantityMatch) {
      quantity = parseInt(quantityMatch[1]);
      ingredient = quantityMatch[2];
    }
    
    // Remove annotations like "(affects Only Primary Slashing Attack)"
    ingredient = ingredient.replace(/\s*\([^)]+\)\s*$/, '').trim();
    
    const unitValue = findItemValue(ingredient);
    const totalValue = unitValue * quantity;
    totalCost += totalValue;
    
    if (quantity > 1) {
      console.log(`    ${quantity}x ${ingredient}: ${unitValue} each = ${totalValue} silver`);
    } else {
      console.log(`    ${ingredient}: ${totalValue} silver`);
    }
  }
  
  console.log(`  Total ingredients cost: ${totalCost} silver`);
  return totalCost;
}

// Function to apply markup and rounding
function applyMarkupAndRound(baseCost) {
  const markupCost = baseCost * 1.2;
  const roundedCost = Math.round(markupCost / 5) * 5;
  console.log(`  ${baseCost} * 1.2 = ${markupCost} → rounded to ${roundedCost}`);
  return roundedCost;
}

// Function to process a single weapon
function processWeapon(weaponPath, weaponFile) {
  const fullPath = path.join(weaponPath, weaponFile);
  const weapon = readJsonFile(fullPath);
  
  if (!weapon) return;
  
  console.log(`\\n🔍 Processing: ${weapon.name}`);
  console.log(`  Current value: ${weapon.value} silver`);
  
  if (!weapon.recipe || !weapon.recipe.ingredients) {
    console.log(`  ⏭️  No recipe found, skipping`);
    return;
  }
  
  const recipeCost = calculateRecipeCost(weapon.recipe.ingredients);
  if (recipeCost === 0) {
    console.log(`  ⏭️  No valid ingredients found, skipping`);
    return;
  }
  
  const newValue = applyMarkupAndRound(recipeCost);
  
  if (newValue !== weapon.value) {
    weapon.value = newValue;
    if (writeJsonFile(fullPath, weapon)) {
      console.log(`  ✅ Updated ${weapon.name}: ${weapon.value} silver (was ${readJsonFile(fullPath)?.value || 'unknown'})`);
    } else {
      console.log(`  ❌ Failed to update ${weapon.name}`);
    }
  } else {
    console.log(`  ✓ Value unchanged: ${newValue} silver`);
  }
}

// Main function
function main() {
  console.log('🏺 Weapon Value Calculator');
  console.log('========================\\n');
  
  const weaponCategories = ['simpleMelee', 'simpleRanged', 'complexMelee', 'complexRanged'];
  
  for (const category of weaponCategories) {
    const categoryPath = path.join(weaponsPath, category);
    
    if (!fs.existsSync(categoryPath)) {
      console.log(`❌ Category not found: ${category}`);
      continue;
    }
    
    console.log(`\\n📂 Processing category: ${category}`);
    console.log('='.repeat(40));
    
    const weaponFiles = fs.readdirSync(categoryPath)
      .filter(file => file.endsWith('.json'));
    
    if (weaponFiles.length === 0) {
      console.log(`  No weapons found in ${category}`);
      continue;
    }
    
    for (const weaponFile of weaponFiles) {
      processWeapon(categoryPath, weaponFile);
    }
  }
  
  console.log('\\n🎉 Weapon value calculation complete!');
}

// Run the script
main();
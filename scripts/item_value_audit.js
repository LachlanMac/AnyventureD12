import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to recursively find all JSON files in a directory
function findJsonFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            findJsonFiles(filePath, fileList);
        } else if (path.extname(file) === '.json') {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

// Function to load and parse a JSON file
function loadJsonFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`Error loading ${filePath}:`, error.message);
        return null;
    }
}

// Main audit function
function auditItems() {
    const itemsDir = path.join(__dirname, '..', 'data', 'items');
    const jsonFiles = findJsonFiles(itemsDir);
    
    const itemAudit = [];
    const recipeAudit = [];
    
    console.log(`Found ${jsonFiles.length} item files to audit...`);
    
    jsonFiles.forEach(filePath => {
        const data = loadJsonFile(filePath);
        
        if (!data) {
            console.warn(`Skipping ${filePath} - could not load`);
            return;
        }
        
        // Extract relative path for better organization
        const relativePath = path.relative(itemsDir, filePath);
        const category = path.dirname(relativePath);
        
        // Handle both single items and arrays of items
        const items = Array.isArray(data) ? data : [data];
        
        items.forEach((item, index) => {
            // Add to item audit
            const itemEntry = {
                file: relativePath,
                category: category,
                name: item.name || 'UNNAMED',
                description: item.description || 'NO DESCRIPTION',
                value: item.value !== undefined ? item.value : 'NO VALUE',
                type: item.type || 'NO TYPE'
            };
            
            // If it's an array, add index to distinguish items
            if (Array.isArray(data) && data.length > 1) {
                itemEntry.arrayIndex = index;
                itemEntry.isPartOfArray = true;
            }
            
            // Include rarity if it exists
            if (item.rarity) {
                itemEntry.rarity = item.rarity;
            }
            
            itemAudit.push(itemEntry);
        
            // Check for recipe and add to recipe audit
            if (item.recipe) {
                const recipeEntry = {
                    file: relativePath,
                    category: category,
                    name: item.name || 'UNNAMED',
                    value: item.value !== undefined ? item.value : 'NO VALUE'
                };
                
                // If it's an array item, add index
                if (Array.isArray(data) && data.length > 1) {
                    recipeEntry.arrayIndex = index;
                    recipeEntry.isPartOfArray = true;
                }
                
                // Handle different recipe formats
                if (item.recipe.ingredients) {
                    // Object format with ingredients array
                    recipeEntry.recipe_type = item.recipe.type || 'unknown';
                    recipeEntry.difficulty = item.recipe.difficulty || 'NO DIFFICULTY';
                    recipeEntry.ingredients = item.recipe.ingredients.map(ingredient => {
                        if (typeof ingredient === 'string') {
                            return ingredient;
                        } else if (ingredient.item) {
                            // Handle objects with item and quantity
                            return {
                                item: ingredient.item,
                                quantity: ingredient.quantity || 1
                            };
                        }
                        return ingredient;
                    });
                    recipeEntry.ingredients_count = item.recipe.ingredients.length;
                } else if (Array.isArray(item.recipe)) {
                    // Direct array format
                    recipeEntry.recipe_type = 'unknown';
                    recipeEntry.ingredients = item.recipe.map(ingredient => {
                        if (typeof ingredient === 'string') {
                            return ingredient;
                        } else if (ingredient.item) {
                            // Handle objects with item and quantity
                            return {
                                item: ingredient.item,
                                quantity: ingredient.quantity || 1
                            };
                        }
                        return ingredient;
                    });
                    recipeEntry.ingredients_count = item.recipe.length;
                } else {
                    // Unknown format
                    recipeEntry.raw_recipe = item.recipe;
                    recipeEntry.ingredients_count = 0;
                }
                
                recipeAudit.push(recipeEntry);
            }
        });
    });
    
    // Sort audits for better readability
    itemAudit.sort((a, b) => {
        // Sort by category first, then by name
        const catCompare = a.category.localeCompare(b.category);
        return catCompare !== 0 ? catCompare : a.name.localeCompare(b.name);
    });
    
    recipeAudit.sort((a, b) => {
        const catCompare = a.category.localeCompare(b.category);
        return catCompare !== 0 ? catCompare : a.name.localeCompare(b.name);
    });
    
    // Write audit files
    const itemAuditPath = path.join(__dirname, '..', 'item_audit.json');
    const recipeAuditPath = path.join(__dirname, '..', 'recipe_audit.json');
    
    fs.writeFileSync(itemAuditPath, JSON.stringify(itemAudit, null, 2));
    fs.writeFileSync(recipeAuditPath, JSON.stringify(recipeAudit, null, 2));
    
    // Print summary
    console.log('\n=== AUDIT SUMMARY ===');
    console.log(`Total items audited: ${itemAudit.length}`);
    console.log(`Items with recipes: ${recipeAudit.length}`);
    console.log(`Items without value: ${itemAudit.filter(i => i.value === 'NO VALUE').length}`);
    console.log(`Items without description: ${itemAudit.filter(i => i.description === 'NO DESCRIPTION').length}`);
    
    // Category breakdown
    const categories = {};
    itemAudit.forEach(item => {
        const topCategory = item.category.split(path.sep)[0] || 'root';
        categories[topCategory] = (categories[topCategory] || 0) + 1;
    });
    
    console.log('\n=== ITEMS BY CATEGORY ===');
    Object.entries(categories)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([cat, count]) => {
            console.log(`  ${cat}: ${count} items`);
        });
    
    console.log('\n=== OUTPUT FILES ===');
    console.log(`Item audit written to: ${itemAuditPath}`);
    console.log(`Recipe audit written to: ${recipeAuditPath}`);
}

// Run the audit
auditItems();
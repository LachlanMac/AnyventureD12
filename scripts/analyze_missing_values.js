import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the audit file
const itemAuditPath = path.join(__dirname, '..', 'item_audit.json');
const itemAudit = JSON.parse(fs.readFileSync(itemAuditPath, 'utf8'));

// Find items without values
const itemsWithoutValues = itemAudit.filter(item => item.value === 'NO VALUE');

// Group by category for better organization
const byCategory = {};
itemsWithoutValues.forEach(item => {
    const category = item.category.split('/')[0];
    if (!byCategory[category]) {
        byCategory[category] = [];
    }
    byCategory[category].push(item);
});

console.log('=== ITEMS WITHOUT VALUES ===\n');
console.log(`Total items without values: ${itemsWithoutValues.length}\n`);

// Display by category
Object.keys(byCategory).sort().forEach(category => {
    console.log(`\n${category.toUpperCase()} (${byCategory[category].length} items):`);
    console.log('-'.repeat(50));
    
    byCategory[category].forEach(item => {
        console.log(`\nFile: ${item.file}`);
        console.log(`Name: ${item.name}`);
        console.log(`Type: ${item.type}`);
        if (item.description && item.description !== 'NO DESCRIPTION') {
            // Truncate long descriptions
            const desc = item.description.length > 100 
                ? item.description.substring(0, 100) + '...' 
                : item.description;
            console.log(`Description: ${desc}`);
        }
    });
});

// Also create a simple list for easy reference
console.log('\n\n=== SIMPLE FILE LIST ===\n');
itemsWithoutValues.forEach(item => {
    console.log(`data/items/${item.file}`);
});
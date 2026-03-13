import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Item from '../models/Item.js';
import Character from '../models/Character.js';
import { generateFoundryId } from './foundryIdGenerator.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to items data directory
const itemsDir = path.resolve(__dirname, '../../data/items');
const magicItemsDir = path.resolve(__dirname, '../../data/magic_items');

// Function to purge all items from the database
export const purgeAllItems = async () => {
  try {
    console.log('Purging all items from the database...');
    const result = await Item.deleteMany({});
    console.log(`Successfully purged ${result.deletedCount} items.`);
    return true;
  } catch (err) {
    console.error(`Error purging items: ${err.message}`);
    return false;
  }
};

// Recursive function to read all JSON files in a directory
// baseDir is used for computing relative paths/categories (defaults to directory)
const readItemsFromDirectory = (directory, baseDir = directory) => {
  const items = [];

  // Get all files and directories in the current directory
  const entries = fs.readdirSync(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      // Recursively process subdirectories, passing baseDir through
      const subItems = readItemsFromDirectory(fullPath, baseDir);
      items.push(...subItems);
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      // Process JSON files
      try {
        const fileContent = fs.readFileSync(fullPath, 'utf8');
        const itemData = JSON.parse(fileContent);

        // Get the category from the directory structure relative to baseDir
        // e.g., for '/data/items/weapons/simpleMelee/dagger.json', category would be 'weapons'
        const relativePath = path.relative(baseDir, fullPath);
        const pathParts = relativePath.split(path.sep);
        
        if (pathParts.length >= 1) {
          const category = pathParts[0];
          
          // Handle both single items and arrays of items
          const itemsToProcess = Array.isArray(itemData) ? itemData : [itemData];
          
          for (const item of itemsToProcess) {
            // Add metadata about where item was loaded from
            item._source = {
              path: relativePath,
              category,
              subcategory: pathParts.length > 1 ? pathParts[1] : null,
              filename: entry.name
            };
            
            items.push(item);
          }
        }
      } catch (err) {
        console.error(`Error reading item file ${fullPath}: ${err.message}`);
      }
    }
  }
  
  return items;
};

// Function to seed items to the database
export const seedItems = async (purgeFirst = false) => {
  try {
    // Optionally purge existing items first
    if (purgeFirst) {
      const purgeSuccess = await purgeAllItems();
      if (!purgeSuccess) {
        console.log('Skipping seed operation due to purge failure.');
        return false;
      }
    }
    
    // Make sure the items directory exists
    if (!fs.existsSync(itemsDir)) {
      console.log('Items directory does not exist. Creating it...');
      fs.mkdirSync(itemsDir, { recursive: true });
      
      // Create example directory structure
      fs.mkdirSync(path.join(itemsDir, 'weapons'), { recursive: true });
      fs.mkdirSync(path.join(itemsDir, 'weapons', 'simpleMelee'), { recursive: true });
      fs.mkdirSync(path.join(itemsDir, 'weapons', 'complexMelee'), { recursive: true });
      fs.mkdirSync(path.join(itemsDir, 'weapons', 'simpleRanged'), { recursive: true });
      fs.mkdirSync(path.join(itemsDir, 'weapons', 'complexRanged'), { recursive: true });
      
      // At this point, we could create example items, but they'd be empty
      // Instead, we'll notify about the new directory structure
      console.log('Created item directory structure. Please add item data files.');
      return true;
    }
    
    // Read all items from both directories
    const itemsData = readItemsFromDirectory(itemsDir);
    if (fs.existsSync(magicItemsDir)) {
      itemsData.push(...readItemsFromDirectory(magicItemsDir));
    }
    
    if (itemsData.length === 0) {
      console.log('No item data found.');
      return false;
    }
    
    console.log(`Found ${itemsData.length} items to seed.`);
    
    // Process each item
    let createdCount = 0;
    let updatedCount = 0;
    
    for (const data of itemsData) {
      // CRITICAL VALIDATION: Fail hard if required fields are missing
      const filePath = data._source?.path || 'unknown file';
      const fileName = data._source?.filename || 'unknown';

      if (!data.name || data.name.trim() === '') {
        console.error(`❌ SEEDER VALIDATION FAILED: Item is missing required 'name' field`);
        console.error(`📂 File: ${filePath}`);
        console.error(`📄 Filename: ${fileName}`);
        console.error(`📁 Full item data:`, JSON.stringify(data, null, 2));
        console.error(`🔧 Action required: Open file 'data/items/${filePath}' and ensure it has a valid 'name' property`);
        throw new Error(`Item seeding failed: Item in '${fileName}' is missing required 'name' field. Check console for file path.`);
      }

      if (typeof data.name !== 'string') {
        console.error(`❌ SEEDER VALIDATION FAILED: Item name must be a string`);
        console.error(`📂 File: ${filePath}`);
        console.error(`📄 Filename: ${fileName}`);
        console.error(`📝 Found name:`, data.name, `(type: ${typeof data.name})`);
        console.error(`📁 Full item data:`, JSON.stringify(data, null, 2));
        console.error(`🔧 Action required: Open file 'data/items/${filePath}' and ensure 'name' property is a valid string`);
        throw new Error(`Item seeding failed: Item in '${fileName}' has invalid name type. Check console for file path.`);
      }

      // Use item name as a unique identifier
      const existingItem = await Item.findOne({ name: data.name });
      
      if (existingItem) {
        // Update existing item - completely replace content while preserving IDs
        console.log(`Updating existing item: ${data.name}`);

        // Remove the _source metadata when updating the database
        const { _source, ...updateData } = data;

        // Ensure recipe.output has a default value if missing
        if (updateData.recipe && !updateData.recipe.hasOwnProperty('output')) {
          updateData.recipe.output = 1;
        }

        // Normalize movement from flat number to object structure
        if (typeof updateData.movement === 'number' || typeof updateData.movement === 'undefined') {
          const oldVal = Number(updateData.movement) || 0;
          updateData.movement = {
            walk: { bonus: oldVal, set: 0 },
            swim: { bonus: 0, set: 0 },
            climb: { bonus: 0, set: 0 },
            fly: { bonus: 0, set: 0 }
          };
        }

        // Preserve critical fields that should never change
        updateData._id = existingItem._id;
        updateData.foundry_id = existingItem.foundry_id;

        // Replace the entire document to ensure removed properties are actually removed
        await Item.replaceOne(
          { _id: existingItem._id },
          updateData
        );

        updatedCount++;
      } else {
        // Create new item
        console.log(`Creating new item: ${data.name}`);

        // Remove the _source metadata when saving to the database
        const { _source, ...itemData } = data;

        // Ensure recipe.output has a default value if missing
        if (itemData.recipe && !itemData.recipe.hasOwnProperty('output')) {
          itemData.recipe.output = 1;
        }

        // Normalize movement from flat number to object structure
        if (typeof itemData.movement === 'number' || typeof itemData.movement === 'undefined') {
          const oldVal = Number(itemData.movement) || 0;
          itemData.movement = {
            walk: { bonus: oldVal, set: 0 },
            swim: { bonus: 0, set: 0 },
            climb: { bonus: 0, set: 0 },
            fly: { bonus: 0, set: 0 }
          };
        }

        // Generate foundry_id if missing
        if (!itemData.foundry_id) {
          itemData.foundry_id = generateFoundryId();
          console.log(`  Generated foundry_id: ${itemData.foundry_id}`);
        }

        await Item.create(itemData);
        createdCount++;
      }
    }
    
    console.log(`Item seeding completed successfully. Created: ${createdCount}, Updated: ${updatedCount}`);
    return true;
  } catch (err) {
    console.error(`Error seeding items: ${err.message}`);
    return false;
  }
};

// Function to get all items from the database
export const getAllItems = async () => {
  try {
    return await Item.find({});
  } catch (err) {
    console.error(`Error fetching items: ${err.message}`);
    return [];
  }
};

// Function to get items by type
export const getItemsByType = async (type) => {
  try {
    return await Item.find({ type });
  } catch (err) {
    console.error(`Error fetching items by type ${type}: ${err.message}`);
    return [];
  }
};

// Function to get weapon items by category
export const getWeaponsByCategory = async (category) => {
  try {
    return await Item.find({ 
      type: 'weapon',
      'weapon_data.category': category 
    });
  } catch (err) {
    console.error(`Error fetching weapons by category ${category}: ${err.message}`);
    return [];
  }
};

// Function to reset and reseed all items
export const resetAndReseedItems = async () => {
  try {
    console.log('Updating and reseeding all items (preserving references)...');
    
    // First, get all items from JSON files (both directories)
    const itemsData = readItemsFromDirectory(itemsDir);
    if (fs.existsSync(magicItemsDir)) {
      itemsData.push(...readItemsFromDirectory(magicItemsDir));
    }
    const itemNamesFromFiles = new Set(itemsData.map(item => item.name));
    
    // Get all non-homebrew items from database
    const itemsInDatabase = await Item.find({ isHomebrew: { $ne: true } }, 'name');
    
    // Find orphaned items (non-homebrew items in database but not in files)
    const orphanedItems = itemsInDatabase.filter(dbItem => !itemNamesFromFiles.has(dbItem.name));
    
    // Delete orphaned items (non-homebrew only) and clean up character references
    if (orphanedItems.length > 0) {
      console.log(`Found ${orphanedItems.length} orphaned non-homebrew items to delete:`);
      const equipmentSlots = [
        'hand', 'boots', 'body', 'head', 'back',
        'accessory1', 'accessory2',
        'mainhand', 'offhand', 'extra1', 'extra2', 'extra3'
      ];
      for (const orphan of orphanedItems) {
        console.log(`Deleting orphaned item: ${orphan.name}`);

        // Clear equipment slots referencing this item on all characters
        for (const slot of equipmentSlots) {
          const result = await Character.updateMany(
            { [`equipment.${slot}.itemId`]: orphan._id },
            { $set: { [`equipment.${slot}.itemId`]: null, [`equipment.${slot}.equippedAt`]: null } }
          );
          if (result.modifiedCount > 0) {
            console.log(`  Cleared ${result.modifiedCount} character(s) with ${orphan.name} in ${slot} slot`);
          }
        }

        // Remove from character inventories
        const invResult = await Character.updateMany(
          { 'inventory.itemId': orphan._id },
          { $pull: { inventory: { itemId: orphan._id } } }
        );
        if (invResult.modifiedCount > 0) {
          console.log(`  Removed from ${invResult.modifiedCount} character inventory(s)`);
        }

        await Item.deleteOne({ _id: orphan._id });
      }
    } else {
      console.log('No orphaned non-homebrew items found.');
    }
    
    // This will update existing items and create new ones (preserving ObjectIds)
    const success = await seedItems(false);
    
    if (success) {
      const newItemCount = await Item.countDocuments();
      console.log(`Successfully reseeded ${newItemCount} items.`);
      if (orphanedItems.length > 0) {
        console.log(`Deleted ${orphanedItems.length} orphaned items.`);
      }
      return true;
    }
    
    return false;
  } catch (err) {
    console.error(`Error resetting items: ${err.message}`);
    return false;
  }
};

// Export a function to run at server startup
export const initializeItems = async () => {
  try {
    // Count existing items in database
    const itemCount = await Item.countDocuments();
    console.log(`Found ${itemCount} existing items in database.`);
    
    // Seed items if needed
    if (itemCount === 0) {
      console.log('No items found in database. Seeding initial items...');
      await seedItems();
    }
    
    console.log('Item initialization complete.');
    return true;
  } catch (err) {
    console.error(`Error initializing items: ${err.message}`);
    return false;
  }
};
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Item from '../models/Item.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to items data directory
const itemsDir = path.resolve(__dirname, '../../data/items');

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
const readItemsFromDirectory = (directory) => {
  const items = [];
  
  // Get all files and directories in the current directory
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively process subdirectories
      const subItems = readItemsFromDirectory(fullPath);
      items.push(...subItems);
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      // Process JSON files
      try {
        const fileContent = fs.readFileSync(fullPath, 'utf8');
        const itemData = JSON.parse(fileContent);
        
        // Get the category from the directory structure
        // e.g., for '/data/items/weapons/simpleMelee/dagger.json', category would be 'weapons'
        const relativePath = path.relative(itemsDir, fullPath);
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
    
    // Read all items from the directory
    const itemsData = readItemsFromDirectory(itemsDir);
    
    if (itemsData.length === 0) {
      console.log('No item data found.');
      return false;
    }
    
    console.log(`Found ${itemsData.length} items to seed.`);
    
    // Process each item
    let createdCount = 0;
    let updatedCount = 0;
    
    for (const data of itemsData) {
      // Use item name as a unique identifier
      const existingItem = await Item.findOne({ name: data.name });
      
      if (existingItem) {
        // Update existing item
        console.log(`Updating existing item: ${data.name}`);
        
        // Remove the _source metadata when updating the database
        const { _source, ...updateData } = data;
        
        await Item.updateOne(
          { _id: existingItem._id },
          { $set: updateData }
        );
        
        updatedCount++;
      } else {
        // Create new item
        console.log(`Creating new item: ${data.name}`);
        
        // Remove the _source metadata when saving to the database
        const { _source, ...itemData } = data;
        
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
    
    // This will update existing items and create new ones (preserving ObjectIds)
    const success = await seedItems(false);
    
    if (success) {
      const newItemCount = await Item.countDocuments();
      console.log(`Successfully reseeded ${newItemCount} items.`);
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
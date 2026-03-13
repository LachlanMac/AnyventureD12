// server/scripts/cleanupOrphanedEquipment.js
// Finds and clears equipment slots that reference items no longer in the database
// (e.g., after studded_* items were consolidated into reinforced_*)
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/anyventuredx';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    return true;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    return false;
  }
};

const main = async () => {
  const connected = await connectDB();
  if (!connected) process.exit(1);

  try {
    const Character = (await import('../models/Character.js')).default;
    const Item = (await import('../models/Item.js')).default;

    const equipmentSlots = [
      'hand', 'boots', 'body', 'head', 'back',
      'accessory1', 'accessory2',
      'mainhand', 'offhand', 'extra1', 'extra2', 'extra3'
    ];

    // Get all valid item IDs
    const allItems = await Item.find({}, '_id name').lean();
    const validItemIds = new Set(allItems.map(i => i._id.toString()));

    // Find all characters with any equipment
    const characters = await Character.find({}).lean();

    let totalOrphaned = 0;
    let totalCharactersAffected = 0;

    for (const char of characters) {
      const orphanedSlots = [];

      for (const slot of equipmentSlots) {
        const itemId = char.equipment?.[slot]?.itemId;
        if (itemId && !validItemIds.has(itemId.toString())) {
          orphanedSlots.push(slot);
        }
      }

      // Also check inventory for orphaned itemId references
      const orphanedInventory = [];
      if (char.inventory) {
        char.inventory.forEach((invItem, idx) => {
          if (invItem.itemId && !validItemIds.has(invItem.itemId.toString()) && !invItem.itemData) {
            orphanedInventory.push({ index: idx, itemId: invItem.itemId });
          }
        });
      }

      if (orphanedSlots.length > 0 || orphanedInventory.length > 0) {
        totalCharactersAffected++;
        console.log(`\nCharacter: ${char.name} (${char._id})`);

        if (orphanedSlots.length > 0) {
          console.log(`  Orphaned equipment slots: ${orphanedSlots.join(', ')}`);
          totalOrphaned += orphanedSlots.length;

          // Build update to clear orphaned slots
          const update = {};
          for (const slot of orphanedSlots) {
            update[`equipment.${slot}.itemId`] = null;
            update[`equipment.${slot}.equippedAt`] = null;
          }
          await Character.updateOne({ _id: char._id }, { $set: update });
          console.log(`  -> Cleared ${orphanedSlots.length} equipment slot(s)`);
        }

        if (orphanedInventory.length > 0) {
          console.log(`  Orphaned inventory items: ${orphanedInventory.length}`);
          // Pull orphaned inventory entries by their itemId
          for (const orphan of orphanedInventory) {
            await Character.updateOne(
              { _id: char._id },
              { $pull: { inventory: { itemId: orphan.itemId, itemData: { $exists: false } } } }
            );
          }
          console.log(`  -> Removed ${orphanedInventory.length} orphaned inventory item(s)`);
        }
      }
    }

    console.log(`\n========================================`);
    console.log(`Total characters affected: ${totalCharactersAffected}`);
    console.log(`Total orphaned equipment slots cleared: ${totalOrphaned}`);
    console.log(`========================================`);

  } catch (err) {
    console.error('Error during cleanup:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

main();

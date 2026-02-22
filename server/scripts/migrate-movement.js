// server/scripts/migrate-movement.js
// Migrates items with movement as a flat number (e.g. movement: 0 or movement: 5)
// to the new object structure: movement: { walk: { bonus, set }, swim: { ... }, climb: { ... }, fly: { ... } }
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const defaultMovement = {
  walk: { bonus: 0, set: 0 },
  swim: { bonus: 0, set: 0 },
  climb: { bonus: 0, set: 0 },
  fly: { bonus: 0, set: 0 }
};

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

const migrateMovement = async () => {
  const connected = await connectDB();
  if (!connected) return;

  const db = mongoose.connection.db;
  const collection = db.collection('items');

  // Find items where movement is a number (not an object)
  const itemsWithFlatMovement = await collection.find({
    $or: [
      { movement: { $type: 'number' } },
      { movement: { $type: 'string' } },
    ]
  }).toArray();

  console.log(`Found ${itemsWithFlatMovement.length} items with flat movement value`);

  if (itemsWithFlatMovement.length === 0) {
    console.log('No migration needed.');
    await mongoose.disconnect();
    return;
  }

  let migrated = 0;
  for (const item of itemsWithFlatMovement) {
    const oldValue = Number(item.movement) || 0;
    const newMovement = {
      walk: { bonus: oldValue, set: 0 },
      swim: { bonus: 0, set: 0 },
      climb: { bonus: 0, set: 0 },
      fly: { bonus: 0, set: 0 }
    };

    await collection.updateOne(
      { _id: item._id },
      { $set: { movement: newMovement } }
    );
    migrated++;

    if (oldValue !== 0) {
      console.log(`  Migrated "${item.name}": movement ${oldValue} -> walk.bonus ${oldValue}`);
    }
  }

  console.log(`\nMigrated ${migrated} items`);

  // Also check for items that are missing movement entirely
  const itemsWithoutMovement = await collection.countDocuments({
    movement: { $exists: false }
  });
  if (itemsWithoutMovement > 0) {
    await collection.updateMany(
      { movement: { $exists: false } },
      { $set: { movement: defaultMovement } }
    );
    console.log(`Set default movement on ${itemsWithoutMovement} items missing the field`);
  }

  console.log('Migration complete.');
  await mongoose.disconnect();
};

migrateMovement().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

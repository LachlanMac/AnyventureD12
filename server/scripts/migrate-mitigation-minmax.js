// server/scripts/migrate-mitigation-minmax.js
// Migrates mitigation from flat numbers to { min, max } format in all characters, creatures, and items
// Old format: mitigation: { physical: 3, heat: 0, ... }
// New format: mitigation: { physical: { min: 3, max: 25 }, heat: { min: 0, max: 25 }, ... }
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const DAMAGE_TYPES = ['physical', 'cold', 'heat', 'electric', 'psychic', 'dark', 'divine', 'aetheric', 'toxic'];
const DEFAULT_MAX = 25;

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

const migrateCollection = async (db, collectionName) => {
  console.log(`\nMigrating ${collectionName}...`);

  // Find documents that have mitigation as flat numbers (not yet migrated)
  // We detect this by checking if any mitigation field is a number instead of an object
  const docs = await db.collection(collectionName).find({
    'mitigation': { $exists: true }
  }).toArray();

  let migrated = 0;
  let skipped = 0;

  for (const doc of docs) {
    if (!doc.mitigation || typeof doc.mitigation !== 'object') {
      skipped++;
      continue;
    }

    // Check if already migrated (first non-null value is an object with min/max)
    let needsMigration = false;
    for (const type of DAMAGE_TYPES) {
      const val = doc.mitigation[type];
      if (val !== undefined && val !== null && typeof val === 'number') {
        needsMigration = true;
        break;
      }
    }

    if (!needsMigration) {
      skipped++;
      continue;
    }

    // Build new mitigation object
    const newMitigation = {};
    for (const type of DAMAGE_TYPES) {
      const val = doc.mitigation[type];
      if (val !== undefined && val !== null) {
        if (typeof val === 'number') {
          // Flat number: convert. Values >= 25 are immune (keep min high, max 0)
          if (val >= 25) {
            newMitigation[type] = { min: 25, max: 0 };
          } else {
            newMitigation[type] = { min: val, max: DEFAULT_MAX };
          }
        } else if (typeof val === 'object') {
          // Already migrated, keep as-is
          newMitigation[type] = val;
        }
      }
      // If not present, don't add it (let schema defaults handle it)
    }

    // Use raw update to replace the entire mitigation field
    await db.collection(collectionName).updateOne(
      { _id: doc._id },
      { $set: { mitigation: newMitigation } }
    );
    migrated++;
  }

  console.log(`  Migrated: ${migrated}, Skipped (already migrated or no mitigation): ${skipped}`);
  return { migrated, skipped };
};

const main = async () => {
  const connected = await connectDB();
  if (!connected) {
    process.exit(1);
  }

  try {
    const db = mongoose.connection.db;

    // Migrate all collections that have mitigation
    await migrateCollection(db, 'characters');
    await migrateCollection(db, 'creatures');
    await migrateCollection(db, 'items');

    console.log('\nMigration complete!');
  } catch (err) {
    console.error('Error during migration:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

main();

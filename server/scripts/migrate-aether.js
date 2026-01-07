// server/scripts/migrate-aether.js
// Migrates mitigation.aether to mitigation.aetheric in all characters, creatures, and items
// Then removes the old aether field to ensure clean data
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
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

// Helper function to migrate a collection
const migrateCollection = async (db, collectionName) => {
  console.log(`\nMigrating ${collectionName} collection...`);

  // Step 1: Find documents that have aether field
  const docsWithAether = await db.collection(collectionName).countDocuments({
    'mitigation.aether': { $exists: true }
  });
  console.log(`  Found ${docsWithAether} documents with mitigation.aether`);

  if (docsWithAether === 0) {
    console.log(`  No migration needed for ${collectionName}`);
    return { migrated: 0, cleaned: 0 };
  }

  // Step 2: For documents that have aether but NOT aetheric, copy the value
  const copyResult = await db.collection(collectionName).updateMany(
    {
      'mitigation.aether': { $exists: true },
      'mitigation.aetheric': { $exists: false }
    },
    [
      {
        $set: {
          'mitigation.aetheric': '$mitigation.aether'
        }
      }
    ]
  );
  console.log(`  Copied aether -> aetheric for ${copyResult.modifiedCount} documents`);

  // Step 3: For documents that have BOTH aether and aetheric, keep the higher value
  const mergeResult = await db.collection(collectionName).updateMany(
    {
      'mitigation.aether': { $exists: true },
      'mitigation.aetheric': { $exists: true }
    },
    [
      {
        $set: {
          'mitigation.aetheric': {
            $max: ['$mitigation.aether', '$mitigation.aetheric']
          }
        }
      }
    ]
  );
  console.log(`  Merged values (kept max) for ${mergeResult.modifiedCount} documents`);

  // Step 4: Remove the old aether field from ALL documents
  const cleanupResult = await db.collection(collectionName).updateMany(
    { 'mitigation.aether': { $exists: true } },
    {
      $unset: { 'mitigation.aether': '' }
    }
  );
  console.log(`  Removed old aether field from ${cleanupResult.modifiedCount} documents`);

  return {
    migrated: copyResult.modifiedCount + mergeResult.modifiedCount,
    cleaned: cleanupResult.modifiedCount
  };
};

// Main migration function
const migrateAether = async () => {
  try {
    const db = mongoose.connection.db;
    const results = {};

    // Migrate each collection
    results.characters = await migrateCollection(db, 'characters');
    results.creatures = await migrateCollection(db, 'creatures');
    results.items = await migrateCollection(db, 'items');

    console.log('\n========================================');
    console.log('Migration complete!');
    console.log('========================================');
    console.log('Summary:');
    console.log(`  Characters: ${results.characters.cleaned} cleaned`);
    console.log(`  Creatures: ${results.creatures.cleaned} cleaned`);
    console.log(`  Items: ${results.items.cleaned} cleaned`);
    console.log('\nThe "aether" field has been migrated to "aetheric"');
    console.log('and removed from all documents.');

  } catch (err) {
    console.error('Error during migration:', err);
  }
};

// Main execution
const main = async () => {
  console.log('========================================');
  console.log('Aether -> Aetheric Migration Script');
  console.log('========================================');

  const connected = await connectDB();
  if (!connected) {
    process.exit(1);
  }

  await migrateAether();

  await mongoose.disconnect();
  console.log('\nDisconnected from MongoDB');
  process.exit(0);
};

main();

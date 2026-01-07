// server/scripts/migrate-aether.js
// Migrates mitigation.aether to mitigation.aetheric in all characters
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

// Main migration function
const migrateAether = async () => {
  try {
    const db = mongoose.connection.db;

    // Migrate characters collection
    console.log('Migrating characters collection...');
    const charResult = await db.collection('characters').updateMany(
      { 'mitigation.aether': { $exists: true } },
      {
        $rename: { 'mitigation.aether': 'mitigation.aetheric' }
      }
    );
    console.log(`  Updated ${charResult.modifiedCount} characters`);

    // Migrate creatures collection (if it has mitigation)
    console.log('Migrating creatures collection...');
    const creatureResult = await db.collection('creatures').updateMany(
      { 'mitigation.aether': { $exists: true } },
      {
        $rename: { 'mitigation.aether': 'mitigation.aetheric' }
      }
    );
    console.log(`  Updated ${creatureResult.modifiedCount} creatures`);

    // Migrate items collection (if it has mitigation)
    console.log('Migrating items collection...');
    const itemResult = await db.collection('items').updateMany(
      { 'mitigation.aether': { $exists: true } },
      {
        $rename: { 'mitigation.aether': 'mitigation.aetheric' }
      }
    );
    console.log(`  Updated ${itemResult.modifiedCount} items`);

    console.log('\nMigration complete!');
    console.log('Summary:');
    console.log(`  - Characters: ${charResult.modifiedCount}`);
    console.log(`  - Creatures: ${creatureResult.modifiedCount}`);
    console.log(`  - Items: ${itemResult.modifiedCount}`);

  } catch (err) {
    console.error('Error during migration:', err);
  }
};

// Main execution
const main = async () => {
  const connected = await connectDB();
  if (!connected) {
    process.exit(1);
  }

  await migrateAether();

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
  process.exit(0);
};

main();

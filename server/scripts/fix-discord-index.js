import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function fixDiscordIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/starventured12');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // Check existing indexes
    const indexes = await collection.indexes();
    console.log('Existing indexes:', indexes);

    // Find the discordId index
    const discordIdIndex = indexes.find(index => 
      index.key && index.key.discordId !== undefined
    );

    if (discordIdIndex) {
      console.log('Found discordId index:', discordIdIndex);
      
      // Check if it's already sparse
      if (discordIdIndex.sparse) {
        console.log('Index is already sparse');
      } else {
        console.log('Index is not sparse, recreating...');
        
        // Drop the existing index
        await collection.dropIndex('discordId_1');
        console.log('Dropped existing discordId index');
        
        // Create new sparse unique index
        await collection.createIndex(
          { discordId: 1 }, 
          { 
            unique: true, 
            sparse: true,
            name: 'discordId_1'
          }
        );
        console.log('Created new sparse unique index for discordId');
      }
    } else {
      console.log('No discordId index found, creating sparse unique index...');
      await collection.createIndex(
        { discordId: 1 }, 
        { 
          unique: true, 
          sparse: true,
          name: 'discordId_1'
        }
      );
      console.log('Created sparse unique index for discordId');
    }

    // Verify the new indexes
    const newIndexes = await collection.indexes();
    const newDiscordIdIndex = newIndexes.find(index => 
      index.key && index.key.discordId !== undefined
    );
    console.log('Updated discordId index:', newDiscordIdIndex);

    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing discord index:', error);
    process.exit(1);
  }
}

fixDiscordIndex();
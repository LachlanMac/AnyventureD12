import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../../.env') });

const fixCampaignIndex = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/starventured12');
    console.log('Connected to MongoDB');

    // Get the campaigns collection
    const db = mongoose.connection.db;
    const campaignsCollection = db.collection('campaigns');

    // Drop the problematic index
    try {
      await campaignsCollection.dropIndex('playerSlots.inviteToken_1');
      console.log('Dropped old playerSlots.inviteToken index');
    } catch (error) {
      console.log('Index might not exist, continuing...');
    }

    // Create the new sparse index
    await campaignsCollection.createIndex(
      { 'playerSlots.inviteToken': 1 },
      { 
        unique: true, 
        sparse: true,
        partialFilterExpression: { 'playerSlots.inviteToken': { $exists: true, $ne: null } }
      }
    );
    console.log('Created new sparse index for playerSlots.inviteToken');

    // List all indexes to verify
    const indexes = await campaignsCollection.indexes();
    console.log('\nCurrent indexes on campaigns collection:');
    indexes.forEach(index => {
      console.log(`- ${index.name}:`, JSON.stringify(index.key));
    });

    console.log('\nIndex fix completed successfully!');
  } catch (error) {
    console.error('Error fixing campaign index:', error);
  } finally {
    await mongoose.disconnect();
  }
};

// Run the fix
fixCampaignIndex();
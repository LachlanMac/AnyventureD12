// Script to migrate aetheric mitigation to aether in existing characters
import mongoose from 'mongoose';
import Character from '../models/Character.js';
import dotenv from 'dotenv';

dotenv.config();

const migrateAetherMitigation = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all characters with aetheric mitigation
    const characters = await Character.find({ 'mitigation.aetheric': { $exists: true } });
    console.log(`Found ${characters.length} characters with aetheric mitigation`);

    let updatedCount = 0;
    for (const character of characters) {
      if (character.mitigation && character.mitigation.aetheric !== undefined) {
        // Copy the value to aether
        character.mitigation.aether = character.mitigation.aetheric;
        
        // Remove the old aetheric field
        character.mitigation.aetheric = undefined;
        
        // Mark the mitigation path as modified to ensure Mongoose saves it
        character.markModified('mitigation');
        
        await character.save();
        updatedCount++;
        console.log(`Updated character: ${character.name} (${character._id})`);
      }
    }

    console.log(`Migration complete. Updated ${updatedCount} characters.`);
    
    // Disconnect from database
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

// Run the migration
migrateAetherMitigation();
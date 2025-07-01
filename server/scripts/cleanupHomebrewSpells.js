import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Spell from '../models/Spell.js';

dotenv.config();

const cleanupHomebrewSpells = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all spells that have a creatorId but aren't marked as homebrew
    const floatingSpells = await Spell.find({
      creatorId: { $exists: true },
      isHomebrew: { $ne: true }
    });

    console.log(`Found ${floatingSpells.length} floating homebrew spells`);

    if (floatingSpells.length > 0) {
      console.log('\nFloating spells:');
      floatingSpells.forEach(spell => {
        console.log(`- ${spell.name} (created by ${spell.creatorName || 'Unknown'})`);
      });

      // Update all floating spells to be properly marked as homebrew
      const result = await Spell.updateMany(
        {
          creatorId: { $exists: true },
          isHomebrew: { $ne: true }
        },
        {
          $set: { isHomebrew: true }
        }
      );

      console.log(`\nUpdated ${result.modifiedCount} spells to be marked as homebrew`);
    }

    // Also ensure all official spells (without creatorId) are marked as not homebrew
    const officialResult = await Spell.updateMany(
      {
        creatorId: { $exists: false },
        isHomebrew: { $ne: false }
      },
      {
        $set: { isHomebrew: false }
      }
    );

    if (officialResult.modifiedCount > 0) {
      console.log(`Updated ${officialResult.modifiedCount} official spells to be marked as not homebrew`);
    }

    console.log('\nCleanup complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

cleanupHomebrewSpells();
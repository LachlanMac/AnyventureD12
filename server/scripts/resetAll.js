// server/scripts/resetAll.js
// Universal reset script that runs all data seeders in the correct order

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { resetAndReseedAncestries } from '../utils/ancestrySeeder.js';
import { resetAndReseedCultures } from '../utils/cultureSeeder.js';
import { resetAndReseedTraits } from '../utils/traitSeeder.js';
import { resetAndReseedModules } from '../utils/moduleSeeder.js';
import { resetAndReseedSpells } from '../utils/spellSeeder.js';
import { resetAndReseedItems } from '../utils/itemSeeder.js';
import { loadCreaturesFromJson } from '../utils/creatureSeeder.js';
import { resetAndReseedSongs } from '../utils/songSeeder.js';
import { resetAndReseedLanguages } from '../utils/languageSeeder.js';
import { resetAndReseedInjuries } from '../utils/injurySeeder.js';
import { seedConditions } from '../utils/conditionSeeder.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/anyventure';

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

// Main function
const main = async () => {
  console.log('========================================');
  console.log('     UNIVERSAL RESET & RESEED SCRIPT    ');
  console.log('========================================\n');

  // Connect to database
  const connected = await connectDB();
  if (!connected) {
    process.exit(1);
  }

  let allSuccess = true;

  try {
    // Order matters! Some data depends on others

    // 1. Ancestries (independent)
    console.log('\n[1/11] Resetting Ancestries...');
    console.log('----------------------------------------');
    const ancestrySuccess = await resetAndReseedAncestries();
    if (!ancestrySuccess) {
      console.error('❌ Ancestry reset failed');
      allSuccess = false;
    } else {
      console.log('✅ Ancestries reset successfully');
    }

    // 2. Cultures (independent)
    console.log('\n[2/11] Resetting Cultures...');
    console.log('----------------------------------------');
    const cultureSuccess = await resetAndReseedCultures();
    if (!cultureSuccess) {
      console.error('❌ Culture reset failed');
      allSuccess = false;
    } else {
      console.log('✅ Cultures reset successfully');
    }

    // 3. Traits (independent)
    console.log('\n[3/11] Resetting Traits...');
    console.log('----------------------------------------');
    const traitSuccess = await resetAndReseedTraits();
    if (!traitSuccess) {
      console.error('❌ Trait reset failed');
      allSuccess = false;
    } else {
      console.log('✅ Traits reset successfully');
    }

    // 4. Modules (independent)
    console.log('\n[4/11] Resetting Modules...');
    console.log('----------------------------------------');
    const moduleSuccess = await resetAndReseedModules();
    if (!moduleSuccess) {
      console.error('❌ Module reset failed');
      allSuccess = false;
    } else {
      console.log('✅ Modules reset successfully');
    }

    // 5. Spells (independent)
    console.log('\n[5/11] Resetting Spells...');
    console.log('----------------------------------------');
    const spellSuccess = await resetAndReseedSpells();
    if (!spellSuccess) {
      console.error('❌ Spell reset failed');
      allSuccess = false;
    } else {
      console.log('✅ Spells reset successfully');
    }

    // 6. Items (independent)
    console.log('\n[6/11] Resetting Items...');
    console.log('----------------------------------------');
    const itemSuccess = await resetAndReseedItems();
    if (!itemSuccess) {
      console.error('❌ Item reset failed');
      allSuccess = false;
    } else {
      console.log('✅ Items reset successfully');
    }

    // 7. Creatures (independent)
    console.log('\n[7/11] Resetting Creatures...');
    console.log('----------------------------------------');
    const creatureSuccess = await loadCreaturesFromJson();
    if (!creatureSuccess) {
      console.error('❌ Creature reset failed');
      allSuccess = false;
    } else {
      console.log('✅ Creatures reset successfully');
    }

    // 8. Songs (independent)
    console.log('\n[8/11] Resetting Songs...');
    console.log('----------------------------------------');
    const songSuccess = await resetAndReseedSongs();
    if (!songSuccess) {
      console.error('❌ Song reset failed');
      allSuccess = false;
    } else {
      console.log('✅ Songs reset successfully');
    }

    // 9. Languages (independent)
    console.log('\n[9/11] Resetting Languages...');
    console.log('----------------------------------------');
    const languageSuccess = await resetAndReseedLanguages();
    if (!languageSuccess) {
      console.error('❌ Language reset failed');
      allSuccess = false;
    } else {
      console.log('✅ Languages reset successfully');
    }

    // 10. Injuries (independent)
    console.log('\n[10/11] Resetting Injuries...');
    console.log('----------------------------------------');
    const injurySuccess = await resetAndReseedInjuries();
    if (!injurySuccess) {
      console.error('❌ Injury reset failed');
      allSuccess = false;
    } else {
      console.log('✅ Injuries reset successfully');
    }

    // 11. Conditions (independent)
    console.log('\n[11/11] Resetting Conditions...');
    console.log('----------------------------------------');
    try {
      await seedConditions();
      console.log('✅ Conditions reset successfully');
    } catch (error) {
      console.error('❌ Condition reset failed:', error);
      allSuccess = false;
    }

    // Final summary
    console.log('\n========================================');
    if (allSuccess) {
      console.log('✅ ALL DATA RESET SUCCESSFULLY!');
      console.log('All foundry_id fields have been generated.');
    } else {
      console.log('⚠️  RESET COMPLETED WITH ERRORS');
      console.log('Please check the logs above for details.');
    }
    console.log('========================================\n');

  } catch (err) {
    console.error('\n❌ Critical error during reset process:', err);
    allSuccess = false;
  } finally {
    // Disconnect from database
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(allSuccess ? 0 : 1);
  }
};

// Run the script
main();
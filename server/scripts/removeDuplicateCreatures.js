import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import Creature from '../models/Creature.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const removeDuplicateCreatures = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/anyventure');
    console.log('Connected to MongoDB');

    // Find all creatures
    const allCreatures = await Creature.find({}).sort({ _id: 1 });
    console.log(`Total creatures in database: ${allCreatures.length}`);

    // Group by name and type
    const creatureMap = new Map();
    const duplicates = [];

    for (const creature of allCreatures) {
      const key = `${creature.name}|${creature.type}`;

      if (creatureMap.has(key)) {
        // This is a duplicate
        duplicates.push(creature);
        console.log(`Found duplicate: ${creature.name} (${creature.type}) - ID: ${creature._id}`);
      } else {
        // First occurrence, keep it
        creatureMap.set(key, creature);
      }
    }

    if (duplicates.length === 0) {
      console.log('✅ No duplicate creatures found!');
      await mongoose.connection.close();
      return;
    }

    console.log(`\nFound ${duplicates.length} duplicate creatures to remove:`);

    for (const dupe of duplicates) {
      console.log(`  🗑️  Deleting duplicate: ${dupe.name} (${dupe.type}) - ID: ${dupe._id}`);
      await Creature.deleteOne({ _id: dupe._id });
    }

    console.log(`\n✅ Removed ${duplicates.length} duplicate creatures`);

    const remaining = await Creature.countDocuments();
    console.log(`📊 Creatures remaining: ${remaining}`);

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error removing duplicate creatures:', error);
    process.exit(1);
  }
};

removeDuplicateCreatures();

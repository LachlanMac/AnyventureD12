import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import Creature from '../models/Creature.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const deleteOldFleshGolems = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/anyventure');
    console.log('Connected to MongoDB');

    // Delete Flesh Golems with type "monster" (the old ones)
    const result = await Creature.deleteMany({
      name: { $regex: 'Flesh Golem' },
      type: 'monster'
    });

    console.log(`✅ Deleted ${result.deletedCount} old Flesh Golem creatures with type "monster"`);

    // Verify remaining
    const remaining = await Creature.find({ name: { $regex: 'Flesh Golem' } });
    console.log(`\n📊 Remaining Flesh Golem creatures: ${remaining.length}`);
    for (const creature of remaining) {
      console.log(`  - ${creature.name} (${creature.type})`);
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

deleteOldFleshGolems();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import Creature from '../models/Creature.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const checkFleshGolems = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/anyventure');
    console.log('Connected to MongoDB');

    const fleshGolems = await Creature.find({ name: { $regex: 'Flesh Golem' } });
    console.log(`\nFound ${fleshGolems.length} Flesh Golem creatures:`);

    for (const creature of fleshGolems) {
      console.log(`  - Name: "${creature.name}"`);
      console.log(`    Type: ${creature.type}`);
      console.log(`    Tier: ${creature.tier}`);
      console.log(`    ID: ${creature._id}`);
      console.log(`    isHomebrew: ${creature.isHomebrew}`);
      console.log('');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkFleshGolems();

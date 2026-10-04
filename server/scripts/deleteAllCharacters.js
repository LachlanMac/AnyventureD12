import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/anyventure';

async function deleteAllCharacters() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const result = await mongoose.connection.db.collection('characters').deleteMany({});
    console.log(`Deleted ${result.deletedCount} characters.`);

    await mongoose.disconnect();
    console.log('Done.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

deleteAllCharacters();

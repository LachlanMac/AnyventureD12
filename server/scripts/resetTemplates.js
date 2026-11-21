import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { resetAndReseedTemplates } from '../utils/templateSeeder.js';

dotenv.config();

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

const main = async () => {
  const connected = await connectDB();
  if (!connected) process.exit(1);

  try {
    console.log('Starting template reset and reseed process...');
    const success = await resetAndReseedTemplates();

    if (success) {
      console.log('Template reset and reseed completed successfully!');
    } else {
      console.log('Template reset and reseed process failed.');
    }
  } catch (err) {
    console.error('Error during reset process:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

main();

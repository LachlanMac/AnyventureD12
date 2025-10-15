import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Condition from '../models/Condition.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const seedConditions = async () => {
  try {
    const conditionsPath = path.join(__dirname, '../../data/conditions/conditions.json');
    const conditionsData = JSON.parse(fs.readFileSync(conditionsPath, 'utf8'));

    // Clear existing conditions
    await Condition.deleteMany({});

    // Insert new conditions
    await Condition.insertMany(conditionsData);

    console.log(`✓ Seeded ${conditionsData.length} conditions`);
    return conditionsData.length;
  } catch (error) {
    console.error('Error seeding conditions:', error);
    throw error;
  }
};

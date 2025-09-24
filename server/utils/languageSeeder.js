// server/utils/languageSeeder.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Language from '../models/Language.js';
import { generateFoundryId } from './foundryIdGenerator.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to languages data file
const languagesFile = path.resolve(__dirname, '../../data/languages/languages.json');

// Function to seed languages from JSON file
export const seedLanguages = async () => {
  try {
    // Check if languages file exists
    if (!fs.existsSync(languagesFile)) {
      console.log('Languages file does not exist. Skipping language seeding.');
      return true;
    }

    // Read and parse the languages file
    const fileContent = fs.readFileSync(languagesFile, 'utf8');
    const languagesData = JSON.parse(fileContent);

    if (!Array.isArray(languagesData) || languagesData.length === 0) {
      console.log('No language data found.');
      return true;
    }

    let languageCount = 0;

    for (const langData of languagesData) {
      try {
        // Check if language already exists by its unique id
        const existingLanguage = await Language.findOne({ id: langData.id });

        if (existingLanguage) {
          // Update existing language but preserve the foundry_id
          const updateData = {
            ...langData,
            foundry_id: existingLanguage.foundry_id // Preserve the existing foundry_id
          };
          await Language.findByIdAndUpdate(existingLanguage._id, updateData);
          console.log(`Updated language: ${langData.name}`);
        } else {
          // Create new language
          // Generate foundry_id if missing
          if (!langData.foundry_id) {
            langData.foundry_id = generateFoundryId();
          }
          await Language.create(langData);
          console.log(`Created language: ${langData.name}`);
          languageCount++;
        }
      } catch (err) {
        console.error(`Error processing language ${langData.name}: ${err.message}`);
      }
    }

    console.log(`Successfully seeded ${languageCount} new languages`);
    return true;
  } catch (error) {
    console.error('Error seeding languages:', error);
    return false;
  }
};

// Function to reset and reseed all languages
export const resetAndReseedLanguages = async () => {
  try {
    console.log('Updating and reseeding all languages...');

    // Get list of language IDs from JSON file
    const validLanguageIds = [];
    if (fs.existsSync(languagesFile)) {
      const fileContent = fs.readFileSync(languagesFile, 'utf8');
      const languagesData = JSON.parse(fileContent);
      validLanguageIds.push(...languagesData.map(l => l.id));
    }

    // Delete languages not in the JSON file
    const deletedLanguages = await Language.deleteMany({
      id: { $nin: validLanguageIds }
    });

    if (deletedLanguages.deletedCount > 0) {
      console.log(`Deleted ${deletedLanguages.deletedCount} languages not in source files`);
    }

    // Now seed/update languages from files
    await seedLanguages();

    return true;
  } catch (error) {
    console.error('Error resetting languages:', error);
    return false;
  }
};

export default { seedLanguages, resetAndReseedLanguages };
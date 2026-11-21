import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Template from '../models/Template.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatesDir = path.resolve(__dirname, '../../data/templates');

const VERBOSE_LOGGING = true;

const readTemplatesFromFS = () => {
  try {
    if (!fs.existsSync(templatesDir)) {
      console.log('Templates directory not found, creating it...');
      fs.mkdirSync(templatesDir, { recursive: true });
      return { templates: [], templateNames: [] };
    }

    const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.json'));
    const templates = [];
    const templateNames = [];

    for (const file of files) {
      const filePath = path.join(templatesDir, file);
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        if (!data.name) {
          console.error(`Template in ${filePath} is missing a name property`);
          continue;
        }

        templates.push(data);
        templateNames.push(data.name.toLowerCase());
      } catch (err) {
        console.error(`Error parsing ${filePath}: ${err.message}`);
      }
    }

    return { templates, templateNames };
  } catch (err) {
    console.error(`Error reading templates directory: ${err.message}`);
    return { templates: [], templateNames: [] };
  }
};

export const seedTemplates = async () => {
  try {
    const { templates, templateNames } = readTemplatesFromFS();

    if (!templates.length) {
      console.log('No template data found.');
      return;
    }

    console.log(`Found ${templates.length} templates to seed.`);

    for (const data of templates) {
      try {
        if (!data.name || typeof data.name !== 'string') {
          console.error(`Template missing valid name: ${JSON.stringify(data)}`);
          continue;
        }

        const existing = await Template.findOne({ name: data.name });

        if (existing) {
          if (VERBOSE_LOGGING) console.log(`Updating existing template: ${data.name}`);

          const updateData = { ...data, _id: existing._id, source: 'official' };
          await Template.replaceOne({ _id: existing._id }, updateData);
        } else {
          if (VERBOSE_LOGGING) console.log(`Creating new template: ${data.name}`);

          data.source = 'official';
          await Template.create(data);
        }
      } catch (error) {
        console.error(`Error processing template ${data?.name || 'unknown'}: ${error.message}`);
      }
    }

    // Delete templates from DB that no longer exist in JSON (official only)
    const allDbTemplates = await Template.find({ source: 'official' });
    const toDelete = allDbTemplates.filter(
      t => t.name && !templateNames.includes(t.name.toLowerCase())
    );

    if (toDelete.length > 0) {
      console.log(`Deleting ${toDelete.length} templates not in JSON files...`);
      for (const t of toDelete) {
        if (VERBOSE_LOGGING) console.log(`Deleting template: ${t.name}`);
        await Template.deleteOne({ _id: t._id });
      }
    }

    console.log('Template seeding completed successfully.');
  } catch (err) {
    console.error(`Error seeding templates: ${err.message}`);
  }
};

export const resetAndReseedTemplates = async () => {
  try {
    console.log('Starting template reset and reseed...');
    await seedTemplates();
    console.log('Template reset and reseed completed successfully!');
    return true;
  } catch (err) {
    console.error(`Error during template reset: ${err.message}`);
    return false;
  }
};

export const initializeTemplates = async () => {
  try {
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
      console.log('Created templates directory.');
    }
    await seedTemplates();
  } catch (err) {
    console.error(`Error initializing templates: ${err.message}`);
  }
};

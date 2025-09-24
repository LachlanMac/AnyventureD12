import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Song from '../models/Song.js';
import { generateFoundryId } from './foundryIdGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const songsDir = path.resolve(__dirname, '../../data/songs');

const readSongsFromDirectory = (dirPath) => {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      results.push(...readSongsFromDirectory(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      try {
        const raw = fs.readFileSync(fullPath, 'utf-8');
        const data = JSON.parse(raw);
        results.push(data);
      } catch (_) { /* ignore */ }
    }
  }
  return results;
};

export const seedSongs = async () => {
  try {
    if (!fs.existsSync(songsDir)) return true;
    const songs = readSongsFromDirectory(songsDir);
    let created = 0;
    for (const s of songs) {
      if (!s.name) continue;
      const existing = await Song.findOne({ name: s.name });
      if (existing) {
        await Song.findByIdAndUpdate(existing._id, s);
      } else {
        // Generate foundry_id if missing
        if (!s.foundry_id) {
          s.foundry_id = generateFoundryId();
        }
        await Song.create(s);
        created++;
      }
    }
    console.log(`Seeded songs. Created ${created}, total now ${await Song.countDocuments()}`);
    return true;
  } catch (err) {
    console.error('Error seeding songs:', err);
    return false;
  }
};

export const initializeSongs = async () => {
  try {
    await seedSongs();
    console.log('Song initialization complete.');
    return true;
  } catch (err) {
    console.error('Error initializing songs:', err);
    return false;
  }
};


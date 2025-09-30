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
    let updated = 0;

    for (const s of songs) {
      if (!s.id) continue;
      const existing = await Song.findOne({ id: s.id });
      if (existing) {
        // Preserve existing foundry_id
        s.foundry_id = existing.foundry_id;
        await Song.findByIdAndUpdate(existing._id, s);
        updated++;
      } else {
        // Generate foundry_id if missing
        if (!s.foundry_id) {
          s.foundry_id = generateFoundryId();
        }
        await Song.create(s);
        created++;
      }
    }
    console.log(`Seeded songs. Created ${created}, updated ${updated}, total now ${await Song.countDocuments()}`);
    return true;
  } catch (err) {
    console.error('Error seeding songs:', err);
    return false;
  }
};

// Function to reset and reseed all songs
export const resetAndReseedSongs = async () => {
  try {
    console.log('Updating and reseeding all songs...');

    // Get list of song IDs from JSON files
    const validSongIds = [];
    if (fs.existsSync(songsDir)) {
      const songs = readSongsFromDirectory(songsDir);
      for (const song of songs) {
        if (song.id) {
          validSongIds.push(song.id);
        }
      }
    }

    // Delete songs that are not in JSON files
    if (validSongIds.length > 0) {
      const deleteResult = await Song.deleteMany({
        id: { $nin: validSongIds }
      });
      if (deleteResult.deletedCount > 0) {
        console.log(`Deleted ${deleteResult.deletedCount} orphaned songs not found in JSON files.`);
      }
    }

    // Now seed/update songs from JSON files
    const success = await seedSongs();

    if (success) {
      const newSongCount = await Song.countDocuments();
      console.log(`Successfully reseeded ${newSongCount} songs.`);
      return true;
    }

    return false;
  } catch (err) {
    console.error(`Error resetting songs: ${err.message}`);
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


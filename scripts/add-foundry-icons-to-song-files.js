// Add foundry_icon field to all song JSON files based on their type
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Icon mapping based on song type
const iconMap = {
  ballad: 'icons/sundries/scrolls/scroll-writing-silver-brown.webp',
  song: 'icons/tools/instruments/harp-yellow-teal.webp'
};

// Path to songs data directory
const songsDir = path.resolve(__dirname, '../data/songs');

function addIconsToSongFiles() {
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  // Check if songs directory exists
  if (!fs.existsSync(songsDir)) {
    console.log(`❌ Songs directory not found: ${songsDir}`);
    return;
  }

  // Get all JSON files in songs directory
  const songFiles = fs.readdirSync(songsDir).filter(file =>
    file.endsWith('.json')
  );

  console.log(`Found ${songFiles.length} song files to process`);

  // Process each song file
  for (const songFile of songFiles) {
    const filePath = path.join(songsDir, songFile);

    try {
      // Read the song file
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const songData = JSON.parse(fileContent);

      // Check if it already has a foundry_icon
      if (songData.foundry_icon && songData.foundry_icon !== '') {
        console.log(`⏭️ Skipping ${songFile} - already has icon: ${songData.foundry_icon}`);
        skippedCount++;
        continue;
      }

      // Get the icon based on song type
      const songType = songData.type || 'song'; // Default to 'song' if type is missing
      const icon = iconMap[songType];

      if (icon) {
        // Add the foundry_icon
        songData.foundry_icon = icon;

        // Write the updated song back to file
        fs.writeFileSync(filePath, JSON.stringify(songData, null, 2));
        console.log(`✅ Updated ${songFile} (${songType}) with icon: ${icon}`);
        updatedCount++;
      } else {
        console.log(`⚠️ No icon mapping found for ${songFile} with type: ${songType}`);
      }

    } catch (error) {
      console.error(`❌ Error processing ${songFile}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log(`✅ Updated: ${updatedCount} song files`);
  console.log(`⏭️ Skipped: ${skippedCount} song files (already had icons)`);
  console.log(`❌ Errors: ${errorCount} song files`);
  console.log('='.repeat(60));
}

// Run the script
console.log('Starting song file icon update...');
console.log('='.repeat(60));
addIconsToSongFiles();
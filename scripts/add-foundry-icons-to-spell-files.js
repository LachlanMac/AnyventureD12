// Add foundry_icon field to all spell JSON files based on their subschool
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Icon mapping based on subschool
const iconMap = {
  // Black Magic
  fiend: 'icons/creatures/unholy/demon-fanged-horned-yellow.webp',
  necromancy: 'icons/creatures/magical/spirit-undead-ghost-blue.webp',
  witchcraft: 'icons/magic/unholy/hand-claw-fog-green.webp',

  // Divine
  celestial: 'icons/magic/holy/angel-winged-humanoid-blue.webp',
  protection: 'icons/magic/holy/barrier-shield-winged-blue.webp',
  radiant: 'icons/magic/holy/prayer-hands-glowing-yellow.webp',

  // Metamagic
  fey: 'icons/creatures/magical/fae-fairy-winged-glowing-green.webp',
  illusion: 'icons/magic/defensive/illusion-evasion-echo-purple.webp',
  transmutation: 'icons/magic/time/arrows-circling-green.webp',

  // Mysticism
  cosmic: 'icons/magic/movement/trail-streak-impact-blue.webp',
  divination: 'icons/magic/control/hypnosis-mesmerism-eye.webp',
  spirit: 'icons/magic/control/energy-stream-link-spiral-white.webp',

  // Primal
  draconic: 'icons/creatures/claws/claw-hooked-purple.webp',
  elemental: 'icons/magic/symbols/elements-air-earth-fire-water.webp',
  nature: 'icons/magic/nature/tree-spirit-green.webp'
};

// Path to spells data directory
const spellsDir = path.resolve(__dirname, '../data/spells');

function addIconsToSpellFiles() {
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  // Get all subdirectories in spells directory
  const schoolDirs = fs.readdirSync(spellsDir).filter(file =>
    fs.statSync(path.join(spellsDir, file)).isDirectory()
  );

  console.log(`Found ${schoolDirs.length} spell school directories`);

  // Process each school directory
  for (const schoolDir of schoolDirs) {
    const schoolPath = path.join(spellsDir, schoolDir);

    // Get all subschool directories
    const subschoolDirs = fs.readdirSync(schoolPath).filter(file =>
      fs.statSync(path.join(schoolPath, file)).isDirectory()
    );

    console.log(`\n📁 Processing ${schoolDir} with ${subschoolDirs.length} subschools`);

    // Process each subschool directory
    for (const subschoolDir of subschoolDirs) {
      const subschoolPath = path.join(schoolPath, subschoolDir);

      // Get the icon for this subschool
      const icon = iconMap[subschoolDir];

      if (!icon) {
        console.log(`  ⚠️ No icon mapping found for subschool: ${subschoolDir}`);
        continue;
      }

      // Get all JSON files in this subschool directory
      const spellFiles = fs.readdirSync(subschoolPath).filter(file =>
        file.endsWith('.json')
      );

      console.log(`  📂 ${subschoolDir}: Processing ${spellFiles.length} spell files`);

      // Process each spell file
      for (const spellFile of spellFiles) {
        const filePath = path.join(subschoolPath, spellFile);

        try {
          // Read the spell file
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const spellData = JSON.parse(fileContent);

          // Check if it already has a foundry_icon
          if (spellData.foundry_icon && spellData.foundry_icon !== '') {
            console.log(`    ⏭️ Skipping ${spellFile} - already has icon: ${spellData.foundry_icon}`);
            skippedCount++;
            continue;
          }

          // Add the foundry_icon
          spellData.foundry_icon = icon;

          // Write the updated spell back to file
          fs.writeFileSync(filePath, JSON.stringify(spellData, null, 2));
          console.log(`    ✅ Updated ${spellFile} with icon: ${icon}`);
          updatedCount++;

        } catch (error) {
          console.error(`    ❌ Error processing ${spellFile}:`, error.message);
          errorCount++;
        }
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log(`✅ Updated: ${updatedCount} spell files`);
  console.log(`⏭️ Skipped: ${skippedCount} spell files (already had icons)`);
  console.log(`❌ Errors: ${errorCount} spell files`);
  console.log('='.repeat(60));
}

// Run the script
console.log('Starting spell file icon update...');
console.log('='.repeat(60));
addIconsToSpellFiles();
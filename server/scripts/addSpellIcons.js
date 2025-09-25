// Add foundry_icon field to all existing spells based on their subschool
import mongoose from 'mongoose';
import Spell from '../models/Spell.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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

async function addSpellIcons() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all spells
    const spells = await Spell.find({});
    console.log(`Found ${spells.length} spells to process`);

    let updatedCount = 0;
    let skippedCount = 0;

    // Process each spell
    for (const spell of spells) {
      // Skip if it already has an icon
      if (spell.foundry_icon && spell.foundry_icon !== '') {
        console.log(`⏭️ Skipping "${spell.name}" - already has icon: ${spell.foundry_icon}`);
        skippedCount++;
        continue;
      }

      // Get the icon based on subschool
      const icon = iconMap[spell.subschool];

      if (icon) {
        // Update the spell with the appropriate icon
        await Spell.updateOne(
          { _id: spell._id },
          { foundry_icon: icon }
        );
        console.log(`✅ Updated "${spell.name}" (${spell.subschool}) with icon: ${icon}`);
        updatedCount++;
      } else {
        console.log(`⚠️ No icon mapping found for "${spell.name}" with subschool: ${spell.subschool}`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`✅ Updated: ${updatedCount} spells`);
    console.log(`⏭️ Skipped: ${skippedCount} spells (already had icons)`);
    console.log(`⚠️ Unmapped: ${spells.length - updatedCount - skippedCount} spells`);

    // Verify the update worked
    const updatedSpells = await Spell.find({ foundry_icon: { $ne: '' } });
    console.log(`\n🔍 Verification: ${updatedSpells.length} spells now have icons`);

  } catch (error) {
    console.error('❌ Error updating spell icons:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the script
addSpellIcons();
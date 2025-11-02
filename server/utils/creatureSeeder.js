import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Creature from '../models/Creature.js';
import Spell from '../models/Spell.js';
import { generateFoundryId } from './foundryIdGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadCreaturesFromJson = async () => {
  try {
    console.log('🦄 Loading creatures from JSON files...');

    const dataPath = path.join(__dirname, '../../data/monsters');
    const creatureTypes = ['dark', 'undead', 'divine', 'monster', 'humanoid', 'construct', 'plantoid', 'fey', 'elemental', 'beast'];

    let loadedCount = 0;
    let updatedCount = 0;
    const creatureNamesFromFiles = new Set();
    const creatureNameTypesFromFiles = new Set(); // Track name+type combinations

    for (const type of creatureTypes) {
      const typePath = path.join(dataPath, type);

      if (!fs.existsSync(typePath)) {
        console.log(`⚠️  Type directory not found: ${type}`);
        continue;
      }

      const files = fs.readdirSync(typePath).filter(file => file.endsWith('.json'));

      for (const file of files) {
        try {
          const filePath = path.join(typePath, file);
          const rawData = fs.readFileSync(filePath, 'utf8');
          const creatureData = JSON.parse(rawData);

          // Track creature names from files
          creatureNamesFromFiles.add(creatureData.name);
          // Track name+type combinations to catch type changes
          creatureNameTypesFromFiles.add(`${creatureData.name}|${type}`);

          // Ensure the creature has the correct type
          creatureData.type = type;
          creatureData.isHomebrew = false;
          creatureData.source = 'Official';
          
          // Handle spell references if they exist
          if (creatureData.spellNames && Array.isArray(creatureData.spellNames)) {
            const spellIds = [];
            for (const spellName of creatureData.spellNames) {
              const spell = await Spell.findOne({ name: spellName, isHomebrew: false });
              if (spell) {
                spellIds.push(spell._id);
              } else {
                console.log(`⚠️  Spell not found: ${spellName} for creature ${creatureData.name}`);
              }
            }
            creatureData.spells = spellIds;
            delete creatureData.spellNames; // Remove the temporary field
          }
          
          // Check if creature already exists (by name and type)
          const existingCreature = await Creature.findOne({ 
            name: creatureData.name, 
            type: creatureData.type,
            isHomebrew: false 
          });

          if (existingCreature) {
            // Update existing creature but preserve foundry_id and _id
            const updateData = {
              ...creatureData,
              foundry_id: existingCreature.foundry_id // Preserve existing foundry_id
            };

            // Generate foundry_id if existing creature doesn't have one
            if (!existingCreature.foundry_id) {
              updateData.foundry_id = generateFoundryId();
              console.log(`  Generated foundry_id for existing creature: ${updateData.foundry_id}`);
            }

            // Log portrait changes
            if (existingCreature.foundry_portrait !== updateData.foundry_portrait) {
              console.log(`  📸 Portrait updated: "${existingCreature.foundry_portrait}" → "${updateData.foundry_portrait}"`);
            }

            await Creature.findByIdAndUpdate(existingCreature._id, updateData, {
              runValidators: true,
              new: true
            });
            updatedCount++;
            console.log(`✅ Updated creature: ${creatureData.name} (${type})`);
          } else {
            // Generate foundry_id if missing
            if (!creatureData.foundry_id) {
              creatureData.foundry_id = generateFoundryId();
              console.log(`  Generated foundry_id: ${creatureData.foundry_id}`);
            }

            // Create new creature
            const creature = new Creature(creatureData);
            await creature.save();
            loadedCount++;
            console.log(`✅ Loaded creature: ${creatureData.name} (${type})`);
          }
        } catch (error) {
          console.error(`❌ Error loading creature from ${file}:`, error.message);
        }
      }
    }

    // Find and delete orphaned creatures (non-homebrew creatures not in JSON files)
    // This includes creatures whose name+type combination no longer exists (e.g., type changed from "monster" to "construct")
    console.log('\n🧹 Checking for orphaned creatures...');
    const creaturesInDatabase = await Creature.find({ isHomebrew: { $ne: true } }, 'name type');
    const orphanedCreatures = creaturesInDatabase.filter(dbCreature => {
      const nameTypeKey = `${dbCreature.name}|${dbCreature.type}`;
      return !creatureNameTypesFromFiles.has(nameTypeKey);
    });

    let deletedCount = 0;
    if (orphanedCreatures.length > 0) {
      console.log(`Found ${orphanedCreatures.length} orphaned non-homebrew creatures to delete:`);
      for (const orphan of orphanedCreatures) {
        console.log(`  🗑️  Deleting orphaned creature: ${orphan.name} (${orphan.type})`);
        await Creature.deleteOne({ _id: orphan._id });
        deletedCount++;
      }
    } else {
      console.log('✅ No orphaned creatures found');
    }

    console.log(`\n🦄 Creature loading complete!`);
    console.log(`📊 Summary: ${loadedCount} new creatures loaded, ${updatedCount} creatures updated, ${deletedCount} orphaned creatures deleted`);

    return true;
  } catch (error) {
    console.error('❌ Error loading creatures from JSON:', error);
    return false;
  }
};

export {
  loadCreaturesFromJson
};
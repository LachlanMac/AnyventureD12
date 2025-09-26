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

            await Creature.findByIdAndUpdate(existingCreature._id, updateData, {
              runValidators: true
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

    console.log(`🦄 Creature loading complete!`);
    console.log(`📊 Summary: ${loadedCount} new creatures loaded, ${updatedCount} creatures updated`);
    
    return { loadedCount, updatedCount };
  } catch (error) {
    console.error('❌ Error loading creatures from JSON:', error);
    throw error;
  }
};

export {
  loadCreaturesFromJson
};
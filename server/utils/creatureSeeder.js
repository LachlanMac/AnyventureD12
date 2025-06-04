import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Creature from '../models/Creature.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadCreaturesFromJson = async () => {
  try {
    console.log('🦄 Loading creatures from JSON files...');
    
    const dataPath = path.join(__dirname, '../../data/monsters');
    const creatureTypes = ['fiend', 'undead', 'divine', 'monster', 'humanoid', 'construct', 'plantoid', 'fey', 'elemental'];
    
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
          
          // Check if creature already exists (by name and type)
          const existingCreature = await Creature.findOne({ 
            name: creatureData.name, 
            type: creatureData.type,
            isHomebrew: false 
          });

          if (existingCreature) {
            // Update existing creature while preserving ObjectId
            await Creature.findByIdAndUpdate(existingCreature._id, creatureData, {
              runValidators: true
            });
            updatedCount++;
            console.log(`✅ Updated creature: ${creatureData.name} (${type})`);
          } else {
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
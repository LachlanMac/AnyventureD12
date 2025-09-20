import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const wandsDir = path.resolve(__dirname, '../data/items/weapons/wands');

// Mapping of wand file names to their updates
const wandUpdates = {
  'flame_wand.json': {
    name: 'Flame Wand',
    description: 'A magical wand infused with fiery energy that channels pure heat damage.',
    damage_type: 'heat',
    category: 'primal_magic',
    core_ingredient: 'Heat Core'
  },
  'spirit_wand.json': {
    name: 'Spirit Wand', 
    description: 'A magical wand infused with otherworldly energy that channels pure aetheric damage.',
    damage_type: 'aetheric',
    category: 'mysticism_magic',
    core_ingredient: 'Aetheric Core'
  },
  'ice_wand.json': {
    name: 'Ice Wand',
    description: 'A magical wand infused with freezing energy that channels pure cold damage.',
    damage_type: 'cold',
    category: 'primal_magic',
    core_ingredient: 'Cold Core'
  },
  'jolting_wand.json': {
    name: 'Jolting Wand',
    description: 'A magical wand infused with crackling energy that channels pure electric damage.',
    damage_type: 'electric', 
    category: 'primal_magic',
    core_ingredient: 'Electric Core'
  },
  'prayer_wand.json': {
    name: 'Prayer Wand',
    description: 'A magical wand infused with divine energy that channels pure divine damage.',
    damage_type: 'divine',
    category: 'divine_magic',
    core_ingredient: 'Divine Core'
  },
  'mind_wand.json': {
    name: 'Mind Wand',
    description: 'A magical wand infused with mental energy that channels pure psychic damage.',
    damage_type: 'psychic',
    category: 'mysticism_magic',
    core_ingredient: 'Psychic Core'
  },
  'earthen_wand.json': {
    name: 'Earthen Wand',
    description: 'A magical wand infused with earthen energy that channels pure physical damage.',
    damage_type: 'physical',
    category: 'primal_magic',
    core_ingredient: 'Physical Core'
  }
};

console.log('Updating wand files...\n');

Object.entries(wandUpdates).forEach(([fileName, updates]) => {
  const filePath = path.join(wandsDir, fileName);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${fileName} not found, skipping...`);
    return;
  }
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const wand = JSON.parse(fileContent);
    
    // Update basic properties
    wand.name = updates.name;
    wand.description = updates.description;
    
    // Update primary damage properties
    if (wand.primary) {
      wand.primary.damage_type = updates.damage_type;
      wand.primary.category = updates.category;
    }
    
    // Update recipe ingredient if it exists
    if (wand.recipe && wand.recipe.ingredients) {
      // Replace the core ingredient (first ingredient is typically the core)
      wand.recipe.ingredients[0] = updates.core_ingredient;
    }
    
    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(wand, null, 2));
    console.log(`✅ Updated ${fileName} → ${updates.name}`);
    
  } catch (error) {
    console.error(`❌ Error updating ${fileName}:`, error.message);
  }
});

console.log('\nWand updates complete!');
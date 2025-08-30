// server/controllers/spellController.js
import Spell from '../models/Spell.js';
import Character from '../models/Character.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to spells data directory
const spellsDir = path.resolve(__dirname, '../../data/spells');

// @desc    Get all spells (excluding homebrew)
// @route   GET /api/spells
// @access  Public
export const getSpells = async (req, res) => {
  try {
    // Only fetch official spells (not homebrew)
    const spells = await Spell.find({ isHomebrew: { $ne: true } });
    res.json(spells);
  } catch (error) {
    console.error('Error fetching spells:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single spell (excluding homebrew)
// @route   GET /api/spells/:id
// @access  Public
export const getSpell = async (req, res) => {
  try {
    const spell = await Spell.findById(req.params.id);
    
    if (!spell) {
      return res.status(404).json({ message: 'Spell not found' });
    }
    
    // Don't return homebrew spells through this endpoint
    if (spell.isHomebrew) {
      return res.status(404).json({ message: 'Spell not found' });
    }
    
    res.json(spell);
  } catch (error) {
    console.error('Error fetching spell:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get spells by school
// @route   GET /api/spells/school/:school
// @access  Public
export const getSpellsBySchool = async (req, res) => {
  try {
    const { school } = req.params;
    
    // Validate school
    const validSchools = ['meta', 'black', 'divine', 'mysticism', 'primal'];
    if (!validSchools.includes(school)) {
      return res.status(400).json({ message: 'Invalid spell school' });
    }
    
    const spells = await Spell.find({ school, isHomebrew: { $ne: true } });
    res.json(spells);
  } catch (error) {
    console.error('Error fetching spells by school:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get spells by subschool
// @route   GET /api/spells/subschool/:subschool
// @access  Public
export const getSpellsBySubschool = async (req, res) => {
  try {
    const { subschool } = req.params;
    
    const spells = await Spell.find({ subschool, isHomebrew: { $ne: true } });
    res.json(spells);
  } catch (error) {
    console.error('Error fetching spells by subschool:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get character spells
// @route   GET /api/characters/:characterId/spells
// @access  Private
export const getCharacterSpells = async (req, res) => {
  try {
    const character = await Character.findById(req.params.characterId)
      .populate('spells.spellId');
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    // Check authorization - character should belong to user
    if (character.userId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    res.json({
      spells: character.spells,
      spellSlots: character.spellSlots,
      usedSlots: character.spells.length
    });
  } catch (error) {
    console.error('Error fetching character spells:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a spell to a character
// @route   POST /api/characters/:characterId/spells/:spellId
// @access  Private
export const addSpellToCharacter = async (req, res) => {
  try {
    const character = await Character.findById(req.params.characterId);
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    // Check authorization - character should belong to user
    if (character.userId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const spell = await Spell.findById(req.params.spellId);
    
    if (!spell) {
      return res.status(404).json({ message: 'Spell not found' });
    }
    
    // Add spell to character
    const result = await character.addSpell(spell._id);
    
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }
    
    // Return updated character with populated spells
    const updatedCharacter = await Character.findById(character._id)
      .populate('spells.spellId');
    
    res.json(updatedCharacter);
  } catch (error) {
    console.error('Error adding spell to character:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove a spell from a character
// @route   DELETE /api/characters/:characterId/spells/:spellId
// @access  Private
export const removeSpellFromCharacter = async (req, res) => {
  try {
    const character = await Character.findById(req.params.characterId);
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    // Check authorization - character should belong to user
    if (character.userId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Remove spell from character
    const result = await character.removeSpell(req.params.spellId);
    
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }
    
    // Return updated character with populated spells
    const updatedCharacter = await Character.findById(character._id)
      .populate('spells.spellId');
    
    res.json(updatedCharacter);
  } catch (error) {
    console.error('Error removing spell from character:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Seed spells from JSON files
// @route   POST /api/spells/seed
// @access  Admin
export const seedSpells = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized as admin' });
    }
    
    const schools = ['meta', 'black', 'divine', 'mysticism', 'primal'];
    let spellCount = 0;
    
    for (const school of schools) {
      const schoolDir = path.join(spellsDir, school);
      
      // Skip if directory doesn't exist
      if (!fs.existsSync(schoolDir)) {
        console.log(`Directory for school ${school} not found, skipping...`);
        continue;
      }
      
      const subschools = fs.readdirSync(schoolDir)
        .filter(file => fs.statSync(path.join(schoolDir, file)).isDirectory());
      
      for (const subschool of subschools) {
        const subschoolDir = path.join(schoolDir, subschool);
        
        // Get all JSON files in the subschool directory
        const files = fs.readdirSync(subschoolDir)
          .filter(file => file.endsWith('.json'));
        
        for (const file of files) {
          const filePath = path.join(subschoolDir, file);
          const fileContent = fs.readFileSync(filePath, 'utf8');
          
          try {
            const spellData = JSON.parse(fileContent);
            
            // Add school and subschool if not present
            spellData.school = school;
            spellData.subschool = subschool;
            
            // Check if spell already exists
            const existingSpell = await Spell.findOne({ name: spellData.name });
            
            if (existingSpell) {
              // Update existing spell
              await Spell.findByIdAndUpdate(existingSpell._id, spellData);
            } else {
              // Create new spell
              await Spell.create(spellData);
              spellCount++;
            }
          } catch (err) {
            console.error(`Error processing ${filePath}: ${err.message}`);
          }
        }
      }
    }
    
    res.json({ message: `Successfully added ${spellCount} new spells` });
  } catch (error) {
    console.error('Error seeding spells:', error);
    res.status(500).json({ message: error.message });
  }
};
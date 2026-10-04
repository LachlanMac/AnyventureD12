import express from 'express';
import { protect } from '../middleware/auth.js';
import Character from '../models/Character.js';
import Injury from '../models/Injury.js';

const router = express.Router({ mergeParams: true });

router.use(protect);

// GET /api/characters/:characterId/injuries - Get character's injuries
router.get('/', async (req, res) => {
  try {
    const character = await Character.findById(req.params.characterId)
      .populate('injuries.injuryId');

    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    res.json(character.injuries || []);
  } catch (error) {
    console.error('Error fetching character injuries:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/characters/:characterId/injuries/:injuryId - Add injury to character
router.post('/:injuryId', async (req, res) => {
  try {
    const character = await Character.findById(req.params.characterId);
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    // Verify ownership
    const userId = req.user._id.toString();
    if (character.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const injury = await Injury.findById(req.params.injuryId);
    if (!injury) {
      return res.status(404).json({ message: 'Injury not found' });
    }

    const { notes } = req.body || {};

    character.injuries.push({
      injuryId: injury._id,
      notes: notes || '',
      dateAcquired: new Date()
    });

    await character.save();

    // Re-populate and return
    await character.populate('injuries.injuryId');
    res.json(character.injuries);
  } catch (error) {
    console.error('Error adding injury:', error);
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/characters/:characterId/injuries/:index - Remove injury by array index
router.delete('/:index', async (req, res) => {
  try {
    const character = await Character.findById(req.params.characterId);
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    const userId = req.user._id.toString();
    if (character.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const index = parseInt(req.params.index);
    if (isNaN(index) || index < 0 || index >= character.injuries.length) {
      return res.status(400).json({ message: 'Invalid injury index' });
    }

    character.injuries.splice(index, 1);
    await character.save();

    await character.populate('injuries.injuryId');
    res.json(character.injuries);
  } catch (error) {
    console.error('Error removing injury:', error);
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/characters/:characterId/injuries/:index/notes - Update injury notes
router.put('/:index/notes', async (req, res) => {
  try {
    const character = await Character.findById(req.params.characterId);
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    const userId = req.user._id.toString();
    if (character.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const index = parseInt(req.params.index);
    if (isNaN(index) || index < 0 || index >= character.injuries.length) {
      return res.status(400).json({ message: 'Invalid injury index' });
    }

    character.injuries[index].notes = req.body.notes || '';
    await character.save();

    await character.populate('injuries.injuryId');
    res.json(character.injuries);
  } catch (error) {
    console.error('Error updating injury notes:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;

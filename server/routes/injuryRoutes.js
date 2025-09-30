import express from 'express';
import Injury from '../models/Injury.js';

const router = express.Router();

// Get all injuries
router.get('/', async (req, res) => {
  try {
    const injuries = await Injury.find({}).sort({ type: 1, name: 1 });
    res.json(injuries);
  } catch (error) {
    console.error('Error fetching injuries:', error);
    res.status(500).json({ error: 'Failed to fetch injuries' });
  }
});

// Get injuries by type
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const injuries = await Injury.find({ type }).sort({ name: 1 });
    res.json(injuries);
  } catch (error) {
    console.error('Error fetching injuries by type:', error);
    res.status(500).json({ error: 'Failed to fetch injuries' });
  }
});

// Get single injury by ID
router.get('/:id', async (req, res) => {
  try {
    const injury = await Injury.findOne({ id: req.params.id });
    if (!injury) {
      return res.status(404).json({ error: 'Injury not found' });
    }
    res.json(injury);
  } catch (error) {
    console.error('Error fetching injury:', error);
    res.status(500).json({ error: 'Failed to fetch injury' });
  }
});

export default router;
import express from 'express';
import Condition from '../models/Condition.js';

const router = express.Router();

// Get all conditions
router.get('/', async (req, res) => {
  try {
    const conditions = await Condition.find({}).sort({ category: 1, name: 1 });
    res.json(conditions);
  } catch (error) {
    console.error('Error fetching conditions:', error);
    res.status(500).json({ message: 'Error fetching conditions' });
  }
});

// Get conditions by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const conditions = await Condition.find({ category }).sort({ name: 1 });
    res.json(conditions);
  } catch (error) {
    console.error('Error fetching conditions by category:', error);
    res.status(500).json({ message: 'Error fetching conditions' });
  }
});

// Get single condition by ID
router.get('/:id', async (req, res) => {
  try {
    const condition = await Condition.findOne({ id: req.params.id });
    if (!condition) {
      return res.status(404).json({ message: 'Condition not found' });
    }
    res.json(condition);
  } catch (error) {
    console.error('Error fetching condition:', error);
    res.status(500).json({ message: 'Error fetching condition' });
  }
});

export default router;

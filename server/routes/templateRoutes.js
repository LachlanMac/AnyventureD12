import express from 'express';
import Template from '../models/Template.js';

const router = express.Router();

// GET all templates
router.get('/', async (req, res) => {
  try {
    const templates = await Template.find().sort({ category: 1, name: 1 });
    res.json(templates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single template by id
router.get('/:id', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template not found' });
    res.json(template);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

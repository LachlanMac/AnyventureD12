import express from 'express';
import { generateCommoner, getGeneratorOptions } from '../utils/commonerGenerator.js';
import { loadStyles, writeBiography } from '../utils/biographyWriter.js';

const router = express.Router();

// GET the values the generator page can lock to (ancestries, occupations, traits, ...)
router.get('/options', async (req, res) => {
  try {
    res.json(await getGeneratorOptions());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST { include, locks, counts } -> a rolled commoner preview (nothing is saved)
router.post('/commoner', async (req, res) => {
  try {
    const { include, locks, counts } = req.body || {};
    res.json(await generateCommoner({ include, locks, counts }));
  } catch (err) {
    if (err.status !== 400) console.error('Error generating commoner:', err);
    res.status(err.status || 500).json({ message: err.message });
  }
});

// GET the biography styles (key + name) for the page's dropdown
router.get('/biography-styles', (req, res) => {
  try {
    res.json(loadStyles().map(({ key, name }) => ({ key, name })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST { style, brief } -> { text, truncated, model } written by the local AI server
router.post('/biography', async (req, res) => {
  try {
    const { style, brief } = req.body || {};
    res.json(await writeBiography({ style, brief }));
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

export default router;

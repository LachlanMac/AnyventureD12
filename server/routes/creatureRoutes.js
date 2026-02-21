import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { protect } from '../middleware/auth.js';
import {
  getCreatures,
  getCreatureById,
  createCreature,
  updateCreature,
  deleteCreature,
  getCreaturesByType,
  getCreatureStats
} from '../controllers/creatureController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const monstersDir = path.resolve(__dirname, '../../data/monsters');

const router = express.Router();

// Monster file browsing routes (for creature designer)
router.get('/files', (req, res) => {
  try {
    const categories = fs.readdirSync(monstersDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)
      .sort();

    const result = {};
    for (const category of categories) {
      const catDir = path.join(monstersDir, category);
      const files = fs.readdirSync(catDir)
        .filter(f => f.endsWith('.json'))
        .sort()
        .map(f => {
          try {
            const data = JSON.parse(fs.readFileSync(path.join(catDir, f), 'utf-8'));
            return {
              filename: f,
              name: data.name || f.replace('.json', ''),
              tier: data.tier || 'unknown',
            };
          } catch {
            return { filename: f, name: f.replace('.json', ''), tier: 'unknown' };
          }
        });
      result[category] = files;
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list monster files' });
  }
});

router.get('/files/:category/:filename', (req, res) => {
  const { category, filename } = req.params;
  // Sanitize to prevent directory traversal
  const safeCategory = path.basename(category);
  const safeFilename = path.basename(filename);
  const filePath = path.join(monstersDir, safeCategory, safeFilename);

  if (!filePath.startsWith(monstersDir)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(404).json({ error: 'Monster file not found' });
  }
});

router.put('/files/:category/:filename', protect, (req, res) => {
  const { category, filename } = req.params;
  const safeCategory = path.basename(category);
  const safeFilename = path.basename(filename);
  const filePath = path.join(monstersDir, safeCategory, safeFilename);

  if (!filePath.startsWith(monstersDir)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save monster file' });
  }
});

// Public routes
router.get('/', getCreatures);
router.get('/stats', getCreatureStats);
router.get('/type/:type', getCreaturesByType);
router.get('/:id', getCreatureById);

// Protected routes (require authentication)
router.post('/', protect, createCreature);
router.put('/:id', protect, updateCreature);
router.delete('/:id', protect, deleteCreature);

export default router;

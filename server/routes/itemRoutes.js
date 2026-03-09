// server/routes/itemRoutes.js
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getItems,
  getItem,
  getItemsByTypeRoute,
  getWeaponsByCategoryRoute,
  createItem,
  updateItem,
  deleteItem
} from '../controllers/itemController.js';
import { protect } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const magicItemsDir = path.resolve(__dirname, '../../data/magic_items');
const standardItemsDir = path.resolve(__dirname, '../../data/items');

const router = express.Router();

// Magic item file browsing routes (for item designer)
// Walks subdirectories recursively to handle nested categories like weapons/complexMelee/
function walkDir(dir, prefix = '') {
  const result = {};
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const subPath = prefix ? `${prefix}/${entry.name}` : entry.name;
      const subResult = walkDir(path.join(dir, entry.name), subPath);
      // If subdirectory has JSON files directly, add them; otherwise merge nested results
      if (Object.keys(subResult).length > 0) {
        Object.assign(result, subResult);
      } else {
        // Empty directory, still list it
        result[subPath] = [];
      }
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      if (!result[prefix]) result[prefix] = [];
      try {
        const data = JSON.parse(fs.readFileSync(path.join(dir, entry.name), 'utf-8'));
        result[prefix].push({
          filename: entry.name,
          name: data.name || entry.name.replace('.json', ''),
          type: data.type || 'unknown',
          rarity: data.rarity || 'common',
        });
      } catch {
        result[prefix].push({
          filename: entry.name,
          name: entry.name.replace('.json', ''),
          type: 'unknown',
          rarity: 'common',
        });
      }
    }
  }
  return result;
}

router.get('/files', (req, res) => {
  try {
    const result = walkDir(magicItemsDir);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list magic item files' });
  }
});

router.get('/files/*', (req, res) => {
  // req.params[0] contains everything after /files/
  const filePath = path.join(magicItemsDir, ...req.params[0].split('/').map(s => path.basename(s)));
  if (!filePath.startsWith(magicItemsDir)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(404).json({ error: 'Item file not found' });
  }
});

router.put('/files/*', protect, (req, res) => {
  const segments = req.params[0].split('/').map(s => path.basename(s));
  const filePath = path.join(magicItemsDir, ...segments);
  if (!filePath.startsWith(magicItemsDir)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save item file' });
  }
});

// Standard item template browsing routes (read-only, for loading templates)
router.get('/templates', (req, res) => {
  try {
    const result = walkDir(standardItemsDir);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list item templates' });
  }
});

router.get('/templates/*', (req, res) => {
  const filePath = path.join(standardItemsDir, ...req.params[0].split('/').map(s => path.basename(s)));
  if (!filePath.startsWith(standardItemsDir)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(404).json({ error: 'Template file not found' });
  }
});

// Public routes
router.get('/', getItems);
router.get('/type/:type', getItemsByTypeRoute);
router.get('/weapons/:category', getWeaponsByCategoryRoute);
router.get('/:id', getItem);

// Admin routes - protected (removed admin middleware for now)
router.post('/', protect, createItem);
router.put('/:id', protect, updateItem);
router.delete('/:id', protect, deleteItem);

export default router;
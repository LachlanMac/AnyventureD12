// server/routes/portraitRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../../uploads/portraits');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${req.params.characterId}-${uniqueSuffix}${ext}`);
  }
});

// File filter function to allow only image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, GIF, and WEBP image files are allowed'), false);
  }
};

// Configure multer upload
const upload = multer({ 
  storage: storage, 
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB max file size
  },
  fileFilter: fileFilter
});

// Apply authentication middleware to all routes
router.use(protect);

// Upload character portrait
router.post('/:characterId/portrait', upload.single('portrait'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Import Character model here to avoid circular dependencies
    const Character = (await import('../models/Character.js')).default;

    // Find character
    const character = await Character.findById(req.params.characterId);
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    // Check if user owns the character
    if (character.userId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this character' });
    }

    // Get relative path to file
    const portraitUrl = `/uploads/portraits/${req.file.filename}`;
    
    // Delete old portrait if it exists
    if (character.portraitUrl) {
      try {
        const oldPortraitPath = path.join(__dirname, '../../', character.portraitUrl);
        if (fs.existsSync(oldPortraitPath)) {
          fs.unlinkSync(oldPortraitPath);
        }
      } catch (err) {
        console.error('Error deleting old portrait:', err);
        // Continue even if deleting old file fails
      }
    }
    
    // Update character with portrait URL
    character.portraitUrl = portraitUrl;
    await character.save();
    
    res.json({ 
      success: true, 
      portraitUrl: portraitUrl
    });
  } catch (err) {
    console.error('Error uploading portrait:', err);
    res.status(500).json({ message: err.message });
  }
});

// Delete character portrait
router.delete('/:characterId/portrait', async (req, res) => {
  try {
    // Import Character model here to avoid circular dependencies
    const Character = (await import('../models/Character.js')).default;

    // Find character
    const character = await Character.findById(req.params.characterId);
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    // Check if user owns the character
    if (character.userId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this character' });
    }
    
    // Delete portrait file if it exists
    if (character.portraitUrl) {
      try {
        const portraitPath = path.join(__dirname, '../../', character.portraitUrl);
        if (fs.existsSync(portraitPath)) {
          fs.unlinkSync(portraitPath);
        }
      } catch (err) {
        console.error('Error deleting portrait file:', err);
        // Continue even if deleting file fails
      }
    }
    
    // Update character to remove portrait URL
    character.portraitUrl = null;
    await character.save();
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting portrait:', err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
// server/controllers/itemController.js
import Item from '../models/Item.js';

// @desc    Get all items
// @route   GET /api/items
// @access  Public
export const getItems = async (req, res) => {
  try {
    // By default, exclude homebrew items unless explicitly requested
    const { includeHomebrew = 'false' } = req.query;
    const query = includeHomebrew === 'true' ? {} : { $or: [{ isHomebrew: false }, { isHomebrew: { $exists: false } }] };
    
    const items = await Item.find(query);
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single item
// @route   GET /api/items/:id
// @access  Public
export const getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json(item);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get items by type
// @route   GET /api/items/type/:type
// @access  Public
export const getItemsByTypeRoute = async (req, res) => {
  try {
    const { type } = req.params;
    
    // Validate type
    const validTypes = ['weapon', 'armor', 'gear', 'consumable', 'container', 'currency'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid item type' });
    }
    
    const items = await Item.find({ type });
    res.json(items);
  } catch (error) {
    console.error('Error fetching items by type:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get weapons by category
// @route   GET /api/items/weapons/:category
// @access  Public
export const getWeaponsByCategoryRoute = async (req, res) => {
  try {
    const { category } = req.params;
    
    // Validate category
    const validCategories = [
      'simpleMelee', 'simpleRanged', 'complexMelee', 'complexRanged', 'unarmed', 'throwing'
    ];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid weapon category' });
    }
    
    const weapons = await Item.find({ 
      type: 'weapon', 
      'weapon_data.category': category 
    });
    res.json(weapons);
  } catch (error) {
    console.error('Error fetching weapons by category:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new item
// @route   POST /api/items
// @access  Admin only
export const createItem = async (req, res) => {
  try {
    const newItem = new Item(req.body);
    const savedItem = await newItem.save();
    
    res.status(201).json(savedItem);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an item
// @route   PUT /api/items/:id
// @access  Admin only
export const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an item
// @route   DELETE /api/items/:id
// @access  Admin only
export const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    await Item.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Item removed' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ message: error.message });
  }
};
// server/controllers/homebrewController.js
import Item from '../models/Item.js';
import Creature from '../models/Creature.js';
import Spell from '../models/Spell.js';

// @desc    Create a new homebrew item
// @route   POST /api/homebrew/items
// @access  Private
export const createHomebrewItem = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const userName = req.user.username || 'Anonymous';
    
    const itemData = {
      ...req.body,
      isHomebrew: true,
      creatorId: userId,
      creatorName: userName,
      status: 'draft'
    };
    
    const item = new Item(itemData);
    const savedItem = await item.save();
    
    res.status(201).json(savedItem);
  } catch (error) {
    console.error('Error creating homebrew item:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all homebrew items (with filters)
// @route   GET /api/homebrew/items
// @access  Public
export const getHomebrewItems = async (req, res) => {
  try {
    const { 
      status = 'published', 
      type, 
      tags, 
      creatorId,
      sort = '-publishedAt',
      page = 1,
      limit = 20 
    } = req.query;
    
    // Build query
    const query = { isHomebrew: true };
    
    // Status filter - only show public content to non-authenticated users
    if (req.user) {
      // Authenticated users can see their own content or published content
      if (status === 'mine') {
        query.creatorId = req.user._id.toString();
      } else if (status === 'draft') {
        query.creatorId = req.user._id.toString();
        query.status = 'draft';
      } else if (status === 'private') {
        query.creatorId = req.user._id.toString();
        query.status = 'private';
      } else {
        // For 'published' or other status, show only published content
        query.status = 'published';
      }
    } else {
      // Non-authenticated users can only see published content
      query.status = 'published';
    }
    
    if (type) query.type = type;
    if (creatorId) query.creatorId = creatorId;
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      query.tags = { $in: tagArray };
    }
    
    // Pagination
    const skip = (page - 1) * limit;
    
    const items = await Item.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
      
    const total = await Item.countDocuments(query);
    
    res.json({
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching homebrew items:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single homebrew item
// @route   GET /api/homebrew/items/:id
// @access  Public (drafts only visible to creator)
export const getHomebrewItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item || !item.isHomebrew) {
      return res.status(404).json({ message: 'Homebrew item not found' });
    }
    
    // Check if draft/private and user is not creator
    if ((item.status === 'draft' || item.status === 'private') && 
        (!req.user || item.creatorId !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(item);
  } catch (error) {
    console.error('Error fetching homebrew item:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update homebrew item
// @route   PUT /api/homebrew/items/:id
// @access  Private (creator only)
export const updateHomebrewItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item || !item.isHomebrew) {
      return res.status(404).json({ message: 'Homebrew item not found' });
    }
    
    // Check ownership
    if (item.creatorId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this item' });
    }
    
    // Don't allow certain fields to be updated
    delete req.body.isHomebrew;
    delete req.body.creatorId;
    delete req.body.creatorName;
    delete req.body.upvotes;
    delete req.body.downvotes;
    delete req.body.timesUsed;
    delete req.body.approvedAt;
    delete req.body.approvedBy;
    
    // If changing from draft to published, set publishedAt
    if (item.status === 'draft' && req.body.status === 'published') {
      req.body.publishedAt = new Date();
    }
    
    // Increment version if making significant changes
    if (item.status === 'published' || item.status === 'approved') {
      req.body.version = (item.version || 1) + 1;
    }
    
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating homebrew item:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete homebrew item
// @route   DELETE /api/homebrew/items/:id
// @access  Private (creator only)
export const deleteHomebrewItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item || !item.isHomebrew) {
      return res.status(404).json({ message: 'Homebrew item not found' });
    }
    
    // Check ownership
    if (item.creatorId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }
    
    await Item.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Homebrew item deleted' });
  } catch (error) {
    console.error('Error deleting homebrew item:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Publish a homebrew item
// @route   POST /api/homebrew/items/:id/publish
// @access  Private (creator only)
export const publishHomebrewItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item || !item.isHomebrew) {
      return res.status(404).json({ message: 'Homebrew item not found' });
    }
    
    // Check ownership
    if (item.creatorId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (item.status !== 'draft' && item.status !== 'private') {
      return res.status(400).json({ message: 'Item is already published' });
    }
    
    item.status = 'published';
    item.publishedAt = new Date();
    await item.save();
    
    res.json(item);
  } catch (error) {
    console.error('Error publishing homebrew item:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Vote on a homebrew item
// @route   POST /api/homebrew/items/:id/vote
// @access  Private
export const voteHomebrewItem = async (req, res) => {
  try {
    const { vote } = req.body; // 'up' or 'down'
    const userId = req.user._id.toString();
    
    if (!['up', 'down'].includes(vote)) {
      return res.status(400).json({ message: 'Invalid vote type' });
    }
    
    const item = await Item.findById(req.params.id);
    
    if (!item || !item.isHomebrew) {
      return res.status(404).json({ message: 'Homebrew item not found' });
    }
    
    if (item.status !== 'published' && item.status !== 'approved') {
      return res.status(400).json({ message: 'Can only vote on published items' });
    }
    
    // In a real app, you'd track who voted to prevent duplicates
    // For now, just update the count
    if (vote === 'up') {
      item.upvotes += 1;
    } else {
      item.downvotes += 1;
    }
    
    await item.save();
    
    res.json({ 
      upvotes: item.upvotes, 
      downvotes: item.downvotes 
    });
  } catch (error) {
    console.error('Error voting on homebrew item:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Report a homebrew item
// @route   POST /api/homebrew/items/:id/report
// @access  Private
export const reportHomebrewItem = async (req, res) => {
  try {
    const { reason, details } = req.body;
    const userId = req.user._id.toString();
    
    if (!reason) {
      return res.status(400).json({ message: 'Report reason is required' });
    }
    
    const item = await Item.findById(req.params.id);
    
    if (!item || !item.isHomebrew) {
      return res.status(404).json({ message: 'Homebrew item not found' });
    }
    
    // Add report
    item.reports.push({
      userId,
      reason,
      details: details || '',
      reportedAt: new Date()
    });
    
    await item.save();
    
    res.json({ message: 'Report submitted' });
  } catch (error) {
    console.error('Error reporting homebrew item:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fork a homebrew item
// @route   POST /api/homebrew/items/:id/fork
// @access  Private
export const forkHomebrewItem = async (req, res) => {
  try {
    const originalItem = await Item.findById(req.params.id);
    
    if (!originalItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Create a copy with new creator info
    const forkedData = originalItem.toObject();
    delete forkedData._id;
    delete forkedData.createdAt;
    delete forkedData.updatedAt;
    
    const forkedItem = new Item({
      ...forkedData,
      name: `${forkedData.name} (Fork)`,
      isHomebrew: true,
      creatorId: req.user._id.toString(),
      creatorName: req.user.username || 'Anonymous',
      status: 'draft',
      parentItemId: originalItem._id,
      version: 1,
      upvotes: 0,
      downvotes: 0,
      timesUsed: 0,
      reports: [],
      publishedAt: null,
      approvedAt: null,
      approvedBy: null
    });
    
    const savedItem = await forkedItem.save();
    
    res.status(201).json(savedItem);
  } catch (error) {
    console.error('Error forking item:', error);
    res.status(500).json({ message: error.message });
  }
};

// Admin endpoints

// @desc    Approve a homebrew item
// @route   POST /api/admin/homebrew/items/:id/approve
// @access  Private (admin only)
export const approveHomebrewItem = async (req, res) => {
  try {
    // TODO: Add admin check middleware
    
    const item = await Item.findById(req.params.id);
    
    if (!item || !item.isHomebrew) {
      return res.status(404).json({ message: 'Homebrew item not found' });
    }
    
    item.status = 'approved';
    item.approvedAt = new Date();
    item.approvedBy = req.user._id.toString();
    await item.save();
    
    res.json(item);
  } catch (error) {
    console.error('Error approving homebrew item:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject a homebrew item
// @route   POST /api/admin/homebrew/items/:id/reject
// @access  Private (admin only)
export const rejectHomebrewItem = async (req, res) => {
  try {
    // TODO: Add admin check middleware
    const { reason } = req.body;
    
    const item = await Item.findById(req.params.id);
    
    if (!item || !item.isHomebrew) {
      return res.status(404).json({ message: 'Homebrew item not found' });
    }
    
    item.status = 'rejected';
    item.rejectionReason = reason || 'No reason provided';
    await item.save();
    
    res.json(item);
  } catch (error) {
    console.error('Error rejecting homebrew item:', error);
    res.status(500).json({ message: error.message });
  }
};

// HOMEBREW CREATURES

// @desc    Create a new homebrew creature
// @route   POST /api/homebrew/creatures
// @access  Private
export const createHomebrewCreature = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const userName = req.user.username || 'Anonymous';
    
    // Handle spell references
    let spells = [];
    if (req.body.spellNames && Array.isArray(req.body.spellNames)) {
      const spellDocs = await Spell.find({ 
        name: { $in: req.body.spellNames },
        isHomebrew: false 
      });
      spells = spellDocs.map(spell => spell._id);
    }
    
    const creatureData = {
      ...req.body,
      spells,
      isHomebrew: true,
      creator: userId,
      creatorName: userName,
      status: req.body.status || 'draft'
    };
    
    // Remove spellNames from final data
    delete creatureData.spellNames;
    
    const creature = new Creature(creatureData);
    const savedCreature = await creature.save();
    
    res.status(201).json(savedCreature);
  } catch (error) {
    console.error('Error creating homebrew creature:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all homebrew creatures (with filters)
// @route   GET /api/homebrew/creatures
// @access  Public
export const getHomebrewCreatures = async (req, res) => {
  try {
    const { 
      status = 'published', 
      type, 
      tier,
      creatorId,
      sort = '-publishedAt',
      page = 1,
      limit = 20 
    } = req.query;
    
    // Build query
    const query = { isHomebrew: true };
    
    // Status filter - only show public content to non-authenticated users
    if (req.user) {
      // Authenticated users can see their own content or published content
      if (status === 'mine') {
        query.creator = req.user._id;
      } else if (status === 'draft') {
        query.creator = req.user._id;
        query.status = 'draft';
      } else if (status === 'private') {
        query.creator = req.user._id;
        query.status = 'private';
      } else {
        // For 'published' or other status, show only published content
        query.status = 'published';
      }
    } else {
      // Non-authenticated users can only see published content
      query.status = 'published';
    }
    
    if (type) query.type = type;
    if (tier) query.tier = tier;
    if (creatorId) query.creator = creatorId;
    
    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const creatures = await Creature.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .select('name description type tier size challenge_rating creator creatorName status upvotes downvotes timesUsed publishedAt createdAt')
      .lean();
    
    const total = await Creature.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum);
    
    res.json({
      creatures,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Error fetching homebrew creatures:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update homebrew creature
// @route   PUT /api/homebrew/creatures/:id
// @access  Private
export const updateHomebrewCreature = async (req, res) => {
  try {
    const creature = await Creature.findById(req.params.id);
    
    if (!creature || !creature.isHomebrew) {
      return res.status(404).json({ message: 'Homebrew creature not found' });
    }
    
    if (creature.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Handle spell references
    let spells = creature.spells || [];
    if (req.body.spellNames && Array.isArray(req.body.spellNames)) {
      const spellDocs = await Spell.find({ 
        name: { $in: req.body.spellNames },
        isHomebrew: false 
      });
      spells = spellDocs.map(spell => spell._id);
    }
    
    const updateData = {
      ...req.body,
      spells
    };
    
    // Remove spellNames from final data
    delete updateData.spellNames;
    
    const updatedCreature = await Creature.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json(updatedCreature);
  } catch (error) {
    console.error('Error updating homebrew creature:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete homebrew creature
// @route   DELETE /api/homebrew/creatures/:id
// @access  Private
export const deleteHomebrewCreature = async (req, res) => {
  try {
    const creature = await Creature.findById(req.params.id);
    
    if (!creature || !creature.isHomebrew) {
      return res.status(404).json({ message: 'Homebrew creature not found' });
    }
    
    if (creature.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await Creature.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Creature deleted successfully' });
  } catch (error) {
    console.error('Error deleting homebrew creature:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Vote on a homebrew creature
// @route   POST /api/homebrew/creatures/:id/vote
// @access  Private
export const voteHomebrewCreature = async (req, res) => {
  try {
    const { vote } = req.body; // 'up' or 'down'
    const userId = req.user._id.toString();
    
    if (!['up', 'down'].includes(vote)) {
      return res.status(400).json({ message: 'Invalid vote type' });
    }
    
    const creature = await Creature.findById(req.params.id);
    
    if (!creature || !creature.isHomebrew) {
      return res.status(404).json({ message: 'Homebrew creature not found' });
    }
    
    if (creature.status !== 'published' && creature.status !== 'approved') {
      return res.status(400).json({ message: 'Can only vote on published creatures' });
    }
    
    // Initialize vote counts if they don't exist
    if (typeof creature.upvotes !== 'number') creature.upvotes = 0;
    if (typeof creature.downvotes !== 'number') creature.downvotes = 0;
    
    // In a real app, you'd track who voted to prevent duplicates
    // For now, just update the count
    if (vote === 'up') {
      creature.upvotes += 1;
    } else {
      creature.downvotes += 1;
    }
    
    await creature.save();
    
    res.json({ 
      upvotes: creature.upvotes, 
      downvotes: creature.downvotes 
    });
  } catch (error) {
    console.error('Error voting on homebrew creature:', error);
    res.status(500).json({ message: error.message });
  }
};
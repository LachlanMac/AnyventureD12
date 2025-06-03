// server/controllers/homebrewController.js
import Item from '../models/Item.js';

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
    
    // Status filter - allow viewing own drafts
    if (status === 'mine' && req.user) {
      query.creatorId = req.user._id.toString();
    } else if (status !== 'all') {
      query.status = status;
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
// server/controllers/homebrewSpellController.js
import Spell from '../models/Spell.js';

// @desc    Create a new homebrew spell
// @route   POST /api/homebrew/spells
// @access  Private
export const createHomebrewSpell = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const userName = req.user.username || 'Anonymous';
    
    const spellData = {
      ...req.body,
      isHomebrew: true,
      creatorId: userId,
      creatorName: userName,
      status: 'draft'
    };
    
    const spell = new Spell(spellData);
    const savedSpell = await spell.save();
    
    res.status(201).json(savedSpell);
  } catch (error) {
    console.error('Error creating homebrew spell:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all homebrew spells (with filters)
// @route   GET /api/homebrew/spells
// @access  Public
export const getHomebrewSpells = async (req, res) => {
  try {
    const { 
      status = 'published', 
      school,
      subschool, 
      tags, 
      creatorId,
      search,
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
    
    if (school) query.school = school;
    if (subschool) query.subschool = subschool;
    if (creatorId) query.creatorId = creatorId;
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      query.tags = { $in: tagArray };
    }
    
    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Pagination
    const skip = (page - 1) * limit;
    
    const spells = await Spell.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
      
    const total = await Spell.countDocuments(query);
    
    res.json({
      spells,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching homebrew spells:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single homebrew spell
// @route   GET /api/homebrew/spells/:id
// @access  Public (drafts only visible to creator)
export const getHomebrewSpell = async (req, res) => {
  try {
    const spell = await Spell.findById(req.params.id);
    
    if (!spell || !spell.isHomebrew) {
      return res.status(404).json({ message: 'Homebrew spell not found' });
    }
    
    // Check if draft/private and user is not creator
    if ((spell.status === 'draft' || spell.status === 'private') && 
        (!req.user || spell.creatorId !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(spell);
  } catch (error) {
    console.error('Error fetching homebrew spell:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update homebrew spell
// @route   PUT /api/homebrew/spells/:id
// @access  Private (creator only)
export const updateHomebrewSpell = async (req, res) => {
  try {
    const spell = await Spell.findById(req.params.id);
    
    if (!spell || !spell.isHomebrew) {
      return res.status(404).json({ message: 'Homebrew spell not found' });
    }
    
    // Check ownership
    if (spell.creatorId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this spell' });
    }
    
    // Don't allow certain fields to be updated
    delete req.body.isHomebrew;
    delete req.body.creatorId;
    delete req.body.creatorName;
    delete req.body.upvotes;
    delete req.body.downvotes;
    delete req.body.timesUsed;
    delete req.body.votes;
    delete req.body.reports;
    
    // If changing from draft to published, set publishedAt
    if (spell.status === 'draft' && req.body.status === 'published') {
      req.body.publishedAt = new Date();
    }
    
    const updatedSpell = await Spell.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedSpell);
  } catch (error) {
    console.error('Error updating homebrew spell:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete homebrew spell
// @route   DELETE /api/homebrew/spells/:id
// @access  Private (creator only)
export const deleteHomebrewSpell = async (req, res) => {
  try {
    const spell = await Spell.findById(req.params.id);
    
    if (!spell || !spell.isHomebrew) {
      return res.status(404).json({ message: 'Homebrew spell not found' });
    }
    
    // Check ownership
    if (spell.creatorId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this spell' });
    }
    
    await Spell.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Homebrew spell deleted' });
  } catch (error) {
    console.error('Error deleting homebrew spell:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Publish a homebrew spell
// @route   POST /api/homebrew/spells/:id/publish
// @access  Private (creator only)
export const publishHomebrewSpell = async (req, res) => {
  try {
    const spell = await Spell.findById(req.params.id);
    
    if (!spell || !spell.isHomebrew) {
      return res.status(404).json({ message: 'Homebrew spell not found' });
    }
    
    // Check ownership
    if (spell.creatorId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (spell.status !== 'draft' && spell.status !== 'private') {
      return res.status(400).json({ message: 'Spell is already published' });
    }
    
    spell.status = 'published';
    spell.publishedAt = new Date();
    await spell.save();
    
    res.json(spell);
  } catch (error) {
    console.error('Error publishing homebrew spell:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Vote on a homebrew spell
// @route   POST /api/homebrew/spells/:id/vote
// @access  Private
export const voteHomebrewSpell = async (req, res) => {
  try {
    const { vote } = req.body; // 'up' or 'down'
    const userId = req.user._id.toString();
    
    if (!['up', 'down'].includes(vote)) {
      return res.status(400).json({ message: 'Invalid vote type' });
    }
    
    const spell = await Spell.findById(req.params.id);
    
    if (!spell || !spell.isHomebrew) {
      return res.status(404).json({ message: 'Homebrew spell not found' });
    }
    
    if (spell.status !== 'published' && spell.status !== 'approved') {
      return res.status(400).json({ message: 'Can only vote on published spells' });
    }
    
    // Check if user already voted
    const existingVoteIndex = spell.votes.findIndex(v => v.userId === userId);
    
    if (existingVoteIndex !== -1) {
      // Update existing vote
      const oldVote = spell.votes[existingVoteIndex].vote;
      spell.votes[existingVoteIndex].vote = vote;
      
      // Update counts
      if (oldVote === 'up' && vote === 'down') {
        spell.upvotes -= 1;
        spell.downvotes += 1;
      } else if (oldVote === 'down' && vote === 'up') {
        spell.downvotes -= 1;
        spell.upvotes += 1;
      }
    } else {
      // Add new vote
      spell.votes.push({ userId, vote });
      if (vote === 'up') {
        spell.upvotes += 1;
      } else {
        spell.downvotes += 1;
      }
    }
    
    await spell.save();
    
    res.json({ 
      upvotes: spell.upvotes, 
      downvotes: spell.downvotes 
    });
  } catch (error) {
    console.error('Error voting on homebrew spell:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Report a homebrew spell
// @route   POST /api/homebrew/spells/:id/report
// @access  Private
export const reportHomebrewSpell = async (req, res) => {
  try {
    const { reason } = req.body;
    const userId = req.user._id.toString();
    
    if (!reason) {
      return res.status(400).json({ message: 'Report reason is required' });
    }
    
    const spell = await Spell.findById(req.params.id);
    
    if (!spell || !spell.isHomebrew) {
      return res.status(404).json({ message: 'Homebrew spell not found' });
    }
    
    // Check if user already reported
    const alreadyReported = spell.reports.some(r => r.userId === userId);
    
    if (alreadyReported) {
      return res.status(400).json({ message: 'You have already reported this spell' });
    }
    
    // Add report
    spell.reports.push({
      userId,
      reason,
      timestamp: new Date()
    });
    
    await spell.save();
    
    res.json({ message: 'Report submitted' });
  } catch (error) {
    console.error('Error reporting homebrew spell:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fork a homebrew spell
// @route   POST /api/homebrew/spells/:id/fork
// @access  Private
export const forkHomebrewSpell = async (req, res) => {
  try {
    const originalSpell = await Spell.findById(req.params.id);
    
    if (!originalSpell) {
      return res.status(404).json({ message: 'Spell not found' });
    }
    
    // Create a copy with new creator info
    const forkedData = originalSpell.toObject();
    delete forkedData._id;
    delete forkedData.createdAt;
    delete forkedData.updatedAt;
    delete forkedData.votes;
    delete forkedData.reports;
    
    const forkedSpell = new Spell({
      ...forkedData,
      name: `${forkedData.name} (Fork)`,
      isHomebrew: true,
      creatorId: req.user._id.toString(),
      creatorName: req.user.username || 'Anonymous',
      status: 'draft',
      forkedFrom: originalSpell._id,
      upvotes: 0,
      downvotes: 0,
      timesUsed: 0,
      publishedAt: null
    });
    
    const savedSpell = await forkedSpell.save();
    
    res.status(201).json(savedSpell);
  } catch (error) {
    console.error('Error forking spell:', error);
    res.status(500).json({ message: error.message });
  }
};

// Admin endpoints

// @desc    Approve a homebrew spell
// @route   POST /api/admin/homebrew/spells/:id/approve
// @access  Private (admin only)
export const approveHomebrewSpell = async (req, res) => {
  try {
    // TODO: Add admin check middleware
    
    const spell = await Spell.findById(req.params.id);
    
    if (!spell || !spell.isHomebrew) {
      return res.status(404).json({ message: 'Homebrew spell not found' });
    }
    
    spell.status = 'approved';
    await spell.save();
    
    res.json(spell);
  } catch (error) {
    console.error('Error approving homebrew spell:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject a homebrew spell
// @route   POST /api/admin/homebrew/spells/:id/reject
// @access  Private (admin only)
export const rejectHomebrewSpell = async (req, res) => {
  try {
    // TODO: Add admin check middleware
    const { reason } = req.body;
    
    const spell = await Spell.findById(req.params.id);
    
    if (!spell || !spell.isHomebrew) {
      return res.status(404).json({ message: 'Homebrew spell not found' });
    }
    
    spell.status = 'rejected';
    await spell.save();
    
    res.json(spell);
  } catch (error) {
    console.error('Error rejecting homebrew spell:', error);
    res.status(500).json({ message: error.message });
  }
};
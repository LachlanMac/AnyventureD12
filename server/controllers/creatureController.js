import Creature from '../models/Creature.js';

// Get all creatures with filtering and pagination
const getCreatures = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      tier,
      size,
      minCR,
      maxCR,
      search,
      isHomebrew
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (type) filter.type = type;
    if (tier) filter.tier = tier;
    if (size) filter.size = size;
    if (minCR || maxCR) {
      filter.challenge_rating = {};
      if (minCR) filter.challenge_rating.$gte = parseInt(minCR);
      if (maxCR) filter.challenge_rating.$lte = parseInt(maxCR);
    }
    if (isHomebrew !== undefined) {
      filter.isHomebrew = isHomebrew === 'true';
    }
    if (search) {
      filter.$text = { $search: search };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: search ? { score: { $meta: 'textScore' } } : { name: 1 },
      select: 'name description type tier size challenge_rating health movement isHomebrew source'
    };

    const creatures = await Creature.find(filter)
      .select(options.select)
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit);

    const total = await Creature.countDocuments(filter);
    const totalPages = Math.ceil(total / options.limit);

    res.json({
      creatures,
      pagination: {
        currentPage: options.page,
        totalPages,
        totalItems: total,
        itemsPerPage: options.limit,
        hasNext: options.page < totalPages,
        hasPrev: options.page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching creatures:', error);
    res.status(500).json({ message: 'Error fetching creatures', error: error.message });
  }
};

// Get a single creature by ID
const getCreatureById = async (req, res) => {
  try {
    const creature = await Creature.findById(req.params.id);
    
    if (!creature) {
      return res.status(404).json({ message: 'Creature not found' });
    }

    res.json(creature);
  } catch (error) {
    console.error('Error fetching creature:', error);
    res.status(500).json({ message: 'Error fetching creature', error: error.message });
  }
};

// Create a new creature (homebrew)
const createCreature = async (req, res) => {
  try {
    const creatureData = {
      ...req.body,
      creator: req.user.id,
      isHomebrew: true
    };

    const creature = new Creature(creatureData);
    await creature.save();

    res.status(201).json(creature);
  } catch (error) {
    console.error('Error creating creature:', error);
    res.status(400).json({ message: 'Error creating creature', error: error.message });
  }
};

// Update a creature (only homebrew creatures by their creator)
const updateCreature = async (req, res) => {
  try {
    const creature = await Creature.findById(req.params.id);
    
    if (!creature) {
      return res.status(404).json({ message: 'Creature not found' });
    }

    // Only allow updates to homebrew creatures by their creator
    if (!creature.isHomebrew || creature.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this creature' });
    }

    const updatedCreature = await Creature.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedCreature);
  } catch (error) {
    console.error('Error updating creature:', error);
    res.status(400).json({ message: 'Error updating creature', error: error.message });
  }
};

// Delete a creature (only homebrew creatures by their creator)
const deleteCreature = async (req, res) => {
  try {
    const creature = await Creature.findById(req.params.id);
    
    if (!creature) {
      return res.status(404).json({ message: 'Creature not found' });
    }

    // Only allow deletion of homebrew creatures by their creator
    if (!creature.isHomebrew || creature.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this creature' });
    }

    await Creature.findByIdAndDelete(req.params.id);
    res.json({ message: 'Creature deleted successfully' });
  } catch (error) {
    console.error('Error deleting creature:', error);
    res.status(500).json({ message: 'Error deleting creature', error: error.message });
  }
};

// Get creatures by type
const getCreaturesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const validTypes = ['fiend', 'undead', 'divine', 'monster', 'humanoid', 'construct', 'plantoid', 'fey', 'elemental'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid creature type' });
    }

    const filter = { type };
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { name: 1 }
    };

    const creatures = await Creature.find(filter)
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit);

    const total = await Creature.countDocuments(filter);
    const totalPages = Math.ceil(total / options.limit);

    res.json({
      creatures,
      type,
      pagination: {
        currentPage: options.page,
        totalPages,
        totalItems: total,
        itemsPerPage: options.limit
      }
    });
  } catch (error) {
    console.error('Error fetching creatures by type:', error);
    res.status(500).json({ message: 'Error fetching creatures by type', error: error.message });
  }
};

// Get creature statistics for dashboard
const getCreatureStats = async (req, res) => {
  try {
    const stats = await Creature.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgCR: { $avg: '$challenge_rating' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const tierStats = await Creature.aggregate([
      {
        $group: {
          _id: '$tier',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const totalCreatures = await Creature.countDocuments();
    const homebrewCreatures = await Creature.countDocuments({ isHomebrew: true });

    res.json({
      totalCreatures,
      homebrewCreatures,
      officialCreatures: totalCreatures - homebrewCreatures,
      typeStats: stats,
      tierStats
    });
  } catch (error) {
    console.error('Error fetching creature stats:', error);
    res.status(500).json({ message: 'Error fetching creature stats', error: error.message });
  }
};

export {
  getCreatures,
  getCreatureById,
  createCreature,
  updateCreature,
  deleteCreature,
  getCreaturesByType,
  getCreatureStats
};
import mongoose from 'mongoose';
import Campaign from '../models/Campaign.js';
import Character from '../models/Character.js';
import User from '../models/User.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to populate player information for characters
const populateCharacterPlayers = async (campaign) => {
  // Get all unique user IDs from characters
  const userIds = new Set();
  campaign.playerSlots.forEach(slot => {
    if (slot.character && slot.character.userId) {
      userIds.add(slot.character.userId);
    }
  });

  // Fetch all users
  const users = await User.find({ _id: { $in: Array.from(userIds) } }).select('_id username');
  const userMap = new Map(users.map(user => [user._id.toString(), user]));

  // Transform the campaign data to include player information
  const campaignObj = campaign.toObject();
  campaignObj.playerSlots = campaignObj.playerSlots.map(slot => {
    if (slot.character && slot.character.userId) {
      const user = userMap.get(slot.character.userId);
      if (user) {
        slot.character.player = {
          _id: user._id,
          username: user.username
        };
      }
    }
    return slot;
  });

  return campaignObj;
};

// Configure multer for campaign picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/campaigns');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'campaign-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get all campaigns for the current user (owned or participating)
const getCampaigns = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find campaigns where user is owner or has a character in a slot
    const campaigns = await Campaign.find({
      $or: [
        { owner: userId },
        { 'playerSlots.character': { $in: await Character.find({ userId: userId }).select('_id') } }
      ],
      isActive: true
    })
    .populate('owner', 'username')
    .populate({
      path: 'playerSlots.character',
      select: '_id name portraitUrl userId level'
    })
    .sort({ updatedAt: -1 });

    // Add player information to all campaigns
    const campaignsWithPlayers = await Promise.all(
      campaigns.map(campaign => populateCharacterPlayers(campaign))
    );
    
    res.json(campaignsWithPlayers);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ message: 'Error fetching campaigns', error: error.message });
  }
};

// Get single campaign by ID
const getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const campaign = await Campaign.findById(id)
      .populate('owner', 'username')
      .populate({
        path: 'playerSlots.character',
        select: '_id name portraitUrl userId level'
      });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Check if user has access to this campaign
    const userCharacters = await Character.find({ userId: userId }).select('_id');
    const hasCharacterInCampaign = campaign.playerSlots.some(slot => 
      slot.character && userCharacters.some(char => char._id.toString() === slot.character._id.toString())
    );
    const isOwner = campaign.owner._id.toString() === userId.toString();

    if (!isOwner && !hasCharacterInCampaign) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Add player information to characters
    const campaignWithPlayers = await populateCharacterPlayers(campaign);
    res.json(campaignWithPlayers);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ message: 'Error fetching campaign', error: error.message });
  }
};

// Create new campaign
const createCampaign = async (req, res) => {
  try {
    const { name, description, startingTalents, startingModulePoints, playerSlotsCount } = req.body;
    const userId = req.user._id;

    const campaign = new Campaign({
      name,
      description,
      owner: userId,
      startingTalents: startingTalents || 6,
      startingModulePoints: startingModulePoints || 10
    });

    // Create player slots
    campaign.createPlayerSlots(playerSlotsCount || 4);

    if (req.file) {
      campaign.picture = req.file.filename;
    }

    await campaign.save();
    
    // Populate owner info for response
    await campaign.populate('owner', 'username');

    res.status(201).json(campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ message: 'Error creating campaign', error: error.message });
  }
};

// Update campaign
const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, startingTalents, startingModulePoints } = req.body;
    const userId = req.user._id;

    const campaign = await Campaign.findById(id);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Only owner can update campaign
    if (campaign.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Only campaign owner can update campaign' });
    }

    // Update fields
    if (name) campaign.name = name;
    if (description) campaign.description = description;
    if (startingTalents !== undefined) campaign.startingTalents = startingTalents;
    if (startingModulePoints !== undefined) campaign.startingModulePoints = startingModulePoints;

    // Handle picture update
    if (req.file) {
      // Delete old picture if it exists
      if (campaign.picture) {
        const oldPicturePath = path.join(__dirname, '../uploads/campaigns', campaign.picture);
        if (fs.existsSync(oldPicturePath)) {
          fs.unlinkSync(oldPicturePath);
        }
      }
      campaign.picture = req.file.filename;
    }

    await campaign.save();
    await campaign.populate([
      { path: 'owner', select: 'username' },
      { 
        path: 'playerSlots.character',
        select: '_id name portraitUrl userId level'
      }
    ]);

    res.json(campaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ message: 'Error updating campaign', error: error.message });
  }
};

// Generate invite link for a player slot
const generateInviteLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { slotIndex } = req.body;
    const userId = req.user._id;

    const campaign = await Campaign.findById(id);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Only owner can generate invite links
    if (campaign.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Only campaign owner can generate invite links' });
    }

    if (slotIndex < 0 || slotIndex >= campaign.playerSlots.length) {
      return res.status(400).json({ message: 'Invalid slot index' });
    }

    if (campaign.playerSlots[slotIndex].character) {
      return res.status(400).json({ message: 'Slot is already occupied' });
    }

    const token = campaign.generateInviteToken(slotIndex);
    await campaign.save();

    // Generate the frontend URL for the invite link
    const frontendHost = req.get('host').includes(':4000') 
      ? req.get('host').replace(':4000', ':5174')
      : req.get('host');
    const inviteLink = `${req.protocol}://${frontendHost}/campaigns/join/${token}`;
    
    res.json({ 
      inviteLink,
      token,
      slotIndex
    });
  } catch (error) {
    console.error('Error generating invite link:', error);
    res.status(500).json({ message: 'Error generating invite link', error: error.message });
  }
};

// Get campaign by invite token
const getCampaignByInvite = async (req, res) => {
  try {
    const { token } = req.params;
    
    const campaign = await Campaign.findByInviteToken(token);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Invalid or expired invite link' });
    }

    res.json(campaign);
  } catch (error) {
    console.error('Error fetching campaign by invite:', error);
    res.status(500).json({ message: 'Error fetching campaign', error: error.message });
  }
};

// Join campaign with character
const joinCampaign = async (req, res) => {
  try {
    const { token } = req.params;
    const { characterId } = req.body;
    const userId = req.user._id;

    console.log('Join campaign request:', { token, characterId, userId: userId.toString() });

    // Validate characterId format
    if (!characterId || !mongoose.Types.ObjectId.isValid(characterId)) {
      console.error('Invalid character ID format:', characterId);
      return res.status(400).json({ message: 'Invalid character ID format' });
    }

    const campaign = await Campaign.findByInviteToken(token);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Invalid or expired invite link' });
    }

    // Verify character belongs to user
    const character = await Character.findOne({ 
      _id: characterId, 
      userId: userId.toString()
    });
    console.log('Character lookup result:', { 
      found: !!character, 
      characterId, 
      userId: userId.toString() 
    });
    
    // Additional debug: List user's characters
    if (!character) {
      const userCharacters = await Character.find({ 
        userId: userId.toString()
      }).select('_id name userId');
      console.log('User\'s characters:', userCharacters);
    }
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found or access denied' });
    }

    // Check if character is already in this campaign
    const alreadyInCampaign = campaign.playerSlots.some(slot => 
      slot.character && slot.character.toString() === characterId
    );
    if (alreadyInCampaign) {
      return res.status(400).json({ message: 'Character is already in this campaign' });
    }

    await campaign.joinCampaign(token, characterId);
    await campaign.populate([
      { path: 'owner', select: 'username' },
      { 
        path: 'playerSlots.character',
        select: '_id name portraitUrl userId level'
      }
    ]);

    // Add player information to characters
    const campaignWithPlayers = await populateCharacterPlayers(campaign);

    res.json({ 
      message: 'Successfully joined campaign',
      campaign: campaignWithPlayers
    });
  } catch (error) {
    console.error('Error joining campaign:', error);
    res.status(500).json({ message: 'Error joining campaign', error: error.message });
  }
};

// Kick player from campaign
const kickPlayer = async (req, res) => {
  try {
    const { id } = req.params;
    const { characterId } = req.body;
    const userId = req.user._id;

    const campaign = await Campaign.findById(id);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Only owner can kick players
    if (campaign.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Only campaign owner can kick players' });
    }

    await campaign.removePlayer(characterId);
    await campaign.populate([
      { path: 'owner', select: 'username' },
      { 
        path: 'playerSlots.character',
        select: '_id name portraitUrl userId level'
      }
    ]);

    res.json({
      message: 'Player removed from campaign',
      campaign
    });
  } catch (error) {
    console.error('Error kicking player:', error);
    res.status(500).json({ message: 'Error removing player', error: error.message });
  }
};

// Leave campaign
const leaveCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { characterId } = req.body;
    const userId = req.user._id;

    const campaign = await Campaign.findById(id);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Verify character belongs to user
    const character = await Character.findOne({ _id: characterId, userId: userId });
    if (!character) {
      return res.status(404).json({ message: 'Character not found or access denied' });
    }

    await campaign.removePlayer(characterId);

    res.json({
      message: 'Successfully left campaign'
    });
  } catch (error) {
    console.error('Error leaving campaign:', error);
    res.status(500).json({ message: 'Error leaving campaign', error: error.message });
  }
};

// Close/open player slot
const toggleSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { slotIndex, isOpen } = req.body;
    const userId = req.user._id;

    const campaign = await Campaign.findById(id);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Only owner can toggle slots
    if (campaign.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Only campaign owner can manage slots' });
    }

    if (slotIndex < 0 || slotIndex >= campaign.playerSlots.length) {
      return res.status(400).json({ message: 'Invalid slot index' });
    }

    const slot = campaign.playerSlots[slotIndex];
    
    if (slot.character && isOpen) {
      return res.status(400).json({ message: 'Cannot open slot with character' });
    }

    slot.isOpen = isOpen;
    if (!isOpen) {
      slot.inviteToken = undefined;
    }

    await campaign.save();

    res.json({
      message: `Slot ${isOpen ? 'opened' : 'closed'} successfully`,
      campaign
    });
  } catch (error) {
    console.error('Error toggling slot:', error);
    res.status(500).json({ message: 'Error managing slot', error: error.message });
  }
};

// Delete campaign
const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const campaign = await Campaign.findById(id);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Only owner can delete campaign
    if (campaign.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Only campaign owner can delete campaign' });
    }

    // Delete campaign picture if it exists
    if (campaign.picture) {
      const picturePath = path.join(__dirname, '../uploads/campaigns', campaign.picture);
      if (fs.existsSync(picturePath)) {
        try {
          fs.unlinkSync(picturePath);
        } catch (err) {
          console.warn('Failed to delete campaign picture:', err);
          // Continue with campaign deletion even if picture delete fails
        }
      }
    }

    // Delete the campaign
    await Campaign.findByIdAndDelete(id);

    res.json({
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ message: 'Error deleting campaign', error: error.message });
  }
};

export {
  getCampaigns,
  getCampaignById,
  generateInviteLink,
  getCampaignByInvite,
  joinCampaign,
  kickPlayer,
  leaveCampaign,
  toggleSlot,
  deleteCampaign
};

export const createCampaignWithUpload = [upload.single('picture'), createCampaign];
export const updateCampaignWithUpload = [upload.single('picture'), updateCampaign];
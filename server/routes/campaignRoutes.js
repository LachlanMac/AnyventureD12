import express from 'express';
import {
  getCampaigns,
  getCampaignById,
  createCampaignWithUpload,
  updateCampaignWithUpload,
  generateInviteLink,
  getCampaignByInvite,
  joinCampaign,
  kickPlayer,
  leaveCampaign,
  toggleSlot,
  deleteCampaign
} from '../controllers/campaignController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes (for invite links)
router.get('/join/:token', getCampaignByInvite);

// Join campaign using invite token (must be before auth middleware)
router.post('/join/:token', protect, joinCampaign);

// Protected routes
router.use(protect);

// Get all campaigns for current user
router.get('/', getCampaigns);

// Create new campaign
router.post('/', createCampaignWithUpload);

// Get specific campaign
router.get('/:id', getCampaignById);

// Update campaign
router.put('/:id', updateCampaignWithUpload);

// Delete campaign
router.delete('/:id', deleteCampaign);

// Generate invite link for a slot
router.post('/:id/invite', generateInviteLink);

// Kick player from campaign
router.delete('/:id/players', kickPlayer);

// Leave campaign
router.post('/:id/leave', leaveCampaign);

// Toggle slot open/closed
router.patch('/:id/slots', toggleSlot);

export default router;
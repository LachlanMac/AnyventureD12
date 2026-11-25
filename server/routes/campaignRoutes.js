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
  addOwnCharacterToSlot,
  deleteCampaign
} from '../controllers/campaignController.js';
import {
  getCampaignItems,
  getAvailableCampaignItems,
  addCampaignItem,
  removeCampaignItem
} from '../controllers/campaignItemController.js';
import {
  getStorage,
  addStorageItem,
  removeStorageItem,
  setStorageMoney,
  moveStorageItem,
  moveStorageMoney,
  storageItemToCharacter,
  storageMoneyToCharacter,
  depositItem,
  depositMoney
} from '../controllers/campaignStorageController.js';
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

// GM adds one of their own characters to an empty slot
router.post('/:id/slots/:slotIndex/character', addOwnCharacterToSlot);

// Campaign custom items
router.get('/:id/items', getCampaignItems);
router.get('/:id/available-items', getAvailableCampaignItems);
router.post('/:id/items', addCampaignItem);
router.delete('/:id/items/:itemId', removeCampaignItem);

// Campaign storage (GM stash + party storage). :which is 'gm' or 'party'.
router.get('/:id/storage', getStorage);
router.post('/:id/storage/party/deposit', depositItem);
router.post('/:id/storage/party/money/deposit', depositMoney);
router.post('/:id/storage/:which/items', addStorageItem);
router.delete('/:id/storage/:which/items/:entryId', removeStorageItem);
router.put('/:id/storage/:which/money', setStorageMoney);
router.post('/:id/storage/:which/items/:entryId/move', moveStorageItem);
router.post('/:id/storage/:which/money/move', moveStorageMoney);
router.post('/:id/storage/:which/items/:entryId/to-character', storageItemToCharacter);
router.post('/:id/storage/:which/money/to-character', storageMoneyToCharacter);

export default router;
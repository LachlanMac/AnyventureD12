import Campaign from '../models/Campaign.js';
import Character from '../models/Character.js';
import Item from '../models/Item.js';

// Campaign custom items: a GM attaches their own homebrew items (drafts included)
// to a campaign, and every character in that campaign can pick them.

const isCampaignOwner = (campaign, user) =>
  !!user && campaign.owner.toString() === user._id.toString();

// The GM, or a user with a character in one of the campaign's slots
const canViewCampaign = async (campaign, user) => {
  if (!user) return false;
  if (isCampaignOwner(campaign, user)) return true;
  const characterIds = campaign.playerSlots.map(slot => slot.character).filter(Boolean);
  if (characterIds.length === 0) return false;
  return !!(await Character.exists({ _id: { $in: characterIds }, userId: user._id }));
};

// @desc    Items attached to a campaign
// @route   GET /api/campaigns/:id/items
// @access  Campaign GM and players
export const getCampaignItems = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('customItems');
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    if (!(await canViewCampaign(campaign, req.user))) {
      return res.status(403).json({ message: 'Access denied' });
    }
    // Items deleted from homebrew since they were added come back as null
    res.json((campaign.customItems || []).filter(Boolean));
  } catch (error) {
    console.error('Error fetching campaign items:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    The GM's homebrew items not yet in the campaign (for the Add Item picker)
// @route   GET /api/campaigns/:id/available-items
// @access  Campaign GM
export const getAvailableCampaignItems = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).select('owner customItems');
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    if (!isCampaignOwner(campaign, req.user)) {
      return res.status(403).json({ message: 'Only the campaign GM can add items' });
    }
    const items = await Item.find({
      isHomebrew: true,
      creatorId: req.user._id.toString(),
      _id: { $nin: campaign.customItems || [] }
    })
      .select('_id name description type rarity value weight status weapon_category')
      .sort('name');
    res.json(items);
  } catch (error) {
    console.error('Error fetching available campaign items:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Attach one of the GM's homebrew items to the campaign
// @route   POST /api/campaigns/:id/items   body: { itemId }
// @access  Campaign GM
export const addCampaignItem = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).select('owner customItems');
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    if (!isCampaignOwner(campaign, req.user)) {
      return res.status(403).json({ message: 'Only the campaign GM can add items' });
    }

    const item = await Item.findById(req.body?.itemId).select('isHomebrew creatorId');
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (!item.isHomebrew || item.creatorId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only add your own homebrew items' });
    }

    await Campaign.updateOne({ _id: campaign._id }, { $addToSet: { customItems: item._id } });
    res.json({ message: 'Item added to campaign' });
  } catch (error) {
    console.error('Error adding campaign item:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove an item from the campaign (characters keep copies they already have)
// @route   DELETE /api/campaigns/:id/items/:itemId
// @access  Campaign GM
export const removeCampaignItem = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).select('owner');
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    if (!isCampaignOwner(campaign, req.user)) {
      return res.status(403).json({ message: 'Only the campaign GM can remove items' });
    }
    await Campaign.updateOne({ _id: campaign._id }, { $pull: { customItems: req.params.itemId } });
    res.json({ message: 'Item removed from campaign' });
  } catch (error) {
    console.error('Error removing campaign item:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Items from every campaign a character is in (for the character's item browser)
// @route   GET /api/characters/:id/campaign-items
// @access  Private
export const getCharacterCampaignItems = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ 'playerSlots.character': req.params.id })
      .select('name customItems')
      .populate('customItems');

    const seen = new Set();
    const items = [];
    for (const campaign of campaigns) {
      for (const item of campaign.customItems || []) {
        if (!item || seen.has(item._id.toString())) continue;
        seen.add(item._id.toString());
        items.push({ ...item.toObject(), campaignId: campaign._id, campaignName: campaign.name });
      }
    }
    res.json(items);
  } catch (error) {
    console.error('Error fetching character campaign items:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Whether a user may put an item on a character: official items, published
 * homebrew, their own homebrew, or an item in a campaign the character is in.
 */
export const canAddItemToCharacter = async (user, characterId, item) => {
  if (!item.isHomebrew) return true;
  if (['published', 'approved'].includes(item.status)) return true;
  if (user && item.creatorId === user._id.toString()) return true;
  return !!(await Campaign.exists({ 'playerSlots.character': characterId, customItems: item._id }));
};

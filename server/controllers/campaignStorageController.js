import mongoose from 'mongoose';
import Campaign from '../models/Campaign.js';
import Character from '../models/Character.js';
import Item from '../models/Item.js';

// Campaign storage: a private GM stash and a party storage everyone in the campaign shares.
// Items move one-for-one between the storages and character inventories. Every move that
// takes something out uses a conditional update, so two people can't take the last one.

const STORAGE_FIELDS = { gm: 'gmStorage', party: 'partyStorage' };
const LOG_LIMIT = 200;
const ITEM_SUMMARY_FIELDS = '_id name description type rarity value weight weapon_category';

const toInt = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.floor(n) : NaN;
};

const formatMoney = (gold, silver) => {
  const parts = [];
  if (gold) parts.push(`${gold} gold`);
  if (silver) parts.push(`${silver} silver`);
  return parts.join(' and ') || 'nothing';
};

const isOwner = (campaign, user) => !!user && campaign.owner.toString() === user._id.toString();

const isCharacterInCampaign = (campaign, characterId) =>
  campaign.playerSlots.some(
    (slot) => slot.character && slot.character.toString() === characterId.toString()
  );

const fail = (status, message) => Object.assign(new Error(message), { status });

const sendError = (res, error, fallback) => {
  if (error.status) return res.status(error.status).json({ message: error.message });
  console.error(fallback, error);
  return res.status(500).json({ message: error.message });
};

const getStorageField = (which) => {
  const field = STORAGE_FIELDS[which];
  if (!field) throw fail(400, 'Unknown storage');
  return field;
};

const loadCampaign = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw fail(404, 'Campaign not found');
  const campaign = await Campaign.findById(id);
  if (!campaign) throw fail(404, 'Campaign not found');
  return campaign;
};

const requireOwner = (campaign, user) => {
  if (!isOwner(campaign, user)) throw fail(403, 'Only the campaign GM can do that');
};

// A character in this campaign. With mustOwn, it must also belong to the user.
const loadCampaignCharacter = async (campaign, characterId, user, { mustOwn }) => {
  if (!mongoose.Types.ObjectId.isValid(characterId)) throw fail(400, 'Invalid character');
  if (!isCharacterInCampaign(campaign, characterId)) {
    throw fail(400, 'That character is not in this campaign');
  }
  const character = await Character.findById(characterId);
  if (!character) throw fail(404, 'Character not found');
  if (mustOwn && character.userId !== user._id.toString()) {
    throw fail(403, 'That is not your character');
  }
  return character;
};

const addLog = (campaignId, text, visibility) =>
  Campaign.updateOne(
    { _id: campaignId },
    { $push: { storageLog: { $each: [{ text, visibility, at: new Date() }], $slice: -LOG_LIMIT } } }
  );

const entryName = async (entry) => {
  if (entry.isCustomized) return entry.itemData?.name || 'an item';
  const item = await Item.findById(entry.itemId).select('name').lean();
  return item?.name || 'an item';
};

// Put a stack into a storage, merging with an existing plain stack of the same item
const addToStorage = async (campaignId, field, entry, quantity) => {
  if (!entry.isCustomized && entry.itemId) {
    const merged = await Campaign.updateOne(
      {
        _id: campaignId,
        [`${field}.items`]: { $elemMatch: { itemId: entry.itemId, isCustomized: false } },
      },
      { $inc: { [`${field}.items.$.quantity`]: quantity } }
    );
    if (merged.modifiedCount) return;
  }
  await Campaign.updateOne(
    { _id: campaignId },
    {
      $push: {
        [`${field}.items`]: {
          itemId: entry.isCustomized ? null : entry.itemId,
          itemData: entry.isCustomized ? entry.itemData : null,
          isCustomized: !!entry.isCustomized,
          quantity,
        },
      },
    }
  );
};

// Take some of a stack out of a storage. Returns a copy of the stack, or throws if there isn't enough.
const takeFromStorage = async (campaign, field, entryId, quantity) => {
  const entry = campaign[field]?.items?.id(entryId);
  if (!entry) throw fail(404, 'That item is no longer in storage');
  const snapshot = entry.toObject();

  const result = await Campaign.updateOne(
    {
      _id: campaign._id,
      [`${field}.items`]: { $elemMatch: { _id: entry._id, quantity: { $gte: quantity } } },
    },
    { $inc: { [`${field}.items.$.quantity`]: -quantity } }
  );
  if (!result.modifiedCount) throw fail(409, 'Not enough left in storage. Someone may have just taken it.');

  await Campaign.updateOne(
    { _id: campaign._id },
    { $pull: { [`${field}.items`]: { quantity: { $lte: 0 } } } }
  );
  return snapshot;
};

const takeMoneyFromStorage = async (campaignId, field, gold, silver) => {
  const result = await Campaign.updateOne(
    { _id: campaignId, [`${field}.gold`]: { $gte: gold }, [`${field}.silver`]: { $gte: silver } },
    { $inc: { [`${field}.gold`]: -gold, [`${field}.silver`]: -silver } }
  );
  if (!result.modifiedCount) throw fail(409, 'Not enough money in storage');
};

const addMoneyToStorage = (campaignId, field, gold, silver) =>
  Campaign.updateOne(
    { _id: campaignId },
    { $inc: { [`${field}.gold`]: gold, [`${field}.silver`]: silver } }
  );

const giveToCharacter = async (character, entry, quantity) => {
  if (entry.isCustomized) {
    character.inventory.push({ itemData: entry.itemData, isCustomized: true, quantity });
    await character.save();
    return;
  }
  const result = await character.addItem(entry.itemId, quantity);
  if (!result.success) throw fail(400, result.message || 'Could not add the item');
};

const parseQuantity = (value) => {
  const quantity = toInt(value ?? 1);
  if (!Number.isFinite(quantity) || quantity < 1) throw fail(400, 'Quantity must be at least 1');
  return quantity;
};

const parseMoney = (body) => {
  const gold = toInt(body?.gold ?? 0);
  const silver = toInt(body?.silver ?? 0);
  if (!Number.isFinite(gold) || !Number.isFinite(silver) || gold < 0 || silver < 0) {
    throw fail(400, 'Gold and silver must be whole numbers, 0 or more');
  }
  if (gold === 0 && silver === 0) throw fail(400, 'Enter an amount of gold or silver');
  return { gold, silver };
};

// What the GM may put into storage: official items, published homebrew,
// their own homebrew, and the campaign's custom items
const canGmUseItem = (campaign, user, item) => {
  if (!item.isHomebrew) return true;
  if (['published', 'approved'].includes(item.status)) return true;
  if (item.creatorId === user._id.toString()) return true;
  return (campaign.customItems || []).some((id) => id.toString() === item._id.toString());
};

const serializeStorage = (storage) => ({
  gold: storage?.gold || 0,
  silver: storage?.silver || 0,
  items: (storage?.items || [])
    .filter((entry) => entry.quantity > 0)
    .map((entry) => {
      const source = entry.isCustomized ? entry.itemData : entry.itemId;
      return {
        _id: entry._id,
        quantity: entry.quantity,
        isCustomized: !!entry.isCustomized,
        item: source
          ? {
              _id: source._id,
              name: source.name,
              description: source.description,
              type: source.type,
              rarity: source.rarity,
              value: source.value,
              weight: source.weight,
            }
          : { name: 'Missing item' },
      };
    })
    .sort((a, b) => (a.item.name || '').localeCompare(b.item.name || '')),
});

// The storage view for this user: the GM sees both storages and the whole log,
// players see the party storage and the party log
const buildStorageView = async (campaignId, user) => {
  const campaign = await Campaign.findById(campaignId)
    .populate('gmStorage.items.itemId', ITEM_SUMMARY_FIELDS)
    .populate('partyStorage.items.itemId', ITEM_SUMMARY_FIELDS)
    .populate({ path: 'playerSlots.character', select: '_id name userId' });
  const gm = isOwner(campaign, user);

  const characters = campaign.playerSlots
    .filter((slot) => slot.character)
    .map((slot) => ({
      _id: slot.character._id,
      name: slot.character.name,
      isMine: slot.character.userId === user._id.toString(),
    }));

  const log = (campaign.storageLog || [])
    .filter((entry) => gm || entry.visibility === 'party')
    .slice(-50)
    .reverse();

  return {
    isGM: gm,
    party: serializeStorage(campaign.partyStorage),
    ...(gm ? { gm: serializeStorage(campaign.gmStorage) } : {}),
    characters,
    log,
  };
};

const canViewStorage = async (campaign, user) => {
  if (isOwner(campaign, user)) return true;
  const characterIds = campaign.playerSlots.map((slot) => slot.character).filter(Boolean);
  if (characterIds.length === 0) return false;
  return !!(await Character.exists({ _id: { $in: characterIds }, userId: user._id.toString() }));
};

// @desc    Storage view (GM: both storages; players: party storage)
// @route   GET /api/campaigns/:id/storage
export const getStorage = async (req, res) => {
  try {
    const campaign = await loadCampaign(req.params.id);
    if (!(await canViewStorage(campaign, req.user))) throw fail(403, 'Access denied');
    res.json(await buildStorageView(campaign._id, req.user));
  } catch (error) {
    sendError(res, error, 'Error fetching campaign storage:');
  }
};

// @desc    GM adds items to a storage
// @route   POST /api/campaigns/:id/storage/:which/items   body: { itemId, quantity }
export const addStorageItem = async (req, res) => {
  try {
    const field = getStorageField(req.params.which);
    const campaign = await loadCampaign(req.params.id);
    requireOwner(campaign, req.user);
    const quantity = parseQuantity(req.body?.quantity);

    if (!mongoose.Types.ObjectId.isValid(req.body?.itemId)) throw fail(400, 'Invalid item');
    const item = await Item.findById(req.body.itemId).select('_id name isHomebrew status creatorId');
    if (!item) throw fail(404, 'Item not found');
    if (!canGmUseItem(campaign, req.user, item)) throw fail(403, 'You cannot use that item');

    await addToStorage(campaign._id, field, { itemId: item._id, isCustomized: false }, quantity);
    const where = req.params.which === 'gm' ? 'GM storage' : 'party storage';
    await addLog(
      campaign._id,
      `The GM added ${item.name} ×${quantity} to ${where}`,
      req.params.which === 'gm' ? 'gm' : 'party'
    );
    res.json(await buildStorageView(campaign._id, req.user));
  } catch (error) {
    sendError(res, error, 'Error adding storage item:');
  }
};

// @desc    GM removes a whole stack from a storage
// @route   DELETE /api/campaigns/:id/storage/:which/items/:entryId
export const removeStorageItem = async (req, res) => {
  try {
    const field = getStorageField(req.params.which);
    const campaign = await loadCampaign(req.params.id);
    requireOwner(campaign, req.user);
    const entry = campaign[field]?.items?.id(req.params.entryId);
    if (!entry) throw fail(404, 'That item is no longer in storage');

    const name = await entryName(entry);
    await Campaign.updateOne(
      { _id: campaign._id },
      { $pull: { [`${field}.items`]: { _id: entry._id } } }
    );
    await addLog(
      campaign._id,
      `The GM removed ${name} ×${entry.quantity} from ${req.params.which === 'gm' ? 'GM' : 'party'} storage`,
      req.params.which === 'gm' ? 'gm' : 'party'
    );
    res.json(await buildStorageView(campaign._id, req.user));
  } catch (error) {
    sendError(res, error, 'Error removing storage item:');
  }
};

// @desc    GM sets the gold and silver in a storage
// @route   PUT /api/campaigns/:id/storage/:which/money   body: { gold, silver }
export const setStorageMoney = async (req, res) => {
  try {
    const field = getStorageField(req.params.which);
    const campaign = await loadCampaign(req.params.id);
    requireOwner(campaign, req.user);
    const gold = toInt(req.body?.gold ?? 0);
    const silver = toInt(req.body?.silver ?? 0);
    if (!Number.isFinite(gold) || !Number.isFinite(silver) || gold < 0 || silver < 0) {
      throw fail(400, 'Gold and silver must be whole numbers, 0 or more');
    }

    await Campaign.updateOne(
      { _id: campaign._id },
      { $set: { [`${field}.gold`]: gold, [`${field}.silver`]: silver } }
    );
    await addLog(
      campaign._id,
      `The GM set ${req.params.which === 'gm' ? 'GM' : 'party'} storage money to ${gold} gold and ${silver} silver`,
      req.params.which === 'gm' ? 'gm' : 'party'
    );
    res.json(await buildStorageView(campaign._id, req.user));
  } catch (error) {
    sendError(res, error, 'Error setting storage money:');
  }
};

// @desc    GM moves items between GM storage and party storage
// @route   POST /api/campaigns/:id/storage/:which/items/:entryId/move   body: { quantity }
export const moveStorageItem = async (req, res) => {
  try {
    const from = getStorageField(req.params.which);
    const to = req.params.which === 'gm' ? STORAGE_FIELDS.party : STORAGE_FIELDS.gm;
    const campaign = await loadCampaign(req.params.id);
    requireOwner(campaign, req.user);
    const quantity = parseQuantity(req.body?.quantity);

    const entry = await takeFromStorage(campaign, from, req.params.entryId, quantity);
    await addToStorage(campaign._id, to, entry, quantity);
    const name = await entryName(entry);
    await addLog(
      campaign._id,
      req.params.which === 'gm'
        ? `The GM put ${name} ×${quantity} in party storage`
        : `The GM took ${name} ×${quantity} from party storage`,
      'party'
    );
    res.json(await buildStorageView(campaign._id, req.user));
  } catch (error) {
    sendError(res, error, 'Error moving storage item:');
  }
};

// @desc    GM moves money between GM storage and party storage
// @route   POST /api/campaigns/:id/storage/:which/money/move   body: { gold, silver }
export const moveStorageMoney = async (req, res) => {
  try {
    const from = getStorageField(req.params.which);
    const to = req.params.which === 'gm' ? STORAGE_FIELDS.party : STORAGE_FIELDS.gm;
    const campaign = await loadCampaign(req.params.id);
    requireOwner(campaign, req.user);
    const { gold, silver } = parseMoney(req.body);

    await takeMoneyFromStorage(campaign._id, from, gold, silver);
    await addMoneyToStorage(campaign._id, to, gold, silver);
    await addLog(
      campaign._id,
      req.params.which === 'gm'
        ? `The GM put ${formatMoney(gold, silver)} in party storage`
        : `The GM took ${formatMoney(gold, silver)} from party storage`,
      'party'
    );
    res.json(await buildStorageView(campaign._id, req.user));
  } catch (error) {
    sendError(res, error, 'Error moving storage money:');
  }
};

// @desc    Move items from a storage into a character's inventory.
//          GM storage: GM only (give). Party storage: the GM (give) or the character's owner (take).
// @route   POST /api/campaigns/:id/storage/:which/items/:entryId/to-character   body: { characterId, quantity }
export const storageItemToCharacter = async (req, res) => {
  try {
    const field = getStorageField(req.params.which);
    const campaign = await loadCampaign(req.params.id);
    const gm = isOwner(campaign, req.user);
    if (req.params.which === 'gm' && !gm) throw fail(403, 'Only the campaign GM can do that');
    const quantity = parseQuantity(req.body?.quantity);
    const character = await loadCampaignCharacter(campaign, req.body?.characterId, req.user, {
      mustOwn: !gm,
    });

    const entry = await takeFromStorage(campaign, field, req.params.entryId, quantity);
    try {
      await giveToCharacter(character, entry, quantity);
    } catch (error) {
      await addToStorage(campaign._id, field, entry, quantity); // put it back
      throw error;
    }

    const name = await entryName(entry);
    const ownsCharacter = character.userId === req.user._id.toString();
    await addLog(
      campaign._id,
      gm && !ownsCharacter
        ? `The GM gave ${name} ×${quantity} to ${character.name}`
        : `${character.name} took ${name} ×${quantity} from party storage`,
      req.params.which === 'gm' ? 'gm' : 'party'
    );
    res.json(await buildStorageView(campaign._id, req.user));
  } catch (error) {
    sendError(res, error, 'Error moving storage item to character:');
  }
};

// @desc    Move money from a storage to a character (same permissions as items)
// @route   POST /api/campaigns/:id/storage/:which/money/to-character   body: { characterId, gold, silver }
export const storageMoneyToCharacter = async (req, res) => {
  try {
    const field = getStorageField(req.params.which);
    const campaign = await loadCampaign(req.params.id);
    const gm = isOwner(campaign, req.user);
    if (req.params.which === 'gm' && !gm) throw fail(403, 'Only the campaign GM can do that');
    const { gold, silver } = parseMoney(req.body);
    const character = await loadCampaignCharacter(campaign, req.body?.characterId, req.user, {
      mustOwn: !gm,
    });

    await takeMoneyFromStorage(campaign._id, field, gold, silver);
    await Character.updateOne(
      { _id: character._id },
      { $inc: { 'wealth.gold': gold, 'wealth.silver': silver } }
    );

    const ownsCharacter = character.userId === req.user._id.toString();
    await addLog(
      campaign._id,
      gm && !ownsCharacter
        ? `The GM gave ${formatMoney(gold, silver)} to ${character.name}`
        : `${character.name} took ${formatMoney(gold, silver)} from party storage`,
      req.params.which === 'gm' ? 'gm' : 'party'
    );
    res.json(await buildStorageView(campaign._id, req.user));
  } catch (error) {
    sendError(res, error, 'Error moving storage money to character:');
  }
};

// Whether an inventory entry is currently equipped (worn implant, or in an equipment slot)
const isInventoryEntryEquipped = (character, entry) => {
  if (entry.equipped) return true;
  const entryItemId = entry.isCustomized
    ? entry.itemData?.originalItemId?.toString()
    : entry.itemId?.toString();
  if (!entryItemId) return false;
  return Object.values(character.equipment?.toObject?.() || character.equipment || {}).some(
    (slot) => slot?.itemId && slot.itemId.toString() === entryItemId
  );
};

// @desc    A character stores items from their inventory in party storage
// @route   POST /api/campaigns/:id/storage/party/deposit   body: { characterId, inventoryIndex, quantity }
export const depositItem = async (req, res) => {
  try {
    const campaign = await loadCampaign(req.params.id);
    const quantity = parseQuantity(req.body?.quantity);
    const character = await loadCampaignCharacter(campaign, req.body?.characterId, req.user, {
      mustOwn: true,
    });

    const index = toInt(req.body?.inventoryIndex);
    const entry = Number.isFinite(index) ? character.inventory[index] : null;
    if (!entry) throw fail(404, 'Item not found in inventory');
    if ((entry.quantity || 1) < quantity) throw fail(400, 'You do not have that many');
    if (isInventoryEntryEquipped(character, entry)) {
      throw fail(400, 'Unequip the item before storing it');
    }

    const snapshot = {
      itemId: entry.isCustomized ? null : entry.itemId,
      itemData: entry.isCustomized ? entry.itemData : null,
      isCustomized: !!entry.isCustomized,
    };
    const name = entry.isCustomized ? entry.itemData?.name : await entryName(snapshot);

    // Take it out of the inventory first, then put it in storage
    if ((entry.quantity || 1) === quantity) {
      character.inventory.splice(index, 1);
    } else {
      entry.quantity = (entry.quantity || 1) - quantity;
    }
    await character.save();

    await addToStorage(campaign._id, STORAGE_FIELDS.party, snapshot, quantity);
    await addLog(
      campaign._id,
      `${character.name} stored ${name || 'an item'} ×${quantity} in party storage`,
      'party'
    );
    res.json(await buildStorageView(campaign._id, req.user));
  } catch (error) {
    sendError(res, error, 'Error storing item:');
  }
};

// @desc    A character stores money in party storage
// @route   POST /api/campaigns/:id/storage/party/money/deposit   body: { characterId, gold, silver }
export const depositMoney = async (req, res) => {
  try {
    const campaign = await loadCampaign(req.params.id);
    const { gold, silver } = parseMoney(req.body);
    const character = await loadCampaignCharacter(campaign, req.body?.characterId, req.user, {
      mustOwn: true,
    });

    const result = await Character.updateOne(
      { _id: character._id, 'wealth.gold': { $gte: gold }, 'wealth.silver': { $gte: silver } },
      { $inc: { 'wealth.gold': -gold, 'wealth.silver': -silver } }
    );
    if (!result.modifiedCount) throw fail(400, 'You do not have that much money');

    await addMoneyToStorage(campaign._id, STORAGE_FIELDS.party, gold, silver);
    await addLog(
      campaign._id,
      `${character.name} stored ${formatMoney(gold, silver)} in party storage`,
      'party'
    );
    res.json(await buildStorageView(campaign._id, req.user));
  } catch (error) {
    sendError(res, error, 'Error storing money:');
  }
};

// @desc    Campaigns a character is in (for the inventory's Storage view and Store button)
// @route   GET /api/characters/:id/campaigns
export const getCharacterCampaigns = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw fail(404, 'Character not found');
    const character = await Character.findById(req.params.id).select('userId');
    if (!character) throw fail(404, 'Character not found');

    const campaigns = await Campaign.find({ 'playerSlots.character': character._id }).select(
      '_id name owner'
    );
    const mine = character.userId === req.user._id.toString();
    const visible = campaigns.filter((campaign) => mine || isOwner(campaign, req.user));
    res.json(visible.map((campaign) => ({ _id: campaign._id, name: campaign.name })));
  } catch (error) {
    sendError(res, error, 'Error fetching character campaigns:');
  }
};

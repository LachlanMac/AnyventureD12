import Song from '../models/Song.js';
import Character from '../models/Character.js';

// GET /api/songs
export const getSongs = async (req, res) => {
  try {
    const songs = await Song.find({});
    res.json(songs);
  } catch (err) {
    console.error('Error fetching songs:', err);
    res.status(500).json({ message: 'Failed to load songs' });
  }
};

// GET /api/songs/:id
export const getSong = async (req, res) => {
  try {
    const idParam = req.params.id;
    let song = null;
    if (/^[0-9a-fA-F]{24}$/.test(idParam)) {
      song = await Song.findById(idParam);
    }
    if (!song) song = await Song.findOne({ id: Number(idParam) });
    if (!song) return res.status(404).json({ message: 'Song not found' });
    res.json(song);
  } catch (err) {
    console.error('Error fetching song:', err);
    res.status(500).json({ message: 'Failed to load song' });
  }
};

// Character Songs
export const getCharacterSongs = async (req, res) => {
  try {
    const character = await Character.findById(req.params.characterId).populate('songs.songId');
    if (!character) return res.status(404).json({ message: 'Character not found' });
    // ownership checked by protect middleware and route usage in this app pattern
    res.json({ songs: character.songs || [] });
  } catch (err) {
    console.error('Error fetching character songs:', err);
    res.status(500).json({ message: 'Failed to load character songs' });
  }
};

export const addSongToCharacter = async (req, res) => {
  try {
    const { characterId } = req.params;
    const { songId, notes } = req.body.songId ? req.body : { songId: req.params.songId, notes: req.body?.notes };
    const character = await Character.findById(characterId);
    if (!character) return res.status(404).json({ message: 'Character not found' });
    const already = (character.songs || []).some((s) => String(s.songId) === String(songId));
    if (!already) {
      character.songs = character.songs || [];
      character.songs.push({ songId, notes: notes || '' });
      await character.save();
    }
    const updated = await Character.findById(characterId).populate('songs.songId');
    res.json({ songs: updated.songs });
  } catch (err) {
    console.error('Error adding song to character:', err);
    res.status(500).json({ message: 'Failed to add song' });
  }
};

export const removeSongFromCharacter = async (req, res) => {
  try {
    const { characterId, songId } = req.params;
    const character = await Character.findById(characterId);
    if (!character) return res.status(404).json({ message: 'Character not found' });
    character.songs = (character.songs || []).filter((s) => String(s.songId) !== String(songId));
    await character.save();
    const updated = await Character.findById(characterId).populate('songs.songId');
    res.json({ songs: updated.songs });
  } catch (err) {
    console.error('Error removing song from character:', err);
    res.status(500).json({ message: 'Failed to remove song' });
  }
};

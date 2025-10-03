import { getCharacterWithBonuses, verifyCharacterOwnership } from '../services/characterService.js';
import Character from '../models/Character.js';

/**
 * Creates a generic update handler for character fields
 * @param {Function} updateFn - Function that takes (character, value) and applies the update
 * @param {string} fieldName - The field name in the request body
 * @param {Object} options - Additional options for the handler
 */
export function createCharacterUpdateHandler(updateFn, fieldName, options = {}) {
  const {
    validateValue = null,
    transformValue = null,
    successMessage = null
  } = options;

  return async (req, res) => {
    try {
      const characterId = req.params.id;
      const userId = req.user._id;
      const value = req.body[fieldName];

      // Verify ownership
      const ownership = await verifyCharacterOwnership(characterId, userId);

      if (!ownership.exists) {
        return res.status(404).json({ message: 'Character not found' });
      }

      if (!ownership.isOwner) {
        return res.status(403).json({ message: 'Not authorized to update this character' });
      }

      // Validate value if validator provided
      if (validateValue) {
        const validation = validateValue(value);
        if (!validation.valid) {
          return res.status(400).json({ message: validation.error });
        }
      }

      // Transform value if transformer provided
      const finalValue = transformValue ? transformValue(value) : value;

      // Get the character
      const character = await Character.findById(characterId);

      // Apply the update
      await updateFn(character, finalValue);
      await character.save();

      // Get updated character with bonuses
      const updatedCharacter = await getCharacterWithBonuses(characterId);

      // Send response
      if (successMessage) {
        res.json({
          message: successMessage,
          character: updatedCharacter
        });
      } else {
        res.json(updatedCharacter);
      }
    } catch (error) {
      console.error(`Error updating ${fieldName}:`, error);
      res.status(500).json({ message: error.message });
    }
  };
}

/**
 * Creates a handler for resource updates with clamping
 */
export function createResourceUpdateHandler() {
  return async (req, res) => {
    try {
      const characterId = req.params.id;
      const userId = req.user._id;
      const { resources } = req.body;

      // Verify ownership
      const ownership = await verifyCharacterOwnership(characterId, userId);

      if (!ownership.exists) {
        return res.status(404).json({ message: 'Character not found' });
      }

      if (!ownership.isOwner) {
        return res.status(403).json({ message: 'Not authorized to update this character' });
      }

      // Get character with bonuses to calculate effective max values
      const characterWithBonuses = await getCharacterWithBonuses(characterId);

      // Get effective max values
      const effectiveMaxHealth = characterWithBonuses.resources.health.max;
      const effectiveMaxEnergy = characterWithBonuses.resources.energy.max;
      const effectiveMaxResolve = characterWithBonuses.resources.resolve.max;
      const effectiveMaxMorale = characterWithBonuses.resources.morale.max;

      // Get the raw character document to update
      const character = await Character.findById(characterId);

      // Update ONLY current values (never max - max is calculated from bonuses)
      // Clamp current values to effective max
      character.resources.health.current = Math.max(0, Math.min(
        resources.health.current,
        effectiveMaxHealth
      ));
      character.resources.energy.current = Math.max(0, Math.min(
        resources.energy.current,
        effectiveMaxEnergy
      ));
      character.resources.resolve.current = Math.max(0, Math.min(
        resources.resolve.current,
        effectiveMaxResolve
      ));
      character.resources.morale.current = Math.max(0, Math.min(
        resources.morale.current,
        effectiveMaxMorale
      ));

      await character.save();

      // Get updated character with bonuses
      const updatedCharacter = await getCharacterWithBonuses(characterId);
      res.json(updatedCharacter);
    } catch (error) {
      console.error('Error updating resources:', error);
      res.status(500).json({ message: error.message });
    }
  };
}
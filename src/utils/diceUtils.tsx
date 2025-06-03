// src/utils/diceUtils.ts
// Utility functions for dice tier calculations

// Base dice tier arrays
export const DICE_TYPES = ['d4', 'd6', 'd8', 'd10', 'd12', 'd16', 'd20'];
export const DICE_TYPES_UPGRADED = ['d6', 'd8', 'd10', 'd12', 'd16', 'd20', 'd30'];
export const DICE_TYPES_DOWNGRADED = ['d2', 'd4', 'd6', 'd8', 'd10', 'd12', 'd16'];

/**
 * Get the modified dice tier based on upgrade/downgrade modifiers
 * @param baseValue - The base skill value (0-6)
 * @param diceTierModifier - The modifier (-1 for downgrade, +1 for upgrade, 0 for normal)
 * @returns The modified dice type string (e.g., 'd8', 'd12')
 */
export const getModifiedDiceType = (baseValue: number, diceTierModifier: number = 0): string => {
  // For negative skill values, treat them as 0 for dice type calculation
  const clampedValue = Math.max(0, Math.min(baseValue, 6));

  if (diceTierModifier > 0) {
    // Upgraded dice tier
    return DICE_TYPES_UPGRADED[clampedValue] || 'd30';
  } else if (diceTierModifier < 0) {
    // Downgraded dice tier
    return DICE_TYPES_DOWNGRADED[clampedValue] || 'd2';
  } else {
    // Normal dice tier
    return DICE_TYPES[clampedValue] || 'd20';
  }
};

/**
 * Get a formatted string showing the dice roll for a skill
 * @param talent - Number of dice to roll
 * @param skillValue - The skill value (0-6)
 * @param diceTierModifier - The dice tier modifier
 * @returns Formatted string like "3d12" or "No dice"
 */
export const getSkillDiceString = (
  talent: number,
  skillValue: number,
  diceTierModifier: number = 0
): string => {
  if (talent <= 0) {
    return 'No dice';
  }

  // If skill value is negative, you cannot roll dice - automatic failure (result of 1)
  if (skillValue < 0) {
    return '1';
  }

  const diceType = getModifiedDiceType(skillValue, diceTierModifier);
  return `${talent}${diceType}`;
};

/**
 * Get a description of the dice tier modification
 * @param diceTierModifier - The modifier value
 * @returns Description string or null if no modifier
 */
export const getDiceTierModifierDescription = (diceTierModifier: number): string | null => {
  if (diceTierModifier > 0) {
    return `Upgraded (+${diceTierModifier})`;
  } else if (diceTierModifier < 0) {
    return `Downgraded (${diceTierModifier})`;
  }
  return null;
};

/**
 * Get a short indicator for dice tier modification (U/D)
 * @param diceTierModifier - The modifier value
 * @returns 'U' for upgraded, 'D' for downgraded, or empty string
 */
export const getDiceTierModifierIndicator = (diceTierModifier: number): string => {
  if (diceTierModifier > 0) {
    return 'U';
  } else if (diceTierModifier < 0) {
    return 'D';
  }
  return '';
};

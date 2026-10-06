// src/utils/valueUtils.tsx
// Utility functions for handling value/gold conversions

/**
 * Converts internal value (integer) to gold (decimal)
 * Example: 100 value = 10 gold
 */
export const valueToGold = (value: number): number => value / 10;

/**
 * Converts gold (decimal) to internal value (integer)
 * Example: 1.5 gold = 15 value
 */
export const goldToValue = (gold: number): number => Math.round(gold * 10);

/**
 * Formats internal value as a user-friendly gold/silver display
 * Examples:
 * - 0 value = "Free"
 * - 5 value = "5 silver"
 * - 10 value = "1 gold"
 * - 15 value = "1 gold, 5 silver"
 */
export const formatGoldDisplay = (value: number): string => {
  if (value === 0) return 'Free';

  // Round up to nearest gold if value > 200 (20 gold)
  if (value > 200) {
    const gold = Math.ceil(value / 10);
    return `${gold} gold`;
  }

  const gold = Math.floor(value / 10);
  const silver = value % 10;

  if (gold === 0) return `${silver} silver`;
  if (silver === 0) return `${gold} gold`;
  return `${gold}g ${silver}s`;
};

/**
 * Formats value as a decimal gold amount
 * Examples:
 * - 15 value = "1.5 gold"
 * - 100 value = "10 gold"
 * - 5 value = "0.5 gold"
 */
export const formatGoldDecimal = (value: number): string => {
  const gold = valueToGold(value);
  return `${gold} gold`;
};

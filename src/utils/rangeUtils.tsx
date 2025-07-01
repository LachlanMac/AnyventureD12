// Range utility functions for consistent range handling across the application

export interface RangeDefinition {
  id: number;
  name: string;
  units: string;
  minUnits: number;
  maxUnits: number;
}

// Standardized range definitions
export const RANGE_DEFINITIONS: RangeDefinition[] = [
  { id: 0, name: 'No Min/Self', units: '0 Units', minUnits: 0, maxUnits: 0 },
  { id: 1, name: 'Adjacent', units: '0 Units', minUnits: 0, maxUnits: 0 },
  { id: 2, name: 'Nearby', units: '1 Unit', minUnits: 1, maxUnits: 1 },
  { id: 3, name: 'Very Short', units: '2-5 Units', minUnits: 2, maxUnits: 5 },
  { id: 4, name: 'Short', units: '6-10 Units', minUnits: 6, maxUnits: 10 },
  { id: 5, name: 'Moderate', units: '11-20 Units', minUnits: 11, maxUnits: 20 },
  { id: 6, name: 'Distant', units: '21-40 Units', minUnits: 21, maxUnits: 40 },
  { id: 7, name: 'Remote', units: '41-100 Units', minUnits: 41, maxUnits: 100 },
  { id: 8, name: 'Planar', units: '101+ Units', minUnits: 101, maxUnits: Infinity },
];

/**
 * Get range definition by ID
 */
export function getRangeById(id: number): RangeDefinition | undefined {
  return RANGE_DEFINITIONS.find((range) => range.id === id);
}

/**
 * Map a unit value to the appropriate range ID
 */
export function unitToRangeId(units: number): number {
  if (units === 0) return 1; // Adjacent
  if (units === 1) return 2; // Nearby
  if (units >= 2 && units <= 5) return 3; // Very Short
  if (units >= 6 && units <= 10) return 4; // Short
  if (units >= 11 && units <= 20) return 5; // Moderate
  if (units >= 21 && units <= 40) return 6; // Distant
  if (units >= 41 && units <= 100) return 7; // Remote
  return 8; // Unlimited
}

/**
 * Format a single range for display
 */
export function formatRange(
  rangeId: number | string,
  context: 'spell' | 'weapon' | 'general' = 'general'
): string {
  // Handle string values that might come from the API
  if (typeof rangeId === 'string') {
    // If it's already a string like "Self", "Moderate", etc., return it
    if (
      rangeId === 'Self' ||
      rangeId === 'Adjacent' ||
      rangeId === 'Nearby' ||
      rangeId === 'Very Short' ||
      rangeId === 'Short' ||
      rangeId === 'Moderate' ||
      rangeId === 'Distant' ||
      rangeId === 'Remote' ||
      rangeId === 'Planar'
    ) {
      return rangeId;
    }
    // Try to parse as number
    const parsed = parseInt(rangeId);
    if (!isNaN(parsed)) {
      rangeId = parsed;
    } else {
      console.warn(`Cannot parse range value: ${rangeId}`);
      return rangeId; // Return as-is if we can't parse it
    }
  }

  // Convert to number for lookup
  const numericId = Number(rangeId);
  const range = getRangeById(numericId);

  if (!range) {
    console.warn(`Unknown range ID: ${rangeId} (numeric: ${numericId})`);
    return 'Unknown Range';
  }

  // Special handling for range 0 based on context
  if (numericId === 0) {
    if (context === 'spell') return 'Self';
    if (context === 'weapon') return 'No Min';
    return 'No Min/Self';
  }

  // Return just the name without units
  return range.name;
}

/**
 * Format a range span (min to max) for display
 */
export function formatRangeSpan(
  minRangeId: number,
  maxRangeId: number,
  context: 'spell' | 'weapon' | 'general' = 'general'
): string {
  if (minRangeId === maxRangeId) {
    return formatRange(minRangeId, context);
  }

  // Special rule: If minimum range is 0 (No Min), only show the max range
  if (minRangeId === 0) {
    return formatRange(maxRangeId, context);
  }

  // Special rule: If minimum range is 1 (Adjacent) and max is nearby, just show nearby
  // since adjacent attacks can also hit nearby targets
  if (minRangeId === 1 && maxRangeId === 2) {
    return formatRange(maxRangeId, context);
  }

  const minRange = getRangeById(minRangeId);
  const maxRange = getRangeById(maxRangeId);

  if (!minRange || !maxRange) return 'Unknown Range';

  // Calculate total unit span
  const minUnits = minRange.minUnits;
  const maxUnits = maxRange.maxUnits === Infinity ? '101+' : maxRange.maxUnits.toString();

  // Special handling when range includes adjacent (don't show units for adjacent-only spans)
  if (minRangeId === 1 && maxRangeId === 1) {
    return 'Adjacent';
  }

  return `${minRange.name} to ${maxRange.name} (${minUnits}-${maxUnits} Units)`;
}

/**
 * Get all range options for dropdowns
 */
export function getRangeOptions(
  context: 'spell' | 'weapon' | 'general' = 'general'
): Array<{ value: number; label: string }> {
  return RANGE_DEFINITIONS.map((range) => ({
    value: range.id,
    label: formatRange(range.id, context),
  }));
}

/**
 * Check if a target at given units is within range
 */
export function isInRange(targetUnits: number, minRangeId: number, maxRangeId: number): boolean {
  const minRange = getRangeById(minRangeId);
  const maxRange = getRangeById(maxRangeId);

  if (!minRange || !maxRange) return false;

  return targetUnits >= minRange.minUnits && targetUnits <= maxRange.maxUnits;
}

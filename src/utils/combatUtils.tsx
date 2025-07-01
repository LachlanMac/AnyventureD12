// Combat-related utility functions

/**
 * Get dice size for skill level
 */
export function getDiceForSkill(skillLevel: number): string {
  const diceMap = ['4', '6', '8', '10', '12', '16', '20'];
  return diceMap[skillLevel] || '4';
}

/**
 * Format damage display with extra damage
 */
export function formatDamage(damage: string, extraDamage: string, damageType: string): string {
  const extraDisplay = extraDamage !== '0' ? ` [${extraDamage}]` : '';
  return `${damage}${extraDisplay} ${damageType}`;
}

/**
 * Format secondary damage display
 */
export function formatSecondaryDamage(
  damage?: string,
  extraDamage?: string,
  damageType?: string
): string | null {
  if (!damage || !damageType) return null;
  const extraDisplay = extraDamage && extraDamage !== '0' ? ` [${extraDamage}]` : '';
  return `+ ${damage}${extraDisplay} ${damageType}`;
}

/**
 * Check if action/spell has range to display
 */
export function hasRange(minRange: number, maxRange: number): boolean {
  return maxRange > 0 || minRange > 0;
}

// Combat-related utility functions

/**
 * Get dice size for skill level
 */
export function getDiceForSkill(skillLevel: number): string {
  const diceMap = ['4', '6', '8', '10', '12', '16', '20', '24', '30'];
  return diceMap[skillLevel] || '4';
}

/**
 * Calculate an NPC's static defense from its old defense dice pool.
 *
 * Formula: floor(single-die average + log2(number of dice))
 * Example: 2d8 -> floor(4.5 + 1) = 5
 */
export function getStaticDefense(attributeTalent: number, skillLevel: number): number {
  if (attributeTalent <= 0) return 0;

  const dieSize = Number(getDiceForSkill(skillLevel));
  const singleDieAverage = (dieSize + 1) / 2;

  return Math.floor(singleDieAverage + Math.log2(attributeTalent));
}

/**
 * Build a damage chart string from base/growth/aimed/hands
 */
export function getDamageChart(base: number, growth: number, aimed: boolean = false, hands: number = 1): string {
  const maxHits = hands === 2 ? 6 : 5;
  const tiers: string[] = [];
  for (let i = 1; i <= maxHits; i++) {
    if (aimed && i === 1) {
      tiers.push('—');
    } else {
      const effectiveHits = aimed ? i - 1 : i;
      tiers.push(String(base + growth * effectiveHits));
    }
  }
  return tiers.join(', ');
}

/**
 * Format damage display as a chart
 */
export function formatDamage(damage: string, extraDamage: string, damageType: string, aimed: boolean = false, hands: number = 1): string {
  const base = parseInt(damage) || 0;
  const growth = parseInt(extraDamage) || 0;
  return `[${getDamageChart(base, growth, aimed, hands)}] ${damageType}`;
}

/**
 * Format secondary damage display as a chart
 */
export function formatSecondaryDamage(
  damage?: string,
  extraDamage?: string,
  damageType?: string,
  aimed?: boolean,
  hands?: number
): string | null {
  if (!damage || !damageType) return null;
  const base = parseInt(damage) || 0;
  const growth = parseInt(extraDamage) || 0;
  return `+ [${getDamageChart(base, growth, aimed || false, hands || 1)}] ${damageType}`;
}

/**
 * Check if action/spell has range to display
 */
export function hasRange(minRange: number, maxRange: number): boolean {
  return maxRange > 0 || minRange > 0;
}

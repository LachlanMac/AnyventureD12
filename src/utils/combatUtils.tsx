// Combat-related utility functions

/**
 * Get dice size for skill level
 */
export function getDiceForSkill(skillLevel: number): string {
  const diceMap = ['6', '8', '10', '12', '16', '20', '24', '30', '36'];
  return diceMap[skillLevel] || '6';
}

// Basic brawling, same as the wiki's "Brawling (Unarmed)" weapon entry
export const BRAWLING_ATTACK_NAME = 'Brawling';
const BRAWLING_DAMAGE = '1';
const BRAWLING_GROWTH = '3';

/**
 * Brawling attack for a creature with brawling skill points (and no natural unarmed attack):
 * rolls brawling talent x brawling skill die, 1 damage + 3 per extra hit, adjacent, 0 energy.
 */
export function buildBrawlingAttack(
  creatureName: string,
  brawling: { talent?: number; skill?: number } | undefined
) {
  const talent = brawling?.talent ?? 1;
  const skill = brawling?.skill ?? 0;
  return {
    name: BRAWLING_ATTACK_NAME,
    actionCost: 1,
    frequency: 'action' as const,
    frequencyCondition: '',
    trigger: '',
    type: 'attack' as const,
    magic: false,
    basic: true,
    round: false,
    daily: false,
    spellType: 'normal' as const,
    description: `The ${creatureName} punches, kicks or headbutts a target, dealing physical damage.`,
    reaction: false,
    attack: {
      roll: talent > 0 ? `${talent}d${getDiceForSkill(skill)}` : '1d6',
      damage: BRAWLING_DAMAGE,
      damage_extra: BRAWLING_GROWTH,
      damage_type: 'physical',
      category: 'blunt',
      min_range: 1,
      max_range: 1,
      hands: 1,
      aimed: false,
      ammo_capacity: 0
    }
  };
}

/** A creature gets the brawling attack when it has brawling skill and no natural unarmed attack */
export function hasBrawlingAttack(
  canUnarmedAttack: boolean | undefined,
  brawling: { skill?: number } | undefined
): boolean {
  return !canUnarmedAttack && (brawling?.skill ?? 0) > 0;
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
  const growth = parseInt(extraDamage || '0') || 0;
  return `+ [${getDamageChart(base, growth, aimed || false, hands || 1)}] ${damageType}`;
}

/**
 * Check if action/spell has range to display
 */
export function hasRange(minRange: number, maxRange: number): boolean {
  return maxRange > 0 || minRange > 0;
}

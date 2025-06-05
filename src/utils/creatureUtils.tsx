// Creature utility functions and constants

export const CREATURE_TIERS = {
  minion: 'var(--color-cloud)',
  thrall: 'var(--color-old-gold)',
  foe: 'var(--color-sunset)',
  champion: 'var(--color-stormy)',
  elite: 'var(--color-sat-purple)',
  legend: 'var(--color-metal-gold)',
  mythic: '#ff6b35'
} as const;

export const CREATURE_TYPE_ICONS = {
  fiend: '👹',
  undead: '💀',
  divine: '✨',
  monster: '🐲',
  humanoid: '👤',
  construct: '🤖',
  plantoid: '🌿',
  fey: '🧚',
  elemental: '🔥'
} as const;

export const DAMAGE_TYPES = [
  'physical', 'heat', 'cold', 'lightning', 'dark', 'divine', 'aether', 'psychic', 'toxic'
] as const;

/**
 * Get color for creature tier
 */
export function getTierColor(tier: string): string {
  return CREATURE_TIERS[tier as keyof typeof CREATURE_TIERS] || 'var(--color-cloud)';
}

/**
 * Get icon for creature type
 */
export function getTypeIcon(type: string): string {
  return CREATURE_TYPE_ICONS[type as keyof typeof CREATURE_TYPE_ICONS] || '❓';
}

/**
 * Format mitigation values for display
 */
export function getMitigationFormat(value: number): { half: string; full: string } {
  if (value === 0) return { half: '0', full: '0' };
  const half = Math.ceil(value / 2);
  return { half: half.toString(), full: value.toString() };
}

/**
 * Check if creature has any spells
 */
export function hasSpells(creature: any): boolean {
  return (creature.spells && creature.spells.length > 0) || 
         (creature.customSpells && creature.customSpells.length > 0);
}

/**
 * Get all spells for a creature (regular + custom)
 */
export function getAllSpells(creature: any): { regular: any[], custom: any[] } {
  return {
    regular: creature.spells || [],
    custom: creature.customSpells || []
  };
}
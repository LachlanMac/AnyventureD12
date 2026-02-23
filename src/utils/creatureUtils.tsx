// Creature utility functions and constants

import { getDiceForSkill } from './combatUtils';
import type { CreatureMagicSkills } from '../types/creature';

export const CREATURE_TIERS = {
  minion: 'var(--color-cloud)',
  grunt: 'var(--color-old-gold)',
  standard: 'var(--color-sunset)',
  champion: 'var(--color-stormy)',
  elite: 'var(--color-sat-purple)',
  legend: 'var(--color-metal-gold)',
  mythic: '#ff6b35',
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
  elemental: '🔥',
} as const;

export const CREATURE_SUBCATEGORIES: Record<string, string[]> = {
  undead: ['Risen', 'Incorporeal', 'Living Dead'],
  dark: ['Devil', 'Daemon', 'Void'],
  divine: ['Ardent', 'Revenant'],
} as const;

export const DAMAGE_TYPES = [
  'physical',
  'heat',
  'cold',
  'electric',
  'dark',
  'divine',
  'aetheric',
  'psychic',
  'toxic',
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
export function getMitigationFormat(value: number): { half: string; full: string; immune: boolean } {
  if (value >= 25) return { half: 'IMM', full: 'IMM', immune: true };
  if (value === 0) return { half: '0', full: '0', immune: false };
  const half = Math.ceil(value / 2);
  return { half: half.toString(), full: value.toString(), immune: false };
}

export const MAGIC_SCHOOLS = {
  blackMagic: { label: 'Black Magic', color: 'var(--color-cloud)' },
  primalMagic: { label: 'Primal Magic', color: '#4ade80' },
  metaMagic: { label: 'Metamagic', color: '#60a5fa' },
  whiteMagic: { label: 'White Magic', color: 'var(--color-old-gold)' },
  mysticismMagic: { label: 'Mysticism', color: 'var(--color-sat-purple)' },
  arcaneMagic: { label: 'Arcane Magic', color: '#f472b6' },
} as const;

export type MagicSchoolKey = keyof typeof MAGIC_SCHOOLS;

// Maps spell school field values to magicSkills keys
export const SPELL_SCHOOL_TO_MAGIC_SKILL: Record<string, MagicSchoolKey> = {
  black: 'blackMagic',
  primal: 'primalMagic',
  meta: 'metaMagic',
  white: 'whiteMagic',
  mysticism: 'mysticismMagic',
  arcane: 'arcaneMagic',
};

/**
 * Get non-zero magic skills for display
 */
export function getNonZeroMagicSkills(magicSkills?: CreatureMagicSkills) {
  if (!magicSkills) return [];

  return (Object.entries(MAGIC_SCHOOLS) as [MagicSchoolKey, { label: string; color: string }][])
    .filter(([key]) => {
      const school = magicSkills[key];
      return school && school.talent > 0;
    })
    .map(([key, { label, color }]) => {
      const { talent, skill } = magicSkills[key];
      const diceSize = getDiceForSkill(skill);
      return {
        key,
        label,
        color,
        talent,
        skill,
        diceString: `${talent}d${diceSize}`,
      };
    });
}

/**
 * Check if creature has any spells
 */
export function hasSpells(creature: any): boolean {
  return (
    (creature.spells && creature.spells.length > 0) ||
    (creature.customSpells && creature.customSpells.length > 0)
  );
}

/**
 * Get all spells for a creature (regular + custom)
 */
export function getAllSpells(creature: any): { regular: any[]; custom: any[] } {
  return {
    regular: creature.spells || [],
    custom: creature.customSpells || [],
  };
}

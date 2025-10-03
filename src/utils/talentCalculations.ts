import { Character } from '../types/character';
import { BASE_TALENT_POINTS, FREE_WEAPON_TALENTS, DATAKEY_PATTERNS } from '../constants/character';

export interface TalentBudget {
  base: number;
  bonus: number;
  total: number;
}

/**
 * Parse UT bonuses from a set of options (ancestry or trait options)
 */
function parseUTBonuses(options: any[]): number {
  let bonus = 0;

  if (!options) return bonus;

  for (const option of options) {
    if (option.data) {
      const utMatch = option.data.match(DATAKEY_PATTERNS.UT);
      if (utMatch) {
        bonus += parseInt(utMatch[1]);
      }
    }
  }

  return bonus;
}

/**
 * Calculate the total talent budget for a character based on base + bonuses from ancestry/traits
 */
export function calculateTalentBudget(character: Character): TalentBudget {
  let bonusTalentPoints = 0;

  // Parse ancestry for UT bonuses
  if (character.ancestry?.ancestryId?.options) {
    bonusTalentPoints += parseUTBonuses(character.ancestry.ancestryId.options);
  }

  // Parse trait for UT bonuses (traits array, first element)
  if (character.traits && character.traits.length > 0) {
    const traitData = character.traits[0].traitId;
    if (traitData && traitData.options) {
      bonusTalentPoints += parseUTBonuses(traitData.options);
    }
  }

  return {
    base: BASE_TALENT_POINTS,
    bonus: bonusTalentPoints,
    total: BASE_TALENT_POINTS + bonusTalentPoints
  };
}

/**
 * Calculate spent talent points from weapon/magic/crafting skills
 */
export function calculateSpentTalents(character: Character): number {
  let spent = 0;

  // Calculate weapon skills (accounting for free talents)
  if (character.weaponSkills) {
    Object.entries(character.weaponSkills).forEach(([skillId, skill]: [string, any]) => {
      const baseTalent = skill?.baseTalent ?? skill?.talent ?? 0;
      const freeTalents = FREE_WEAPON_TALENTS[skillId] || 0;
      if (baseTalent > freeTalents) {
        spent += baseTalent - freeTalents;
      }
    });
  }

  // Calculate magic skills (no free talents)
  if (character.magicSkills) {
    Object.values(character.magicSkills).forEach((skill: any) => {
      const baseTalent = skill?.baseTalent ?? skill?.talent ?? 0;
      spent += baseTalent;
    });
  }

  // Calculate crafting skills (no free talents)
  if (character.craftingSkills) {
    Object.values(character.craftingSkills).forEach((skill: any) => {
      const baseTalent = skill?.baseTalent ?? skill?.talent ?? 0;
      spent += baseTalent;
    });
  }

  return spent;
}

/**
 * Get remaining talent points
 */
export function calculateRemainingTalents(character: Character): number {
  const budget = calculateTalentBudget(character);
  const spent = calculateSpentTalents(character);
  return budget.total - spent;
}

/**
 * Validate talent allocation and return any issues
 */
export interface TalentValidation {
  isValid: boolean;
  overspent: number;
  remaining: number;
  budget: TalentBudget;
  spent: number;
}

export function validateTalentAllocation(character: Character): TalentValidation {
  const budget = calculateTalentBudget(character);
  const spent = calculateSpentTalents(character);
  const remaining = budget.total - spent;

  return {
    isValid: remaining >= 0,
    overspent: remaining < 0 ? Math.abs(remaining) : 0,
    remaining: Math.max(0, remaining),
    budget,
    spent
  };
}

/**
 * Auto-correct overspent talents by reducing from highest skills first
 */
export interface SkillToAdjust {
  type: 'weapon' | 'magic' | 'crafting';
  id: string;
  current: number;
  free: number;
  spent: number;
}

export function autoCorrectOverspentTalents(character: Character, overspentAmount: number): SkillToAdjust[] {
  const skillsToAdjust: SkillToAdjust[] = [];

  // Collect all skills that have spent points
  if (character.weaponSkills) {
    Object.entries(character.weaponSkills).forEach(([skillId, skill]: [string, any]) => {
      const baseTalent = skill?.baseTalent ?? 0;
      const freeTalents = FREE_WEAPON_TALENTS[skillId] || 0;
      if (baseTalent > freeTalents) {
        skillsToAdjust.push({
          type: 'weapon',
          id: skillId,
          current: baseTalent,
          free: freeTalents,
          spent: baseTalent - freeTalents
        });
      }
    });
  }

  if (character.magicSkills) {
    Object.entries(character.magicSkills).forEach(([skillId, skill]: [string, any]) => {
      const baseTalent = skill?.baseTalent ?? 0;
      if (baseTalent > 0) {
        skillsToAdjust.push({
          type: 'magic',
          id: skillId,
          current: baseTalent,
          free: 0,
          spent: baseTalent
        });
      }
    });
  }

  if (character.craftingSkills) {
    Object.entries(character.craftingSkills).forEach(([skillId, skill]: [string, any]) => {
      const baseTalent = skill?.baseTalent ?? 0;
      if (baseTalent > 0) {
        skillsToAdjust.push({
          type: 'crafting',
          id: skillId,
          current: baseTalent,
          free: 0,
          spent: baseTalent
        });
      }
    });
  }

  // Sort by spent amount (highest first)
  skillsToAdjust.sort((a, b) => b.spent - a.spent);

  // Apply corrections
  let pointsToRemove = overspentAmount;
  const corrections: SkillToAdjust[] = [];

  for (const skill of skillsToAdjust) {
    if (pointsToRemove <= 0) break;

    const toRemove = Math.min(skill.spent, pointsToRemove);
    const newBaseTalent = skill.current - toRemove;

    // Apply correction to character object
    if (skill.type === 'weapon' && character.weaponSkills) {
      character.weaponSkills[skill.id].baseTalent = newBaseTalent;
      character.weaponSkills[skill.id].talent = newBaseTalent;
    } else if (skill.type === 'magic' && character.magicSkills) {
      character.magicSkills[skill.id].baseTalent = newBaseTalent;
      character.magicSkills[skill.id].talent = newBaseTalent;
    } else if (skill.type === 'crafting' && character.craftingSkills) {
      character.craftingSkills[skill.id].baseTalent = newBaseTalent;
      character.craftingSkills[skill.id].talent = newBaseTalent;
    }

    corrections.push({
      ...skill,
      current: newBaseTalent,
      spent: skill.spent - toRemove
    });

    pointsToRemove -= toRemove;
  }

  return corrections;
}
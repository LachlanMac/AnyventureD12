import { Character } from '../types/character';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface StepValidationContext {
  character: Character;
  attributePointsRemaining?: number;
  talentStarsRemaining?: number;
  selectedPersonality?: string;
}

/**
 * Validators for each character creation/edit step
 */
export const stepValidators: Record<number, (context: StepValidationContext) => ValidationResult> = {
  // Step 1: Basic Info
  1: ({ character }) => {
    if (!character.name.trim()) {
      return { valid: false, error: 'Character name is required' };
    }
    if (!character.race) {
      return { valid: false, error: 'Please select a race' };
    }
    if (!character.culture) {
      return { valid: false, error: 'Please select a culture' };
    }
    return { valid: true };
  },

  // Step 2: Attributes
  2: ({ attributePointsRemaining }) => {
    if (attributePointsRemaining === undefined) {
      return { valid: false, error: 'Attribute points not calculated' };
    }
    if (attributePointsRemaining > 0) {
      return {
        valid: false,
        error: `You still have ${attributePointsRemaining} attribute points to spend`
      };
    }
    return { valid: true };
  },

  // Step 3: Personality & Trait
  3: ({ selectedPersonality }) => {
    if (!selectedPersonality) {
      return { valid: false, error: 'Please select a personality for your character' };
    }
    return { valid: true };
  },

  // Step 4: Talents
  4: ({ talentStarsRemaining }) => {
    if (talentStarsRemaining === undefined) {
      return { valid: false, error: 'Talent points not calculated' };
    }
    if (talentStarsRemaining > 0) {
      return {
        valid: false,
        error: `You still have ${talentStarsRemaining} talent stars to assign`
      };
    }
    return { valid: true };
  },

  // Step 5: Background
  5: () => {
    // No validation required for background step
    return { valid: true };
  }
};

/**
 * Validate a specific step
 */
export function validateStep(step: number, context: StepValidationContext): ValidationResult {
  const validator = stepValidators[step];
  if (!validator) {
    return { valid: true }; // No validation for unknown steps
  }
  return validator(context);
}

/**
 * Validate attribute allocation
 */
export function validateAttributeChange(
  currentValue: number,
  newValue: number,
  pointsRemaining: number
): ValidationResult {
  if (newValue < 1 || newValue > 6) {
    return { valid: false, error: 'Attribute value must be between 1 and 6' };
  }

  const change = newValue - currentValue;

  if (change > 0 && pointsRemaining <= 0) {
    return { valid: false, error: 'No attribute points remaining' };
  }

  if (change < 0 && pointsRemaining >= 6) {
    return { valid: false, error: 'Cannot exceed maximum attribute points' };
  }

  return { valid: true };
}

/**
 * Validate talent allocation
 */
export function validateTalentChange(
  currentTalent: number,
  newTalent: number,
  talentStarsRemaining: number
): ValidationResult {
  if (newTalent < 0 || newTalent > 4) {
    return { valid: false, error: 'Talent value must be between 0 and 4' };
  }

  const starDifference = currentTalent - newTalent;

  if (talentStarsRemaining + starDifference < 0) {
    return { valid: false, error: 'Not enough talent stars remaining' };
  }

  return { valid: true };
}

/**
 * Validate module point spending
 */
export function validateModulePointSpending(
  totalPoints: number,
  spentPoints: number,
  additionalCost: number
): ValidationResult {
  const remaining = totalPoints - spentPoints;

  if (additionalCost > remaining) {
    return {
      valid: false,
      error: `Not enough module points. Need ${additionalCost}, have ${remaining} remaining`
    };
  }

  return { valid: true };
}

/**
 * Validate character name
 */
export function validateCharacterName(name: string): ValidationResult {
  if (!name || !name.trim()) {
    return { valid: false, error: 'Character name is required' };
  }

  if (name.length < 2) {
    return { valid: false, error: 'Character name must be at least 2 characters' };
  }

  if (name.length > 50) {
    return { valid: false, error: 'Character name must be less than 50 characters' };
  }

  // Check for invalid characters
  const validNamePattern = /^[a-zA-Z0-9\s'\-]+$/;
  if (!validNamePattern.test(name)) {
    return {
      valid: false,
      error: 'Character name can only contain letters, numbers, spaces, apostrophes, and hyphens'
    };
  }

  return { valid: true };
}
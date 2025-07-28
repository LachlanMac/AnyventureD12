// Trait effect types
export interface TraitEffect {
  type: 'talent_points' | 'module_points' | 'health' | 'energy' | 'resolve';
  value: number;
}

// Character context interface for trait effects
export interface CharacterTraitContext {
  talentStarsRemaining: number;
  setTalentStarsRemaining: (value: number | ((prev: number) => number)) => void;
  setTraitTalentBonus: (value: number) => void;
  setTraitModuleBonus: (value: number) => void;
}

export interface TraitEffectHandler {
  onApply?: (character: CharacterTraitContext, effect: TraitEffect) => void;
  onRemove?: (character: CharacterTraitContext, effect: TraitEffect) => void;
  canRemove?: (character: CharacterTraitContext, effect: TraitEffect) => boolean;
}

// Trait data interface
interface TraitData {
  options?: Array<{
    data?: string;
    description?: string;
  }>;
}

// Parse trait data string to extract effects
export function parseTraitEffects(traitData: TraitData): TraitEffect[] {
  const effects: TraitEffect[] = [];

  if (!traitData?.options) return effects;

  for (const option of traitData.options) {
    if (!option.data) continue;

    const dataParts = option.data.includes(',') ? option.data.split(',') : [option.data];

    for (const part of dataParts) {
      const trimmed = part.trim();
      const match = trimmed.match(/^(\w+)=(-?\d+)$/);

      if (match) {
        const [, key, value] = match;
        const numValue = parseInt(value) || 0;

        switch (key) {
          case 'TP':
            effects.push({ type: 'talent_points', value: numValue });
            break;
          case 'MP':
            effects.push({ type: 'module_points', value: numValue });
            break;
          case 'H':
            effects.push({ type: 'health', value: numValue });
            break;
          case 'E':
            effects.push({ type: 'energy', value: numValue });
            break;
          case 'R':
            effects.push({ type: 'resolve', value: numValue });
            break;
        }
      }
    }
  }

  return effects;
}

// Trait effect handlers for character creation
export const characterCreationHandlers: Record<string, TraitEffectHandler> = {
  talent_points: {
    onApply: (character, effect) => {
      // When applying a talent point bonus, we increase available points
      character.setTalentStarsRemaining((prev: number) => prev + effect.value);
      character.setTraitTalentBonus(effect.value);
    },
    onRemove: (character, effect) => {
      // When removing a talent point bonus, we decrease available points
      character.setTalentStarsRemaining((prev: number) => prev - effect.value);
      character.setTraitTalentBonus(0);
    },
    canRemove: (character, effect) => {
      // Can only remove if we haven't spent the bonus points
      const currentAvailable = character.talentStarsRemaining;
      return currentAvailable >= effect.value;
    },
  },
  module_points: {
    onApply: (character, effect) => {
      // Module points are handled server-side at character creation
      // This is just for UI display
      character.setTraitModuleBonus(effect.value);
    },
    onRemove: (character) => {
      character.setTraitModuleBonus(0);
    },
    canRemove: () => true, // Always can remove during creation
  },
};

// Apply trait effects during character creation
export function applyTraitEffects(
  traitData: TraitData,
  character: CharacterTraitContext,
  handlers: Record<string, TraitEffectHandler> = characterCreationHandlers
): void {
  const effects = parseTraitEffects(traitData);

  for (const effect of effects) {
    const handler = handlers[effect.type];
    if (handler?.onApply) {
      handler.onApply(character, effect);
    }
  }
}

// Remove trait effects during character creation
export function removeTraitEffects(
  traitData: TraitData,
  character: CharacterTraitContext,
  handlers: Record<string, TraitEffectHandler> = characterCreationHandlers
): boolean {
  const effects = parseTraitEffects(traitData);

  // First check if all effects can be removed
  for (const effect of effects) {
    const handler = handlers[effect.type];
    if (handler?.canRemove && !handler.canRemove(character, effect)) {
      return false;
    }
  }

  // If all can be removed, remove them
  for (const effect of effects) {
    const handler = handlers[effect.type];
    if (handler?.onRemove) {
      handler.onRemove(character, effect);
    }
  }

  return true;
}

// Check if a trait can be deselected
export function canDeselectTrait(
  traitData: TraitData,
  character: CharacterTraitContext,
  handlers: Record<string, TraitEffectHandler> = characterCreationHandlers
): { canDeselect: boolean; reason?: string } {
  const effects = parseTraitEffects(traitData);

  for (const effect of effects) {
    const handler = handlers[effect.type];
    if (handler?.canRemove && !handler.canRemove(character, effect)) {
      if (effect.type === 'talent_points') {
        return {
          canDeselect: false,
          reason: `You have already spent talent points granted by this trait. You must unassign ${effect.value} talent points before changing traits.`,
        };
      }
      return {
        canDeselect: false,
        reason: 'You cannot deselect this trait with your current character configuration.',
      };
    }
  }

  return { canDeselect: true };
}

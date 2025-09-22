import React from 'react';
import PersonalitySelection from '../PersonalitySelection';
import CharacterTraitSelectionWithSubchoices from '../CharacterTraitSelectionWithSubchoices';
import { Module } from '../../../types/character';

interface PersonalityCreatorTabProps {
  selectedPersonality: string;
  selectedTrait: string;
  traitModuleBonus?: number;
  onSelectPersonality: (personality: string, personalityModule: Module) => void;
  onSelectTrait: (traitId: string, selectedOptions?: any[]) => void;
  onValidateTraitChange?: (
    fromTraitId: string,
    toTraitId: string
  ) => Promise<{ valid: boolean; error?: string }>;
}

const PersonalityCreatorTab: React.FC<PersonalityCreatorTabProps> = ({
  selectedPersonality,
  selectedTrait,
  traitModuleBonus,
  onSelectPersonality,
  onSelectTrait,
  onValidateTraitChange,
}) => {
  return (
    <div>
      <h2
        style={{
          color: 'var(--color-white)',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
        }}
      >
        Character Personality & Trait
      </h2>

      <div
        style={{
          padding: '1rem',
          backgroundColor: 'var(--color-dark-elevated)',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
          color: 'var(--color-cloud)',
        }}
      >
        <p>
          Choose a personality type that defines your character's approach to the world. Your
          personality determines how your character interacts with others and reacts to different
          situations. Your character is automatically granted the module associated with this
          personality type.
        </p>
      </div>

      <PersonalitySelection
        selectedPersonality={selectedPersonality}
        onSelectPersonality={onSelectPersonality}
      />

      {/* Character Trait Selection */}
      <div style={{ marginTop: '2rem' }}>
        <div
          style={{
            padding: '1rem',
            backgroundColor: 'var(--color-dark-elevated)',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            color: 'var(--color-cloud)',
          }}
        >
          <p>
            Choose a character trait that represents your character's unique nature or background.
            Traits provide special abilities, bonuses, and sometimes drawbacks that make your character
            distinct. The default trait is "Born to Adventure" which grants bonus health, resolve, and morale.
          </p>
        </div>

        <CharacterTraitSelectionWithSubchoices
          selectedTrait={selectedTrait}
          onSelectTrait={onSelectTrait}
          onValidateTraitChange={onValidateTraitChange}
        />

        {traitModuleBonus && traitModuleBonus > 0 && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--color-green-dark)',
              borderRadius: '0.5rem',
              marginTop: '1rem',
              color: 'var(--color-white)',
              fontSize: '0.9rem',
            }}
          >
            <strong>Note:</strong> Your selected trait grants +{traitModuleBonus} module points that
            will be applied when your character is created.
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalityCreatorTab;

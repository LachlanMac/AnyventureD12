import React from 'react';
import PersonalitySelection from '../PersonalitySelection';
import CharacterTraitSelectionWithSubchoices from '../CharacterTraitSelectionWithSubchoices';
import { Module } from '../../../types/character';

interface PersonalityCreatorTabProps {
  selectedPersonality: string;
  selectedTrait: string;
  selectedTraitOptions?: any[];
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
  selectedTraitOptions,
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

      <PersonalitySelection
        selectedPersonality={selectedPersonality}
        onSelectPersonality={onSelectPersonality}
      />

      {/* Character Trait Selection */}
      <div style={{ marginTop: '2rem' }}>
        <CharacterTraitSelectionWithSubchoices
          selectedTrait={selectedTrait}
          onSelectTrait={onSelectTrait}
          onValidateTraitChange={onValidateTraitChange}
          initialSelectedOptions={selectedTraitOptions}
        />
      </div>
    </div>
  );
};

export default PersonalityCreatorTab;

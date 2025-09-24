import React from 'react';
import TraitSelectionWithOptions from '../TraitSelectionWithOptions';

interface Subchoice {
  id: string;
  name: string;
  description: string;
  data: string;
}

interface TraitOption {
  name: string;
  description: string;
  data: string;
  subchoices?: Subchoice[];
  requiresChoice?: boolean;
  choiceType?: string;
  selectedSubchoice?: string;
}

interface Trait {
  _id: string;
  name: string;
  type?: 'positive' | 'negative';
  description: string;
  options: TraitOption[];
}

interface TraitsCreatorTabProps {
  selectedTraits: Trait[];
  availableModulePoints: number;
  onSelectTrait: (trait: Trait) => void;
  onDeselectTrait: (traitId: string) => void;
}

const TraitsCreatorTabWithOptions: React.FC<TraitsCreatorTabProps> = ({
  selectedTraits,
  availableModulePoints,
  onSelectTrait,
  onDeselectTrait,
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
        Character Traits
      </h2>

      <TraitSelectionWithOptions
        selectedTraits={selectedTraits}
        onSelectTrait={onSelectTrait}
        onDeselectTrait={onDeselectTrait}
        availableModulePoints={availableModulePoints}
      />
    </div>
  );
};

export default TraitsCreatorTabWithOptions;

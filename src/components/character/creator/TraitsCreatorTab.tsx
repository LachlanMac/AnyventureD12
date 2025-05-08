import React from 'react';
import TraitSelection from '../TraitSelection';

interface Trait {
  _id: string;
  name: string;
  type: 'positive' | 'negative';
  description: string;
}

interface TraitsCreatorTabProps {
  selectedTraits: Trait[];
  availableModulePoints: number;
  onSelectTrait: (trait: Trait) => void;
  onDeselectTrait: (traitId: string) => void;
}

const TraitsCreatorTab: React.FC<TraitsCreatorTabProps> = ({
  selectedTraits,
  availableModulePoints,
  onSelectTrait,
  onDeselectTrait
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

      <TraitSelection
        selectedTraits={selectedTraits}
        onSelectTrait={onSelectTrait}
        onDeselectTrait={onDeselectTrait}
        availableModulePoints={availableModulePoints}
      />
    </div>
  );
};

export default TraitsCreatorTab;
import React from 'react';
import { CreatureTrait } from '../../types/creature';

interface CreatureTraitCardProps {
  trait: CreatureTrait;
}

const CreatureTraitCard: React.FC<CreatureTraitCardProps> = ({ trait }) => {
  return (
    <div>
      <h3
        style={{
          color: 'var(--color-white)',
          fontWeight: 'bold',
          marginBottom: '0.25rem',
          fontSize: '0.875rem',
        }}
      >
        {trait.name}
      </h3>
      <p style={{ color: 'var(--color-cloud)', margin: 0, lineHeight: '1.3', fontSize: '0.75rem' }}>
        {trait.description}
      </p>
    </div>
  );
};

export default CreatureTraitCard;

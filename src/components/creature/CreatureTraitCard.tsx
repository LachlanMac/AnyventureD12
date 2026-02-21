import React from 'react';
import { CreatureTrait } from '../../types/creature';

interface CreatureTraitCardProps {
  trait: CreatureTrait;
}

const CreatureTraitCard: React.FC<CreatureTraitCardProps> = ({ trait }) => {
  return (
    <div
      style={{
        padding: '0.75rem',
        backgroundColor: 'var(--color-dark-elevated)',
        borderRadius: '0.25rem',
        border: '1px solid var(--color-dark-border)',
      }}
    >
      <h3
        style={{
          color: 'var(--color-white)',
          fontWeight: 'bold',
          marginBottom: '0.25rem',
          margin: 0,
          fontSize: '0.875rem',
        }}
      >
        {trait.name}
      </h3>
      <p style={{ color: 'var(--color-cloud)', margin: '0.25rem 0 0 0', lineHeight: '1.3', fontSize: '0.75rem' }}>
        {trait.description}
      </p>
    </div>
  );
};

export default CreatureTraitCard;

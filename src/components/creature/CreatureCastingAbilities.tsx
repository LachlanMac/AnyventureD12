import React from 'react';
import type { CreatureMagicSkills } from '../../types/creature';
import { getNonZeroMagicSkills } from '../../utils/creatureUtils';

interface CreatureCastingAbilitiesProps {
  magicSkills?: CreatureMagicSkills;
}

const CreatureCastingAbilities: React.FC<CreatureCastingAbilitiesProps> = ({ magicSkills }) => {
  const schools = getNonZeroMagicSkills(magicSkills);

  if (schools.length === 0) return null;

  return (
    <div style={{ marginTop: '1rem' }}>
      <h3
        style={{
          color: 'var(--color-cloud)',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '0.5rem',
        }}
      >
        Casting Abilities
      </h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {schools.map(({ key, label, color, diceString }) => (
          <div
            key={key}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.25rem 0.625rem',
              backgroundColor: 'var(--color-dark-surface)',
              border: '1px solid var(--color-dark-border)',
              borderRadius: '9999px',
              fontSize: '0.8125rem',
            }}
          >
            <span style={{ color, fontWeight: 500 }}>{label}:</span>
            <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>{diceString}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreatureCastingAbilities;

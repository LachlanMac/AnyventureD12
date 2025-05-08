import React from 'react';
import TalentDisplay from './TalentDisplay';

interface SkillCardProps {
  name: string;
  value: number; // Die type (1-6)
  talent: number; // Number of dice (0-3)
  showDieType?: boolean;
}

// Dice type mapping
const DICE_TYPES = ['1d4', '1d6', '1d8', '1d10', '1d12', '1d20'];

const SkillCard: React.FC<SkillCardProps> = ({ name, value, talent, showDieType = true }) => {
  const dieType = DICE_TYPES[Math.min(value - 1, DICE_TYPES.length - 1)];

  return (
    <div
      style={{
        backgroundColor: 'var(--color-dark-elevated)',
        padding: '0.75rem',
        borderRadius: '0.375rem',
        border: '1px solid var(--color-dark-border)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem',
        }}
      >
        <span
          style={{
            color: 'var(--color-white)',
            fontWeight: 'bold',
          }}
        >
          {name}
        </span>

        {showDieType && (
          <span
            style={{
              color: 'var(--color-cloud)',
              fontSize: '0.75rem',
              padding: '0.125rem 0.375rem',
              backgroundColor: 'var(--color-dark-surface)',
              borderRadius: '9999px',
            }}
          >
            {dieType}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span
          style={{
            color: 'var(--color-cloud)',
            fontSize: '0.75rem',
            marginRight: '0.5rem',
          }}
        >
          Talent:
        </span>
        <TalentDisplay talent={talent} />
      </div>

      {/* Display dice description */}
      <div
        style={{
          fontSize: '0.75rem',
          color: 'var(--color-cloud)',
          marginTop: '0.5rem',
          fontStyle: 'italic',
        }}
      >
        Roll {talent > 0 ? `${talent}${dieType.substring(1)}` : 'No dice'}
      </div>
    </div>
  );
};

export default SkillCard;

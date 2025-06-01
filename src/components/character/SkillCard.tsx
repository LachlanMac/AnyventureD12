import React from 'react';
import TalentDisplay from './TalentDisplay';
import { getModifiedDiceType, getSkillDiceString, getDiceTierModifierDescription } from '../../utils/diceUtils';

interface SkillCardProps {
  name: string;
  value: number; // Die type (0-6)
  talent: number; // Number of dice (0-3)
  showDieType?: boolean;
  diceTierModifier?: number; // Dice tier modifier (-1, 0, +1)
}

const SkillCard: React.FC<SkillCardProps> = ({ 
  name, 
  value, 
  talent, 
  showDieType = true, 
  diceTierModifier = 0 
}) => {
  const dieType = getModifiedDiceType(value, diceTierModifier);
  const diceString = getSkillDiceString(talent, value, diceTierModifier);
  const modifierDescription = getDiceTierModifierDescription(diceTierModifier);

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span
              style={{
                color: diceTierModifier > 0 ? '#10b981' : diceTierModifier < 0 ? 'var(--color-sunset)' : 'var(--color-cloud)',
                fontSize: '0.75rem',
                padding: '0.125rem 0.375rem',
                backgroundColor: 'var(--color-dark-surface)',
                borderRadius: '9999px',
                border: diceTierModifier > 0 ? '1px solid #10b981' : diceTierModifier < 0 ? '1px solid var(--color-sunset)' : 'none',
              }}
            >
              {dieType}
            </span>
            {modifierDescription && (
              <span
                style={{
                  color: diceTierModifier > 0 ? '#10b981' : 'var(--color-sunset)',
                  fontSize: '0.625rem',
                  fontStyle: 'italic',
                }}
              >
                {modifierDescription}
              </span>
            )}
          </div>
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
        Roll {diceString}
      </div>
    </div>
  );
};

export default SkillCard;

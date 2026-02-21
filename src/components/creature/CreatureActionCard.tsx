import React from 'react';
import { CreatureAction } from '../../types/creature';
import { formatDamage, formatSecondaryDamage, hasRange } from '../../utils/combatUtils';
import { formatRangeSpan } from '../../utils/rangeUtils';

interface CreatureActionCardProps {
  action: CreatureAction;
  creatureTier: string;
  label?: string;
}

const statPillStyle: React.CSSProperties = {
  color: 'var(--color-white)',
  backgroundColor: 'var(--color-dark-surface)',
  padding: '0.2rem 0.5rem',
  borderRadius: '0.25rem',
  fontSize: '0.7rem',
  whiteSpace: 'nowrap',
};

const CreatureActionCard: React.FC<CreatureActionCardProps> = ({ action, creatureTier, label }) => {
  return (
    <div
      style={{
        padding: '0.75rem',
        backgroundColor: action.magic ? 'rgba(85, 65, 130, 0.2)' : 'var(--color-dark-elevated)',
        borderRadius: '0.25rem',
        border: action.magic
          ? '1px solid var(--color-sat-purple)'
          : '1px solid var(--color-dark-border)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.375rem',
        }}
      >
        <h3
          style={{
            color: 'var(--color-white)',
            fontWeight: 'bold',
            margin: 0,
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
          }}
        >
          {action.name}
          {action.magic && (
            <span style={{ color: 'var(--color-sat-purple)', fontSize: '0.75rem' }}>✨</span>
          )}
          {label && (
            <span
              style={{
                color: 'var(--color-cloud)',
                fontSize: '0.625rem',
                backgroundColor: 'var(--color-dark-surface)',
                padding: '0.1rem 0.35rem',
                borderRadius: '0.25rem',
                fontWeight: 'normal',
              }}
            >
              {label}
            </span>
          )}
          {action.spellType && action.spellType !== 'normal' && (
            <span
              style={{
                color: action.spellType === 'innate' ? 'var(--color-stormy)' : 'var(--color-sunset)',
                fontSize: '0.625rem',
                backgroundColor: action.spellType === 'innate' ? 'rgba(120, 140, 170, 0.15)' : 'rgba(200, 100, 50, 0.15)',
                padding: '0.1rem 0.35rem',
                borderRadius: '0.25rem',
                border: action.spellType === 'innate' ? '1px solid rgba(120, 140, 170, 0.3)' : '1px solid rgba(200, 100, 50, 0.3)',
                fontWeight: 'normal',
                textTransform: 'capitalize',
              }}
            >
              {action.spellType}
            </span>
          )}
          {action.round && (
            <span
              style={{
                color: 'var(--color-old-gold)',
                fontSize: '0.625rem',
                backgroundColor: 'rgba(200, 170, 80, 0.15)',
                padding: '0.1rem 0.35rem',
                borderRadius: '0.25rem',
                border: '1px solid rgba(200, 170, 80, 0.3)',
                fontWeight: 'normal',
              }}
            >
              1/round
            </span>
          )}
        </h3>
        {creatureTier !== 'minion' && creatureTier !== 'grunt' && (
          <span
            style={{
              color: 'var(--color-old-gold)',
              fontSize: '0.75rem',
              backgroundColor: 'var(--color-dark-surface)',
              padding: '0.125rem 0.375rem',
              borderRadius: '0.25rem',
            }}
          >
            {action.cost} Energy
          </span>
        )}
      </div>

      <p style={{ color: 'var(--color-cloud)', margin: 0, lineHeight: '1.3', fontSize: '0.75rem' }}>
        {action.description}
      </p>

      {action.type === 'attack' && action.attack && (
        <div
          style={{
            marginTop: '0.5rem',
            display: 'flex',
            gap: '0.375rem',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <span style={statPillStyle}>
            <strong>Dice:</strong> {action.attack.roll}
          </span>
          <span style={statPillStyle}>
            <strong>Damage:</strong>{' '}
            {formatDamage(
              action.attack.damage,
              action.attack.damage_extra,
              action.attack.damage_type
            )}
          </span>
          {action.attack.secondary_damage && (
            <span style={statPillStyle}>
              {formatSecondaryDamage(
                action.attack.secondary_damage,
                action.attack.secondary_damage_extra,
                action.attack.secondary_damage_type
              )}
            </span>
          )}
          {hasRange(action.attack.min_range, action.attack.max_range) && (
            <span style={statPillStyle}>
              <strong>Range:</strong> {formatRangeSpan(action.attack.min_range, action.attack.max_range, 'weapon')}
            </span>
          )}
        </div>
      )}

      {action.type === 'spell' && action.spell && (
        <div
          style={{
            marginTop: '0.5rem',
            display: 'flex',
            gap: '0.375rem',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <span style={statPillStyle}>
            <strong>Dice:</strong> {action.spell.roll}
          </span>
          {action.spell.damage !== '0' && (
            <>
              <span style={statPillStyle}>
                <strong>Damage:</strong>{' '}
                {formatDamage(
                  action.spell.damage,
                  action.spell.damage_extra,
                  action.spell.damage_type
                )}
              </span>
              {action.spell.secondary_damage && (
                <span style={statPillStyle}>
                  {formatSecondaryDamage(
                    action.spell.secondary_damage,
                    action.spell.secondary_damage_extra,
                    action.spell.secondary_damage_type
                  )}
                </span>
              )}
            </>
          )}
          {action.spell.target_defense !== 'none' && (
            <span style={statPillStyle}>
              <strong>Defense:</strong> {action.spell.target_defense} RC{' '}
              {action.spell.defense_difficulty}
            </span>
          )}
          {hasRange(action.spell.min_range, action.spell.max_range) && (
            <span style={statPillStyle}>
              <strong>Range:</strong> {formatRangeSpan(action.spell.min_range, action.spell.max_range, 'spell')}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default CreatureActionCard;

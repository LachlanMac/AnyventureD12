import React from 'react';
import { CreatureReaction } from '../../types/creature';
import { formatDamage, formatSecondaryDamage, hasRange } from '../../utils/combatUtils';
import { formatRangeSpan } from '../../utils/rangeUtils';

interface CreatureReactionCardProps {
  reaction: CreatureReaction;
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

const CreatureReactionCard: React.FC<CreatureReactionCardProps> = ({ reaction, creatureTier, label }) => {
  return (
    <div
      style={{
        padding: '0.75rem',
        backgroundColor: reaction.magic ? 'rgba(85, 65, 130, 0.2)' : 'var(--color-dark-elevated)',
        borderRadius: '0.25rem',
        border: reaction.magic
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
          {reaction.name}
          {reaction.magic && (
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
          {reaction.spellType && reaction.spellType !== 'normal' && (
            <span
              style={{
                color: reaction.spellType === 'innate' ? '#a8c4e0' : 'var(--color-sunset)',
                fontSize: '0.625rem',
                backgroundColor: reaction.spellType === 'innate' ? 'rgba(120, 160, 200, 0.25)' : 'rgba(200, 100, 50, 0.15)',
                padding: '0.1rem 0.35rem',
                borderRadius: '0.25rem',
                border: reaction.spellType === 'innate' ? '1px solid rgba(140, 180, 220, 0.5)' : '1px solid rgba(200, 100, 50, 0.3)',
                fontWeight: 'normal',
                textTransform: 'capitalize',
              }}
            >
              {reaction.spellType}
            </span>
          )}
          {reaction.round && (
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
              round
            </span>
          )}
          {reaction.daily && (
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
              daily
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
            {reaction.cost} Energy
          </span>
        )}
      </div>
      {reaction.trigger && (
        <div style={{ color: 'var(--color-stormy)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
          <strong>Trigger:</strong> {reaction.trigger}
        </div>
      )}
      <p style={{ color: 'var(--color-cloud)', margin: 0, lineHeight: '1.3', fontSize: '0.75rem' }}>
        {reaction.description}
      </p>

      {reaction.type === 'attack' && reaction.attack && (
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
            <strong>Dice:</strong> {reaction.attack.roll}
          </span>
          <span style={statPillStyle}>
            <strong>Damage:</strong>{' '}
            {formatDamage(
              reaction.attack.damage,
              reaction.attack.damage_extra,
              reaction.attack.damage_type
            )}
          </span>
          {reaction.attack.secondary_damage && (
            <span style={statPillStyle}>
              {formatSecondaryDamage(
                reaction.attack.secondary_damage,
                reaction.attack.secondary_damage_extra,
                reaction.attack.secondary_damage_type
              )}
            </span>
          )}
          {hasRange(reaction.attack.min_range, reaction.attack.max_range) && (
            <span style={statPillStyle}>
              <strong>Range:</strong> {formatRangeSpan(reaction.attack.min_range, reaction.attack.max_range, 'weapon')}
            </span>
          )}
        </div>
      )}

      {reaction.type === 'spell' && reaction.spell && (
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
            <strong>Dice:</strong> {reaction.spell.roll}
          </span>
          {reaction.spell.damage && reaction.spell.damage !== '0' && (
            <>
              <span style={statPillStyle}>
                <strong>Damage:</strong>{' '}
                {formatDamage(
                  reaction.spell.damage,
                  reaction.spell.damage_extra,
                  reaction.spell.damage_type
                )}
              </span>
              {reaction.spell.secondary_damage && (
                <span style={statPillStyle}>
                  {formatSecondaryDamage(
                    reaction.spell.secondary_damage,
                    reaction.spell.secondary_damage_extra,
                    reaction.spell.secondary_damage_type
                  )}
                </span>
              )}
            </>
          )}
          {reaction.spell.target_defense !== 'none' && (
            <span style={statPillStyle}>
              <strong>Defense:</strong> {reaction.spell.target_defense} RC{' '}
              {reaction.spell.defense_difficulty}
            </span>
          )}
          {hasRange(reaction.spell.min_range, reaction.spell.max_range) && (
            <span style={statPillStyle}>
              <strong>Range:</strong> {formatRangeSpan(reaction.spell.min_range, reaction.spell.max_range, 'spell')}
            </span>
          )}
        </div>
      )}

      {reaction.type === 'spell' && reaction.spell?.charge && (
        <div style={{ marginTop: '0.375rem', fontSize: '0.7rem', color: 'var(--color-old-gold)', fontStyle: 'italic' }}>
          <strong>Overcharge:</strong> {reaction.spell.charge}
        </div>
      )}
    </div>
  );
};

export default CreatureReactionCard;

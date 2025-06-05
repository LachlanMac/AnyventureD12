import React from 'react';
import { CreatureSpell, CreatureCustomSpell } from '../../types/creature';
import { formatRangeSpan } from '../../utils/rangeUtils';

interface CreatureSpellCardProps {
  spell: CreatureSpell | CreatureCustomSpell;
  isCustom?: boolean;
}

const CreatureSpellCard: React.FC<CreatureSpellCardProps> = ({ spell, isCustom = false }) => {
  const isRegularSpell = !isCustom && 'school' in spell;
  const isCustomSpell = isCustom && 'energy_cost' in spell;

  return (
    <div style={{ 
      padding: '0.75rem',
      backgroundColor: 'rgba(85, 65, 130, 0.15)',
      borderRadius: '0.25rem',
      border: '1px solid var(--color-sat-purple)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
        <h3 style={{ color: 'var(--color-white)', fontWeight: 'bold', margin: 0, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          {spell.name}
          <span style={{ color: 'var(--color-sat-purple)', fontSize: '0.75rem' }}>✨</span>
          {isCustom && (
            <span style={{ 
              color: 'var(--color-old-gold)', 
              fontSize: '0.625rem',
              backgroundColor: 'var(--color-dark-surface)',
              padding: '0.125rem 0.25rem',
              borderRadius: '0.25rem'
            }}>
              Custom
            </span>
          )}
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {isRegularSpell && (
            <span style={{ 
              color: 'var(--color-cloud)', 
              fontSize: '0.625rem',
              textTransform: 'capitalize'
            }}>
              {(spell as CreatureSpell).school} • {(spell as CreatureSpell).subschool}
            </span>
          )}
          <span style={{ 
            color: 'var(--color-old-gold)', 
            fontSize: '0.75rem',
            backgroundColor: 'var(--color-dark-surface)',
            padding: '0.125rem 0.375rem',
            borderRadius: '0.25rem'
          }}>
            {isRegularSpell ? (spell as CreatureSpell).energy : (spell as CreatureCustomSpell).energy_cost} Energy
          </span>
        </div>
      </div>
      
      <p style={{ color: 'var(--color-cloud)', margin: 0, lineHeight: '1.3', fontSize: '0.75rem', marginBottom: '0.375rem' }}>
        {spell.description}
      </p>
      
      <div style={{ 
        display: 'flex',
        gap: '0.75rem',
        fontSize: '0.75rem',
        flexWrap: 'wrap'
      }}>
        {isRegularSpell && (
          <>
            <span style={{ color: 'var(--color-white)' }}>
              <strong>Cast:</strong> {(spell as CreatureSpell).checkToCast}+
            </span>
            {(spell as CreatureSpell).damage > 0 && (
              <span style={{ color: 'var(--color-white)' }}>
                <strong>Damage:</strong> {(spell as CreatureSpell).damage} {(spell as CreatureSpell).damageType}
              </span>
            )}
            <span style={{ color: 'var(--color-cloud)' }}>
              Range: {(spell as CreatureSpell).range}
            </span>
            {(spell as CreatureSpell).duration !== 'Instantaneous' && (
              <span style={{ color: 'var(--color-cloud)' }}>
                Duration: {(spell as CreatureSpell).duration}
              </span>
            )}
            {(spell as CreatureSpell).concentration && (
              <span style={{ color: 'var(--color-stormy)' }}>
                Concentration
              </span>
            )}
            {(spell as CreatureSpell).reaction && (
              <span style={{ color: 'var(--color-stormy)' }}>
                Reaction
              </span>
            )}
          </>
        )}
        
        {isCustomSpell && (
          <>
            {(spell as CreatureCustomSpell).roll && (
              <span style={{ color: 'var(--color-white)' }}>
                <strong>Cast:</strong> {(spell as CreatureCustomSpell).roll}
              </span>
            )}
            {(spell as CreatureCustomSpell).damage && (
              <span style={{ color: 'var(--color-white)' }}>
                <strong>Damage:</strong> {(spell as CreatureCustomSpell).damage}
                {(spell as CreatureCustomSpell).damage_extra && (spell as CreatureCustomSpell).damage_extra !== "0" && ` [${(spell as CreatureCustomSpell).damage_extra}]`} {(spell as CreatureCustomSpell).damage_type}
              </span>
            )}
            {(spell as CreatureCustomSpell).target_defense && (spell as CreatureCustomSpell).target_defense !== 'none' && (
              <span style={{ color: 'var(--color-cloud)' }}>
                Target: {(spell as CreatureCustomSpell).target_defense} {(spell as CreatureCustomSpell).defense_difficulty}+
              </span>
            )}
            <span style={{ color: 'var(--color-cloud)' }}>
              Range: {formatRangeSpan((spell as CreatureCustomSpell).min_range, (spell as CreatureCustomSpell).max_range, 'spell')}
            </span>
          </>
        )}
      </div>
      
      {isRegularSpell && (spell as CreatureSpell).components.length > 0 && (
        <div style={{ marginTop: '0.25rem', fontSize: '0.625rem', color: 'var(--color-cloud)' }}>
          <strong>Components:</strong> {(spell as CreatureSpell).components.join(', ')}
        </div>
      )}
    </div>
  );
};

export default CreatureSpellCard;
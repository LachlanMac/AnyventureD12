import React from 'react';
import TalentDisplay from '../character/TalentDisplay';
import { Creature } from '../../types/creature';
import { getTierColor, getTypeIcon } from '../../utils/creatureUtils';

interface CreatureHeaderProps {
  creature: Creature;
}

const CreatureHeader: React.FC<CreatureHeaderProps> = ({ creature }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
      <span style={{ fontSize: '2.5rem' }}>{getTypeIcon(creature.type)}</span>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
          <h1 style={{ 
            color: 'var(--color-white)', 
            fontFamily: 'var(--font-display)',
            fontSize: '1.75rem',
            fontWeight: 'bold',
            margin: 0
          }}>
            {creature.name}
          </h1>
          <span 
            style={{ 
              color: getTierColor(creature.tier),
              fontSize: '0.875rem',
              fontWeight: 'bold',
              textTransform: 'capitalize'
            }}
          >
            ({creature.tier})
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
          <span style={{ color: 'var(--color-cloud)', fontSize: '0.75rem', textTransform: 'capitalize' }}>
            {creature.size} {creature.type}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <TalentDisplay talent={creature.challenge_rating} size="sm" />
          </div>
          {creature.isHomebrew && (
            <span style={{
              color: 'var(--color-sunset)',
              fontSize: '0.625rem',
              fontWeight: 'bold',
              backgroundColor: 'var(--color-dark-elevated)',
              padding: '0.125rem 0.375rem',
              borderRadius: '0.25rem'
            }}>
              HOMEBREW
            </span>
          )}
        </div>
      </div>
      {/* Health, Energy, and Resolve */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--color-sunset)', fontSize: '0.625rem', fontWeight: 'bold' }}>HEALTH</div>
          <div style={{ color: 'var(--color-white)', fontSize: '1.25rem', fontWeight: 'bold' }}>{creature.health.max}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--color-old-gold)', fontSize: '0.625rem', fontWeight: 'bold' }}>ENERGY</div>
          <div style={{ color: 'var(--color-white)', fontSize: '1.25rem', fontWeight: 'bold' }}>{creature.energy.max}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--color-sat-purple)', fontSize: '0.625rem', fontWeight: 'bold' }}>RESOLVE</div>
          <div style={{ color: 'var(--color-white)', fontSize: '1.25rem', fontWeight: 'bold' }}>{creature.resolve.max}</div>
        </div>
      </div>
    </div>
  );
};

export default CreatureHeader;
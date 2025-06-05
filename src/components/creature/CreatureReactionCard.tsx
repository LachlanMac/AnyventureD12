import React from 'react';
import { CreatureReaction } from '../../types/creature';

interface CreatureReactionCardProps {
  reaction: CreatureReaction;
}

const CreatureReactionCard: React.FC<CreatureReactionCardProps> = ({ reaction }) => {
  return (
    <div style={{ 
      padding: '0.75rem',
      backgroundColor: 'var(--color-dark-elevated)',
      borderRadius: '0.25rem',
      border: '1px solid var(--color-dark-border)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
        <h3 style={{ color: 'var(--color-white)', fontWeight: 'bold', margin: 0, fontSize: '0.875rem' }}>
          {reaction.name}
        </h3>
        <span style={{ 
          color: 'var(--color-old-gold)', 
          fontSize: '0.75rem',
          backgroundColor: 'var(--color-dark-surface)',
          padding: '0.125rem 0.375rem',
          borderRadius: '0.25rem'
        }}>
          {reaction.cost} Energy
        </span>
      </div>
      <div style={{ color: 'var(--color-stormy)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
        <strong>Trigger:</strong> {reaction.trigger}
      </div>
      <p style={{ color: 'var(--color-cloud)', margin: 0, lineHeight: '1.3', fontSize: '0.75rem' }}>
        {reaction.description}
      </p>
    </div>
  );
};

export default CreatureReactionCard;
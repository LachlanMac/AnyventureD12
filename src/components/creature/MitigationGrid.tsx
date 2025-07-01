import React from 'react';
import { DAMAGE_TYPES, getMitigationFormat } from '../../utils/creatureUtils';

interface MitigationGridProps {
  mitigation: Record<string, number>;
}

const MitigationGrid: React.FC<MitigationGridProps> = ({ mitigation }) => {
  return (
    <div style={{ borderTop: '1px solid var(--color-dark-border)', paddingTop: '0.75rem' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(9, 1fr)',
          gap: '0.5rem',
          textAlign: 'center',
        }}
      >
        {DAMAGE_TYPES.map((type) => {
          const mit = getMitigationFormat(mitigation[type] || 0);
          return (
            <div key={type}>
              <div
                style={{
                  color: 'var(--color-cloud)',
                  fontSize: '0.625rem',
                  textTransform: 'capitalize',
                  marginBottom: '0.25rem',
                }}
              >
                {type}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  borderRadius: '0.25rem',
                  overflow: 'hidden',
                  height: '1.25rem',
                }}
              >
                <div
                  style={{
                    backgroundColor: 'var(--color-dark-elevated)',
                    color: 'var(--color-cloud)',
                    padding: '0 0.25rem',
                    flex: 1,
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {mit.half}
                </div>
                <div
                  style={{
                    backgroundColor: 'rgba(85, 65, 130, 0.15)',
                    color: 'var(--color-white)',
                    padding: '0 0.25rem',
                    flex: 1,
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {mit.full}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MitigationGrid;

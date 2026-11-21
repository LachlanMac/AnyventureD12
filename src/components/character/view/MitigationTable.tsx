import React from 'react';

type MitigationValue = { min: number; max: number };

interface MitigationTableProps {
  mitigation: Record<string, MitigationValue | number>;
}

// Damage type mitigation / limit table from the character sheet header
const MitigationTable: React.FC<MitigationTableProps> = ({ mitigation }) => (
  <div
    style={{
      backgroundColor: 'var(--color-dark-elevated)',
      borderRadius: '0.375rem',
      border: '1px solid var(--color-dark-border)',
      overflow: 'hidden',
      width: '100%',
      maxWidth: '500px',
    }}
  >
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
      }}
    >
      <thead>
        <tr
          style={{
            backgroundColor: 'var(--color-dark-bg)',
            borderBottom: '1px solid var(--color-dark-border)',
          }}
        >
          <th
            style={{
              color: 'var(--color-cloud)',
              padding: '0.375rem 0.5rem',
              textAlign: 'left',
              fontSize: '0.75rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.025em',
            }}
          >
            Type
          </th>
          <th
            style={{
              color: 'var(--color-cloud)',
              padding: '0.375rem 0.5rem',
              textAlign: 'center',
              fontSize: '0.75rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.025em',
            }}
          >
            Mit.
          </th>
          <th
            style={{
              color: 'var(--color-cloud)',
              padding: '0.375rem 0.5rem',
              textAlign: 'center',
              fontSize: '0.75rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.025em',
            }}
          >
            Limit
          </th>
        </tr>
      </thead>
      <tbody>
        {mitigation &&
          Object.entries(mitigation).map(([type, value], index) => (
            <tr
              key={type}
              style={{
                borderBottom:
                  index < Object.entries(mitigation || {}).length - 1
                    ? '1px solid var(--color-dark-border)'
                    : 'none',
              }}
            >
              <td
                style={{
                  color: 'var(--color-white)',
                  padding: '0.25rem 0.5rem',
                  textTransform: 'capitalize',
                  fontWeight: '500',
                  fontSize: '1rem',
                }}
              >
                {type}
              </td>
              <td
                style={{
                  color: 'var(--color-metal-gold)',
                  padding: '0.25rem 0.5rem',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '1rem',
                }}
              >
                {typeof value === 'object' ? (value as MitigationValue).min : value}
              </td>
              <td
                style={{
                  color: 'var(--color-sat-purple)',
                  padding: '0.25rem 0.5rem',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '1rem',
                }}
              >
                {typeof value === 'object' ? (value as MitigationValue).max : 25}
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  </div>
);

export default MitigationTable;

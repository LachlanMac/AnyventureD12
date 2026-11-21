import React from 'react';

interface MovementTableProps {
  movement: number;
  swim_speed?: number;
  climb_speed?: number;
}

// Movement speeds table from the character sheet header (walk / swim / climb, normal and sprint)
const MovementTable: React.FC<MovementTableProps> = (props) => (
  <div
    style={{
      backgroundColor: 'var(--color-dark-elevated)',
      borderRadius: '0.375rem',
      border: '1px solid var(--color-dark-border)',
      overflow: 'hidden',
      flex: 1,
    }}
  >
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
              padding: '0.5rem',
              textAlign: 'left',
              fontSize: '0.75rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.025em',
            }}
          >
            Movement
          </th>
          <th
            style={{
              color: 'var(--color-cloud)',
              padding: '0.5rem',
              textAlign: 'center',
              fontSize: '0.75rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.025em',
            }}
          >
            Normal
          </th>
          <th
            style={{
              color: 'var(--color-cloud)',
              padding: '0.5rem',
              textAlign: 'center',
              fontSize: '0.75rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.025em',
            }}
          >
            Sprint
          </th>
        </tr>
      </thead>
      <tbody>
        <tr style={{ borderBottom: '1px solid var(--color-dark-border)' }}>
          <td
            style={{
              color: 'var(--color-white)',
              padding: '0.375rem 0.5rem',
              fontWeight: '500',
            }}
          >
            Walk
          </td>
          <td
            style={{
              color: 'var(--color-white)',
              padding: '0.375rem 0.5rem',
              textAlign: 'center',
              fontWeight: '600',
            }}
          >
            {props.movement}
          </td>
          <td
            style={{
              color: 'var(--color-white)',
              padding: '0.375rem 0.5rem',
              textAlign: 'center',
              fontWeight: '600',
            }}
          >
            {props.movement * 2}
          </td>
        </tr>
        <tr style={{ borderBottom: '1px solid var(--color-dark-border)' }}>
          <td
            style={{
              color: 'var(--color-white)',
              padding: '0.375rem 0.5rem',
              fontWeight: '500',
            }}
          >
            Swim
          </td>
          <td
            style={{
              color: 'var(--color-white)',
              padding: '0.375rem 0.5rem',
              textAlign: 'center',
              fontWeight: '600',
            }}
          >
            {props.swim_speed || Math.floor(props.movement / 2)}
          </td>
          <td
            style={{
              color: 'var(--color-white)',
              padding: '0.375rem 0.5rem',
              textAlign: 'center',
              fontWeight: '600',
            }}
          >
            {(props.swim_speed || Math.floor(props.movement / 2)) * 2}
          </td>
        </tr>
        <tr>
          <td
            style={{
              color: 'var(--color-white)',
              padding: '0.375rem 0.5rem',
              fontWeight: '500',
            }}
          >
            Climb
          </td>
          <td
            style={{
              color: 'var(--color-white)',
              padding: '0.375rem 0.5rem',
              textAlign: 'center',
              fontWeight: '600',
            }}
          >
            {props.climb_speed || Math.floor(props.movement / 2)}
          </td>
          <td
            style={{
              color: 'var(--color-white)',
              padding: '0.375rem 0.5rem',
              textAlign: 'center',
              fontWeight: '600',
            }}
          >
            {(props.climb_speed || Math.floor(props.movement / 2)) * 2}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

export default MovementTable;

import React from 'react';
import Card, { CardHeader, CardBody } from '../ui/Card';
import { Creature } from '../../types/creature';

interface CreatureSidebarProps {
  creature: Creature;
}

const CreatureSidebar: React.FC<CreatureSidebarProps> = ({ creature }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Description */}
      <Card variant="default">
        <CardHeader style={{ padding: '0.75rem 1.25rem' }}>
          <h2
            style={{
              color: 'var(--color-white)',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              margin: 0,
            }}
          >
            Description
          </h2>
        </CardHeader>
        <CardBody style={{ padding: '0.75rem 1.25rem' }}>
          <p
            style={{
              color: 'var(--color-cloud)',
              lineHeight: '1.4',
              margin: 0,
              fontSize: '0.75rem',
            }}
          >
            {creature.description}
          </p>
        </CardBody>
      </Card>

      {/* Tactics */}
      <Card variant="default">
        <CardHeader style={{ padding: '0.75rem 1.25rem' }}>
          <h2
            style={{
              color: 'var(--color-white)',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              margin: 0,
            }}
          >
            Tactics
          </h2>
        </CardHeader>
        <CardBody style={{ padding: '0.75rem 1.25rem' }}>
          <p
            style={{
              color: 'var(--color-cloud)',
              lineHeight: '1.4',
              margin: 0,
              fontSize: '0.75rem',
            }}
          >
            {creature.tactics}
          </p>
        </CardBody>
      </Card>

      {/* Loot */}
      {creature.loot.length > 0 && (
        <Card variant="default">
          <CardHeader style={{ padding: '0.75rem 1.25rem' }}>
            <h2
              style={{
                color: 'var(--color-white)',
                fontSize: '0.875rem',
                fontWeight: 'bold',
                margin: 0,
              }}
            >
              Loot
            </h2>
          </CardHeader>
          <CardBody style={{ padding: '0.75rem 1.25rem' }}>
            <ul
              style={{
                color: 'var(--color-cloud)',
                margin: 0,
                paddingLeft: '1rem',
                fontSize: '0.75rem',
              }}
            >
              {creature.loot.map((item, index) => (
                <li key={index} style={{ marginBottom: '0.125rem' }}>
                  {item}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}

      {/* Languages */}
      {creature.languages.length > 0 && (
        <Card variant="default">
          <CardHeader style={{ padding: '0.75rem 1.25rem' }}>
            <h2
              style={{
                color: 'var(--color-white)',
                fontSize: '0.875rem',
                fontWeight: 'bold',
                margin: 0,
              }}
            >
              Languages
            </h2>
          </CardHeader>
          <CardBody style={{ padding: '0.75rem 1.25rem' }}>
            <div style={{ color: 'var(--color-cloud)', fontSize: '0.75rem' }}>
              {creature.languages.join(', ')}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default CreatureSidebar;

import React from 'react';
import Card, { CardBody } from '../../ui/Card';

interface ResourceBarProps {
  resources: {
    health: { current: number; max: number };
    stamina: { current: number; max: number };
    resolve: { current: number; max: number };
  };
}

const ResourceBars: React.FC<ResourceBarProps> = ({ resources }) => {
  // Helper function to render stat bars
  const renderStatBar = (value: number, max: number, color: string = 'var(--color-sat-purple)') => {
    const percentage = (value / max) * 100;
    return (
      <div
        style={{
          position: 'relative',
          height: '0.75rem',
          backgroundColor: 'var(--color-dark-elevated)',
          borderRadius: '0.375rem',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${percentage}%`,
            backgroundColor: color,
            borderRadius: '0.375rem',
          }}
        />
      </div>
    );
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
      }}
    >
      {/* Health */}
      <Card variant="default">
        <CardBody>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                color: 'var(--color-cloud)',
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
              }}
            >
              Health
            </div>
            <div
              style={{
                color: 'var(--color-white)',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
              }}
            >
              {resources.health.current} / {resources.health.max}
            </div>
            {renderStatBar(
              resources.health.current,
              resources.health.max,
              'var(--color-sunset)'
            )}
          </div>
        </CardBody>
      </Card>

      {/* Stamina */}
      <Card variant="default">
        <CardBody>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                color: 'var(--color-cloud)',
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
              }}
            >
              Stamina
            </div>
            <div
              style={{
                color: 'var(--color-white)',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
              }}
            >
              {resources.stamina.current} / {resources.stamina.max}
            </div>
            {renderStatBar(
              resources.stamina.current,
              resources.stamina.max,
              'var(--color-metal-gold)'
            )}
          </div>
        </CardBody>
      </Card>

      {/* Resolve */}
      <Card variant="default">
        <CardBody>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                color: 'var(--color-cloud)',
                fontSize: '0.875rem',
                marginBottom: '0.5rem',
              }}
            >
              Resolve
            </div>
            <div
              style={{
                color: 'var(--color-white)',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
              }}
            >
              {resources.resolve.current} / {resources.resolve.max}
            </div>
            {renderStatBar(
              resources.resolve.current,
              resources.resolve.max,
              'var(--color-sat-purple)'
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default ResourceBars;
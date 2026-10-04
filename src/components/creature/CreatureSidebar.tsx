import React from 'react';
import Card, { CardHeader, CardBody } from '../ui/Card';
import { Creature } from '../../types/creature';

interface CreatureSidebarProps {
  creature: Creature;
}

const CreatureSidebar: React.FC<CreatureSidebarProps> = ({ creature }) => {
  // Derive effective shield level from equipment or manual field
  const effectiveShieldLevel = (() => {
    // Check equipped offhand for a shield
    const offhandItem = (creature as any).resolvedEquipment?.offhand;
    if (offhandItem?.type === 'shield' || offhandItem?.shield_category) {
      return offhandItem.shield_category === 'heavy' ? 2 : 1;
    }
    return (creature as any).shieldLevel || 0;
  })();

  const shieldLabel = effectiveShieldLevel === 2 ? 'Heavy Shield' : effectiveShieldLevel === 1 ? 'Light Shield' : null;

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

      {/* Taming */}
      {creature.taming && creature.taming.tame_check !== -1 && (
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
              Taming
            </h2>
          </CardHeader>
          <CardBody style={{ padding: '0.75rem 1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--color-cloud)' }}>Tame Check:</span>
                <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                  {creature.taming.tame_check}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--color-cloud)' }}>Commands:</span>
                <span style={{ color: 'var(--color-white)', fontWeight: 'bold', textTransform: 'capitalize' }}>
                  {creature.taming.commands}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

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
      {/* Equipment */}
      {creature.resolvedEquipment && Object.values(creature.resolvedEquipment).some((v: any) => v !== null) && (
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
              Equipment
            </h2>
          </CardHeader>
          <CardBody style={{ padding: '0.75rem 1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {Object.entries(creature.resolvedEquipment as Record<string, any>)
                .filter(([, item]) => item !== null)
                .map(([slot, item]: [string, any]) => {
                  const slotLabel = slot === 'accessory1' ? 'Accessory' : slot === 'accessory2' ? 'Accessory' : slot.charAt(0).toUpperCase() + slot.slice(1);
                  return (
                    <div key={slot} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--color-cloud)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{slotLabel}</span>
                      <span style={{ color: 'var(--color-old-gold)', fontSize: '0.8rem', fontWeight: '500' }}>{item.name}</span>
                    </div>
                  );
                })}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Shield */}
      {shieldLabel && (
        <div style={{
          padding: '0.5rem 0.75rem',
          borderRadius: '0.375rem',
          backgroundColor: 'rgba(200, 170, 80, 0.1)',
          border: '1px solid rgba(200, 170, 80, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <span style={{ fontSize: '1rem' }}>🛡️</span>
          <span style={{ color: 'var(--color-old-gold)', fontSize: '0.8rem', fontWeight: '600' }}>{shieldLabel}</span>
          <span style={{ color: 'var(--color-cloud)', fontSize: '0.7rem' }}>
            {effectiveShieldLevel === 2
              ? 'Full deflection vs ranged and area'
              : 'Full deflection vs ranged'}
          </span>
        </div>
      )}
    </div>
  );
};

export default CreatureSidebar;

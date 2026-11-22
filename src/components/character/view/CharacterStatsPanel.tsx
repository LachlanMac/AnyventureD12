import React from 'react';
import Card, { CardBody } from '../../ui/Card';
import ResourceBars from './ResourceBars';
import MitigationTable from './MitigationTable';
import MovementTable from './MovementTable';

interface StatsSource {
  movement?: number;
  swim_speed?: number;
  climb_speed?: number;
  resources?: Record<string, { max?: number }> & {
    painMitigation?: number;
    painLimit?: number;
    stressMitigation?: number;
    stressLimit?: number;
  };
  mitigation?: Record<string, { min: number; max: number }>;
  immunities?: string[];
  vision?: string[];
  // Pain/stress from injuries are added on top of the health/resolve rules
  injuries?: { injuryId?: { pain?: number; stress?: number } }[];
}

interface CharacterStatsPanelProps {
  // Any computed character (template preview, random commoner, ...)
  character: object;
  style?: React.CSSProperties;
}

// Resources, movement and mitigation laid out like the character sheet header,
// shown at full resources (read-only)
const CharacterStatsPanel: React.FC<CharacterStatsPanelProps> = ({ character, style }) => {
  const stats = character as StatsSource;
  const full = (key: string) => {
    const max = stats.resources?.[key]?.max ?? 0;
    return { current: max, max };
  };
  const resources = {
    health: full('health'),
    resolve: full('resolve'),
    morale: full('morale'),
    energy: full('energy'),
    // pain/stress mitigation and limits after module/trait bonuses
    painMitigation: stats.resources?.painMitigation,
    painLimit: stats.resources?.painLimit,
    stressMitigation: stats.resources?.stressMitigation,
    stressLimit: stats.resources?.stressLimit,
  };
  const senses = [
    ...(stats.immunities || []).map((i) => `Immune to ${i}`),
    ...(stats.vision || []).map((v) => `${v} vision`),
  ];

  return (
    <Card variant="default" style={{ marginBottom: '1rem', ...style }}>
      <CardBody>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <ResourceBars resources={resources} injuries={stats.injuries} readOnly />
            <MovementTable
              movement={stats.movement ?? 5}
              swim_speed={stats.swim_speed}
              climb_speed={stats.climb_speed}
            />
            {senses.length > 0 && (
              <div
                style={{
                  color: 'var(--color-cloud)',
                  fontSize: '0.85rem',
                  textTransform: 'capitalize',
                }}
              >
                {senses.join(' · ')}
              </div>
            )}
          </div>
          {stats.mitigation && (
            <div className="flex-1 flex justify-center">
              <MitigationTable mitigation={stats.mitigation} />
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default CharacterStatsPanel;

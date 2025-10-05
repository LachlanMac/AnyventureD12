import React from 'react';
import { CreatureAttributes } from '../../types/creature';
import { getDiceForSkill } from '../../utils/combatUtils';

interface CreatureStatGridProps {
  attributes: CreatureAttributes;
  skills: Record<string, { value: number; tier: number }>;
}

const CreatureStatGrid: React.FC<CreatureStatGridProps> = ({ attributes, skills }) => {
  const renderSkillValue = (attributeTalent: number, skillLevel: number): string => {
    if (attributeTalent === -1) return '-';
    return `${attributeTalent}d${getDiceForSkill(skillLevel)}`;
  };

  const skillColumns = [
    {
      title: 'PHYSIQUE',
      attribute: attributes.physique.talent,
      skills: [
        { name: 'Fitness', value: skills.fitness?.value || 0 },
        { name: 'Deflection', value: skills.deflection?.value || 0 },
        { name: 'Might', value: skills.might?.value || 0 },
        { name: 'Endurance', value: skills.endurance?.value || 0 },
      ],
    },
    {
      title: 'FINESSE',
      attribute: attributes.finesse.talent,
      skills: [
        { name: 'Evasion', value: skills.evasion?.value || 0 },
        { name: 'Stealth', value: skills.stealth?.value || 0 },
        { name: 'Coordination', value: skills.coordination?.value || 0 },
        { name: 'Thievery', value: skills.thievery?.value || 0 },
      ],
    },
    {
      title: 'MIND',
      attribute: attributes.mind.talent,
      skills: [
        { name: 'Resilience', value: skills.resilience?.value || 0 },
        { name: 'Concentration', value: skills.concentration?.value || 0 },
        { name: 'Senses', value: skills.senses?.value || 0 },
        { name: 'Logic', value: skills.logic?.value || 0 },
      ],
    },
    {
      title: 'KNOWLEDGE',
      attribute: attributes.knowledge.talent,
      skills: [
        { name: 'Wildcraft', value: skills.wildcraft?.value || 0 },
        { name: 'Academics', value: skills.academics?.value || 0 },
        { name: 'Magic', value: skills.magic?.value || 0 },
        { name: 'Medicine', value: skills.medicine?.value || 0 },
      ],
    },
    {
      title: 'SOCIAL',
      attribute: attributes.social.talent,
      skills: [
        { name: 'Expression', value: skills.expression?.value || 0 },
        { name: 'Presence', value: skills.presence?.value || 0 },
        { name: 'Insight', value: skills.insight?.value || 0 },
        { name: 'Persuasion', value: skills.persuasion?.value || 0 },
      ],
    },
  ];

  return (
    <div
      style={{
        borderTop: '1px solid var(--color-dark-border)',
        paddingTop: '0.75rem',
        marginBottom: '0.75rem',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '0.5rem',
          textAlign: 'center',
        }}
      >
        {skillColumns.map((column, index) => (
          <div
            key={column.title}
            style={{
              backgroundColor:
                index % 2 === 0 ? 'var(--color-dark-elevated)' : 'var(--color-dark-surface)',
              padding: '0.5rem',
              borderRadius: '0.25rem',
            }}
          >
            <div
              style={{
                color: 'var(--color-old-gold)',
                fontSize: '0.625rem',
                fontWeight: 'bold',
                marginBottom: '0.375rem',
              }}
            >
              {column.title}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {column.skills.map((skill) => (
                <div
                  key={skill.name}
                  style={{ fontSize: '0.625rem', display: 'flex', justifyContent: 'space-between' }}
                >
                  <span style={{ color: 'var(--color-cloud)' }}>{skill.name}</span>
                  <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                    {renderSkillValue(column.attribute, skill.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreatureStatGrid;

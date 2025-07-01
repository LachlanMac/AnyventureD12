import React from 'react';
import { CreatureAttributes } from '../../types/creature';
import { getDiceForSkill } from '../../utils/combatUtils';

interface CreatureStatGridProps {
  attributes: CreatureAttributes;
  skills: Record<string, number>;
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
        { name: 'Fitness', value: skills.fitness },
        { name: 'Deflection', value: skills.deflection },
        { name: 'Might', value: skills.might },
        { name: 'Endurance', value: skills.endurance },
      ],
    },
    {
      title: 'FINESSE',
      attribute: attributes.finesse.talent,
      skills: [
        { name: 'Evasion', value: skills.evasion },
        { name: 'Stealth', value: skills.stealth },
        { name: 'Coordination', value: skills.coordination },
        { name: 'Thievery', value: skills.thievery },
      ],
    },
    {
      title: 'MIND',
      attribute: attributes.mind.talent,
      skills: [
        { name: 'Resilience', value: skills.resilience },
        { name: 'Concentration', value: skills.concentration },
        { name: 'Senses', value: skills.senses },
        { name: 'Logic', value: skills.logic },
      ],
    },
    {
      title: 'KNOWLEDGE',
      attribute: attributes.knowledge.talent,
      skills: [
        { name: 'Wildcraft', value: skills.wildcraft },
        { name: 'Academics', value: skills.academics },
        { name: 'Magic', value: skills.magic },
        { name: 'Medicine', value: skills.medicine },
      ],
    },
    {
      title: 'SOCIAL',
      attribute: attributes.social.talent,
      skills: [
        { name: 'Expression', value: skills.expression },
        { name: 'Presence', value: skills.presence },
        { name: 'Insight', value: skills.insight },
        { name: 'Persuasion', value: skills.persuasion },
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

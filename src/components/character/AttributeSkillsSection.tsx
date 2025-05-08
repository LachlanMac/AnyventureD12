import React from 'react';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import SkillCard from './SkillCard';
import TalentDisplay from './TalentDisplay';

interface Skill {
  id: string;
  name: string;
  value: number;
  talent: number;
}

interface AttributeSkillsSectionProps {
  attributeName: string;
  attributeValue: number;
  skills: Skill[];
}

const AttributeSkillsSection: React.FC<AttributeSkillsSectionProps> = ({
  attributeName,
  attributeValue,
  skills,
}) => {
  return (
    <Card variant="default" style={{ marginBottom: '1.5rem' }}>
      <CardHeader>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2
            style={{
              color: 'var(--color-white)',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            {attributeName}

            <div
              style={{
                backgroundColor: 'var(--color-dark-elevated)',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                fontSize: '0.875rem',
                color: 'var(--color-metal-gold)',
              }}
            >
              {attributeValue}
            </div>
          </h2>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span
              style={{
                color: 'var(--color-cloud)',
                fontSize: '0.875rem',
              }}
            >
              Talent:
            </span>
            <TalentDisplay talent={attributeValue} showNumber={true} />
          </div>
        </div>
      </CardHeader>

      <CardBody>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          {skills.map((skill) => (
            <SkillCard
              key={skill.id}
              name={skill.name}
              value={skill.value}
              talent={attributeValue} // For attribute skills, the talent is the attribute value
            />
          ))}
        </div>

        <div
          style={{
            color: 'var(--color-cloud)',
            fontSize: '0.875rem',
            marginTop: '1rem',
            fontStyle: 'italic',
            textAlign: 'center',
          }}
        >
          All {attributeName.toLowerCase()} skills use {attributeValue} dice based on your attribute
          value
        </div>
      </CardBody>
    </Card>
  );
};

export default AttributeSkillsSection;

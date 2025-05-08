import React from 'react';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import SkillCard from './SkillCard';

interface Skill {
  id: string;
  name: string;
  value: number;
  talent: number;
}

interface SpecializedSkillsSectionProps {
  title: string;
  skills: Skill[];
  description?: string;
}

const SpecializedSkillsSection: React.FC<SpecializedSkillsSectionProps> = ({
  title,
  skills,
  description,
}) => {
  return (
    <Card variant="default" style={{ marginBottom: '1.5rem' }}>
      <CardHeader>
        <h2
          style={{
            color: 'var(--color-white)',
            fontSize: '1.25rem',
            fontWeight: 'bold',
          }}
        >
          {title}
        </h2>
      </CardHeader>

      <CardBody>
        {description && (
          <p
            style={{
              color: 'var(--color-cloud)',
              marginBottom: '1rem',
              fontSize: '0.875rem',
            }}
          >
            {description}
          </p>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          {skills.map((skill) => (
            <SkillCard key={skill.id} name={skill.name} value={skill.value} talent={skill.talent} />
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

export default SpecializedSkillsSection;

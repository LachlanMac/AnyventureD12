import React from 'react';
import PersonalitySelection from '../PersonalitySelection';
import { Module } from '../../../types/character';
import Card, { CardHeader, CardBody } from '../../ui/Card';

interface PersonalityCreatorTabProps {
  selectedPersonality: string;
  stressors: string[];
  onSelectPersonality: (personality: string, personalityModule: Module) => void;
}

const PersonalityCreatorTab: React.FC<PersonalityCreatorTabProps> = ({
  selectedPersonality,
  stressors,
  onSelectPersonality
}) => {
  return (
    <div>
      <h2
        style={{
          color: 'var(--color-white)',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
        }}
      >
        Character Personality
      </h2>

      <div
        style={{
          padding: '1rem',
          backgroundColor: 'var(--color-dark-elevated)',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
          color: 'var(--color-cloud)',
        }}
      >
        <p>
          Choose a personality type that defines your character's approach to the world.
          Your personality determines how your character interacts with others and reacts to different situations.
          Each personality type comes with specific stressors that may affect your character during gameplay.
        </p>
      </div>

      <PersonalitySelection
        selectedPersonality={selectedPersonality}
        onSelectPersonality={onSelectPersonality}
      />

      {selectedPersonality && stressors.length > 0 && (
        <Card variant="default" style={{ marginTop: '1.5rem' }}>
          <CardHeader>
            <h3
              style={{
                color: 'var(--color-white)',
                fontSize: '1.25rem',
                fontWeight: 'bold',
              }}
            >
              Character Stressors
            </h3>
          </CardHeader>
          <CardBody>
            <p style={{ color: 'var(--color-cloud)', marginBottom: '1rem' }}>
              These stressors represent situations that may challenge your character's emotional stability.
            </p>
            <div>
              {stressors.map((stressor, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: 'var(--color-dark-elevated)',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    marginBottom: '0.75rem',
                  }}
                >
                  <div style={{ color: 'var(--color-cloud)' }}>
                    {stressor}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default PersonalityCreatorTab;
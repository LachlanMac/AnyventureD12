import React from 'react';

// Define the ATTRIBUTES and ATTRIBUTE_SKILLS constants based on your CharacterCreate.tsx
const ATTRIBUTES = [
  {
    id: 'physique',
    name: 'Physique',
    description: 'Physical strength, endurance, and overall body power.',
  },
  { id: 'agility', name: 'Agility', description: 'Speed, reflexes, balance, and coordination.' },
  { id: 'mind', name: 'Mind', description: 'Mental fortitude, focus, and perception.' },
  {
    id: 'knowledge',
    name: 'Knowledge',
    description: 'Education, technical expertise, and wisdom.',
  },
  {
    id: 'social',
    name: 'Social',
    description: 'Charisma, empathy, and ability to influence others.',
  },
];

// Skill mappings by attribute category
const ATTRIBUTE_SKILLS = {
  physique: [
    { id: 'fitness', name: 'Fitness' },
    { id: 'deflect', name: 'Deflect' },
    { id: 'might', name: 'Might' },
  ],
  agility: [
    { id: 'evade', name: 'Evade' },
    { id: 'stealth', name: 'Stealth' },
    { id: 'coordination', name: 'Coordination' },
  ],
  mind: [
    { id: 'resilience', name: 'Resilience' },
    { id: 'concentration', name: 'Concentration' },
    { id: 'senses', name: 'Senses' },
  ],
  knowledge: [
    { id: 'science', name: 'Science' },
    { id: 'technology', name: 'Technology' },
    { id: 'medicine', name: 'Medicine' },
    { id: 'xenology', name: 'Xenology' },
  ],
  social: [
    { id: 'negotiation', name: 'Negotiation' },
    { id: 'behavior', name: 'Behavior' },
    { id: 'presence', name: 'Presence' },
  ],
};

interface AttributesTabProps {
  attributes: {
    physique: number;
    agility: number;
    mind: number;
    knowledge: number;
    social: number;
  };
  attributePointsRemaining: number;
  onUpdateAttribute: (attribute: string, newValue: number) => void;
}

const AttributesTab: React.FC<AttributesTabProps> = ({
  attributes,
  attributePointsRemaining,
  onUpdateAttribute,
}) => {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <h2
          style={{
            color: 'var(--color-white)',
            fontSize: '1.5rem',
            fontWeight: 'bold',
          }}
        >
          Attributes
        </h2>
        <div
          style={{
            backgroundColor: 'var(--color-dark-elevated)',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            color:
              attributePointsRemaining > 0
                ? 'var(--color-metal-gold)'
                : 'var(--color-white)',
          }}
        >
          Points Remaining:{' '}
          <span style={{ fontWeight: 'bold' }}>{attributePointsRemaining}</span>
        </div>
      </div>

      <p
        style={{
          color: 'var(--color-cloud)',
          marginBottom: '1.5rem',
        }}
      >
        Attributes define your character's basic capabilities. Each attribute has a
        maximum value of 3 and determines the number of dice you roll for related skills.
        All attributes start at 1.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {ATTRIBUTES.map((attribute) => (
          <div key={attribute.id}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
              }}
            >
              <label style={{ color: 'var(--color-metal-gold)', fontWeight: 'bold' }}>
                {attribute.name}
              </label>
              <div>
                <span
                  style={{
                    color: 'var(--color-cloud)',
                    fontSize: '0.875rem',
                  }}
                >
                  {attribute.description}
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <button
                type="button"
                disabled={
                  attributes[attribute.id as keyof typeof attributes] <= 1
                }
                onClick={() =>
                  onUpdateAttribute(
                    attribute.id,
                    Math.max(
                      1,
                      attributes[attribute.id as keyof typeof attributes] - 1
                    )
                  )
                }
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '0.375rem',
                  backgroundColor: 'var(--color-dark-elevated)',
                  color: 'var(--color-white)',
                  border: 'none',
                  cursor:
                    attributes[attribute.id as keyof typeof attributes] <= 1
                      ? 'not-allowed'
                      : 'pointer',
                  opacity:
                    attributes[attribute.id as keyof typeof attributes] <= 1
                      ? 0.5
                      : 1,
                }}
              >
                -
              </button>

              <div
                style={{
                  width: '3rem',
                  height: '2.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--color-sat-purple-faded)',
                  color: 'var(--color-white)',
                  borderRadius: '0.375rem',
                  fontWeight: 'bold',
                }}
              >
                {attributes[attribute.id as keyof typeof attributes]}
              </div>

              <button
                type="button"
                disabled={
                  attributes[attribute.id as keyof typeof attributes] >= 3 || attributePointsRemaining <= 0
                }
                onClick={() =>
                  onUpdateAttribute(
                    attribute.id,
                    Math.min(
                      3,
                      attributes[attribute.id as keyof typeof attributes] + 1
                    )
                  )
                }
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '0.375rem',
                  backgroundColor: 'var(--color-dark-elevated)',
                  color: 'var(--color-white)',
                  border: 'none',
                  cursor:
                    attributes[attribute.id as keyof typeof attributes] >= 3 || attributePointsRemaining <= 0
                      ? 'not-allowed'
                      : 'pointer',
                  opacity:
                    attributes[attribute.id as keyof typeof attributes] >= 3 || attributePointsRemaining <= 0
                      ? 0.5
                      : 1,
                }}
              >
                +
              </button>

              <div
                style={{
                  position: 'relative',
                  height: '0.75rem',
                  backgroundColor: 'var(--color-dark-elevated)',
                  borderRadius: '0.375rem',
                  flex: 1,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: `${(attributes[attribute.id as keyof typeof attributes] / 3) * 100}%`,
                    backgroundColor: 'var(--color-sat-purple)',
                    borderRadius: '0.375rem',
                    transition: 'width 0.3s',
                  }}
                />
              </div>
            </div>

            {/* Show related skills */}
            <div
              style={{
                marginTop: '0.5rem',
                paddingLeft: '0.5rem',
                borderLeft: '2px solid var(--color-dark-border)',
              }}
            >
              <div
                style={{
                  color: 'var(--color-cloud)',
                  fontSize: '0.875rem',
                  marginBottom: '0.5rem',
                }}
              >
                Related skills:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {ATTRIBUTE_SKILLS[attribute.id as keyof typeof ATTRIBUTE_SKILLS].map(
                  (skill) => (
                    <div
                      key={skill.id}
                      style={{
                        backgroundColor: 'var(--color-dark-elevated)',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        color: 'var(--color-white)',
                      }}
                    >
                      {skill.name} (
                      {
                        attributes[
                          attribute.id as keyof typeof attributes
                        ]
                      }{' '}
                      dice)
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          backgroundColor: 'var(--color-dark-elevated)',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          marginTop: '2rem',
        }}
      >
        <h3
          style={{
            color: 'var(--color-metal-gold)',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
          }}
        >
          Dice System
        </h3>
        <p style={{ color: 'var(--color-cloud)' }}>
          For skill checks, you'll roll a number of dice equal to your attribute value
          (1-3). Each skill has a die type from 1d4 to 1d20 that you'll set in the next
          step.
        </p>
      </div>
    </div>
  );
};

export default AttributesTab;
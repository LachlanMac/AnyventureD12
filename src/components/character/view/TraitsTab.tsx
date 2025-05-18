import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../ui/Button';
import Card, { CardHeader, CardBody } from '../../ui/Card';

interface Trait {
  traitId: string;
  name: string;
  type: 'positive' | 'negative';
  description: string;
  dateAdded: string;
}

interface TraitsTabProps {
  traits: Trait[];
  characterId: string;
  personality?: string;
  stressors?: string[];
}

const TraitsTab: React.FC<TraitsTabProps> = ({  traits, characterId, personality, stressors = []  }) => {
  
  const navigate = useNavigate();

  return (
    <div>

 {personality && (
        <Card variant="default" style={{ marginBottom: '2rem' }}>
          <CardHeader
            style={{
              backgroundColor: 'var(--color-sat-purple-faded)',
            }}
          >
            <h3
              style={{
                color: 'var(--color-white)',
                fontSize: '1.25rem',
                fontWeight: 'bold',
              }}
            >
              Personality: {personality}
            </h3>
          </CardHeader>
          <CardBody>
            {stressors.length > 0 && (
              <div>
                <h4
                  style={{
                    color: 'var(--color-metal-gold)',
                    fontSize: '1rem',
                    marginBottom: '1rem',
                  }}
                >
                  Character Stressors:
                </h4>
                <div>
                  {stressors.map((stressor, index) => (
                    <div
                      key={index}
                      style={{
                        backgroundColor: 'var(--color-dark-elevated)',
                        padding: '0.75rem',
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
              </div>
            )}
          </CardBody>
        </Card>
      )}
    

      {traits.length === 0 ? (
        <Card variant="default">
          <CardBody>
            <div
              style={{
                textAlign: 'center',
                padding: '2rem',
              }}
            >
              <div
                style={{
                  color: 'var(--color-cloud)',
                  marginBottom: '1rem',
                }}
              >
                No traits selected for this character.
              </div>
              <Button
                variant="secondary"
                onClick={() => navigate(`/characters/${characterId}/edit`)}
              >
                Edit Character
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1rem',
          }}
        >
          {traits.map((trait) => (
            <Card key={trait.traitId} variant="default">
              <CardHeader
                style={{
                  backgroundColor:
                    trait.type === 'positive'
                      ? 'rgba(215, 183, 64, 0.2)'
                      : 'rgba(152, 94, 109, 0.2)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <h2
                    style={{
                      color:
                        trait.type === 'positive'
                          ? 'var(--color-metal-gold)'
                          : 'var(--color-sunset)',
                      fontSize: '1.125rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {trait.name}
                  </h2>
                  <span
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      color: 'var(--color-white)',
                      fontSize: '0.75rem',
                      padding: '0.125rem 0.375rem',
                      borderRadius: '0.25rem',
                      fontWeight: 'bold',
                      textTransform: 'capitalize',
                    }}>
                    {trait.type}
                  </span>
                </div>
              </CardHeader>
              <CardBody>
                <p
                  style={{
                    color: 'var(--color-cloud)',
                    fontSize: '0.875rem',
                  }}
                >
                  {trait.description}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TraitsTab;
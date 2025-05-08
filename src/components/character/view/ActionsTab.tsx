import React from 'react';
import Button from '../../ui/Button';
import Card, { CardHeader, CardBody } from '../../ui/Card';

interface Action {
  name: string;
  description: string;
  type: 'Action' | 'Reaction' | 'Free Action';
  sourceModule: string;
  sourceModuleOption: string;
}

interface ActionsTabProps {
  actions: Action[];
}

const ActionsTab: React.FC<ActionsTabProps> = ({ actions }) => {
  return (
    <div>
      {actions.length === 0 ? (
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
                No actions available yet. Add modules to gain actions.
              </div>
              <Button variant="secondary">Add Module</Button>
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
          {actions.map((action) => (
            <Card key={action.name} variant="default">
              <CardHeader
                style={{
                  backgroundColor:
                    action.type === 'Action'
                      ? 'var(--color-sat-purple-faded)'
                      : action.type === 'Reaction'
                        ? 'var(--color-sunset)'
                        : 'var(--color-metal-gold)',
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
                      color: 'var(--color-white)',
                      fontSize: '1.125rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {action.name}
                  </h2>
                  <span
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      color: 'var(--color-white)',
                      fontSize: '0.75rem',
                      padding: '0.125rem 0.375rem',
                      borderRadius: '0.25rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {action.type}
                  </span>
                </div>
              </CardHeader>
              <CardBody>
                <p
                  style={{
                    color: 'var(--color-cloud)',
                    fontSize: '0.875rem',
                    marginBottom: '1rem',
                  }}
                >
                  {action.description}
                </p>
                <div
                  style={{
                    color: 'var(--color-cloud)',
                    fontSize: '0.75rem',
                    marginTop: 'auto',
                  }}
                >
                  Source: {action.sourceModule} ({action.sourceModuleOption})
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionsTab;
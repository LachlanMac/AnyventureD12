import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';
import { CharacterModule, Module } from '../../../types/character';

interface ModulesTabProps {
  characterId: string;
  modules: CharacterModule[]; // This represents the modules array in the character object
}

const ModulesTab: React.FC<ModulesTabProps> = ({ characterId, modules }) => {
  const navigate = useNavigate();
  
  // Helper function to get module type badge color
  const getModuleTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'racial':
        return 'var(--color-sunset)';
      case 'core':
        return 'var(--color-sat-purple)';
      case 'secondary':
        return 'var(--color-stormy)';
      default:
        return 'var(--color-dark-elevated)';
    }
  };

  // Helper function to safely get module data
  const getModuleData = (moduleId: string | Module): Module | null => {
    if (typeof moduleId === 'string') {
      return null; // When it's just a string ID, we don't have the full module data
    }
    return moduleId;
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: '1.5rem',
        }}
      >
        <Button 
          variant="accent" 
          onClick={() => navigate(`/characters/${characterId}/modules`)}
        >
          Manage Modules
        </Button>
      </div>

      {/* Note that we're checking modules.length - these are specifically the character's modules */}
      {!modules || modules.length === 0 ? (
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
                No modules added to this character yet.
              </div>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Here we map through the character's modules array */}
          {modules.map((module) => (
            <Card key={getModuleData(module.moduleId)?._id || 'unknown'} variant="default" hoverEffect={true}>
              <CardHeader
                style={{
                  backgroundColor: getModuleTypeColor(getModuleData(module.moduleId)?.mtype || ''),
                  opacity: 0.8,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <h3
                    style={{
                      color: 'var(--color-white)',
                      fontSize: '1.125rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {getModuleData(module.moduleId)?.name || 'Module'}
                  </h3>
                  <span
                    style={{
                      color: 'var(--color-white)',
                      fontSize: '0.75rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      padding: '0.125rem 0.375rem',
                      borderRadius: '9999px',
                      textTransform: 'capitalize',
                    }}
                  >
                    {getModuleData(module.moduleId)?.mtype || 'Unknown'}
                  </span>
                </div>
              </CardHeader>
              <CardBody>
                {module.selectedOptions && module.selectedOptions.length > 0 ? (
                  <>
                    <div
                      style={{
                        color: 'var(--color-cloud)',
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem',
                      }}
                    >
                      Selected Options:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {module.selectedOptions.map((option) => {
                        const moduleData = getModuleData(module.moduleId);
                        const optionDetails = moduleData?.options?.find(
                          (o) => o.location === option.location
                        );
                        return (
                          <div
                            key={option.location}
                            style={{
                              backgroundColor: 'var(--color-dark-elevated)',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.75rem',
                              color: 'var(--color-white)',
                            }}
                          >
                            {optionDetails ? optionDetails.name : `Option ${option.location}`}
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <p
                    style={{
                      color: 'var(--color-cloud)',
                      fontStyle: 'italic',
                      fontSize: '0.875rem',
                    }}
                  >
                    No options selected
                  </p>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModulesTab;

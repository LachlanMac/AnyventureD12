import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';
import { CharacterModule, Module, ModulePoints } from '../../../types/character';

interface ModulesTabProps {
  characterId: string;
  modules: CharacterModule[]; // This represents the modules array in the character object
  modulePoints?: ModulePoints;
  onUpdateModulePoints?: (updatedCharacter: any) => void;
}

const ModulesTab: React.FC<ModulesTabProps> = ({ characterId, modules, modulePoints, onUpdateModulePoints }) => {
  const navigate = useNavigate();
  const [isChangingPoints, setIsChangingPoints] = useState(false);
  const [pointChange, setPointChange] = useState(0);
  
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
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        {/* Module Points Display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div>
            <span style={{ color: 'var(--color-cloud)', marginRight: '0.5rem' }}>Module Points:</span>
            <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
              {modulePoints?.spent || 0} / {modulePoints?.total || 0}
            </span>
            {(modulePoints?.total || 0) > (modulePoints?.spent || 0) && (
              <span style={{ color: 'var(--color-metal-gold)', marginLeft: '0.5rem' }}>
                ({(modulePoints?.total || 0) - (modulePoints?.spent || 0)} available)
              </span>
            )}
            {!isChangingPoints ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsChangingPoints(true);
                  setPointChange(0);
                }}
                style={{ marginLeft: '0.5rem' }}
              >
                Change
              </Button>
            ) : (
              <>
                <span style={{ marginLeft: '0.5rem', marginRight: '0.25rem' }}>Change by:</span>
                <input
                  type="number"
                  value={pointChange}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    // Calculate the minimum allowed change (can't go below spent points)
                    const currentTotal = modulePoints?.total || 0;
                    const currentSpent = modulePoints?.spent || 0;
                    const minChange = currentSpent - currentTotal;
                    setPointChange(Math.max(minChange, value));
                  }}
                  style={{
                    width: '80px',
                    padding: '0.25rem 0.5rem',
                    backgroundColor: 'var(--color-dark-elevated)',
                    color: 'var(--color-white)',
                    border: '1px solid var(--color-dark-border)',
                    borderRadius: '0.25rem',
                    marginRight: '0.5rem',
                  }}
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={async () => {
                    if (onUpdateModulePoints) {
                      try {
                        const newTotal = (modulePoints?.total || 0) + pointChange;
                        const response = await fetch(`/api/characters/${characterId}`, {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          credentials: 'include',
                          body: JSON.stringify({
                            modulePoints: {
                              total: newTotal,
                              spent: modulePoints?.spent || 0
                            }
                          }),
                        });
                        
                        if (response.ok) {
                          const updatedCharacter = await response.json();
                          onUpdateModulePoints(updatedCharacter);
                          setIsChangingPoints(false);
                          setPointChange(0);
                        }
                      } catch (error) {
                        console.error('Error changing module points:', error);
                      }
                    }
                  }}
                  disabled={
                    (modulePoints?.total || 0) + pointChange < (modulePoints?.spent || 0)
                  }
                >
                  Apply
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsChangingPoints(false);
                    setPointChange(0);
                  }}
                  style={{ marginLeft: '0.25rem' }}
                >
                  Cancel
                </Button>
              </>
            )}
            {isChangingPoints && (modulePoints?.total || 0) + pointChange < (modulePoints?.spent || 0) && (
              <div style={{ color: 'var(--color-stormy)', fontSize: '0.875rem', marginLeft: '0.5rem' }}>
                Cannot reduce below spent points
              </div>
            )}
          </div>
        </div>
        
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

import React, { useState, useEffect } from 'react';
import { Module } from '../../types/character';

interface PersonalitySelectionProps {
  selectedPersonality: string;
  onSelectPersonality: (personality: string, personalityModule: Module) => void;
}

const PersonalitySelection: React.FC<PersonalitySelectionProps> = ({ 
  selectedPersonality, 
  onSelectPersonality 
}) => {
  const [personalityModules, setPersonalityModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<boolean>(true);

  useEffect(() => {
    const fetchPersonalityModules = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/modules/type/personality');

        if (!response.ok) {
          throw new Error('Failed to fetch personality modules');
        }

        const data = await response.json();
        console.log("Fetched personality modules:", data);
        setPersonalityModules(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching personality modules:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };

    fetchPersonalityModules();
  }, []);

  // Handler for personality selection
  const handlePersonalitySelect = (personalityName: string) => {
    const selectedModule = personalityModules.find(module => module.name === personalityName);
    if (selectedModule) {
      console.log("Selected personality module:", selectedModule);
      onSelectPersonality(personalityName, selectedModule);
    } else {
      console.error(`Could not find personality module for: ${personalityName}`);
    }
  };

  // Toggle section expansion
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
        <div style={{ marginTop: '1rem', color: 'var(--color-cloud)' }}>
          Loading personality options...
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        style={{
          backgroundColor: 'rgba(152, 94, 109, 0.2)',
          borderRadius: '0.5rem',
          padding: '1rem',
          color: 'var(--color-white)',
        }}
      >
        <div>Error loading personality options: {error}</div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem',
          cursor: 'pointer',
        }}
        onClick={toggleExpanded}
      >
        <label
          style={{
            display: 'block',
            color: 'var(--color-cloud)',
            fontWeight: 'bold',
            fontSize: '1.1rem',
          }}
        >
          Personality Selection
        </label>
        <div 
          style={{
            transition: 'transform 0.3s ease',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ color: 'var(--color-cloud)' }}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>

      {expanded && (
        <>
          {/* Personality selection grid */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', 
              gap: '1rem' 
            }}
          >
            {personalityModules.map((module) => (
              <button
                key={module.name || module._id}
                type="button"
                style={{
                  position: 'relative',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.375rem',
                  backgroundColor:
                    selectedPersonality === module.name
                      ? 'var(--color-sat-purple)'
                      : 'var(--color-dark-elevated)',
                  color: 'var(--color-white)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  overflow: 'hidden',
                }}
                onClick={() => handlePersonalitySelect(module.name)}
              >
                <span>{module.name || 'Unnamed'}</span>
              </button>
            ))}
          </div>

          {/* Personality description and stressors */}
          <div
            style={{
              backgroundColor: 'var(--color-dark-elevated)',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginTop: '1rem',
            }}
          >
            {selectedPersonality ? (
              <>
                <h3
                  style={{
                    color: 'var(--color-white)',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem',
                  }}
                >
                  {selectedPersonality}
                </h3>
                
                {/* Display personality description from tier 1 option */}
                {selectedPersonality && (
                  <div>
                    {personalityModules
                      .find((module) => module.name === selectedPersonality)
                      ?.options.filter((option) => option.location === '1')
                      .map((option) => (
                        <div key={option.name}>
                          <p style={{ color: 'var(--color-cloud)' }}>
                            {option.description}
                          </p>
                        </div>
                      ))}
                  </div>
                )}

                {/* Display stressors */}
                {selectedPersonality && (
                  <div style={{ marginTop: '1rem' }}>
                    <h4
                      style={{
                        color: 'var(--color-metal-gold)',
                        fontSize: '1rem',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Stressors
                    </h4>
                    <div>
                      {personalityModules
                        .find((module) => module.name === selectedPersonality)
                        ?.stressors?.map((stressor, index) => (
                          <div
                            key={index}
                            style={{
                              backgroundColor: 'rgba(85, 65, 130, 0.2)',
                              padding: '0.5rem',
                              borderRadius: '0.25rem',
                              marginBottom: '0.5rem',
                            }}
                          >
                            <div style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>
                              {stressor}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p style={{ color: 'var(--color-cloud)' }}>Select a personality to see information</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PersonalitySelection;
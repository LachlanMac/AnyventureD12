// src/components/character/CultureSelection.tsx
import React, { useState, useEffect } from 'react';
import { Module } from '../../types/character';

interface CultureSelectionProps {
  selectedCulture: string;
  onSelectCulture: (culture: string, cultureModule: Module) => void;
}

const CultureSelection: React.FC<CultureSelectionProps> = ({ selectedCulture, onSelectCulture }) => {
  const [cultureModules, setCultureModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<boolean>(true);

  useEffect(() => {
    const fetchCultureModules = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/modules/type/cultural');

        if (!response.ok) {
          throw new Error('Failed to fetch culture modules');
        }

        const data = await response.json();
        console.log("Fetched culture modules in CultureSelection:", data);
        
        // Add description field to each module if needed
        const modulesWithDescriptions = data.map((module: Module) => ({
          ...module,
          description: module.description || getCultureDescription(module.name),
        }));

        setCultureModules(modulesWithDescriptions);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching culture modules:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };

    fetchCultureModules();
  }, []);

  // Get culture description - this would come from the API in production
  const getCultureDescription = (cultureName: string): string => {
    switch (cultureName) {
      case 'Terran Federation':
        return 'The primary human interstellar government, known for its strong democratic values and military prowess.';
      case 'Stellar Nomads':
        return 'Communities that live their entire lives aboard massive generation ships, with unique cultures based on self-sufficiency and technological adaptation.';
      case 'Corporate Citizens':
        return 'People raised within the powerful megacorporations that span multiple star systems, valuing efficiency and technological advancement.';
      case 'Fringe Colonists':
        return 'Hardy pioneers who live on the outskirts of civilized space, developing strong independence and survival skills.';
      case 'Void Monks':
        return 'Spiritual communities who seek enlightenment through the study of space phenomena and isolation in deep space monasteries.';
      default:
        return 'A cultural group with its own customs, traditions, and perspectives on interstellar society.';
    }
  };

  // Handler for culture selection
  const handleCultureSelect = (cultureName: string) => {
    const selectedModule = cultureModules.find(module => module.name === cultureName);
    if (selectedModule) {
      console.log("Selected culture module in CultureSelection:", selectedModule);
      onSelectCulture(cultureName, selectedModule);
    } else {
      console.error(`Could not find culture module for culture: ${cultureName}`);
    }
  };

  // Get culture portrait URL
  const getCulturePortraitUrl = (cultureName: string): string => {
    return `/assets/cultures/${cultureName.toLowerCase().replace(/\s+/g, '_')}.png`;
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
          Loading culture options...
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
        <div>Error loading culture options: {error}</div>
        <div style={{ marginTop: '1rem' }}>Using default cultures instead.</div>
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
          Culture Selection
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
          {/* Culture selection grid */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', 
              gap: '1rem' 
            }}
          >
            {cultureModules.map((module) => (
              <button
                key={module.name}
                type="button"
                style={{
                  position: 'relative',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.375rem',
                  backgroundColor:
                    selectedCulture === module.name
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
                onClick={() => handleCultureSelect(module.name)}
              >
                <span>{module.name}</span>
               
                
   
              </button>
            ))}
          </div>

          {/* Culture description */}
          <div
            style={{
              backgroundColor: 'var(--color-dark-elevated)',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginTop: '1rem',
            }}
          >
            {selectedCulture ? (
              <>
                <h3
                  style={{
                    color: 'var(--color-white)',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem',
                  }}
                >
                  {selectedCulture}
                </h3>
                <p style={{ color: 'var(--color-cloud)' }}>
                  {cultureModules.find((module) => module.name === selectedCulture)?.description ||
                    'Select a culture to see information'}
                </p>

                {/* Display first tier culture traits for the selected culture */}
                {selectedCulture && (
                  <div style={{ marginTop: '1rem' }}>
                    <h4
                      style={{
                        color: 'var(--color-metal-gold)',
                        fontSize: '1rem',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Cultural Traits
                    </h4>
                    <div>
                      {cultureModules
                        .find((module) => module.name === selectedCulture)
                        ?.options.filter((option) => option.location === '1')
                        .map((option) => (
                          <div
                            key={option.name}
                            style={{
                              backgroundColor: 'rgba(85, 65, 130, 0.2)',
                              padding: '0.5rem',
                              borderRadius: '0.25rem',
                              marginBottom: '0.5rem',
                            }}
                          >
                            <div
                              style={{
                                fontWeight: 'bold',
                                color: 'var(--color-white)',
                                marginBottom: '0.25rem',
                              }}
                            >
                              {option.name}
                            </div>
                            <div style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>
                              {option.description}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p style={{ color: 'var(--color-cloud)' }}>Select a culture to see information</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CultureSelection;
import React, { useState, useEffect } from 'react';
import { Module } from '../../types/character';

interface CultureSelectionProps {
  selectedCulture: string;
  onSelectCulture: (culture: string, cultureModule: Module) => void;
}

const CultureSelection: React.FC<CultureSelectionProps> = ({
  selectedCulture,
  onSelectCulture,
}) => {
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
        console.log('Fetched culture modules in CultureSelection:', data);

        setCultureModules(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching culture modules:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };

    fetchCultureModules();
  }, []);

  // Handler for culture selection
  const handleCultureSelect = (cultureName: string) => {
    const selectedModule = cultureModules.find((module) => module.name === cultureName);
    if (selectedModule) {
      console.log('Selected culture module in CultureSelection:', selectedModule);
      onSelectCulture(cultureName, selectedModule);
    } else {
      console.error(`Could not find culture module for culture: ${cultureName}`);
    }
  };

  // Get culture description
  const getCultureDescription = (module: Module): string => {
    // First check if the module has a description property
    if (module.description && module.description.trim() !== '') {
      return module.description;
    }

    // If not, check if any of the tier 1 options have a description
    const tier1Option = module.options.find((option) => option.location === '1');
    if (tier1Option && tier1Option.description && tier1Option.description.trim() !== '') {
      return tier1Option.description;
    }

    // Fallback to a generic description
    return `The ${module.name} culture has its own customs, traditions, and perspectives on interstellar society.`;
  };

  // Get the description of the currently selected culture
  const getSelectedCultureDescription = (): string => {
    if (!selectedCulture) return 'Select a culture to see information';

    const selectedModule = cultureModules.find((module) => module.name === selectedCulture);
    if (!selectedModule) return 'Select a culture to see information';

    return getCultureDescription(selectedModule);
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
              gap: '1rem',
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
                <p style={{ color: 'var(--color-cloud)' }}>{getSelectedCultureDescription()}</p>

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

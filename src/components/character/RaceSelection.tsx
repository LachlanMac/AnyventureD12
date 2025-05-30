// src/components/character/RaceSelection.tsx (Modified)
import React, { useState, useEffect } from 'react';
import { RacialModule } from '../../types/character';

interface RaceSelectionProps {
  selectedRace: string;
  onSelectRace: (race: string, racialModule: RacialModule) => void;
}

const RaceSelection: React.FC<RaceSelectionProps> = ({ selectedRace, onSelectRace }) => {
  const [racialModules, setRacialModules] = useState<RacialModule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<boolean>(true);

  useEffect(() => {
    const fetchRacialModules = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/modules/type/racial');

        if (!response.ok) {
          throw new Error('Failed to fetch racial modules');
        }

        const data = await response.json();
        console.log('Fetched racial modules in RaceSelection:', data);

        // Add description field to each module if needed
        const modulesWithDescriptions = data.map((module: RacialModule) => ({
          ...module,
          description: module.description || getRaceDescription(module.name),
        }));

        setRacialModules(modulesWithDescriptions);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching racial modules:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };

    fetchRacialModules();
  }, []);

  // Get race description - this would come from the API in production
  const getRaceDescription = (raceName: string): string => {
    switch (raceName) {
      case 'Human':
        return 'Adaptable and innovative, humans are versatile explorers who have spread throughout the galaxy, establishing colonies and trade networks.';
      case 'Jhen':
        return 'Amphibious beings with enhanced sensory abilities, the Jhen are naturally attuned to water environments and excel at navigation and exploration.';
      case 'Protoelf':
        return 'Descendants of ancient genetic engineers, Protoelves have enhanced reflexes and mental capabilities along with extended lifespans.';
      case 'Vxyahlian':
        return 'Insect-like beings with exoskeletons and heightened engineering skills, Vxyahlians are natural builders and technologists.';
      case 'Zssesh':
        return 'Reptilian species with natural resilience to harsh environments, the Zssesh have remarkable regenerative capabilities and physical endurance.';
      default:
        return 'A mysterious species with unique physiologies and cultural perspectives, bringing diversity and unexpected approaches to challenges.';
    }
  };

  // Handler for race selection
  const handleRaceSelect = (raceName: string) => {
    const selectedModule = racialModules.find((module) => module.name === raceName);
    if (selectedModule) {
      console.log('Selected racial module in RaceSelection:', selectedModule);
      onSelectRace(raceName, selectedModule);
    } else {
      console.error(`Could not find racial module for race: ${raceName}`);
    }
  };

  // Get race portrait URL
  const getRacePortraitUrl = (raceName: string): string => {
    return `/assets/races/${raceName.toLowerCase()}.png`;
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
          Loading racial options...
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
        <div>Error loading racial options: {error}</div>
        <div style={{ marginTop: '1rem' }}>Using default races instead.</div>
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
          Ancestry Selection
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

      {/* Race selection grid - this is what gets collapsed */}
      {expanded && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
            gap: '1rem',
            marginBottom: '1rem',
          }}
        >
          {racialModules.map((module) => (
            <button
              key={module.name}
              type="button"
              style={{
                position: 'relative',
                padding: '0.75rem 1.5rem 0.75rem 1rem', // Reduced right padding to make room for portrait
                borderRadius: '0.375rem',
                backgroundColor:
                  selectedRace === module.name
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
              onClick={() => handleRaceSelect(module.name)}
            >
              <span style={{ maxWidth: 'calc(100% - 50px)' }}>{module.name}</span>
              <div
                style={{
                  position: 'absolute',
                  right: '0',
                  top: '0',
                  bottom: '0',
                  width: '50px', // Increased width for larger portrait
                  overflow: 'hidden',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderTopRightRadius: '0.375rem',
                  borderBottomRightRadius: '0.375rem',
                }}
              >
                <img
                  src={getRacePortraitUrl(module.name)}
                  alt={module.name}
                  onError={(e) => {
                    // Fallback for missing images
                    e.currentTarget.src = '/assets/races/default.png';
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Race description - this always shows if a race is selected */}
      <div
        style={{
          backgroundColor: 'var(--color-dark-elevated)',
          borderRadius: '0.5rem',
          padding: '1rem',
        }}
      >
        {selectedRace ? (
          <>
            <h3
              style={{
                color: 'var(--color-white)',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
              }}
            >
              {selectedRace}
            </h3>
            <p style={{ color: 'var(--color-cloud)' }}>
              {racialModules.find((module) => module.name === selectedRace)?.description ||
                'Select a race to see information'}
            </p>

            {/* Display first tier racial traits for the selected race */}
            <div style={{ marginTop: '1rem' }}>
              <h4
                style={{
                  color: 'var(--color-metal-gold)',
                  fontSize: '1rem',
                  marginBottom: '0.5rem',
                }}
              >
                Racial Traits
              </h4>
              <div>
                {racialModules
                  .find((module) => module.name === selectedRace)
                  ?.options.map((option) => (
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
          </>
        ) : (
          <p style={{ color: 'var(--color-cloud)' }}>Select a race to see information</p>
        )}
      </div>
    </div>
  );
};

export default RaceSelection;

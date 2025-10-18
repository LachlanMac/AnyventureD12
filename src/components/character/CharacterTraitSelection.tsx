import React, { useState, useEffect } from 'react';
import { CharacterTrait } from '../../types/character';
import { useToast } from '../../context/ToastContext';

interface CharacterTraitSelectionProps {
  selectedTrait: string;
  onSelectTrait: (traitId: string) => void;
  onValidateTraitChange?: (
    fromTraitId: string,
    toTraitId: string
  ) => Promise<{ valid: boolean; error?: string }>;
}

const CharacterTraitSelection: React.FC<CharacterTraitSelectionProps> = ({
  selectedTrait,
  onSelectTrait,
  onValidateTraitChange,
}) => {
  const [traits, setTraits] = useState<CharacterTrait[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<boolean>(true);
  const { showError } = useToast();

  useEffect(() => {
    const fetchTraits = async () => {
      try {
        const response = await fetch('/api/traits');
        if (!response.ok) {
          throw new Error('Failed to fetch traits');
        }
        const data = await response.json();

        // Filter out progression traits that should only be available through module points
        const characterCreationTraits = data.filter((trait: any) =>
          trait.source !== 'module_points' && trait.name !== 'Extra Training'
        );

        setTraits(characterCreationTraits);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load traits');
        setLoading(false);
      }
    };

    fetchTraits();
  }, []);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const handleTraitSelect = async (traitId: string) => {
    // If deselecting or no validation function, just proceed
    if (traitId === selectedTrait || !onValidateTraitChange) {
      onSelectTrait(traitId);
      return;
    }

    // Validate the trait change
    const validation = await onValidateTraitChange(selectedTrait, traitId);
    if (validation.valid) {
      onSelectTrait(traitId);
    } else {
      // Show error message using toast system
      showError(validation.error || 'Cannot change trait at this time.');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
        <div style={{ marginTop: '1rem', color: 'var(--color-cloud)' }}>
          Loading trait options...
        </div>
      </div>
    );
  }

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
        <div>Error loading trait options: {error}</div>
        <div style={{ marginTop: '1rem' }}>Please refresh the page to try again.</div>
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
          Character Trait Selection
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

      {/* Trait selection grid - this is what gets collapsed */}
      {expanded && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1rem',
            marginBottom: '1rem',
          }}
        >
          {traits.map((trait) => (
            <button
              key={trait._id}
              type="button"
              style={{
                position: 'relative',
                padding: '0.75rem 1rem',
                borderRadius: '0.375rem',
                backgroundColor:
                  selectedTrait === trait._id
                    ? 'var(--color-sat-purple)'
                    : 'var(--color-dark-elevated)',
                color: 'var(--color-white)',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textAlign: 'left',
              }}
              onClick={() => handleTraitSelect(trait._id)}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 'bold',
                    marginBottom: '0.25rem',
                  }}
                >
                  {trait.name}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-cloud)',
                    textTransform: 'capitalize',
                  }}
                >
                  {trait.type}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Trait description - this always shows if a trait is selected */}
      <div
        style={{
          backgroundColor: 'var(--color-dark-elevated)',
          borderRadius: '0.5rem',
          padding: '1rem',
        }}
      >
        {selectedTrait ? (
          <>
            {(() => {
              const selectedTraitData = traits.find((trait) => trait._id === selectedTrait);
              return selectedTraitData ? (
                <>
                  <h3
                    style={{
                      color: 'var(--color-white)',
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {selectedTraitData.name}
                  </h3>
                  <p style={{ color: 'var(--color-cloud)', marginBottom: '1rem' }}>
                    {selectedTraitData.description}
                  </p>

                  {/* Display trait benefits */}
                  <div style={{ marginTop: '1rem' }}>
                    <h4
                      style={{
                        color: 'var(--color-metal-gold)',
                        fontSize: '1rem',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Trait Benefits
                    </h4>
                    <div>
                      {selectedTraitData.options.map((option, index) => (
                        <div
                          key={index}
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
                          <div
                            style={{
                              color: 'var(--color-cloud)',
                              fontSize: '0.875rem',
                            }}
                          >
                            {option.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <p style={{ color: 'var(--color-cloud)' }}>Trait not found</p>
              );
            })()}
          </>
        ) : (
          <>
            <h3
              style={{
                color: 'var(--color-white)',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
              }}
            >
              Select a Character Trait
            </h3>
            <p style={{ color: 'var(--color-cloud)' }}>
              Choose a trait that represents your character's unique background or condition. This
              trait provides permanent bonuses to your character.
            </p>
            {traits.length === 0 && (
              <div
                style={{
                  color: 'var(--color-cloud)',
                  textAlign: 'center',
                  padding: '1rem',
                  marginTop: '1rem',
                  backgroundColor: 'rgba(152, 94, 109, 0.2)',
                  borderRadius: '0.25rem',
                }}
              >
                No traits available
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CharacterTraitSelection;

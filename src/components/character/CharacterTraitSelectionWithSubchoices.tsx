import React, { useState, useEffect } from 'react';
import { CharacterTrait } from '../../types/character';
import { useToast } from '../../context/ToastContext';

interface CharacterTraitSelectionProps {
  selectedTrait: string;
  onSelectTrait: (traitId: string, selectedOptions?: any[]) => void;
  onValidateTraitChange?: (
    fromTraitId: string,
    toTraitId: string
  ) => Promise<{ valid: boolean; error?: string }>;
}

const CharacterTraitSelectionWithSubchoices: React.FC<CharacterTraitSelectionProps> = ({
  selectedTrait,
  onSelectTrait,
  onValidateTraitChange,
}) => {
  const [traits, setTraits] = useState<CharacterTrait[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<boolean>(true);
  const [subchoiceSelections, setSubchoiceSelections] = useState<Record<string, string>>({});
  const { showError } = useToast();

  useEffect(() => {
    const fetchTraits = async () => {
      try {
        const response = await fetch('/api/traits');
        if (!response.ok) {
          throw new Error('Failed to fetch traits');
        }
        const data = await response.json();
        setTraits(data);

        // Auto-select "Born to Adventure" as default if no trait is selected
        if (!selectedTrait) {
          const bornToAdventure = data.find((trait: any) => trait.name === 'Born to Adventure');
          if (bornToAdventure) {
            const selectedOptions = bornToAdventure.options?.map((option: any) => ({
              name: option.name,
              selectedSubchoice: null,
            })) || [];
            onSelectTrait(bornToAdventure._id, selectedOptions);
          }
        }

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
    // If deselecting
    if (traitId === selectedTrait) {
      onSelectTrait('');
      setSubchoiceSelections({});
      return;
    }


    // If validation function exists
    if (onValidateTraitChange) {
      const validation = await onValidateTraitChange(selectedTrait, traitId);
      if (!validation.valid) {
        showError(validation.error || 'Cannot change trait at this time.');
        return;
      }
    }

    // Get selected trait options with subchoices
    const trait = traits.find(t => t._id === traitId);
    if (trait) {
      const selectedOptions = trait.options?.map(option => {
        const subchoiceValue = subchoiceSelections[option.name];
        return {
          name: option.name,
          selectedSubchoice: subchoiceValue || null,
        };
      }) || [];

      onSelectTrait(traitId, selectedOptions);
    } else {
      onSelectTrait(traitId);
    }
  };

  const handleSubchoiceSelect = (optionName: string, subchoiceId: string) => {
    setSubchoiceSelections((prev) => {
      const newSelections = {
        ...prev,
        [optionName]: subchoiceId,
      };

      // Re-trigger trait selection to update with new subchoice
      if (selectedTrait) {
        const trait = traits.find(t => t._id === selectedTrait);
        if (trait) {
          const selectedOptions = trait.options?.map(option => {
            const subchoiceValue = newSelections[option.name];
            return {
              name: option.name,
              selectedSubchoice: subchoiceValue || null,
            };
          }) || [];

          onSelectTrait(selectedTrait, selectedOptions);
        }
      }

      return newSelections;
    });
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

                  {/* Display trait options */}
                  <div style={{ marginTop: '1rem' }}>
                    <h4
                      style={{
                        color: 'var(--color-metal-gold)',
                        fontSize: '1rem',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Trait Options
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

                          {/* Subchoice dropdown */}
                          {option.subchoices && option.subchoices.length > 0 && (
                            <div style={{ marginTop: '0.5rem' }}>
                              <label
                                style={{
                                  display: 'block',
                                  color: 'var(--color-metal-gold)',
                                  fontSize: '0.75rem',
                                  marginBottom: '0.25rem',
                                }}
                              >
                                Choose {option.choiceType || 'variant'}:
                              </label>
                              <select
                                value={subchoiceSelections[option.name] || ''}
                                onChange={(e) => handleSubchoiceSelect(option.name, e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '0.375rem',
                                  backgroundColor: 'var(--color-dark-elevated)',
                                  color: 'var(--color-white)',
                                  border: '1px solid var(--color-dark-border)',
                                  borderRadius: '0.25rem',
                                  fontSize: '0.875rem',
                                }}
                              >
                                <option value="">Select...</option>
                                {option.subchoices.map((subchoice) => (
                                  <option key={subchoice.id} value={subchoice.id}>
                                    {subchoice.name}
                                  </option>
                                ))}
                              </select>
                              {/* Show selected subchoice description */}
                              {subchoiceSelections[option.name] && (
                                <div
                                  style={{
                                    marginTop: '0.25rem',
                                    padding: '0.5rem',
                                    backgroundColor: 'rgba(215, 183, 64, 0.1)',
                                    borderRadius: '0.25rem',
                                    fontSize: '0.875rem',
                                    color: 'var(--color-cloud)',
                                    lineHeight: '1.4',
                                  }}
                                >
                                  {
                                    option.subchoices.find(
                                      (sc) => sc.id === subchoiceSelections[option.name]
                                    )?.description
                                  }
                                </div>
                              )}
                            </div>
                          )}
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

export default CharacterTraitSelectionWithSubchoices;
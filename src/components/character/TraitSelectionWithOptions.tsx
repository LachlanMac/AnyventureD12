import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Card, { CardHeader, CardBody } from '../ui/Card';

// Define interfaces
interface Subchoice {
  id: string;
  name: string;
  description: string;
  data: string;
}

interface TraitOption {
  name: string;
  description: string;
  data: string;
  subchoices?: Subchoice[];
  requiresChoice?: boolean;
  choiceType?: string;
  selectedSubchoice?: string;
}

interface Trait {
  _id: string;
  name: string;
  type?: 'positive' | 'negative';
  description: string;
  options: TraitOption[];
}

interface TraitSelectionProps {
  selectedTraits: Trait[];
  onSelectTrait: (trait: Trait) => void;
  onDeselectTrait: (traitId: string) => void;
  availableModulePoints: number;
}

const TraitSelectionWithOptions: React.FC<TraitSelectionProps> = ({
  selectedTraits,
  onSelectTrait,
  onDeselectTrait,
}) => {
  const [availableTraits, setAvailableTraits] = useState<Trait[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [subchoiceSelections, setSubchoiceSelections] = useState<Record<string, Record<string, string>>>({});

  // Fetch traits data
  useEffect(() => {
    const fetchTraits = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/traits');
        if (!response.ok) {
          throw new Error('Failed to fetch traits');
        }
        const data = await response.json();
        setAvailableTraits(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching traits:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };

    fetchTraits();
  }, []);

  // Filter traits based on search term
  const filteredTraits = availableTraits.filter(
    (trait) =>
      trait.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trait.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if a trait is selected
  const isTraitSelected = (traitId: string) => {
    return selectedTraits.some((t) => t._id === traitId);
  };

  // Handle trait selection
  const handleTraitSelection = (trait: Trait) => {
    if (isTraitSelected(trait._id)) {
      onDeselectTrait(trait._id);
      // Clear subchoice selections for this trait
      setSubchoiceSelections((prev) => {
        const newSelections = { ...prev };
        delete newSelections[trait._id];
        return newSelections;
      });
      return;
    }

    // Check if max traits reached
    if (selectedTraits.length >= 3) {
      return;
    }

    // Apply subchoice selections to the trait
    const traitWithSubchoices = {
      ...trait,
      options: trait.options.map((option) => {
        const subchoiceValue = subchoiceSelections[trait._id]?.[option.name];
        return {
          ...option,
          selectedSubchoice: subchoiceValue || undefined,
        };
      }),
    };

    onSelectTrait(traitWithSubchoices);
  };

  // Handle subchoice selection
  const handleSubchoiceSelect = (traitId: string, optionName: string, subchoiceId: string) => {
    setSubchoiceSelections((prev) => {
      const newSelections = {
        ...prev,
        [traitId]: {
          ...prev[traitId],
          [optionName]: subchoiceId,
        },
      };

      // Re-trigger trait selection if it's already selected
      const selectedTrait = selectedTraits.find((t) => t._id === traitId);
      if (selectedTrait) {
        const originalTrait = availableTraits.find((t) => t._id === traitId);
        if (originalTrait) {
          const traitWithSubchoices = {
            ...originalTrait,
            options: originalTrait.options.map((option) => {
              const subchoiceValue = newSelections[traitId]?.[option.name];
              return {
                ...option,
                selectedSubchoice: subchoiceValue || undefined,
              };
            }),
          };
          // Remove and re-add to update
          onDeselectTrait(traitId);
          setTimeout(() => onSelectTrait(traitWithSubchoices), 0);
        }
      }

      return newSelections;
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: '2rem',
          backgroundColor: 'rgba(152, 94, 109, 0.2)',
          borderRadius: '0.5rem',
          border: '1px solid var(--color-sunset)',
          color: 'var(--color-white)',
          textAlign: 'center',
        }}
      >
        <h2 style={{ marginBottom: '1rem' }}>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

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
        <h2
          style={{
            color: 'var(--color-white)',
            fontSize: '1.5rem',
            fontWeight: 'bold',
          }}
        >
          Character Traits
        </h2>

        <div
          style={{
            backgroundColor: 'var(--color-dark-elevated)',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            color: selectedTraits.length === 3 ? 'var(--color-metal-gold)' : 'var(--color-cloud)',
          }}
        >
          Traits Selected: <span style={{ fontWeight: 'bold' }}>{selectedTraits.length}</span> / 3
        </div>
      </div>

      <div
        style={{
          padding: '1rem',
          backgroundColor: 'var(--color-dark-elevated)',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
          color: 'var(--color-cloud)',
        }}
      >
        <p>Select traits to define your character's unique abilities and characteristics.</p>
      </div>

      {/* Available Traits Section */}
      <Card variant="default" style={{ marginBottom: '1.5rem' }}>
        <CardHeader>
          <h3
            style={{
              color: 'var(--color-metal-gold)',
              fontSize: '1.25rem',
              fontWeight: 'bold',
            }}
          >
            Available Traits
          </h3>
        </CardHeader>

        <CardBody>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Search traits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: 'var(--color-dark-elevated)',
                color: 'var(--color-white)',
                border: '1px solid var(--color-dark-border)',
                borderRadius: '0.375rem',
                padding: '0.5rem 0.75rem',
              }}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '0.5rem',
            }}
          >
            {filteredTraits.map((trait) => {
              const isSelected = isTraitSelected(trait._id);
              const canSelect = !isSelected && selectedTraits.length < 3;

              return (
                <div
                  key={trait._id}
                  onClick={() => canSelect && handleTraitSelection(trait)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '0.375rem',
                    backgroundColor: isSelected
                      ? 'var(--color-sat-purple-faded)'
                      : 'var(--color-dark-elevated)',
                    border: isSelected
                      ? '2px solid var(--color-metal-gold)'
                      : '1px solid var(--color-dark-border)',
                    cursor: canSelect ? 'pointer' : isSelected ? 'default' : 'not-allowed',
                    opacity: canSelect || isSelected ? 1 : 0.5,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      color: 'var(--color-white)',
                      fontWeight: 'bold',
                      fontSize: '0.875rem',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {trait.name}
                  </div>
                  <div
                    style={{
                      color: 'var(--color-cloud)',
                      fontSize: '0.75rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {trait.description}
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Selected Traits Section */}
      <Card variant="default">
        <CardHeader>
          <h3
            style={{
              color: 'var(--color-white)',
              fontSize: '1.25rem',
              fontWeight: 'bold',
            }}
          >
            Selected Traits
          </h3>
        </CardHeader>

        <CardBody>
          {selectedTraits.length === 0 ? (
            <div
              style={{
                color: 'var(--color-cloud)',
                padding: '1rem',
                textAlign: 'center',
              }}
            >
              No traits selected yet. Choose traits from the list above.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {selectedTraits.map((trait) => (
                <div
                  key={trait._id}
                  style={{
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    backgroundColor: 'var(--color-dark-elevated)',
                    border: '1px solid var(--color-metal-gold)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <h4
                      style={{
                        color: 'var(--color-metal-gold)',
                        fontWeight: 'bold',
                      }}
                    >
                      {trait.name}
                    </h4>

                    <Button variant="outline" size="sm" onClick={() => onDeselectTrait(trait._id)}>
                      Remove
                    </Button>
                  </div>

                  <div style={{ color: 'var(--color-cloud)', marginBottom: '0.75rem' }}>
                    {trait.description}
                  </div>

                  {/* Trait Options */}
                  {trait.options && trait.options.length > 0 && (
                    <div>
                      <h5
                        style={{
                          color: 'var(--color-white)',
                          fontSize: '0.875rem',
                          fontWeight: 'bold',
                          marginBottom: '0.5rem',
                        }}
                      >
                        Trait Options
                      </h5>
                      {trait.options.map((option) => (
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
                              fontSize: '0.875rem',
                            }}
                          >
                            {option.name}
                          </div>
                          <div style={{ color: 'var(--color-cloud)', fontSize: '0.75rem' }}>
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
                                value={subchoiceSelections[trait._id]?.[option.name] || ''}
                                onChange={(e) =>
                                  handleSubchoiceSelect(trait._id, option.name, e.target.value)
                                }
                                style={{
                                  width: '100%',
                                  padding: '0.375rem',
                                  backgroundColor: 'var(--color-dark-elevated)',
                                  color: 'var(--color-white)',
                                  border: '1px solid var(--color-dark-border)',
                                  borderRadius: '0.25rem',
                                  fontSize: '0.75rem',
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
                              {subchoiceSelections[trait._id]?.[option.name] && (
                                <div
                                  style={{
                                    marginTop: '0.25rem',
                                    padding: '0.5rem',
                                    backgroundColor: 'rgba(215, 183, 64, 0.1)',
                                    borderRadius: '0.25rem',
                                    fontSize: '0.75rem',
                                    color: 'var(--color-cloud)',
                                    lineHeight: '1.4',
                                  }}
                                >
                                  {
                                    option.subchoices.find(
                                      (sc) => sc.id === subchoiceSelections[trait._id]?.[option.name]
                                    )?.description
                                  }
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {selectedTraits.length < 3 && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.75rem',
                backgroundColor: 'rgba(85, 65, 130, 0.2)',
                borderRadius: '0.375rem',
                color: 'var(--color-cloud)',
                fontStyle: 'italic',
                textAlign: 'center',
              }}
            >
              Please select {3 - selectedTraits.length} more trait
              {selectedTraits.length === 2 ? '' : 's'} to continue.
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default TraitSelectionWithOptions;
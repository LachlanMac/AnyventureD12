import React, { useState, useEffect } from 'react';
import { Culture } from '../../types/character';

interface CultureSelectionProps {
  selectedCulture: string;
  onSelectCulture: (culture: string, cultureData: Culture & { 
    selectedRestriction?: any;
    selectedBenefit?: any;
    selectedStartingItem?: any;
    selectedOption?: any;
  }) => void;
}

const CultureSelection: React.FC<CultureSelectionProps> = ({
  selectedCulture,
  onSelectCulture,
}) => {
  const [cultures, setCultures] = useState<Culture[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<boolean>(true);
  const [cultureSelections, setCultureSelections] = useState<{
    restriction?: any;
    benefit?: any;
    startingItem?: any;
    option?: any;
  }>({});

  useEffect(() => {
    const fetchCultures = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/cultures');

        if (!response.ok) {
          throw new Error('Failed to fetch cultures');
        }

        const data = await response.json();

        setCultures(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };

    fetchCultures();
  }, []);

  // Handler for culture selection
  const handleCultureSelect = (cultureName: string) => {
    const selectedCultureData = cultures.find((culture) => culture.name === cultureName);
    if (selectedCultureData) {
      // Reset selections when changing cultures
      setCultureSelections({});
      
      const cultureWithSelections = {
        ...selectedCultureData,
        selectedRestriction: cultureSelections.restriction,
        selectedBenefit: cultureSelections.benefit,
        selectedStartingItem: cultureSelections.startingItem,
        selectedOption: cultureSelections.option,
      };
      onSelectCulture(cultureName, cultureWithSelections);
    }
  };

  // Handlers for individual selections
  const handleRestrictionSelect = (restriction: any) => {
    const newSelections = { ...cultureSelections, restriction };
    setCultureSelections(newSelections);
    updateCultureWithSelections(newSelections);
  };

  const handleBenefitSelect = (benefit: any) => {
    const newSelections = { ...cultureSelections, benefit };
    setCultureSelections(newSelections);
    updateCultureWithSelections(newSelections);
  };

  const handleStartingItemSelect = (startingItem: any) => {
    const newSelections = { ...cultureSelections, startingItem };
    setCultureSelections(newSelections);
    updateCultureWithSelections(newSelections);
  };

  // Update parent with current selections
  const updateCultureWithSelections = (selections: any) => {
    if (selectedCulture) {
      const selectedCultureData = cultures.find((culture) => culture.name === selectedCulture);
      if (selectedCultureData) {
        const cultureWithSelections = {
          ...selectedCultureData,
          selectedRestriction: selections.restriction,
          selectedBenefit: selections.benefit,
          selectedStartingItem: selections.startingItem,
          selectedOption: selections.option,
        };
        onSelectCulture(selectedCulture, cultureWithSelections);
      }
    }
  };

  // Get culture description
  const getCultureDescription = (culture: Culture): string => {
    // Check if the culture has a description property
    if (culture.description && culture.description.trim() !== '') {
      return culture.description;
    }

    // Fallback to a generic description
    return `The ${culture.name} culture has its own customs, traditions, and perspectives on society.`;
  };

  // Get the description of the currently selected culture
  const getSelectedCultureDescription = (): string => {
    if (!selectedCulture) return 'Select a culture to see information';

    const selected = cultures.find((culture) => culture.name === selectedCulture);
    if (!selected) return 'Select a culture to see information';

    return getCultureDescription(selected);
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
            {cultures.map((culture) => (
              <button
                key={culture.name}
                type="button"
                style={{
                  position: 'relative',
                  padding: '0.75rem 1.5rem 0.75rem 1rem', // Reduced right padding to make room for portrait
                  borderRadius: '0.375rem',
                  backgroundColor:
                    selectedCulture === culture.name
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
                onClick={() => handleCultureSelect(culture.name)}
              >
                <span style={{ maxWidth: 'calc(100% - 50px)' }}>{culture.name}</span>
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
                    src={culture.portrait || '/assets/cultures/default.png'}
                    alt={culture.name}
                    onError={(e) => {
                      // Fallback for missing images
                      e.currentTarget.src = '/assets/cultures/default.png';
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

                {/* Display culture selection options */}
                {selectedCulture && (
                  <div style={{ marginTop: '1rem' }}>
                    {(() => {
                      const culture = cultures.find((c) => c.name === selectedCulture);
                      if (!culture) return null;

                      return (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                          {/* Cultural Restrictions */}
                          <div>
                            <h4 style={{ color: 'var(--color-danger)', fontSize: '1rem', marginBottom: '0.5rem' }}>
                              Cultural Restriction
                            </h4>
                            <div
                              style={{
                                padding: '0.75rem',
                                borderRadius: '0.375rem',
                                backgroundColor: 'rgba(152, 94, 109, 0.2)',
                                color: 'var(--color-white)',
                              }}
                            >
                              <label
                                style={{
                                  display: 'block',
                                  color: 'var(--color-metal-gold)',
                                  fontSize: '0.75rem',
                                  marginBottom: '0.25rem',
                                }}
                              >
                                Choose Cultural Restriction:
                              </label>
                              <select
                                value={cultureSelections.restriction?.name || ''}
                                onChange={(e) => {
                                  const selectedRestriction = culture.culturalRestrictions?.find(
                                    (r: any) => r.name === e.target.value
                                  );
                                  handleRestrictionSelect(selectedRestriction);
                                }}
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
                                {culture.culturalRestrictions?.map((restriction: any, index: number) => (
                                  <option key={index} value={restriction.name}>
                                    {restriction.name}
                                  </option>
                                ))}
                              </select>
                              {cultureSelections.restriction && (
                                <div
                                  style={{
                                    marginTop: '0.5rem',
                                    fontSize: '0.875rem',
                                    color: 'var(--color-cloud)',
                                    lineHeight: '1.4',
                                  }}
                                >
                                  {cultureSelections.restriction.description}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Benefits */}
                          <div>
                            <h4 style={{ color: 'var(--color-success)', fontSize: '1rem', marginBottom: '0.5rem' }}>
                              Cultural Benefit
                            </h4>
                            <div
                              style={{
                                padding: '0.75rem',
                                borderRadius: '0.375rem',
                                backgroundColor: 'rgba(114, 148, 120, 0.2)',
                                color: 'var(--color-white)',
                              }}
                            >
                              <label
                                style={{
                                  display: 'block',
                                  color: 'var(--color-metal-gold)',
                                  fontSize: '0.75rem',
                                  marginBottom: '0.25rem',
                                }}
                              >
                                Choose Cultural Benefit:
                              </label>
                              <select
                                value={cultureSelections.benefit?.name || ''}
                                onChange={(e) => {
                                  const selectedBenefit = culture.benefits?.find(
                                    (b: any) => b.name === e.target.value
                                  );
                                  handleBenefitSelect(selectedBenefit);
                                }}
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
                                {culture.benefits?.map((benefit: any, index: number) => (
                                  <option key={index} value={benefit.name}>
                                    {benefit.name}
                                  </option>
                                ))}
                              </select>
                              {cultureSelections.benefit && (
                                <div
                                  style={{
                                    marginTop: '0.5rem',
                                    fontSize: '0.875rem',
                                    color: 'var(--color-cloud)',
                                    lineHeight: '1.4',
                                  }}
                                >
                                  {cultureSelections.benefit.description}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Starting Items */}
                          <div>
                            <h4 style={{ color: 'var(--color-metal-gold)', fontSize: '1rem', marginBottom: '0.5rem' }}>
                              Starting Equipment
                            </h4>
                            <div
                              style={{
                                padding: '0.75rem',
                                borderRadius: '0.375rem',
                                backgroundColor: 'rgba(215, 183, 64, 0.2)',
                                color: 'var(--color-white)',
                              }}
                            >
                              <label
                                style={{
                                  display: 'block',
                                  color: 'var(--color-metal-gold)',
                                  fontSize: '0.75rem',
                                  marginBottom: '0.25rem',
                                }}
                              >
                                Choose Starting Equipment:
                              </label>
                              <select
                                value={cultureSelections.startingItem?.name || ''}
                                onChange={(e) => {
                                  const selectedItem = culture.startingItems?.find(
                                    (i: any) => i.name === e.target.value
                                  );
                                  handleStartingItemSelect(selectedItem);
                                }}
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
                                {culture.startingItems?.map((item: any, index: number) => (
                                  <option key={index} value={item.name}>
                                    {item.name}
                                  </option>
                                ))}
                              </select>
                              {cultureSelections.startingItem && (
                                <div
                                  style={{
                                    marginTop: '0.5rem',
                                    fontSize: '0.875rem',
                                    color: 'var(--color-cloud)',
                                    lineHeight: '1.4',
                                  }}
                                >
                                  {cultureSelections.startingItem.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
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

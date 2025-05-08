import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';

// Define Trait interface
interface Trait {
  _id: string;
  name: string;
  type: 'positive' | 'negative';
  description: string;
}

// Props for the TraitSelection component
interface TraitSelectionProps {
  selectedTraits: Trait[];
  onSelectTrait: (trait: Trait) => void;
  onDeselectTrait: (traitId: string) => void;
  availableModulePoints: number;
}

const TraitSelection: React.FC<TraitSelectionProps> = ({
  selectedTraits,
  onSelectTrait,
  onDeselectTrait,
  availableModulePoints,
}) => {
  const [positiveTraits, setPositiveTraits] = useState<Trait[]>([]);
  const [negativeTraits, setNegativeTraits] = useState<Trait[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search filters
  const [positiveSearchTerm, setPositiveSearchTerm] = useState<string>('');
  const [negativeSearchTerm, setNegativeSearchTerm] = useState<string>('');

  // Fetch traits data
  useEffect(() => {
    const fetchTraits = async () => {
      try {
        setLoading(true);

        // Fetch positive traits
        const positiveResponse = await fetch('/api/traits/type/positive');
        if (!positiveResponse.ok) {
          throw new Error('Failed to fetch positive traits');
        }
        const positiveData = await positiveResponse.json();

        // Fetch negative traits
        const negativeResponse = await fetch('/api/traits/type/negative');
        if (!negativeResponse.ok) {
          throw new Error('Failed to fetch negative traits');
        }
        const negativeData = await negativeResponse.json();

        setPositiveTraits(positiveData);
        setNegativeTraits(negativeData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching traits:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);

        // Use mock data if API fails
        // This is for development - in production, handle errors properly
        const mockPositiveTraits = getMockPositiveTraits();
        const mockNegativeTraits = getMockNegativeTraits();

        setPositiveTraits(mockPositiveTraits);
        setNegativeTraits(mockNegativeTraits);
      }
    };

    fetchTraits();
  }, []);

  // Filter traits based on search terms
  const filteredPositiveTraits = positiveTraits.filter(
    (trait) =>
      trait.name.toLowerCase().includes(positiveSearchTerm.toLowerCase()) ||
      trait.description.toLowerCase().includes(positiveSearchTerm.toLowerCase())
  );

  const filteredNegativeTraits = negativeTraits.filter(
    (trait) =>
      trait.name.toLowerCase().includes(negativeSearchTerm.toLowerCase()) ||
      trait.description.toLowerCase().includes(negativeSearchTerm.toLowerCase())
  );

  // Check if a trait is selected
  const isTraitSelected = (traitId: string) => {
    return selectedTraits.some((t) => t._id === traitId);
  };

  // Handle trait selection
  const handleTraitSelection = (trait: Trait) => {
    // If already selected, deselect it
    if (isTraitSelected(trait._id)) {
      onDeselectTrait(trait._id);
      return;
    }

    // Check if max traits reached
    if (selectedTraits.length >= 3) {
      return; // Max traits reached, cannot select more
    }

    // Check if enough module points for positive traits
    if (trait.type === 'positive' && availableModulePoints < 1) {
      return; // Not enough module points
    }

    // Select the trait
    onSelectTrait(trait);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error && positiveTraits.length === 0 && negativeTraits.length === 0) {
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
        <div style={{ marginTop: '1rem' }}>
          <Button variant="accent" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
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
        <p>
          Select 3 traits to define your character's unique strengths and weaknesses.
          <strong style={{ color: 'var(--color-metal-gold)' }}> Positive traits</strong> cost 1
          module point each, while
          <strong style={{ color: 'var(--color-sunset)' }}> negative traits</strong> are free.
        </p>
      </div>

      {/* Positive Traits Section */}
      <Card variant="default" style={{ marginBottom: '1.5rem' }}>
        <CardHeader>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3
              style={{
                color: 'var(--color-metal-gold)',
                fontSize: '1.25rem',
                fontWeight: 'bold',
              }}
            >
              Positive Traits
            </h3>

            <div style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>
              Cost: 1 module point each
            </div>
          </div>
        </CardHeader>

        <CardBody>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Search positive traits..."
              value={positiveSearchTerm}
              onChange={(e) => setPositiveSearchTerm(e.target.value)}
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
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '0.5rem',
            }}
          >
            {filteredPositiveTraits.map((trait) => {
              const isSelected = isTraitSelected(trait._id);
              const canSelect =
                !isSelected && selectedTraits.length < 3 && availableModulePoints >= 1;

              return (
                <div
                  key={trait._id}
                  onClick={() => handleTraitSelection(trait)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '0.375rem',
                    backgroundColor: isSelected
                      ? 'var(--color-sat-purple-faded)'
                      : 'var(--color-dark-elevated)',
                    border: isSelected
                      ? '1px solid var(--color-metal-gold)'
                      : '1px solid var(--color-dark-border)',
                    cursor: canSelect || isSelected ? 'pointer' : 'not-allowed',
                    opacity: canSelect || isSelected ? 1 : 0.5,
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      color: 'var(--color-white)',
                      fontWeight: 'bold',
                      fontSize: '0.875rem',
                    }}
                  >
                    {trait.name}
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Negative Traits Section */}
      <Card variant="default" style={{ marginBottom: '1.5rem' }}>
        <CardHeader>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3
              style={{
                color: 'var(--color-sunset)',
                fontSize: '1.25rem',
                fontWeight: 'bold',
              }}
            >
              Negative Traits
            </h3>

            <div style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>
              No module point cost
            </div>
          </div>
        </CardHeader>

        <CardBody>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Search negative traits..."
              value={negativeSearchTerm}
              onChange={(e) => setNegativeSearchTerm(e.target.value)}
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
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '0.5rem',
            }}
          >
            {filteredNegativeTraits.map((trait) => {
              const isSelected = isTraitSelected(trait._id);
              const canSelect = !isSelected && selectedTraits.length < 3;

              return (
                <div
                  key={trait._id}
                  onClick={() => handleTraitSelection(trait)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '0.375rem',
                    backgroundColor: isSelected
                      ? 'var(--color-sat-purple-faded)'
                      : 'var(--color-dark-elevated)',
                    border: isSelected
                      ? '1px solid var(--color-sunset)'
                      : '1px solid var(--color-dark-border)',
                    cursor: canSelect || isSelected ? 'pointer' : 'not-allowed',
                    opacity: canSelect || isSelected ? 1 : 0.5,
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      color: 'var(--color-white)',
                      fontWeight: 'bold',
                      fontSize: '0.875rem',
                    }}
                  >
                    {trait.name}
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
              No traits selected yet. Choose 3 traits from the lists above.
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
                    border:
                      trait.type === 'positive'
                        ? '1px solid var(--color-metal-gold)'
                        : '1px solid var(--color-sunset)',
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
                        color:
                          trait.type === 'positive'
                            ? 'var(--color-metal-gold)'
                            : 'var(--color-sunset)',
                        fontWeight: 'bold',
                      }}
                    >
                      {trait.name}
                    </h4>

                    <Button variant="outline" size="sm" onClick={() => onDeselectTrait(trait._id)}>
                      Remove
                    </Button>
                  </div>

                  <div style={{ color: 'var(--color-cloud)' }}>{trait.description}</div>
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

// Mock data for development - can be removed in production
const getMockPositiveTraits = (): Trait[] => [
  {
    _id: 'pos1',
    name: 'Tech Savvy',
    type: 'positive',
    description:
      'You have a natural affinity for technology. Gain advantage on all Technology checks and can reroll one failed Technology check per game session.',
  },
  {
    _id: 'pos2',
    name: 'Fearless',
    type: 'positive',
    description:
      'You are immune to fear effects and gain +1 to all Presence checks when attempting to intimidate or lead others in dangerous situations.',
  },
  {
    _id: 'pos3',
    name: 'Quick Reflexes',
    type: 'positive',
    description:
      'You have exceptionally fast reflexes. You gain +2 to Initiative and can reroll one Evade check per combat encounter.',
  },
  {
    _id: 'pos4',
    name: 'Natural Leader',
    type: 'positive',
    description:
      'Your natural charisma inspires others. Allies within 10 units gain +1 to their next roll after you succeed on a check with a roll of 18 or higher.',
  },
  {
    _id: 'pos5',
    name: 'Intuitive',
    type: 'positive',
    description:
      'You have a natural intuition about people and situations. Once per game session, you can ask the GM one yes/no question that your character would have no way of knowing.',
  },
];

const getMockNegativeTraits = (): Trait[] => [
  {
    _id: 'neg1',
    name: 'Social Anxiety Disorder',
    type: 'negative',
    description:
      'You have social anxiety disorder. If you roll a 1 on any dice during a social check, you lose 1 willpower. Additionally, until your next full rest, you always use the lowest dice roll on your social checks instead of the highest when rolling with talent bonuses.',
  },
  {
    _id: 'neg2',
    name: 'Phobia: Darkness',
    type: 'negative',
    description:
      'You have an intense fear of darkness. While in dark areas, you suffer disadvantage on all checks and must make a Resilience check (DC 15) each round or be unable to take actions other than moving toward a light source.',
  },
  {
    _id: 'neg3',
    name: 'Addiction',
    type: 'negative',
    description:
      'You are addicted to a substance. Every 24 hours without it, you suffer cumulative -1 penalties to all checks until you take a dose or complete a full detox (3 days of penalties).',
  },
  {
    _id: 'neg4',
    name: 'Bad Luck',
    type: 'negative',
    description:
      'You are plagued by bad luck. Once per game session, the GM can force you to reroll a successful check and take the new result.',
  },
  {
    _id: 'neg5',
    name: 'Chronic Injury',
    type: 'negative',
    description:
      'You have a chronic injury that occasionally flares up. At the start of each day, roll 1d20. On a 1-5, the injury flares up, imposing disadvantage on physical checks until you take a short rest.',
  },
];

export default TraitSelection;

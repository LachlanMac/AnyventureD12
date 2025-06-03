import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';

interface SpellTabProps {
  characterId: string;
  spells: any[];
  spellSlots: number;
}

// Define a spell interface
interface Spell {
  _id: string;
  name: string;
  description: string;
  charge?: string | null;
  duration: string;
  range: string;
  school: string;
  subschool: string;
  checkToCast: number;
  components: string[];
  energy: number;
  damage: number;
  damageType: string;
  concentration: boolean;
  reaction: boolean;
}

// Define a character spell interface
interface CharacterSpell {
  spellId: string;
  dateAdded: string;
  favorite: boolean;
  notes: string;
  _id: string;
  // Add the fetched spell data
  spellData?: Spell;
}

const SpellsTab: React.FC<SpellTabProps> = ({ characterId, spells, spellSlots }) => {
  // State for storing fetched spell data
  const [enhancedSpells, setEnhancedSpells] = useState<CharacterSpell[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the actual spell data for each spell ID
  useEffect(() => {
    const fetchSpellData = async () => {
      try {
        setLoading(true);

        // Create an enhanced copy of the spells array
        const enhancedSpellsData = [...spells] as CharacterSpell[];

        // Fetch spell data for each spell ID
        for (let i = 0; i < enhancedSpellsData.length; i++) {
          const spell = enhancedSpellsData[i];
          try {
            const response = await fetch(`/api/spells/${spell.spellId}`);
            if (response.ok) {
              const spellData = await response.json();
              enhancedSpellsData[i].spellData = spellData;
            }
          } catch (spellError) {
            console.error(`Error fetching data for spell ${spell.spellId}:`, spellError);
          }
        }

        setEnhancedSpells(enhancedSpellsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching spell data:', err);
        setError('Failed to load spell details');
        setLoading(false);
      }
    };

    if (spells && spells.length > 0) {
      fetchSpellData();
    } else {
      setEnhancedSpells([]);
      setLoading(false);
    }
  }, [spells]);

  // Helper function to get color based on spell school
  const getSchoolColor = (school: string | undefined) => {
    switch (school?.toLowerCase()) {
      case 'alteration':
        return 'rgba(215, 183, 64, 0.7)';
      case 'black':
        return 'rgba(215, 183, 64, 0.7)';
      case 'divine':
        return 'rgba(215, 183, 64, 0.7)';
      case 'mysticism':
        return 'rgba(215, 183, 64, 0.7)';
      case 'primal':
        return 'rgba(215, 183, 64, 0.7)';
      default:
        return 'var(--color-dark-elevated)';
    }
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
        <div>
          <h2
            style={{
              color: 'var(--color-white)',
              fontSize: '1.25rem',
              fontWeight: 'bold',
            }}
          >
            Spells
          </h2>
          <p style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>
            {spells.length} / {spellSlots} spell slots used
          </p>
        </div>
        <Link to={`/characters/${characterId}/spells`}>
          <Button variant="accent">Manage Spells</Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="loading-spinner"></div>
        </div>
      ) : error ? (
        <Card variant="default">
          <CardBody>
            <div
              style={{
                color: 'var(--color-sunset)',
                textAlign: 'center',
                padding: '1rem',
              }}
            >
              {error}
            </div>
          </CardBody>
        </Card>
      ) : enhancedSpells.length === 0 ? (
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
                No spells known yet. Add spells to enhance your magical abilities.
              </div>
              <Link to={`/characters/${characterId}/spells`}>
                <Button variant="secondary">Add Spells</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enhancedSpells.map((spell) => (
            <Card key={spell._id} variant="default" hoverEffect={true}>
              <CardHeader
                style={{
                  backgroundColor: getSchoolColor(spell.spellData?.school),
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
                    {spell.spellData?.name || 'Loading spell...'}
                  </h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {spell.spellData?.school && (
                      <span
                        style={{
                          color: 'var(--color-white)',
                          fontSize: '0.75rem',
                          padding: '0.125rem 0.375rem',
                          backgroundColor: 'rgba(0, 0, 0, 0.3)',
                          borderRadius: '0.25rem',
                          textTransform: 'capitalize',
                        }}
                      >
                        {spell.spellData.school}
                      </span>
                    )}
                    {spell.spellData?.subschool && (
                      <span
                        style={{
                          color: 'var(--color-white)',
                          fontSize: '0.75rem',
                          padding: '0.125rem 0.375rem',
                          backgroundColor: 'rgba(0, 0, 0, 0.3)',
                          borderRadius: '0.25rem',
                          textTransform: 'capitalize',
                        }}
                      >
                        {spell.spellData.subschool}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                {spell.spellData ? (
                  <>
                    <p
                      style={{
                        color: 'var(--color-cloud)',
                        fontSize: '0.875rem',
                        marginBottom: '0.75rem',
                      }}
                    >
                      {spell.spellData.description}
                    </p>
                    {spell.spellData.charge && (
                      <div
                        style={{
                          backgroundColor: 'var(--color-dark-elevated)',
                          borderLeft: '3px solid var(--color-metal-gold)',
                          padding: '0.5rem',
                          marginBottom: '0.75rem',
                          borderRadius: '0.25rem',
                        }}
                      >
                        <div style={{ color: 'var(--color-metal-gold)', fontWeight: 'bold', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                          Charge Effect:
                        </div>
                        <p
                          style={{
                            color: 'var(--color-cloud)',
                            fontSize: '0.875rem',
                            margin: 0,
                          }}
                        >
                          {spell.spellData.charge}
                        </p>
                      </div>
                    )}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '0.5rem',
                        fontSize: '0.75rem',
                        color: 'var(--color-cloud)',
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 'bold' }}>Range:</span> {spell.spellData.range}
                      </div>
                      <div>
                        <span style={{ fontWeight: 'bold' }}>Duration:</span>{' '}
                        {spell.spellData.duration}
                      </div>
                      <div>
                        <span style={{ fontWeight: 'bold' }}>Energy Cost:</span>{' '}
                        {spell.spellData.energy}
                      </div>
                      <div>
                        <span style={{ fontWeight: 'bold' }}>Check to Cast:</span>{' '}
                        {spell.spellData.checkToCast}
                      </div>
                      {spell.spellData.damage > 0 && (
                        <>
                          <div>
                            <span style={{ fontWeight: 'bold' }}>Damage:</span>{' '}
                            {spell.spellData.damage}
                          </div>
                          <div>
                            <span style={{ fontWeight: 'bold' }}>Damage Type:</span>{' '}
                            {spell.spellData.damageType}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Additional spell properties */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        marginTop: '0.75rem',
                      }}
                    >
                      {spell.spellData.concentration && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.125rem 0.375rem',
                            backgroundColor: 'var(--color-dark-elevated)',
                            borderRadius: '0.25rem',
                            color: 'var(--color-metal-gold)',
                          }}
                        >
                          Concentration
                        </span>
                      )}

                      {spell.spellData.reaction && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.125rem 0.375rem',
                            backgroundColor: 'var(--color-dark-elevated)',
                            borderRadius: '0.25rem',
                            color: 'var(--color-sunset)',
                          }}
                        >
                          Reaction
                        </span>
                      )}

                      {spell.spellData.components &&
                        spell.spellData.components.length > 0 &&
                        spell.spellData.components[0] !== '' && (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.125rem 0.375rem',
                              backgroundColor: 'var(--color-dark-elevated)',
                              borderRadius: '0.25rem',
                              color: 'var(--color-white)',
                            }}
                          >
                            Components: {spell.spellData.components.join(', ')}
                          </span>
                        )}
                    </div>
                  </>
                ) : (
                  <div
                    style={{ color: 'var(--color-cloud)', textAlign: 'center', padding: '1rem' }}
                  >
                    Loading spell details...
                  </div>
                )}

                {/* Spell notes if present */}
                {spell.notes && (
                  <div
                    style={{
                      marginTop: '0.75rem',
                      padding: '0.5rem',
                      backgroundColor: 'var(--color-dark-elevated)',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      color: 'var(--color-cloud)',
                    }}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Notes:</div>
                    {spell.notes}
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SpellsTab;

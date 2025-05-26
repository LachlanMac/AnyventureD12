// src/pages/SpellsPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardBody } from '../components/ui/Card';

// Type definitions
interface Spell {
  _id: string;
  name: string;
  description: string;
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

interface CharacterSpell {
  spellId: string | Spell;
  dateAdded: string;
  favorite: boolean;
  notes: string;
}

interface Character {
  _id: string;
  name: string;
  spellSlots: number;
  spells: CharacterSpell[];
}

const SpellsPage: React.FC = () => {
  const { id: characterId } = useParams<{ id: string }>();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [allSpells, setAllSpells] = useState<Spell[]>([]);
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);
  const [spellNote, setSpellNote] = useState<string>('');

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [schoolFilter, setSchoolFilter] = useState<string>('all');
  const [subschoolFilter, setSubschoolFilter] = useState<string>('all');

  // Get all available schools and subschools for filters
  const [schools, setSchools] = useState<string[]>([]);
  const [subschools, setSubschools] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch character data
        const characterResponse = await fetch(`/api/characters/${characterId}`);
        if (!characterResponse.ok) {
          throw new Error('Failed to fetch character data');
        }
        const characterData = await characterResponse.json();
        setCharacter(characterData);

        // Fetch all spells
        const spellsResponse = await fetch('/api/spells');
        if (!spellsResponse.ok) {
          throw new Error('Failed to fetch spells');
        }
        const spellsData = await spellsResponse.json();
        setAllSpells(spellsData);

        const uniqueSchools = [
          ...new Set(spellsData.map((spell: Spell) => spell.school as string)),
        ] as string[];
        setSchools(uniqueSchools);
        const uniqueSubschools = [
          ...new Set(spellsData.map((spell: Spell) => spell.subschool as string)),
        ] as string[];
        setSubschools(uniqueSubschools);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };

    fetchData();
  }, [characterId]);

  // Check if a spell is already learned by the character
  const isSpellLearned = (spellId: string) => {
    return (
      character?.spells.some((s) => {
        if (typeof s.spellId === 'string') {
          return s.spellId === spellId;
        } else {
          return s.spellId._id === spellId;
        }
      }) || false
    );
  };

  // Get the character's spell data for a specific spell
  const getCharacterSpell = (spellId: string) => {
    return character?.spells.find((s) => {
      if (typeof s.spellId === 'string') {
        return s.spellId === spellId;
      } else {
        return s.spellId._id === spellId;
      }
    });
  };

  // Check if character has available spell slots
  const hasAvailableSpellSlots = () => {
    if (!character) return false;
    return character.spells.length < character.spellSlots;
  };

  // Handle learning a new spell
  const handleLearnSpell = async (spellId: string) => {
    try {
      const response = await fetch(`/api/characters/${characterId}/spells/${spellId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ notes: spellNote }),
      });

      if (!response.ok) {
        throw new Error('Failed to learn spell');
      }

      const updatedCharacter = await response.json();
      setCharacter(updatedCharacter);
      setSpellNote('');
    } catch (err) {
      console.error('Error learning spell:', err);
      setError(err instanceof Error ? err.message : 'Failed to learn spell');
    }
  };

  // Handle forgetting a spell
  const handleForgetSpell = async (spellId: string) => {
    try {
      const response = await fetch(`/api/characters/${characterId}/spells/${spellId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to forget spell');
      }

      const updatedCharacter = await response.json();
      setCharacter(updatedCharacter);
    } catch (err) {
      console.error('Error forgetting spell:', err);
      setError(err instanceof Error ? err.message : 'Failed to forget spell');
    }
  };

  // Helper function to get color based on spell school
  const getSchoolColor = (school: string) => {
    switch (school?.toLowerCase()) {
      case 'alteration':
        return 'var(--color-sat-purple-faded)';
      case 'black':
        return 'rgba(25, 34, 49, 0.8)';
      case 'divine':
        return 'rgba(215, 183, 64, 0.7)';
      case 'mysticism':
        return 'rgba(85, 65, 130, 0.7)';
      case 'primal':
        return 'rgba(152, 94, 109, 0.7)';
      default:
        return 'var(--color-dark-elevated)';
    }
  };

  // Get filtered and sorted spells
  const getFilteredSpells = () => {
    if (!allSpells.length) return [];

    let filteredSpells = [...allSpells];

    // Apply school filter
    if (schoolFilter !== 'all') {
      filteredSpells = filteredSpells.filter((spell) => spell.school === schoolFilter);
    }

    // Apply subschool filter
    if (subschoolFilter !== 'all') {
      filteredSpells = filteredSpells.filter((spell) => spell.subschool === subschoolFilter);
    }

    // Apply search term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      filteredSpells = filteredSpells.filter((spell) => {
        return (
          spell.name.toLowerCase().includes(term) ||
          spell.description.toLowerCase().includes(term) ||
          spell.school.toLowerCase().includes(term) ||
          spell.subschool.toLowerCase().includes(term)
        );
      });
    }

    // Sort: First show learned spells, then sort by school and name
    return filteredSpells.sort((a, b) => {
      const aLearned = isSpellLearned(a._id);
      const bLearned = isSpellLearned(b._id);

      if (aLearned && !bLearned) return -1;
      if (!aLearned && bLearned) return 1;

      if (a.school !== b.school) {
        return a.school.localeCompare(b.school);
      }

      if (a.subschool !== b.subschool) {
        return a.subschool.localeCompare(b.subschool);
      }

      return a.name.localeCompare(b.name);
    });
  };

  const filteredSpells = getFilteredSpells();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div
          style={{
            backgroundColor: 'rgba(152, 94, 109, 0.2)',
            border: '1px solid var(--color-sunset)',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              color: 'var(--color-white)',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
            }}
          >
            Error
          </h2>
          <p style={{ color: 'var(--color-white)' }}>{error}</p>
          <div style={{ marginTop: '1.5rem' }}>
            <Link to={`/characters/${characterId}`}>
              <Button variant="accent">Return to Character</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <h1
          style={{
            color: 'var(--color-white)',
            fontFamily: 'var(--font-display)',
            fontSize: '2.5rem',
            fontWeight: 'bold',
          }}
        >
          Character Spells
        </h1>

        <div
          style={{
            backgroundColor: 'var(--color-dark-elevated)',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            color: hasAvailableSpellSlots() ? 'var(--color-metal-gold)' : 'var(--color-cloud)',
          }}
        >
          Spell Slots:{' '}
          <span style={{ fontWeight: 'bold' }}>
            {character?.spells.length || 0} / {character?.spellSlots || 0}
          </span>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <Link to={`/characters/${characterId}`}>
          <Button variant="secondary">&larr; Back to Character</Button>
        </Link>
      </div>

      {/* Filters section */}
      <div style={{ marginBottom: '2rem' }}>
        <Card variant="default">
          <CardHeader>
            <h2
              style={{
                color: 'var(--color-white)',
                fontSize: '1.25rem',
                fontWeight: 'bold',
              }}
            >
              Filter Spells
            </h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search input */}
              <div>
                <label
                  style={{
                    color: 'var(--color-cloud)',
                    fontSize: '0.875rem',
                    marginBottom: '0.5rem',
                    display: 'block',
                  }}
                >
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search spells..."
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

              {/* School filter */}
              <div>
                <label
                  style={{
                    color: 'var(--color-cloud)',
                    fontSize: '0.875rem',
                    marginBottom: '0.5rem',
                    display: 'block',
                  }}
                >
                  School
                </label>
                <select
                  value={schoolFilter}
                  onChange={(e) => {
                    setSchoolFilter(e.target.value);
                    setSubschoolFilter('all'); // Reset subschool when school changes
                  }}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-dark-elevated)',
                    color: 'var(--color-white)',
                    border: '1px solid var(--color-dark-border)',
                    borderRadius: '0.375rem',
                    padding: '0.5rem 0.75rem',
                  }}
                >
                  <option value="all">All Schools</option>
                  {schools.map((school) => (
                    <option key={school} value={school}>
                      {school.charAt(0).toUpperCase() + school.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subschool filter */}
              <div>
                <label
                  style={{
                    color: 'var(--color-cloud)',
                    fontSize: '0.875rem',
                    marginBottom: '0.5rem',
                    display: 'block',
                  }}
                >
                  Subschool
                </label>
                <select
                  value={subschoolFilter}
                  onChange={(e) => setSubschoolFilter(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-dark-elevated)',
                    color: 'var(--color-white)',
                    border: '1px solid var(--color-dark-border)',
                    borderRadius: '0.375rem',
                    padding: '0.5rem 0.75rem',
                  }}
                >
                  <option value="all">All Subschools</option>
                  {subschools
                    .filter(
                      (subschool) =>
                        schoolFilter === 'all' ||
                        allSpells.some(
                          (spell) => spell.school === schoolFilter && spell.subschool === subschool
                        )
                    )
                    .map((subschool) => (
                      <option key={subschool} value={subschool}>
                        {subschool.charAt(0).toUpperCase() + subschool.slice(1)}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Spells list */}
        <div className="md:col-span-1">
          <Card variant="default">
            <CardHeader>
              <h2
                style={{
                  color: 'var(--color-white)',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                }}
              >
                Available Spells
              </h2>
              <div style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>
                {filteredSpells.length} spells found
              </div>
            </CardHeader>
            <CardBody>
              {filteredSpells.length === 0 ? (
                <div style={{ color: 'var(--color-cloud)', padding: '1rem' }}>
                  No spells match your search criteria.
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    maxHeight: '600px',
                    overflowY: 'auto',
                    paddingRight: '0.25rem',
                  }}
                >
                  {filteredSpells.map((spell) => (
                    <div
                      key={spell._id}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '0.375rem',
                        backgroundColor: isSpellLearned(spell._id)
                          ? 'var(--color-sat-purple-faded)'
                          : 'var(--color-dark-elevated)',
                        cursor: 'pointer',
                        border:
                          selectedSpell?._id === spell._id
                            ? '1px solid var(--color-metal-gold)'
                            : isSpellLearned(spell._id)
                              ? '1px solid var(--color-sat-purple)'
                              : '1px solid transparent',
                      }}
                      onClick={() => {
                        setSelectedSpell(spell);
                        // If the spell has notes, load them
                        const charSpell = getCharacterSpell(spell._id);
                        if (charSpell && typeof charSpell !== 'string' && charSpell.notes) {
                          setSpellNote(charSpell.notes);
                        } else {
                          setSpellNote('');
                        }
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div
                            style={{
                              color: 'var(--color-white)',
                              fontWeight: 'bold',
                            }}
                          >
                            {spell.name}
                          </div>
                          <div
                            style={{
                              color: 'var(--color-cloud)',
                              fontSize: '0.75rem',
                              display: 'flex',
                              gap: '0.5rem',
                            }}
                          >
                            <span style={{ textTransform: 'capitalize' }}>{spell.school}</span>
                            <span>•</span>
                            <span style={{ textTransform: 'capitalize' }}>{spell.subschool}</span>
                          </div>
                        </div>

                        {isSpellLearned(spell._id) && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <div
                              style={{
                                width: '0.5rem',
                                height: '0.5rem',
                                borderRadius: '50%',
                                backgroundColor: 'var(--color-metal-gold)',
                              }}
                            ></div>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                color: 'var(--color-metal-gold)',
                              }}
                            >
                              Learned
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Spell details */}
        <div className="md:col-span-2">
          {selectedSpell ? (
            <Card variant="default">
              <CardHeader
                style={{
                  backgroundColor: getSchoolColor(selectedSpell.school),
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <h2
                    style={{
                      color: 'var(--color-white)',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {selectedSpell.name}
                  </h2>
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                    }}
                  >
                    <span
                      style={{
                        color: 'var(--color-white)',
                        fontSize: '0.875rem',
                        padding: '0.25rem 0.75rem',
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '0.25rem',
                        textTransform: 'capitalize',
                      }}
                    >
                      {selectedSpell.school}
                    </span>
                    <span
                      style={{
                        color: 'var(--color-white)',
                        fontSize: '0.875rem',
                        padding: '0.25rem 0.75rem',
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '0.25rem',
                        textTransform: 'capitalize',
                      }}
                    >
                      {selectedSpell.subschool}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardBody>
                {/* Spell description */}
                <div
                  style={{
                    marginBottom: '1.5rem',
                  }}
                >
                  <h3
                    style={{
                      color: 'var(--color-white)',
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Description
                  </h3>
                  <p
                    style={{
                      color: 'var(--color-cloud)',
                    }}
                  >
                    {selectedSpell.description}
                  </p>
                </div>

                {/* Spell stats */}
                <div
                  style={{
                    marginBottom: '1.5rem',
                  }}
                >
                  <h3
                    style={{
                      color: 'var(--color-white)',
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Spell Details
                  </h3>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          color: 'var(--color-metal-gold)',
                          fontSize: '0.875rem',
                          fontWeight: 'bold',
                        }}
                      >
                        Range
                      </div>
                      <div
                        style={{
                          color: 'var(--color-white)',
                        }}
                      >
                        {selectedSpell.range}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          color: 'var(--color-metal-gold)',
                          fontSize: '0.875rem',
                          fontWeight: 'bold',
                        }}
                      >
                        Duration
                      </div>
                      <div
                        style={{
                          color: 'var(--color-white)',
                        }}
                      >
                        {selectedSpell.duration}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          color: 'var(--color-metal-gold)',
                          fontSize: '0.875rem',
                          fontWeight: 'bold',
                        }}
                      >
                        Energy Cost
                      </div>
                      <div
                        style={{
                          color: 'var(--color-white)',
                        }}
                      >
                        {selectedSpell.energy}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          color: 'var(--color-metal-gold)',
                          fontSize: '0.875rem',
                          fontWeight: 'bold',
                        }}
                      >
                        Check to Cast
                      </div>
                      <div
                        style={{
                          color: 'var(--color-white)',
                        }}
                      >
                        {selectedSpell.checkToCast}
                      </div>
                    </div>
                    {selectedSpell.damage > 0 && (
                      <>
                        <div>
                          <div
                            style={{
                              color: 'var(--color-metal-gold)',
                              fontSize: '0.875rem',
                              fontWeight: 'bold',
                            }}
                          >
                            Damage
                          </div>
                          <div
                            style={{
                              color: 'var(--color-white)',
                            }}
                          >
                            {selectedSpell.damage}
                          </div>
                        </div>
                        <div>
                          <div
                            style={{
                              color: 'var(--color-metal-gold)',
                              fontSize: '0.875rem',
                              fontWeight: 'bold',
                            }}
                          >
                            Damage Type
                          </div>
                          <div
                            style={{
                              color: 'var(--color-white)',
                            }}
                          >
                            {selectedSpell.damageType}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Spell properties */}
                <div
                  style={{
                    marginBottom: '1.5rem',
                  }}
                >
                  <h3
                    style={{
                      color: 'var(--color-white)',
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Properties
                  </h3>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    {selectedSpell.concentration && (
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: 'var(--color-dark-elevated)',
                          borderRadius: '0.25rem',
                          color: 'var(--color-metal-gold)',
                        }}
                      >
                        Concentration
                      </span>
                    )}

                    {selectedSpell.reaction && (
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: 'var(--color-dark-elevated)',
                          borderRadius: '0.25rem',
                          color: 'var(--color-sunset)',
                        }}
                      >
                        Reaction
                      </span>
                    )}

                    {selectedSpell.components &&
                      selectedSpell.components.length > 0 &&
                      selectedSpell.components[0] !== '' && (
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            backgroundColor: 'var(--color-dark-elevated)',
                            borderRadius: '0.25rem',
                            color: 'var(--color-white)',
                          }}
                        >
                          Components: {selectedSpell.components.join(', ')}
                        </span>
                      )}
                  </div>
                </div>

                {/* Spell notes */}
                <div
                  style={{
                    marginBottom: '1.5rem',
                  }}
                >
                  <h3
                    style={{
                      color: 'var(--color-white)',
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Personal Notes
                  </h3>
                  <textarea
                    value={spellNote}
                    onChange={(e) => setSpellNote(e.target.value)}
                    placeholder="Add your notes about this spell here..."
                    style={{
                      width: '100%',
                      minHeight: '100px',
                      backgroundColor: 'var(--color-dark-elevated)',
                      color: 'var(--color-white)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: '0.375rem',
                      padding: '0.75rem',
                      resize: 'vertical',
                    }}
                  />
                </div>

                {/* Action buttons */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  {isSpellLearned(selectedSpell._id) ? (
                    <Button
                      variant="outline"
                      onClick={() => handleForgetSpell(selectedSpell._id)}
                      style={{ flex: 1 }}
                    >
                      Forget Spell
                    </Button>
                  ) : (
                    <Button
                      variant="accent"
                      onClick={() => handleLearnSpell(selectedSpell._id)}
                      disabled={!hasAvailableSpellSlots()}
                      style={{ flex: 1 }}
                    >
                      {hasAvailableSpellSlots() ? 'Learn Spell' : 'No Spell Slots Available'}
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--color-dark-surface)',
                borderRadius: '0.5rem',
                padding: '3rem',
                height: '100%',
              }}
            >
              <div style={{ color: 'var(--color-cloud)', textAlign: 'center' }}>
                <div style={{ marginBottom: '1rem' }}>
                  Select a spell from the list to view details
                </div>
                <div style={{ fontSize: '0.875rem' }}>
                  Spells allow your character to harness magical energies and abilities
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpellsPage;

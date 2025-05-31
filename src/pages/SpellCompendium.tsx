import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardBody } from '../components/ui/Card';

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

const SpellCompendium: React.FC = () => {
  const [spells, setSpells] = useState<Spell[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [schoolFilter, setSchoolFilter] = useState<string>('all');
  const [subschoolFilter, setSubschoolFilter] = useState<string>('all');
  const [energyFilter, setEnergyFilter] = useState<string>('all');
  const [concentrationFilter, setConcentrationFilter] = useState<string>('all');

  useEffect(() => {
    const fetchSpells = async () => {
      try {
        const response = await fetch('/api/spells');
        if (!response.ok) {
          throw new Error('Failed to fetch spells');
        }
        const spellsData = await response.json();
        setSpells(spellsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching spells:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };

    fetchSpells();
  }, []);

  const getFilteredSpells = () => {
    let filtered = [...spells];

    // Search filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (spell) =>
          spell.name.toLowerCase().includes(term) ||
          spell.description.toLowerCase().includes(term) ||
          spell.school.toLowerCase().includes(term) ||
          spell.subschool.toLowerCase().includes(term)
      );
    }

    // School filter
    if (schoolFilter !== 'all') {
      filtered = filtered.filter((spell) => spell.school.toLowerCase() === schoolFilter);
    }

    // Subschool filter
    if (subschoolFilter !== 'all') {
      filtered = filtered.filter((spell) => spell.subschool.toLowerCase() === subschoolFilter);
    }

    // Energy filter
    if (energyFilter !== 'all') {
      const energyValue = parseInt(energyFilter);
      filtered = filtered.filter((spell) => spell.energy === energyValue);
    }

    // Concentration filter
    if (concentrationFilter !== 'all') {
      const wantsConcentration = concentrationFilter === 'yes';
      filtered = filtered.filter((spell) => spell.concentration === wantsConcentration);
    }

    // Sort by school, then subschool, then name
    return filtered.sort((a, b) => {
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

  // Get unique values for filters
  const schools = [...new Set(spells.map((s) => s.school.toLowerCase()))].sort();
  const energyCosts = [...new Set(spells.map((s) => s.energy))].sort((a, b) => a - b);

  // Map schools to their subschools
  const schoolSubschoolMap: Record<string, string[]> = {};
  spells.forEach((spell) => {
    const school = spell.school.toLowerCase();
    const subschool = spell.subschool.toLowerCase();
    if (!schoolSubschoolMap[school]) {
      schoolSubschoolMap[school] = [];
    }
    if (!schoolSubschoolMap[school].includes(subschool)) {
      schoolSubschoolMap[school].push(subschool);
    }
  });

  const schoolColors: Record<string, string> = {
    black: 'var(--color-sunset)',
    primal: 'var(--color-old-gold)',
    alteration: 'var(--color-sat-purple)',
    divine: 'var(--color-stormy)',
    mysticism: 'var(--color-evening)',
  };

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
        <Card variant="default">
          <CardBody>
            <p style={{ color: 'var(--color-sunset)' }}>Error: {error}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1
          style={{
            color: 'var(--color-white)',
            fontFamily: 'var(--font-display)',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
          }}
        >
          Spell Library
        </h1>
        <p style={{ color: 'var(--color-cloud)', fontSize: '1.125rem' }}>
          Explore spells from all five schools of magic
        </p>
      </div>

      {/* Search and Filters */}
      <Card variant="default" style={{ marginBottom: '2rem' }}>
        <CardBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Search bar */}
            <div style={{ position: 'relative' }}>
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
                  padding: '0.75rem 1rem',
                  paddingLeft: '2.5rem',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-cloud)',
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-cloud)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* School Filter */}
              <div>
                <label
                  htmlFor="school-filter"
                  style={{
                    display: 'block',
                    color: 'var(--color-cloud)',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                  }}
                >
                  School of Magic
                </label>
                <select
                  id="school-filter"
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
                    padding: '0.5rem',
                    textTransform: 'capitalize',
                  }}
                >
                  <option value="all">All Schools</option>
                  {schools.map((school) => (
                    <option key={school} value={school}>
                      {school}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subschool Filter */}
              <div>
                <label
                  htmlFor="subschool-filter"
                  style={{
                    display: 'block',
                    color: 'var(--color-cloud)',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                  }}
                >
                  Subschool
                </label>
                <select
                  id="subschool-filter"
                  value={subschoolFilter}
                  onChange={(e) => setSubschoolFilter(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-dark-elevated)',
                    color: 'var(--color-white)',
                    border: '1px solid var(--color-dark-border)',
                    borderRadius: '0.375rem',
                    padding: '0.5rem',
                    textTransform: 'capitalize',
                  }}
                  disabled={schoolFilter === 'all'}
                >
                  <option value="all">All Subschools</option>
                  {schoolFilter !== 'all' &&
                    schoolSubschoolMap[schoolFilter]?.map((subschool) => (
                      <option key={subschool} value={subschool}>
                        {subschool}
                      </option>
                    ))}
                </select>
              </div>

              {/* Energy Cost Filter */}
              <div>
                <label
                  htmlFor="energy-filter"
                  style={{
                    display: 'block',
                    color: 'var(--color-cloud)',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                  }}
                >
                  Energy Cost
                </label>
                <select
                  id="energy-filter"
                  value={energyFilter}
                  onChange={(e) => setEnergyFilter(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-dark-elevated)',
                    color: 'var(--color-white)',
                    border: '1px solid var(--color-dark-border)',
                    borderRadius: '0.375rem',
                    padding: '0.5rem',
                  }}
                >
                  <option value="all">Any Energy Cost</option>
                  {energyCosts.map((cost) => (
                    <option key={cost} value={cost.toString()}>
                      {cost} Energy
                    </option>
                  ))}
                </select>
              </div>

              {/* Concentration Filter */}
              <div>
                <label
                  htmlFor="concentration-filter"
                  style={{
                    display: 'block',
                    color: 'var(--color-cloud)',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                  }}
                >
                  Concentration
                </label>
                <select
                  id="concentration-filter"
                  value={concentrationFilter}
                  onChange={(e) => setConcentrationFilter(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-dark-elevated)',
                    color: 'var(--color-white)',
                    border: '1px solid var(--color-dark-border)',
                    borderRadius: '0.375rem',
                    padding: '0.5rem',
                  }}
                >
                  <option value="all">Any</option>
                  <option value="yes">Concentration Only</option>
                  <option value="no">Non-Concentration Only</option>
                </select>
              </div>
            </div>

            {/* Results count */}
            <div style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>
              Found {filteredSpells.length} {filteredSpells.length === 1 ? 'spell' : 'spells'}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Spells List and Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spells list */}
        <div className="lg:col-span-2">
          <Card variant="default">
            <CardBody style={{ padding: '0' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {filteredSpells.map((spell, index) => (
                  <div
                    key={spell._id}
                    onClick={() => setSelectedSpell(spell)}
                    style={{
                      padding: '1rem',
                      cursor: 'pointer',
                      backgroundColor:
                        selectedSpell?._id === spell._id
                          ? 'var(--color-dark-elevated)'
                          : 'transparent',
                      borderLeft:
                        selectedSpell?._id === spell._id
                          ? '3px solid var(--color-metal-gold)'
                          : '3px solid transparent',
                      borderBottom:
                        index < filteredSpells.length - 1
                          ? '1px solid var(--color-dark-border)'
                          : 'none',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedSpell?._id !== spell._id) {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedSpell?._id !== spell._id) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {/* Left section - Name and school info */}
                      <div style={{ flex: '1', minWidth: '0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                          <h3
                            style={{
                              color: 'var(--color-white)',
                              fontSize: '1.125rem',
                              fontWeight: 'bold',
                              margin: 0,
                            }}
                          >
                            {spell.name}
                          </h3>
                          <span
                            style={{
                              color: schoolColors[spell.school.toLowerCase()] || 'var(--color-cloud)',
                              fontSize: '0.875rem',
                              fontWeight: 'bold',
                              textTransform: 'capitalize',
                            }}
                          >
                            {spell.school}
                          </span>
                          <span style={{ color: 'var(--color-muted)' }}>•</span>
                          <span
                            style={{
                              color: 'var(--color-cloud)',
                              fontSize: '0.875rem',
                              textTransform: 'capitalize',
                            }}
                          >
                            {spell.subschool}
                          </span>
                        </div>
                        <p
                          style={{
                            color: 'var(--color-cloud)',
                            fontSize: '0.875rem',
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {spell.description}
                        </p>
                      </div>

                      {/* Middle section - Tags and range */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '120px' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                          {spell.concentration && (
                            <span
                              style={{
                                color: 'var(--color-metal-gold)',
                                fontSize: '0.75rem',
                                backgroundColor: 'rgba(215, 183, 64, 0.2)',
                                padding: '0.125rem 0.375rem',
                                borderRadius: '0.25rem',
                              }}
                            >
                              Concentration
                            </span>
                          )}
                          {spell.reaction && (
                            <span
                              style={{
                                fontSize: '0.75rem',
                                color: 'var(--color-white)',
                                backgroundColor: 'var(--color-dark-elevated)',
                                padding: '0.125rem 0.375rem',
                                borderRadius: '0.25rem',
                              }}
                            >
                              Reaction
                            </span>
                          )}
                        </div>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--color-cloud)',
                            backgroundColor: 'var(--color-dark-elevated)',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '0.25rem',
                          }}
                        >
                          {spell.range}
                        </span>
                      </div>

                      {/* Right section - Quick stats */}
                      <div style={{ display: 'flex', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                        <div style={{ textAlign: 'center', width: '60px' }}>
                          <div style={{ fontSize: '0.75rem' }}>Cast DC</div>
                          <div style={{ color: 'var(--color-cloud)' }}>{spell.checkToCast}</div>
                        </div>
                        <div style={{ textAlign: 'center', width: '60px' }}>
                          <div style={{ fontSize: '0.75rem' }}>Energy</div>
                          <div style={{ color: 'var(--color-cloud)' }}>{spell.energy}</div>
                        </div>
                        <div style={{ textAlign: 'center', width: '60px' }}>
                          <div style={{ fontSize: '0.75rem' }}>Damage</div>
                          <div style={{ color: 'var(--color-cloud)' }}>
                            {spell.damage > 0 ? spell.damage : '-'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Selected spell detail */}
        <div className="lg:col-span-1">
          {selectedSpell ? (
            <Card variant="default" style={{ position: 'sticky', top: '1rem' }}>
              <CardHeader>
                <h2
                  style={{
                    color: 'var(--color-white)',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                  }}
                >
                  {selectedSpell.name}
                </h2>
              </CardHeader>
              <CardBody>
                <SpellDetail spell={selectedSpell} />
              </CardBody>
            </Card>
          ) : (
            <Card variant="default">
              <CardBody>
                <div style={{ color: 'var(--color-cloud)', textAlign: 'center', padding: '2rem' }}>
                  <p style={{ marginBottom: '0.5rem' }}>Select a spell to view details</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                    Click on any spell card to see its full information
                  </p>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

// Spell detail component
const SpellDetail: React.FC<{ spell: Spell }> = ({ spell }) => {
  const schoolColors: Record<string, string> = {
    black: 'var(--color-sunset)',
    primal: 'var(--color-old-gold)',
    alteration: 'var(--color-sat-purple)',
    divine: 'var(--color-stormy)',
    mysticism: 'var(--color-evening)',
  };

  const damageTypeColors: Record<string, string> = {
    physical: '#9CA3AF',
    heat: '#EF4444',
    cold: '#3B82F6',
    lightning: '#FBBF24',
    dark: '#6B21A8',
    divine: '#F59E0B',
    arcane: '#8B5CF6',
    psychic: '#EC4899',
    toxic: '#10B981',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* School and Subschool */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <span
          style={{
            color: schoolColors[spell.school.toLowerCase()] || 'var(--color-cloud)',
            fontWeight: 'bold',
            textTransform: 'capitalize',
            fontSize: '1.1rem',
          }}
        >
          {spell.school}
        </span>
        <span style={{ color: 'var(--color-muted)' }}>•</span>
        <span
          style={{
            color: 'var(--color-cloud)',
            fontSize: '1rem',
            textTransform: 'capitalize',
          }}
        >
          {spell.subschool}
        </span>
      </div>

      {/* Description */}
      <div>
        <h3 style={{ color: 'var(--color-metal-gold)', marginBottom: '0.5rem' }}>Description</h3>
        <p style={{ color: 'var(--color-cloud)', lineHeight: '1.6' }}>{spell.description}</p>
      </div>

      {/* Casting Requirements */}
      <div>
        <h3 style={{ color: 'var(--color-metal-gold)', marginBottom: '0.75rem' }}>
          Casting Requirements
        </h3>
        <div
          style={{
            backgroundColor: 'var(--color-dark-elevated)',
            padding: '1rem',
            borderRadius: '0.375rem',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ color: 'var(--color-cloud)' }}>
              <strong>Check to Cast:</strong> {spell.checkToCast}
            </div>
            <div style={{ color: 'var(--color-cloud)' }}>
              <strong>Energy Cost:</strong> {spell.energy}
            </div>
            <div style={{ color: 'var(--color-cloud)' }}>
              <strong>Range:</strong> {spell.range}
            </div>
            <div style={{ color: 'var(--color-cloud)' }}>
              <strong>Duration:</strong> {spell.duration}
            </div>
          </div>
        </div>
      </div>

      {/* Components */}
      {spell.components && spell.components.length > 0 && (
        <div>
          <h3 style={{ color: 'var(--color-metal-gold)', marginBottom: '0.75rem' }}>Components</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {spell.components.map((component, index) => (
              <span
                key={index}
                style={{
                  backgroundColor: 'var(--color-dark-elevated)',
                  color: 'var(--color-white)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.875rem',
                }}
              >
                {component}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Damage */}
      {spell.damage > 0 && (
        <div>
          <h3 style={{ color: 'var(--color-metal-gold)', marginBottom: '0.75rem' }}>Damage</h3>
          <div
            style={{
              backgroundColor: 'var(--color-dark-elevated)',
              padding: '1rem',
              borderRadius: '0.375rem',
            }}
          >
            <div style={{ color: 'var(--color-cloud)' }}>
              <strong>Damage:</strong> {spell.damage}{' '}
              <span
                style={{
                  color: damageTypeColors[spell.damageType.toLowerCase()] || 'var(--color-cloud)',
                  textTransform: 'capitalize',
                }}
              >
                {spell.damageType}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Special Properties */}
      {(spell.concentration || spell.reaction) && (
        <div>
          <h3 style={{ color: 'var(--color-metal-gold)', marginBottom: '0.75rem' }}>
            Special Properties
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {spell.concentration && (
              <div style={{ color: 'var(--color-cloud)' }}>
                <strong>Concentration:</strong> This spell requires concentration to maintain
              </div>
            )}
            {spell.reaction && (
              <div style={{ color: 'var(--color-cloud)' }}>
                <strong>Reaction:</strong> This spell can be cast as a reaction
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpellCompendium;
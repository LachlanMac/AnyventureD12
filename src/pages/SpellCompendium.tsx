import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardBody } from '../components/ui/Card';
import { formatRange } from '../utils/rangeUtils';

interface Spell {
  _id: string;
  name: string;
  description: string;
  charge?: string | null;
  duration: string;
  range: number | string;
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
  const navigate = useNavigate();
  const [spells, setSpells] = useState<Spell[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [schoolFilter, setSchoolFilter] = useState<string>('all');
  const [subschoolFilter, setSubschoolFilter] = useState<string>('all');
  const [energyFilter, setEnergyFilter] = useState<string>('all');
  const [concentrationFilter, setConcentrationFilter] = useState<string>('all');

  // Sorting
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

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

    // Apply sorting
    return filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number;

      switch (sortField) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'school':
          aValue = a.school;
          bValue = b.school;
          break;
        case 'subschool':
          aValue = a.subschool;
          bValue = b.subschool;
          break;
        case 'checkToCast':
          aValue = a.checkToCast;
          bValue = b.checkToCast;
          break;
        case 'energy':
          aValue = a.energy;
          bValue = b.energy;
          break;
        case 'damage':
          aValue = a.damage;
          bValue = b.damage;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
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
    black: '#ff6b6b', // Bright red for black magic
    primal: '#4ecdc4', // Bright teal for primal magic
    meta: '#a855f7', // Bright purple for metamagic
    white: '#fbbf24', // Bright gold for white magic
    mysticism: '#06b6d4', // Bright cyan for mysticism magic
    arcane: '#10b981', // Bright emerald for arcane magic
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

      {/* Spells List */}
      <Card variant="default">
        <CardBody style={{ padding: '0' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Table Header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 150px 120px 100px 80px 80px',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--color-dark-elevated)',
                borderBottom: '2px solid var(--color-dark-border)',
                position: 'sticky',
                top: 0,
                zIndex: 10,
              }}
            >
              <button
                onClick={() => handleSort('name')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: sortField === 'name' ? 'var(--color-metal-gold)' : 'var(--color-cloud)',
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                Spell Name
                {sortField === 'name' && (
                  <span style={{ fontSize: '0.75rem' }}>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                )}
              </button>
              <button
                onClick={() => handleSort('school')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: sortField === 'school' ? 'var(--color-metal-gold)' : 'var(--color-cloud)',
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem',
                }}
              >
                School
                {sortField === 'school' && (
                  <span style={{ fontSize: '0.75rem' }}>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                )}
              </button>
              <div
                style={{
                  color: 'var(--color-cloud)',
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                  textAlign: 'center',
                }}
              >
                Range
              </div>
              <button
                onClick={() => handleSort('checkToCast')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color:
                    sortField === 'checkToCast' ? 'var(--color-metal-gold)' : 'var(--color-cloud)',
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem',
                }}
              >
                Check
                {sortField === 'checkToCast' && (
                  <span style={{ fontSize: '0.75rem' }}>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                )}
              </button>
              <button
                onClick={() => handleSort('energy')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: sortField === 'energy' ? 'var(--color-metal-gold)' : 'var(--color-cloud)',
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem',
                }}
              >
                Energy
                {sortField === 'energy' && (
                  <span style={{ fontSize: '0.75rem' }}>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                )}
              </button>
              <button
                onClick={() => handleSort('damage')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: sortField === 'damage' ? 'var(--color-metal-gold)' : 'var(--color-cloud)',
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem',
                }}
              >
                Damage
                {sortField === 'damage' && (
                  <span style={{ fontSize: '0.75rem' }}>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                )}
              </button>
            </div>
            {filteredSpells.map((spell, index) => (
              <div
                key={spell._id}
                onClick={() => navigate(`/spells/${spell._id}`)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 150px 120px 100px 80px 80px',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                  borderBottom:
                    index < filteredSpells.length - 1
                      ? '1px solid var(--color-dark-border)'
                      : 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {/* Spell Name with subschool */}
                <div>
                  <div
                    style={{
                      color: 'var(--color-white)',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {spell.name}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        color: schoolColors[spell.school.toLowerCase()] || '#9ca3af',
                        fontSize: '0.75rem',
                        textTransform: 'capitalize',
                        backgroundColor: `${schoolColors[spell.school.toLowerCase()] || '#9ca3af'}20`,
                        padding: '0.125rem 0.5rem',
                        borderRadius: '0.25rem',
                        border: `1px solid ${schoolColors[spell.school.toLowerCase()] || '#9ca3af'}40`,
                      }}
                    >
                      {spell.subschool}
                    </span>
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
                        Conc
                      </span>
                    )}
                    {spell.reaction && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--color-sunset)',
                          backgroundColor: 'rgba(255, 140, 90, 0.2)',
                          padding: '0.125rem 0.375rem',
                          borderRadius: '0.25rem',
                        }}
                      >
                        React
                      </span>
                    )}
                  </div>
                </div>

                {/* School */}
                <div
                  style={{
                    color: schoolColors[spell.school.toLowerCase()] || '#9ca3af',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    textTransform: 'capitalize',
                    textAlign: 'center',
                  }}
                >
                  {spell.school}
                </div>

                {/* Range */}
                <div
                  style={{
                    color: 'var(--color-cloud)',
                    fontSize: '0.875rem',
                    textAlign: 'center',
                  }}
                >
                  {formatRange(spell.range, 'spell')}
                </div>

                {/* Check to Cast */}
                <div
                  style={{
                    color: 'var(--color-white)',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  {spell.checkToCast}
                </div>

                {/* Energy */}
                <div
                  style={{
                    color: 'var(--color-white)',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  {spell.energy}
                </div>

                {/* Damage */}
                <div
                  style={{
                    color: spell.damage > 0 ? 'var(--color-sunset)' : 'var(--color-muted)',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  {spell.damage > 0 ? spell.damage : '-'}
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default SpellCompendium;

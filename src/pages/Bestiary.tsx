import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import TalentDisplay from '../components/character/TalentDisplay';
import { useCreatures, useCreatureStats } from '../hooks/useCreatures';

const Bestiary: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    type: '',
    tier: '',
    size: '',
    minCR: '',
    maxCR: '',
    search: '',
    isHomebrew: 'false',
  });

  const {
    data: creaturesData,
    loading,
    error,
    refetch,
  } = useCreatures({
    page: currentPage,
    limit: 20,
    ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== '')),
  });

  const { data: stats } = useCreatureStats();

  const creatureTypes = [
    'fiend',
    'undead',
    'divine',
    'monster',
    'humanoid',
    'construct',
    'plantoid',
    'fey',
    'elemental',
  ];
  const tiers = ['minion', 'grunt', 'standard', 'champion', 'elite', 'legend', 'mythic'];
  const sizes = ['tiny', 'small', 'medium', 'large', 'huge', 'gargantuan'];

  const getTierColor = (tier: string) => {
    const colors = {
      minion: 'var(--color-cloud)',
      grunt: 'var(--color-old-gold)',
      standard: 'var(--color-sunset)',
      champion: 'var(--color-stormy)',
      elite: 'var(--color-sat-purple)',
      legend: 'var(--color-metal-gold)',
      mythic: '#ff6b35',
    };
    return colors[tier as keyof typeof colors] || 'var(--color-cloud)';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      fiend: '👹',
      undead: '💀',
      divine: '✨',
      monster: '🐲',
      humanoid: '👤',
      construct: '🤖',
      plantoid: '🌿',
      fey: '🧚',
      elemental: '🔥',
    };
    return icons[type as keyof typeof icons] || '❓';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner size="lg" message="Loading creatures..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorState title="Failed to Load Bestiary" message={error} onRetry={refetch} size="lg" />
      </div>
    );
  }

  const creatures = creaturesData?.creatures || [];
  const totalPages = creaturesData?.pagination?.totalPages || 1;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1
            style={{
              color: 'var(--color-white)',
              fontFamily: 'var(--font-display)',
              fontSize: '2.5rem',
              fontWeight: 'bold',
            }}
          >
            Bestiary
          </h1>
          <p style={{ color: 'var(--color-cloud)', marginTop: '0.5rem' }}>
            Explore the official creatures that inhabit the world of Anyventure
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <Card variant="default" style={{ marginBottom: '2rem' }}>
          <CardHeader>
            <h2 style={{ color: 'var(--color-white)', fontSize: '1.25rem', fontWeight: 'bold' }}>
              Bestiary Overview
            </h2>
          </CardHeader>
          <CardBody>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{ color: 'var(--color-metal-gold)', fontSize: '2rem', fontWeight: 'bold' }}
                >
                  {stats.officialCreatures}
                </div>
                <div style={{ color: 'var(--color-cloud)', fontSize: '0.875rem' }}>
                  Official Creatures
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem' }}>
        {/* Filters */}
        <Card variant="default">
          <CardHeader>
            <h3 style={{ color: 'var(--color-white)', fontSize: '1.125rem', fontWeight: 'bold' }}>
              Filters
            </h3>
          </CardHeader>
          <CardBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Search */}
              <div>
                <label
                  style={{
                    color: 'var(--color-cloud)',
                    fontSize: '0.875rem',
                    display: 'block',
                    marginBottom: '0.25rem',
                  }}
                >
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search creatures..."
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: 'var(--color-dark-elevated)',
                    color: 'var(--color-white)',
                    border: '1px solid var(--color-dark-border)',
                    borderRadius: '0.375rem',
                  }}
                />
              </div>

              {/* Type */}
              <div>
                <label
                  style={{
                    color: 'var(--color-cloud)',
                    fontSize: '0.875rem',
                    display: 'block',
                    marginBottom: '0.25rem',
                  }}
                >
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: 'var(--color-dark-elevated)',
                    color: 'var(--color-white)',
                    border: '1px solid var(--color-dark-border)',
                    borderRadius: '0.375rem',
                  }}
                >
                  <option value="">All Types</option>
                  {creatureTypes.map((type) => (
                    <option key={type} value={type} style={{ textTransform: 'capitalize' }}>
                      {getTypeIcon(type)} {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tier */}
              <div>
                <label
                  style={{
                    color: 'var(--color-cloud)',
                    fontSize: '0.875rem',
                    display: 'block',
                    marginBottom: '0.25rem',
                  }}
                >
                  Tier
                </label>
                <select
                  value={filters.tier}
                  onChange={(e) => setFilters({ ...filters, tier: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: 'var(--color-dark-elevated)',
                    color: 'var(--color-white)',
                    border: '1px solid var(--color-dark-border)',
                    borderRadius: '0.375rem',
                  }}
                >
                  <option value="">All Tiers</option>
                  {tiers.map((tier) => (
                    <option key={tier} value={tier} style={{ textTransform: 'capitalize' }}>
                      {tier}
                    </option>
                  ))}
                </select>
              </div>

              {/* Size */}
              <div>
                <label
                  style={{
                    color: 'var(--color-cloud)',
                    fontSize: '0.875rem',
                    display: 'block',
                    marginBottom: '0.25rem',
                  }}
                >
                  Size
                </label>
                <select
                  value={filters.size}
                  onChange={(e) => setFilters({ ...filters, size: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: 'var(--color-dark-elevated)',
                    color: 'var(--color-white)',
                    border: '1px solid var(--color-dark-border)',
                    borderRadius: '0.375rem',
                  }}
                >
                  <option value="">All Sizes</option>
                  {sizes.map((size) => (
                    <option key={size} value={size} style={{ textTransform: 'capitalize' }}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              {/* Challenge Rating */}
              <div>
                <label
                  style={{
                    color: 'var(--color-cloud)',
                    fontSize: '0.875rem',
                    display: 'block',
                    marginBottom: '0.25rem',
                  }}
                >
                  Challenge Rating
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input
                    type="number"
                    value={filters.minCR}
                    onChange={(e) => setFilters({ ...filters, minCR: e.target.value })}
                    placeholder="Min CR"
                    min="1"
                    style={{
                      padding: '0.5rem',
                      backgroundColor: 'var(--color-dark-elevated)',
                      color: 'var(--color-white)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: '0.375rem',
                    }}
                  />
                  <input
                    type="number"
                    value={filters.maxCR}
                    onChange={(e) => setFilters({ ...filters, maxCR: e.target.value })}
                    placeholder="Max CR"
                    min="1"
                    style={{
                      padding: '0.5rem',
                      backgroundColor: 'var(--color-dark-elevated)',
                      color: 'var(--color-white)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: '0.375rem',
                    }}
                  />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Creatures List */}
        <div>
          {creatures.length === 0 ? (
            <EmptyState
              icon="🐲"
              title="No Creatures Found"
              description="No creatures match your current filters. Try adjusting your search criteria."
              size="md"
            />
          ) : (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                  gap: '1rem',
                }}
              >
                {creatures.map((creature) => (
                  <Link
                    key={creature._id}
                    to={`/bestiary/${creature._id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <Card
                      variant="default"
                      style={{
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        height: '100%',
                      }}
                      className="hover-lift"
                    >
                      <CardBody>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '0.75rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.5rem' }}>{getTypeIcon(creature.type)}</span>
                            <div>
                              <h3
                                style={{
                                  color: 'var(--color-white)',
                                  fontSize: '1.125rem',
                                  fontWeight: 'bold',
                                  margin: 0,
                                }}
                              >
                                {creature.name}
                              </h3>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  marginTop: '0.25rem',
                                }}
                              >
                                <span
                                  style={{
                                    color: getTierColor(creature.tier),
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    backgroundColor: 'var(--color-dark-elevated)',
                                    padding: '0.125rem 0.5rem',
                                    borderRadius: '0.25rem',
                                  }}
                                >
                                  {creature.tier}
                                </span>
                                <span
                                  style={{
                                    color: 'var(--color-cloud)',
                                    fontSize: '0.75rem',
                                    textTransform: 'capitalize',
                                  }}
                                >
                                  {creature.size} {creature.type}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            {(creature.tier === 'elite' || creature.tier === 'legend' || creature.tier === 'mythic') && (
                              <TalentDisplay talent={creature.challenge_rating} size="sm" />
                            )}
                          </div>
                        </div>

                        <p
                          style={{
                            color: 'var(--color-cloud)',
                            fontSize: '0.875rem',
                            lineHeight: '1.4',
                            margin: 0,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {creature.description}
                        </p>

                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '0.75rem',
                            paddingTop: '0.75rem',
                            borderTop: '1px solid var(--color-dark-border)',
                          }}
                        >
                          <div style={{ display: 'flex', gap: '1rem' }}>
                            <div>
                              <span style={{ color: 'var(--color-cloud)', fontSize: '0.75rem' }}>
                                Health:{' '}
                              </span>
                              <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                                {creature.health.max}
                              </span>
                            </div>
                            <div>
                              <span style={{ color: 'var(--color-cloud)', fontSize: '0.75rem' }}>
                                Move:{' '}
                              </span>
                              <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                                {creature.movement}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginTop: '2rem',
                  }}
                >
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor:
                        currentPage === 1 ? 'var(--color-dark-border)' : 'var(--color-stormy)',
                      color: 'var(--color-white)',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Previous
                  </button>

                  <span
                    style={{
                      color: 'var(--color-cloud)',
                      padding: '0.5rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor:
                        currentPage === totalPages
                          ? 'var(--color-dark-border)'
                          : 'var(--color-stormy)',
                      color: 'var(--color-white)',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bestiary;

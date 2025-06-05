import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardBody } from '../components/ui/Card';

interface HomebrewSpell {
  _id: string;
  name: string;
  description: string;
  charge?: string;
  duration: string;
  range: string;
  school: string;
  subschool: string;
  checkToCast: number;
  energy: number;
  damage: number;
  damageType?: string;
  concentration: boolean;
  reaction: boolean;
  creatorName: string;
  creatorId: string;
  status: 'draft' | 'private' | 'published' | 'approved' | 'rejected';
  tags: string[];
  source?: string;
  upvotes: number;
  downvotes: number;
  timesUsed: number;
  publishedAt?: string;
  createdAt: string;
  isHomebrew: true;
}

const HomebrewSpellBrowser: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError, prompt } = useToast();

  const [spells, setSpells] = useState<HomebrewSpell[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('published');
  const [sortBy, setSortBy] = useState('-publishedAt');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchSpells = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status: statusFilter,
        sort: sortBy,
        page: page.toString(),
        limit: '12',
      });

      if (schoolFilter !== 'all') params.append('school', schoolFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/homebrew/spells?${params}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch homebrew spells');

      const data = await response.json();
      setSpells(data.spells);
      setTotalPages(data.pagination.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load spells');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpells();
  }, [statusFilter, schoolFilter, sortBy, page]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (page === 1) {
        fetchSpells();
      } else {
        setPage(1);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const handleVote = async (spellId: string, voteType: 'up' | 'down') => {
    if (!user) return;

    try {
      const response = await fetch(`/api/homebrew/spells/${spellId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ vote: voteType }),
      });

      if (response.ok) {
        const { upvotes, downvotes } = await response.json();
        setSpells(
          spells.map((spell) => (spell._id === spellId ? { ...spell, upvotes, downvotes } : spell))
        );
        showSuccess(`Vote ${voteType === 'up' ? 'up' : 'down'} recorded!`);
      }
    } catch (err) {
      console.error('Failed to vote:', err);
      showError('Failed to record vote. Please try again.');
    }
  };

  const handleDelete = async (spellId: string) => {
    if (!user || !window.confirm('Are you sure you want to delete this spell? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/homebrew/spells/${spellId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setSpells(spells.filter(spell => spell._id !== spellId));
        showSuccess('Spell deleted successfully');
      } else {
        showError('Failed to delete spell');
      }
    } catch (err) {
      console.error('Failed to delete spell:', err);
      showError('Failed to delete spell. Please try again.');
    }
  };

  const handleReport = async (spellId: string, reason: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/homebrew/spells/${spellId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        showSuccess('Spell reported successfully. Thank you for helping keep the community safe!');
      }
    } catch (err) {
      console.error('Failed to report spell:', err);
      showError('Failed to submit report. Please try again.');
    }
  };

  const getSchoolColor = (school: string) => {
    switch (school.toLowerCase()) {
      case 'black':
        return 'var(--color-sunset)';
      case 'primal':
        return 'var(--color-old-gold)';
      case 'alteration':
        return 'var(--color-sat-purple)';
      case 'divine':
        return 'var(--color-stormy)';
      case 'mysticism':
        return 'var(--color-evening)';
      default:
        return 'var(--color-cloud)';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'var(--color-cloud)',
      private: 'var(--color-stormy)',
      published: 'var(--color-forest)',
      approved: 'var(--color-metal-gold)',
      rejected: 'var(--color-stormy)',
    };

    return (
      <span
        style={{
          backgroundColor: colors[status as keyof typeof colors] || 'var(--color-cloud)',
          color: 'var(--color-white)',
          padding: '0.125rem 0.375rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          textTransform: 'capitalize',
        }}
      >
        {status}
      </span>
    );
  };

  if (loading && spells.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div style={{ textAlign: 'center', color: 'var(--color-cloud)' }}>
          Loading homebrew spells...
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
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
            fontSize: '2.5rem',
            fontWeight: 'bold',
          }}
        >
          Homebrew Spells
        </h1>

        {user && (
          <Button variant="accent" onClick={() => navigate('/homebrew/spells/create')}>
            Create Spell
          </Button>
        )}
      </div>

      {error && (
        <div
          style={{
            backgroundColor: 'var(--color-stormy)',
            color: 'var(--color-white)',
            padding: '1rem',
            borderRadius: '0.375rem',
            marginBottom: '1rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Filters */}
      <Card variant="default" style={{ marginBottom: '2rem' }}>
        <CardBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Search */}
            <div>
              <input
                type="text"
                placeholder="Search spells..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'var(--color-dark-elevated)',
                  color: 'var(--color-white)',
                  border: '1px solid var(--color-dark-border)',
                  borderRadius: '0.375rem',
                }}
              />
            </div>

            {/* Filter row */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {/* Status filter */}
              <div>
                <label
                  style={{
                    color: 'var(--color-cloud)',
                    fontSize: '0.875rem',
                    marginBottom: '0.25rem',
                    display: 'block',
                  }}
                >
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    padding: '0.5rem',
                    backgroundColor: 'var(--color-dark-elevated)',
                    color: 'var(--color-white)',
                    border: '1px solid var(--color-dark-border)',
                    borderRadius: '0.375rem',
                  }}
                >
                  <option value="published">Published</option>
                  <option value="approved">Approved</option>
                  <option value="all">All Public</option>
                  {user && <option value="mine">My Spells</option>}
                </select>
              </div>

              {/* School filter */}
              <div>
                <label
                  style={{
                    color: 'var(--color-cloud)',
                    fontSize: '0.875rem',
                    marginBottom: '0.25rem',
                    display: 'block',
                  }}
                >
                  School
                </label>
                <select
                  value={schoolFilter}
                  onChange={(e) => setSchoolFilter(e.target.value)}
                  style={{
                    padding: '0.5rem',
                    backgroundColor: 'var(--color-dark-elevated)',
                    color: 'var(--color-white)',
                    border: '1px solid var(--color-dark-border)',
                    borderRadius: '0.375rem',
                  }}
                >
                  <option value="all">All Schools</option>
                  <option value="alteration">Alteration</option>
                  <option value="black">Black</option>
                  <option value="divine">Divine</option>
                  <option value="mysticism">Mysticism</option>
                  <option value="primal">Primal</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <label
                  style={{
                    color: 'var(--color-cloud)',
                    fontSize: '0.875rem',
                    marginBottom: '0.25rem',
                    display: 'block',
                  }}
                >
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: '0.5rem',
                    backgroundColor: 'var(--color-dark-elevated)',
                    color: 'var(--color-white)',
                    border: '1px solid var(--color-dark-border)',
                    borderRadius: '0.375rem',
                  }}
                >
                  <option value="-publishedAt">Newest</option>
                  <option value="publishedAt">Oldest</option>
                  <option value="-upvotes">Most Liked</option>
                  <option value="name">Name A-Z</option>
                  <option value="-name">Name Z-A</option>
                  <option value="checkToCast">Easiest First</option>
                  <option value="-checkToCast">Hardest First</option>
                </select>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Spells grid */}
      {spells.length === 0 ? (
        <Card variant="default">
          <CardBody>
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-cloud)' }}>
              No homebrew spells found.{' '}
              {user && statusFilter === 'mine' ? (
                <>
                  <Link to="/homebrew/spells/create" style={{ color: 'var(--color-metal-gold)' }}>
                    Create your first spell!
                  </Link>
                </>
              ) : (
                'Try adjusting your filters.'
              )}
            </div>
          </CardBody>
        </Card>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          {spells.map((spell) => (
            <Card key={spell._id} variant="default" hoverEffect>
              <CardHeader
                style={{
                  backgroundColor: getSchoolColor(spell.school),
                  opacity: 0.8,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <div>
                    <h3
                      style={{
                        color: 'var(--color-white)',
                        fontSize: '1.125rem',
                        fontWeight: 'bold',
                        marginBottom: '0.25rem',
                      }}
                    >
                      {spell.name}
                    </h3>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span
                        style={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: '0.75rem',
                          textTransform: 'capitalize',
                        }}
                      >
                        {spell.school} • {spell.subschool}
                      </span>
                      {getStatusBadge(spell.status)}
                    </div>
                  </div>

                  <span
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      color: 'var(--color-white)',
                      padding: '0.125rem 0.375rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                    }}
                  >
                    HOMEBREW
                  </span>
                </div>
              </CardHeader>

              <CardBody>
                <p
                  style={{
                    color: 'var(--color-cloud)',
                    fontSize: '0.875rem',
                    marginBottom: '1rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {spell.description}
                </p>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                    fontSize: '0.75rem',
                    color: 'var(--color-cloud)',
                  }}
                >
                  <div>
                    <strong>Cast DC:</strong> {spell.checkToCast}
                  </div>
                  <div>
                    <strong>Energy:</strong> {spell.energy}
                  </div>
                  <div>
                    <strong>Range:</strong> {spell.range}
                  </div>
                  <div>
                    <strong>Duration:</strong> {spell.duration}
                  </div>
                  {spell.damage > 0 && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <strong>Damage:</strong> {spell.damage} {spell.damageType}
                    </div>
                  )}
                </div>

                {(spell.concentration || spell.reaction) && (
                  <div
                    style={{
                      marginBottom: '1rem',
                      display: 'flex',
                      gap: '0.5rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    {spell.concentration && (
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
                    {spell.reaction && (
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
                  </div>
                )}

                {spell.tags.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {spell.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          style={{
                            backgroundColor: 'var(--color-dark-elevated)',
                            color: 'var(--color-cloud)',
                            padding: '0.125rem 0.375rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.625rem',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                      {spell.tags.length > 3 && (
                        <span
                          style={{
                            color: 'var(--color-cloud)',
                            fontSize: '0.625rem',
                            padding: '0.125rem 0.375rem',
                          }}
                        >
                          +{spell.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                    fontSize: '0.75rem',
                    color: 'var(--color-cloud)',
                  }}
                >
                  <span>by {spell.creatorName}</span>
                  <span>{spell.timesUsed} uses</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  {/* Voting */}
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {user && (
                      <>
                        <button
                          onClick={() => handleVote(spell._id, 'up')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-forest)',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                          }}
                        >
                          ▲ {spell.upvotes}
                        </button>
                        <button
                          onClick={() => handleVote(spell._id, 'down')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-stormy)',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                          }}
                        >
                          ▼ {spell.downvotes}
                        </button>
                      </>
                    )}
                    {!user && (
                      <span style={{ color: 'var(--color-cloud)', fontSize: '0.75rem' }}>
                        ▲ {spell.upvotes} ▼ {spell.downvotes}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/homebrew/spells/${spell._id}`)}
                    >
                      View
                    </Button>

                    {user && user.id === spell.creatorId && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/homebrew/spells/${spell._id}/edit`)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(spell._id)}
                        >
                          Delete
                        </Button>
                      </>
                    )}

                    {user && user.id !== spell.creatorId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          const reason = await prompt(
                            'Why are you reporting this spell?',
                            'Enter reason...'
                          );
                          if (reason) handleReport(spell._id, reason);
                        }}
                      >
                        Report
                      </Button>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

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
          <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page === 1}>
            Previous
          </Button>

          <span
            style={{
              color: 'var(--color-cloud)',
              padding: '0.5rem 1rem',
              alignSelf: 'center',
            }}
          >
            Page {page} of {totalPages}
          </span>

          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default HomebrewSpellBrowser;

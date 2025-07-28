import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardBody } from '../components/ui/Card';

interface HomebrewCreature {
  _id: string;
  name: string;
  description: string;
  type: string;
  tier: string;
  size: string;
  challenge_rating: number;
  creator: string;
  creatorName: string;
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

const HomebrewCreatureBrowser: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError, prompt } = useToast();

  const [creatures, setCreatures] = useState<HomebrewCreature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState(user ? 'draft' : 'published');
  const [sortBy, setSortBy] = useState('-publishedAt');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchCreatures = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status: statusFilter,
        sort: sortBy,
        page: page.toString(),
        limit: '12',
      });

      if (searchTerm) params.append('search', searchTerm);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (tierFilter !== 'all') params.append('tier', tierFilter);

      const response = await fetch(`/api/homebrew/creatures?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch creatures');
      }

      const data = await response.json();
      setCreatures(data.creatures || []);
      setTotalPages(data.pagination?.totalPages || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      showError('Failed to load creatures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreatures();
  }, [searchTerm, typeFilter, tierFilter, statusFilter, sortBy, page]);

  const handleVote = async (creatureId: string, voteType: 'up' | 'down') => {
    if (!user) {
      showError('You must be logged in to vote');
      return;
    }

    try {
      const response = await fetch(`/api/homebrew/creatures/${creatureId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vote: voteType }),
      });

      if (!response.ok) {
        throw new Error('Failed to vote');
      }

      showSuccess('Vote recorded!');
      fetchCreatures(); // Refresh the list
    } catch (err) {
      showError('Failed to vote on creature');
    }
  };

  const handleDelete = async (creatureId: string) => {
    const confirmed = await prompt(
      'Are you sure you want to delete this creature? This action cannot be undone.'
    );
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/homebrew/creatures/${creatureId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete creature');
      }

      showSuccess('Creature deleted successfully');
      fetchCreatures(); // Refresh the list
    } catch (err) {
      showError('Failed to delete creature');
    }
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

  const creatureTypes = [
    'all',
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
  const creatureTiers = [
    'all',
    'minion',
    'grunt',
    'standard',
    'champion',
    'elite',
    'legend',
    'mythic',
  ];

  if (loading && creatures.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <Link
          to="/homebrew"
          style={{
            color: 'var(--color-old-gold)',
            textDecoration: 'none',
            fontSize: '0.875rem',
          }}
        >
          ← Back to Homebrew
        </Link>
        <h1
          style={{
            color: 'var(--color-white)',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            margin: '1rem 0',
          }}
        >
          Homebrew Creatures
        </h1>
        <p style={{ color: 'var(--color-cloud)', fontSize: '1.125rem' }}>
          Discover and create custom monsters, beasts, and legendary creatures
        </p>
      </div>

      {/* Controls */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
          padding: '1.5rem',
          backgroundColor: 'var(--color-dark-elevated)',
          borderRadius: '0.5rem',
        }}
      >
        <div>
          <label
            style={{
              color: 'var(--color-white)',
              fontSize: '0.875rem',
              display: 'block',
              marginBottom: '0.5rem',
            }}
          >
            Search Creatures
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name..."
            style={{
              width: '100%',
              padding: '0.5rem',
              backgroundColor: 'var(--color-dark-surface)',
              border: '1px solid var(--color-dark-border)',
              borderRadius: '0.25rem',
              color: 'var(--color-white)',
              fontSize: '0.875rem',
            }}
          />
        </div>

        <div>
          <label
            style={{
              color: 'var(--color-white)',
              fontSize: '0.875rem',
              display: 'block',
              marginBottom: '0.5rem',
            }}
          >
            Type
          </label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              backgroundColor: 'var(--color-dark-surface)',
              border: '1px solid var(--color-dark-border)',
              borderRadius: '0.25rem',
              color: 'var(--color-white)',
              fontSize: '0.875rem',
            }}
          >
            {creatureTypes.map((type) => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            style={{
              color: 'var(--color-white)',
              fontSize: '0.875rem',
              display: 'block',
              marginBottom: '0.5rem',
            }}
          >
            Tier
          </label>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              backgroundColor: 'var(--color-dark-surface)',
              border: '1px solid var(--color-dark-border)',
              borderRadius: '0.25rem',
              color: 'var(--color-white)',
              fontSize: '0.875rem',
            }}
          >
            {creatureTiers.map((tier) => (
              <option key={tier} value={tier}>
                {tier === 'all' ? 'All Tiers' : tier.charAt(0).toUpperCase() + tier.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {user && (
          <div>
            <label
              style={{
                color: 'var(--color-white)',
                fontSize: '0.875rem',
                display: 'block',
                marginBottom: '0.5rem',
              }}
            >
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                backgroundColor: 'var(--color-dark-surface)',
                border: '1px solid var(--color-dark-border)',
                borderRadius: '0.25rem',
                color: 'var(--color-white)',
                fontSize: '0.875rem',
              }}
            >
              <option value="published">Published</option>
              <option value="approved">Approved</option>
              <option value="draft">My Drafts</option>
              <option value="private">My Private</option>
            </select>
          </div>
        )}

        <div>
          <label
            style={{
              color: 'var(--color-white)',
              fontSize: '0.875rem',
              display: 'block',
              marginBottom: '0.5rem',
            }}
          >
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              backgroundColor: 'var(--color-dark-surface)',
              border: '1px solid var(--color-dark-border)',
              borderRadius: '0.25rem',
              color: 'var(--color-white)',
              fontSize: '0.875rem',
            }}
          >
            <option value="-publishedAt">Newest</option>
            <option value="publishedAt">Oldest</option>
            <option value="-upvotes">Most Popular</option>
            <option value="name">Name A-Z</option>
            <option value="-name">Name Z-A</option>
            <option value="challenge_rating">Challenge Rating</option>
          </select>
        </div>
      </div>

      {/* Create Button */}
      {user && (
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <Button
            variant="accent"
            onClick={() => navigate('/homebrew/creatures/create')}
            style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}
          >
            + Create New Creature
          </Button>
        </div>
      )}

      {/* Results */}
      {error && (
        <div
          style={{
            color: 'var(--color-sunset)',
            textAlign: 'center',
            marginBottom: '2rem',
            padding: '1rem',
            backgroundColor: 'var(--color-dark-elevated)',
            borderRadius: '0.5rem',
          }}
        >
          {error}
        </div>
      )}

      {creatures.length === 0 && !loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'var(--color-cloud)',
          }}
        >
          <h3 style={{ color: 'var(--color-white)', marginBottom: '1rem' }}>No creatures found</h3>
          <p>Try adjusting your search terms or filters.</p>
        </div>
      ) : (
        <>
          {/* Creatures Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem',
            }}
          >
            {creatures.map((creature) => (
              <Card key={creature._id} variant="default" hoverEffect>
                <CardHeader style={{ padding: '1rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>{getTypeIcon(creature.type)}</span>
                      <div>
                        <h3
                          style={{
                            color: 'var(--color-white)',
                            fontWeight: 'bold',
                            margin: 0,
                            fontSize: '1.125rem',
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
                              textTransform: 'capitalize',
                            }}
                          >
                            {creature.tier}
                          </span>
                          <span style={{ color: 'var(--color-cloud)', fontSize: '0.75rem' }}>
                            CR {creature.challenge_rating}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleVote(creature._id, 'up')}
                          disabled={!user}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-cloud)',
                            cursor: user ? 'pointer' : 'not-allowed',
                            fontSize: '0.875rem',
                          }}
                        >
                          ▲ {creature.upvotes}
                        </button>
                        <button
                          onClick={() => handleVote(creature._id, 'down')}
                          disabled={!user}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-cloud)',
                            cursor: user ? 'pointer' : 'not-allowed',
                            fontSize: '0.875rem',
                          }}
                        >
                          ▼ {creature.downvotes}
                        </button>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardBody style={{ padding: '0 1rem 1rem' }}>
                  <p
                    style={{
                      color: 'var(--color-cloud)',
                      fontSize: '0.875rem',
                      lineHeight: '1.4',
                      marginBottom: '1rem',
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
                      marginBottom: '1rem',
                    }}
                  >
                    <span style={{ color: 'var(--color-cloud)', fontSize: '0.75rem' }}>
                      by {creature.creatorName}
                    </span>
                    <span style={{ color: 'var(--color-cloud)', fontSize: '0.75rem' }}>
                      Used {creature.timesUsed} times
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                      variant="primary"
                      onClick={() => navigate(`/bestiary/${creature._id}`)}
                      style={{ flex: 1, fontSize: '0.875rem' }}
                    >
                      View Details
                    </Button>

                    {user && user.id === creature.creator && (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() => navigate(`/homebrew/creatures/${creature._id}/edit`)}
                          style={{ fontSize: '0.875rem' }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDelete(creature._id)}
                          style={{ fontSize: '0.875rem' }}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              <Button
                variant="secondary"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Previous
              </Button>

              <span
                style={{
                  color: 'var(--color-white)',
                  padding: '0.5rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                Page {page} of {totalPages}
              </span>

              <Button
                variant="secondary"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HomebrewCreatureBrowser;

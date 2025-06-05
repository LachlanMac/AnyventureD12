import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardBody } from '../components/ui/Card';
import { formatGoldDisplay } from '../utils/valueUtils';

interface HomebrewItem {
  _id: string;
  name: string;
  description: string;
  type: string;
  rarity: string;
  weight: number;
  value: number;
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

const HomebrewItemBrowser: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError, prompt } = useToast();

  const [items, setItems] = useState<HomebrewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('published');
  const [sortBy, setSortBy] = useState('-publishedAt');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status: statusFilter,
        sort: sortBy,
        page: page.toString(),
        limit: '12',
      });

      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/homebrew/items?${params}`);
      if (!response.ok) throw new Error('Failed to fetch homebrew items');

      const data = await response.json();
      setItems(data.items);
      setTotalPages(data.pagination.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [statusFilter, typeFilter, sortBy, page]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (page === 1) {
        fetchItems();
      } else {
        setPage(1);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const handleVote = async (itemId: string, voteType: 'up' | 'down') => {
    if (!user) return;

    try {
      const response = await fetch(`/api/homebrew/items/${itemId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ vote: voteType }),
      });

      if (response.ok) {
        const { upvotes, downvotes } = await response.json();
        setItems(
          items.map((item) => (item._id === itemId ? { ...item, upvotes, downvotes } : item))
        );
        showSuccess(`Vote ${voteType === 'up' ? 'up' : 'down'} recorded!`);
      }
    } catch (err) {
      console.error('Failed to vote:', err);
      showError('Failed to record vote. Please try again.');
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!user || !window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/homebrew/items/${itemId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setItems(items.filter(item => item._id !== itemId));
        showSuccess('Item deleted successfully');
      } else {
        showError('Failed to delete item');
      }
    } catch (err) {
      console.error('Failed to delete item:', err);
      showError('Failed to delete item. Please try again.');
    }
  };

  const handleReport = async (itemId: string, reason: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/homebrew/items/${itemId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        showSuccess('Item reported successfully. Thank you for helping keep the community safe!');
      }
    } catch (err) {
      console.error('Failed to report item:', err);
      showError('Failed to submit report. Please try again.');
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common':
        return 'var(--color-cloud)';
      case 'uncommon':
        return 'var(--color-forest)';
      case 'rare':
        return 'var(--color-stormy)';
      case 'epic':
        return 'var(--color-sat-purple)';
      case 'legendary':
        return 'var(--color-sunset)';
      case 'artifact':
        return 'var(--color-metal-gold)';
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

  if (loading && items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div style={{ textAlign: 'center', color: 'var(--color-cloud)' }}>
          Loading homebrew items...
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
          Homebrew Items
        </h1>

        {user && (
          <Button variant="accent" onClick={() => navigate('/homebrew/items/create')}>
            Create Item
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
                placeholder="Search items..."
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
                  {user && <option value="mine">My Items</option>}
                </select>
              </div>

              {/* Type filter */}
              <div>
                <label
                  style={{
                    color: 'var(--color-cloud)',
                    fontSize: '0.875rem',
                    marginBottom: '0.25rem',
                    display: 'block',
                  }}
                >
                  Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  style={{
                    padding: '0.5rem',
                    backgroundColor: 'var(--color-dark-elevated)',
                    color: 'var(--color-white)',
                    border: '1px solid var(--color-dark-border)',
                    borderRadius: '0.375rem',
                  }}
                >
                  <option value="all">All Types</option>
                  <option value="weapon">Weapons</option>
                  <option value="body">Armor</option>
                  <option value="accessory">Accessories</option>
                  <option value="consumable">Consumables</option>
                  <option value="tool">Tools</option>
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
                </select>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Items grid */}
      {items.length === 0 ? (
        <Card variant="default">
          <CardBody>
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-cloud)' }}>
              No homebrew items found.{' '}
              {user && statusFilter === 'mine' ? (
                <>
                  <Link to="/homebrew/items/create" style={{ color: 'var(--color-metal-gold)' }}>
                    Create your first item!
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
          {items.map((item) => (
            <Card key={item._id} variant="default" hoverEffect>
              <CardHeader
                style={{
                  backgroundColor: getRarityColor(item.rarity),
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
                      {item.name}
                    </h3>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span
                        style={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: '0.75rem',
                          textTransform: 'capitalize',
                        }}
                      >
                        {item.type} • {item.rarity}
                      </span>
                      {getStatusBadge(item.status)}
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
                  {item.description}
                </p>

                {item.tags.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {item.tags.slice(0, 3).map((tag, index) => (
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
                      {item.tags.length > 3 && (
                        <span
                          style={{
                            color: 'var(--color-cloud)',
                            fontSize: '0.625rem',
                            padding: '0.125rem 0.375rem',
                          }}
                        >
                          +{item.tags.length - 3} more
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
                  <span>by {item.creatorName}</span>
                  <span>{item.timesUsed} uses</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    fontSize: '0.75rem',
                  }}
                >
                  <span style={{ color: 'var(--color-metal-gold)' }}>
                    {formatGoldDisplay(item.value)}
                  </span>
                  <span style={{ color: 'var(--color-cloud)' }}>{item.weight} lbs</span>
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
                          onClick={() => handleVote(item._id, 'up')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-forest)',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                          }}
                        >
                          ▲ {item.upvotes}
                        </button>
                        <button
                          onClick={() => handleVote(item._id, 'down')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-stormy)',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                          }}
                        >
                          ▼ {item.downvotes}
                        </button>
                      </>
                    )}
                    {!user && (
                      <span style={{ color: 'var(--color-cloud)', fontSize: '0.75rem' }}>
                        ▲ {item.upvotes} ▼ {item.downvotes}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/homebrew/items/${item._id}`)}
                    >
                      View
                    </Button>

                    {user && user.id === item.creatorId && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/homebrew/items/${item._id}/edit`)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(item._id)}
                        >
                          Delete
                        </Button>
                      </>
                    )}

                    {user && user.id !== item.creatorId && (
                      <div style={{ position: 'relative' }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            const reason = await prompt(
                              'Why are you reporting this item?',
                              'Enter reason...'
                            );
                            if (reason) handleReport(item._id, reason);
                          }}
                        >
                          Report
                        </Button>
                      </div>
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

export default HomebrewItemBrowser;

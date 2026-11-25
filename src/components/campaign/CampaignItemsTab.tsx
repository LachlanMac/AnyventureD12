import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import { useToast } from '../../context/ToastContext';

interface CampaignItem {
  _id: string;
  name: string;
  description?: string;
  type?: string;
  rarity?: string;
  value?: number;
  weight?: number;
  status?: string;
}

interface CampaignItemsTabProps {
  campaignId: string;
  isOwner: boolean;
}

const formatLabel = (text?: string) =>
  (text || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const formatValue = (silver?: number) => {
  if (!silver) return null;
  const gold = Math.floor(silver / 10);
  const rest = silver % 10;
  if (gold && rest) return `${gold}g ${rest}s`;
  return gold ? `${gold}g` : `${rest}s`;
};

const ItemSummary: React.FC<{ item: CampaignItem }> = ({ item }) => (
  <div style={{ minWidth: 0, flex: 1 }}>
    <div style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>{item.name}</div>
    <div
      style={{
        color: 'var(--color-cloud)',
        fontSize: '0.8rem',
        display: 'flex',
        gap: '0.75rem',
        flexWrap: 'wrap',
      }}
    >
      {item.type && <span>{formatLabel(item.type)}</span>}
      {item.rarity && <span>{formatLabel(item.rarity)}</span>}
      {formatValue(item.value) && <span>{formatValue(item.value)}</span>}
      {item.status && item.status !== 'published' && item.status !== 'approved' && (
        <span style={{ color: 'var(--color-metal-gold)' }}>Unpublished</span>
      )}
    </div>
    {item.description && (
      <div
        style={{
          color: 'var(--color-cloud)',
          fontSize: '0.85rem',
          marginTop: '0.25rem',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {item.description}
      </div>
    )}
  </div>
);

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  padding: '0.75rem 1rem',
  backgroundColor: 'var(--color-dark-elevated)',
  border: '1px solid var(--color-dark-border)',
  borderRadius: '0.375rem',
};

const CampaignItemsTab: React.FC<CampaignItemsTabProps> = ({ campaignId, isOwner }) => {
  const { showSuccess, showError } = useToast();
  const [items, setItems] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [available, setAvailable] = useState<CampaignItem[]>([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/items`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to load campaign items');
      setItems(await response.json());
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to load campaign items');
    } finally {
      setLoading(false);
    }
  }, [campaignId, showError]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openPicker = async () => {
    setShowPicker(true);
    setSearch('');
    setLoadingAvailable(true);
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/available-items`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to load your homebrew items');
      setAvailable(await response.json());
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to load your homebrew items');
    } finally {
      setLoadingAvailable(false);
    }
  };

  const addItem = async (item: CampaignItem) => {
    setBusyId(item._id);
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/items`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item._id }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || 'Failed to add item');
      setAvailable((prev) => prev.filter((i) => i._id !== item._id));
      setItems((prev) => [...prev, item].sort((a, b) => a.name.localeCompare(b.name)));
      showSuccess(`${item.name} added to the campaign`);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to add item');
    } finally {
      setBusyId(null);
    }
  };

  const removeItem = async (item: CampaignItem) => {
    setBusyId(item._id);
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/items/${item._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || 'Failed to remove item');
      setItems((prev) => prev.filter((i) => i._id !== item._id));
      showSuccess(`${item.name} removed from the campaign`);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to remove item');
    } finally {
      setBusyId(null);
    }
  };

  const filteredAvailable = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return available;
    return available.filter(
      (i) => i.name.toLowerCase().includes(term) || (i.type || '').toLowerCase().includes(term)
    );
  }, [available, search]);

  if (loading) {
    return (
      <div className="flex justify-center items-center" style={{ minHeight: '150px' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div>
      {isOwner && (
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <Button variant="accent" onClick={openPicker}>
            Add Item
          </Button>
          <Link to="/homebrew/items/create">
            <Button variant="secondary">Create Homebrew Item</Button>
          </Link>
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          size="sm"
          title="No campaign items yet"
          description={
            isOwner
              ? 'Add your homebrew items here and any character in this campaign can pick them from their item list.'
              : 'Your GM has not added any custom items to this campaign.'
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {items.map((item) => (
            <div key={item._id} style={rowStyle}>
              <ItemSummary item={item} />
              {isOwner && (
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <Link to={`/homebrew/items/${item._id}/edit`}>
                    <Button variant="secondary" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => removeItem(item)}
                    disabled={busyId === item._id}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Item picker */}
      {showPicker && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPicker(false);
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-dark-surface)',
              border: '1px solid var(--color-dark-border)',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              width: '90%',
              maxWidth: '640px',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3
                style={{
                  color: 'var(--color-white)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  margin: 0,
                }}
              >
                Add Your Homebrew Items
              </h3>
              <Button variant="secondary" size="sm" onClick={() => setShowPicker(false)}>
                Close
              </Button>
            </div>

            <input
              type="text"
              placeholder="Search your items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                backgroundColor: 'var(--color-dark-elevated)',
                border: '1px solid var(--color-dark-border)',
                borderRadius: '0.375rem',
                color: 'var(--color-white)',
              }}
            />

            <div
              style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
            >
              {loadingAvailable ? (
                <div className="flex justify-center" style={{ padding: '2rem' }}>
                  <div className="loading-spinner"></div>
                </div>
              ) : filteredAvailable.length === 0 ? (
                <div
                  style={{ color: 'var(--color-cloud)', textAlign: 'center', padding: '2rem 1rem' }}
                >
                  {available.length === 0 ? (
                    <>
                      You have no homebrew items left to add.{' '}
                      <Link
                        to="/homebrew/items/create"
                        style={{ color: 'var(--color-metal-gold)' }}
                      >
                        Create one
                      </Link>
                      .
                    </>
                  ) : (
                    'No items match your search.'
                  )}
                </div>
              ) : (
                filteredAvailable.map((item) => (
                  <div key={item._id} style={rowStyle}>
                    <ItemSummary item={item} />
                    <Button
                      variant="accent"
                      size="sm"
                      onClick={() => addItem(item)}
                      disabled={busyId === item._id}
                    >
                      Add
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignItemsTab;

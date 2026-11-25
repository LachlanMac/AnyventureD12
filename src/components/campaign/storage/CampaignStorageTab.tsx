import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Button from '../../ui/Button';
import { useToast } from '../../../context/ToastContext';
import {
  StorageActionDialog,
  StorageDialogResult,
  StorageItem,
  StorageLog,
  StorageSection,
  StorageView,
  formatLabel,
  storageRequest,
} from './storageShared';

type Which = 'gm' | 'party';

interface PickerItem {
  _id: string;
  name: string;
  type?: string;
  rarity?: string;
  source: 'Core' | 'Campaign' | 'My Homebrew';
}

interface DialogState {
  title: string;
  description?: string;
  confirmLabel: string;
  mode: 'item' | 'money';
  maxQuantity?: number;
  maxGold?: number;
  maxSilver?: number;
  initialGold?: number;
  initialSilver?: number;
  withCharacters?: boolean;
  run: (result: StorageDialogResult) => Promise<StorageView>;
  success: (result: StorageDialogResult) => string;
}

const otherName = (which: Which) => (which === 'gm' ? 'Party Storage' : 'GM Storage');

/** The GM's Storage tab: a private GM stash and the party storage, side by side. */
const CampaignStorageTab: React.FC<{ campaignId: string }> = ({ campaignId }) => {
  const { showSuccess, showError } = useToast();
  const [view, setView] = useState<StorageView | null>(null);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [pickerFor, setPickerFor] = useState<Which | null>(null);
  const [pickerItems, setPickerItems] = useState<PickerItem[] | null>(null);
  const [search, setSearch] = useState('');

  const base = `/api/campaigns/${campaignId}/storage`;

  const load = useCallback(async () => {
    try {
      setView(await storageRequest(base));
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to load storage');
    }
  }, [base, showError]);

  useEffect(() => {
    load();
  }, [load]);

  const runDialog = async (result: StorageDialogResult) => {
    if (!dialog) return;
    try {
      setView(await dialog.run(result));
      showSuccess(dialog.success(result));
      setDialog(null);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Something went wrong');
      load();
    }
  };

  const characterName = (id: string) => view?.characters.find((c) => c._id === id)?.name || 'them';

  const itemActions = (which: Which) => [
    {
      label: `To ${otherName(which).split(' ')[0]}`,
      color: 'var(--color-stormy)',
      onClick: (entry: StorageItem) =>
        setDialog({
          title: `Move ${entry.item.name}`,
          description: `Move to ${otherName(which)}.`,
          confirmLabel: 'Move',
          mode: 'item',
          maxQuantity: entry.quantity,
          run: (r) =>
            storageRequest(`${base}/${which}/items/${entry._id}/move`, 'POST', {
              quantity: r.quantity,
            }),
          success: (r) => `Moved ${entry.item.name} ×${r.quantity} to ${otherName(which)}`,
        }),
    },
    {
      label: 'Give',
      color: 'var(--color-metal-gold)',
      onClick: (entry: StorageItem) =>
        setDialog({
          title: `Give ${entry.item.name}`,
          description: 'Goes straight into the character’s inventory.',
          confirmLabel: 'Give',
          mode: 'item',
          maxQuantity: entry.quantity,
          withCharacters: true,
          run: (r) =>
            storageRequest(`${base}/${which}/items/${entry._id}/to-character`, 'POST', {
              characterId: r.characterId,
              quantity: r.quantity,
            }),
          success: (r) =>
            `Gave ${entry.item.name} ×${r.quantity} to ${characterName(r.characterId)}`,
        }),
    },
    {
      label: 'Remove',
      color: 'var(--color-destructive)',
      onClick: async (entry: StorageItem) => {
        try {
          setView(await storageRequest(`${base}/${which}/items/${entry._id}`, 'DELETE'));
          showSuccess(`Removed ${entry.item.name}`);
        } catch (err) {
          showError(err instanceof Error ? err.message : 'Failed to remove item');
        }
      },
    },
  ];

  const moneyActions = (which: Which) => [
    {
      label: 'Set',
      onClick: (storage: { gold: number; silver: number }) =>
        setDialog({
          title: `Set ${which === 'gm' ? 'GM' : 'Party'} Storage Money`,
          confirmLabel: 'Save',
          mode: 'money',
          initialGold: storage.gold,
          initialSilver: storage.silver,
          run: (r) =>
            storageRequest(`${base}/${which}/money`, 'PUT', { gold: r.gold, silver: r.silver }),
          success: (r) => `Money set to ${r.gold} gold and ${r.silver} silver`,
        }),
    },
    {
      label: `To ${otherName(which).split(' ')[0]}`,
      color: 'var(--color-stormy)',
      onClick: (storage: { gold: number; silver: number }) =>
        setDialog({
          title: 'Move Money',
          description: `Move to ${otherName(which)}.`,
          confirmLabel: 'Move',
          mode: 'money',
          maxGold: storage.gold,
          maxSilver: storage.silver,
          run: (r) =>
            storageRequest(`${base}/${which}/money/move`, 'POST', {
              gold: r.gold,
              silver: r.silver,
            }),
          success: (r) => `Moved ${r.gold}g ${r.silver}s to ${otherName(which)}`,
        }),
    },
    {
      label: 'Give',
      color: 'var(--color-metal-gold)',
      onClick: (storage: { gold: number; silver: number }) =>
        setDialog({
          title: 'Give Money',
          confirmLabel: 'Give',
          mode: 'money',
          maxGold: storage.gold,
          maxSilver: storage.silver,
          withCharacters: true,
          run: (r) =>
            storageRequest(`${base}/${which}/money/to-character`, 'POST', {
              characterId: r.characterId,
              gold: r.gold,
              silver: r.silver,
            }),
          success: (r) => `Gave ${r.gold}g ${r.silver}s to ${characterName(r.characterId)}`,
        }),
    },
  ];

  // Add Item picker: core items, the campaign's custom items, and the GM's own homebrew
  const openPicker = async (which: Which) => {
    setPickerFor(which);
    setSearch('');
    if (pickerItems) return;
    try {
      const get = async (url: string) => {
        const res = await fetch(url, { credentials: 'include' });
        return res.ok ? res.json() : [];
      };
      const [core, campaign, mine] = await Promise.all([
        get('/api/items?summary=true'),
        get(`/api/campaigns/${campaignId}/items`),
        get(`/api/campaigns/${campaignId}/available-items`),
      ]);
      const seen = new Set<string>();
      const all: PickerItem[] = [];
      const addAll = (list: PickerItem[], source: PickerItem['source']) => {
        for (const item of list || []) {
          if (seen.has(item._id)) continue;
          seen.add(item._id);
          all.push({
            _id: item._id,
            name: item.name,
            type: item.type,
            rarity: item.rarity,
            source,
          });
        }
      };
      addAll(campaign, 'Campaign');
      addAll(mine, 'My Homebrew');
      addAll(core, 'Core');
      setPickerItems(all);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to load items');
      setPickerFor(null);
    }
  };

  const filteredPicker = useMemo(() => {
    if (!pickerItems) return [];
    const term = search.trim().toLowerCase();
    const list = term
      ? pickerItems.filter(
          (i) => i.name.toLowerCase().includes(term) || (i.type || '').toLowerCase().includes(term)
        )
      : pickerItems;
    return list.slice(0, 100);
  }, [pickerItems, search]);

  const pickItem = (item: PickerItem) => {
    const which = pickerFor!;
    setPickerFor(null);
    setDialog({
      title: `Add ${item.name}`,
      description: `Add to ${which === 'gm' ? 'GM Storage' : 'Party Storage'}.`,
      confirmLabel: 'Add',
      mode: 'item',
      run: (r) =>
        storageRequest(`${base}/${which}/items`, 'POST', {
          itemId: item._id,
          quantity: r.quantity,
        }),
      success: (r) => `Added ${item.name} ×${r.quantity}`,
    });
  };

  if (!view || !view.gm) {
    return (
      <div className="flex justify-center items-center" style={{ minHeight: '150px' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const addButton = (which: Which) => (
    <Button variant="accent" size="sm" onClick={() => openPicker(which)}>
      Add Item
    </Button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1rem',
        }}
      >
        <StorageSection
          title="GM Storage"
          subtitle="Private. Players can't see this."
          storage={view.gm}
          itemActions={itemActions('gm')}
          moneyActions={moneyActions('gm')}
          headerAction={addButton('gm')}
          emptyText="Nothing here. Add items to prepare loot."
        />
        <StorageSection
          title="Party Storage"
          subtitle="Shared. Players can take and store items here."
          storage={view.party}
          itemActions={itemActions('party')}
          moneyActions={moneyActions('party')}
          headerAction={addButton('party')}
        />
      </div>

      <StorageLog log={view.log} showVisibility />

      {dialog && (
        <StorageActionDialog
          title={dialog.title}
          description={dialog.description}
          confirmLabel={dialog.confirmLabel}
          mode={dialog.mode}
          maxQuantity={dialog.maxQuantity}
          maxGold={dialog.maxGold}
          maxSilver={dialog.maxSilver}
          initialGold={dialog.initialGold}
          initialSilver={dialog.initialSilver}
          characters={dialog.withCharacters ? view.characters : undefined}
          onConfirm={runDialog}
          onClose={() => setDialog(null)}
        />
      )}

      {pickerFor && (
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
            if (e.target === e.currentTarget) setPickerFor(null);
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
                Add to {pickerFor === 'gm' ? 'GM Storage' : 'Party Storage'}
              </h3>
              <Button variant="secondary" size="sm" onClick={() => setPickerFor(null)}>
                Close
              </Button>
            </div>
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              style={{
                padding: '0.5rem 0.75rem',
                backgroundColor: 'var(--color-dark-elevated)',
                border: '1px solid var(--color-dark-border)',
                borderRadius: '0.375rem',
                color: 'var(--color-white)',
              }}
            />
            <div
              style={{
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.375rem',
              }}
            >
              {!pickerItems ? (
                <div className="flex justify-center" style={{ padding: '2rem' }}>
                  <div className="loading-spinner"></div>
                </div>
              ) : filteredPicker.length === 0 ? (
                <div style={{ color: 'var(--color-cloud)', textAlign: 'center', padding: '2rem' }}>
                  No items match your search.
                </div>
              ) : (
                filteredPicker.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => pickItem(item)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: 'var(--color-dark-elevated)',
                      border: '1px solid var(--color-dark-border)',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span>
                      <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                        {item.name}
                      </span>
                      <span
                        style={{
                          color: 'var(--color-cloud)',
                          fontSize: '0.8rem',
                          marginLeft: '0.5rem',
                        }}
                      >
                        {[formatLabel(item.type), formatLabel(item.rarity)]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    </span>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        color: 'var(--color-white)',
                        backgroundColor:
                          item.source === 'Core'
                            ? 'var(--color-stormy)'
                            : item.source === 'Campaign'
                              ? 'var(--color-sunset)'
                              : 'var(--color-sat-purple)',
                        padding: '0.1rem 0.4rem',
                        borderRadius: '9999px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.source.toUpperCase()}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignStorageTab;

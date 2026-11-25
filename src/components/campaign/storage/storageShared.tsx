import React, { useState } from 'react';
import Button from '../../ui/Button';

// Shared pieces for campaign storage: the GM's Storage tab on the campaign page
// and the Storage view in a character's Inventory tab.

export interface StorageItem {
  _id: string;
  quantity: number;
  isCustomized: boolean;
  item: {
    _id?: string;
    name: string;
    description?: string;
    type?: string;
    rarity?: string;
    value?: number;
    weight?: number;
  };
}

export interface StorageData {
  gold: number;
  silver: number;
  items: StorageItem[];
}

export interface StorageCharacter {
  _id: string;
  name: string;
  isMine: boolean;
}

export interface StorageView {
  isGM: boolean;
  party: StorageData;
  gm?: StorageData;
  characters: StorageCharacter[];
  log: { at: string; text: string; visibility: 'party' | 'gm' }[];
}

/** Call a storage endpoint. Returns the updated storage view, or throws with the server's message. */
export const storageRequest = async (
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: unknown
): Promise<StorageView> => {
  const response = await fetch(url, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Storage request failed');
  return data as StorageView;
};

export const formatLabel = (text?: string) =>
  (text || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const formatMoney = (gold: number, silver: number) => `${gold}g ${silver}s`;

const smallButton = (color: string): React.CSSProperties => ({
  backgroundColor: color,
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  padding: '0.25rem 0.5rem',
  cursor: 'pointer',
  fontSize: '0.75rem',
  whiteSpace: 'nowrap',
});

export interface StorageAction<T> {
  label: string;
  color?: string;
  onClick: (target: T) => void;
}

interface StorageSectionProps {
  title: string;
  subtitle?: string;
  storage: StorageData;
  itemActions: StorageAction<StorageItem>[];
  moneyActions: StorageAction<StorageData>[];
  headerAction?: React.ReactNode;
  emptyText?: string;
}

/** One storage: money row on top, then the item stacks with their action buttons. */
export const StorageSection: React.FC<StorageSectionProps> = ({
  title,
  subtitle,
  storage,
  itemActions,
  moneyActions,
  headerAction,
  emptyText = 'Nothing stored.',
}) => (
  <div
    style={{
      backgroundColor: 'var(--color-dark-elevated)',
      border: '1px solid var(--color-dark-border)',
      borderRadius: '0.5rem',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      minWidth: 0,
    }}
  >
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '0.5rem',
        flexWrap: 'wrap',
      }}
    >
      <div>
        <h3 style={{ color: 'var(--color-metal-gold)', margin: 0, fontSize: '1.1rem' }}>{title}</h3>
        {subtitle && (
          <div style={{ color: 'var(--color-cloud)', fontSize: '0.8rem' }}>{subtitle}</div>
        )}
      </div>
      {headerAction}
    </div>

    {/* Money */}
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem',
        flexWrap: 'wrap',
        padding: '0.5rem 0.75rem',
        backgroundColor: 'var(--color-dark-bg, var(--color-dark-surface))',
        borderRadius: '0.375rem',
      }}
    >
      <div style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
        <span style={{ color: 'var(--color-metal-gold)' }}>{storage.gold} gold</span>
        {'  '}
        <span style={{ color: '#c0c0c0', marginLeft: '0.75rem' }}>{storage.silver} silver</span>
      </div>
      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
        {moneyActions.map((action) => (
          <button
            key={action.label}
            onClick={() => action.onClick(storage)}
            style={smallButton(action.color || 'var(--color-primary)')}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>

    {/* Items */}
    {storage.items.length === 0 ? (
      <div style={{ color: 'var(--color-cloud)', textAlign: 'center', padding: '1rem' }}>
        {emptyText}
      </div>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        {storage.items.map((entry) => (
          <div
            key={entry._id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem 0.75rem',
              backgroundColor: 'var(--color-dark-bg, var(--color-dark-surface))',
              border: '1px solid var(--color-dark-border)',
              borderRadius: '0.375rem',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                {entry.item.name}
                <span style={{ color: 'var(--color-metal-gold)', marginLeft: '0.5rem' }}>
                  ×{entry.quantity}
                </span>
              </div>
              <div
                style={{
                  color: 'var(--color-cloud)',
                  fontSize: '0.75rem',
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                }}
              >
                {entry.item.type && <span>{formatLabel(entry.item.type)}</span>}
                {entry.item.rarity && <span>{formatLabel(entry.item.rarity)}</span>}
                {entry.isCustomized && (
                  <span style={{ color: 'var(--color-metal-gold)' }}>Customized</span>
                )}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                gap: '0.375rem',
                flexWrap: 'wrap',
                justifyContent: 'flex-end',
              }}
            >
              {itemActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => action.onClick(entry)}
                  style={smallButton(action.color || 'var(--color-primary)')}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export interface StorageDialogResult {
  quantity: number;
  characterId: string;
  gold: number;
  silver: number;
}

interface StorageActionDialogProps {
  title: string;
  description?: string;
  confirmLabel: string;
  /** 'item' asks for a quantity, 'money' asks for gold and silver */
  mode: 'item' | 'money';
  maxQuantity?: number;
  maxGold?: number;
  maxSilver?: number;
  /** Initial gold/silver (used when setting the amount rather than moving some) */
  initialGold?: number;
  initialSilver?: number;
  /** When set, shows a character dropdown */
  characters?: { _id: string; name: string }[];
  /** Label for that dropdown (defaults to "Character") */
  characterLabel?: string;
  onConfirm: (result: StorageDialogResult) => Promise<void>;
  onClose: () => void;
}

const inputStyle: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  backgroundColor: 'var(--color-dark-elevated)',
  border: '1px solid var(--color-dark-border)',
  borderRadius: '0.375rem',
  color: 'var(--color-white)',
  width: '100%',
};

const labelStyle: React.CSSProperties = {
  color: 'var(--color-cloud)',
  fontSize: '0.85rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  flex: 1,
};

/** Small dialog for a storage action: how many, how much, and (optionally) to whom. */
export const StorageActionDialog: React.FC<StorageActionDialogProps> = ({
  title,
  description,
  confirmLabel,
  mode,
  maxQuantity,
  maxGold,
  maxSilver,
  initialGold = 0,
  initialSilver = 0,
  characters,
  characterLabel = 'Character',
  onConfirm,
  onClose,
}) => {
  const [quantity, setQuantity] = useState(maxQuantity ?? 1);
  const [gold, setGold] = useState(initialGold);
  const [silver, setSilver] = useState(initialSilver);
  const [characterId, setCharacterId] = useState(characters?.[0]?._id || '');
  const [busy, setBusy] = useState(false);

  const clamp = (value: number, max?: number) =>
    Math.max(0, max === undefined ? value : Math.min(value, max));

  const submit = async () => {
    setBusy(true);
    try {
      await onConfirm({ quantity, characterId, gold, silver });
    } finally {
      setBusy(false);
    }
  };

  const invalid = (mode === 'item' && quantity < 1) || (characters && !characterId);

  return (
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
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-dark-surface)',
          border: '1px solid var(--color-dark-border)',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          width: '90%',
          maxWidth: '420px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <h3
          style={{
            color: 'var(--color-white)',
            fontFamily: 'var(--font-display)',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            margin: 0,
          }}
        >
          {title}
        </h3>
        {description && <p style={{ color: 'var(--color-cloud)', margin: 0 }}>{description}</p>}

        {characters && (
          <label style={labelStyle}>
            {characterLabel}
            <select
              value={characterId}
              onChange={(e) => setCharacterId(e.target.value)}
              style={inputStyle}
            >
              {characters.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        )}

        {mode === 'item' ? (
          <label style={labelStyle}>
            Quantity{maxQuantity !== undefined ? ` (max ${maxQuantity})` : ''}
            <input
              type="number"
              min={1}
              max={maxQuantity}
              value={quantity}
              onChange={(e) =>
                setQuantity(clamp(Math.floor(Number(e.target.value) || 0), maxQuantity))
              }
              style={inputStyle}
            />
          </label>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <label style={labelStyle}>
              Gold{maxGold !== undefined ? ` (max ${maxGold})` : ''}
              <input
                type="number"
                min={0}
                max={maxGold}
                value={gold}
                onChange={(e) => setGold(clamp(Math.floor(Number(e.target.value) || 0), maxGold))}
                style={inputStyle}
              />
            </label>
            <label style={labelStyle}>
              Silver{maxSilver !== undefined ? ` (max ${maxSilver})` : ''}
              <input
                type="number"
                min={0}
                max={maxSilver}
                value={silver}
                onChange={(e) =>
                  setSilver(clamp(Math.floor(Number(e.target.value) || 0), maxSilver))
                }
                style={inputStyle}
              />
            </label>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="accent" onClick={submit} disabled={busy || !!invalid}>
            {busy ? 'Working...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

/** Recent storage activity, newest first. */
export const StorageLog: React.FC<{ log: StorageView['log']; showVisibility?: boolean }> = ({
  log,
  showVisibility,
}) => (
  <div
    style={{
      backgroundColor: 'var(--color-dark-elevated)',
      border: '1px solid var(--color-dark-border)',
      borderRadius: '0.5rem',
      padding: '1rem',
    }}
  >
    <h3 style={{ color: 'var(--color-metal-gold)', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
      Activity
    </h3>
    {log.length === 0 ? (
      <div style={{ color: 'var(--color-cloud)' }}>No activity yet.</div>
    ) : (
      <div
        style={{
          maxHeight: '240px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}
      >
        {log.map((entry, index) => (
          <div key={index} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--color-cloud)', whiteSpace: 'nowrap' }}>
              {new Date(entry.at).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </span>
            <span style={{ color: 'var(--color-white)' }}>
              {entry.text}
              {showVisibility && entry.visibility === 'gm' && (
                <span style={{ color: 'var(--color-cloud)', marginLeft: '0.5rem' }}>(GM only)</span>
              )}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
);

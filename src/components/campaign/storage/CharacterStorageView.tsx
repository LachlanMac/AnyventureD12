import React, { useCallback, useEffect, useState } from 'react';
import { useToast } from '../../../context/ToastContext';
import {
  StorageActionDialog,
  StorageDialogResult,
  StorageItem,
  StorageLog,
  StorageSection,
  StorageView,
  storageRequest,
} from './storageShared';

interface DialogState {
  title: string;
  description?: string;
  confirmLabel: string;
  mode: 'item' | 'money';
  maxQuantity?: number;
  maxGold?: number;
  maxSilver?: number;
  run: (result: StorageDialogResult) => Promise<StorageView>;
  success: (result: StorageDialogResult) => string;
}

interface CharacterStorageViewProps {
  campaignId: string;
  characterId: string;
  characterGold: number;
  characterSilver: number;
  /** Called after anything moves in or out of this character's inventory or wallet */
  onCharacterChanged: () => void;
}

/** A character's view of their campaign's party storage: take items and money, store money. */
const CharacterStorageView: React.FC<CharacterStorageViewProps> = ({
  campaignId,
  characterId,
  characterGold,
  characterSilver,
  onCharacterChanged,
}) => {
  const { showSuccess, showError } = useToast();
  const [view, setView] = useState<StorageView | null>(null);
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const base = `/api/campaigns/${campaignId}/storage`;

  const load = useCallback(async () => {
    try {
      setView(await storageRequest(base));
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to load storage');
    }
  }, [base, showError]);

  useEffect(() => {
    setView(null);
    load();
  }, [load]);

  const runDialog = async (result: StorageDialogResult) => {
    if (!dialog) return;
    try {
      setView(await dialog.run(result));
      showSuccess(dialog.success(result));
      setDialog(null);
      onCharacterChanged();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Something went wrong');
      load();
    }
  };

  if (!view) {
    return (
      <div className="flex justify-center items-center" style={{ minHeight: '150px' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const takeItem = (entry: StorageItem) =>
    setDialog({
      title: `Take ${entry.item.name}`,
      confirmLabel: 'Take',
      mode: 'item',
      maxQuantity: entry.quantity,
      run: (r) =>
        storageRequest(`${base}/party/items/${entry._id}/to-character`, 'POST', {
          characterId,
          quantity: r.quantity,
        }),
      success: (r) => `Took ${entry.item.name} ×${r.quantity}`,
    });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <StorageSection
        title="Party Storage"
        subtitle="Shared with everyone in the campaign. Use Store on an inventory item to put it here."
        storage={view.party}
        itemActions={[{ label: 'Take', color: 'var(--color-metal-gold)', onClick: takeItem }]}
        moneyActions={[
          {
            label: 'Take',
            color: 'var(--color-metal-gold)',
            onClick: (storage) =>
              setDialog({
                title: 'Take Money',
                confirmLabel: 'Take',
                mode: 'money',
                maxGold: storage.gold,
                maxSilver: storage.silver,
                run: (r) =>
                  storageRequest(`${base}/party/money/to-character`, 'POST', {
                    characterId,
                    gold: r.gold,
                    silver: r.silver,
                  }),
                success: (r) => `Took ${r.gold}g ${r.silver}s`,
              }),
          },
          {
            label: 'Store',
            color: 'var(--color-stormy)',
            onClick: () =>
              setDialog({
                title: 'Store Money',
                description: `You have ${characterGold} gold and ${characterSilver} silver.`,
                confirmLabel: 'Store',
                mode: 'money',
                maxGold: characterGold,
                maxSilver: characterSilver,
                run: (r) =>
                  storageRequest(`${base}/party/money/deposit`, 'POST', {
                    characterId,
                    gold: r.gold,
                    silver: r.silver,
                  }),
                success: (r) => `Stored ${r.gold}g ${r.silver}s`,
              }),
          },
        ]}
        emptyText="The party storage is empty."
      />

      {/* Player's view: party activity only, even when the viewer is also the GM.
          (Non-GMs never receive GM-only entries from the server.) */}
      <StorageLog log={view.log.filter((entry) => entry.visibility === 'party')} />

      {dialog && (
        <StorageActionDialog
          title={dialog.title}
          description={dialog.description}
          confirmLabel={dialog.confirmLabel}
          mode={dialog.mode}
          maxQuantity={dialog.maxQuantity}
          maxGold={dialog.maxGold}
          maxSilver={dialog.maxSilver}
          onConfirm={runDialog}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
};

export default CharacterStorageView;

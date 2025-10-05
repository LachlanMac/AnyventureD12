import React from 'react';
import Button from '../../ui/Button';

interface PurchaseItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  itemCostInSilver: number;
  currentGold: number;
  currentSilver: number;
  onConfirm: () => void;
}

const PurchaseItemModal: React.FC<PurchaseItemModalProps> = ({
  isOpen,
  onClose,
  itemName,
  itemCostInSilver,
  currentGold,
  currentSilver,
  onConfirm,
}) => {
  if (!isOpen) return null;

  // Convert total currency to silver for calculation
  const totalSilver = currentGold * 10 + currentSilver;
  const canAfford = totalSilver >= itemCostInSilver;
  const newTotalSilver = totalSilver - itemCostInSilver;

  // Convert new total back to gold and silver
  const newGold = Math.floor(newTotalSilver / 10);
  const newSilver = newTotalSilver % 10;

  // Convert item cost to gold and silver for display
  const costGold = Math.floor(itemCostInSilver / 10);
  const costSilver = itemCostInSilver % 10;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--color-dark-bg)',
          border: '2px solid var(--color-dark-border)',
          borderRadius: '8px',
          padding: '2rem',
          maxWidth: '500px',
          width: '90%',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ color: 'var(--color-white)', marginBottom: '1.5rem' }}>
          Purchase Item
        </h2>

        {/* Item Name */}
        <div
          style={{
            backgroundColor: 'var(--color-dark-surface)',
            padding: '1rem',
            borderRadius: '6px',
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}
        >
          <h3 style={{ color: 'var(--color-old-gold)', margin: 0, fontSize: '1.1rem' }}>
            {itemName}
          </h3>
        </div>

        {/* Current Balance */}
        <div
          style={{
            backgroundColor: 'var(--color-dark-surface)',
            padding: '1rem',
            borderRadius: '6px',
            marginBottom: '1rem',
          }}
        >
          <h3
            style={{
              color: 'var(--color-cloud)',
              fontSize: '0.9rem',
              marginBottom: '0.5rem',
            }}
          >
            Current Balance
          </h3>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#FFD700', fontWeight: 'bold' }}>⚜</span>
              <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                {currentGold} Gold
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#C0C0C0', fontWeight: 'bold' }}>◉</span>
              <span style={{ color: 'var(--color-cloud)' }}>
                {currentSilver} Silver
              </span>
            </div>
          </div>
        </div>

        {/* Item Cost */}
        <div
          style={{
            backgroundColor: 'var(--color-dark-surface)',
            padding: '1rem',
            borderRadius: '6px',
            marginBottom: '1rem',
            border: '1px solid var(--color-sunset)',
          }}
        >
          <h3
            style={{
              color: 'var(--color-cloud)',
              fontSize: '0.9rem',
              marginBottom: '0.5rem',
            }}
          >
            Item Cost
          </h3>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {costGold > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#FFD700', fontWeight: 'bold' }}>⚜</span>
                <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                  {costGold} Gold
                </span>
              </div>
            )}
            {costSilver > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#C0C0C0', fontWeight: 'bold' }}>◉</span>
                <span style={{ color: 'var(--color-cloud)' }}>
                  {costSilver} Silver
                </span>
              </div>
            )}
            {costGold === 0 && costSilver === 0 && (
              <span style={{ color: 'var(--color-cloud)' }}>Free</span>
            )}
          </div>
        </div>

        {/* New Balance Preview */}
        {canAfford ? (
          <div
            style={{
              backgroundColor: 'var(--color-dark-surface)',
              padding: '1rem',
              borderRadius: '6px',
              marginBottom: '1.5rem',
              border: '1px solid var(--color-success)',
            }}
          >
            <h3
              style={{
                color: 'var(--color-cloud)',
                fontSize: '0.9rem',
                marginBottom: '0.5rem',
              }}
            >
              New Balance
            </h3>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#FFD700', fontWeight: 'bold' }}>⚜</span>
                <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>
                  {newGold} Gold
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#C0C0C0', fontWeight: 'bold' }}>◉</span>
                <span style={{ color: 'var(--color-cloud)' }}>
                  {newSilver} Silver
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              backgroundColor: 'rgba(180, 0, 0, 0.2)',
              padding: '1rem',
              borderRadius: '6px',
              marginBottom: '1.5rem',
              border: '1px solid var(--color-sunset)',
            }}
          >
            <p style={{ color: 'var(--color-sunset)', margin: 0, fontWeight: 'bold' }}>
              Insufficient funds! You need {itemCostInSilver - totalSilver} more silver.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirm} variant="primary" disabled={!canAfford}>
            {canAfford ? 'Purchase' : 'Cannot Afford'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseItemModal;

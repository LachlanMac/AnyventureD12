import React, { useState } from 'react';
import Button from '../../ui/Button';

interface CurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGold: number;
  currentSilver: number;
  onConfirm: (newGold: number, newSilver: number) => void;
}

const CurrencyModal: React.FC<CurrencyModalProps> = ({
  isOpen,
  onClose,
  currentGold,
  currentSilver,
  onConfirm,
}) => {
  const [mode, setMode] = useState<'add' | 'subtract'>('add');
  const [goldChange, setGoldChange] = useState(0);
  const [silverChange, setSilverChange] = useState(0);

  if (!isOpen) return null;

  const calculateNewBalance = () => {
    if (mode === 'add') {
      return {
        gold: currentGold + goldChange,
        silver: currentSilver + silverChange,
      };
    } else {
      return {
        gold: Math.max(0, currentGold - goldChange),
        silver: Math.max(0, currentSilver - silverChange),
      };
    }
  };

  const newBalance = calculateNewBalance();

  const handleConfirm = () => {
    onConfirm(newBalance.gold, newBalance.silver);
    setGoldChange(0);
    setSilverChange(0);
    onClose();
  };

  const handleCancel = () => {
    setGoldChange(0);
    setSilverChange(0);
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
      onClick={handleCancel}
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
          Manage Currency
        </h2>

        {/* Mode Toggle */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <Button
            onClick={() => setMode('add')}
            variant={mode === 'add' ? 'primary' : 'secondary'}
            style={{ flex: 1 }}
          >
            Add Currency
          </Button>
          <Button
            onClick={() => setMode('subtract')}
            variant={mode === 'subtract' ? 'primary' : 'secondary'}
            style={{ flex: 1 }}
          >
            Subtract Currency
          </Button>
        </div>

        {/* Current Balance */}
        <div
          style={{
            backgroundColor: 'var(--color-dark-surface)',
            padding: '1rem',
            borderRadius: '6px',
            marginBottom: '1.5rem',
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

        {/* Input Fields */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: 'block',
                color: 'var(--color-cloud)',
                fontSize: '0.9rem',
                marginBottom: '0.5rem',
              }}
            >
              Gold
            </label>
            <input
              type="number"
              min="0"
              value={goldChange}
              onChange={(e) => setGoldChange(Math.max(0, parseInt(e.target.value) || 0))}
              style={{
                width: '100%',
                padding: '0.5rem',
                backgroundColor: 'var(--color-dark-elevated)',
                border: '1px solid var(--color-dark-border)',
                borderRadius: '4px',
                color: 'var(--color-white)',
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: 'block',
                color: 'var(--color-cloud)',
                fontSize: '0.9rem',
                marginBottom: '0.5rem',
              }}
            >
              Silver
            </label>
            <input
              type="number"
              min="0"
              value={silverChange}
              onChange={(e) => setSilverChange(Math.max(0, parseInt(e.target.value) || 0))}
              style={{
                width: '100%',
                padding: '0.5rem',
                backgroundColor: 'var(--color-dark-elevated)',
                border: '1px solid var(--color-dark-border)',
                borderRadius: '4px',
                color: 'var(--color-white)',
              }}
            />
          </div>
        </div>

        {/* New Balance Preview */}
        <div
          style={{
            backgroundColor: 'var(--color-dark-surface)',
            padding: '1rem',
            borderRadius: '6px',
            marginBottom: '1.5rem',
            border: '1px solid var(--color-old-gold)',
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
                {newBalance.gold} Gold
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#C0C0C0', fontWeight: 'bold' }}>◉</span>
              <span style={{ color: 'var(--color-cloud)' }}>
                {newBalance.silver} Silver
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <Button onClick={handleCancel} variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirm} variant="primary">
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CurrencyModal;

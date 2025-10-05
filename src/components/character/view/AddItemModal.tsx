import React, { useState } from 'react';
import Button from '../../ui/Button';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  onConfirm: (quantity: number) => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  itemName,
  onConfirm,
}) => {
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(quantity);
    onClose();
    setQuantity(1); // Reset for next use
  };

  const handleCancel = () => {
    onClose();
    setQuantity(1); // Reset on cancel
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
          Add Item to Inventory
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

        {/* Quantity Input */}
        <div
          style={{
            backgroundColor: 'var(--color-dark-surface)',
            padding: '1rem',
            borderRadius: '6px',
            marginBottom: '1.5rem',
          }}
        >
          <label
            style={{
              display: 'block',
              color: 'var(--color-cloud)',
              fontSize: '0.9rem',
              marginBottom: '0.5rem',
            }}
          >
            Quantity
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'var(--color-dark-elevated)',
                color: 'var(--color-white)',
                border: '1px solid var(--color-dark-border)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1.2rem',
                fontWeight: 'bold',
              }}
            >
              −
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              style={{
                flex: 1,
                padding: '0.5rem',
                backgroundColor: 'var(--color-dark-elevated)',
                color: 'var(--color-white)',
                border: '1px solid var(--color-dark-border)',
                borderRadius: '4px',
                textAlign: 'center',
                fontSize: '1rem',
              }}
            />
            <button
              onClick={() => setQuantity(quantity + 1)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'var(--color-dark-elevated)',
                color: 'var(--color-white)',
                border: '1px solid var(--color-dark-border)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1.2rem',
                fontWeight: 'bold',
              }}
            >
              +
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <Button onClick={handleCancel} variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirm} variant="primary">
            Add to Inventory
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;

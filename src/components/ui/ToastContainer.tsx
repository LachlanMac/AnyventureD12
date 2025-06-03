import React from 'react';
import { useToast, Toast } from '../../context/ToastContext';

const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
  const { removeToast } = useToast();

  const getToastStyles = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return {
          background: 'var(--color-forest)',
          borderColor: 'var(--color-forest)',
          icon: '✓',
        };
      case 'error':
        return {
          background: 'var(--color-sunset)',
          borderColor: 'var(--color-sunset)',
          icon: '✕',
        };
      case 'warning':
        return {
          background: 'var(--color-old-gold)',
          borderColor: 'var(--color-old-gold)',
          icon: '⚠',
        };
      case 'info':
      default:
        return {
          background: 'var(--color-stormy)',
          borderColor: 'var(--color-stormy)',
          icon: 'ℹ',
        };
    }
  };

  const styles = getToastStyles(toast.type);

  return (
    <div
      style={{
        background: styles.background,
        color: 'var(--color-white)',
        padding: '1rem',
        borderRadius: '0.5rem',
        border: `1px solid ${styles.borderColor}`,
        marginBottom: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        minWidth: '300px',
        maxWidth: '500px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15)',
        animation: 'slideInRight 0.3s ease-out',
        position: 'relative',
      }}
    >
      <span
        style={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          minWidth: '24px',
          textAlign: 'center',
        }}
      >
        {styles.icon}
      </span>

      <span style={{ flex: 1, fontSize: '0.875rem', lineHeight: '1.4' }}>{toast.message}</span>

      <button
        onClick={() => removeToast(toast.id)}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.8)',
          cursor: 'pointer',
          fontSize: '1.25rem',
          padding: '0.25rem',
          borderRadius: '0.25rem',
          minWidth: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'none';
        }}
      >
        ×
      </button>
    </div>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <>
      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
      <div
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          zIndex: 9999,
          pointerEvents: 'none',
        }}
      >
        <div style={{ pointerEvents: 'auto' }}>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} />
          ))}
        </div>
      </div>
    </>
  );
};

export default ToastContainer;

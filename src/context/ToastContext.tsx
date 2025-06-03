import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type'], duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  removeToast: (id: string) => void;
  prompt: (message: string, placeholder?: string) => Promise<string | null>;
  confirm: (options: string | ConfirmOptions) => Promise<boolean>;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: Toast['type'] = 'info', duration = 4000) => {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const toast: Toast = { id, message, type, duration };

      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  const showSuccess = useCallback(
    (message: string, duration = 4000) => {
      showToast(message, 'success', duration);
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string, duration = 6000) => {
      showToast(message, 'error', duration);
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message: string, duration = 5000) => {
      showToast(message, 'warning', duration);
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string, duration = 4000) => {
      showToast(message, 'info', duration);
    },
    [showToast]
  );

  const prompt = useCallback((message: string, placeholder = ''): Promise<string | null> => {
    return new Promise((resolve) => {
      const modalId = 'prompt-modal-' + Date.now();
      let input = '';

      const handleSubmit = () => {
        document.getElementById(modalId)?.remove();
        resolve(input || null);
      };

      const handleCancel = () => {
        document.getElementById(modalId)?.remove();
        resolve(null);
      };

      const modal = document.createElement('div');
      modal.id = modalId;
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 1rem;
      `;

      modal.innerHTML = `
        <div style="
          background: var(--color-dark-elevated);
          border: 1px solid var(--color-dark-border);
          border-radius: 0.5rem;
          padding: 1.5rem;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
        ">
          <h3 style="
            color: var(--color-white);
            margin: 0 0 1rem 0;
            font-size: 1.125rem;
            font-weight: bold;
          ">${message}</h3>
          <input
            type="text"
            placeholder="${placeholder}"
            style="
              width: 100%;
              padding: 0.75rem;
              background: var(--color-dark-base);
              color: var(--color-white);
              border: 1px solid var(--color-dark-border);
              border-radius: 0.375rem;
              margin-bottom: 1rem;
              font-size: 1rem;
            "
            id="${modalId}-input"
          />
          <div style="
            display: flex;
            gap: 0.75rem;
            justify-content: flex-end;
          ">
            <button
              id="${modalId}-cancel"
              style="
                padding: 0.5rem 1rem;
                background: var(--color-dark-border);
                color: var(--color-cloud);
                border: none;
                border-radius: 0.375rem;
                cursor: pointer;
                font-size: 0.875rem;
              "
            >Cancel</button>
            <button
              id="${modalId}-submit"
              style="
                padding: 0.5rem 1rem;
                background: var(--color-metal-gold);
                color: var(--color-dark-base);
                border: none;
                border-radius: 0.375rem;
                cursor: pointer;
                font-weight: bold;
                font-size: 0.875rem;
              "
            >OK</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      const inputEl = document.getElementById(`${modalId}-input`) as HTMLInputElement;
      const submitBtn = document.getElementById(`${modalId}-submit`);
      const cancelBtn = document.getElementById(`${modalId}-cancel`);

      inputEl?.focus();

      inputEl?.addEventListener('input', (e) => {
        input = (e.target as HTMLInputElement).value;
      });

      inputEl?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSubmit();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          handleCancel();
        }
      });

      submitBtn?.addEventListener('click', handleSubmit);
      cancelBtn?.addEventListener('click', handleCancel);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) handleCancel();
      });
    });
  }, []);

  const confirm = useCallback((options: string | ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      const modalId = 'confirm-modal-' + Date.now();

      // Handle both string and object inputs for backwards compatibility
      const config =
        typeof options === 'string'
          ? { title: 'Confirm', message: options, confirmText: 'Confirm', cancelText: 'Cancel' }
          : { title: 'Confirm', confirmText: 'Confirm', cancelText: 'Cancel', ...options };

      const handleConfirm = () => {
        document.getElementById(modalId)?.remove();
        resolve(true);
      };

      const handleCancel = () => {
        document.getElementById(modalId)?.remove();
        resolve(false);
      };

      const modal = document.createElement('div');
      modal.id = modalId;
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 1rem;
      `;

      modal.innerHTML = `
        <div style="
          background: var(--color-dark-elevated);
          border: 1px solid var(--color-dark-border);
          border-radius: 0.5rem;
          padding: 1.5rem;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
        ">
          <h3 style="
            color: var(--color-white);
            margin: 0 0 1rem 0;
            font-size: 1.125rem;
            font-weight: bold;
          ">${config.title}</h3>
          <p style="
            color: var(--color-cloud);
            margin: 0 0 1.5rem 0;
            line-height: 1.5;
          ">${config.message}</p>
          <div style="
            display: flex;
            gap: 0.75rem;
            justify-content: flex-end;
          ">
            <button
              id="${modalId}-cancel"
              style="
                padding: 0.5rem 1rem;
                background: var(--color-dark-border);
                color: var(--color-cloud);
                border: none;
                border-radius: 0.375rem;
                cursor: pointer;
                font-size: 0.875rem;
              "
            >${config.cancelText}</button>
            <button
              id="${modalId}-confirm"
              style="
                padding: 0.5rem 1rem;
                background: var(--color-sunset);
                color: var(--color-white);
                border: none;
                border-radius: 0.375rem;
                cursor: pointer;
                font-weight: bold;
                font-size: 0.875rem;
              "
            >${config.confirmText}</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      const confirmBtn = document.getElementById(`${modalId}-confirm`);
      const cancelBtn = document.getElementById(`${modalId}-cancel`);

      confirmBtn?.focus();

      document.addEventListener('keydown', function keyHandler(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          document.removeEventListener('keydown', keyHandler);
          handleConfirm();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          document.removeEventListener('keydown', keyHandler);
          handleCancel();
        }
      });

      confirmBtn?.addEventListener('click', handleConfirm);
      cancelBtn?.addEventListener('click', handleCancel);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) handleCancel();
      });
    });
  }, []);

  const value: ToastContextType = {
    toasts,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    prompt,
    confirm,
  };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

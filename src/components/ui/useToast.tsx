import React from 'react';

interface Toast {
  id: string;
  title?: string;
  description?: string;
}

interface ToastContext {
  toasts: Toast[];
  toast: (toast: Omit<Toast, 'id'>) => void;
}

const ToastContext = React.createContext<ToastContext | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback(({ title, description }: Omit<Toast, 'id'>) => {
    const id = String(Date.now());
    setToasts((toasts) => [...toasts, { id, title, description }]);
    setTimeout(() => {
      setToasts((toasts) => toasts.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
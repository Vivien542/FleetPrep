// Système de notifications toast léger
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/cn';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  addToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />,
  error: <XCircle className="w-4 h-4 text-red-400 shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />,
  info: <Info className="w-4 h-4 text-blue-400 shrink-0" />,
};

const STYLES: Record<ToastType, string> = {
  success: 'border-green-800 bg-green-900/30',
  error: 'border-red-800 bg-red-900/30',
  warning: 'border-yellow-800 bg-yellow-900/30',
  info: 'border-blue-800 bg-blue-900/30',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  const value: ToastContextValue = {
    addToast,
    success: (m) => addToast(m, 'success'),
    error: (m) => addToast(m, 'error'),
    warning: (m) => addToast(m, 'warning'),
    info: (m) => addToast(m, 'info'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Conteneur des toasts */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg border',
              'bg-gray-900 shadow-xl animate-fade-in pointer-events-auto',
              STYLES[toast.type]
            )}
          >
            {ICONS[toast.type]}
            <p className="text-sm text-gray-200 flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-500 hover:text-gray-300 transition-colors ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast doit être utilisé dans un ToastProvider');
  return ctx;
}

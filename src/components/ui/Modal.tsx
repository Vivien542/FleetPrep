// Composant Modal réutilisable
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZE_STYLES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  // Fermeture sur Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Fond semi-transparent */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Contenu */}
      <div
        className={cn(
          'relative w-full bg-gray-900 border border-gray-700 rounded-xl shadow-2xl',
          'animate-fade-in',
          SIZE_STYLES[size]
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
            <h2 className="text-base font-semibold text-gray-100">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-300 transition-colors p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

interface ConfirmModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export function ConfirmModal({
  open,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  danger,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="sm">
      <p className="text-sm text-gray-300 mb-5">{message}</p>
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-lg border transition-colors',
            danger
              ? 'bg-red-800 hover:bg-red-700 text-white border-red-700'
              : 'bg-green-700 hover:bg-green-600 text-white border-green-600'
          )}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

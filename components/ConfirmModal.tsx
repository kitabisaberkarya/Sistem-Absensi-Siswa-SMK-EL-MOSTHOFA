
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';
import clsx from 'clsx';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: 'danger' | 'primary';
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<Props> = ({
  isOpen, onClose, onConfirm, title, message,
  confirmLabel = 'Hapus', confirmVariant = 'danger', isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div className={clsx(
            'flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center',
            confirmVariant === 'danger' ? 'bg-red-100' : 'bg-brand-100'
          )}>
            <AlertTriangle className={clsx(
              'w-5 h-5',
              confirmVariant === 'danger' ? 'text-red-600' : 'text-brand-600'
            )} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
            <p className="text-gray-500 text-sm mt-1 leading-relaxed">{message}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button
            onClick={onConfirm}
            isLoading={isLoading}
            className={clsx(
              confirmVariant === 'danger'
                ? 'bg-red-600 hover:bg-red-700 text-white border-red-600'
                : 'bg-brand-600 hover:bg-brand-700 text-white'
            )}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

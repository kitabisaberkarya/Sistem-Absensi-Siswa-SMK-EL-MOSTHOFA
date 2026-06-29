
import React from 'react';
import { useToast, Toast, ToastType } from '../context/ToastContext';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import clsx from 'clsx';

const iconMap: Record<ToastType, React.ElementType> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap: Record<ToastType, string> = {
  success: 'bg-white border-green-200 text-green-800',
  error: 'bg-white border-red-200 text-red-800',
  warning: 'bg-white border-yellow-200 text-yellow-800',
  info: 'bg-white border-blue-200 text-blue-800',
};

const iconColorMap: Record<ToastType, string> = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
};

const ToastItem = ({ toast }: { toast: Toast }) => {
  const { removeToast } = useToast();
  const Icon = iconMap[toast.type];
  return (
    <div className={clsx(
      'flex items-start gap-3 p-4 rounded-xl border shadow-lg min-w-[280px] max-w-sm animate-in slide-in-from-right-4 duration-300',
      colorMap[toast.type]
    )}>
      <Icon className={clsx('w-5 h-5 mt-0.5 flex-shrink-0', iconColorMap[toast.type])} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{toast.title}</p>
        {toast.message && <p className="text-xs mt-0.5 opacity-80">{toast.message}</p>}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer = () => {
  const { toasts } = useToast();
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  );
};

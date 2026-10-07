import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

export function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const Icon = type === 'success' ? CheckCircle : type === 'error' ? AlertCircle : null;
  const colors = type === 'success' ? 'text-success bg-success-fill border-success-border' :
                 type === 'error' ? 'text-danger bg-danger-fill border-danger-border' :
                 'text-text bg-surface-raised border-border';

  return (
    <div className={`fixed bottom-4 right-4 flex items-center p-3 border rounded-lg shadow-lg z-50 text-[13px] ${colors} animate-in slide-in-from-bottom-5`}>
      {Icon && <Icon className="w-4 h-4 mr-2 shrink-0" />}
      <span className="mr-4">{message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

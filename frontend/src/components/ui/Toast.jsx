import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export function Toast({ toast, onClose }) {
  if (!toast) return null;

  const { id, type = 'info', title, message } = toast;

  const styles = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />,
    },
    error: {
      bg: 'bg-red-50 border-red-200 text-red-900',
      icon: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    },
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: <Info className="w-5 h-5 text-[#1E3A5F] shrink-0" />,
    },
  };

  const currentStyle = styles[type] || styles.info;

  return (
    <div
      className={cn(
        'w-full max-w-sm rounded-lg border p-4 shadow-md flex items-start gap-3 transition-all transform animate-in slide-in-from-bottom-5',
        currentStyle.bg
      )}
      role="alert"
    >
      {currentStyle.icon}
      <div className="flex-1 min-w-0">
        {title && <h4 className="text-sm font-semibold mb-0.5">{title}</h4>}
        {message && <p className="text-xs opacity-90 leading-normal">{message}</p>}
      </div>
      {onClose && (
        <button
          onClick={() => onClose(id)}
          className="text-gray-500 hover:text-gray-700 p-0.5 rounded-md hover:bg-black/5"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

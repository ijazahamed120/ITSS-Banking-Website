import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Modal } from './Modal.jsx';
import { Button } from './Button.jsx';

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this operation?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) {
  const icons = {
    danger: <AlertTriangle className="w-8 h-8 text-red-600 shrink-0" />,
    warning: <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0" />,
    info: <Info className="w-8 h-8 text-[#1E3A5F] shrink-0" />,
    success: <CheckCircle className="w-8 h-8 text-emerald-600 shrink-0" />,
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-slate-50 rounded-full">{icons[variant] || icons.info}</div>
        <div className="flex-1">
          <p className="text-sm text-[#6B7280] leading-relaxed">{message}</p>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[#E2E5EA]">
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button
          variant={variant === 'danger' ? 'danger' : 'primary'}
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : confirmText}
        </Button>
      </div>
    </Modal>
  );
}

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { Button } from './Button.jsx';

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
  className = '',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div
        className={cn(
          'w-full bg-white rounded-xl shadow-lg border border-[#E2E5EA] overflow-hidden flex flex-col max-h-[90vh]',
          maxWidth,
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#E2E5EA] flex items-center justify-between bg-white shrink-0">
          <div>
            <h3 id="modal-title" className="text-lg font-semibold text-[#111827]">
              {title}
            </h3>
            {subtitle && <p className="text-xs text-[#6B7280] mt-0.5">{subtitle}</p>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-[#6B7280] hover:text-[#111827]"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

import { useToastContext } from '../context/ToastContext.jsx';

export function useToast() {
  const { addToast, removeToast } = useToastContext();

  return {
    toast: addToast,
    success: (title, message) => addToast({ type: 'success', title, message }),
    error: (title, message) => addToast({ type: 'error', title, message }),
    warning: (title, message) => addToast({ type: 'warning', title, message }),
    info: (title, message) => addToast({ type: 'info', title, message }),
    dismiss: removeToast,
  };
}

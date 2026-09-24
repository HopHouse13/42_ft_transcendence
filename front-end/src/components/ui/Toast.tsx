import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number; // Duration in ms before auto-dismissing (default: 3000ms)
  onClose: () => void;
  position?: 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start' | 'bottom-center' | 'top-center';
}

const typeClassMap: Record<ToastType, string> = {
  success: 'alert-success',
  error: 'alert-error',
  info: 'alert-info',
  warning: 'alert-warning',
};

const positionClassMap: Record<NonNullable<ToastProps['position']>, string> = {
  'top-end': 'toast-top toast-end',
  'top-start': 'toast-top toast-start',
  'top-center': 'toast-top toast-center',
  'bottom-end': 'toast-bottom toast-end',
  'bottom-start': 'toast-bottom toast-start',
  'bottom-center': 'toast-bottom toast-center',
};

export function Toast({
  message,
  type = 'info',
  duration = 3000,
  onClose,
  position = 'bottom-end',
}: ToastProps): React.JSX.Element {
  useEffect(() => {
    if (duration <= 0) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`toast ${positionClassMap[position]} z-50`}>
      <div className={`alert ${typeClassMap[type]} text-sm shadow-lg flex items-center justify-between gap-4`}>
        <span>{message}</span>
        <button
          onClick={onClose}
          className="btn btn-xs btn-circle btn-ghost"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
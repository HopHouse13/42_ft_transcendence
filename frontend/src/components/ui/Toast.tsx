import React, { useEffect } from 'react';
import type { ToastType, ToastProps } from '../../types/toastTypes';

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
  position = 'top-start',
  topOffset = 96,
}: ToastProps): React.JSX.Element {
  useEffect(() => {
    if (duration <= 0) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`toast ${positionClassMap[position]} z-50`}
      style={position.startsWith('top') ? { top: `${topOffset}px` } : undefined}
    >
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
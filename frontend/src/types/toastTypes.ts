export type ToastType = 'success' | 'error' | 'info' | 'warning';

export type ToastPosition = 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start' | 'bottom-center' | 'top-center';

export interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number; // Duration in ms before auto-dismissing (default: 3000ms)
  onClose: () => void;
  topOffset: number;
  position?: ToastPosition;
}

export type ToastAction = {
  success: (message: string, position?: ToastPosition) => void;
  error: (message: string, position?: ToastPosition) => void;
  info: (message: string, position?: ToastPosition) => void;
  warning: (message: string, position?: ToastPosition) => void;
};
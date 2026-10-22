import { createContext, useContext } from "react";
import type { ToastAction } from "../types/toastTypes";

export const ToastContext = createContext<ToastAction | null>(null);

export function useToast(): ToastAction {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }

  return context;
}
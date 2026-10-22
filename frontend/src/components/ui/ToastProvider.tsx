import React, { useState } from "react";
import { Toast } from "./Toast";
import type { ToastAction, ToastPosition, ToastType } from "../../types/toastTypes";
import { ToastContext } from "../../hooks/useToast";

type ToastMessage = {
  message: string;
  type: ToastType;
  position?: ToastPosition;
};

export function ToastProvider({ children, }: { children: React.ReactNode;}): React.JSX.Element {
    const [currentToast, setCurrentToast] = useState<ToastMessage | null>(null);

    const showToast = (type: ToastType, message: string, position: ToastPosition = 'top-start') => {
        setCurrentToast({ type, message, position });
    };

    const toastAction: ToastAction = {
        success: (message, position) => showToast('success', message, position),
        error: (message, position) => showToast('error', message, position),
        info: (message, position) => showToast('info', message, position),
        warning: (message, position) => showToast('warning', message, position),
    };

    return (
        <ToastContext.Provider value={toastAction}>
            {children}

            {currentToast && (
                <Toast
                    message={currentToast.message}
                    type={currentToast.type}
                    position={currentToast.position}
                    topOffset={96}
                    onClose={() => setCurrentToast(null)}
                />
            )}
        </ToastContext.Provider>
    );
}

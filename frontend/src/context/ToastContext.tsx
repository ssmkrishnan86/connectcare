import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

export interface ToastOptions {
  type?: ToastType;
  title?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, options?: ToastOptions) => void;
  removeToast: (id: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Global dispatcher to allow toast calls outside React components
type ToastListener = (toast: ToastItem) => void;
const toastListeners = new Set<ToastListener>();

export const toast = {
  show: (message: string, options?: ToastOptions) => {
    const item: ToastItem = {
      id: Math.random().toString(36).substring(2, 9),
      type: options?.type || 'info',
      title: options?.title,
      message,
      duration: options?.duration ?? 4000,
    };
    toastListeners.forEach((listener) => listener(item));
    return item.id;
  },
  success: (message: string, title?: string) => {
    return toast.show(message, { type: 'success', title: title || 'Success' });
  },
  error: (message: string, title?: string) => {
    return toast.show(message, { type: 'error', title: title || 'Error' });
  },
  warning: (message: string, title?: string) => {
    return toast.show(message, { type: 'warning', title: title || 'Warning' });
  },
  info: (message: string, title?: string) => {
    return toast.show(message, { type: 'info', title: title || 'Information' });
  },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((item: ToastItem) => {
    setToasts((prev) => [...prev, item]);
    if (item.duration && item.duration > 0) {
      setTimeout(() => {
        removeToast(item.id);
      }, item.duration);
    }
  }, [removeToast]);

  const showToast = useCallback(
    (message: string, options?: ToastOptions) => {
      const item: ToastItem = {
        id: Math.random().toString(36).substring(2, 9),
        type: options?.type || 'info',
        title: options?.title,
        message,
        duration: options?.duration ?? 4000,
      };
      addToast(item);
    },
    [addToast]
  );

  const success = useCallback((message: string, title?: string) => showToast(message, { type: 'success', title: title || 'Success' }), [showToast]);
  const error = useCallback((message: string, title?: string) => showToast(message, { type: 'error', title: title || 'Error' }), [showToast]);
  const warning = useCallback((message: string, title?: string) => showToast(message, { type: 'warning', title: title || 'Warning' }), [showToast]);
  const info = useCallback((message: string, title?: string) => showToast(message, { type: 'info', title: title || 'Information' }), [showToast]);

  useEffect(() => {
    const handleGlobalToast: ToastListener = (item) => {
      addToast(item);
    };
    toastListeners.add(handleGlobalToast);

    // Global override to catch any native window.alert and route to in-app toast
    const originalAlert = window.alert;
    window.alert = (msg?: any) => {
      toast.info(String(msg ?? ''));
    };

    return () => {
      toastListeners.delete(handleGlobalToast);
      window.alert = originalAlert;
    };
  }, [addToast]);

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-indigo-400 shrink-0" />;
    }
  };

  const getBgBadge = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300';
      case 'error':
        return 'bg-rose-500/10 border-rose-500/20 text-rose-300';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-300';
      case 'info':
      default:
        return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, removeToast, success, error, warning, info }}>
      {children}

      {/* Floating Global Toast Stack */}
      <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto bg-slate-900/95 text-slate-100 p-4 rounded-2xl shadow-2xl border border-slate-700/60 backdrop-blur-md flex items-start gap-3.5 animate-in fade-in slide-in-from-top-3 duration-200"
          >
            <div className={`p-2 rounded-xl border ${getBgBadge(t.type)}`}>
              {getIcon(t.type)}
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              {t.title && (
                <p className="text-xs font-bold text-white leading-tight mb-0.5">{t.title}</p>
              )}
              <p className="text-xs font-medium text-slate-300 break-words leading-relaxed">
                {t.message}
              </p>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0 -mr-1 -mt-1"
              aria-label="Close notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return toast;
  }
  return context;
};

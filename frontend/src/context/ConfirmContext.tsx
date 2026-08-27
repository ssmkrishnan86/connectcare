import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AlertTriangle, Trash2, HelpCircle, X } from 'lucide-react';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  resolve?: (value: boolean) => void;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions | string) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

// Global confirmation listener
type ConfirmHandler = (options: ConfirmOptions | string) => Promise<boolean>;
let globalConfirmHandler: ConfirmHandler | null = null;

export const confirmAction = (options: ConfirmOptions | string): Promise<boolean> => {
  if (globalConfirmHandler) {
    return globalConfirmHandler(options);
  }
  // Fallback if provider not mounted yet
  return Promise.resolve(window.confirm(typeof options === 'string' ? options : options.message));
};

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ConfirmState>({
    isOpen: false,
    message: '',
  });

  const confirm = useCallback((options: ConfirmOptions | string): Promise<boolean> => {
    return new Promise((resolve) => {
      const opts: ConfirmOptions =
        typeof options === 'string'
          ? {
              title: 'Please Confirm',
              message: options,
              confirmText: 'Confirm',
              cancelText: 'Cancel',
              variant: options.toLowerCase().includes('delete') || options.toLowerCase().includes('remove') ? 'danger' : 'primary',
            }
          : {
              title: options.title || 'Please Confirm',
              message: options.message,
              confirmText: options.confirmText || 'Confirm',
              cancelText: options.cancelText || 'Cancel',
              variant: options.variant || 'primary',
            };

      setState({
        ...opts,
        isOpen: true,
        resolve,
      });
    });
  }, []);

  useEffect(() => {
    globalConfirmHandler = confirm;
    return () => {
      globalConfirmHandler = null;
    };
  }, [confirm]);

  const handleClose = useCallback(
    (confirmed: boolean) => {
      if (state.resolve) {
        state.resolve(confirmed);
      }
      setState((prev) => ({ ...prev, isOpen: false, resolve: undefined }));
    },
    [state]
  );

  // Keyboard shortcut listener
  useEffect(() => {
    if (!state.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose(false);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleClose(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.isOpen, handleClose]);

  const getVariantStyles = () => {
    switch (state.variant) {
      case 'danger':
        return {
          icon: <Trash2 className="h-6 w-6 text-rose-600" />,
          iconBg: 'bg-rose-100 text-rose-600',
          btnClass: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/25',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-amber-600" />,
          iconBg: 'bg-amber-100 text-amber-600',
          btnClass: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/25',
        };
      case 'primary':
      default:
        return {
          icon: <HelpCircle className="h-6 w-6 text-purple-600" />,
          iconBg: 'bg-purple-100 text-purple-600',
          btnClass: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/25',
        };
    }
  };

  const variantStyle = getVariantStyles();

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {state.isOpen && (
        <div className="fixed inset-0 z-[99998] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 text-slate-800 animate-in zoom-in-95 duration-150 relative overflow-hidden"
            role="alertdialog"
            aria-modal="true"
          >
            <button
              onClick={() => handleClose(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-4 ${variantStyle.iconBg}`}>
                {variantStyle.icon}
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-2">
                {state.title || 'Confirm Action'}
              </h3>

              <p className="text-xs font-medium text-slate-600 mb-6 leading-relaxed">
                {state.message}
              </p>

              <div className="flex items-center justify-center gap-3 w-full">
                <button
                  type="button"
                  onClick={() => handleClose(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
                >
                  {state.cancelText || 'Cancel'}
                </button>

                <button
                  type="button"
                  autoFocus
                  onClick={() => handleClose(true)}
                  className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-xs shadow-md transition-all ${variantStyle.btnClass}`}
                >
                  {state.confirmText || 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    return confirmAction;
  }
  return context.confirm;
};

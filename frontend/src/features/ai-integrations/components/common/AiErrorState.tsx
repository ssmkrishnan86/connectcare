import React from 'react';
import { AlertCircle, RefreshCw, ShieldAlert, ArrowRight } from 'lucide-react';

interface AiErrorStateProps {
  title?: string;
  errorMessage?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  onContinueWithoutAi?: () => void;
  className?: string;
}

export const AiErrorState: React.FC<AiErrorStateProps> = ({
  title = 'AI Service Unavailable',
  errorMessage = 'The clinical AI provider or orchestration pipeline could not be reached. Deterministic patient data remains intact.',
  onRetry,
  isRetrying = false,
  onContinueWithoutAi,
  className = '',
}) => {
  return (
    <div className={`p-6 rounded-2xl border border-rose-200 bg-rose-50/40 shadow-xs space-y-4 font-sans ${className}`}>
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-bold text-rose-950">{title}</h3>
          <p className="text-xs text-rose-800 leading-relaxed font-normal">{errorMessage}</p>
          <div className="pt-1 flex items-center gap-1.5 text-[11px] font-semibold text-rose-700">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>ConnectCare safety protocol: Default or fabricated clinical facts are never rendered on failure.</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-rose-200/60">
        {onRetry && (
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Retrying...' : 'Retry AI Generation'}</span>
          </button>
        )}

        {onContinueWithoutAi && (
          <button
            onClick={onContinueWithoutAi}
            className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-50 border border-rose-200 text-rose-900 rounded-xl text-xs font-bold shadow-2xs transition cursor-pointer"
          >
            <span>Continue to Standard Chart</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AiErrorState;

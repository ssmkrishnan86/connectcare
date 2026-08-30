import React from 'react';
import { Sparkles, Loader2, Shield } from 'lucide-react';

interface AiLoadingStateProps {
  operation?: string;
  subtext?: string;
  className?: string;
}

export const AiLoadingState: React.FC<AiLoadingStateProps> = ({
  operation = 'Synthesizing Clinical AI Intelligence...',
  subtext = 'Retrieving authorized patient context, applying clinical safety guardrails, and running AI orchestration.',
  className = '',
}) => {
  return (
    <div className={`p-8 rounded-2xl border border-indigo-100 bg-white shadow-xs flex flex-col items-center justify-center text-center space-y-4 font-sans ${className}`}>
      <div className="relative flex items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
          <Sparkles className="w-7 h-7 animate-pulse text-indigo-600" />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-xs">
          <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
        </div>
      </div>

      <div className="space-y-1.5 max-w-md">
        <h3 className="text-sm font-bold text-slate-900">{operation}</h3>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">{subtext}</p>
      </div>

      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] font-semibold text-slate-600">
        <Shield className="w-3 h-3 text-emerald-600" />
        <span>Minimum-Necessary PHI Boundary & Safety Validation Active</span>
      </div>
    </div>
  );
};

export default AiLoadingState;

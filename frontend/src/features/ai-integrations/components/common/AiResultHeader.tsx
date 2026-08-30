import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Clock,
  Zap,
  Layers,
  BookOpen,
  History,
  AlertTriangle
} from 'lucide-react';

interface AiResultHeaderProps {
  title?: string;
  modelVersion?: string;
  generatedAt?: string;
  latencyMs?: number;
  dataFreshness?: string;
  isAiGenerated?: boolean;
  reviewStatus?: string;
  safetyStatus?: string;
  onOpenContext?: () => void;
  onOpenEvidence?: () => void;
  onOpenAudit?: () => void;
  className?: string;
}

export const AiResultHeader: React.FC<AiResultHeaderProps> = ({
  title,
  modelVersion = 'gpt-4o',
  generatedAt,
  latencyMs,
  dataFreshness,
  isAiGenerated = true,
  reviewStatus = 'Human Review Required',
  safetyStatus = 'Clinical Guardrails Enforced',
  onOpenContext,
  onOpenEvidence,
  onOpenAudit,
  className = '',
}) => {
  const formattedTime = generatedAt
    ? new Date(generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Just now';

  return (
    <div className={`p-4 rounded-xl border border-indigo-100/80 bg-gradient-to-r from-indigo-50/50 via-slate-50/40 to-indigo-50/30 space-y-3 font-sans ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Title & Main AI Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {title && (
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 mr-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>{title}</span>
            </h3>
          )}

          {isAiGenerated && (
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-2xs">
              <Sparkles className="w-3 h-3" />
              <span>AI Generated</span>
            </span>
          )}

          <span className="px-2.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700 text-[10px] font-bold flex items-center gap-1">
            <span>Model: {modelVersion}</span>
          </span>

          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>{safetyStatus}</span>
          </span>

          {reviewStatus && (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              <span>{reviewStatus}</span>
            </span>
          )}
        </div>

        {/* Right: Action Buttons (Context, Evidence, Audit) */}
        <div className="flex items-center gap-2">
          {onOpenContext && (
            <button
              onClick={onOpenContext}
              className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer"
              title="Inspect minimum-necessary patient context sent to AI"
            >
              <Layers className="w-3 h-3 text-indigo-600" />
              <span>View Context</span>
            </button>
          )}

          {onOpenEvidence && (
            <button
              onClick={onOpenEvidence}
              className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer"
              title="View clinical practice guidelines & evidence citations"
            >
              <BookOpen className="w-3 h-3 text-indigo-600" />
              <span>Evidence</span>
            </button>
          )}

          {onOpenAudit && (
            <button
              onClick={onOpenAudit}
              className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer"
              title="View audit provenance log"
            >
              <History className="w-3 h-3 text-slate-500" />
              <span>Audit</span>
            </button>
          )}
        </div>
      </div>

      {/* Meta details footer: generation time, latency, freshness */}
      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 font-medium pt-1 border-t border-indigo-100/60">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>Generated: <strong className="text-slate-700">{formattedTime}</strong></span>
        </span>

        {latencyMs !== undefined && latencyMs > 0 && (
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500" />
            <span>Latency: <strong className="text-slate-700">{latencyMs} ms</strong></span>
          </span>
        )}

        {dataFreshness && (
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Data Freshness: <strong className="text-slate-700">{dataFreshness}</strong></span>
          </span>
        )}
      </div>
    </div>
  );
};

export default AiResultHeader;

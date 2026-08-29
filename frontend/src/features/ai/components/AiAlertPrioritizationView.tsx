import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  CheckCircle,
  Zap,
  Activity,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import type { AiAlertPrioritizationResult } from '../types/ai';

interface AiAlertPrioritizationViewProps {
  patientId?: string;
  onAlertActioned?: () => void;
}

export const AiAlertPrioritizationView: React.FC<AiAlertPrioritizationViewProps> = ({
  patientId,
  onAlertActioned,
}) => {
  const toast = useToast();
  const [prioritization, setPrioritization] = useState<AiAlertPrioritizationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // If patientId provided, fetch for that patient; otherwise fetch general or demo patient
    const id = patientId || 'a0000000-0000-0000-0000-000000000001';
    loadPrioritization(id, false);
  }, [patientId]);

  const loadPrioritization = async (targetId: string, forceRefresh = false) => {
    if (forceRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const data = forceRefresh
        ? await api.generateAiAlertPrioritization(targetId)
        : await api.getAiAlertPrioritization(targetId, false);
      setPrioritization(data);
    } catch (err: any) {
      console.error('Error loading AI Alert Prioritization:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const getRankBadge = (score: number, urgency: string) => {
    if (score >= 90 || urgency === 'Critical') {
      return 'bg-rose-100 text-rose-800 border-rose-200';
    }
    if (score >= 70 || urgency === 'High') {
      return 'bg-amber-100 text-amber-800 border-amber-200';
    }
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-rose-50/40 via-amber-50/30 to-white">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              AI Alert Contextual Prioritization
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                Patient-Specific Ranking
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Combines deterministic alert thresholds with patient clinical history to rank acute attention
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadPrioritization(patientId || 'a0000000-0000-0000-0000-000000000001', true)}
            disabled={isRefreshing || isLoading}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition disabled:opacity-50"
            title="Re-rank Active Alerts"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-rose-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Ranked Alerts Stream */}
      <div className="p-5 space-y-3">
        {isLoading ? (
          <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Activity className="w-6 h-6 animate-pulse text-rose-500" />
            <p className="text-xs font-medium">Evaluating patient acuity & alert urgency...</p>
          </div>
        ) : prioritization && prioritization.rankedAlerts.length > 0 ? (
          prioritization.rankedAlerts.map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-4 rounded-xl border border-slate-200 hover:border-rose-200 bg-white hover:shadow-2xs transition space-y-2.5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-start gap-3 flex-1">
                  {/* AI Rank Score Badge */}
                  <div
                    className={`px-3 py-1.5 rounded-xl border font-black text-sm flex flex-col items-center justify-center shrink-0 ${getRankBadge(
                      item.aiRankScore,
                      item.urgencyLevel
                    )}`}
                  >
                    <span>{item.aiRankScore}</span>
                    <span className="text-[9px] font-bold tracking-wider uppercase -mt-0.5">Rank</span>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                        {item.originalTitle}
                      </h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        Source: {item.originalType}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {item.originalCreatedAt}
                      </span>
                    </div>

                    {/* AI Clinical Rationale */}
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      <strong className="text-slate-800">AI Context Rationale:</strong> {item.clinicalRationale}
                    </p>

                    {/* Suggested Intervention */}
                    {item.suggestedIntervention && (
                      <div className="mt-2 text-xs flex items-center gap-1.5 text-rose-800 font-medium bg-rose-50/70 px-2.5 py-1 rounded-lg w-fit">
                        <Zap className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>Recommended Intervention: {item.suggestedIntervention}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => {
                      toast.success(`Intervention acknowledged for ${item.originalTitle}`);
                      if (onAlertActioned) onAlertActioned();
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-2xs transition flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Acknowledge
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-slate-400 text-xs">
            No active alerts requiring prioritization.
          </div>
        )}
      </div>
    </div>
  );
};

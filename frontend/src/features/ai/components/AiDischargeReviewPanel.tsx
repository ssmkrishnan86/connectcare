import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  ListChecks,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import type { AiDischargeReview } from '../types/ai';
import { AiFeedbackModal } from './AiFeedbackModal';

interface AiDischargeReviewPanelProps {
  patientId: string;
  patientName?: string;
  onChecklistUpdated?: () => void;
}

export const AiDischargeReviewPanel: React.FC<AiDischargeReviewPanelProps> = ({
  patientId,
  onChecklistUpdated,
}) => {
  const toast = useToast();
  const [review, setReview] = useState<AiDischargeReview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Feedback modal
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackAction, setFeedbackAction] = useState<'Accepted' | 'Edited' | 'Dismissed' | 'ReportedIssue'>('Accepted');

  useEffect(() => {
    if (patientId) {
      loadReview(false);
    }
  }, [patientId]);

  const loadReview = async (forceRefresh = false) => {
    if (forceRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const data = forceRefresh
        ? await api.generateAiDischargeReview(patientId)
        : await api.getAiDischargeReview(patientId, false);
      setReview(data);
    } catch (err: any) {
      console.error('Error loading AI Discharge Review:', err);
      toast.error(err.message || 'Failed to load AI Discharge Review');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-100 text-teal-700">
            <FileCheck2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              ConnectCare AI Discharge Readiness Review
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                Safety Checklist Assister
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              AI checks discharge prerequisites without replacing final clinician discharge orders
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadReview(true)}
            disabled={isRefreshing || isLoading}
            className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition disabled:opacity-50"
            title="Re-evaluate Discharge Readiness"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-teal-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {isLoading ? (
          <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
            <FileCheck2 className="w-6 h-6 animate-pulse text-teal-500" />
            <p className="text-xs font-medium">Auditing discharge checklist & clinical safety criteria...</p>
          </div>
        ) : review ? (
          <>
            {/* Score & Summary Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-teal-50/60 via-slate-50 to-white border border-teal-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Readiness Score Gauge */}
                <div
                  className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border font-black text-xl shadow-2xs ${getScoreColor(
                    review.readinessScore
                  )}`}
                >
                  <span>{review.readinessScore}%</span>
                  <span className="text-[9px] font-bold tracking-wider uppercase -mt-0.5">Score</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        review.readinessStatus === 'Ready'
                          ? 'bg-emerald-100 text-emerald-800'
                          : review.readinessStatus === 'Conditional'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {review.readinessStatus} Discharge Readiness
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed max-w-xl">
                    {review.summaryFindings}
                  </p>
                </div>
              </div>

              {/* Clinician Review State */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setFeedbackAction('Accepted');
                    setShowFeedbackModal(true);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-2xs transition flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Clinician Review
                </button>
              </div>
            </div>

            {/* Findings Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
              {/* Missing Items */}
              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/30 space-y-2">
                <h4 className="font-bold text-amber-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  Missing Checklist Items ({review.missingItems.length})
                </h4>
                <ul className="space-y-1.5">
                  {review.missingItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-slate-700">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Discrepancies & Conflicts */}
              <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/30 space-y-2">
                <h4 className="font-bold text-rose-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  Med / Plan Discrepancies ({review.conflictingItems.length})
                </h4>
                <ul className="space-y-1.5">
                  {review.conflictingItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-slate-700">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risk Flags */}
              <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/30 space-y-2">
                <h4 className="font-bold text-purple-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
                  Discharge Risk Flags ({review.riskFlags.length})
                </h4>
                <ul className="space-y-1.5">
                  {review.riskFlags.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-slate-700">
                      <span className="text-purple-500 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actionable Recommendations */}
            {review.actionableRecommendations && review.actionableRecommendations.length > 0 && (
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <ListChecks className="w-3.5 h-3.5 text-teal-600" />
                  Required Actions Before Final Release
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {review.actionableRecommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-start gap-2"
                    >
                      <ArrowRight className="w-3.5 h-3.5 text-teal-600 mt-0.5 shrink-0" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Feedback Modal */}
      {review && (
        <AiFeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          workflowType="DischargeReview"
          targetEntityId={review.id}
          initialAction={feedbackAction}
          currentContent={review.summaryFindings}
          onSuccess={() => {
            loadReview(false);
            if (onChecklistUpdated) onChecklistUpdated();
          }}
        />
      )}
    </div>
  );
};

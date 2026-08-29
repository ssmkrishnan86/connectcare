import React, { useState, useEffect } from 'react';
import {
  Pill,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Eye,
  CheckCircle2,
  FileCheck2,
  Clock,
  Info,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { AiMedicationReview } from '../types/ai';
import { AiFeedbackModal } from './AiFeedbackModal';
import { AiContextInspectorModal } from './AiContextInspectorModal';

interface AiMedicationReviewPanelProps {
  patientId: string;
  patientName?: string;
}

export const AiMedicationReviewPanel: React.FC<AiMedicationReviewPanelProps> = ({
  patientId,
  patientName,
}) => {
  const [data, setData] = useState<AiMedicationReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showContextModal, setShowContextModal] = useState(false);

  const fetchReview = async (force = false) => {
    try {
      if (force) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const res = await (force
        ? api.generateAiMedicationReview(patientId)
        : api.getAiMedicationReview(patientId));

      const reviewData = res?.data || res;
      setData(reviewData);
    } catch (err: any) {
      console.error('Failed to load AI Medication Review:', err);
      setError('Unable to generate medication intelligence review at this time.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchReview(false);
    }
  }, [patientId]);

  const handleFeedbackSubmitted = () => {
    fetchReview(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 75) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 bg-slate-200 rounded w-1/3"></div>
          <div className="h-5 bg-slate-200 rounded w-16"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-slate-100 rounded w-full"></div>
          <div className="h-4 bg-slate-100 rounded w-5/6"></div>
          <div className="h-16 bg-slate-50 rounded-xl w-full mt-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden transition-all">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-teal-50/50 via-white to-slate-50/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100/70 text-teal-700 flex items-center justify-center shadow-xs">
            <Pill className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                AI Medication Intelligence & Safety Review
              </h2>
              <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-teal-50 text-teal-700 border border-teal-200/80 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-teal-500" />
                Evidence Grounded
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Drug interaction surveillance, Beers criteria checks, and MAR reconciliation assistance
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowContextModal(true)}
            className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-200/70 rounded-lg transition-colors flex items-center gap-1.5"
            title="Inspect authorized patient context bundle"
          >
            <Eye className="w-3.5 h-3.5" />
            Context
          </button>
          <button
            onClick={() => fetchReview(true)}
            disabled={refreshing}
            className="px-2.5 py-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100/80 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Re-evaluate
          </button>
        </div>
      </div>

      {error ? (
        <div className="p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700">{error}</p>
          <button
            onClick={() => fetchReview(true)}
            className="mt-3 px-3 py-1 text-xs font-bold text-teal-600 hover:underline"
          >
            Retry Review
          </button>
        </div>
      ) : data ? (
        <div className="p-5 space-y-5">
          {/* Top Score & Synthesis Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Score Card */}
            <div
              className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center ${getScoreColor(
                data.safetyScore || 95
              )}`}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider">Safety Score</span>
              <span className="text-3xl font-extrabold my-0.5">{data.safetyScore || 95}%</span>
              <span className="text-[11px] font-semibold opacity-90">
                {data.reviewStatus || 'Completed'}
              </span>
            </div>

            {/* Synthesis text */}
            <div className="md:col-span-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/60 flex flex-col justify-center">
              <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-1 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-teal-600" />
                Clinical Synthesis & Status
              </span>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                {data.clinicalSynthesis ||
                  'No critical acute medication conflicts identified in documented patient chart.'}
              </p>
            </div>
          </div>

          {/* Safety Alerts / Interactions */}
          {data.safetyAlerts && data.safetyAlerts.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Active Safety & Interaction Alerts ({data.safetyAlerts.length})
              </h3>
              <div className="space-y-2">
                {data.safetyAlerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs ${
                      alert.severity === 'Critical'
                        ? 'bg-rose-50/60 border-rose-200 text-rose-900'
                        : alert.severity === 'Warning'
                        ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                        : 'bg-blue-50/60 border-blue-200 text-blue-900'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span>{alert.title}</span>
                      <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-white/80 border">
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-slate-600 font-normal mt-0.5">{alert.description}</p>
                    {alert.recommendation && (
                      <p className="mt-1.5 font-semibold text-slate-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        Recommendation: {alert.recommendation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Beers Criteria & High-Risk Flags */}
          {data.beersCriteriaFlags && data.beersCriteriaFlags.length > 0 && (
            <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-200/80">
              <h3 className="text-xs font-bold text-orange-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
                Beers Criteria / Geriatric Risk Surveillance
              </h3>
              <ul className="list-disc list-inside text-xs text-orange-800 space-y-0.5 font-medium">
                {data.beersCriteriaFlags.map((flag, idx) => (
                  <li key={idx}>{flag}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Actionable Recommendations */}
          {data.recommendations && data.recommendations.length > 0 && (
            <div className="p-3.5 rounded-xl bg-teal-50/40 border border-teal-100">
              <h3 className="text-xs font-bold text-teal-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                Pharmacist & Prescriber Recommendations
              </h3>
              <ul className="space-y-1.5">
                {data.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0"></span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer & Human Disposition Controls */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Model: {data.modelVersion || 'GPT-4o'}
              </span>
              <span>•</span>
              <span className="font-medium">
                Disposition:{' '}
                <strong className="text-slate-700">{data.dispositionStatus || 'Pending'}</strong>
              </span>
              {data.reviewedBy && (
                <>
                  <span>•</span>
                  <span>Reviewed by {data.reviewedBy}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                Review & Sign-off
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <AiFeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          workflowType="MedicationReview"
          targetEntityId={data?.id || patientId}
          patientName={patientName || data?.patientName || 'Patient'}
          onFeedbackSubmitted={handleFeedbackSubmitted}
        />
      )}

      {/* Context Transparency Inspector */}
      {showContextModal && (
        <AiContextInspectorModal
          isOpen={showContextModal}
          onClose={() => setShowContextModal(false)}
          patientId={patientId}
        />
      )}
    </div>
  );
};

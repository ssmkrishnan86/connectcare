import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ClipboardCheck,
  Layers,
  BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { AiResultHeader } from './common/AiResultHeader';
import { AiLoadingState } from './common/AiLoadingState';
import { AiErrorState } from './common/AiErrorState';
import { AiInsufficientData } from './common/AiInsufficientData';
import { AiHumanReviewActions } from './common/AiHumanReviewActions';
import { AiEvidenceDrawer } from './common/AiEvidenceDrawer';
import { AiContextInspectorModal } from '@/features/ai/components/AiContextInspectorModal';
import type { AiDischargeReview } from '@/features/ai/types/ai';

interface AiDischargeReviewScreenProps {
  patientId?: string;
  patientData?: any;
  onBack?: () => void;
}

export const AiDischargeReviewScreen: React.FC<AiDischargeReviewScreenProps> = ({
  patientId,
  patientData,
  onBack,
}) => {
  const navigate = useNavigate();
  const [review, setReview] = useState<AiDischargeReview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Transparency and Evidence Modal States
  const [showContextModal, setShowContextModal] = useState(false);
  const [showEvidenceDrawer, setShowEvidenceDrawer] = useState(false);

  const activePatientId = patientId || patientData?.id;

  const loadDischargeReview = useCallback(async (forceRefresh = false) => {
    if (!activePatientId) {
      setIsLoading(false);
      return;
    }

    if (forceRefresh) setIsGenerating(true);
    else setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = forceRefresh
        ? await api.generateAiDischargeReview(activePatientId)
        : await api.getAiDischargeReview(activePatientId, false);
      const data = res?.data ?? res;
      if (data && (data.summaryFindings || data.readinessStatus || data.missingItems?.length > 0)) {
        setReview(data);
      } else {
        setReview(null);
      }
    } catch (err: any) {
      console.error('Failed to load AI discharge review:', err);
      setErrorMessage(err?.message || 'Unable to retrieve AI discharge readiness review.');
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
    }
  }, [activePatientId]);

  useEffect(() => {
    loadDischargeReview(false);
  }, [loadDischargeReview]);

  const patientName = review?.patientName || patientData?.name || 'Resident';
  const patientMrn = review?.patientIdCode || patientData?.mrn || patientData?.patientIdCode || 'PT';
  const patientAge = patientData?.age || 75;
  const patientGender = patientData?.gender || 'Resident';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col font-sans">
      {/* Top Action Bar */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3 bg-white">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Pages</span>
        </button>

        <h1 className="text-sm font-bold text-slate-900 hidden sm:block">
          AI Discharge Readiness Review
        </h1>

        <button
          onClick={() => loadDischargeReview(true)}
          disabled={isGenerating || isLoading || !activePatientId}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Evaluating Readiness...' : 'Generate Review'}</span>
        </button>
      </div>

      {/* Patient Header Banner */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-indigo-100 border-2 border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
              {patientName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {patientName}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                MRN: {patientMrn} • {patientAge} Y / {patientGender}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowContextModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer"
            >
              <Layers className="w-3 h-3 text-indigo-600" />
              <span>AI Context</span>
            </button>
            <button
              onClick={() => setShowEvidenceDrawer(true)}
              className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer"
            >
              <BookOpen className="w-3 h-3 text-indigo-600" />
              <span>Evidence</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5">
        {isLoading ? (
          <AiLoadingState
            operation="Evaluating Discharge Readiness & Transition Safety..."
            subtext="Analyzing checklist milestones, barrier clearances, medication reconciliation, and post-discharge follow-up status."
          />
        ) : errorMessage ? (
          <AiErrorState
            title="Discharge Review Unavailable"
            errorMessage={errorMessage}
            onRetry={() => loadDischargeReview(true)}
            isRetrying={isGenerating}
          />
        ) : !review ? (
          <AiInsufficientData
            patientId={activePatientId}
            patientName={patientName}
            missingDataDetails="No discharge review has been synthesized yet for this resident."
            recommendedAction="Click 'Generate Review' above to evaluate current discharge milestone status."
          />
        ) : (
          <div className="space-y-5">
            {/* Header */}
            <AiResultHeader
              title="AI Discharge Safety Synthesis"
              modelVersion={review.modelVersion || 'gpt-4o'}
              generatedAt={review.generatedAtUtc}
              latencyMs={review.latencyMs}
              reviewStatus={review.dispositionStatus === 'Accepted' ? 'Clinician Verified' : 'Clinician Review Required'}
              onOpenContext={() => setShowContextModal(true)}
              onOpenEvidence={() => setShowEvidenceDrawer(true)}
            />

            {/* Top Summary Row: Readiness Score + Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Score Card */}
              <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-2xs flex items-center gap-4">
                <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={
                        review.readinessScore >= 80
                          ? 'text-emerald-500'
                          : review.readinessScore >= 50
                          ? 'text-amber-500'
                          : 'text-rose-500'
                      }
                      strokeDasharray={`${review.readinessScore}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-sm font-extrabold text-slate-800">
                    {review.readinessScore}%
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs text-slate-900">Readiness Status</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        review.readinessStatus === 'Ready'
                          ? 'bg-emerald-100 text-emerald-800'
                          : review.readinessStatus === 'Conditional'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {review.readinessStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    {review.summaryFindings || 'Multidisciplinary criteria evaluated for safe discharge.'}
                  </p>
                </div>
              </div>

              {/* Checklist Action Card */}
              <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 shadow-2xs flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-bold text-xs text-slate-900">ConnectCare Discharge Checklist</h3>
                  </div>
                  <p className="text-xs text-slate-600">
                    Synchronize real-time checklist items, caregiver education, and DME requirements directly with nursing.
                  </p>
                </div>

                <button
                  onClick={() => navigate('/discharge-checklist')}
                  className="self-start flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  <span>Open Interactive Checklist</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Blockers and Risk Flags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Missing Items & Blockers */}
              <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-2xs space-y-2.5">
                <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Identified Blockers & Missing Items</span>
                </h3>
                {review.missingItems && review.missingItems.length > 0 ? (
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {review.missingItems.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400">No missing documentation items identified.</p>
                )}
              </div>

              {/* Actionable Recommendations */}
              <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-2xs space-y-2.5">
                <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Transition Recommendations</span>
                </h3>
                {review.actionableRecommendations && review.actionableRecommendations.length > 0 ? (
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {review.actionableRecommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400">All standard transition criteria are currently addressed.</p>
                )}
              </div>
            </div>

            {/* Human Review Actions */}
            <AiHumanReviewActions
              workflowType="DischargeReview"
              targetEntityId={review.id || activePatientId}
              patientId={activePatientId}
              initialStatus={(review.dispositionStatus as any) || 'Pending'}
              reviewedBy={review.reviewedBy}
              reviewedDate={review.reviewedDate}
              onActionComplete={(action) => {
                setReview((prev) => prev ? { ...prev, dispositionStatus: action as any } : prev);
              }}
            />
          </div>
        )}
      </div>

      {/* Context Inspector Modal */}
      {activePatientId && (
        <AiContextInspectorModal
          isOpen={showContextModal}
          patientId={activePatientId}
          onClose={() => setShowContextModal(false)}
        />
      )}

      {/* Evidence Drawer */}
      <AiEvidenceDrawer
        isOpen={showEvidenceDrawer}
        onClose={() => setShowEvidenceDrawer(false)}
        patientId={activePatientId}
        workflowName="AI Discharge Review"
      />
    </div>
  );
};

export default AiDischargeReviewScreen;

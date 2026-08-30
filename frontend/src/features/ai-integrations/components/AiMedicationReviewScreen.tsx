import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  RefreshCw,
  Pill,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Layers,
  BookOpen,
  UserCheck
} from 'lucide-react';
import { api } from '@/lib/api';
import { AiResultHeader } from './common/AiResultHeader';
import { AiLoadingState } from './common/AiLoadingState';
import { AiErrorState } from './common/AiErrorState';
import { AiInsufficientData } from './common/AiInsufficientData';
import { AiHumanReviewActions } from './common/AiHumanReviewActions';
import { AiEvidenceDrawer } from './common/AiEvidenceDrawer';
import { AiContextInspectorModal } from '@/features/ai/components/AiContextInspectorModal';
import type { AiMedicationReview } from '@/features/ai/types/ai';

interface AiMedicationReviewScreenProps {
  patientId?: string;
  patientData?: any;
  onBack?: () => void;
}

export const AiMedicationReviewScreen: React.FC<AiMedicationReviewScreenProps> = ({
  patientId,
  patientData,
  onBack,
}) => {
  const [review, setReview] = useState<AiMedicationReview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Transparency and Evidence Modal States
  const [showContextModal, setShowContextModal] = useState(false);
  const [showEvidenceDrawer, setShowEvidenceDrawer] = useState(false);

  const activePatientId = patientId || patientData?.id;

  const loadMedicationReview = useCallback(async (forceRefresh = false) => {
    if (!activePatientId) {
      setIsLoading(false);
      return;
    }

    if (forceRefresh) setIsGenerating(true);
    else setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = forceRefresh
        ? await api.generateAiMedicationReview(activePatientId)
        : await api.getAiMedicationReview(activePatientId, false);
      const data = res?.data ?? res;
      if (data && (data.clinicalSynthesis || data.safetyAlerts?.length > 0 || data.beersCriteriaFlags?.length > 0 || data.safetyScore !== undefined)) {
        setReview(data);
      } else {
        setReview(null);
      }
    } catch (err: any) {
      console.error('Failed to load medication safety review:', err);
      setErrorMessage(err?.message || 'Unable to retrieve medication intelligence review.');
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
    }
  }, [activePatientId]);

  useEffect(() => {
    loadMedicationReview(false);
  }, [loadMedicationReview]);

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
          AI Medication Intelligence & Safety Review
        </h1>

        <button
          onClick={() => loadMedicationReview(true)}
          disabled={isGenerating || isLoading || !activePatientId}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Analyzing Pharmacology...' : 'Generate Review'}</span>
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
              <span>AGS Beers & Evidence</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5">
        {isLoading ? (
          <AiLoadingState
            operation="Executing Multi-Drug Interaction & AGS Beers Screening..."
            subtext="Cross-referencing active MAR orders, dosing intervals, renal contraindications, and age-related sensitivity profiles."
          />
        ) : errorMessage ? (
          <AiErrorState
            title="Medication Safety Review Unavailable"
            errorMessage={errorMessage}
            onRetry={() => loadMedicationReview(true)}
            isRetrying={isGenerating}
          />
        ) : !review ? (
          <AiInsufficientData
            patientId={activePatientId}
            patientName={patientName}
            missingDataDetails="No active prescriptions found in MAR to screen for drug-drug interactions or Beers criteria."
            recommendedAction="Prescribe or record current home medications in the Medication Administration Record."
          />
        ) : (
          <div className="space-y-5">
            {/* Header */}
            <AiResultHeader
              title="Pharmacotherapy Safety Matrix"
              modelVersion={review.modelVersion || 'gpt-4o'}
              latencyMs={review.latencyMs}
              reviewStatus={review.dispositionStatus === 'PharmacistSignedOff' ? 'Pharmacist Approved' : 'Clinical Sign-off Required'}
              onOpenContext={() => setShowContextModal(true)}
              onOpenEvidence={() => setShowEvidenceDrawer(true)}
            />

            {/* Top Stat Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col items-center text-center">
                <span className="text-[11px] text-slate-500 font-medium">Safety Index</span>
                <span className="text-lg font-extrabold text-emerald-600 mt-0.5">
                  {review.safetyScore || 95}/100
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col items-center text-center">
                <span className="text-[11px] text-slate-500 font-medium">Critical Alerts</span>
                <span className="text-lg font-extrabold text-rose-600 mt-0.5">
                  {review.safetyAlerts?.filter((a) => a.severity === 'Critical').length || 0}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col items-center text-center">
                <span className="text-[11px] text-slate-500 font-medium">Beers Criteria Flags</span>
                <span className="text-lg font-extrabold text-amber-600 mt-0.5">
                  {review.beersCriteriaFlags?.length || 0}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col items-center text-center">
                <span className="text-[11px] text-slate-500 font-medium">Review Status</span>
                <span className="mt-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-100 text-indigo-800">
                  {review.reviewStatus || 'Completed'}
                </span>
              </div>
            </div>

            {/* Clinical Synthesis */}
            {review.clinicalSynthesis && (
              <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-2xs space-y-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Clinical Synthesis & Pharmacology Analysis</span>
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed font-normal">
                  {review.clinicalSynthesis}
                </p>
              </div>
            )}

            {/* Safety Alerts & Beers Flags */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Safety Alerts */}
              <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-2xs space-y-3">
                <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  <span>Pharmacological Alerts & Interactions</span>
                </h3>

                {review.safetyAlerts && review.safetyAlerts.length > 0 ? (
                  <div className="space-y-2.5">
                    {review.safetyAlerts.map((alert, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900">{alert.title}</h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              alert.severity === 'Critical'
                                ? 'bg-rose-100 text-rose-800'
                                : alert.severity === 'Warning'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-slate-600 font-medium">{alert.description}</p>
                        <p className="text-[11px] text-indigo-900 font-semibold pt-1">
                          Rec: {alert.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No severe drug interactions or safety conflicts detected.</p>
                )}
              </div>

              {/* Beers Criteria Flags & Recommendations */}
              <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-2xs space-y-3">
                <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>AGS Beers Criteria® & Geriatric Safety</span>
                </h3>

                {review.beersCriteriaFlags && review.beersCriteriaFlags.length > 0 ? (
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {review.beersCriteriaFlags.map((flag, idx) => (
                      <li key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-amber-50/50 border border-amber-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400">Zero Beers Criteria violations detected for resident's age cohort.</p>
                )}

                {review.recommendations && review.recommendations.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <h4 className="text-xs font-bold text-slate-900">Optimization Recommendations</h4>
                    <ul className="space-y-1 text-xs text-slate-600">
                      {review.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Prescribing Guardrail Notice */}
            <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 text-xs text-indigo-950 flex items-start gap-2.5">
              <UserCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong>Physician & Pharmacist Ordering Guardrail:</strong> AI output cannot directly modify prescriptions or pharmacy orders. All dosage adjustments, discontinuations, or substitutions must be authorized by a licensed prescriber.
              </div>
            </div>

            {/* Human Review Actions */}
            <AiHumanReviewActions
              workflowType="MedicationReview"
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
        workflowName="AI Medication Review"
      />
    </div>
  );
};

export default AiMedicationReviewScreen;

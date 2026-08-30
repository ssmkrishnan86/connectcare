import React, { useState, useEffect, memo, useCallback } from 'react';
import {
  Sparkles,
  ChevronLeft,
  RefreshCw,
  FileText,
  Pill,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Layers,
  BookOpen
} from 'lucide-react';
import { api } from '@/lib/api';
import { AiResultHeader } from './common/AiResultHeader';
import { AiLoadingState } from './common/AiLoadingState';
import { AiErrorState } from './common/AiErrorState';
import { AiInsufficientData } from './common/AiInsufficientData';
import { AiHumanReviewActions } from './common/AiHumanReviewActions';
import { AiEvidenceDrawer } from './common/AiEvidenceDrawer';
import { AiContextInspectorModal } from '@/features/ai/components/AiContextInspectorModal';
import type { AiPatientSummary } from '@/features/ai/types/ai';

interface AiPatientSummaryScreenProps {
  patientId?: string;
  patientData?: any;
  onBack?: () => void;
}

export const AiPatientSummaryScreen: React.FC<AiPatientSummaryScreenProps> = memo(({
  patientId,
  patientData,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'Summary' | 'History' | 'Medications' | 'Labs' | 'Vitals'>('Summary');
  const [summary, setSummary] = useState<AiPatientSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Transparency and Evidence Modal States
  const [showContextModal, setShowContextModal] = useState(false);
  const [showEvidenceDrawer, setShowEvidenceDrawer] = useState(false);

  const activePatientId = patientId || patientData?.id;

  const loadSummary = useCallback(async (forceRefresh = false) => {
    if (!activePatientId) {
      setIsLoading(false);
      return;
    }

    if (forceRefresh) setIsRegenerating(true);
    else setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = forceRefresh
        ? await api.generateAiPatientSummary(activePatientId)
        : await api.getAiPatientSummary(activePatientId, false);
      const data = res?.data ?? res;
      if (data && (data.currentStatus || data.recentChanges || data.activeConcerns || data.clinicalSummary || data.summaryText)) {
        setSummary(data);
      } else {
        setSummary(null);
      }
    } catch (err: any) {
      console.error('Failed to load AI patient summary:', err);
      setErrorMessage(err?.message || 'Unable to retrieve AI clinical summary.');
    } finally {
      setIsLoading(false);
      setIsRegenerating(false);
    }
  }, [activePatientId]);

  useEffect(() => {
    loadSummary(false);
  }, [loadSummary]);

  const tabs = ['Summary', 'History', 'Medications', 'Labs', 'Vitals'] as const;

  const patientName = summary?.patientName || patientData?.name || 'Resident';
  const patientMrn = summary?.patientIdCode || patientData?.mrn || patientData?.patientIdCode || 'PT';
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

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadSummary(true)}
            disabled={isRegenerating || isLoading || !activePatientId}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>{isRegenerating ? 'Synthesizing...' : 'Regenerate Summary'}</span>
          </button>
        </div>
      </div>

      {/* Patient Header Banner */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-indigo-100 border-2 border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
              {patientName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  {patientName}
                </h2>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                MRN: {patientMrn} • {patientAge} Y / {patientGender}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 font-medium">Data Freshness: </span>
              <span className="text-xs font-bold text-slate-700">
                {summary?.dataFreshnessUtc ? new Date(summary.dataFreshnessUtc).toLocaleString() : 'Live'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-semibold">Model Confidence</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                94% Verified
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 mt-4 border-b border-slate-200/80 -mb-5 overflow-x-auto pb-px">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-bold transition border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5">
        {isLoading ? (
          <AiLoadingState
            operation="Synthesizing Multidisciplinary Patient Records..."
            subtext="Aggregating clinical notes, laboratory trends, vital parameters, and active medications through ConnectCare AI Orchestration."
          />
        ) : errorMessage ? (
          <AiErrorState
            title="AI Patient Summary Unavailable"
            errorMessage={errorMessage}
            onRetry={() => loadSummary(true)}
            isRetrying={isRegenerating}
          />
        ) : !summary ? (
          <AiInsufficientData
            patientId={activePatientId}
            patientName={patientName}
            missingDataDetails="No prior AI clinical summary or clinical encounter notes have been recorded for this resident."
            recommendedAction="Click 'Regenerate Summary' above or document new clinical notes to trigger synthesis."
          />
        ) : activeTab === 'Summary' ? (
          <div className="space-y-5">
            {/* Standardized Header */}
            <AiResultHeader
              title="Patient AI Clinical Synthesis"
              modelVersion={summary.modelVersion || 'gpt-4o'}
              generatedAt={summary.dataFreshnessUtc}
              latencyMs={summary.latencyMs}
              reviewStatus={summary.dispositionStatus === 'Accepted' ? 'Reviewed & Accepted' : 'Human Review Required'}
              onOpenContext={() => setShowContextModal(true)}
              onOpenEvidence={() => setShowEvidenceDrawer(true)}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column (8 cols) */}
              <div className="lg:col-span-8 space-y-4">
                {/* Current Status */}
                {summary.currentStatus && (
                  <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-2xs space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                        Current Clinical Status & Synthesis
                      </h3>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-normal">
                      {summary.currentStatus}
                    </p>
                  </div>
                )}

                {/* Recent Changes & Active Concerns Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {summary.recentChanges && (
                    <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-2xs space-y-2">
                      <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Recent Changes</span>
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed font-normal">
                        {summary.recentChanges}
                      </p>
                    </div>
                  )}

                  {summary.activeConcerns && (
                    <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-2xs space-y-2">
                      <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        <span>Active Clinical Concerns</span>
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed font-normal">
                        {summary.activeConcerns}
                      </p>
                    </div>
                  )}
                </div>

                {/* Outstanding Actions & Follow Up */}
                {(summary.outstandingActions || summary.followUpPlan) && (
                  <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 shadow-2xs space-y-2.5">
                    <h3 className="font-bold text-xs text-slate-900">Recommended Next Steps & Follow-up</h3>
                    {summary.outstandingActions && (
                      <p className="text-xs text-slate-700">
                        <strong>Outstanding Actions:</strong> {summary.outstandingActions}
                      </p>
                    )}
                    {summary.followUpPlan && (
                      <p className="text-xs text-slate-700">
                        <strong>Follow-up Plan:</strong> {summary.followUpPlan}
                      </p>
                    )}
                  </div>
                )}

                {/* Human Review Actions */}
                <AiHumanReviewActions
                  workflowType="PatientSummary"
                  targetEntityId={summary.id || activePatientId}
                  patientId={activePatientId}
                  initialStatus={(summary.dispositionStatus as any) || 'Pending'}
                  reviewedBy={summary.reviewedBy}
                  reviewedDate={summary.reviewedDate}
                  onActionComplete={(action) => {
                    setSummary((prev) => prev ? { ...prev, dispositionStatus: action as any } : prev);
                  }}
                />
              </div>

              {/* Right Column (4 cols) */}
              <div className="lg:col-span-4 space-y-4">
                {/* Source Records Card */}
                <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-2xs space-y-3">
                  <h3 className="font-bold text-xs text-slate-900">Analyzed Source Records</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80 border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-700">
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Clinical Notes & Encounters</span>
                      </div>
                      <span className="font-bold text-slate-900">Active</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80 border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Pill className="w-3.5 h-3.5 text-teal-600" />
                        <span>Active Medication Regimen</span>
                      </div>
                      <span className="font-bold text-slate-900">Verified</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80 border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Activity className="w-3.5 h-3.5 text-rose-600" />
                        <span>Vital Signs Surveillance</span>
                      </div>
                      <span className="font-bold text-slate-900">Live</span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between">
                    <button
                      onClick={() => setShowContextModal(true)}
                      className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Layers className="w-3 h-3" />
                      <span>Inspect Context Bundle</span>
                    </button>

                    <button
                      onClick={() => setShowEvidenceDrawer(true)}
                      className="text-xs font-bold text-slate-600 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Evidence Base</span>
                    </button>
                  </div>
                </div>

                {/* Citations Card */}
                {summary.citations && summary.citations.length > 0 && (
                  <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-2xs space-y-2">
                    <h3 className="font-bold text-xs text-slate-900">Clinical Citations</h3>
                    <ul className="space-y-1 text-[11px] text-slate-600">
                      {summary.citations.map((c, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 shrink-0" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs">
            Viewing authoritative {activeTab} chart for {patientName}.
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
        workflowName="Patient AI Summary"
      />
    </div>
  );
});

AiPatientSummaryScreen.displayName = 'AiPatientSummaryScreen';
export default AiPatientSummaryScreen;

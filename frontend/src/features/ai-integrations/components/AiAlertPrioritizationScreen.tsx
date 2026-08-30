import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw,
  CheckCircle2,
  Zap,
  CheckSquare,
  Layers,
  BookOpen,
  ChevronLeft
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { AiResultHeader } from './common/AiResultHeader';
import { AiLoadingState } from './common/AiLoadingState';
import { AiErrorState } from './common/AiErrorState';
import { AiEvidenceDrawer } from './common/AiEvidenceDrawer';
import { AiContextInspectorModal } from '@/features/ai/components/AiContextInspectorModal';
import type { AiAlertPrioritizationResult, AiPrioritizedAlert } from '@/features/ai/types/ai';

interface AiAlertPrioritizationScreenProps {
  patientId?: string;
  patientData?: any;
  onBack?: () => void;
}

export const AiAlertPrioritizationScreen: React.FC<AiAlertPrioritizationScreenProps> = ({
  patientId,
  patientData,
  onBack,
}) => {
  const toast = useToast();
  const [filter, setFilter] = useState<'All' | 'Critical' | 'High' | 'Medium' | 'Low'>('All');
  const [result, setResult] = useState<AiAlertPrioritizationResult | null>(null);
  const [allAlerts, setAllAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [escalatingId, setEscalatingId] = useState<string | null>(null);

  // Transparency and Evidence Modal States
  const [showContextModal, setShowContextModal] = useState(false);
  const [showEvidenceDrawer, setShowEvidenceDrawer] = useState(false);

  const activePatientId = patientId || patientData?.id;

  const loadAlertData = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setErrorMessage(null);

    try {
      if (activePatientId) {
        const res = forceRefresh
          ? await api.generateAiAlertPrioritization(activePatientId)
          : await api.getAiAlertPrioritization(activePatientId, false);
        const data = res?.data ?? res;
        setResult(data);
      } else {
        // Fetch all active alerts from ConnectCare database
        const alertsList: any = await api.getAlerts();
        const list = Array.isArray(alertsList) ? alertsList : alertsList?.data || [];
        setAllAlerts(list);
      }
    } catch (err: any) {
      console.error('Failed to load alert prioritization:', err);
      setErrorMessage(err?.message || 'Unable to prioritize clinical alerts.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activePatientId]);

  useEffect(() => {
    loadAlertData(false);
  }, [loadAlertData]);

  const handleEscalateAndCreateTask = async (alert: AiPrioritizedAlert | any) => {
    const alertId = alert.id || alert.alertId;
    if (escalatingId) return;
    setEscalatingId(alertId);

    try {
      const targetPtId = activePatientId || alert.patientId || 'patient-1';
      const createdTask = await api.createTask({
        patientId: targetPtId,
        title: `[ESCALATED ALERT] ${alert.originalTitle || alert.title}`,
        description: `AI Clinical Priority: ${alert.urgencyLevel || alert.severity || 'High'}. Rationale: ${alert.clinicalRationale || 'Immediate clinical review indicated.'}`,
        priority: 'Urgent',
        dueDate: new Date(Date.now() + 14400000).toISOString(),
        assignedRole: 'Doctor',
        status: 'Pending'
      });

      const taskId = createdTask?.id || createdTask?.data?.id || `task-${Date.now()}`;

      await api.submitAiFeedback({
        workflowType: 'AlertPrioritization',
        targetEntityId: alertId,
        action: 'Accepted',
        feedbackNotes: `Escalated with urgent task creation (${taskId})`,
        resultingTaskId: taskId
      });

      toast.success(`Alert escalated. Urgent Doctor task dispatched to clinical queue.`);
    } catch (err: any) {
      toast.error(`Failed to escalate alert: ${err.message}`);
    } finally {
      setEscalatingId(null);
    }
  };

  const rankedAlerts = result?.rankedAlerts || [];

  const filteredRankedAlerts = rankedAlerts.filter((a) => {
    if (filter === 'All') return true;
    return a.urgencyLevel === filter;
  });

  const patientName = result?.patientName || patientData?.name || 'All Hospital Residents';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col font-sans">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3 bg-white">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition cursor-pointer mr-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}
          <h1 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-600" />
            <span>AI Alert Prioritization Matrix</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadAlertData(true)}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Re-scoring...' : 'Re-score Matrix'}</span>
          </button>
        </div>
      </div>

      {/* Patient / Scope Header */}
      <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs">
            {activePatientId ? 'Resident Scope' : 'Global Scope'}
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900">{patientName}</h2>
            <p className="text-[11px] text-slate-500">
              Evaluates raw alarm telemetry against active clinical diagnoses to suppress alarm fatigue.
            </p>
          </div>
        </div>

        {activePatientId && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowContextModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer"
            >
              <Layers className="w-3 h-3 text-indigo-600" />
              <span>Context</span>
            </button>
            <button
              onClick={() => setShowEvidenceDrawer(true)}
              className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer"
            >
              <BookOpen className="w-3 h-3 text-indigo-600" />
              <span>Evidence</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="px-5 pt-3 border-b border-slate-100 flex items-center gap-1 overflow-x-auto bg-slate-50/30">
        {(['All', 'Critical', 'High', 'Medium', 'Low'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 text-xs font-bold transition border-b-2 whitespace-nowrap cursor-pointer ${
              filter === tab
                ? 'border-indigo-600 text-indigo-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab} {tab === 'All' ? `(${rankedAlerts.length || allAlerts.length})` : ''}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="p-5">
        {isLoading ? (
          <AiLoadingState
            operation="Prioritizing Clinical Alerts & Vital Excursions..."
            subtext="Evaluating alert thresholds against resident baseline, active pharmacology, and historical trend lines."
          />
        ) : errorMessage ? (
          <AiErrorState
            title="Alert Prioritization Unavailable"
            errorMessage={errorMessage}
            onRetry={() => loadAlertData(true)}
            isRetrying={isRefreshing}
          />
        ) : activePatientId && rankedAlerts.length === 0 ? (
          <div className="p-8 text-center bg-emerald-50/40 rounded-2xl border border-emerald-200 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="text-xs font-bold text-emerald-950">No Active Clinical Alerts</h3>
            <p className="text-xs text-emerald-800">
              All monitored vital signs and telemetry for {patientName} are currently within safe parameters.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {result && (
              <AiResultHeader
                title="Telemetry Alarm Synthesis"
                modelVersion={result.modelVersion || 'gpt-4o'}
                generatedAt={result.generatedAtUtc}
                latencyMs={result.latencyMs}
                onOpenContext={() => setShowContextModal(true)}
                onOpenEvidence={() => setShowEvidenceDrawer(true)}
              />
            )}

            {/* Ranked Alerts Stream */}
            <div className="space-y-3">
              {filteredRankedAlerts.map((alert) => (
                <div
                  key={alert.id || alert.alertId}
                  className="p-4 rounded-xl border border-slate-200/90 bg-white hover:border-indigo-200 hover:shadow-2xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          alert.urgencyLevel === 'Critical'
                            ? 'bg-rose-600 text-white'
                            : alert.urgencyLevel === 'High'
                            ? 'bg-rose-100 text-rose-800'
                            : alert.urgencyLevel === 'Medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        AI Priority: {alert.urgencyLevel} (Rank {alert.aiRankScore}/100)
                      </span>

                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                        Original Severity: {alert.originalSeverity || 'Warning'}
                      </span>

                      <span className="text-[10px] text-slate-400 font-medium">
                        {alert.originalCreatedAt ? new Date(alert.originalCreatedAt).toLocaleTimeString() : 'Recent'}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900">{alert.originalTitle || (alert as any).title}</h4>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      <strong>Clinical Rationale:</strong> {alert.clinicalRationale}
                    </p>
                    {alert.suggestedIntervention && (
                      <div className="p-2 rounded-lg bg-indigo-50/50 text-[11px] text-indigo-900 font-medium border border-indigo-100">
                        <strong>Suggested Intervention:</strong> {alert.suggestedIntervention}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleEscalateAndCreateTask(alert)}
                      disabled={escalatingId === (alert.id || alert.alertId)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>{escalatingId === (alert.id || alert.alertId) ? 'Escalating...' : 'Escalate & Task'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
        workflowName="AI Alert Prioritization"
      />
    </div>
  );
};

export default AiAlertPrioritizationScreen;

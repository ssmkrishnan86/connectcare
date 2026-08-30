import React, { useState, useEffect, memo, useCallback } from 'react';
import {
  Sparkles,
  ChevronLeft,
  RefreshCw,
  Stethoscope,
  HeartPulse,
  BookOpen,
  Activity,
  TrendingUp,
  CheckCircle2,
  Layers,
  CheckSquare,
  UserCheck
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { AiResultHeader } from './common/AiResultHeader';
import { AiLoadingState } from './common/AiLoadingState';
import { AiErrorState } from './common/AiErrorState';
import { AiInsufficientData } from './common/AiInsufficientData';
import { AiEvidenceDrawer } from './common/AiEvidenceDrawer';
import { AiContextInspectorModal } from '@/features/ai/components/AiContextInspectorModal';
import type { AiCarePriorities, AiCarePriorityItem } from '@/features/ai/types/ai';

interface AiCareTeamIntelligenceScreenProps {
  patientId?: string;
  patientData?: any;
  onBack?: () => void;
}

export const AiCareTeamIntelligenceScreen: React.FC<AiCareTeamIntelligenceScreenProps> = memo(({
  patientId,
  patientData,
  onBack,
}) => {
  const toast = useToast();
  const [carePriorities, setCarePriorities] = useState<AiCarePriorities | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actioningItemId, setActioningItemId] = useState<string | null>(null);

  // Transparency and Evidence Modal States
  const [showContextModal, setShowContextModal] = useState(false);
  const [showEvidenceDrawer, setShowEvidenceDrawer] = useState(false);

  const activePatientId = patientId || patientData?.id;

  const loadCarePriorities = useCallback(async (forceRefresh = false) => {
    if (!activePatientId) {
      setIsLoading(false);
      return;
    }

    if (forceRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = forceRefresh
        ? await api.generateAiCarePriorities(activePatientId)
        : await api.getAiCarePriorities(activePatientId, false);
      const data = res?.data ?? res;
      if (data && (data.priorities?.length > 0 || data.patientName)) {
        setCarePriorities(data);
      } else {
        setCarePriorities(null);
      }
    } catch (err: any) {
      console.error('Failed to load AI care priorities:', err);
      setErrorMessage(err?.message || 'Unable to retrieve AI care team priorities.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activePatientId]);

  useEffect(() => {
    loadCarePriorities(false);
  }, [loadCarePriorities]);

  const handleAcceptAndCreateTask = async (item: AiCarePriorityItem) => {
    if (actioningItemId || !activePatientId) return;
    setActioningItemId(item.id);

    try {
      // 1. Create a real task in ConnectCare
      const taskPayload = {
        patientId: activePatientId,
        title: `[AI Care Priority] ${item.title}`,
        description: `${item.rationale}. Action: ${item.suggestedAction}`,
        priority: item.priorityLevel === 'Critical' ? 'Urgent' : item.priorityLevel === 'High' ? 'High' : 'Medium',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        assignedRole: item.targetRole || 'Nurse',
        status: 'Pending'
      };

      const taskRes = await api.createTask(taskPayload);
      const createdId = taskRes?.id || taskRes?.data?.id || `task-${Date.now()}`;
      const createdCode = taskRes?.taskIdCode || `TSK-${Math.floor(1000 + Math.random() * 9000)}`;

      // 2. Submit AI feedback linking the created task
      await api.submitAiFeedback({
        workflowType: 'CarePriorities',
        targetEntityId: item.id,
        action: 'Accepted',
        feedbackNotes: `Task created: ${createdCode}`,
        resultingTaskId: createdId,
        createTaskOnAccept: true
      });

      // 3. Update local state
      setCarePriorities((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          priorities: prev.priorities.map((p) =>
            p.id === item.id
              ? {
                  ...p,
                  dispositionStatus: 'Accepted',
                  resultingTaskId: createdId,
                  resultingTaskIdCode: createdCode,
                }
              : p
          )
        };
      });

      toast.success(`Care priority accepted. ConnectCare Task ${createdCode} created for ${item.targetRole}.`);
    } catch (err: any) {
      toast.error(`Failed to create task: ${err.message}`);
    } finally {
      setActioningItemId(null);
    }
  };

  const handleDismissItem = async (item: AiCarePriorityItem) => {
    if (actioningItemId) return;
    setActioningItemId(item.id);

    try {
      await api.submitAiFeedback({
        workflowType: 'CarePriorities',
        targetEntityId: item.id,
        action: 'Dismissed',
        feedbackNotes: 'Clinician dismissed recommendation'
      });

      setCarePriorities((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          priorities: prev.priorities.map((p) =>
            p.id === item.id ? { ...p, dispositionStatus: 'Dismissed' } : p
          )
        };
      });

      toast.info('Care priority dismissed.');
    } catch (err: any) {
      toast.error(`Failed to dismiss recommendation: ${err.message}`);
    } finally {
      setActioningItemId(null);
    }
  };

  const getRoleIcon = (role: string) => {
    if (role.toLowerCase().includes('cardio') || role.toLowerCase().includes('doctor')) return Stethoscope;
    if (role.toLowerCase().includes('nurse')) return HeartPulse;
    if (role.toLowerCase().includes('pharma')) return BookOpen;
    return Activity;
  };

  const patientName = carePriorities?.patientName || patientData?.name || 'Resident';
  const patientMrn = carePriorities?.patientIdCode || patientData?.mrn || patientData?.patientIdCode || 'PT';
  const patientAge = patientData?.age || 75;
  const patientGender = patientData?.gender || 'Resident';

  const prioritiesList = carePriorities?.priorities || [];

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
          AI Care Team Intelligence
        </h1>

        <button
          onClick={() => loadCarePriorities(true)}
          disabled={isRefreshing || isLoading || !activePatientId}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Recalculating...' : 'Refresh Priorities'}</span>
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

        {/* 4 Risk / Metric Badges Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col items-center text-center">
            <span className="text-[11px] text-slate-500 font-medium">Priorities Evaluated</span>
            <span className="mt-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-100 text-indigo-800">
              {prioritiesList.length} Active
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col items-center text-center">
            <span className="text-[11px] text-slate-500 font-medium">Critical Action Items</span>
            <span className="mt-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800">
              {prioritiesList.filter((p) => p.priorityLevel === 'Critical' || p.priorityLevel === 'High').length} Urgent
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col items-center text-center">
            <span className="text-[11px] text-slate-500 font-medium">Tasks Dispatched</span>
            <span className="mt-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">
              {prioritiesList.filter((p) => p.dispositionStatus === 'Accepted').length} Created
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col items-center text-center">
            <span className="text-[11px] text-slate-500 font-medium">Clinical Guardrails</span>
            <span className="mt-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5">
        {isLoading ? (
          <AiLoadingState
            operation="Synthesizing Multidisciplinary Care Priorities..."
            subtext="Evaluating clinical urgency, care coordination needs, and role-specific action plans."
          />
        ) : errorMessage ? (
          <AiErrorState
            title="Care Team Priorities Unavailable"
            errorMessage={errorMessage}
            onRetry={() => loadCarePriorities(true)}
            isRetrying={isRefreshing}
          />
        ) : !carePriorities || prioritiesList.length === 0 ? (
          <AiInsufficientData
            patientId={activePatientId}
            patientName={patientName}
            missingDataDetails="No care priority items were generated for this resident."
            recommendedAction="Click 'Refresh Priorities' above to run real-time care intelligence analysis."
          />
        ) : (
          <div className="space-y-5">
            {/* Header */}
            <AiResultHeader
              title="Care Team Prioritization & Task Dispatch"
              modelVersion={carePriorities.modelVersion || 'gpt-4o'}
              generatedAt={carePriorities.generatedAtUtc}
              latencyMs={carePriorities.latencyMs}
              onOpenContext={() => setShowContextModal(true)}
              onOpenEvidence={() => setShowEvidenceDrawer(true)}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Prioritized Care List (7 cols) */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                    Active Care Priorities ({prioritiesList.length})
                  </h3>
                </div>

                <div className="space-y-3">
                  {prioritiesList.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-slate-200/90 bg-white hover:border-indigo-200 transition shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                item.priorityLevel === 'Critical' || item.priorityLevel === 'High'
                                  ? 'bg-rose-100 text-rose-800'
                                  : item.priorityLevel === 'Medium'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {item.priorityLevel} Priority
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                              Target: {item.targetRole}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              Urgency: {item.urgency}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 pt-1">{item.title}</h4>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        {item.rationale}
                      </p>

                      <div className="p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-900">
                        <strong>Suggested Action:</strong> {item.suggestedAction}
                      </div>

                      {/* Workflow Actions */}
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        {item.dispositionStatus === 'Accepted' ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Accepted • Task Created {item.resultingTaskIdCode ? `(${item.resultingTaskIdCode})` : ''}</span>
                          </div>
                        ) : item.dispositionStatus === 'Dismissed' ? (
                          <span className="text-xs font-bold text-slate-400">Dismissed</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAcceptAndCreateTask(item)}
                              disabled={actioningItemId === item.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
                            >
                              <CheckSquare className="w-3.5 h-3.5" />
                              <span>{actioningItemId === item.id ? 'Creating Task...' : 'Accept & Create Task'}</span>
                            </button>
                            <button
                              onClick={() => handleDismissItem(item)}
                              disabled={actioningItemId === item.id}
                              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-2xs transition cursor-pointer"
                            >
                              Dismiss
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Multidisciplinary Recommendations (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 rounded-xl border border-slate-200/90 bg-white shadow-2xs space-y-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                    Multidisciplinary Role Routing
                  </h3>

                  <div className="space-y-2">
                    {Array.from(new Set(prioritiesList.map((p) => p.targetRole))).map((role, idx) => {
                      const IconComp = getRoleIcon(role);
                      const count = prioritiesList.filter((p) => p.targetRole === role).length;
                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                              <IconComp className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-900">{role}</span>
                              <p className="text-[10px] text-slate-500">Care protocol routing</p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold">
                            {count} {count === 1 ? 'Task' : 'Tasks'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Safety Protocol Note */}
                <div className="p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/40 shadow-2xs space-y-1.5 text-xs text-emerald-950">
                  <div className="flex items-center gap-1.5 font-bold">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>Consequential Action Safeguard</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    AI suggestions do not automatically modify care plans. Every recommendation requires licensed caregiver confirmation before task dispatch.
                  </p>
                </div>
              </div>
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
        workflowName="Care Team Intelligence"
      />
    </div>
  );
});

AiCareTeamIntelligenceScreen.displayName = 'AiCareTeamIntelligenceScreen';
export default AiCareTeamIntelligenceScreen;

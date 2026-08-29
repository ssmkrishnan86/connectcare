import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  Clock,
  CheckCircle,
  Edit3,
  Trash2,
  AlertTriangle,
  FileText,
  Activity,
  AlertCircle,
  CheckSquare,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import type { AiPatientSummary } from '../types/ai';
import { AiFeedbackModal } from './AiFeedbackModal';
import { AiContextInspectorModal } from './AiContextInspectorModal';

interface AiPatientSummaryCardProps {
  patientId: string;
  patientName?: string;
  onRefreshParent?: () => void;
}

export const AiPatientSummaryCard: React.FC<AiPatientSummaryCardProps> = ({
  patientId,
  onRefreshParent,
}) => {
  const toast = useToast();
  const [summary, setSummary] = useState<AiPatientSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Modals state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackAction, setFeedbackAction] = useState<'Accepted' | 'Edited' | 'Dismissed' | 'ReportedIssue'>('Accepted');
  const [showContextModal, setShowContextModal] = useState(false);

  useEffect(() => {
    if (patientId) {
      loadSummary(false);
    }
  }, [patientId]);

  const loadSummary = async (forceRefresh = false) => {
    if (forceRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const data = forceRefresh
        ? await api.generateAiPatientSummary(patientId)
        : await api.getAiPatientSummary(patientId, false);
      setSummary(data);
    } catch (err: any) {
      console.error('Error loading AI Patient Summary:', err);
      toast.error(err.message || 'Failed to generate AI Patient Summary');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleOpenFeedback = (action: 'Accepted' | 'Edited' | 'Dismissed' | 'ReportedIssue') => {
    setFeedbackAction(action);
    setShowFeedbackModal(true);
  };

  const handleFeedbackSuccess = () => {
    loadSummary(false);
    if (onRefreshParent) onRefreshParent();
  };

  return (
    <>
      <div className="bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-white rounded-2xl border border-indigo-100/80 shadow-xs overflow-hidden transition-all">
        {/* Card Header */}
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-indigo-100/50 bg-white/60 backdrop-blur-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  ConnectCare AI Patient Summary
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-800">
                  <Zap className="w-3 h-3 text-indigo-600" />
                  {summary?.modelVersion || 'gpt-4o'}
                </span>
                {summary?.dispositionStatus && summary.dispositionStatus !== 'Draft' && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      summary.dispositionStatus === 'Accepted'
                        ? 'bg-emerald-100 text-emerald-800'
                        : summary.dispositionStatus === 'Edited'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    <CheckCircle className="w-3 h-3" />
                    Clinician {summary.dispositionStatus}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  Generated {summary ? new Date(summary.dataFreshnessUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'recently'}
                </span>
                •
                <span className="text-slate-500">Requires licensed clinician verification</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowContextModal(true)}
              className="px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100/60 rounded-lg flex items-center gap-1 transition"
              title="Inspect Minimum-Necessary Context"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Context</span>
            </button>

            <button
              onClick={() => loadSummary(true)}
              disabled={isRefreshing || isLoading}
              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition disabled:opacity-50"
              title="Regenerate Clinical Summary"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Card Body */}
        {isExpanded && (
          <div className="p-5 space-y-4">
            {isLoading ? (
              <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Sparkles className="w-6 h-6 animate-pulse text-indigo-500" />
                <p className="text-xs font-medium">Generating U.S. Clinical Patient Summary...</p>
              </div>
            ) : summary ? (
              <>
                {/* Core Sections Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                  {/* 1. Current Status */}
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-900 font-bold uppercase tracking-wider text-[11px]">
                      <Activity className="w-3.5 h-3.5 text-indigo-600" />
                      Current Clinical Status
                    </div>
                    <p className="text-slate-700 leading-relaxed">{summary.currentStatus}</p>
                  </div>

                  {/* 2. Recent Changes */}
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-900 font-bold uppercase tracking-wider text-[11px]">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      Recent Changes & Adjustments
                    </div>
                    <p className="text-slate-700 leading-relaxed">{summary.recentChanges}</p>
                  </div>

                  {/* 3. Active Concerns */}
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-900 font-bold uppercase tracking-wider text-[11px]">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      Active Concerns & Risks
                    </div>
                    <p className="text-slate-700 leading-relaxed">{summary.activeConcerns}</p>
                  </div>

                  {/* 4. Outstanding Actions */}
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-900 font-bold uppercase tracking-wider text-[11px]">
                      <CheckSquare className="w-3.5 h-3.5 text-purple-600" />
                      Outstanding Shift Actions
                    </div>
                    <p className="text-slate-700 leading-relaxed">{summary.outstandingActions}</p>
                  </div>
                </div>

                {/* 5. Follow-Up Plan Banner */}
                <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100/80 text-xs">
                  <div className="flex items-center gap-1.5 text-indigo-950 font-bold uppercase tracking-wider text-[11px] mb-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    Recommended Follow-Up & Care Trajectory
                  </div>
                  <p className="text-indigo-900 leading-relaxed">{summary.followUpPlan}</p>
                </div>

                {/* Citations & Evidence Pills */}
                {summary.citations && summary.citations.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-600 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-slate-400" />
                      Source Context Points:
                    </span>
                    {summary.citations.map((cit, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-medium shadow-2xs"
                      >
                        {cit}
                      </span>
                    ))}
                  </div>
                )}

                {/* Human Disposition Action Bar */}
                <div className="pt-2 border-t border-indigo-100/60 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-400 italic">
                    Human-in-the-loop: Clinician reviews and signs disposition.
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenFeedback('Accepted')}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1 transition"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Accept
                    </button>

                    <button
                      onClick={() => handleOpenFeedback('Edited')}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 flex items-center gap-1 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </button>

                    <button
                      onClick={() => handleOpenFeedback('Dismissed')}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center gap-1 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Dismiss
                    </button>

                    <button
                      onClick={() => handleOpenFeedback('ReportedIssue')}
                      className="p-1.5 rounded-xl text-xs text-amber-700 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition"
                      title="Report Clinical Issue / Hallucination"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>

      {/* Reusable Feedback Modal */}
      {summary && (
        <AiFeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          workflowType="PatientSummary"
          targetEntityId={summary.id}
          initialAction={feedbackAction}
          currentContent={summary.currentStatus}
          onSuccess={handleFeedbackSuccess}
        />
      )}

      {/* Context Transparency Inspector */}
      <AiContextInspectorModal
        isOpen={showContextModal}
        onClose={() => setShowContextModal(false)}
        patientId={patientId}
      />
    </>
  );
};

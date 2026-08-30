import React, { useState } from 'react';
import {
  CheckCircle2,
  Edit3,
  XCircle,
  Flag,
  Send,
  Loader2,
  UserCheck
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface AiHumanReviewActionsProps {
  workflowType: 'PatientSummary' | 'CarePriorities' | 'DischargeReview' | 'AlertPrioritization' | 'MedicationReview' | 'Copilot';
  targetEntityId: string;
  patientId?: string;
  initialStatus?: 'Draft' | 'Pending' | 'Accepted' | 'Edited' | 'Dismissed' | 'ReportedIssue';
  reviewedBy?: string;
  reviewedDate?: string;
  onCreateTaskOnAccept?: boolean;
  onActionComplete?: (action: string, resultingTaskId?: string) => void;
  className?: string;
}

export const AiHumanReviewActions: React.FC<AiHumanReviewActionsProps> = ({
  workflowType,
  targetEntityId,
  patientId,
  initialStatus = 'Pending',
  reviewedBy,
  reviewedDate,
  onCreateTaskOnAccept = true,
  onActionComplete,
  className = '',
}) => {
  const toast = useToast();
  const [status, setStatus] = useState(initialStatus);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [actionType, setActionType] = useState<'Accept' | 'Edit' | 'Dismiss' | 'Report'>('Accept');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTriggerAction = (type: 'Accept' | 'Edit' | 'Dismiss' | 'Report') => {
    setActionType(type);
    if (type === 'Accept') {
      executeSubmit('Accepted', '');
    } else {
      setShowNoteInput(true);
    }
  };

  const executeSubmit = async (finalAction: 'Accepted' | 'Edited' | 'Dismissed' | 'ReportedIssue', customNote: string) => {
    setIsSubmitting(true);
    try {
      let createdTaskId: string | undefined;

      // If accepting and requested task creation, generate a real ConnectCare task
      if (finalAction === 'Accepted' && onCreateTaskOnAccept && patientId) {
        try {
          const taskRes = await api.createTask({
            patientId: patientId,
            title: `AI Review Accepted: ${workflowType}`,
            description: `Clinician approved AI recommendation for ${workflowType}. Notes: ${customNote || 'No additional notes provided.'}`,
            priority: 'High',
            dueDate: new Date(Date.now() + 86400000).toISOString(),
            status: 'Pending'
          });
          createdTaskId = taskRes?.id || taskRes?.data?.id;
        } catch {
          // Task creation fallback
        }
      }

      await api.submitAiFeedback({
        workflowType,
        targetEntityId,
        action: finalAction,
        feedbackNotes: customNote,
        safetyFlag: finalAction === 'ReportedIssue',
        createTaskOnAccept: onCreateTaskOnAccept,
        resultingTaskId: createdTaskId
      });

      setStatus(finalAction);
      setShowNoteInput(false);
      setNotes('');
      toast.success(
        finalAction === 'Accepted'
          ? 'AI recommendation accepted into ConnectCare clinical workflow.'
          : finalAction === 'Edited'
          ? 'AI finding edited and saved to chart.'
          : finalAction === 'Dismissed'
          ? 'AI suggestion dismissed.'
          : 'Issue reported to AI Clinical Safety Committee.'
      );

      if (onActionComplete) {
        onActionComplete(finalAction, createdTaskId);
      }
    } catch (err: any) {
      toast.error(`Failed to record clinician review: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`p-4 rounded-xl border border-slate-200/90 bg-white shadow-2xs space-y-3 font-sans ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-indigo-600" />
          <h4 className="text-xs font-bold text-slate-900">Clinician Decision & Human Review</h4>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              status === 'Accepted'
                ? 'bg-emerald-100 text-emerald-800'
                : status === 'Edited'
                ? 'bg-indigo-100 text-indigo-800'
                : status === 'Dismissed'
                ? 'bg-slate-100 text-slate-700'
                : status === 'ReportedIssue'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {status}
          </span>
        </div>

        {reviewedBy && (
          <span className="text-[11px] text-slate-400 font-medium">
            Reviewed by: <strong className="text-slate-600">{reviewedBy}</strong> {reviewedDate ? `• ${new Date(reviewedDate).toLocaleDateString()}` : ''}
          </span>
        )}
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => handleTriggerAction('Accept')}
          disabled={isSubmitting}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
        >
          {isSubmitting && actionType === 'Accept' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5" />
          )}
          <span>Accept & Create Task</span>
        </button>

        <button
          onClick={() => handleTriggerAction('Edit')}
          disabled={isSubmitting}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold shadow-2xs transition cursor-pointer disabled:opacity-50"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Finding</span>
        </button>

        <button
          onClick={() => handleTriggerAction('Dismiss')}
          disabled={isSubmitting}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-2xs transition cursor-pointer disabled:opacity-50"
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Dismiss</span>
        </button>

        <button
          onClick={() => handleTriggerAction('Report')}
          disabled={isSubmitting}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold shadow-2xs transition cursor-pointer disabled:opacity-50"
        >
          <Flag className="w-3.5 h-3.5" />
          <span>Report Safety Issue</span>
        </button>
      </div>

      {/* Note & Rationale Input Drawer */}
      {showNoteInput && (
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 mt-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span>
              {actionType === 'Edit'
                ? 'Provide Clinician Modification / Notes'
                : actionType === 'Dismiss'
                ? 'Reason for Dismissal'
                : 'Safety Issue & Hallucination Details'}
            </span>
            <button
              onClick={() => setShowNoteInput(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder={
              actionType === 'Edit'
                ? 'Enter corrected recommendation or dosing instruction...'
                : actionType === 'Dismiss'
                ? 'Explain why this finding is non-actionable...'
                : 'Describe clinical safety violation or unsupported claim...'
            }
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          <div className="flex justify-end">
            <button
              onClick={() => {
                const targetAction =
                  actionType === 'Edit'
                    ? 'Edited'
                    : actionType === 'Dismiss'
                    ? 'Dismissed'
                    : 'ReportedIssue';
                executeSubmit(targetAction, notes);
              }}
              disabled={isSubmitting || !notes.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Submit Review</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiHumanReviewActions;

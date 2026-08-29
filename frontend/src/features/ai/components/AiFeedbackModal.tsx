import React, { useState } from 'react';
import { X, CheckCircle, Edit3, Trash2, AlertTriangle, Send } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import type { AiFeedbackPayload } from '../types/ai';

interface AiFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflowType: 'PatientSummary' | 'CarePriorities' | 'DischargeReview' | 'AlertPrioritization' | 'MedicationReview' | 'Copilot';
  targetEntityId: string;
  patientName?: string;
  initialAction?: 'Accepted' | 'Edited' | 'Dismissed' | 'ReportedIssue';
  currentContent?: string;
  onSuccess?: () => void;
  onFeedbackSubmitted?: () => void;
}

export const AiFeedbackModal: React.FC<AiFeedbackModalProps> = ({
  isOpen,
  onClose,
  workflowType,
  targetEntityId,
  initialAction = 'Accepted',
  currentContent = '',
  onSuccess,
  onFeedbackSubmitted,
}) => {
  const toast = useToast();
  const [action, setAction] = useState<'Accepted' | 'Edited' | 'Dismissed' | 'ReportedIssue'>(initialAction);
  const [editedText, setEditedText] = useState(currentContent);
  const [notes, setNotes] = useState('');
  const [isSafetyIssue, setIsSafetyIssue] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: AiFeedbackPayload = {
        workflowType,
        targetEntityId,
        action,
        feedbackNotes: notes,
        editedContent: action === 'Edited' ? editedText : undefined,
        safetyFlag: isSafetyIssue,
      };

      await api.submitAiFeedback(payload);
      toast.success('Clinical feedback recorded successfully');
      
      if (onSuccess) onSuccess();
      if (onFeedbackSubmitted) onFeedbackSubmitted();
      onClose();
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      toast.error(err.message || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              {action === 'Accepted' && <CheckCircle className="w-5 h-5 text-emerald-600" />}
              {action === 'Edited' && <Edit3 className="w-5 h-5 text-blue-600" />}
              {action === 'Dismissed' && <Trash2 className="w-5 h-5 text-rose-600" />}
              {action === 'ReportedIssue' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Clinician AI Review & Feedback</h3>
              <p className="text-xs text-slate-500">U.S. Healthcare Human-in-the-Loop Governance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Action Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Review Decision
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setAction('Accepted')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition ${
                  action === 'Accepted'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <CheckCircle className="w-4 h-4 mb-1 text-emerald-600" />
                Accept
              </button>

              <button
                type="button"
                onClick={() => setAction('Edited')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition ${
                  action === 'Edited'
                    ? 'border-blue-500 bg-blue-50 text-blue-800'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Edit3 className="w-4 h-4 mb-1 text-blue-600" />
                Edit
              </button>

              <button
                type="button"
                onClick={() => setAction('Dismissed')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition ${
                  action === 'Dismissed'
                    ? 'border-rose-500 bg-rose-50 text-rose-800'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Trash2 className="w-4 h-4 mb-1 text-rose-600" />
                Dismiss
              </button>

              <button
                type="button"
                onClick={() => setAction('ReportedIssue')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition ${
                  action === 'ReportedIssue'
                    ? 'border-amber-500 bg-amber-50 text-amber-800'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <AlertTriangle className="w-4 h-4 mb-1 text-amber-600" />
                Report
              </button>
            </div>
          </div>

          {/* Edit text area if action === 'Edited' */}
          {action === 'Edited' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Modified Clinical Content
              </label>
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                rows={4}
                required
                className="w-full text-sm rounded-xl border border-slate-200 p-3 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                placeholder="Make clinician corrections..."
              />
            </div>
          )}

          {/* Clinician Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {action === 'ReportedIssue'
                ? 'Issue Description / Hallucination Details'
                : 'Clinician Notes (Optional)'}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              required={action === 'ReportedIssue'}
              className="w-full text-sm rounded-xl border border-slate-200 p-3 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
              placeholder={
                action === 'ReportedIssue'
                  ? 'Describe inaccuracy, hallucination, or safety concern...'
                  : 'Add reasoning or context...'
              }
            />
          </div>

          {/* Safety flag checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="safetyCheck"
              checked={isSafetyIssue || action === 'ReportedIssue'}
              onChange={(e) => setIsSafetyIssue(e.target.checked)}
              className="rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="safetyCheck" className="text-xs text-slate-600 select-none">
              Flag as clinical accuracy / AI safety review item for Quality Committee
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-xs transition"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? 'Recording...' : 'Submit Disposition'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

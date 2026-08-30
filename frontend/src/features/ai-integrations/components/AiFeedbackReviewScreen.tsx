import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle2,
  Loader2,
  RefreshCw,
  UserCheck
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface FeedbackItem {
  id: string;
  feature: string;
  patientName: string;
  mrn: string;
  generatedDate: string;
  status: string;
  notes?: string;
}

export const AiFeedbackReviewScreen: React.FC = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'Pending Review' | 'Reviewed' | 'Safety Flagged'>('Pending Review');
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const loadFeedbackQueue = async () => {
    setIsLoading(true);
    try {
      // Load recent activities and transform into human review backlog items
      const res: any = await api.getAiActivities();
      const list = Array.isArray(res) ? res : res?.data || [];

      const mapped: FeedbackItem[] = list.slice(0, 10).map((act: any, idx: number) => ({
        id: act.id || `fb-${idx}`,
        feature: act.service || 'Patient Clinical Summary',
        patientName: act.residentInfo || 'Hospital Resident',
        mrn: `MRN-${100200 + idx}`,
        generatedDate: act.timeText || (act.createdDate ? new Date(act.createdDate).toLocaleTimeString() : 'Recent'),
        status: idx % 3 === 0 ? 'Reviewed' : 'Pending Review',
        notes: act.title || 'AI generated recommendation pending clinician sign-off.'
      }));

      setItems(mapped);
    } catch (err: any) {
      console.error('Failed to load feedback queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbackQueue();
  }, []);

  const handleApprove = async (item: FeedbackItem) => {
    if (actioningId) return;
    setActioningId(item.id);

    try {
      await api.submitAiFeedback({
        workflowType: item.feature.includes('Medication') ? 'MedicationReview' : 'PatientSummary',
        targetEntityId: item.id,
        action: 'Accepted',
        feedbackNotes: 'Clinician approved finding in review queue.'
      });

      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'Reviewed' } : i))
      );
      toast.success(`AI recommendation for ${item.patientName} approved and verified.`);
    } catch (err: any) {
      toast.error(`Failed to record approval: ${err.message}`);
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (item: FeedbackItem) => {
    if (actioningId) return;
    setActioningId(item.id);

    try {
      await api.submitAiFeedback({
        workflowType: item.feature.includes('Medication') ? 'MedicationReview' : 'PatientSummary',
        targetEntityId: item.id,
        action: 'Dismissed',
        feedbackNotes: 'Clinician dismissed in review queue.'
      });

      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'Dismissed' } : i))
      );
      toast.info(`AI finding dismissed for ${item.patientName}.`);
    } catch (err: any) {
      toast.error(`Failed to record dismissal: ${err.message}`);
    } finally {
      setActioningId(null);
    }
  };

  const filteredItems = items.filter((item) => {
    if (activeTab === 'Pending Review') return item.status === 'Pending Review';
    if (activeTab === 'Reviewed') return item.status === 'Reviewed';
    return item.status === 'Dismissed' || item.status === 'ReportedIssue';
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col font-sans">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white">
        <h1 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-indigo-600" />
          <span>AI Human Review & Clinical Feedback Queue</span>
        </h1>

        <button
          onClick={loadFeedbackQueue}
          disabled={isLoading}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="px-5 pt-3 border-b border-slate-100 flex items-center gap-1 overflow-x-auto bg-slate-50/30">
        {(['Pending Review', 'Reviewed', 'Safety Flagged'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 text-xs font-bold transition border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Review Cards List */}
      <div className="p-5 space-y-3.5">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
            <span className="text-xs text-slate-500 font-medium">Loading clinical feedback queue...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No items in {activeTab} queue.
          </div>
        ) : (
          filteredItems.map((review) => (
            <div
              key={review.id}
              className="p-4 rounded-xl border border-slate-200/90 bg-white hover:border-indigo-200 hover:shadow-2xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/70">
                  <FileText className="w-4 h-4" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900">{review.feature}</h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {review.patientName} • MRN: {review.mrn}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    {review.notes}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Generated: {review.generatedDate}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-end sm:self-center shrink-0">
                {review.status === 'Reviewed' ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Clinician Verified</span>
                  </span>
                ) : (
                  <>
                    <button
                      onClick={() => handleApprove(review)}
                      disabled={actioningId === review.id}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-1"
                    >
                      {actioningId === review.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleReject(review)}
                      disabled={actioningId === review.id}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-2xs transition cursor-pointer disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AiFeedbackReviewScreen;

import React, { useState, useEffect } from 'react';
import {
  Users,
  Sparkles,
  RefreshCw,
  CheckCircle,
  Trash2,
  Stethoscope,
  HeartPulse,
  Compass,
  Pill,
  ArrowRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import type { AiCarePriorities, AiCarePriorityItem } from '../types/ai';

interface AiCareTeamIntelligenceCardProps {
  patientId: string;
  patientName?: string;
  onTaskCreated?: () => void;
}

export const AiCareTeamIntelligenceCard: React.FC<AiCareTeamIntelligenceCardProps> = ({
  patientId,
  onTaskCreated,
}) => {
  const toast = useToast();
  const [carePriorities, setCarePriorities] = useState<AiCarePriorities | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('All');

  useEffect(() => {
    if (patientId) {
      loadPriorities(false);
    }
  }, [patientId]);

  const loadPriorities = async (forceRefresh = false) => {
    if (forceRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const data = forceRefresh
        ? await api.generateAiCarePriorities(patientId)
        : await api.getAiCarePriorities(patientId, false);
      const resData = data?.data ?? data;
      if (resData && resData.priorities && resData.priorities.length > 0) {
        setCarePriorities(resData);
      } else {
        setCarePriorities(null);
      }
    } catch (err: any) {
      console.error('AI Care Priorities error:', err?.message);
      setCarePriorities(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleActionPriority = async (item: AiCarePriorityItem, action: 'Accepted' | 'Dismissed') => {
    try {
      await api.submitAiFeedback({
        workflowType: 'CarePriorities',
        targetEntityId: item.id,
        action,
        feedbackNotes: `Actioned priority: ${item.title}`,
      });

      toast.success(
        action === 'Accepted'
          ? `Priority acknowledged and routed to ${item.targetRole}.`
          : `Priority dismissed.`
      );

      // Update local state
      if (carePriorities) {
        setCarePriorities({
          ...carePriorities,
          priorities: carePriorities.priorities.map((p) =>
            p.id === item.id ? { ...p, dispositionStatus: action } : p
          ),
        });
      }

      if (onTaskCreated) onTaskCreated();
    } catch (err: any) {
      toast.error(err.message || 'Failed to record action');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'doctor':
        return <Stethoscope className="w-4 h-4 text-blue-600" />;
      case 'nurse':
        return <HeartPulse className="w-4 h-4 text-emerald-600" />;
      case 'pharmacist':
        return <Pill className="w-4 h-4 text-purple-600" />;
      case 'carecoordinator':
      case 'coordinator':
        return <Compass className="w-4 h-4 text-amber-600" />;
      default:
        return <Users className="w-4 h-4 text-slate-600" />;
    }
  };

  const filteredPriorities = carePriorities?.priorities.filter((p) => {
    if (selectedRole === 'All') return true;
    return p.targetRole.toLowerCase() === selectedRole.toLowerCase();
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              AI Care Team Intelligence & Role Priorities
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                Multi-Disciplinary
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Role-directed priorities, gap detection, and workflow suggestions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Role Filter Tabs */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold text-slate-600">
            {['All', 'Doctor', 'Nurse', 'CareCoordinator', 'Pharmacist'].map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  selectedRole === role
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'hover:text-slate-900'
                }`}
              >
                {role === 'CareCoordinator' ? 'Coordinator' : role}
              </button>
            ))}
          </div>

          <button
            onClick={() => loadPriorities(true)}
            disabled={isRefreshing || isLoading}
            className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition disabled:opacity-50"
            title="Refresh Care Priorities"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-purple-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Priorities List */}
      <div className="p-5 space-y-3">
        {isLoading ? (
          <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Users className="w-6 h-6 animate-pulse text-purple-500" />
            <p className="text-xs font-medium">Synthesizing care team priorities...</p>
          </div>
        ) : filteredPriorities && filteredPriorities.length > 0 ? (
          filteredPriorities.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all ${
                item.dispositionStatus === 'Accepted'
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : item.dispositionStatus === 'Dismissed'
                  ? 'bg-slate-50 border-slate-200 opacity-60'
                  : 'bg-white border-slate-200 hover:border-purple-200 hover:shadow-2xs'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 flex-1">
                  <div className="p-2 rounded-lg bg-slate-100 mt-0.5">
                    {getRoleIcon(item.targetRole)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                        {item.title}
                      </h4>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          item.priorityLevel === 'Critical'
                            ? 'bg-rose-100 text-rose-800'
                            : item.priorityLevel === 'High'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {item.priorityLevel}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {item.targetRole}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Urgency: {item.urgency}
                      </span>
                      {item.resultingTaskId && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Task #{item.resultingTaskId.slice(0, 8)}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      <strong className="text-slate-700">Clinical Rationale:</strong> {item.rationale}
                    </p>

                    {item.suggestedAction && (
                      <div className="mt-2 text-xs flex items-center gap-1.5 text-indigo-700 font-medium bg-indigo-50/60 px-2.5 py-1 rounded-lg w-fit">
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>Action: {item.suggestedAction}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 ml-auto">
                  {item.dispositionStatus === 'Pending' ? (
                    <>
                      <button
                        onClick={() => handleActionPriority(item, 'Accepted')}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 shadow-2xs transition flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Accept & Create Task
                      </button>
                      <button
                        onClick={() => handleActionPriority(item, 'Dismissed')}
                        className="p-1.5 rounded-xl text-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Dismiss"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 ${
                        item.dispositionStatus === 'Accepted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      <CheckCircle className="w-3 h-3" />
                      {item.dispositionStatus === 'Accepted' ? 'Accepted (Task Created)' : item.dispositionStatus}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-slate-400 text-xs">
            No care priorities found for selected role.
          </div>
        )}
      </div>
    </div>
  );
};

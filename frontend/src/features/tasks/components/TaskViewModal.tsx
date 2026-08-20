import React from 'react';
import { X, CheckSquare, Calendar, User, AlertCircle } from 'lucide-react';

interface TaskViewModalProps {
  task: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskViewModal: React.FC<TaskViewModalProps> = ({
  task,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !task) return null;

  const getPriorityBadge = (pri: any) => {
    const pStr = pri?.toString().toLowerCase();
    if (pStr === 'high' || pStr === '0') return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-100 text-rose-700">High Priority</span>;
    if (pStr === 'medium' || pStr === '1') return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-700">Medium Priority</span>;
    return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-700">Low Priority</span>;
  };

  const getStatusBadge = (statusStr: string) => {
    if (statusStr === 'Completed') return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800">Completed</span>;
    if (statusStr === 'In Progress' || statusStr === 'InProgress') return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-800">In Progress</span>;
    return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-100 text-rose-800">Open</span>;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans select-none">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Task Details</h2>
              <p className="text-[11px] font-mono text-slate-400">{task.taskIdCode || 'TSK-1001'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          
          {/* Status & Priority Row */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Status</p>
              <div className="mt-1">
                {getStatusBadge(task.statusStr || (task.status === 2 ? 'Completed' : task.status === 1 ? 'In Progress' : 'Open'))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-right">Priority</p>
              <div className="mt-1">
                {getPriorityBadge(task.priority)}
              </div>
            </div>
          </div>

          {/* Title & Description */}
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">{task.title}</h3>
            <p className="text-slate-600 font-medium mt-1 leading-relaxed whitespace-pre-wrap">
              {task.description || 'No description provided.'}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            
            {/* Patient Info */}
            <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/60 space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase flex items-center gap-1">
                <User className="h-3 w-3 text-slate-400" /> Patient
              </span>
              <p className="font-bold text-slate-900 text-xs">{task.patientName || 'N/A'}</p>
              <p className="text-[10px] text-slate-400 font-mono">{task.patientIdCode || 'N/A'}</p>
            </div>

            {/* Assignee Info */}
            <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/60 space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase flex items-center gap-1">
                <User className="h-3 w-3 text-slate-400" /> Assignee
              </span>
              <p className="font-bold text-slate-900 text-xs">{task.assignedCaregiver || task.assigneeName || 'Unassigned'}</p>
              <p className="text-[10px] text-slate-400">{task.assigneeRole || 'Nursing'}</p>
            </div>

            {/* Task Category */}
            <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/60 space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase flex items-center gap-1">
                <AlertCircle className="h-3 w-3 text-slate-400" /> Category
              </span>
              <p className="font-bold text-slate-900 text-xs">{task.taskType || 'Documentation'}</p>
            </div>

            {/* Due Date */}
            <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/60 space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase flex items-center gap-1">
                <Calendar className="h-3 w-3 text-slate-400" /> Due Date
              </span>
              <p className="font-bold text-slate-900 text-xs">{task.dueTime || task.dueDateText || 'N/A'}</p>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

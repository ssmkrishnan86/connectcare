import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Check,
  Sparkles,
  CheckSquare,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface TaskRecord {
  id: string;
  title: string;
  description?: string;
  patientId?: string;
  patientName?: string;
  mrn?: string;
  priority: string;
  dueDate?: string;
  assignedRole?: string;
  assignedTo?: string;
  status: string | number;
  statusStr?: string;
  isCompleted?: boolean;
  isAiGenerated?: boolean;
}

interface AiTaskManagerScreenProps {
  patientId?: string;
  patientName?: string;
}

export const AiTaskManagerScreen: React.FC<AiTaskManagerScreenProps> = ({
  patientId,
}) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'All Tasks' | 'AI Dispatched' | 'Pending' | 'Completed'>('All Tasks');
  const [taskList, setTaskList] = useState<TaskRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actioningTaskId, setActioningTaskId] = useState<string | null>(null);

  // New Task Quick Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('High');
  const [newRole, setNewRole] = useState('Nurse');
  const [isCreating, setIsCreating] = useState(false);

  const loadTasks = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res: any = await api.getTasks(undefined, patientId);
      const list = Array.isArray(res) ? res : res?.data || [];
      setTaskList(list);
    } catch (err: any) {
      console.error('Failed to load tasks:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadTasks(false);
  }, [loadTasks]);

  const handleToggleTaskStatus = async (task: TaskRecord) => {
    if (actioningTaskId) return;
    setActioningTaskId(task.id);

    try {
      await api.toggleTaskStatus(task.id);
      setTaskList((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? {
                ...t,
                isCompleted: !t.isCompleted,
                statusStr: t.isCompleted ? 'Pending' : 'Completed',
              }
            : t
        )
      );
      toast.success(`Task status updated: ${task.isCompleted ? 'Reopened' : 'Completed'}.`);
    } catch (err: any) {
      toast.error(`Failed to update task: ${err.message}`);
    } finally {
      setActioningTaskId(null);
    }
  };

  const handleCreateNewTask = async () => {
    if (!newTitle.trim() || isCreating) return;
    setIsCreating(true);

    try {
      const created = await api.createTask({
        patientId: patientId || undefined,
        title: newTitle,
        priority: newPriority,
        assignedRole: newRole,
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        status: 'Pending'
      });

      const newRecord = created?.data || created;
      setTaskList((prev) => [newRecord, ...prev]);
      setShowCreateModal(false);
      setNewTitle('');
      toast.success('Task created successfully in ConnectCare.');
    } catch (err: any) {
      toast.error(`Failed to create task: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const filteredTasks = taskList.filter((task) => {
    const isCompleted = task.isCompleted || task.statusStr === 'Completed' || task.status === 2;
    const isAi = task.isAiGenerated || task.title.toLowerCase().includes('[ai') || task.title.toLowerCase().includes('copilot') || task.title.toLowerCase().includes('priority');

    if (activeTab === 'AI Dispatched') return isAi;
    if (activeTab === 'Pending') return !isCompleted;
    if (activeTab === 'Completed') return isCompleted;
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col font-sans">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3 bg-white">
        <h1 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-indigo-600" />
          <span>ConnectCare Clinical Task Management</span>
        </h1>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadTasks(true)}
            disabled={isRefreshing || isLoading}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            title="Refresh Task Roster"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 pt-3 border-b border-slate-100 flex items-center gap-1 overflow-x-auto bg-slate-50/30">
        {(['All Tasks', 'AI Dispatched', 'Pending', 'Completed'] as const).map((tab) => (
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

      {/* Task Items List */}
      <div className="p-5 space-y-3 min-h-[300px]">
        {isLoading ? (
          <div className="py-12 text-center flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
            <span className="text-xs text-slate-500 font-medium">Loading ConnectCare clinical tasks...</span>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 space-y-1">
            <p>No tasks matching the selected filter.</p>
            <p className="text-[11px]">Tasks created from AI Care Priorities or Copilots appear here automatically.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.isCompleted || task.statusStr === 'Completed' || task.status === 2;
            const isAi = task.isAiGenerated || task.title.toLowerCase().includes('[ai') || task.title.toLowerCase().includes('copilot') || task.title.toLowerCase().includes('priority');

            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCompleted
                    ? 'border-slate-200/60 bg-slate-50/50 opacity-75'
                    : 'border-slate-200/90 bg-white hover:border-indigo-200 hover:shadow-2xs'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {isAi && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-indigo-600" />
                        <span>AI Sourced</span>
                      </span>
                    )}

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        task.priority === 'Urgent' || task.priority === 'Critical'
                          ? 'bg-rose-100 text-rose-800'
                          : task.priority === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {task.priority || 'Normal'}
                    </span>

                    <h4
                      className={`text-xs font-bold ${
                        isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {task.title}
                    </h4>
                  </div>

                  {task.description && (
                    <p className="text-xs text-slate-600 font-normal">
                      {task.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                    {task.patientName && (
                      <span>Resident: <strong className="text-slate-600">{task.patientName}</strong></span>
                    )}
                    {task.assignedRole && (
                      <span>Role: <strong className="text-slate-600">{task.assignedRole}</strong></span>
                    )}
                    {task.dueDate && (
                      <span>Due: <strong className="text-slate-600">{new Date(task.dueDate).toLocaleDateString()}</strong></span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleToggleTaskStatus(task)}
                    disabled={actioningTaskId === task.id}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50 ${
                      isCompleted
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    {actioningTaskId === task.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isCompleted ? (
                      <RefreshCw className="w-3.5 h-3.5" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>{isCompleted ? 'Reopen' : 'Mark Complete'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Task Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Create Clinical Task</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Task Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Schedule repeat potassium panel in 24 hours"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Routine">Routine</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Assigned Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none"
                  >
                    <option value="Doctor">Doctor</option>
                    <option value="Nurse">Nurse</option>
                    <option value="Pharmacist">Pharmacist</option>
                    <option value="CareCoordinator">Care Coordinator</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewTask}
                disabled={isCreating || !newTitle.trim()}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-1"
              >
                {isCreating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                <span>Create Task</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiTaskManagerScreen;

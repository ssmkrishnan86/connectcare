import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, CheckSquare, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

const taskSchema = z.object({
  title: z.string().min(2, 'Task Title is required'),
  description: z.string().min(3, 'Description is required'),
  patientId: z.string().optional(),
  patientName: z.string().min(2, 'Patient Name is required'),
  taskType: z.string().min(1, 'Task Type is required'),
  priority: z.enum(['High', 'Medium', 'Low']),
  assigneeName: z.string().min(2, 'Assignee Name is required'),
  assigneeRole: z.string().min(1, 'Assignee Role is required'),
  dueDateText: z.string().min(1, 'Due Date is required'),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TaskCreateModal: React.FC<TaskCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [patients, setPatients] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      taskType: 'Documentation',
      priority: 'Medium',
      assigneeName: 'Nurse Sarah',
      assigneeRole: 'Nursing',
      dueDateText: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    },
  });

  useEffect(() => {
    if (isOpen) {
      api.getPatients()
        .then((data) => {
          if (data && data.length > 0) setPatients(data);
        })
        .catch(console.error);
    }
  }, [isOpen]);

  const handlePatientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value;
    const found = patients.find((p) => p.id === pId || p.patientIdCode === pId);
    if (found) {
      setValue('patientId', found.id || found.patientIdCode);
      setValue('patientName', found.name);
    }
  };

  if (!isOpen) return null;

  const onSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    try {
      const formattedDueDate = new Date(data.dueDateText).toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      await api.createTask({
        title: data.title,
        description: data.description,
        patientName: data.patientName,
        patientIdCode: data.patientId || `P-00${Math.floor(Math.random() * 900) + 100}`,
        patientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        taskType: data.taskType,
        priority: data.priority,
        assigneeName: data.assigneeName,
        assigneeRole: data.assigneeRole,
        assigneeAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
        dueDateText: formattedDueDate,
        statusStr: 'Open',
        isOverdue: false,
      });
      reset();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <CheckSquare className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Create Task</h2>
              <p className="text-[11px] text-slate-400 font-medium">Assign a new care or clinical task</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Task Title <span className="text-rose-500">*</span></label>
            <input
              {...register('title')}
              placeholder="e.g. Conduct Morning Blood Pressure Monitoring"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
            />
            {errors.title && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Description <span className="text-rose-500">*</span></label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Enter instructions for the assigned caregiver..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50 resize-none"
            />
            {errors.description && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Select Patient</label>
              <select
                onChange={handlePatientSelect}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              >
                <option value="">Select Patient...</option>
                {patients.map((p, idx) => (
                  <option key={p.id || idx} value={p.id || p.patientIdCode}>
                    {p.name} ({p.careUnit || p.floorRoom})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Patient Name <span className="text-rose-500">*</span></label>
              <input
                {...register('patientName')}
                placeholder="e.g. John Doe"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              />
              {errors.patientName && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.patientName.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Task Category <span className="text-rose-500">*</span></label>
              <select
                {...register('taskType')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              >
                <option value="Documentation">Documentation</option>
                <option value="Medication">Medication</option>
                <option value="Clinical Care">Clinical Care</option>
                <option value="Care Activity">Care Activity</option>
                <option value="Care Coordination">Care Coordination</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Care Planning">Care Planning</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Priority</label>
              <select
                {...register('priority')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-white"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Assigned Caregiver <span className="text-rose-500">*</span></label>
              <input
                {...register('assigneeName')}
                placeholder="e.g. Nurse Sarah"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              />
              {errors.assigneeName && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.assigneeName.message}</p>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Role</label>
              <select
                {...register('assigneeRole')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-white"
              >
                <option value="Nursing">Nursing</option>
                <option value="Doctor">Doctor</option>
                <option value="Care Manager">Care Manager</option>
                <option value="Administration">Administration</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Due Date & Time <span className="text-rose-500">*</span></label>
              <input
                type="datetime-local"
                {...register('dueDateText')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              />
              {errors.dueDateText && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.dueDateText.message}</p>}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</> : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

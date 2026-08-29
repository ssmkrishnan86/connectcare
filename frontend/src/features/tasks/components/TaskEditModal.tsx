import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Edit2, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { DateTimePickerInput } from '@/components/common/DateTimePickerInput';

const taskSchema = z.object({
  title: z.string().min(2, 'Task Title is required'),
  description: z.string().min(3, 'Description is required'),
  patientName: z.string().min(2, 'Patient Name is required'),
  taskType: z.string().min(1, 'Task Category is required'),
  priority: z.enum(['High', 'Medium', 'Low']),
  assigneeName: z.string().min(2, 'Assignee Name is required'),
  assigneeRole: z.string().min(1, 'Assignee Role is required'),
  dueDateText: z.string().min(1, 'Due Date is required'),
  statusStr: z.string().min(1, 'Status is required'),
});

type TaskEditFormData = z.infer<typeof taskSchema>;

interface TaskEditModalProps {
  task: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TaskEditModal: React.FC<TaskEditModalProps> = ({
  task,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TaskEditFormData>({
    resolver: zodResolver(taskSchema),
  });

  const dueDateValue = watch('dueDateText');

  useEffect(() => {
    if (isOpen && task) {
      reset({
        title: task.title || '',
        description: task.description || '',
        patientName: task.patientName || '',
        taskType: task.taskType || 'Documentation',
        priority: (task.priority?.toString() as any) || 'Medium',
        assigneeName: task.assignedCaregiver || task.assigneeName || 'Nurse Sarah',
        assigneeRole: task.assigneeRole || 'Nursing',
        dueDateText: task.dueTime || task.dueDateText || '',
        statusStr: task.statusStr || (task.status === 2 ? 'Completed' : task.status === 1 ? 'In Progress' : 'Open'),
      });
    }
  }, [isOpen, task, reset]);

  if (!isOpen || !task) return null;

  const onSubmit = async (data: TaskEditFormData) => {
    setIsSubmitting(true);
    try {
      await api.updateTask(task.id, {
        ...task,
        title: data.title,
        description: data.description,
        patientName: data.patientName,
        taskType: data.taskType,
        priority: data.priority,
        assignedCaregiver: data.assigneeName,
        assigneeRole: data.assigneeRole,
        dueTime: data.dueDateText,
        dueDateText: data.dueDateText,
        statusStr: data.statusStr,
        status: data.statusStr === 'Completed' ? 2 : data.statusStr === 'In Progress' ? 1 : 0,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans select-none">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <Edit2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Edit Task</h2>
              <p className="text-[11px] text-slate-400 font-medium">Update task details and assignments</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center justify-between">
            <span>Please complete all required fields correctly before proceeding.</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Task Title <span className="text-rose-500">*</span></label>
            <input
              {...register('title')}
              placeholder="Task Title"
              className={`w-full px-3 py-2 border ${errors.title ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-900 bg-slate-50/50`}
            />
            {errors.title && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Description <span className="text-rose-500">*</span></label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Task Instructions..."
              className={`w-full px-3 py-2 border ${errors.description ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-900 bg-slate-50/50 resize-none`}
            />
            {errors.description && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Patient Name <span className="text-rose-500">*</span></label>
              <input
                {...register('patientName')}
                className={`w-full px-3 py-2 border ${errors.patientName ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-900 bg-slate-50/50`}
              />
              {errors.patientName && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.patientName.message}</p>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Status <span className="text-rose-500">*</span></label>
              <select
                {...register('statusStr')}
                className={`w-full px-3 py-2 border ${errors.statusStr ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-900 bg-white`}
              >
                <option value="">Select Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              {errors.statusStr && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.statusStr.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Task Category <span className="text-rose-500">*</span></label>
              <select
                {...register('taskType')}
                className={`w-full px-3 py-2 border ${errors.taskType ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-900 bg-white`}
              >
                <option value="">Select Task Category</option>
                <option value="Documentation">Documentation</option>
                <option value="Medication">Medication</option>
                <option value="Clinical Care">Clinical Care</option>
                <option value="Care Activity">Care Activity</option>
                <option value="Care Coordination">Care Coordination</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Care Planning">Care Planning</option>
              </select>
              {errors.taskType && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.taskType.message}</p>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Priority</label>
              <select
                {...register('priority')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-900 bg-white"
              >
                <option value="">Select Priority</option>
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
                className={`w-full px-3 py-2 border ${errors.assigneeName ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-900 bg-slate-50/50`}
              />
              {errors.assigneeName && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.assigneeName.message}</p>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Role</label>
              <select
                {...register('assigneeRole')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-900 bg-white"
              >
                <option value="">Select Assignee Role</option>
                <option value="Nursing">Nursing</option>
                <option value="Doctor">Doctor</option>
                <option value="Care Manager">Care Manager</option>
                <option value="Administration">Administration</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Due Date & Time <span className="text-rose-500">*</span></label>
              <DateTimePickerInput
                value={dueDateValue}
                onChange={(val) => setValue('dueDateText', val, { shouldValidate: true })}
                error={errors.dueDateText?.message}
                placeholder="e.g. May 19, 2025 10:00 AM"
              />
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
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

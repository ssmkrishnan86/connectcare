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
  patientIdCode: z.string().optional(),
  roomNumber: z.string().optional(),
  careUnit: z.string().optional(),
  taskType: z.string().min(1, 'Task Type is required'),
  priority: z.string().min(1, 'Priority is required'),
  assigneeId: z.string().optional(),
  assigneeName: z.string().min(2, 'Assignee / Doctor Name is required'),
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
  const [doctors, setDoctors] = useState<any[]>([]);
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
      taskType: '',
      priority: '',
      assigneeName: '',
      assigneeRole: '',
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

      api.getDoctors()
        .then((data) => {
          if (data && data.length > 0) setDoctors(data);
        })
        .catch(console.error);
    }
  }, [isOpen]);

  const handlePatientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value;
    const p = patients.find((pt) => pt.id === pId);
    if (p) {
      setValue('patientId', p.id);
      setValue('patientName', p.name);
      setValue('patientIdCode', p.patientIdCode || p.id.slice(0, 8));
      setValue('roomNumber', p.roomNumber || p.floorRoom || '');
      setValue('careUnit', p.careUnit || '');
    } else {
      setValue('patientId', '');
      setValue('patientName', '');
      setValue('patientIdCode', '');
      setValue('roomNumber', '');
      setValue('careUnit', '');
    }
  };

  const handleDoctorSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dId = e.target.value;
    const d = doctors.find((doc) => doc.id === dId);
    if (d) {
      setValue('assigneeId', d.id);
      setValue('assigneeName', d.name);
      setValue('assigneeRole', 'Doctor');
    }
  };

  if (!isOpen) return null;

  const onSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    try {
      await api.createTask({
        title: data.title,
        description: data.description,
        patientId: data.patientId,
        patientName: data.patientName,
        patientIdCode: data.patientIdCode,
        roomNumber: data.roomNumber,
        careUnit: data.careUnit,
        taskType: data.taskType,
        priority: data.priority,
        status: 'Open',
        assigneeId: data.assigneeId,
        assigneeName: data.assigneeName,
        assigneeRole: data.assigneeRole,
        dueDateText: data.dueDateText,
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
            <div className="h-8 w-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <CheckSquare className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Create Clinical Task</h2>
              <p className="text-[11px] text-slate-400 font-medium">Assign a task to doctors, nurses or care managers</p>
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
              placeholder="e.g. Schedule Echo & Cardiology Consult"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
            />
            {errors.title && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Description <span className="text-rose-500">*</span></label>
            <textarea
              {...register('description')}
              rows={2}
              placeholder="Provide specific instructions and medical context..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50 resize-none"
            />
            {errors.description && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Select Patient <span className="text-rose-500">*</span></label>
              <select
                onChange={handlePatientSelect}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50 cursor-pointer"
              >
                <option value="">Choose registered patient...</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.patientIdCode || p.patientId || p.id.slice(0, 6)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Patient Name</label>
              <input
                {...register('patientName')}
                placeholder="Auto-filled or manual"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              />
              {errors.patientName && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.patientName.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Assign to Registered Doctor</label>
              <select
                onChange={handleDoctorSelect}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50 cursor-pointer"
              >
                <option value="">Select Doctor...</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.specialty})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Assignee Name <span className="text-rose-500">*</span></label>
              <input
                {...register('assigneeName')}
                placeholder="e.g. Dr. Sarah Wilson"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              />
              {errors.assigneeName && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.assigneeName.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Task Category <span className="text-rose-500">*</span></label>
              <select
                {...register('taskType')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50 cursor-pointer"
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
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Priority</label>
              <select
                {...register('priority')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-white cursor-pointer"
              >
                <option value="">Select Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Role</label>
              <select
                {...register('assigneeRole')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-white cursor-pointer"
              >
                <option value="">Select Assignee Role</option>
                <option value="Doctor">Doctor</option>
                <option value="Nursing">Nursing</option>
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
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Creating...
                </>
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskCreateModal;

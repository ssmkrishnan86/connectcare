import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

const alertSchema = z.object({
  title: z.string().min(2, 'Alert Title is required'),
  description: z.string().min(3, 'Description is required'),
  patientId: z.string().optional(),
  patientName: z.string().min(2, 'Patient Name is required'),
  location: z.string().min(1, 'Location is required'),
  type: z.string().min(1, 'Alert Type is required'),
  severity: z.enum(['Critical', 'High', 'Medium', 'Low']),
  reportedBy: z.string().min(2, 'Reported By is required'),
  reportedByRole: z.string().min(1, 'Role is required'),
});

type AlertFormData = z.infer<typeof alertSchema>;

interface AlertCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AlertCreateModal: React.FC<AlertCreateModalProps> = ({
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
  } = useForm<AlertFormData>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      type: 'Patient Safety',
      severity: 'High',
      reportedBy: 'Nurse Sarah Wilson',
      reportedByRole: 'Nurse',
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
      setValue('location', found.floorRoom || found.careUnit || '1st Floor - 104');
    }
  };

  if (!isOpen) return null;

  const onSubmit = async (data: AlertFormData) => {
    setIsSubmitting(true);
    try {
      await api.createAlert({
        title: data.title,
        description: data.description,
        patientName: data.patientName,
        patientIdCode: data.patientId || `P-00${Math.floor(Math.random() * 900) + 100}`,
        patientAvatar: '',
        location: data.location,
        type: data.type,
        severity: data.severity,
        reportedBy: data.reportedBy,
        reportedByRole: data.reportedByRole,
        status: 'Open',
        timestampText: 'Just now',
        isAcknowledged: false,
      });
      reset();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create alert:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">New Alert</h2>
              <p className="text-[11px] text-slate-400 font-medium">Trigger an incident or critical clinical alert</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Alert Title <span className="text-rose-500">*</span></label>
            <input
              {...register('title')}
              placeholder="e.g. High Blood Pressure Threshold Exceeded"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
            />
            {errors.title && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Description <span className="text-rose-500">*</span></label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Provide detailed context regarding the alert..."
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
              <label className="font-semibold text-slate-700 block mb-1">Location / Room <span className="text-rose-500">*</span></label>
              <input
                {...register('location')}
                placeholder="e.g. 3rd Floor - 301"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              />
              {errors.location && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.location.message}</p>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Alert Category <span className="text-rose-500">*</span></label>
              <select
                {...register('type')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              >
                <option value="Patient Safety">Patient Safety</option>
                <option value="Vital Signs">Vital Signs</option>
                <option value="Medication">Medication</option>
                <option value="Equipment">Equipment</option>
                <option value="Admission">Admission</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Severity Level</label>
              <select
                {...register('severity')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-white"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Reported By</label>
              <input
                {...register('reportedBy')}
                placeholder="e.g. Nurse Sarah"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Role</label>
              <input
                {...register('reportedByRole')}
                placeholder="e.g. Nurse"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
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
              className="flex items-center gap-2 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold shadow-md shadow-rose-500/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Triggering...</> : 'Trigger Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

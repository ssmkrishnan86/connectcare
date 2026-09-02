import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, AlertTriangle, Loader2, ShieldAlert } from 'lucide-react';

import { api } from '@/lib/api';

const alertSchema = z.object({
  title: z.string().min(2, 'Alert Title is required').max(100, 'Max 100 characters'),
  description: z.string().min(3, 'Description is required').max(1000, 'Max 1000 characters'),
  patientId: z.string().optional(),
  patientName: z.string().min(2, 'Patient Name is required').max(50, 'Max 50 characters'),
  careUnit: z.string().min(1, 'Care Unit is required'),
  location: z.string().min(1, 'Room / Bed location is required').max(50, 'Max 50 characters'),
  type: z.string().min(1, 'Alert Category is required'),
  severity: z.enum(['Critical', 'High', 'Medium', 'Low']),
  triggerCondition: z.string().min(2, 'Trigger condition or vital reading is required').max(100, 'Max 100 characters'),
  source: z.string().min(1, 'Detection source is required'),
  reportedBy: z.string().min(2, 'Reported by name is required').max(50, 'Max 50 characters'),
  reportedByRole: z.string().min(1, 'Role is required').max(50, 'Max 50 characters'),
  notes: z.string().max(500, 'Max 500 characters').optional(),
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
    watch,
    reset,
    formState: { errors },
  } = useForm<AlertFormData>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      type: '',
      severity: 'Critical',
      careUnit: '',
      source: '',
      reportedBy: 'Nurse Sarah Wilson',
      reportedByRole: 'Floor Nurse',
      triggerCondition: 'SpO2 < 90% or Heart Rate > 120 bpm',
      location: 'Room 302',
    },
  });

  const selectedSeverity = watch('severity');

  useEffect(() => {
    if (isOpen) {
      api.getPatients()
        .then((data) => {
          const list = Array.isArray(data) ? data : (data as any)?.data || [];
          if (list && list.length > 0) setPatients(list);
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
      setValue('location', found.floorRoom || 'Room 101');
      setValue('careUnit', found.careUnit || 'General Ward');
    }
  };

  if (!isOpen) return null;

  const onSubmit = async (data: AlertFormData) => {
    setIsSubmitting(true);
    try {
      await api.createAlert({
        title: data.title,
        description: data.description,
        patientId: data.patientId,
        patientName: data.patientName,
        careUnit: data.careUnit,
        roomLocation: data.location,
        type: data.type,
        severity: data.severity,
        triggerCondition: data.triggerCondition,
        source: data.source,
        reportedBy: data.reportedBy,
        reportedByRole: data.reportedByRole,
        notes: data.notes || '',
        status: 'New',
        isAcknowledged: false,
        timestampText: 'Just now',
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
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Trigger Clinical Alert</h2>
              <p className="text-[11px] text-slate-400 font-medium">Record a critical patient event, abnormal vital, or safety incident</p>
            </div>
          </div>
          <button onClick={() => {
            reset();
            onClose();
          }} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center justify-between">
            <span>Please complete all required fields correctly before proceeding.</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 text-xs">
          
          {/* Severity Badges Selector */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Alert Severity <span className="text-rose-500">*</span></label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 'Critical', bg: 'bg-rose-50 border-rose-300 text-rose-700', active: 'ring-2 ring-rose-500 bg-rose-100' },
                { value: 'High', bg: 'bg-amber-50 border-amber-300 text-amber-700', active: 'ring-2 ring-amber-500 bg-amber-100' },
                { value: 'Medium', bg: 'bg-yellow-50 border-yellow-300 text-yellow-800', active: 'ring-2 ring-yellow-500 bg-yellow-100' },
                { value: 'Low', bg: 'bg-blue-50 border-blue-300 text-blue-700', active: 'ring-2 ring-blue-500 bg-blue-100' },
              ].map((sev) => (
                <button
                  key={sev.value}
                  type="button"
                  onClick={() => setValue('severity', sev.value as any)}
                  className={`py-2 px-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${sev.bg} ${
                    selectedSeverity === sev.value ? sev.active : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {sev.value === 'Low' ? 'Info / Low' : sev.value}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Alert Title <span className="text-rose-500">*</span></label>
            <input
              {...register('title')}
              maxLength={100}
              placeholder="e.g. Critical Tachycardia (HR > 130 bpm)"
              className={`w-full px-3.5 py-2.5 border ${errors.title ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-900 bg-slate-50/60`}
            />
            {errors.title && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.title.message}</p>}
          </div>

          {/* Patient Quick Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Auto-Fill from Patient</label>
              <select
                onChange={handlePatientSelect}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-900 bg-slate-50/60 cursor-pointer"
              >
                <option value="">Select registered patient...</option>
                {patients.map((p, idx) => (
                  <option key={p.id || idx} value={p.id || p.patientIdCode}>
                    {p.name} — {p.careUnit || p.floorRoom || 'Room 101'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Patient Name <span className="text-rose-500">*</span></label>
              <input
                {...register('patientName')}
                maxLength={50}
                placeholder="e.g. Eleanor Vance"
                className={`w-full px-3.5 py-2.5 border ${errors.patientName ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-900 bg-slate-50/60`}
              />
              {errors.patientName && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.patientName.message}</p>}
            </div>
          </div>

          {/* Location & Care Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Room / Bed Location <span className="text-rose-500">*</span></label>
              <input
                {...register('location')}
                maxLength={50}
                placeholder="e.g. Room 302 • 3rd Floor"
                className={`w-full px-3.5 py-2.5 border ${errors.location ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-900 bg-slate-50/60`}
              />
              {errors.location && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.location.message}</p>}
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Care Unit / Department <span className="text-rose-500">*</span></label>
              <select
                {...register('careUnit')}
                className={`w-full px-3.5 py-2.5 border ${errors.careUnit ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-900 bg-slate-50/60 cursor-pointer`}
              >
                <option value="">Select Care Unit</option>
                <option value="Cardiology Unit">Cardiology Unit</option>
                <option value="Emergency Department">Emergency Department</option>
                <option value="Intensive Care Unit (ICU)">Intensive Care Unit (ICU)</option>
                <option value="Med-Surg Unit 1">Med-Surg Unit 1</option>
                <option value="Neurology Unit">Neurology Unit</option>
                <option value="Pediatrics Unit">Pediatrics Unit</option>
                <option value="Pulmonology Unit">Pulmonology Unit</option>
                <option value="General Ward">General Ward</option>
              </select>
              {errors.careUnit && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.careUnit.message}</p>}
            </div>
          </div>

          {/* Category & Trigger Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Alert Category <span className="text-rose-500">*</span></label>
              <select
                {...register('type')}
                className={`w-full px-3.5 py-2.5 border ${errors.type ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-900 bg-slate-50/60 cursor-pointer`}
              >
                <option value="">Select Alert Category</option>
                <option value="Vital Signs">Vital Signs</option>
                <option value="Patient Safety">Patient Safety</option>
                <option value="Medication">Medication</option>
                <option value="Equipment">Equipment / Telemetry</option>
                <option value="Lab Result">Lab Result</option>
                <option value="Care Plan">Care Plan & Protocols</option>
              </select>
              {errors.type && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.type.message}</p>}
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Trigger Condition / Value <span className="text-rose-500">*</span></label>
              <input
                {...register('triggerCondition')}
                maxLength={100}
                placeholder="e.g. Heart Rate: 138 bpm (> 120 bpm)"
                className={`w-full px-3.5 py-2.5 border ${errors.triggerCondition ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-900 bg-slate-50/60`}
              />
              {errors.triggerCondition && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.triggerCondition.message}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Clinical Context & Description <span className="text-rose-500">*</span></label>
            <textarea
              {...register('description')}
              maxLength={1000}
              rows={2}
              placeholder="Describe the incident, observed symptoms, or trigger details..."
              className={`w-full px-3.5 py-2.5 border ${errors.description ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-900 bg-slate-50/60 resize-none`}
            />
            {errors.description && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.description.message}</p>}
          </div>

          {/* Reporter & Source */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Reported By <span className="text-rose-500">*</span></label>
              <input
                {...register('reportedBy')}
                maxLength={50}
                placeholder="e.g. Nurse Sarah Wilson"
                className={`w-full px-3.5 py-2.5 border ${errors.reportedBy ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-900 bg-slate-50/60`}
              />
              {errors.reportedBy && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.reportedBy.message}</p>}
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Role <span className="text-rose-500">*</span></label>
              <input
                {...register('reportedByRole')}
                maxLength={50}
                placeholder="e.g. Floor Nurse"
                className={`w-full px-3.5 py-2.5 border ${errors.reportedByRole ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-900 bg-slate-50/60`}
              />
              {errors.reportedByRole && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.reportedByRole.message}</p>}
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Detection Source <span className="text-rose-500">*</span></label>
              <select
                {...register('source')}
                className={`w-full px-3.5 py-2.5 border ${errors.source ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-900 bg-slate-50/60 cursor-pointer`}
              >
                <option value="">Select Detection Source</option>
                <option value="Bedside Monitor">Bedside Monitor</option>
                <option value="Telemetry Sensor">Telemetry Sensor</option>
                <option value="Smart Bed Mat">Smart Bed Mat</option>
                <option value="eMAR System">eMAR System</option>
                <option value="Staff Manual Entry">Staff Manual Entry</option>
                <option value="Lab Telemetry">Lab Telemetry</option>
              </select>
              {errors.source && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.source.message}</p>}
            </div>
          </div>

          {/* Actions & Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                reset();
                onClose();
              }}
              className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-500/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Triggering...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4" /> Trigger Alert
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlertCreateModal;

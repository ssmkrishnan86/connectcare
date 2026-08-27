import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Pill, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

const medSchema = z.object({
  name: z.string().min(2, 'Medication Name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  form: z.string().min(1, 'Form is required'),
  route: z.string().min(1, 'Route is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  patientName: z.string().min(2, 'Patient Name is required'),
  prescribedBy: z.string().min(2, 'Prescriber Name is required'),
  category: z.string().min(1, 'Category is required'),
});

type MedFormData = z.infer<typeof medSchema>;

interface AddPRNMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddPRNMedicationModal: React.FC<AddPRNMedicationModalProps> = ({
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
  } = useForm<MedFormData>({
    resolver: zodResolver(medSchema),
    defaultValues: {
      form: '',
      route: '',
      frequency: 'PRN (As Needed)',
      category: '',
      prescribedBy: 'Dr. Sarah Wilson',
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
      setValue('patientName', found.name);
    }
  };

  if (!isOpen) return null;

  const onSubmit = async (data: MedFormData) => {
    setIsSubmitting(true);
    try {
      await api.addMedication({
        name: data.name,
        form: data.form,
        dosage: data.dosage,
        route: data.route,
        frequency: data.frequency,
        nextDoseTime: 'PRN / As Needed',
        relativeTimeText: 'Pending',
        status: 'Pending',
        prescribedBy: data.prescribedBy,
        prescribedBySpecialty: 'Attending Physician',
        batch: `Batch: PRN${Math.floor(Math.random() * 9000) + 1000}`,
        expiryDateText: 'Dec 2026',
        daysLeftText: '365 days left',
        category: data.category,
        patientName: data.patientName,
        patientIdCode: `PT-${Math.floor(Math.random() * 90000) + 10000}`,
        patientAvatar: '',
      });
      reset();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to add PRN medication:', error);
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
              <Pill className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Add PRN Medication</h2>
              <p className="text-[11px] text-slate-400 font-medium">Prescribe an as-needed (PRN) medication record</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center justify-between">
            <span>Please complete all required fields correctly before proceeding.</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Medication Name <span className="text-rose-500">*</span></label>
              <input
                {...register('name')}
                placeholder="e.g. Paracetamol 500 mg"
                className={`w-full px-3 py-2 border ${errors.name ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-900 bg-slate-50/50`}
              />
              {errors.name && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Dosage <span className="text-rose-500">*</span></label>
              <input
                {...register('dosage')}
                placeholder="e.g. 500 mg"
                className={`w-full px-3 py-2 border ${errors.dosage ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-900 bg-slate-50/50`}
              />
              {errors.dosage && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.dosage.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Select Existing Patient</label>
              <select
                onChange={handlePatientSelect}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-900 bg-white"
              >
                <option value="">Select Patient...</option>
                {patients.map((p, idx) => (
                  <option key={p.id || idx} value={p.id || p.patientIdCode}>
                    {p.name} ({p.careUnit || 'Inpatient'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Patient Name <span className="text-rose-500">*</span></label>
              <input
                {...register('patientName')}
                placeholder="e.g. Patricia Smith"
                className={`w-full px-3 py-2 border ${errors.patientName ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-900 bg-slate-50/50`}
              />
              {errors.patientName && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.patientName.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Form</label>
              <select
                {...register('form')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-900 bg-white"
              >
                <option value="">Select Form</option>
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Inhaler">Inhaler</option>
                <option value="Injection">Injection</option>
                <option value="Syrup">Syrup</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Route</label>
              <select
                {...register('route')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-900 bg-white"
              >
                <option value="">Select Route</option>
                <option value="Oral">Oral</option>
                <option value="Sublingual">Sublingual</option>
                <option value="Intravenous">Intravenous</option>
                <option value="Inhalation">Inhalation</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Frequency</label>
              <input
                {...register('frequency')}
                placeholder="e.g. PRN Every 4 hrs"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Category</label>
              <select
                {...register('category')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-900 bg-white"
              >
                <option value="">Select Category</option>
                <option value="PRN">PRN (As Needed)</option>
                <option value="Analgesic">Analgesic</option>
                <option value="Antipyretic">Antipyretic</option>
                <option value="Cardiovascular">Cardiovascular</option>
                <option value="Antibiotic">Antibiotic</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Prescribed By <span className="text-rose-500">*</span></label>
              <input
                {...register('prescribedBy')}
                placeholder="e.g. Dr. Sarah Wilson"
                className={`w-full px-3 py-2 border ${errors.prescribedBy ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-900 bg-slate-50/50`}
              />
              {errors.prescribedBy && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.prescribedBy.message}</p>}
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
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : 'Save PRN Medication'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

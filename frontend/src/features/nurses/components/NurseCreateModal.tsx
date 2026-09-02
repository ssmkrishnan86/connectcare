import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, HeartPulse, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { PhoneInput } from '@/components/common/PhoneInput';

const nurseSchema = z.object({
  name: z.string().min(2, 'Name is required').max(50, 'Max 50 characters'),
  department: z.string().min(1, 'Department is required').max(50, 'Max 50 characters'),
  subUnit: z.string().min(1, 'Sub-Unit / Specialty is required').max(50, 'Max 50 characters'),
  location: z.string().min(1, 'Location is required').max(50, 'Max 50 characters'),
  shift: z.string().min(1, 'Shift is required'),
  phone: z.string().min(5, 'Phone number is required'),
  email: z.string().email('Invalid email address').max(30, 'Max 30 characters'),
  experience: z.string().min(1, 'Experience is required').max(30, 'Max 30 characters'),
  status: z.string().min(1, 'Status is required'),
});

type NurseFormData = z.infer<typeof nurseSchema>;

interface NurseCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NurseCreateModal: React.FC<NurseCreateModalProps> = ({
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
  } = useForm<NurseFormData>({
    resolver: zodResolver(nurseSchema),
    defaultValues: {
      department: 'Nursing Unit',
      subUnit: 'Med-Surg / ICU',
      shift: '',
      phone: '',
      email: '',
      experience: '5 Years',
      status: '',
    },
  });

  const selectedPhone = watch('phone');

  if (!isOpen) return null;

  const onSubmit = async (data: NurseFormData) => {
    setIsSubmitting(true);
    try {
      await api.createNurse({
        name: data.name,
        department: data.department,
        subUnit: data.subUnit,
        location: data.location,
        shift: data.shift,
        phone: data.phone,
        email: data.email,
        experience: data.experience,
        status: data.status as 'Active' | 'OnLeave' | 'Inactive',
        avatar: '',
      });
      reset();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create nurse:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              <HeartPulse className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Add Nurse</h2>
              <p className="text-[11px] text-slate-400 font-medium">Register a new nursing staff member</p>
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
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center justify-between">
            <span>Please complete all required fields correctly before proceeding.</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Full Name <span className="text-rose-500">*</span></label>
              <input
                {...register('name')}
                maxLength={50}
                placeholder="e.g. Nurse Sarah Jenkins"
                className={`w-full px-3 py-2 border ${errors.name ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50`}
              />
              {errors.name && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Department <span className="text-rose-500">*</span></label>
              <input
                {...register('department')}
                maxLength={50}
                placeholder="e.g. Nursing Operations"
                className={`w-full px-3 py-2 border ${errors.department ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50`}
              />
              {errors.department && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.department.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Sub Unit / Specialty <span className="text-rose-500">*</span></label>
              <input
                {...register('subUnit')}
                maxLength={50}
                placeholder="e.g. Med-Surg / ICU"
                className={`w-full px-3 py-2 border ${errors.subUnit ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50`}
              />
              {errors.subUnit && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.subUnit.message}</p>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Assigned Location <span className="text-rose-500">*</span></label>
              <input
                {...register('location')}
                maxLength={50}
                placeholder="e.g. West Wing (2nd Floor)"
                className={`w-full px-3 py-2 border ${errors.location ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50`}
              />
              {errors.location && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.location.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Phone Number <span className="text-rose-500">*</span></label>
              <PhoneInput
                value={selectedPhone || ''}
                onChange={(val) => setValue('phone', val, { shouldValidate: true, shouldDirty: true })}
                placeholder="(512) 555-0100"
                error={errors.phone?.message}
                className={errors.phone ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : ''}
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email <span className="text-rose-500">*</span></label>
              <input
                type="email"
                maxLength={30}
                {...register('email')}
                placeholder="e.g. nurse@connectedcare.com"
                className={`w-full px-3 py-2 border ${errors.email ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50`}
              />
              {errors.email && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.email.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Work Shift <span className="text-rose-500">*</span></label>
              <select
                {...register('shift')}
                className={`w-full px-3 py-2 border ${errors.shift ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50`}
              >
                <option value="">Select Shift</option>
                <option value="Day Shift (07:00 AM - 03:00 PM)">Day Shift</option>
                <option value="Evening Shift (03:00 PM - 11:00 PM)">Evening Shift</option>
                <option value="Night Shift (11:00 PM - 07:00 AM)">Night Shift</option>
                <option value="Rotating Shift">Rotating Shift</option>
              </select>
              {errors.shift && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.shift.message}</p>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Experience</label>
              <input
                {...register('experience')}
                maxLength={30}
                placeholder="e.g. 6 Years"
                className={`w-full px-3 py-2 border ${errors.experience ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50`}
              />
              {errors.experience && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.experience.message}</p>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Status</label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-white"
              >
                <option value="">Select Status</option>
                <option value="Active">Active</option>
                <option value="OnLeave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                reset();
                onClose();
              }}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : 'Save Nurse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

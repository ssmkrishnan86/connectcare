import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Stethoscope, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

const doctorSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  specialty: z.string().min(1, 'Specialty is required'),
  specialtyIcon: z.string().min(1, 'Icon is required'),
  department: z.string().min(1, 'Department is required'),
  location: z.string().min(1, 'Location is required'),
  phone: z.string().min(5, 'Phone number is required'),
  email: z.string().email('Invalid email address'),
  experience: z.string().min(1, 'Experience is required'),
  status: z.enum(['Active', 'OnLeave', 'Inactive']),
  teleconsultationEnabled: z.boolean(),
});

type DoctorFormData = z.infer<typeof doctorSchema>;

interface DoctorCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DoctorCreateModal: React.FC<DoctorCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      name: '',
      specialty: '',
      specialtyIcon: '💙',
      department: '',
      location: '',
      phone: '',
      email: '',
      experience: '',
      status: 'Active',
      teleconsultationEnabled: false,
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (data: DoctorFormData) => {
    setIsSubmitting(true);
    try {
      await api.createDoctor({
        name: data.name,
        specialty: data.specialty,
        specialtyIcon: data.specialtyIcon,
        department: data.department,
        location: data.location,
        phone: data.phone,
        email: data.email,
        experience: data.experience,
        status: data.status,
        teleconsultationEnabled: data.teleconsultationEnabled,
        avatar: '',
      });
      reset();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create doctor:', error);
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
              <Stethoscope className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Add Doctor</h2>
              <p className="text-[11px] text-slate-400 font-medium">Register a new attending physician or specialist</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Full Name <span className="text-rose-500">*</span></label>
              <input
                {...register('name')}
                placeholder="e.g. Dr. Alexander Fleming"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              />
              {errors.name && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Specialty <span className="text-rose-500">*</span></label>
              <select
                {...register('specialty')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              >
                <option value="">Select Specialty...</option>
                <option value="Cardiology">Cardiology 💙</option>
                <option value="Emergency Medicine">Emergency Medicine ➕</option>
                <option value="Orthopedics">Orthopedics 🦴</option>
                <option value="Endocrinology">Endocrinology 🩺</option>
                <option value="Neurology">Neurology 🧠</option>
                <option value="Internal Medicine">Internal Medicine 📱</option>
                <option value="Pulmonology">Pulmonology 🫁</option>
                <option value="Pediatrics">Pediatrics 🧸</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Department <span className="text-rose-500">*</span></label>
              <input
                {...register('department')}
                placeholder="e.g. Cardiology Unit"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              />
              {errors.department && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.department.message}</p>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Location / Practice Area <span className="text-rose-500">*</span></label>
              <input
                {...register('location')}
                placeholder="e.g. Med-Surg Unit 2 (3rd Floor)"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              />
              {errors.location && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.location.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Phone Number <span className="text-rose-500">*</span></label>
              <input
                {...register('phone')}
                placeholder="e.g. (512) 555-0199"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              />
              {errors.phone && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email <span className="text-rose-500">*</span></label>
              <input
                type="email"
                {...register('email')}
                placeholder="e.g. doctor@connectedcare.com"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              />
              {errors.email && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.email.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Clinical Experience <span className="text-rose-500">*</span></label>
              <input
                {...register('experience')}
                placeholder="e.g. 12 Years"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Status</label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-white"
              >
                <option value="Active">Active</option>
                <option value="OnLeave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
              <input
                type="checkbox"
                {...register('teleconsultationEnabled')}
                className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              Enable Teleconsultation Services
            </label>
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
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : 'Save Doctor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

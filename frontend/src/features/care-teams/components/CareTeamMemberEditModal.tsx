import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Edit2, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

const teamMemberEditSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  department: z.string().min(1, 'Department is required'),
  location: z.string().min(1, 'Location is required'),
  phone: z.string().min(5, 'Phone number is required'),
  email: z.string().email('Invalid email address'),
  shift: z.string().min(1, 'Shift is required'),
  status: z.enum(['Active', 'OnLeave', 'Inactive']),
});

type TeamMemberEditFormData = z.infer<typeof teamMemberEditSchema>;

interface CareTeamMemberEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  member: any | null;
}

export const CareTeamMemberEditModal: React.FC<CareTeamMemberEditModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  member,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TeamMemberEditFormData>({
    resolver: zodResolver(teamMemberEditSchema),
  });

  useEffect(() => {
    if (member) {
      const normalizeStatus = (st: any) => {
        if (st === 0 || st === 'Active' || st === 'active') return 'Active';
        if (st === 1 || st === 'OnLeave' || st === 'onleave' || st === 'On Leave') return 'OnLeave';
        return 'Inactive';
      };

      const normalizeRole = (r: any) => {
        if (r === 0 || r === 'Doctor' || r === 'doctor') return 'Doctor';
        if (r === 1 || r === 'Nurse' || r === 'nurse') return 'Nurse';
        if (r === 2 || r === 'AlliedHealth' || r === 'Allied Health' || r === 'alliedhealth') return 'AlliedHealth';
        return 'CareManager';
      };

      setValue('name', member.name || '');
      setValue('role', normalizeRole(member.role));
      setValue('department', member.department || '');
      setValue('location', member.location || '');
      setValue('phone', member.phone || '');
      setValue('email', member.email || '');
      setValue('shift', member.shift || 'Day Shift (07:00 AM - 03:00 PM)');
      setValue('status', normalizeStatus(member.status));
    }
  }, [member, setValue]);

  if (!isOpen || !member) return null;

  const onSubmit = async (data: TeamMemberEditFormData) => {
    setIsSubmitting(true);
    try {
      await api.updateCareTeamMember(member.id, {
        ...member,
        name: data.name,
        role: data.role,
        department: data.department,
        location: data.location,
        phone: data.phone,
        email: data.email,
        shift: data.shift,
        status: data.status,
      });
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to update team member:', error);
      alert(error?.message || 'Failed to update care team member');
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
              <Edit2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Edit Team Member</h2>
              <p className="text-[11px] text-slate-400 font-medium">Update care practitioner details and status</p>
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
                placeholder="e.g. Dr. Alex Vance"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              />
              {errors.name && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Role <span className="text-rose-500">*</span></label>
              <select
                {...register('role')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              >
                <option value="Doctor">Doctor</option>
                <option value="Nurse">Nurse</option>
                <option value="CareManager">Care Manager</option>
                <option value="Physiotherapist">Physiotherapist</option>
                <option value="Pharmacist">Pharmacist</option>
              </select>
              {errors.role && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.role.message}</p>}
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
              <label className="font-semibold text-slate-700 block mb-1">Assigned Location <span className="text-rose-500">*</span></label>
              <input
                {...register('location')}
                placeholder="e.g. Main Campus (3rd Floor)"
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
                placeholder="e.g. alex.vance@connectedcare.com"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              />
              {errors.email && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.email.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Work Shift <span className="text-rose-500">*</span></label>
              <select
                {...register('shift')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              >
                <option value="Day Shift (07:00 AM - 03:00 PM)">Day Shift (07:00 AM - 03:00 PM)</option>
                <option value="Evening Shift (03:00 PM - 11:00 PM)">Evening Shift (03:00 PM - 11:00 PM)</option>
                <option value="Night Shift (11:00 PM - 07:00 AM)">Night Shift (11:00 PM - 07:00 AM)</option>
                <option value="Rotating Shift">Rotating Shift</option>
              </select>
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
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving Changes...</> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

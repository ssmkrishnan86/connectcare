import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Edit2, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { PhoneInput } from '@/components/common/PhoneInput';
import { isValidUSPhone } from '@/lib/utils';

const teamMemberEditSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  teamName: z.string().min(1, 'Care Team Name is required'),
  specialty: z.string().optional(),
  department: z.string().min(1, 'Department is required'),
  location: z.string().min(1, 'Location is required'),
  phone: z.string().refine((val) => isValidUSPhone(val), {
    message: 'Valid 10-digit US phone number required, e.g. (512) 555-0100',
  }),
  email: z.string().email('Invalid email address (e.g. name@domain.com)'),
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
    control,
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
      setValue('teamName', member.teamName || 'General Care Team');
      setValue('specialty', member.specialty || '');
      setValue('department', member.department || 'Cardiology Unit');
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
        teamName: data.teamName,
        specialty: data.specialty || '',
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
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
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
          {/* Care Team Name */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Care Team Name <span className="text-rose-500">*</span>
            </label>
            <select
              {...register('teamName')}
              className={`w-full px-3.5 py-2.5 border ${errors.teamName ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50 cursor-pointer`}
            >
              <option value="">Select Care Team</option>
              <option value="Cardiology Alpha Team">Cardiology Alpha Team</option>
              <option value="ICU Critical Care Team 1">ICU Critical Care Team 1</option>
              <option value="Emergency Trauma Team">Emergency Trauma Team</option>
              <option value="Stroke & Neuro Care Team">Stroke & Neuro Care Team</option>
              <option value="Med-Surg Care Team 1">Med-Surg Care Team 1</option>
              <option value="Pediatrics Care Team 1">Pediatrics Care Team 1</option>
              <option value="Pulmonology Care Team">Pulmonology Care Team</option>
              <option value="General Ward Care Team">General Ward Care Team</option>
              <option value="Oncology Care Team">Oncology Care Team</option>
            </select>
            {errors.teamName && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.teamName.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Full Name <span className="text-rose-500">*</span></label>
              <input
                {...register('name')}
                placeholder="e.g. Dr. Alex Vance"
                className={`w-full px-3.5 py-2.5 border ${errors.name ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50`}
              />
              {errors.name && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Role <span className="text-rose-500">*</span></label>
              <select
                {...register('role')}
                className={`w-full px-3.5 py-2.5 border ${errors.role ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50 cursor-pointer`}
              >
                <option value="">Select Role</option>
                <option value="Doctor">Doctor</option>
                <option value="Nurse">Nurse</option>
                <option value="CareManager">Care Manager</option>
                <option value="Physiotherapist">Physiotherapist</option>
                <option value="Pharmacist">Pharmacist</option>
                <option value="SocialWorker">Social Worker</option>
                <option value="Specialist">Specialist</option>
                <option value="SupportStaff">Support Staff</option>
              </select>
              {errors.role && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.role.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Clinical Specialty</label>
              <input
                {...register('specialty')}
                placeholder="e.g. Interventional Cardiology"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Department / Unit <span className="text-rose-500">*</span></label>
              <select
                {...register('department')}
                className={`w-full px-3.5 py-2.5 border ${errors.department ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50 cursor-pointer`}
              >
                <option value="">Select Department</option>
                <option value="Cardiology Unit">Cardiology Unit</option>
                <option value="Emergency Department">Emergency Department</option>
                <option value="Intensive Care Unit (ICU)">Intensive Care Unit (ICU)</option>
                <option value="Med-Surg Unit 1">Med-Surg Unit 1</option>
                <option value="Neurology Unit">Neurology Unit</option>
                <option value="Pediatrics Unit">Pediatrics Unit</option>
                <option value="Pulmonology Unit">Pulmonology Unit</option>
                <option value="General Ward">General Ward</option>
                <option value="Oncology Unit">Oncology Unit</option>
                <option value="Surgical Suite">Surgical Suite</option>
              </select>
              {errors.department && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.department.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Assigned Location <span className="text-rose-500">*</span></label>
              <select
                {...register('location')}
                className={`w-full px-3.5 py-2.5 border ${errors.location ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50 cursor-pointer`}
              >
                <option value="">Select Location</option>
                <option value="Main Campus (3rd Floor)">Main Campus (3rd Floor)</option>
                <option value="Ground Floor - ER Wing">Ground Floor - ER Wing</option>
                <option value="2nd Floor - ICU Wing">2nd Floor - ICU Wing</option>
                <option value="1st Floor - West Wing">1st Floor - West Wing</option>
                <option value="4th Floor - Surgical Suite">4th Floor - Surgical Suite</option>
                <option value="North Pavilion - 2nd Floor">North Pavilion - 2nd Floor</option>
              </select>
              {errors.location && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.location.message}</p>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Work Shift <span className="text-rose-500">*</span></label>
              <select
                {...register('shift')}
                className={`w-full px-3.5 py-2.5 border ${errors.shift ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50 cursor-pointer`}
              >
                <option value="">Select Shift</option>
                <option value="Day Shift (07:00 AM - 03:00 PM)">Day Shift (07:00 AM - 03:00 PM)</option>
                <option value="Evening Shift (03:00 PM - 11:00 PM)">Evening Shift (03:00 PM - 11:00 PM)</option>
                <option value="Night Shift (11:00 PM - 07:00 AM)">Night Shift (11:00 PM - 07:00 AM)</option>
                <option value="Rotating Shift">Rotating Shift</option>
              </select>
              {errors.shift && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.shift.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Phone Number (US) <span className="text-rose-500">*</span></label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <PhoneInput
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="(512) 555-0199"
                    error={errors.phone?.message}
                  />
                )}
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email <span className="text-rose-500">*</span></label>
              <input
                type="email"
                {...register('email')}
                placeholder="e.g. alex.vance@connectedcare.com"
                className={`w-full px-3.5 py-2.5 border ${errors.email ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50`}
              />
              {errors.email && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.email.message}</p>}
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Status</label>
            <select
              {...register('status')}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-white cursor-pointer"
            >
              <option value="">Select Status</option>
              <option value="Active">Active</option>
              <option value="OnLeave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
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
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving Changes...</> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CareTeamMemberEditModal;

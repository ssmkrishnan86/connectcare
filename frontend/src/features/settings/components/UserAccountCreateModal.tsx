import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, UserPlus, Edit3, Loader2, Eye, EyeOff, Key } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from '@/context/ToastContext';

const userSchema = z.object({
  firstName: z.string().trim().min(1, 'First Name is required').max(30, 'Max 30 characters'),
  lastName: z.string().trim().min(1, 'Last Name is required').max(30, 'Max 30 characters'),
  userName: z.string().trim().min(2, 'User Name is required').max(30, 'Max 30 characters'),
  email: z.string().trim().email('Invalid email address').max(30, 'Max 30 characters'),
  password: z.string().max(30, 'Max 30 characters').optional(),
  confirmPassword: z.string().max(30, 'Max 30 characters').optional(),
  role: z.string().min(1, 'Role is required'),
  department: z.string().trim().min(1, 'Department is required').max(50, 'Max 50 characters'),
  location: z.string().trim().min(1, 'Location is required'),
  status: z.string().min(1, 'Status is required'),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserAccountCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

export const UserAccountCreateModal: React.FC<UserAccountCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const isEdit = !!initialData?.id;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      userName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
      department: '',
      location: '',
      status: 'Active',
    },
  });

  const firstName = watch('firstName');
  const lastName = watch('lastName');

  // Auto-generate username suggestion if empty
  const handleAutoSuggestUsername = () => {
    if (firstName || lastName) {
      const suggested = `${firstName || ''}${lastName ? '.' + lastName : ''}`
        .toLowerCase()
        .replace(/[^a-z0-9.]/g, '');
      setValue('userName', suggested, { shouldValidate: true });
    }
  };

  useEffect(() => {
    if (isOpen) {
      setPasswordError(null);
      setShowPassword(false);
      setShowConfirmPassword(false);

      // Fetch locations from Location table
      api.getLocations()
        .then((res: any) => {
          const list = Array.isArray(res) ? res : res?.data || [];
          setLocations(list);
        })
        .catch((err) => {
          console.error('Failed to load locations for user modal:', err);
        });

      if (initialData) {
        const parts = (initialData.fullName || initialData.userName || '').trim().split(' ');
        const defaultFirst = initialData.firstName || parts[0] || '';
        const defaultLast = initialData.lastName || parts.slice(1).join(' ') || '';

        reset({
          firstName: defaultFirst,
          lastName: defaultLast,
          userName: initialData.userName || initialData.username || '',
          email: initialData.email || '',
          password: '',
          confirmPassword: '',
          role: initialData.role || '',
          department: initialData.department || '',
          location: initialData.location || '',
          status: initialData.status || 'Active',
        });
      } else {
        reset({
          firstName: '',
          lastName: '',
          userName: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: '',
          department: '',
          location: '',
          status: 'Active',
        });
      }
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  const handleGeneratePassword = () => {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$%&*';
    
    let generated = 'CC@';
    for (let i = 0; i < 3; i++) generated += upper.charAt(Math.floor(Math.random() * upper.length));
    for (let i = 0; i < 3; i++) generated += lower.charAt(Math.floor(Math.random() * lower.length));
    for (let i = 0; i < 3; i++) generated += numbers.charAt(Math.floor(Math.random() * numbers.length));
    for (let i = 0; i < 1; i++) generated += symbols.charAt(Math.floor(Math.random() * symbols.length));

    setValue('password', generated, { shouldValidate: true });
    setValue('confirmPassword', generated, { shouldValidate: true });
    setPasswordError(null);
    setShowPassword(true);
    setShowConfirmPassword(true);
  };

  const onSubmit = async (data: UserFormData) => {
    // Validate passwords
    if (!isEdit) {
      if (!data.password || data.password.trim().length < 6) {
        setPasswordError('Password is required and must be at least 6 characters.');
        return;
      }
      if (!data.confirmPassword) {
        setPasswordError('Confirm Password is required.');
        return;
      }
      if (data.password !== data.confirmPassword) {
        setPasswordError('Password and Confirm Password do not match.');
        return;
      }
    } else if (data.password || data.confirmPassword) {
      if (data.password && data.password.trim().length < 6) {
        setPasswordError('New password must be at least 6 characters.');
        return;
      }
      if (data.password !== data.confirmPassword) {
        setPasswordError('Password and Confirm Password do not match.');
        return;
      }
    }

    setPasswordError(null);
    setIsSubmitting(true);

    try {
      if (isEdit) {
        await api.updateSettingsUser(initialData.id, {
          ...initialData,
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          userName: data.userName.trim(),
          email: data.email.trim(),
          role: data.role,
          department: data.department.trim(),
          location: data.location.trim(),
          status: data.status as 'Active' | 'Inactive' | 'Pending' | 'Locked',
          ...(data.password ? { password: data.password.trim(), confirmPassword: data.confirmPassword?.trim() } : {}),
        });
        toast.success('User account updated successfully.');
      } else {
        await api.createSettingsUser({
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          userName: data.userName.trim(),
          email: data.email.trim(),
          password: data.password!.trim(),
          confirmPassword: data.confirmPassword!.trim(),
          role: data.role,
          department: data.department.trim(),
          location: data.location.trim(),
          status: data.status as 'Active' | 'Inactive' | 'Pending' | 'Locked',
          lastSignInText: 'Never',
        });
        toast.success('User account created successfully.');
      }
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to save user:', error);
      toast.error(error?.response?.data?.message || error?.message || 'Failed to save user record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              {isEdit ? <Edit3 className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {isEdit ? 'Edit User Account' : 'Add New User'}
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                {isEdit ? 'Update account details and role permissions' : 'Create a user account and assign system access permissions'}
              </p>
            </div>
          </div>
          <button onClick={() => {
            reset();
            onClose();
          }} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {(Object.keys(errors).length > 0 || passwordError) && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center justify-between">
            <span>{passwordError || 'Please complete all required fields correctly before proceeding.'}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 text-xs">
          {/* Row 1: First Name & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">First Name <span className="text-rose-500">*</span></label>
              <input
                {...register('firstName')}
                maxLength={30}
                placeholder="e.g. John"
                className={`w-full px-3 py-2 border ${errors.firstName ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-semibold text-slate-900 bg-slate-50/50`}
              />
              {errors.firstName && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.firstName.message}</p>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Last Name <span className="text-rose-500">*</span></label>
              <input
                {...register('lastName')}
                maxLength={30}
                placeholder="e.g. Doe"
                className={`w-full px-3 py-2 border ${errors.lastName ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-semibold text-slate-900 bg-slate-50/50`}
              />
              {errors.lastName && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          {/* Row 2: User Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 block">User Name <span className="text-rose-500">*</span></label>
                {!isEdit && (
                  <button
                    type="button"
                    onClick={handleAutoSuggestUsername}
                    className="text-purple-600 hover:text-purple-700 font-semibold text-[10px]"
                  >
                    Suggest
                  </button>
                )}
              </div>
              <input
                {...register('userName')}
                maxLength={30}
                placeholder="e.g. john.doe"
                className={`w-full px-3 py-2 border ${errors.userName ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-semibold text-slate-900 bg-slate-50/50`}
              />
              {errors.userName && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.userName.message}</p>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email Address <span className="text-rose-500">*</span></label>
              <input
                type="email"
                maxLength={30}
                {...register('email')}
                placeholder="e.g. john.doe@connectcare.com"
                className={`w-full px-3 py-2 border ${errors.email ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-semibold text-slate-900 bg-slate-50/50`}
              />
              {errors.email && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.email.message}</p>}
            </div>
          </div>

          {/* Row 3: Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 block">
                  {isEdit ? 'Reset Password' : 'Password'} {!isEdit && <span className="text-rose-500">*</span>}
                </label>
                {!isEdit && (
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-purple-600 hover:text-purple-700 font-semibold text-[11px] flex items-center gap-1"
                  >
                    <Key className="h-3 w-3" /> Auto-generate
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  maxLength={30}
                  {...register('password')}
                  placeholder={isEdit ? 'Leave blank to keep' : 'Min. 6 characters'}
                  className={`w-full px-3 py-2 pr-10 border ${passwordError ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-semibold text-slate-900 bg-slate-50/50`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                {isEdit ? 'Confirm New Password' : 'Confirm Password'} {!isEdit && <span className="text-rose-500">*</span>}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  maxLength={30}
                  {...register('confirmPassword')}
                  placeholder={isEdit ? 'Re-enter new password' : 'Confirm your password'}
                  className={`w-full px-3 py-2 pr-10 border ${passwordError ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-semibold text-slate-900 bg-slate-50/50`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Row 4: Role Assignment & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Role Assignment <span className="text-rose-500">*</span></label>
              <select
                {...register('role')}
                className={`w-full px-3 py-2 border ${errors.role ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-semibold text-slate-900 bg-slate-50/50`}
              >
                <option value="">Select Role</option>
                <option value="System Administrator">System Administrator</option>
                <option value="Administrator">Administrator</option>
                <option value="Care Manager">Care Manager</option>
                <option value="Doctor">Doctor</option>
                <option value="Nurse">Nurse</option>
                <option value="Receptionist">Receptionist</option>
                <option value="Billing Staff">Billing Staff</option>
                <option value="IT Support">IT Support</option>
                <option value="Pharmacist">Pharmacist</option>
                <option value="Lab Technician">Lab Technician</option>
                <option value="Viewer">Viewer</option>
              </select>
              {errors.role && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.role.message}</p>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Department <span className="text-rose-500">*</span></label>
              <input
                {...register('department')}
                maxLength={50}
                placeholder="e.g. Administration"
                className={`w-full px-3 py-2 border ${errors.department ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-semibold text-slate-900 bg-slate-50/50`}
              />
              {errors.department && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.department.message}</p>}
            </div>
          </div>

          {/* Row 5: Primary Location & Account Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Primary Location <span className="text-rose-500">*</span></label>
              <select
                {...register('location')}
                className={`w-full px-3 py-2 border ${errors.location ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-semibold text-slate-900 bg-slate-50/50`}
              >
                <option value="">Select Primary Location</option>
                {locations.length > 0 ? (
                  locations.map((loc: any) => {
                    const locName = loc.name || loc.facility || loc.code;
                    return (
                      <option key={loc.id || locName} value={locName}>
                        {locName} {loc.facility && loc.facility !== locName ? `(${loc.facility})` : ''}
                      </option>
                    );
                  })
                ) : (
                  <>
                    <option value="Main Campus">Main Campus</option>
                    <option value="North Wing">North Wing</option>
                    <option value="East Wing">East Wing</option>
                    <option value="West Wing">West Wing</option>
                    <option value="ICU Building">ICU Building</option>
                    <option value="Outpatient Clinic">Outpatient Clinic</option>
                  </>
                )}
              </select>
              {errors.location && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.location.message}</p>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Account Status <span className="text-rose-500">*</span></label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-semibold text-slate-900 bg-white"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
                <option value="Locked">Locked</option>
              </select>
              {errors.status && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.status.message}</p>}
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
              className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-md shadow-purple-500/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                isEdit ? 'Update User' : 'Save User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

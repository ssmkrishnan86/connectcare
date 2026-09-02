import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, User, Stethoscope, Building2, Loader2, Shield } from 'lucide-react';
import { api } from '@/lib/api';
import { DatePickerInput } from '@/components/common/DatePickerInput';
import { PhoneInput } from '@/components/common/PhoneInput';
import { normalizeToISODate } from '@/lib/utils';

const patientSchema = z.object({
  name: z.string().min(2, 'Full Name is required').max(50, 'Max 50 characters'),
  dob: z.string().min(1, 'Date of Birth is required').refine((value) => {
    const iso = normalizeToISODate(value);
    const todayISO = new Date().toISOString().split('T')[0];
    return !!iso && iso <= todayISO;
  }, 'Date of Birth cannot be in the future'),
  gender: z.enum(['Male', 'Female', 'Other'], { message: 'Gender is required' }),
  phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Use US format (512) 555-0199'),
  email: z.string().email('Invalid email address').max(100, 'Max 100 characters'),
  address: z.string().min(3, 'Address is required').max(200, 'Max 200 characters'),
  careUnit: z.string().min(1, 'Care Unit is required'),
  floorRoom: z.string().min(1, 'Floor & Room is required').max(50, 'Max 50 characters'),
  primaryDoctorId: z.string().optional(),
  status: z.string().min(1, 'Status is required'),
  riskLevel: z.string().min(1, 'Risk Level is required'),
  insuranceProvider: z.string().min(1, 'Insurance Provider is required').max(100, 'Max 100 characters'),
  insurancePolicyNumber: z.string().min(1, 'Policy / Member Number is required').max(50, 'Max 50 characters'),
  insuranceGroupNumber: z.string().max(50, 'Max 50 characters').optional(),
  insuranceValidUntil: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface PatientCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPatient: (patientData: any) => Promise<void> | void;
}

export const PatientCreateModal: React.FC<PatientCreateModalProps> = ({ isOpen, onClose, onAddPatient }) => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [careUnits, setCareUnits] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fallbackCareUnits = [
    { name: 'Cardiology Unit', floor: '3rd Floor - 301' },
    { name: 'Med-Surg Unit 2', floor: '2nd Floor - 205' },
    { name: 'Emergency Department', floor: 'Ground Floor - ER1' },
    { name: 'General Ward', floor: '1st Floor - 104' },
    { name: 'ICU Unit', floor: '2nd Floor - 210' },
    { name: 'Neurology Unit', floor: '3rd Floor - 308' },
    { name: 'Pediatrics Unit', floor: '1st Floor - 112' },
  ];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: '',
      dob: '',
      gender: undefined,
      phone: '',
      email: '',
      address: '',
      careUnit: '',
      floorRoom: '',
      primaryDoctorId: '',
      status: '',
      riskLevel: '',
      insuranceProvider: '',
      insurancePolicyNumber: '',
      insuranceGroupNumber: '',
      insuranceValidUntil: '',
    },
  });

  const selectedDob = watch('dob');
  const selectedGender = watch('gender');
  const selectedCareUnit = watch('careUnit');
  const selectedPhone = watch('phone');

  useEffect(() => {
    if (isOpen) {
      // Clean reset on open to prevent pre-populating stale records (Bug 38)
      reset({
        name: '',
        dob: '',
        gender: undefined,
        phone: '',
        email: '',
        address: '',
        careUnit: '',
        floorRoom: '',
        primaryDoctorId: '',
        status: '',
        riskLevel: '',
        insuranceProvider: '',
        insurancePolicyNumber: '',
        insuranceGroupNumber: '',
        insuranceValidUntil: '',
      });

      api.getDoctors()
        .then((docList) => setDoctors(docList || []))
        .catch(console.error);

      api.getLocations()
        .then((locList) => {
          if (locList && locList.length > 0) {
            const mapped = locList.map((loc: any) => ({
              name: loc.name,
              floor: loc.floor || `${loc.name} Room`,
            }));
            setCareUnits(mapped);
          } else {
            setCareUnits(fallbackCareUnits);
          }
        })
        .catch(() => setCareUnits(fallbackCareUnits));
    }
  }, [isOpen, reset]);

  const handleCareUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const unitName = e.target.value;
    setValue('careUnit', unitName, { shouldValidate: true });
  };

  const calculateAge = (dobString: string): number => {
    if (!dobString) return 0;
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : 0;
  };

  const calculatedAge = selectedDob ? calculateAge(selectedDob) : 0;
  const ageGenderDisplay = selectedDob && selectedGender ? `${calculatedAge} / ${selectedGender}` : '';

  if (!isOpen) return null;

  const onSubmit = async (data: PatientFormData) => {
    setIsSubmitting(true);
    try {
      const foundDoctor = doctors.find(
        (d: any) => d.id === data.primaryDoctorId || d.doctorIdCode === data.primaryDoctorId || d.name === data.primaryDoctorId
      );

      const patientPayload = {
        name: data.name,
        dob: data.dob,
        gender: data.gender,
        ageGender: `${calculateAge(data.dob)} / ${data.gender}`,
        phone: data.phone,
        email: data.email,
        address: data.address,
        careUnit: data.careUnit,
        floorRoom: data.floorRoom,
        primaryDoctorId: foundDoctor?.id ? foundDoctor.id : null,
        primaryDoctorName: foundDoctor ? foundDoctor.name : '',
        primaryDoctorSpecialty: foundDoctor ? foundDoctor.specialty : '',
        primaryDoctorAvatar: foundDoctor?.avatar || '',
        status: data.status === 'In Care' ? 'InCare' : data.status,
        riskLevel: data.riskLevel,
        insuranceProvider: data.insuranceProvider,
        insurancePolicyNumber: data.insurancePolicyNumber,
        insuranceGroupNumber: data.insuranceGroupNumber || '',
        insuranceValidUntil: data.insuranceValidUntil || '',
        avatar: '',
        admissionDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        careDays: 1,
        dischargePlan: 'Not Scheduled',
      };

      await onAddPatient(patientPayload);
      reset();
      onClose();
    } catch (error) {
      console.error('Error submitting patient:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeDoctorsList = doctors;
  const activeUnitsList = careUnits.length > 0 ? careUnits : fallbackCareUnits;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <User className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Add New Patient</h2>
              <p className="text-[11px] text-slate-400 font-medium">Enter patient details to register in the system</p>
            </div>
          </div>
          <button onClick={() => {
            reset();
            onClose();
          }} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center justify-between">
            <span>Please complete all required fields correctly before proceeding.</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 text-xs">
          
          {/* Row 1: Name & DOB */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                {...register('name')}
                maxLength={50}
                placeholder="e.g. Johnathan Davis"
                className={`w-full px-3 py-2 border ${errors.name ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50`}
              />
              {errors.name && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center justify-between">
                <span>Date of Birth <span className="text-rose-500">*</span></span>
                {selectedDob && (
                  <span className="text-[10px] font-bold text-blue-600">
                    Age: {calculatedAge} yrs
                  </span>
                )}
              </label>
              <DatePickerInput
                value={selectedDob || ''}
                onChange={(val) => setValue('dob', val, { shouldValidate: true, shouldDirty: true })}
                maxDate={new Date().toISOString().split('T')[0]}
                placeholder="Select or enter DOB"
                className="py-2"
                error={errors.dob?.message}
                required
              />
            </div>
          </div>

          {/* Row 2: Gender & Phone Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center justify-between">
                <span>Gender <span className="text-rose-500">*</span></span>
                {ageGenderDisplay && (
                  <span className="text-[10px] font-bold text-slate-500">
                    ({ageGenderDisplay})
                  </span>
                )}
              </label>
              <select
                {...register('gender')}
                className={`w-full px-3 py-2 border ${errors.gender ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50`}
              >
                <option value="">Select Gender...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.gender.message}</p>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <PhoneInput
                value={selectedPhone || ''}
                onChange={(val) => setValue('phone', val, { shouldValidate: true, shouldDirty: true })}
                placeholder="(512) 555-0100"
                className={`py-2 ${errors.phone ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : ''}`}
                error={errors.phone?.message}
              />
            </div>
          </div>

          {/* Row 3: Email & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                maxLength={100}
                {...register('email')}
                placeholder="patient@email.com"
                className={`w-full px-3 py-2 border ${errors.email ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50`}
              />
              {errors.email && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Address <span className="text-rose-500">*</span>
              </label>
              <input
                maxLength={200}
                {...register('address')}
                placeholder="e.g. 123 Health Ave, Austin, TX 78701"
                className={`w-full px-3 py-2 border ${errors.address ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50`}
              />
              {errors.address && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.address.message}</p>}
            </div>
          </div>

          {/* Row 4: Care Unit & Floor / Room */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-blue-600" /> Care Unit <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedCareUnit}
                onChange={handleCareUnitChange}
                className={`w-full px-3 py-2 border ${errors.careUnit ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50`}
              >
                <option value="">Select Care Unit...</option>
                {activeUnitsList.map((unit: any, idx: number) => (
                  <option key={idx} value={unit.name}>
                    {unit.name} ({unit.floor})
                  </option>
                ))}
              </select>
              {errors.careUnit && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.careUnit.message}</p>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Floor & Room <span className="text-rose-500">*</span>
              </label>
              <input
                maxLength={50}
                {...register('floorRoom')}
                placeholder="e.g. 3rd Floor - 301"
                className={`w-full px-3 py-2 border ${errors.floorRoom ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50`}
              />
              {errors.floorRoom && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.floorRoom.message}</p>}
            </div>
          </div>

          {/* Row 5: Primary Doctor, Status, Risk Level */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                <Stethoscope className="h-3.5 w-3.5 text-blue-600" /> Primary Doctor
              </label>
              <select
                {...register('primaryDoctorId')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              >
                <option value="">Select Doctor...</option>
                {activeDoctorsList.map((doc: any, idx: number) => (
                  <option key={doc.id || doc.doctorIdCode || idx} value={doc.id || doc.doctorIdCode || doc.name}>
                    {doc.name} ({doc.specialty || 'General'})
                  </option>
                ))}
              </select>
              {errors.primaryDoctorId && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.primaryDoctorId.message}</p>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Status</label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-white"
              >
                <option value="">Select Status...</option>
                <option value="InCare">In Care</option>
                <option value="Admitted">Admitted</option>
                <option value="Discharged">Discharged</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Risk Level</label>
              <select
                {...register('riskLevel')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-white"
              >
                <option value="">Select Risk Level...</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Row 6: Insurance Information Section (Mandatory) */}
          <div className="pt-3 border-t border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-blue-600" />
                <span>Insurance & Coverage Information</span>
                <span className="text-rose-500 font-bold">*</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">Required</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Insurance Provider <span className="text-rose-500">*</span>
                </label>
                <input
                  {...register('insuranceProvider')}
                  maxLength={100}
                  placeholder="e.g. Blue Cross Blue Shield"
                  className={`w-full px-3 py-2 border ${errors.insuranceProvider ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50`}
                />
                {errors.insuranceProvider && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.insuranceProvider.message}</p>}
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Policy / Member Number <span className="text-rose-500">*</span>
                </label>
                <input
                  {...register('insurancePolicyNumber')}
                  maxLength={50}
                  placeholder="e.g. POL-98765432"
                  className={`w-full px-3 py-2 border ${errors.insurancePolicyNumber ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50`}
                />
                {errors.insurancePolicyNumber && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.insurancePolicyNumber.message}</p>}
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Group Number
                </label>
                <input
                  {...register('insuranceGroupNumber')}
                  maxLength={50}
                  placeholder="e.g. GRP-45678"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Valid Until
                </label>
                <DatePickerInput
                  value={watch('insuranceValidUntil') || ''}
                  onChange={(val) => setValue('insuranceValidUntil', val, { shouldValidate: true, shouldDirty: true })}
                  placeholder="Select expiration date"
                  className="py-2"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                reset();
                onClose();
              }}
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
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                'Save Patient'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientCreateModal;

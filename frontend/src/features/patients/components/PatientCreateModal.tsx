import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, User, Stethoscope, Building2, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

const patientSchema = z.object({
  name: z.string().min(2, 'Full Name is required'),
  dob: z.string().min(1, 'Date of Birth is required').refine((value) => { const d = new Date(`${value}T00:00:00`); return !Number.isNaN(d.getTime()) && d <= new Date(); }, 'Date of Birth cannot be in the future'),
  gender: z.enum(['Male', 'Female', 'Other'], { message: 'Gender is required' }),
  phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Use US format (512) 555-0199'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(3, 'Address is required'),
  careUnit: z.string().min(1, 'Care Unit is required'),
  floorRoom: z.string().min(1, 'Floor & Room is required'),
  primaryDoctorId: z.string().min(1, 'Primary Doctor is required'),
  status: z.string().min(1, 'Status is required'),
  riskLevel: z.string().min(1, 'Risk Level is required'),
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
    { name: 'Diabetes Care', floor: '1st Floor - 104' },
    { name: 'Med-Surg Unit 2', floor: '2nd Floor - 205' },
    { name: 'Cardiology Unit', floor: '3rd Floor - 301' },
    { name: 'Orthopedics Unit', floor: '4th Floor - 402' },
    { name: 'Emergency Department', floor: 'Ground Floor - ER1' },
    { name: 'Neurology Unit', floor: '3rd Floor - 308' },
    { name: 'Pediatrics Unit', floor: '1st Floor - 112' },
    { name: 'Intensive Care Unit (ICU)', floor: '2nd Floor - 210' },
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
      status: 'InCare',
      riskLevel: 'Medium',
      careUnit: '',
      floorRoom: '',
      primaryDoctorId: '',
    },
  });

  const selectedDob = watch('dob');
  const selectedGender = watch('gender');
  const selectedCareUnit = watch('careUnit');

  useEffect(() => {
    if (isOpen) {
      reset({ status: 'InCare', riskLevel: 'Medium', gender: undefined, careUnit: '', floorRoom: '', primaryDoctorId: '' });
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
  }, [isOpen]);

  // Handle Care Unit Selection to Auto-populate Floor & Room
  const handleCareUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const unitName = e.target.value;
    setValue('careUnit', unitName);
    const found = (careUnits.length > 0 ? careUnits : fallbackCareUnits).find((u) => u.name === unitName);
    if (found) {
      setValue('floorRoom', found.floor);
    }
  };

  // Helper to calculate age from DOB
  const calculateAge = (dobStr: string): number => {
    if (!dobStr) return 0;
    const birthDate = new Date(dobStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : 0;
  };

  const calculatedAge = selectedDob ? calculateAge(selectedDob) : 0;
  const ageGenderDisplay = selectedDob ? `${calculatedAge} / ${selectedGender}` : '';

  if (!isOpen) return null;

  const onSubmit = async (data: PatientFormData) => {
    setIsSubmitting(true);
    try {
      const foundDoctor = doctors.find((d: any) => d.id === data.primaryDoctorId || d.doctorIdCode === data.primaryDoctorId || d.name === data.primaryDoctorId);

      const patientPayload = {
        name: data.name,
        dob: data.dob,
        ageGender: `${calculateAge(data.dob)} / ${data.gender}`,
        phone: data.phone,
        email: data.email,
        address: data.address,
        careUnit: data.careUnit,
        floorRoom: data.floorRoom,
        primaryDoctorId: foundDoctor?.id ? foundDoctor.id : null,
        primaryDoctorName: foundDoctor ? foundDoctor.name : data.primaryDoctorId,
        primaryDoctorSpecialty: foundDoctor ? foundDoctor.specialty : 'General Physician',
        primaryDoctorAvatar: foundDoctor?.avatar || '',
        status: data.status === 'In Care' ? 'InCare' : data.status,
        riskLevel: data.riskLevel,
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
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 text-xs">
          {/* Row 1: Full Name & Date of Birth */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                {...register('name')}
                placeholder="e.g. John Doe"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
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
              <div className="relative">
                <input
                  type="date"
                  {...register('dob')}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
                />
              </div>
              {errors.dob && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.dob.message}</p>}
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
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              >
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
              <input
                {...register('phone')}
                placeholder="e.g. (512) 555-0199"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              />
              {errors.phone && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.phone.message}</p>}
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
                {...register('email')}
                placeholder="patient@email.com"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              />
              {errors.email && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Address <span className="text-rose-500">*</span>
              </label>
              <input
                {...register('address')}
                placeholder="e.g. 123 Health Ave, Austin, TX 78701"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              />
              {errors.address && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.address.message}</p>}
            </div>
          </div>

          {/* Row 4: Care Unit (Lookup Table Dropdown) & Floor / Room */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-blue-600" /> Care Unit <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedCareUnit}
                onChange={handleCareUnitChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
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
                {...register('floorRoom')}
                placeholder="e.g. 3rd Floor - 301"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              />
              {errors.floorRoom && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.floorRoom.message}</p>}
            </div>
          </div>

          {/* Row 5: Primary Doctor (Doctors Table Dropdown), Status, Risk Level */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                <Stethoscope className="h-3.5 w-3.5 text-blue-600" /> Primary Doctor <span className="text-rose-500">*</span>
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
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
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

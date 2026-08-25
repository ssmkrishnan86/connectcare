import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  User,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { DatePickerInput } from '@/components/common/DatePickerInput';
import { PhoneInput } from '@/components/common/PhoneInput';
import { RelationshipSelect } from '@/components/common/RelationshipSelect';
import { isValidUSPhone, isValidEmail } from '@/lib/utils';
import { api } from '@/lib/api';



export const AddNursePage: React.FC = () => {
  const navigate = useNavigate();
  const { nurseId } = useParams<{ nurseId?: string }>();
  const isEditMode = Boolean(nurseId);

  // Stepper State (Step 1 to 5)
  const [activeStep, setActiveStep] = useState(1);

  // Loading & Error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form State - Step 1: Basic Information
  // Personal Info
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [languages, setLanguages] = useState('');
  const [avatar, setAvatar] = useState('');

  // Account Info
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Employment Info
  const [departmentUnit, setDepartmentUnit] = useState('');
  const [role, setRole] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [reportingTo, setReportingTo] = useState('');
  const [dateOfJoining, setDateOfJoining] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [shift, setShift] = useState('');

  // Step 2: Contact & Address
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateProv, setStateProv] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');


  // Step 3: Professional Information
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseState, setLicenseState] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [certifications, setCertifications] = useState('BLS, ACLS');
  const [experienceYears, setExperienceYears] = useState('5 Years');

  // Step 4: Permissions & Access
  const [carePlanRights, setCarePlanRights] = useState(true);
  const [vitalEntryRights, setVitalEntryRights] = useState(true);
  const [medicationAdmin, setMedicationAdmin] = useState(true);
  const [shiftHandoverAccess, setShiftHandoverAccess] = useState(true);

  // Load existing nurse data if in edit mode
  useEffect(() => {
    if (isEditMode && nurseId) {
      setIsLoading(true);
      api.getNurseById(nurseId)
        .then((res: any) => {
          const nurse = res?.data || res;
          if (nurse) {
            if (nurse.firstName) setFirstName(nurse.firstName);
            if (nurse.middleName) setMiddleName(nurse.middleName);
            if (nurse.lastName) setLastName(nurse.lastName);

            if (!nurse.firstName && !nurse.lastName && nurse.name) {
              const nameParts = nurse.name.split(' ');
              if (nameParts.length >= 2) {
                setFirstName(nameParts[0]);
                setLastName(nameParts.slice(1).join(' '));
              } else {
                setFirstName(nurse.name);
              }
            }

            if (nurse.gender) setGender(nurse.gender);
            if (nurse.dob) setDob(nurse.dob);
            if (nurse.maritalStatus) setMaritalStatus(nurse.maritalStatus);
            if (nurse.bloodGroup) setBloodGroup(nurse.bloodGroup);
            if (nurse.languages) setLanguages(nurse.languages);

            setEmail(nurse.email || '');
            setMobile(nurse.phone || '');
            if (nurse.user?.username) setUsername(nurse.user.username);
            else if (nurse.username) setUsername(nurse.username);

            setDepartmentUnit(nurse.department || nurse.subUnit || '');
            if (nurse.role) setRole(nurse.role);
            if (nurse.employmentType) setEmploymentType(nurse.employmentType);
            if (nurse.reportingTo) setReportingTo(nurse.reportingTo);
            if (nurse.dateOfJoining) setDateOfJoining(nurse.dateOfJoining);
            setShift(nurse.shift || 'Day Shift (08:00 AM - 04:00 PM)');
            setExperienceYears(nurse.experience || '5 Years');
            if (nurse.avatar) setAvatar(nurse.avatar);
            setStatus(nurse.status === 0 || nurse.status === 'Active' ? 'Active' : 'Inactive');

            if (nurse.streetAddress) setStreetAddress(nurse.streetAddress);
            if (nurse.city) setCity(nurse.city);
            if (nurse.state) setStateProv(nurse.state);
            if (nurse.zipCode) setZipCode(nurse.zipCode);
            if (nurse.emergencyContactName) setEmergencyName(nurse.emergencyContactName);
            if (nurse.emergencyContactPhone) setEmergencyPhone(nurse.emergencyContactPhone);
            if (nurse.emergencyContactRelation) setEmergencyRelation(nurse.emergencyContactRelation);


            if (nurse.licenseNumber) setLicenseNumber(nurse.licenseNumber);
            if (nurse.licenseState) setLicenseState(nurse.licenseState);
            if (nurse.licenseExpiry) setLicenseExpiry(nurse.licenseExpiry);
            if (nurse.certifications) setCertifications(nurse.certifications);

            if (typeof nurse.carePlanUpdates === 'boolean') setCarePlanRights(nurse.carePlanUpdates);
            if (typeof nurse.vitalMonitoring === 'boolean') setVitalEntryRights(nurse.vitalMonitoring);
            if (typeof nurse.medicationAdministration === 'boolean') setMedicationAdmin(nurse.medicationAdministration);
            if (typeof nurse.shiftHandover === 'boolean') setShiftHandoverAccess(nurse.shiftHandover);
          }
        })
        .catch((err) => {
          console.error('Failed to load nurse:', err);
          setErrorMsg('Failed to load nurse profile information.');
        })
        .finally(() => setIsLoading(false));
    }
  }, [isEditMode, nurseId]);

  // Photo Upload Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setAvatar(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const fullName = `${firstName} ${middleName} ${lastName}`.replace(/\s+/g, ' ').trim();

  // Field-level errors (Issue 2)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    if (step === 1 || step === 5) {
      if (!firstName.trim()) errors.firstName = 'First name is required.';
      if (!lastName.trim()) errors.lastName = 'Last name is required.';
      if (!email.trim()) {
        errors.email = 'Email address is required.';
      } else if (!isValidEmail(email)) {
        errors.email = 'Please enter a valid email address (e.g. nurse@hospital.com).';
      }
      if (!mobile.trim()) {
        errors.mobile = 'Mobile number is required.';
      } else if (!isValidUSPhone(mobile)) {
        errors.mobile = 'Please enter a valid 10-digit US mobile number (e.g. (512) 555-0100).';
      }
      if (!username.trim()) errors.username = 'Username is required.';
      if (!isEditMode) {
        if (!password) errors.password = 'Password is required.';
        if (!confirmPassword) errors.confirmPassword = 'Confirm password is required.';
      }
      if (password && confirmPassword && password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match.';
      }
      if (!departmentUnit) errors.departmentUnit = 'Department / Unit is required.';
    }
    if (step === 2 || step === 5) {
      if (emergencyPhone && !isValidUSPhone(emergencyPhone)) {
        errors.emergencyPhone = 'Please enter a valid 10-digit US emergency contact phone number.';
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (!validateStep(activeStep)) {
      setErrorMsg('Please complete all required fields correctly before proceeding.');
      return;
    }
    setErrorMsg(null);
    setActiveStep((prev) => Math.min(prev + 1, 5));
  };

  // Submit Handler
  const handleSubmitNurse = async () => {
    if (!validateStep(5)) {
      setErrorMsg('Please correct all required fields marked with * before submitting.');
      if (fieldErrors.firstName || fieldErrors.lastName || fieldErrors.email || fieldErrors.mobile || fieldErrors.username || fieldErrors.departmentUnit || fieldErrors.password || fieldErrors.confirmPassword) {
        setActiveStep(1);
      } else if (fieldErrors.emergencyPhone) {
        setActiveStep(2);
      }
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const nurseLocation = streetAddress ? `${streetAddress}, ${city}` : `${departmentUnit} (Ground Floor)`;

    const nursePayload = {
      name: fullName || 'Nurse Practitioner',
      firstName,
      middleName,
      lastName,
      gender,
      dob,
      maritalStatus,
      bloodGroup,
      languages,
      department: departmentUnit || 'Emergency Care',
      subUnit: departmentUnit || 'ER Unit',
      role: role || 'Nurse',
      employmentType: employmentType || 'Full-Time Staff',
      reportingTo: reportingTo || 'Head Nurse',
      dateOfJoining,
      location: nurseLocation,
      shift: shift || 'Day Shift (08:00 AM - 04:00 PM)',
      phone: mobile || '(512) 555-0299',
      email: email,
      streetAddress,
      city,
      state: stateProv,
      zipCode,
      emergencyContactName: emergencyName,
      emergencyContactPhone: emergencyPhone,
      emergencyContactRelation: emergencyRelation,
      licenseNumber,

      licenseState,
      licenseExpiry,
      certifications: certifications || 'BLS, ACLS',
      experience: experienceYears || '5 Years',
      carePlanUpdates: carePlanRights,
      vitalMonitoring: vitalEntryRights,
      medicationAdministration: medicationAdmin,
      shiftHandover: shiftHandoverAccess,
      status: status,
      avatar: avatar,
      username: username || undefined,
      password: password || undefined,
    };

    try {
      let targetId = nurseId;
      if (isEditMode && nurseId) {
        const res = await api.updateNurse(nurseId, nursePayload);
        targetId = res?.data?.id || res?.id || nurseId;
      } else {
        const res = await api.createNurse(nursePayload);
        targetId = res?.data?.id || res?.id;
      }
      
      if (targetId) {
        navigate(`/nurses/${targetId}`);
      } else {
        navigate('/nurses');
      }
    } catch (err: any) {
      console.error('Failed to save nurse:', err);
      setErrorMsg(err?.message || 'Failed to save nurse details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    { id: 1, label: 'Basic Information' },
    { id: 2, label: 'Contact & Address' },
    { id: 3, label: 'Professional Information' },
    { id: 4, label: 'Permissions & Access' },
    { id: 5, label: 'Review & Confirm' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-600 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <Loader2 className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin text-indigo-600" />
          <span>Loading Nurse Profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans pb-12">
      {/* Header */}
      <PageHeader
        title={
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isEditMode ? 'Edit Nurse Profile' : 'Add New Nurse'}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Enter nurse details to create a new nurse profile.
            </p>
          </div>
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Nurses', href: '/nurses' },
          { label: isEditMode ? 'Edit Nurse' : 'Add New Nurse' },
        ]}
      />

      {/* Stepper Tabs Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-2 overflow-x-auto">
        <div className="flex items-center min-w-max gap-2 sm:gap-4">
          {stepsList.map((step) => {
            const isActive = activeStep === step.id;
            const isCompleted = activeStep > step.id;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
                  isActive
                    ? 'bg-indigo-50/80 text-indigo-600 border border-indigo-200/80 shadow-sm'
                    : isCompleted
                    ? 'text-slate-700 hover:bg-slate-50'
                    : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`h-6 w-6 rounded-lg flex items-center justify-center font-bold text-[11px] ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                      : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : step.id}
                </div>
                <span>{step.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-indigo-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-700 font-bold text-sm">
            ✕
          </button>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Multi-Step Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-6 space-y-8">
            {/* STEP 1: BASIC INFORMATION */}
            {activeStep === 1 && (
              <>
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Personal Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">First Name <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          setFieldErrors((prev) => ({ ...prev, firstName: '' }));
                        }}
                        placeholder="Enter first name"
                        className={`w-full px-3.5 py-2.5 bg-slate-50/60 border ${fieldErrors.firstName ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      />
                      {fieldErrors.firstName && <p className="text-[11px] font-bold text-rose-500 mt-1">{fieldErrors.firstName}</p>}
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Middle Name</label>
                      <input
                        type="text"
                        value={middleName}
                        onChange={(e) => setMiddleName(e.target.value)}
                        placeholder="Enter middle name"
                        className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Last Name <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => {
                          setLastName(e.target.value);
                          setFieldErrors((prev) => ({ ...prev, lastName: '' }));
                        }}
                        placeholder="Enter last name"
                        className={`w-full px-3.5 py-2.5 bg-slate-50/60 border ${fieldErrors.lastName ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      />
                      {fieldErrors.lastName && <p className="text-[11px] font-bold text-rose-500 mt-1">{fieldErrors.lastName}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Gender <span className="text-rose-500">*</span></label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select gender</option>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Date of Birth <span className="text-rose-500">*</span></label>
                      <DatePickerInput
                        value={dob}
                        onChange={(val) => {
                          setDob(val);
                          setFieldErrors((prev) => ({ ...prev, dob: '' }));
                        }}
                        maxDate={new Date().toISOString().split('T')[0]}
                        placeholder="Select or enter DOB"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Marital Status</label>
                      <select
                        value={maritalStatus}
                        onChange={(e) => setMaritalStatus(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs items-start">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Profile Photo</label>

                      <label className="border-2 border-dashed border-indigo-200/80 bg-indigo-50/30 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-50/60 transition-colors">
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                        <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-1">
                          <User className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-bold text-indigo-600">Upload Photo</span>
                        <span className="text-[10px] text-slate-400 font-medium">JPG, PNG (Max 2MB)</span>
                      </label>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Blood Group</label>
                      <select
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select blood group</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Languages Known</label>
                      <select
                        value={languages}
                        onChange={(e) => setLanguages(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select languages</option>
                        <option value="English, Spanish">English, Spanish</option>
                        <option value="English, French">English, French</option>
                        <option value="English, German">English, German</option>
                        <option value="English, Hindi">English, Hindi</option>
                        <option value="English, Tamil">English, Tamil</option>
                      </select>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Account Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Account Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Email Address <span className="text-rose-500">*</span></label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setFieldErrors((prev) => ({ ...prev, email: '' }));
                        }}
                        placeholder="Enter email address"
                        className={`w-full px-3.5 py-2.5 bg-slate-50/60 border ${fieldErrors.email ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      />
                      {fieldErrors.email && <p className="text-[11px] font-bold text-rose-500 mt-1">{fieldErrors.email}</p>}
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Mobile Number <span className="text-rose-500">*</span></label>
                      <PhoneInput
                        value={mobile}
                        onChange={(val) => {
                          setMobile(val);
                          setFieldErrors((prev) => ({ ...prev, mobile: '' }));
                        }}
                        placeholder="(512) 555-0100"
                        required
                        className={fieldErrors.mobile ? 'border-rose-400 bg-rose-50/20' : ''}
                      />
                      {fieldErrors.mobile && <p className="text-[11px] font-bold text-rose-500 mt-1">{fieldErrors.mobile}</p>}
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Username <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value);
                          setFieldErrors((prev) => ({ ...prev, username: '' }));
                        }}
                        placeholder="Enter username"
                        className={`w-full px-3.5 py-2.5 bg-slate-50/60 border ${fieldErrors.username ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      />
                      {fieldErrors.username && <p className="text-[11px] font-bold text-rose-500 mt-1">{fieldErrors.username}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Password <span className="text-rose-500">*</span></label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setFieldErrors((prev) => ({ ...prev, password: '' }));
                          }}
                          placeholder="Enter password"
                          className={`w-full pl-3.5 pr-10 py-2.5 bg-slate-50/60 border ${fieldErrors.password ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {fieldErrors.password && <p className="text-[11px] font-bold text-rose-500 mt-1">{fieldErrors.password}</p>}
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Confirm Password <span className="text-rose-500">*</span></label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
                          }}
                          placeholder="Confirm password"
                          className={`w-full pl-3.5 pr-10 py-2.5 bg-slate-50/60 border ${fieldErrors.confirmPassword ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {fieldErrors.confirmPassword && <p className="text-[11px] font-bold text-rose-500 mt-1">{fieldErrors.confirmPassword}</p>}
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Employment Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Employment Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Department / Unit <span className="text-rose-500">*</span></label>
                      <select
                        value={departmentUnit}
                        onChange={(e) => {
                          setDepartmentUnit(e.target.value);
                          setFieldErrors((prev) => ({ ...prev, departmentUnit: '' }));
                        }}
                        className={`w-full px-3.5 py-2.5 bg-slate-50/60 border ${fieldErrors.departmentUnit ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      >
                        <option value="">Select department / unit</option>
                        <option value="Emergency Care">Emergency Care</option>
                        <option value="Med-Surg Unit 1">Med-Surg Unit 1</option>
                        <option value="Pediatrics Unit">Pediatrics Unit</option>
                        <option value="ICU Unit">ICU Unit</option>
                        <option value="Geriatrics">Geriatrics</option>
                        <option value="Cardiology Unit">Cardiology Unit</option>
                      </select>
                      {fieldErrors.departmentUnit && <p className="text-[11px] font-bold text-rose-500 mt-1">{fieldErrors.departmentUnit}</p>}
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Role <span className="text-rose-500">*</span></label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select role</option>
                        <option value="Nurse">Nurse</option>
                        <option value="Head Nurse">Head Nurse</option>
                        <option value="ICU Nurse">ICU Nurse</option>
                        <option value="Triage Nurse">Triage Nurse</option>
                        <option value="Staff Nurse">Staff Nurse</option>
                        <option value="Charge Nurse">Charge Nurse</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Employment Type <span className="text-rose-500">*</span></label>
                      <select
                        value={employmentType}
                        onChange={(e) => setEmploymentType(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select employment type</option>
                        <option value="Full-Time">Full-Time Staff</option>
                        <option value="Part-Time">Part-Time</option>
                        <option value="Shift-Based">Shift-Based</option>
                        <option value="Contract">Contract</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs items-start">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Reporting To <span className="text-rose-500">*</span></label>

                      <select
                        value={reportingTo}
                        onChange={(e) => setReportingTo(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select reporting manager</option>
                        <option value="Head Nurse">Head Nurse</option>
                        <option value="Nursing Supervisor">Nursing Supervisor</option>
                        <option value="Chief Medical Officer">Chief Medical Officer</option>
                        <option value="None">None</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Date of Joining <span className="text-rose-500">*</span></label>
                      <DatePickerInput
                        value={dateOfJoining}
                        onChange={(val) => setDateOfJoining(val)}
                        placeholder="Select joining date"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Status <span className="text-rose-500">*</span></label>
                      <div className="flex items-center gap-6 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                          <input
                            type="radio"
                            name="nurseStatusRadio"
                            checked={status === 'Active'}
                            onChange={() => setStatus('Active')}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                          />
                          Active
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                          <input
                            type="radio"
                            name="nurseStatusRadio"
                            checked={status === 'Inactive'}
                            onChange={() => setStatus('Inactive')}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                          />
                          Inactive
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* STEP 2: CONTACT & ADDRESS */}
            {activeStep === 2 && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-900">Residential Address</h3>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Street Address <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="e.g. 500 Medical Center Blvd, Apt 12"
                    className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">City <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Austin"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">State / Province <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={stateProv}
                      onChange={(e) => setStateProv(e.target.value)}
                      placeholder="e.g. Texas"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Zip Code <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="e.g. 78702"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <hr className="border-slate-100 my-4" />

                <h3 className="text-sm font-bold text-slate-900">Emergency Contact Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Emergency Contact Name</label>
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      placeholder="Enter contact name"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Emergency Contact Phone</label>
                    <PhoneInput
                      value={emergencyPhone}
                      onChange={(val) => {
                        setEmergencyPhone(val);
                        setFieldErrors((prev) => ({ ...prev, emergencyPhone: '' }));
                      }}
                      placeholder="(512) 555-0199"
                      className={fieldErrors.emergencyPhone ? 'border-rose-400 bg-rose-50/20' : ''}
                    />
                    {fieldErrors.emergencyPhone && <p className="text-[11px] font-bold text-rose-500 mt-1">{fieldErrors.emergencyPhone}</p>}
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Relationship</label>
                    <RelationshipSelect
                      value={emergencyRelation}
                      onChange={(val) => setEmergencyRelation(val)}
                      placeholder="Select relationship"
                    />
                  </div>
                </div>
              </div>
            )}


            {/* STEP 3: PROFESSIONAL INFORMATION */}
            {activeStep === 3 && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-900">Nursing License & Certifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Nursing License Number <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="e.g. RN-543210"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">License State</label>
                    <input
                      type="text"
                      value={licenseState}
                      onChange={(e) => setLicenseState(e.target.value)}
                      placeholder="e.g. Texas, USA"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">License Expiry Date</label>
                    <DatePickerInput
                      value={licenseExpiry}
                      onChange={(val) => setLicenseExpiry(val)}
                      placeholder="Select expiry date"
                    />
                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Active Certifications</label>
                    <input
                      type="text"
                      value={certifications}
                      onChange={(e) => setCertifications(e.target.value)}
                      placeholder="e.g. BLS, ACLS, PALS"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Nursing Experience <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      placeholder="e.g. 5 Years"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Assigned Shift</label>
                    <select
                      value={shift}
                      onChange={(e) => setShift(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select shift</option>
                      <option value="Day Shift (08:00 AM - 04:00 PM)">Day Shift (08:00 AM - 04:00 PM)</option>
                      <option value="Evening Shift (04:00 PM - 12:00 AM)">Evening Shift (04:00 PM - 12:00 AM)</option>
                      <option value="Night Shift (12:00 AM - 08:00 AM)">Night Shift (12:00 AM - 08:00 AM)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: PERMISSIONS & ACCESS */}
            {activeStep === 4 && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-900">Nursing Permissions & Access Rights</h3>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 bg-slate-50/60 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/60 transition-colors">
                    <input
                      type="checkbox"
                      checked={carePlanRights}
                      onChange={(e) => setCarePlanRights(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 mt-0.5"
                    />
                    <div>
                      <p className="font-bold text-slate-900">Care Plan & Discharge Checklist Updates</p>
                      <p className="text-[11px] text-slate-500">Allow updating patient care plans, discharge checklists, and nursing documentation.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 bg-slate-50/60 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/60 transition-colors">
                    <input
                      type="checkbox"
                      checked={vitalEntryRights}
                      onChange={(e) => setVitalEntryRights(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 mt-0.5"
                    />
                    <div>
                      <p className="font-bold text-slate-900">Vital Signs & Monitoring Log Entry</p>
                      <p className="text-[11px] text-slate-500">Grant rights to record vital rounds, oxygen levels, blood pressure, and telemetry alerts.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 bg-slate-50/60 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/60 transition-colors">
                    <input
                      type="checkbox"
                      checked={medicationAdmin}
                      onChange={(e) => setMedicationAdmin(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 mt-0.5"
                    />
                    <div>
                      <p className="font-bold text-slate-900">Medication Administration & MAR Logging</p>
                      <p className="text-[11px] text-slate-500">Authorize logging administered medications and IV drip dosages in the electronic MAR.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 bg-slate-50/60 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/60 transition-colors">
                    <input
                      type="checkbox"
                      checked={shiftHandoverAccess}
                      onChange={(e) => setShiftHandoverAccess(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 mt-0.5"
                    />
                    <div>
                      <p className="font-bold text-slate-900">Shift Handover & Nurse Communication</p>
                      <p className="text-[11px] text-slate-500">Grant permissions to initiate shift handovers and exchange clinical messages.</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* STEP 5: REVIEW & CONFIRM */}
            {activeStep === 5 && (
              <div className="space-y-6 text-xs">
                <div className="bg-indigo-50/60 border border-indigo-100 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-indigo-900">Review Nurse Profile Details</h3>
                    <p className="text-[11px] text-indigo-700">Please review all information carefully before creating the nurse profile.</p>
                  </div>
                  <span className="px-3 py-1 bg-indigo-600 text-white font-bold rounded-lg text-xs">
                    Ready to Save
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card 1: Personal & Account */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1">Personal & Account</h4>
                    <p><span className="text-slate-400">Full Name:</span> <strong className="text-slate-900">{fullName || 'Not provided'}</strong></p>
                    <p><span className="text-slate-400">Gender / DOB:</span> <strong className="text-slate-900">{gender || 'Not specified'}{dob ? ` • ${dob}` : ''}</strong></p>
                    <p><span className="text-slate-400">Blood / Marital:</span> <strong className="text-slate-900">{bloodGroup || 'Not specified'}{maritalStatus ? ` • ${maritalStatus}` : ''}</strong></p>
                    <p><span className="text-slate-400">Languages:</span> <strong className="text-slate-900">{languages || 'English'}</strong></p>
                    <p><span className="text-slate-400">Username:</span> <strong className="text-slate-900">{username || 'Auto-generated from email'}</strong></p>
                    <p><span className="text-slate-400">Email:</span> <strong className="text-slate-900">{email || 'Not provided'}</strong></p>
                    <p><span className="text-slate-400">Mobile Phone:</span> <strong className="text-slate-900 font-mono">{mobile || 'Not provided'}</strong></p>
                  </div>

                  {/* Card 2: Employment & Shift */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1">Employment & Shift</h4>
                    <p><span className="text-slate-400">Department / Unit:</span> <strong className="text-slate-900">{departmentUnit || 'Not provided'}</strong></p>
                    <p><span className="text-slate-400">Role:</span> <strong className="text-slate-900">{role || 'Nurse'}</strong></p>
                    <p><span className="text-slate-400">Employment Type:</span> <strong className="text-slate-900">{employmentType || 'Full-Time Staff'}</strong></p>
                    <p><span className="text-slate-400">Reporting Manager:</span> <strong className="text-slate-900">{reportingTo || 'Head Nurse'}</strong></p>
                    <p><span className="text-slate-400">Date of Joining:</span> <strong className="text-slate-900">{dateOfJoining || 'Immediate'}</strong></p>
                    <p><span className="text-slate-400">Assigned Shift:</span> <strong className="text-slate-900 text-indigo-700">{shift || 'Day Shift'}</strong></p>
                    <p><span className="text-slate-400">Duty Status:</span> <strong className={`font-bold ${status === 'Active' ? 'text-emerald-600' : 'text-slate-600'}`}>{status}</strong></p>
                  </div>

                  {/* Card 3: Contact & Address */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1">Residential Address</h4>
                    <p><span className="text-slate-400">Street Address:</span> <strong className="text-slate-900">{streetAddress || 'Not provided'}</strong></p>
                    <p><span className="text-slate-400">City:</span> <strong className="text-slate-900">{city || 'Not provided'}</strong></p>
                    <p><span className="text-slate-400">State / Province:</span> <strong className="text-slate-900">{stateProv || 'Not provided'}</strong></p>
                    <p><span className="text-slate-400">Zip Code:</span> <strong className="text-slate-900">{zipCode || 'Not provided'}</strong></p>
                  </div>

                  {/* Card 4: Professional & Permissions */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1">Professional & Permissions</h4>
                    <p><span className="text-slate-400">License Number:</span> <strong className="text-slate-900 font-mono">{licenseNumber || 'Not provided'}</strong></p>
                    <p><span className="text-slate-400">License State:</span> <strong className="text-slate-900">{licenseState || 'Texas, USA'}</strong></p>
                    <p><span className="text-slate-400">License Expiry:</span> <strong className="text-slate-900">{licenseExpiry || 'Not specified'}</strong></p>
                    <p><span className="text-slate-400">Active Certifications:</span> <strong className="text-slate-900">{certifications || 'BLS, ACLS'}</strong></p>
                    <p><span className="text-slate-400">Nursing Experience:</span> <strong className="text-slate-900">{experienceYears || '5 Years'}</strong></p>
                    <div className="pt-1 flex flex-wrap gap-1">
                      {carePlanRights && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">Care Plan</span>}
                      {vitalEntryRights && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">Vitals</span>}
                      {medicationAdmin && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">MAR Logging</span>}
                      {shiftHandoverAccess && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">Shift Handover</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Action Footer */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate('/nurses')}
                className="px-5 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>

              <div className="flex items-center gap-3">
                {activeStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setActiveStep(activeStep - 1)}
                    className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                  >
                    Back
                  </button>
                )}

                {activeStep < 5 ? (
                  <>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-5 py-2.5 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                    >
                      Save & Continue <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
                    >
                      Save & Next
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSubmitNurse}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Saving Nurse...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" /> Submit & Create Nurse
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Nurse Summary & Callout Banner */}
        <div className="space-y-6">
          {/* Nurse Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-6 space-y-6">
            <h3 className="text-sm font-bold text-slate-900">Nurse Summary</h3>
            <div className="flex flex-col items-center text-center space-y-3 pb-4 border-b border-slate-100">
              <div className="relative">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={fullName || 'Nurse'}
                    className="h-20 w-20 rounded-full object-cover border-4 border-indigo-50 shadow-sm"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl border-4 border-indigo-50 shadow-sm">
                    {fullName ? fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'RN'}
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">{fullName || '—'}</h4>
                <p className="text-xs text-slate-400 font-medium">{departmentUnit || '—'}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Nurse Name</span>
                <span className="font-bold text-slate-800">{fullName || '—'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Department</span>
                <span className="font-bold text-slate-800">{departmentUnit || '—'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Role</span>
                <span className="font-bold text-slate-800">{role || '—'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Email</span>
                <span className="font-medium text-slate-800 truncate max-w-[150px]">{email || '—'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Mobile</span>
                <span className="font-mono font-medium text-slate-800">{mobile || '—'}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400 font-medium">Status</span>
                <span className={`font-bold ${status === 'Active' ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {status}
                </span>
              </div>
            </div>
          </div>

          {/* After Adding Callout Banner */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-indigo-900">After adding, you can:</h4>
            <ul className="space-y-2.5 text-xs text-indigo-800 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>Assign nurse to care team</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>Manage shift schedules</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>Configure access permissions</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>Add to departments / units</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

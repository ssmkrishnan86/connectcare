import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  User,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { DatePickerInput } from '@/components/common/DatePickerInput';
import { api } from '@/lib/api';


export const AddDoctorPage: React.FC = () => {
  const navigate = useNavigate();
  const { doctorId } = useParams<{ doctorId?: string }>();
  const isEditMode = Boolean(doctorId);

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
  const [departmentSpeciality, setDepartmentSpeciality] = useState('');
  const [role, setRole] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [reportingTo, setReportingTo] = useState('');
  const [dateOfJoining, setDateOfJoining] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  // Form State - Step 2: Contact & Address
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateProv, setStateProv] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');

  // Form State - Step 3: Professional Information
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseState, setLicenseState] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [npiNumber, setNpiNumber] = useState('');
  const [experienceYears, setExperienceYears] = useState('10 Years');
  const [medicalDegree, setMedicalDegree] = useState('');
  const [teleconsultationEnabled, setTeleconsultationEnabled] = useState(true);

  // Form State - Step 4: Permissions & Access
  const [accessLevel, setAccessLevel] = useState('Full Clinical Access');
  const [patientRecordsAccess, setPatientRecordsAccess] = useState(true);
  const [prescriptionRights, setPrescriptionRights] = useState(true);
  const [carePlanManagement, setCarePlanManagement] = useState(true);
  const [aiOperations, setAiOperations] = useState(true);

  // Load existing doctor data if in edit mode
  useEffect(() => {
    if (isEditMode && doctorId) {
      setIsLoading(true);
      api.getDoctorById(doctorId)
        .then((res: any) => {
          const doc = (res && res.data) ? res.data : res;
          if (doc) {
            if (doc.firstName) setFirstName(doc.firstName);
            else {
              const nameParts = (doc.name || '').split(' ');
              if (nameParts.length >= 2) {
                setFirstName(nameParts[0]);
                setLastName(nameParts.slice(1).join(' '));
              } else {
                setFirstName(doc.name || '');
              }
            }
            if (doc.middleName) setMiddleName(doc.middleName);
            if (doc.lastName) setLastName(doc.lastName);
            if (doc.gender) setGender(doc.gender);
            if (doc.dob) setDob(doc.dob);
            if (doc.maritalStatus) setMaritalStatus(doc.maritalStatus);
            if (doc.bloodGroup) setBloodGroup(doc.bloodGroup);
            if (doc.languages) setLanguages(doc.languages);
            if (doc.avatar) setAvatar(doc.avatar);

            if (doc.email) setEmail(doc.email);
            if (doc.phone) setMobile(doc.phone);
            if (doc.user?.username || doc.username) setUsername(doc.user?.username || doc.username);
            if (doc.specialty || doc.department) setDepartmentSpeciality(doc.specialty || doc.department || '');
            if (doc.role) setRole(doc.role);
            if (doc.employmentType) setEmploymentType(doc.employmentType);
            if (doc.reportingTo) setReportingTo(doc.reportingTo);
            if (doc.dateOfJoining) setDateOfJoining(doc.dateOfJoining);
            setStatus(doc.status === 0 || doc.status === 'Active' ? 'Active' : 'Inactive');

            if (doc.streetAddress) setStreetAddress(doc.streetAddress);
            else if (doc.location && doc.location.includes(',')) {
              const locParts = doc.location.split(',');
              setStreetAddress(locParts[0].trim());
              setCity(locParts.slice(1).join(',').trim());
            }
            if (doc.city) setCity(doc.city);
            if (doc.state) setStateProv(doc.state);
            if (doc.zipCode) setZipCode(doc.zipCode);
            if (doc.emergencyContactName) setEmergencyName(doc.emergencyContactName);
            if (doc.emergencyContactPhone) setEmergencyPhone(doc.emergencyContactPhone);
            if (doc.emergencyContactRelation) setEmergencyRelation(doc.emergencyContactRelation);

            if (doc.licenseNumber) setLicenseNumber(doc.licenseNumber);
            if (doc.licenseState) setLicenseState(doc.licenseState);
            if (doc.licenseExpiry) setLicenseExpiry(doc.licenseExpiry);
            if (doc.npiNumber) setNpiNumber(doc.npiNumber);
            if (doc.medicalDegree) setMedicalDegree(doc.medicalDegree);
            if (doc.experience) setExperienceYears(doc.experience);
            if (typeof doc.teleconsultationEnabled === 'boolean') setTeleconsultationEnabled(doc.teleconsultationEnabled);

            if (doc.accessLevel) setAccessLevel(doc.accessLevel);
            if (typeof doc.patientRecordsAccess === 'boolean') setPatientRecordsAccess(doc.patientRecordsAccess);
            if (typeof doc.prescriptionRights === 'boolean') setPrescriptionRights(doc.prescriptionRights);
            if (typeof doc.carePlanManagement === 'boolean') setCarePlanManagement(doc.carePlanManagement);
            if (typeof doc.aiOperations === 'boolean') setAiOperations(doc.aiOperations);
          }
        })
        .catch((err) => {
          console.error('Failed to load doctor:', err);
          setErrorMsg('Failed to load doctor information.');
        })
        .finally(() => setIsLoading(false));
    }
  }, [isEditMode, doctorId]);

  // Handle Photo Upload
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

  // Derived Full Name
  const fullName = `${firstName} ${middleName} ${lastName}`.replace(/\s+/g, ' ').trim();

  // Form Submit Handler
  const handleSubmitDoctor = async () => {
    if (!firstName || !lastName || !email || !departmentSpeciality) {
      setErrorMsg('Please fill out all required fields marked with *');
      setActiveStep(1);
      return;
    }

    if (password && confirmPassword && password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      setActiveStep(1);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const specialtyIconMap: Record<string, string> = {
      Cardiology: '💙',
      'Emergency Medicine': '➕',
      Orthopedics: '🦴',
      Endocrinology: '🩺',
      Neurology: '🧠',
      'Internal Medicine': '📱',
      Pulmonology: '🫁',
      Pediatrics: '🧸',
    };

    const selectedIcon = specialtyIconMap[departmentSpeciality] || '🩺';
    const doctorLocation = streetAddress ? (city ? `${streetAddress}, ${city}` : streetAddress) : 'Main Hospital Building';

    const doctorPayload = {
      name: fullName || 'Dr. New Doctor',
      firstName: firstName,
      middleName: middleName,
      lastName: lastName,
      specialty: departmentSpeciality || 'General Medicine',
      specialtyIcon: selectedIcon,
      department: departmentSpeciality || 'Clinical Department',
      role: role || 'Physician',
      employmentType: employmentType || 'Full-Time Staff',
      reportingTo: reportingTo || 'Medical Director',
      dateOfJoining: dateOfJoining,
      location: doctorLocation,
      phone: mobile || '(512) 555-0100',
      email: email,
      gender: gender,
      dob: dob,
      maritalStatus: maritalStatus,
      bloodGroup: bloodGroup,
      languages: languages,
      streetAddress: streetAddress,
      city: city,
      state: stateProv,
      zipCode: zipCode,
      emergencyContactName: emergencyName,
      emergencyContactPhone: emergencyPhone,
      emergencyContactRelation: emergencyRelation,
      licenseNumber: licenseNumber,
      licenseState: licenseState,
      licenseExpiry: licenseExpiry,
      npiNumber: npiNumber,
      medicalDegree: medicalDegree,
      experience: experienceYears || '10 Years',
      accessLevel: accessLevel,
      patientRecordsAccess: patientRecordsAccess,
      prescriptionRights: prescriptionRights,
      carePlanManagement: carePlanManagement,
      aiOperations: aiOperations,
      status: status,
      teleconsultationEnabled: teleconsultationEnabled,
      avatar: avatar,
      username: username || undefined,
      password: password || undefined,
    };

    try {
      if (isEditMode && doctorId) {
        await api.updateDoctor(doctorId, doctorPayload);
        navigate(`/doctors/${doctorId}`);
      } else {
        const createRes = await api.createDoctor(doctorPayload);
        const createdDoc = createRes?.data || createRes;
        const targetId = createdDoc?.id || createdDoc?.doctorIdCode;
        if (targetId) {
          navigate(`/doctors/${targetId}`);
        } else {
          navigate('/doctors');
        }
      }
    } catch (err: any) {
      console.error('Failed to save doctor:', err);
      setErrorMsg(err?.message || 'Failed to save doctor details. Please try again.');
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
          <span>Loading Doctor Profile...</span>
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
              {isEditMode ? 'Edit Doctor Profile' : 'Add New Doctor'}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Enter doctor details to create a new doctor profile.
            </p>
          </div>
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Doctors', href: '/doctors' },
          { label: isEditMode ? 'Edit Doctor' : 'Add New Doctor' },
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
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">First Name <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter first name"
                        className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
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
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter last name"
                        className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
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
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Date of Birth <span className="text-rose-500">*</span></label>
                      <DatePickerInput
                        value={dob}
                        onChange={(val) => setDob(val)}
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

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs items-center">
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
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
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
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email address"
                        className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Mobile Number <span className="text-rose-500">*</span></label>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-semibold text-slate-700 shrink-0">
                          <span>🇺🇸</span>
                          <span>+1</span>
                        </div>
                        <input
                          type="text"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          placeholder="(512) 555-0100"
                          className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Username <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username"
                        className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Password <span className="text-rose-500">*</span></label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter password"
                          className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Confirm Password <span className="text-rose-500">*</span></label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm password"
                          className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Employment Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Employment Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Department / Speciality <span className="text-rose-500">*</span></label>
                      <select
                        value={departmentSpeciality}
                        onChange={(e) => setDepartmentSpeciality(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select department / speciality</option>
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
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Role <span className="text-rose-500">*</span></label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select role</option>
                        <option value="Physician / Specialist">Physician / Specialist</option>
                        <option value="Attending Doctor">Attending Doctor</option>
                        <option value="Consultant">Consultant</option>
                        <option value="Chief Medical Officer">Chief Medical Officer</option>
                        <option value="Resident Doctor">Resident Doctor</option>
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
                        <option value="Full-Time">Full-Time</option>
                        <option value="Part-Time">Part-Time</option>
                        <option value="Contract">Contract</option>
                        <option value="Visiting / Consultant">Visiting / Consultant</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs items-center">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Reporting To</label>
                      <select
                        value={reportingTo}
                        onChange={(e) => setReportingTo(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select reporting manager</option>
                        <option value="Medical Director">Medical Director</option>
                        <option value="Head of Department">Head of Department</option>
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
                            name="statusRadio"
                            checked={status === 'Active'}
                            onChange={() => setStatus('Active')}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                          />
                          Active
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                          <input
                            type="radio"
                            name="statusRadio"
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
                <h3 className="text-sm font-bold text-slate-900">Contact & Residential Address</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Street Address <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="e.g. 100 Hospital Way, Suite 400"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
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
                    <label className="font-semibold text-slate-700 block mb-1">Zip / Postal Code <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="e.g. 78701"
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
                    <input
                      type="text"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="Enter contact phone"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Relationship</label>
                    <input
                      type="text"
                      value={emergencyRelation}
                      onChange={(e) => setEmergencyRelation(e.target.value)}
                      placeholder="e.g. Spouse"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: PROFESSIONAL INFORMATION */}
            {activeStep === 3 && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-900">License & Clinical Credentials</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Medical License Number <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="e.g. MD-987654"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">License State / Country</label>
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
                    <label className="font-semibold text-slate-700 block mb-1">NPI / Registration Number</label>
                    <input
                      type="text"
                      value={npiNumber}
                      onChange={(e) => setNpiNumber(e.target.value)}
                      placeholder="e.g. NPI-123456789"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Clinical Experience <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      placeholder="e.g. 10 Years"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Medical Degree / School</label>
                    <input
                      type="text"
                      value={medicalDegree}
                      onChange={(e) => setMedicalDegree(e.target.value)}
                      placeholder="e.g. Harvard Medical School"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={teleconsultationEnabled}
                      onChange={(e) => setTeleconsultationEnabled(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    Enable Teleconsultation Services for Patients
                  </label>
                </div>
              </div>
            )}

            {/* STEP 4: PERMISSIONS & ACCESS */}
            {activeStep === 4 && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-900">System Role & EHR Access Permissions</h3>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">System Access Level</p>
                      <p className="text-[11px] text-slate-400">Controls data visibility across units</p>
                    </div>
                    <select
                      value={accessLevel}
                      onChange={(e) => setAccessLevel(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-semibold text-slate-700 text-xs"
                    >
                      <option value="Full Clinical Access">Full Clinical Access</option>
                      <option value="Restricted Access">Restricted Department Access</option>
                      <option value="Read-Only Access">Read-Only Access</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="flex items-start gap-3 p-3 bg-slate-50/60 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/60 transition-colors">
                    <input
                      type="checkbox"
                      checked={patientRecordsAccess}
                      onChange={(e) => setPatientRecordsAccess(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 mt-0.5"
                    />
                    <div>
                      <p className="font-bold text-slate-900">Patient Electronic Health Records (EHR)</p>
                      <p className="text-[11px] text-slate-500">Allow viewing and updating patient medical histories, clinical notes, and diagnostic lab reports.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 bg-slate-50/60 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/60 transition-colors">
                    <input
                      type="checkbox"
                      checked={prescriptionRights}
                      onChange={(e) => setPrescriptionRights(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 mt-0.5"
                    />
                    <div>
                      <p className="font-bold text-slate-900">Digital Prescription Signing Rights</p>
                      <p className="text-[11px] text-slate-500">Authorize signing and dispensing digital medication orders to hospital pharmacy.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 bg-slate-50/60 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/60 transition-colors">
                    <input
                      type="checkbox"
                      checked={carePlanManagement}
                      onChange={(e) => setCarePlanManagement(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 mt-0.5"
                    />
                    <div>
                      <p className="font-bold text-slate-900">Care Plan & Discharge Workflow</p>
                      <p className="text-[11px] text-slate-500">Grant permissions to create, update, and approve patient care plans and discharge checklists.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 bg-slate-50/60 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/60 transition-colors">
                    <input
                      type="checkbox"
                      checked={aiOperations}
                      onChange={(e) => setAiOperations(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 mt-0.5"
                    />
                    <div>
                      <p className="font-bold text-slate-900">AI Clinical Assistant & Diagnostics</p>
                      <p className="text-[11px] text-slate-500">Enable AI copilot suggestions, clinical decision support, and predictive risk scores.</p>
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
                    <h3 className="text-sm font-bold text-indigo-900">Review Doctor Profile Details</h3>
                    <p className="text-[11px] text-indigo-700">Please review all information carefully before creating the doctor profile.</p>
                  </div>
                  <span className="px-3 py-1 bg-indigo-600 text-white font-bold rounded-lg text-xs">
                    Ready to Save
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-1.5 text-indigo-700">
                      Personal Details
                    </h4>
                    <p><span className="text-slate-400">Full Name:</span> <strong className="text-slate-900">{fullName || 'Not provided'}</strong></p>
                    <p><span className="text-slate-400">Gender / DOB:</span> <strong className="text-slate-900">{gender || '-'} / {dob || '-'}</strong></p>
                    <p><span className="text-slate-400">Blood Group:</span> <strong className="text-slate-900">{bloodGroup || '-'}</strong></p>
                    <p><span className="text-slate-400">Marital Status:</span> <strong className="text-slate-900">{maritalStatus || '-'}</strong></p>
                    <p><span className="text-slate-400">Languages:</span> <strong className="text-slate-900">{languages || 'English'}</strong></p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-1.5 text-indigo-700">
                      Account & Employment
                    </h4>
                    <p><span className="text-slate-400">Email:</span> <strong className="text-slate-900">{email || 'Not provided'}</strong></p>
                    <p><span className="text-slate-400">Mobile:</span> <strong className="text-slate-900">{mobile || 'Not provided'}</strong></p>
                    <p><span className="text-slate-400">Department:</span> <strong className="text-slate-900">{departmentSpeciality || 'Not provided'}</strong></p>
                    <p><span className="text-slate-400">Role:</span> <strong className="text-slate-900">{role || 'Physician'}</strong></p>
                    <p><span className="text-slate-400">Employment Type:</span> <strong className="text-slate-900">{employmentType || 'Full-Time Staff'} ({status})</strong></p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-1.5 text-indigo-700">
                      Contact & Address
                    </h4>
                    <p><span className="text-slate-400">Street Address:</span> <strong className="text-slate-900">{streetAddress || 'Not provided'}</strong></p>
                    <p><span className="text-slate-400">City / State / ZIP:</span> <strong className="text-slate-900">{[city, stateProv, zipCode].filter(Boolean).join(', ') || 'Not provided'}</strong></p>
                    <p><span className="text-slate-400">Emergency Contact:</span> <strong className="text-slate-900">{emergencyName || 'Not provided'} {emergencyRelation ? `(${emergencyRelation})` : ''}</strong></p>
                    <p><span className="text-slate-400">Emergency Phone:</span> <strong className="text-slate-900">{emergencyPhone || 'Not provided'}</strong></p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center gap-1.5 text-indigo-700">
                      Professional & Permissions
                    </h4>
                    <p><span className="text-slate-400">Medical License:</span> <strong className="text-slate-900">{licenseNumber || 'Pending'} ({licenseState || 'USA'})</strong></p>
                    <p><span className="text-slate-400">NPI Number:</span> <strong className="text-slate-900">{npiNumber || 'Pending'}</strong></p>
                    <p><span className="text-slate-400">Medical Degree:</span> <strong className="text-slate-900">{medicalDegree || 'Doctor of Medicine (M.D.)'}</strong></p>
                    <p><span className="text-slate-400">Experience:</span> <strong className="text-slate-900">{experienceYears || '10 Years'}</strong></p>
                    <p><span className="text-slate-400">Access Level:</span> <strong className="text-slate-900">{accessLevel}</strong></p>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Action Footer */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate('/doctors')}
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
                      onClick={() => setActiveStep(activeStep + 1)}
                      className="px-5 py-2.5 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                    >
                      Save & Continue <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveStep(activeStep + 1)}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
                    >
                      Save & Next
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSubmitDoctor}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Saving Doctor...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" /> Submit & Create Doctor
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Doctor Summary & Information Card */}
        <div className="space-y-6">
          {/* Doctor Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-6 space-y-6">
            <h3 className="text-sm font-bold text-slate-900">Doctor Summary</h3>
            <div className="flex flex-col items-center text-center space-y-3 pb-4 border-b border-slate-100">
              <div className="relative">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={fullName || 'Doctor'}
                    className="h-20 w-20 rounded-full object-cover border-4 border-indigo-50 shadow-sm"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl border-4 border-indigo-50 shadow-sm">
                    {fullName ? fullName.replace('Dr. ', '').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'DR'}
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">{fullName || '—'}</h4>
                <p className="text-xs text-slate-400 font-medium">{departmentSpeciality || '—'}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Doctor Name</span>
                <span className="font-bold text-slate-800">{fullName || '—'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Department</span>
                <span className="font-bold text-slate-800">{departmentSpeciality || '—'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Speciality</span>
                <span className="font-bold text-slate-800">{departmentSpeciality || '—'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Email</span>
                <span className="font-medium text-slate-800 truncate max-w-[150px]">{email || '—'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Mobile</span>
                <span className="font-mono font-medium text-slate-800">{mobile || '—'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Role</span>
                <span className="font-bold text-slate-800">{role || '—'}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400 font-medium">Status</span>
                <span className={`font-bold ${status === 'Active' ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {status}
                </span>
              </div>
            </div>
          </div>

          {/* After Adding Callout Card */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-indigo-900">After adding, you can:</h4>
            <ul className="space-y-2.5 text-xs text-indigo-800 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>Assign clinic schedule</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>Manage permissions</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>Add to care teams</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>Configure notification preferences</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

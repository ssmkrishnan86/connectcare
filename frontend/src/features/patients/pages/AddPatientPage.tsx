import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  User,
  MapPin,
  Users,
  Heart,
  Shield,
  FileText,
  Upload,
  Plus,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Building2,
  FileCheck
} from 'lucide-react';
import { api } from '@/lib/api';

export const AddPatientPage: React.FC = () => {
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId?: string }>();
  const isEditMode = Boolean(patientId);

  // Active Stepper Tab (1: Details, 2: Medical, 3: Insurance, 4: Review)
  const [activeStep, setActiveStep] = useState(1);

  // Loading & Doctors State
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPatient, setIsLoadingPatient] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Form State: Personal Details
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [patientIdCode, setPatientIdCode] = useState('');
  const [mrn, setMrn] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80');

  // Contact & Address
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('USA');

  // Emergency Contact
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyIsPrimary, setEmergencyIsPrimary] = useState(true);

  // 2. Assignment & Medical Info State
  const [careUnit, setCareUnit] = useState('Cardiology Unit');
  const [floorRoom, setFloorRoom] = useState('');
  const [status, setStatus] = useState('InCare');
  const [riskLevel, setRiskLevel] = useState('High');
  const [primaryPhysician, setPrimaryPhysician] = useState('');

  const [conditions, setConditions] = useState<string[]>([]);
  const [newConditionInput, setNewConditionInput] = useState('');
  const [showConditionInput, setShowConditionInput] = useState(false);

  const [allergies, setAllergies] = useState<string[]>([]);
  const [newAllergyInput, setNewAllergyInput] = useState('');
  const [showAllergyInput, setShowAllergyInput] = useState(false);

  const [currentMedications, setCurrentMedications] = useState('');
  const [pastMedicalHistory, setPastMedicalHistory] = useState('');

  // 3. Insurance Details State
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [groupNumber, setGroupNumber] = useState('');
  const [validUntil, setValidUntil] = useState('');

  // Additional Notes
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Fetch Doctors List from API
  useEffect(() => {
    api.getDoctors()
      .then((docList) => {
        if (docList && docList.length > 0) {
          setDoctors(docList);
        }
      })
      .catch((err) => console.error('Failed to fetch doctors:', err));
  }, []);

  // Fetch Patient Details if in Edit Mode
  useEffect(() => {
    if (patientId) {
      setIsLoadingPatient(true);
      api.getPatientById(patientId)
        .then((p) => {
          if (p) {
            if (p.firstName) setFirstName(p.firstName);
            else if (p.name) setFirstName(p.name.split(' ')[0] || p.name);

            if (p.lastName) setLastName(p.lastName);
            else if (p.name) setLastName(p.name.split(' ').slice(1).join(' ') || '');

            if (p.dob) setDob(p.dob);
            if (p.gender) setGender(p.gender);
            if (p.patientIdCode) setPatientIdCode(p.patientIdCode);
            if (p.mrn) setMrn(p.mrn);
            if (p.bloodType) setBloodType(p.bloodType);
            if (p.maritalStatus) setMaritalStatus(p.maritalStatus);
            if (p.avatar) setAvatarUrl(p.avatar);
            if (p.phone) setPhone(p.phone);
            if (p.email) setEmail(p.email);
            if (p.address) setAddress(p.address);
            if (p.city) setCity(p.city);
            if (p.state) setState(p.state);
            if (p.zipCode) setZipCode(p.zipCode);
            if (p.country) setCountry(p.country);

            if (p.emergencyContactName) setEmergencyName(p.emergencyContactName);
            if (p.emergencyContactRelationship) setEmergencyRelationship(p.emergencyContactRelationship);
            if (p.emergencyContactPhone) setEmergencyPhone(p.emergencyContactPhone);
            if (typeof p.emergencyContactIsPrimary === 'boolean') setEmergencyIsPrimary(p.emergencyContactIsPrimary);

            if (p.primaryDoctorName) setPrimaryPhysician(p.primaryDoctorName);
            if (p.careUnit) setCareUnit(p.careUnit);
            if (p.floorRoom) setFloorRoom(p.floorRoom);
            if (p.status !== undefined && p.status !== null) setStatus(String(p.status));
            if (p.riskLevel !== undefined && p.riskLevel !== null) setRiskLevel(String(p.riskLevel));

            if (p.medicalConditions) {
              const condArr = typeof p.medicalConditions === 'string'
                ? p.medicalConditions.split(',').map((s: string) => s.trim()).filter(Boolean)
                : p.medicalConditions;
              setConditions(condArr);
            }
            if (p.allergies) {
              const allergyArr = typeof p.allergies === 'string'
                ? p.allergies.split(',').map((s: string) => s.trim()).filter(Boolean)
                : p.allergies;
              setAllergies(allergyArr);
            }

            if (p.currentMedications) setCurrentMedications(p.currentMedications);
            if (p.pastMedicalHistory) setPastMedicalHistory(p.pastMedicalHistory);
            if (p.insuranceProvider) setInsuranceProvider(p.insuranceProvider);
            if (p.insurancePolicyNumber) setPolicyNumber(p.insurancePolicyNumber);
            if (p.insuranceGroupNumber) setGroupNumber(p.insuranceGroupNumber);
            if (p.insuranceValidUntil) setValidUntil(p.insuranceValidUntil);
            if (p.additionalNotes) setAdditionalNotes(p.additionalNotes);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch patient for editing:', err);
          setErrorMsg('Failed to load patient details.');
        })
        .finally(() => setIsLoadingPatient(false));
    }
  }, [patientId]);

  // Calculate Age dynamically
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

  const getAvatarSrc = (url?: string) => {
    if (!url) return 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    if (url.startsWith('/')) return url;
    return `/${url}`;
    };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Profile picture file size must be less than 5MB.');
      return;
    }

    const pId = patientId;
    if (pId) {
      setIsUploadingAvatar(true);
      try {
        const uploadRes = await api.uploadPatientDocument(pId, file, 'ProfilePicture');
        if (uploadRes && uploadRes.data && uploadRes.data.fileName) {
          const newAvatarPath = `/api/patients/${pId}/documents/ProfilePicture/${uploadRes.data.fileName}`;
          setAvatarUrl(newAvatarPath);

          // Update patient entity in DB immediately
          const existing = await api.getPatientById(pId);
          if (existing) {
            await api.updatePatient(pId, { ...existing, avatar: newAvatarPath });
          }
        }
      } catch (err: any) {
        console.error('Failed to upload profile picture:', err);
        alert(err.message || 'Failed to upload profile picture.');
      } finally {
        setIsUploadingAvatar(false);
      }
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCondition = () => {
    if (newConditionInput.trim()) {
      setConditions([...conditions, newConditionInput.trim()]);
      setNewConditionInput('');
      setShowConditionInput(false);
    }
  };

  const handleRemoveCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleAddAllergy = () => {
    if (newAllergyInput.trim()) {
      setAllergies([...allergies, newAllergyInput.trim()]);
      setNewAllergyInput('');
      setShowAllergyInput(false);
    }
  };

  const handleRemoveAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg('First Name and Last Name are required.');
      setActiveStep(1);
      return;
    }
    if (!dob) {
      setErrorMsg('Date of Birth is required.');
      setActiveStep(1);
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Phone Number is required.');
      setActiveStep(1);
      return;
    }

    setIsSubmitting(true);

    try {
      const calculatedAgeVal = calculateAge(dob);
      const ageGenderFormatted = `${calculatedAgeVal} / ${gender}`;

      const payload = {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        dob,
        gender,
        ageGender: ageGenderFormatted,
        patientIdCode: patientIdCode || `PT-${Math.floor(10000 + Math.random() * 90000)}`,
        mrn: mrn || `MRN-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        bloodType,
        maritalStatus,
        avatar: avatarUrl,
        phone,
        email,
        address,
        city,
        state,
        zipCode,
        country,
        emergencyContactName: emergencyName,
        emergencyContactRelationship: emergencyRelationship,
        emergencyContactPhone: emergencyPhone,
        emergencyContactIsPrimary: emergencyIsPrimary,
        primaryDoctorName: primaryPhysician,
        medicalConditions: conditions.join(', '),
        allergies: allergies.join(', '),
        currentMedications,
        pastMedicalHistory,
        insuranceProvider,
        insurancePolicyNumber: policyNumber,
        insuranceGroupNumber: groupNumber,
        insuranceValidUntil: validUntil,
        additionalNotes,
        careUnit: careUnit || 'General Ward',
        floorRoom: floorRoom || '1st Floor - 101',
        status: status || 'InCare',
        riskLevel: riskLevel || 'High',
        lastVisit: 'May 22, 2024 10:00 AM'
      };

      if (isEditMode && patientId) {
        await api.updatePatient(patientId, payload);
      } else {
        await api.createPatient(payload);
      }

      navigate('/patients');
    } catch (err: any) {
      console.error('Failed to save patient:', err);
      setErrorMsg(err.message || 'Failed to save patient. Please check input values.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingPatient) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="text-sm font-extrabold text-slate-600">Loading patient details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 space-y-6 p-6 max-w-[1700px] mx-auto select-none pb-16">
      
      {/* 1. Header & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isEditMode ? 'Edit Patient' : 'Add Patient'}
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            {isEditMode
              ? 'Update existing health, contact, medical, and insurance details for patient.'
              : 'Register a new patient with complete health, medical, and insurance details.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/patients')}
            className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Stepper Tabs Bar */}
      <div className="flex items-center gap-6 border-b border-slate-200/80 pb-3 text-xs font-bold flex-wrap">
        {[
          { step: 1, label: 'Patient Details', icon: User },
          { step: 2, label: 'Medical Info', icon: Heart },
          { step: 3, label: 'Insurance', icon: Shield },
          { step: 4, label: 'Review', icon: FileCheck }
        ].map(({ step, label, icon: Icon }) => (
          <button
            key={step}
            type="button"
            onClick={() => setActiveStep(step)}
            className={`flex items-center gap-2 pb-1.5 border-b-2 transition-all cursor-pointer ${
              activeStep === step
                ? 'border-indigo-600 text-indigo-700 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
              activeStep === step ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'
            }`}>{step}</span>
            <Icon className="h-3.5 w-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Error Alert Message */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between shadow-2xs">
          <span>⚠️ {errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-rose-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Form Content Grid */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* STEP 1: PATIENT DETAILS */}
        {activeStep === 1 && (
          <div className="space-y-6">
            {/* Card 1: Personal Details */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">Personal Details</h2>
              </div>

              <div className="flex flex-col md:flex-row items-start gap-6">
                {/* Avatar Photo Upload */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <img
                    src={getAvatarSrc(avatarUrl)}
                    alt="Patient Avatar"
                    className="w-24 h-24 rounded-full object-cover border-2 border-indigo-200 shadow-2xs bg-slate-100"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png, image/jpeg, image/jpg, image/gif"
                    className="hidden"
                    onChange={handleAvatarFileChange}
                  />
                  <button
                    type="button"
                    disabled={isUploadingAvatar}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 rounded-xl text-[11px] font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="h-3.5 w-3.5 text-indigo-600 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5 text-indigo-600" />
                    )}
                    <span>{isUploadingAvatar ? 'Uploading...' : 'Upload Photo'}</span>
                  </button>
                  <span className="text-[10px] text-slate-400 font-semibold">JPG, PNG (Max 5MB)</span>
                </div>

                {/* Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 w-full text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      First Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Patricia"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Last Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Smith"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Date of Birth <span className="text-rose-500">*</span></span>
                      {dob && <span className="text-[10px] text-indigo-600 font-extrabold">{calculateAge(dob)} YRS</span>}
                    </label>
                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Gender <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-4 py-2">
                      {(['Male', 'Female', 'Other'] as const).map((g) => (
                        <label key={g} className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value={g}
                            checked={gender === g}
                            onChange={() => setGender(g)}
                            className="text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          <span>{g}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Patient ID</label>
                    <input
                      type="text"
                      value={patientIdCode}
                      onChange={(e) => setPatientIdCode(e.target.value)}
                      placeholder="Auto-generated if empty"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">MRN</label>
                    <input
                      type="text"
                      value={mrn}
                      onChange={(e) => setMrn(e.target.value)}
                      placeholder="Auto-generated if empty"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Blood Type</label>
                    <select
                      value={bloodType}
                      onChange={(e) => setBloodType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white cursor-pointer"
                    >
                      <option value="">Select Blood Type</option>
                      {['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'].map((bt) => (
                        <option key={bt} value={bt}>{bt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Marital Status</label>
                    <select
                      value={maritalStatus}
                      onChange={(e) => setMaritalStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white cursor-pointer"
                    >
                      <option value="">Select Status</option>
                      {['Single', 'Married', 'Divorced', 'Widowed'].map((ms) => (
                        <option key={ms} value={ms}>{ms}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Contact, Address & Emergency Contact */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-900">Contact & Address Details</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="patient@email.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Maple Street"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Springfield"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">State / Province</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="IL"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Zip / Postal Code</label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="62704"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="USA"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Users className="h-4 w-4" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-900">Emergency Contact</h2>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Contact Person Name</label>
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      placeholder="e.g. James Brown"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Relationship</label>
                    <input
                      type="text"
                      value={emergencyRelationship}
                      onChange={(e) => setEmergencyRelationship(e.target.value)}
                      placeholder="e.g. Spouse / Son / Daughter"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Emergency Phone</label>
                    <input
                      type="text"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="(555) 987-6543"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                    />
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={emergencyIsPrimary}
                        onChange={(e) => setEmergencyIsPrimary(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span>Primary Emergency Contact</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: MEDICAL INFO & ASSIGNMENT */}
        {activeStep === 2 && (
          <div className="space-y-6">
            {/* Card 1: Unit & Physician Assignment */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Building2 className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">Care Unit & Physician Assignment</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Primary Physician</label>
                  <select
                    value={primaryPhysician}
                    onChange={(e) => setPrimaryPhysician(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white cursor-pointer"
                  >
                    <option value="">Select Primary Physician</option>
                    <option value="Dr. Sarah Wilson">Dr. Sarah Wilson</option>
                    <option value="Dr. Michael Brown">Dr. Michael Brown</option>
                    <option value="Dr. James Lee">Dr. James Lee</option>
                    <option value="Dr. Emily Clark">Dr. Emily Clark</option>
                    <option value="Dr. Anita Sharma">Dr. Anita Sharma</option>
                    {doctors.map((d: any) => (
                      <option key={d.id} value={d.name}>{d.name} ({d.specialty || 'General'})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Care Unit</label>
                  <select
                    value={careUnit}
                    onChange={(e) => setCareUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white cursor-pointer"
                  >
                    <option value="Cardiology Unit">Cardiology Unit</option>
                    <option value="Med-Surg Unit 2">Med-Surg Unit 2</option>
                    <option value="Diabetes Care">Diabetes Care</option>
                    <option value="General Ward">General Ward</option>
                    <option value="Geriatrics Unit">Geriatrics Unit</option>
                    <option value="Orthopedics Unit">Orthopedics Unit</option>
                    <option value="Neurology Unit">Neurology Unit</option>
                    <option value="Emergency Department">Emergency Department</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Floor & Room</label>
                  <input
                    type="text"
                    value={floorRoom}
                    onChange={(e) => setFloorRoom(e.target.value)}
                    placeholder="e.g. 3rd Floor - 301"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Patient Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white cursor-pointer"
                  >
                    <option value="InCare">In Care</option>
                    <option value="Admitted">Admitted</option>
                    <option value="Discharged">Discharged</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Card 2: Medical Information */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Heart className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">Medical History & Conditions</h2>
              </div>

              <div className="space-y-4 text-xs">
                {/* Medical Conditions */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Medical Conditions</label>
                  <div className="flex flex-wrap items-center gap-2 min-h-[42px] p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    {conditions.map((cond, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-[11px] font-extrabold rounded-lg border border-indigo-100 shadow-2xs">
                        {cond}
                        <button type="button" onClick={() => handleRemoveCondition(idx)} className="hover:text-indigo-900 cursor-pointer">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}

                    {showConditionInput ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          autoFocus
                          value={newConditionInput}
                          onChange={(e) => setNewConditionInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCondition())}
                          placeholder="e.g. Asthma"
                          className="px-2.5 py-1 text-xs bg-white border border-indigo-300 rounded-lg focus:outline-none w-32 font-semibold"
                        />
                        <button type="button" onClick={handleAddCondition} className="px-2.5 py-1 bg-indigo-600 text-white font-extrabold rounded-lg text-xs hover:bg-indigo-700 cursor-pointer">Add</button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowConditionInput(true)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-indigo-50 text-indigo-600 border border-slate-200 hover:border-indigo-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Condition</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Allergies Tag Input */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Allergies</label>
                  <div className="flex flex-wrap items-center gap-2 min-h-[42px] p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    {allergies.map((allergy, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 text-[11px] font-extrabold rounded-lg border border-rose-100 shadow-2xs">
                        {allergy}
                        <button type="button" onClick={() => handleRemoveAllergy(idx)} className="hover:text-rose-900 cursor-pointer">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}

                    {showAllergyInput ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          autoFocus
                          value={newAllergyInput}
                          onChange={(e) => setNewAllergyInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAllergy())}
                          placeholder="e.g. Penicillin"
                          className="px-2.5 py-1 text-xs bg-white border border-rose-300 rounded-lg focus:outline-none w-32 font-semibold"
                        />
                        <button type="button" onClick={handleAddAllergy} className="px-2.5 py-1 bg-rose-600 text-white font-extrabold rounded-lg text-xs hover:bg-rose-700 cursor-pointer">Add</button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowAllergyInput(true)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Allergy</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Current Medications */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Current Medications</label>
                  <input
                    type="text"
                    value={currentMedications}
                    onChange={(e) => setCurrentMedications(e.target.value)}
                    placeholder="e.g. Metformin 500 mg, Lisinopril 10 mg"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                  />
                </div>

                {/* Past Medical History */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Past Medical History</label>
                  <textarea
                    rows={3}
                    value={pastMedicalHistory}
                    onChange={(e) => setPastMedicalHistory(e.target.value)}
                    placeholder="e.g. Heart disease (2020), Knee surgery (2018)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: INSURANCE & NOTES */}
        {activeStep === 3 && (
          <div className="space-y-6">
            {/* Card 1: Insurance Details */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Shield className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">Insurance & Coverage Details</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Provider Name</label>
                  <input
                    type="text"
                    value={insuranceProvider}
                    onChange={(e) => setInsuranceProvider(e.target.value)}
                    placeholder="e.g. HealthPlus / BlueCross"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Policy / Member Number</label>
                  <input
                    type="text"
                    value={policyNumber}
                    onChange={(e) => setPolicyNumber(e.target.value)}
                    placeholder="e.g. HP123456789"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Group Number</label>
                  <input
                    type="text"
                    value={groupNumber}
                    onChange={(e) => setGroupNumber(e.target.value)}
                    placeholder="e.g. GRP98765"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Valid Until Date</label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Additional Clinical Notes */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <FileText className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">Additional Notes & Instructions</h2>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 text-xs">Special Instructions / Clinical Notes</label>
                <textarea
                  rows={4}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Enter special patient requests, mobility instructions, or dietary preferences..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & CONFIRM */}
        {activeStep === 4 && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
              
              {/* Header Banner */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                <img
                  src={avatarUrl}
                  alt="Review Avatar"
                  className="w-16 h-16 rounded-full object-cover border-2 border-indigo-200 shadow-2xs"
                />
                <div className="text-center sm:text-left flex-1">
                  <h3 className="text-lg font-black text-slate-900">
                    {firstName || lastName ? `${firstName} ${lastName}` : 'Unnamed Patient'}
                  </h3>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1 text-xs font-bold text-slate-600">
                    {patientIdCode && <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md font-extrabold">{patientIdCode}</span>}
                    {mrn && <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-extrabold">MRN: {mrn}</span>}
                    {dob && <span>{calculateAge(dob)} YRS / {gender}</span>}
                    {careUnit && <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md font-extrabold">{careUnit}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-extrabold">Ready to Save</span>
                </div>
              </div>

              {/* Review Sections Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                
                {/* 1. Personal & Contact Summary */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-black text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-indigo-600" />
                    Personal & Contact Details
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div><span className="font-bold text-slate-800">Phone:</span> {phone || 'Not provided'}</div>
                    <div><span className="font-bold text-slate-800">Email:</span> {email || 'Not provided'}</div>
                    <div><span className="font-bold text-slate-800">Blood Type:</span> {bloodType || 'Not specified'}</div>
                    <div><span className="font-bold text-slate-800">Marital Status:</span> {maritalStatus || 'Not specified'}</div>
                    <div className="col-span-2"><span className="font-bold text-slate-800">Address:</span> {[address, city, state, zipCode, country].filter(Boolean).join(', ') || 'Not provided'}</div>
                  </div>
                </div>

                {/* 2. Emergency Contact Summary */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-black text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-indigo-600" />
                    Emergency Contact
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div><span className="font-bold text-slate-800">Contact Person:</span> {emergencyName || 'Not provided'}</div>
                    <div><span className="font-bold text-slate-800">Relationship:</span> {emergencyRelationship || 'Not provided'}</div>
                    <div><span className="font-bold text-slate-800">Emergency Phone:</span> {emergencyPhone || 'Not provided'}</div>
                    <div><span className="font-bold text-slate-800">Primary Contact:</span> {emergencyIsPrimary ? 'Yes' : 'No'}</div>
                  </div>
                </div>

                {/* 3. Medical & Assignment Summary */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-black text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                    <Heart className="h-3.5 w-3.5 text-rose-500" />
                    Medical Info & Assignment
                  </h4>
                  <div className="space-y-2 text-slate-600">
                    <div className="grid grid-cols-2 gap-2">
                      <div><span className="font-bold text-slate-800">Primary Physician:</span> {primaryPhysician || 'Not assigned'}</div>
                      <div><span className="font-bold text-slate-800">Care Unit:</span> {careUnit}</div>
                      <div><span className="font-bold text-slate-800">Floor & Room:</span> {floorRoom || 'Unassigned'}</div>
                      <div><span className="font-bold text-slate-800">Status:</span> {status}</div>
                    </div>

                    <div>
                      <span className="font-bold text-slate-800 block mb-1">Medical Conditions:</span>
                      {conditions.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {conditions.map((c, i) => (
                            <span key={i} className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-extrabold rounded-md">{c}</span>
                          ))}
                        </div>
                      ) : <span className="text-slate-400 italic">None reported</span>}
                    </div>

                    <div>
                      <span className="font-bold text-slate-800 block mb-1">Allergies:</span>
                      {allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {allergies.map((a, i) => (
                            <span key={i} className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-extrabold rounded-md">{a}</span>
                          ))}
                        </div>
                      ) : <span className="text-slate-400 italic">No known allergies</span>}
                    </div>
                  </div>
                </div>

                {/* 4. Insurance & Notes Summary */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-black text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-indigo-600" />
                    Insurance & Notes
                  </h4>
                  <div className="space-y-2 text-slate-600">
                    <div className="grid grid-cols-2 gap-2">
                      <div><span className="font-bold text-slate-800">Provider:</span> {insuranceProvider || 'Not specified'}</div>
                      <div><span className="font-bold text-slate-800">Policy Number:</span> {policyNumber || 'Not specified'}</div>
                      <div><span className="font-bold text-slate-800">Group Number:</span> {groupNumber || 'Not specified'}</div>
                      <div><span className="font-bold text-slate-800">Valid Until:</span> {validUntil || 'Not specified'}</div>
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 block">Additional Notes:</span>
                      <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200 mt-1">{additionalNotes || 'No additional notes provided.'}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Stepper Footer Action Bar (Back / Next / Confirm) */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
          {activeStep > 1 ? (
            <button
              type="button"
              onClick={() => setActiveStep(activeStep - 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer shadow-2xs transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          ) : <div />}

          {activeStep < 4 ? (
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                if (activeStep === 1) {
                  if (!firstName.trim() || !lastName.trim()) {
                    setErrorMsg('First Name and Last Name are required.');
                    return;
                  }
                  if (!dob) {
                    setErrorMsg('Date of Birth is required.');
                    return;
                  }
                  if (!phone.trim()) {
                    setErrorMsg('Phone Number is required.');
                    return;
                  }
                }
                setActiveStep(activeStep + 1);
              }}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-600/20 cursor-pointer transition-all active:scale-95"
            >
              <span>Next Step</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-7 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-600/20 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{isEditMode ? 'Saving Changes...' : 'Creating Patient...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isEditMode ? 'Confirm & Save Changes' : 'Confirm & Create Patient'}</span>
                </>
              )}
            </button>
          )}
        </div>

      </form>
    </div>
  );
};

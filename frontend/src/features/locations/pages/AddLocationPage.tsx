import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { api } from '@/lib/api';
import { isValidEmail, isValidUSPhone } from '@/lib/utils';

export const AddLocationPage: React.FC = () => {
  const navigate = useNavigate();
  const { locationId } = useParams<{ locationId?: string }>();
  const isEditMode = Boolean(locationId);

  // Stepper State (Step 1 to 5)
  const [activeStep, setActiveStep] = useState(1);

  // Loading & Error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Form State - Step 1: Basic Information
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState('');
  const [facility, setFacility] = useState('Connected Care Hospital');
  const [facilityLocation, setFacilityLocation] = useState('Austin, TX');
  const [avatar, setAvatar] = useState('');

  // Step 2: Capacity & Floor
  const [floor, setFloor] = useState('Ground Floor');
  const [beds, setBeds] = useState<number>(30);
  const [occupiedBeds, setOccupiedBeds] = useState<number>(20);
  const [unitsCount, setUnitsCount] = useState<number>(12);

  // Step 3: Operational Status
  const [status, setStatus] = useState<'Active' | 'Maintenance' | 'Inactive' | ''>('');
  const [attentionPriority, setAttentionPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical' | ''>('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Step 4: Services & Equipment
  const [services, setServices] = useState('');
  const [equipmentInstalled, setEquipmentInstalled] = useState('');

  // Reset location form fields
  const resetLocationFormState = () => {
    setActiveStep(1);
    setName('');
    setCode('');
    setType('Inpatient');
    setFacility('Connected Care Hospital');
    setFacilityLocation('Austin, TX');
    setFloor('Ground Floor');
    setBeds(30);
    setOccupiedBeds(0);
    setUnitsCount(12);
    setStatus('Active');
    setAttentionPriority('Low');
    setEmail('');
    setPhone('');
    setAvatar('');
    setFieldErrors({});
    setErrorMsg(null);
  };

  // Load existing data if edit mode
  useEffect(() => {
    if (isEditMode && locationId) {
      setIsLoading(true);
      api
        .getLocations()
        .then((locations) => {
          const loc = locations.find((l: any) => String(l.id) === String(locationId));
          if (loc) {
            setName(loc.name || '');
            setCode(loc.code || '');
            setType(loc.type || '');
            setFacility(loc.facility || 'Connected Care Hospital');
            setFacilityLocation(loc.facilityLocation || 'Austin, TX');
            setFloor(loc.floor || 'Ground Floor');
            setBeds(loc.beds || 30);
            setOccupiedBeds(loc.occupiedBeds || 0);
            setUnitsCount(loc.unitsCount || 12);
            setStatus(loc.status === 0 ? 'Active' : loc.status === 1 ? 'Maintenance' : 'Inactive');
            setAttentionPriority(
              loc.attentionPriority === 0
                ? 'Low'
                : loc.attentionPriority === 1
                ? 'Medium'
                : loc.attentionPriority === 2
                ? 'High'
                : 'Critical'
            );
            if (loc.avatar) setAvatar(loc.avatar);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch location:', err);
          setErrorMsg('Failed to load location data.');
        })
        .finally(() => setIsLoading(false));
    } else {
      resetLocationFormState();
    }
  }, [isEditMode, locationId]);

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

  const occupancyRate = beds > 0 ? `${((occupiedBeds / beds) * 100).toFixed(1)}%` : '0%';

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    if (step === 1 || step === 5) {
      if (!name.trim()) errors.name = 'Unit / Location name is required.';
      if (!code.trim()) errors.code = 'Unit code is required.';
      if (!type) errors.type = 'Location type is required.';
      if (!facility.trim()) errors.facility = 'Facility name is required.';
    }
    if (step === 2 || step === 5) {
      if (!floor.trim()) errors.floor = 'Floor / Room number is required.';
      if (beds === undefined || beds === null || beds < 1) errors.beds = 'Bed capacity must be at least 1.';
    }
    if (step === 3 || step === 5) {
      if (!status) errors.status = 'Operational status is required.';
      if (!attentionPriority) errors.attentionPriority = 'Attention priority level is required.';
      if (email && !isValidEmail(email)) errors.email = 'Please enter a valid email address.';
      if (phone && !isValidUSPhone(phone)) errors.phone = 'Please enter a valid 10-digit US phone number.';
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
  const handleSubmitLocation = async () => {
    if (!validateStep(5)) {
      setErrorMsg('Please correct all required fields marked with * before submitting.');
      if (!name.trim() || !code.trim() || !type || !facility.trim()) {
        setActiveStep(1);
      } else if (!floor.trim() || beds < 1) {
        setActiveStep(2);
      } else if (!status || !attentionPriority || (email && !isValidEmail(email)) || (phone && !isValidUSPhone(phone))) {
        setActiveStep(3);
      }
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const locationPayload = {
      name: name,
      code: code,
      type: type,
      facility: facility,
      facilityLocation: facilityLocation,
      floor: floor,
      beds: Number(beds),
      capacity: `${beds} Beds`,
      occupied: `${occupiedBeds} Beds`,
      occupancyRate: occupancyRate,
      unitsCount: Number(unitsCount),
      status: status === 'Active' ? 0 : status === 'Maintenance' ? 1 : 2,
      attentionPriority: attentionPriority === 'Low' ? 0 : attentionPriority === 'Medium' ? 1 : attentionPriority === 'High' ? 2 : 3,
      avatar: avatar,
    };

    try {
      if (isEditMode && locationId) {
        await api.updateLocation(locationId, locationPayload);
      } else {
        await api.createLocation(locationPayload);
      }
      resetLocationFormState();
      navigate('/locations');
    } catch (err: any) {
      console.error('Failed to save location:', err);
      setErrorMsg(err?.message || 'Failed to save location details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    { id: 1, label: 'Basic Information' },
    { id: 2, label: 'Capacity & Floor' },
    { id: 3, label: 'Operational Status' },
    { id: 4, label: 'Services & Equipment' },
    { id: 5, label: 'Review & Confirm' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-600 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <Loader2 className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin text-blue-600" />
          <span>Loading Location Details...</span>
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
              {isEditMode ? 'Edit Location / Unit' : 'Add New Location / Unit'}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Enter facility, wing, and bed details to register a new care location.
            </p>
          </div>
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Locations / Units', href: '/locations' },
          { label: isEditMode ? 'Edit Location' : 'Add New Location' },
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
                    ? 'bg-blue-50/80 text-blue-600 border border-blue-200/80 shadow-sm'
                    : isCompleted
                    ? 'text-slate-700 hover:bg-slate-50'
                    : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`h-6 w-6 rounded-lg flex items-center justify-center font-bold text-[11px] ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                      : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : step.id}
                </div>
                <span>{step.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-600 rounded-full" />
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
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Unit Identification & Facility</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Unit / Location Name <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      maxLength={50}
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, name: '' }));
                      }}
                      placeholder="e.g. Diabetes Care Unit"
                      className={`w-full px-3.5 py-2.5 bg-slate-50/60 border ${fieldErrors.name ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Max length: 50</p>
                    {fieldErrors.name && <p className="text-[11px] font-bold text-rose-500 mt-1">{fieldErrors.name}</p>}
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Unit Code <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      maxLength={30}
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, code: '' }));
                      }}
                      placeholder="e.g. LOC-001"
                      className={`w-full px-3.5 py-2.5 bg-slate-50/60 border ${fieldErrors.code ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Max length: 30</p>
                    {fieldErrors.code && <p className="text-[11px] font-bold text-rose-500 mt-1">{fieldErrors.code}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Location Type <span className="text-rose-500">*</span></label>
                    <select
                      value={type}
                      onChange={(e) => {
                        setType(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, type: '' }));
                      }}
                      className={`w-full px-3.5 py-2.5 bg-slate-50/60 border ${fieldErrors.type ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="">Select Location Type</option>
                      <option value="Wing">Wing</option>
                      <option value="Specialty Center">Specialty Center</option>
                      <option value="Emergency">Emergency</option>
                      <option value="ICU">ICU</option>
                      <option value="Block">Block</option>
                      <option value="Clinic">Clinic</option>
                      <option value="Hospital">Hospital</option>
                    </select>
                    {fieldErrors.type && <p className="text-[11px] font-bold text-rose-500 mt-1">{fieldErrors.type}</p>}
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Facility Name <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      maxLength={100}
                      value={facility}
                      onChange={(e) => {
                        setFacility(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, facility: '' }));
                      }}
                      placeholder="e.g. Connected Care Hospital"
                      className={`w-full px-3.5 py-2.5 bg-slate-50/60 border ${fieldErrors.facility ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Max length: 100</p>
                    {fieldErrors.facility && <p className="text-[11px] font-bold text-rose-500 mt-1">{fieldErrors.facility}</p>}
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Facility City / State</label>
                    <input
                      type="text"
                      maxLength={50}
                      value={facilityLocation}
                      onChange={(e) => setFacilityLocation(e.target.value)}
                      placeholder="e.g. Austin, TX"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Max length: 50</p>
                  </div>
                </div>

                <div className="text-xs">
                  <label className="font-semibold text-slate-700 block mb-1">Location Cover Photo</label>
                  <label className="border-2 border-dashed border-blue-200/80 bg-blue-50/30 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50/60 transition-colors">
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-1">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-blue-600">Upload Photo</span>
                    <span className="text-[10px] text-slate-400 font-medium">JPG, PNG (Max 2MB)</span>
                  </label>
                </div>
              </div>
            )}

            {/* STEP 2: CAPACITY & FLOOR */}
            {activeStep === 2 && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-900">Capacity & Ward Setup</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Floor & Room Number <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      maxLength={50}
                      value={floor}
                      onChange={(e) => {
                        setFloor(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, floor: '' }));
                      }}
                      placeholder="e.g. 1st Floor - 104"
                      className={`w-full px-3.5 py-2.5 bg-slate-50/60 border ${fieldErrors.floor ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Max length: 50</p>
                    {fieldErrors.floor && <p className="text-[11px] font-bold text-rose-500 mt-1">{fieldErrors.floor}</p>}
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Sub-Units / Departments Count</label>
                    <input
                      type="number"
                      value={unitsCount}
                      onChange={(e) => setUnitsCount(Number(e.target.value))}
                      placeholder="e.g. 12"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Total Bed Capacity <span className="text-rose-500">*</span></label>
                    <input
                      type="number"
                      value={beds}
                      onChange={(e) => {
                        setBeds(Number(e.target.value));
                        setFieldErrors((prev) => ({ ...prev, beds: '' }));
                      }}
                      placeholder="e.g. 30"
                      className={`w-full px-3.5 py-2.5 bg-slate-50/60 border ${fieldErrors.beds ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {fieldErrors.beds && <p className="text-[11px] font-bold text-rose-500 mt-1">{fieldErrors.beds}</p>}
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Currently Occupied Beds</label>
                    <input
                      type="number"
                      value={occupiedBeds}
                      onChange={(e) => setOccupiedBeds(Number(e.target.value))}
                      placeholder="e.g. 24"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Occupancy Rate (%)</label>
                    <input
                      type="text"
                      value={occupancyRate}
                      readOnly
                      className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-blue-700 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: OPERATIONAL STATUS */}
            {activeStep === 3 && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-900">Status & Priority Settings</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Operational Status <span className="text-rose-500">*</span></label>
                    <select
                      value={status}
                      onChange={(e) => {
                        setStatus(e.target.value as any);
                        setFieldErrors((prev) => ({ ...prev, status: '' }));
                      }}
                      className={`w-full px-3.5 py-2.5 bg-slate-50/60 border ${fieldErrors.status ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="">Select Operational Status</option>
                      <option value="Active">Active</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                    {fieldErrors.status && <p className="text-[11px] font-bold text-rose-500 mt-1">{fieldErrors.status}</p>}
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Attention Priority Level <span className="text-rose-500">*</span></label>
                    <select
                      value={attentionPriority}
                      onChange={(e) => {
                        setAttentionPriority(e.target.value as any);
                        setFieldErrors((prev) => ({ ...prev, attentionPriority: '' }));
                      }}
                      className={`w-full px-3.5 py-2.5 bg-slate-50/60 border ${fieldErrors.attentionPriority ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="">Select Attention Priority</option>
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="High">High Priority</option>
                      <option value="Critical">Critical Priority</option>
                    </select>
                    {fieldErrors.attentionPriority && <p className="text-[11px] font-bold text-rose-500 mt-1">{fieldErrors.attentionPriority}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Station Contact Phone</label>
                    <input
                      type="text"
                      maxLength={30}
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, phone: '' }));
                      }}
                      placeholder="e.g. (512) 555-0199"
                      className={`w-full px-3.5 py-2.5 bg-slate-50/60 border ${fieldErrors.phone ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Max length: 30</p>
                    {fieldErrors.phone && <p className="text-[11px] font-bold text-rose-500 mt-1">{fieldErrors.phone}</p>}
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Station Contact Email</label>
                    <input
                      type="email"
                      maxLength={30}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, email: '' }));
                      }}
                      placeholder="e.g. unit@connectedcare.com"
                      className={`w-full px-3.5 py-2.5 bg-slate-50/60 border ${fieldErrors.email ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Max length: 30</p>
                    {fieldErrors.email && <p className="text-[11px] font-bold text-rose-500 mt-1">{fieldErrors.email}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: SERVICES & EQUIPMENT */}
            {activeStep === 4 && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-900">Services & Installed Equipment</h3>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Clinical Services Offered</label>
                  <textarea
                    value={services}
                    maxLength={500}
                    onChange={(e) => setServices(e.target.value)}
                    rows={2}
                    placeholder="e.g. Emergency Care, Telemetry, ICU Oversight"
                    className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Max length: 500</p>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Installed Medical Equipment</label>
                  <textarea
                    value={equipmentInstalled}
                    maxLength={500}
                    onChange={(e) => setEquipmentInstalled(e.target.value)}
                    rows={3}
                    placeholder="e.g. Central Oxygen Pipeline, Telemetry Monitors, Defibrillator"
                    className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Max length: 500</p>
                </div>
              </div>
            )}

            {/* STEP 5: REVIEW & CONFIRM */}
            {activeStep === 5 && (
              <div className="space-y-6 text-xs">
                <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-blue-900">Review Location / Unit Details</h3>
                    <p className="text-[11px] text-blue-700">Please review all information before saving the location.</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-600 text-white font-bold rounded-lg text-xs">
                    Ready to Save
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1">Unit Info</h4>
                    <p><span className="text-slate-400">Unit Name:</span> <strong className="text-slate-900">{name || 'Not provided'}</strong></p>
                    <p><span className="text-slate-400">Unit Code:</span> <strong className="text-slate-900">{code || 'Not provided'}</strong></p>
                    <p><span className="text-slate-400">Location Type:</span> <strong className="text-slate-900">{type}</strong></p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1">Capacity & Status</h4>
                    <p><span className="text-slate-400">Total Beds:</span> <strong className="text-slate-900">{beds} Beds</strong></p>
                    <p><span className="text-slate-400">Floor & Room:</span> <strong className="text-slate-900">{floor}</strong></p>
                    <p><span className="text-slate-400">Status:</span> <strong className="text-slate-900">{status}</strong></p>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Action Footer */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate('/locations')}
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
                      className="px-5 py-2.5 border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                    >
                      Save & Continue <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
                    >
                      Save & Next
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSubmitLocation}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Saving Location...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" /> Submit & Save Location
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Location Summary Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-6 space-y-6">
            <h3 className="text-sm font-bold text-slate-900">Location Summary</h3>
            <div className="flex flex-col items-center text-center space-y-3 pb-4 border-b border-slate-100">
              <img
                src={avatar}
                alt={name || 'Location'}
                className="h-20 w-20 rounded-2xl object-cover border-4 border-blue-50 shadow-sm"
              />
              <div>
                <h4 className="text-base font-bold text-slate-900">{name || '—'}</h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{code || '—'}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Facility</span>
                <span className="font-bold text-slate-800">{facility}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Type</span>
                <span className="font-bold text-slate-800">{type}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Floor</span>
                <span className="font-bold text-slate-800">{floor}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Capacity</span>
                <span className="font-bold text-blue-700">{beds} Beds</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400 font-medium">Status</span>
                <span className={`font-bold ${status === 'Active' ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

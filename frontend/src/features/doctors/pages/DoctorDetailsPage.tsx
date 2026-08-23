import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Stethoscope,
  Building2,
  MapPin,
  Phone,
  Mail,
  Award,
  Edit2,
  Printer,
  ChevronLeft,
  User,
  ShieldCheck,
  Clock,
  Users,
  FileText,
  Plus,
  ArrowRight,
  Loader2,
  Lock,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';

export const DoctorDetailsPage: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<any>(null);
  const [assignedPatients, setAssignedPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');

  // Notes state
  const [notesList, setNotesList] = useState<any[]>([
    { id: 1, author: 'Dr. Michael Brown', date: 'May 20, 2024 09:30 AM', text: 'Scheduled for cardiology grand rounds presentation this Thursday.' },
    { id: 2, author: 'Admin Staff', date: 'May 18, 2024 02:15 PM', text: 'Medical license renewal documentation confirmed and filed.' },
  ]);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    if (doctorId) {
      setIsLoading(true);
      api.getDoctorById(doctorId)
        .then((docData) => {
          setDoctor(docData);
          if (docData) {
            // Fetch patients assigned to this doctor
            api.getPatients()
              .then((pList) => {
                if (pList && pList.length > 0) {
                  const filtered = pList.filter(
                    (p: any) =>
                      p.primaryDoctorId === docData.id ||
                      p.primaryDoctorId === docData.doctorIdCode ||
                      p.primaryDoctorName === docData.name
                  );
                  setAssignedPatients(filtered);
                }
              })
              .catch(console.error);
          }
        })
        .catch((err) => console.error('Failed to load doctor profile:', err))
        .finally(() => setIsLoading(false));
    }
  }, [doctorId]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const noteObj = {
      id: Date.now(),
      author: 'Admin User',
      date: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      text: newNote.trim(),
    };
    setNotesList([noteObj, ...notesList]);
    setNewNote('');
  };

  const getStatusBadge = (statusVal: any) => {
    if (statusVal === 0 || statusVal === 'Active' || statusVal === 'active') {
      return <Badge variant="active">Active</Badge>;
    }
    if (statusVal === 1 || statusVal === 'OnLeave' || statusVal === 'On Leave') {
      return <Badge variant="on-leave">On Leave</Badge>;
    }
    return <Badge variant="inactive">Inactive</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-[450px] flex items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-600 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <Loader2 className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin text-indigo-600" />
          <span>Loading Complete Doctor Profile...</span>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 text-center font-sans space-y-4 shadow-sm">
        <Stethoscope className="h-12 w-12 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Doctor Not Found</h2>
        <p className="text-xs text-slate-500">The requested doctor record could not be found or has been removed.</p>
        <button
          onClick={() => navigate('/doctors')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition-colors inline-flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" /> Return to Doctors Directory
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'Overview', label: 'Overview & Personal Info' },
    { id: 'Credentials', label: 'Professional & Credentials' },
    { id: 'Contact', label: 'Contact & Location' },
    { id: 'Patients', label: `Assigned Patients (${assignedPatients.length})` },
    { id: 'Schedule', label: 'Notes & Activity Logs' },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans pb-12">
      {/* Header */}
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <span>{doctor.name}</span>
            {getStatusBadge(doctor.status)}
          </div>
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Doctors', href: '/doctors' },
          { label: doctor.name },
        ]}
        actions={
          <>
            <button
              onClick={() => navigate('/doctors')}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> Back to Directory
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              <Printer className="h-4 w-4" /> Print Profile
            </button>
            <button
              onClick={() => navigate(`/doctors/edit/${doctor.id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 transition-colors"
            >
              <Edit2 className="h-4 w-4" /> Edit Doctor Profile
            </button>
          </>
        }
      />

      {/* Top Profile Summary Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-6">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6">
          {/* Left Avatar & Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <img
              src={doctor.avatar || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80"}
              alt={doctor.name}
              className="h-24 w-24 rounded-full object-cover border-4 border-indigo-50 shadow-md shrink-0"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl font-bold text-slate-900">{doctor.name}</h1>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                  {doctor.doctorIdCode || doctor.id}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-semibold text-xs">
                  <span>{doctor.specialtyIcon || '🩺'}</span> {doctor.specialty}
                </span>
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" /> {doctor.department || 'Clinical Unit'}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" /> {doctor.location || 'Main Floor'}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-slate-400" /> {doctor.phone || '(512) 555-0100'}
                </span>
                <span className="flex items-center gap-1 text-indigo-600">
                  <Mail className="h-3.5 w-3.5" /> {doctor.email || 'doctor@ccare.com'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
              <p className="text-[10px] text-slate-400 font-medium">Assigned Patients</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">{assignedPatients.length}</h3>
              <p className="text-[10px] text-emerald-600 font-semibold mt-1">Active Patients</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
              <p className="text-[10px] text-slate-400 font-medium">Clinical Experience</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">{doctor.experience || '10 Yrs'}</h3>
              <p className="text-[10px] text-indigo-600 font-semibold mt-1">Senior Specialist</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
              <p className="text-[10px] text-slate-400 font-medium">Teleconsultation</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                {doctor.teleconsultationEnabled ? 'Enabled' : 'Disabled'}
              </h3>
              <p className="text-[10px] text-cyan-600 font-semibold mt-1">Virtual Care</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
              <p className="text-[10px] text-slate-400 font-medium">System Status</p>
              <div className="mt-1.5 flex justify-center">{getStatusBadge(doctor.status)}</div>
              <p className="text-[10px] text-slate-400 font-medium mt-1">On Service</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-2 overflow-x-auto">
        <div className="flex items-center min-w-max gap-2">
          {tabs.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT SECTIONS */}

      {/* TAB 1: OVERVIEW & PERSONAL INFO */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Profile Details Card */}
            <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-indigo-600" /> Personal Profile Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                  <p className="text-slate-400 font-medium">Full Name</p>
                  <p className="font-bold text-slate-900 mt-0.5">{doctor.name}</p>
                </div>
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                  <p className="text-slate-400 font-medium">Gender & Date of Birth</p>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {doctor.gender || 'Not specified'} {doctor.dob ? `/ ${doctor.dob}` : ''}
                  </p>
                </div>
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                  <p className="text-slate-400 font-medium">Marital Status</p>
                  <p className="font-bold text-slate-900 mt-0.5">{doctor.maritalStatus || 'Not specified'}</p>
                </div>
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                  <p className="text-slate-400 font-medium">Blood Group</p>
                  <p className="font-bold text-slate-900 mt-0.5">{doctor.bloodGroup || 'Not specified'}</p>
                </div>
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 sm:col-span-2">
                  <p className="text-slate-400 font-medium">Languages Known</p>
                  <p className="font-bold text-slate-900 mt-0.5">{doctor.languages || 'English'}</p>
                </div>
              </div>
            </div>

            {/* Employment Details Card */}
            <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-indigo-600" /> Hospital Employment Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                  <p className="text-slate-400 font-medium">Department / Speciality</p>
                  <p className="font-bold text-slate-900 mt-0.5">{doctor.specialty || doctor.department || 'Not specified'}</p>
                </div>
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                  <p className="text-slate-400 font-medium">Clinical Role</p>
                  <p className="font-bold text-slate-900 mt-0.5">{doctor.role || 'Physician'}</p>
                </div>
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                  <p className="text-slate-400 font-medium">Employment Type</p>
                  <p className="font-bold text-slate-900 mt-0.5">{doctor.employmentType || 'Full-Time Staff'}</p>
                </div>
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                  <p className="text-slate-400 font-medium">Reporting Manager</p>
                  <p className="font-bold text-slate-900 mt-0.5">{doctor.reportingTo || 'Medical Director'}</p>
                </div>
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                  <p className="text-slate-400 font-medium">Date of Joining</p>
                  <p className="font-bold text-slate-900 mt-0.5">{doctor.dateOfJoining || 'Not specified'}</p>
                </div>
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                  <p className="text-slate-400 font-medium">Practice Unit Location</p>
                  <p className="font-bold text-slate-900 mt-0.5">{doctor.location || 'Main Hospital Building'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar Account Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-indigo-600" /> Account Security Credentials
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">System Username</span>
                  <span className="font-mono font-bold text-slate-900">{doctor.user?.username || doctor.username || doctor.email?.split('@')[0] || 'doc_user'}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Registered Email</span>
                  <span className="font-medium text-indigo-600 truncate max-w-[150px]">{doctor.email}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Phone Number</span>
                  <span className="font-mono font-bold text-slate-800">{doctor.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Status</span>
                  {getStatusBadge(doctor.status)}
                </div>
                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-slate-400 font-medium">Access Level</span>
                  <span className="font-bold text-indigo-600">{doctor.accessLevel || 'Full Clinical Access'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROFESSIONAL & CREDENTIALS */}
      {activeTab === 'Credentials' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Award className="h-4 w-4 text-indigo-600" /> Medical License & Accreditations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium">Medical License Number</p>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{doctor.licenseNumber || 'Not specified'}</p>
              </div>
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium">License Jurisdiction</p>
                <p className="font-bold text-slate-900 mt-0.5">{doctor.licenseState ? `${doctor.licenseState}, USA` : 'USA'}</p>
              </div>
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium">License Expiry Date</p>
                <p className="font-bold text-slate-900 mt-0.5">{doctor.licenseExpiry || 'Not specified'}</p>
              </div>
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium">NPI Registration Number</p>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{doctor.npiNumber || 'Not specified'}</p>
              </div>
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 sm:col-span-2">
                <p className="text-slate-400 font-medium">Medical Education & Alma Mater</p>
                <p className="font-bold text-slate-900 mt-0.5">{doctor.medicalDegree || 'Doctor of Medicine (M.D.)'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Lock className="h-4 w-4 text-indigo-600" /> EHR Access & System Permissions
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="font-bold text-slate-900">EHR Patient Records Access</p>
                  <p className="text-[11px] text-slate-400">View and update patient clinical records</p>
                </div>
                <span className={`px-2.5 py-1 font-bold rounded-lg text-[11px] ${doctor.patientRecordsAccess !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {doctor.patientRecordsAccess !== false ? 'Granted' : 'Restricted'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="font-bold text-slate-900">Digital Prescription Rights</p>
                  <p className="text-[11px] text-slate-400">Authorized e-Signing for medication orders</p>
                </div>
                <span className={`px-2.5 py-1 font-bold rounded-lg text-[11px] ${doctor.prescriptionRights !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {doctor.prescriptionRights !== false ? 'Authorized' : 'Restricted'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="font-bold text-slate-900">Care Plan & Discharge Approval</p>
                  <p className="text-[11px] text-slate-400">Authorized attending signature rights</p>
                </div>
                <span className={`px-2.5 py-1 font-bold rounded-lg text-[11px] ${doctor.carePlanManagement !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {doctor.carePlanManagement !== false ? 'Approved' : 'Restricted'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="font-bold text-slate-900">AI Clinical Diagnostics Copilot</p>
                  <p className="text-[11px] text-slate-400">AI risk scoring & clinical recommendation engine</p>
                </div>
                <span className={`px-2.5 py-1 font-bold rounded-lg text-[11px] ${doctor.aiOperations !== false ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                  {doctor.aiOperations !== false ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONTACT & LOCATION */}
      {activeTab === 'Contact' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-indigo-600" /> Clinic & Residential Address
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium">Practice Unit Location</p>
                <p className="font-bold text-slate-900 mt-0.5">{doctor.location || 'Main Hospital Building'}</p>
              </div>
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium">Street Address</p>
                <p className="font-bold text-slate-900 mt-0.5">{doctor.streetAddress || 'Not provided'}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                  <p className="text-slate-400 font-medium">City</p>
                  <p className="font-bold text-slate-900 mt-0.5">{doctor.city || 'Not specified'}</p>
                </div>
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                  <p className="text-slate-400 font-medium">State</p>
                  <p className="font-bold text-slate-900 mt-0.5">{doctor.state || 'Not specified'}</p>
                </div>
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                  <p className="text-slate-400 font-medium">Zip Code</p>
                  <p className="font-bold text-slate-900 mt-0.5">{doctor.zipCode || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Phone className="h-4 w-4 text-indigo-600" /> Emergency Contact Details
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium">Emergency Contact Name</p>
                <p className="font-bold text-slate-900 mt-0.5">{doctor.emergencyContactName || 'Not provided'}</p>
              </div>
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium">Contact Phone Number</p>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{doctor.emergencyContactPhone || 'Not provided'}</p>
              </div>
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium">Relationship</p>
                <p className="font-bold text-slate-900 mt-0.5">{doctor.emergencyContactRelation || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ASSIGNED PATIENTS */}
      {activeTab === 'Patients' && (
        <div className="bg-white rounded-2xl border border-slate-200 card-shadow overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-600" /> Primary Assigned Patients ({assignedPatients.length})
            </h3>
            <Link
              to="/patients"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View Patients Directory <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {assignedPatients.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">No Patients Assigned Yet</p>
              <p className="text-xs text-slate-400 mt-1">There are currently no active patients assigned to this doctor as primary physician.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Patient</th>
                    <th className="p-3">Age / Gender</th>
                    <th className="p-3">Care Unit</th>
                    <th className="p-3">Risk Level</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assignedPatients.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img src={p.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} alt={p.name} className="h-8 w-8 rounded-full object-cover shrink-0" />
                          <div>
                            <p className="font-bold text-slate-900">{p.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{p.patientIdCode || p.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-medium">{p.ageGender || '45 / Male'}</td>
                      <td className="p-3 font-semibold text-slate-800">{p.careUnit || 'Cardiology Unit'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          p.riskLevel === 'High' ? 'bg-rose-100 text-rose-700' :
                          p.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {p.riskLevel || 'Medium'}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-700">{p.status || 'InCare'}</td>
                      <td className="p-3 text-right">
                        <Link
                          to={`/patients/${p.id}`}
                          className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors inline-block"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: NOTES & SCHEDULE */}
      {activeTab === 'Schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Notes List & Form */}
            <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-600" /> Clinical Notes & Activity History
              </h3>

              <form onSubmit={handleAddNote} className="space-y-3">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Type a new clinical note or schedule update..."
                  rows={3}
                  className="w-full p-3.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" /> Add Note
                  </button>
                </div>
              </form>

              <div className="space-y-3 pt-2">
                {notesList.map((n) => (
                  <div key={n.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span className="font-bold text-slate-700">{n.author}</span>
                      <span>{n.date}</span>
                    </div>
                    <p className="text-slate-800 font-medium mt-1">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-600" /> Shift & Availability Schedule
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                  <p className="font-bold text-indigo-900">Current Assigned Shift</p>
                  <p className="text-xs font-semibold text-indigo-700 mt-0.5">Day Shift (07:00 AM - 03:00 PM)</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <p className="font-bold text-slate-800">Weekly On-Call Days</p>
                  <p className="text-slate-600">Monday, Wednesday, Friday</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

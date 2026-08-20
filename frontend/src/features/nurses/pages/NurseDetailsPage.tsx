import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  UserCog,
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
  FileText,
  Plus,
  Loader2,
  Lock,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';

export const NurseDetailsPage: React.FC = () => {
  const { nurseId } = useParams<{ nurseId: string }>();
  const navigate = useNavigate();

  const [nurse, setNurse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');

  // Notes & Handover state
  const [notesList, setNotesList] = useState<any[]>([
    { id: 1, author: 'Supervisor Nurse Emily', date: 'May 20, 2024 07:45 AM', text: 'Morning vital rounds completed across ER Ward. All patients stable.' },
    { id: 2, author: 'Dr. Michael Brown', date: 'May 19, 2024 04:30 PM', text: 'Assigned to telemetry monitoring oversight for Room 204.' },
  ]);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    if (nurseId) {
      setIsLoading(true);
      api.getNurseById(nurseId)
        .then((nurseData) => {
          setNurse(nurseData);
        })
        .catch((err) => console.error('Failed to load nurse profile:', err))
        .finally(() => setIsLoading(false));
    }
  }, [nurseId]);

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
          <span>Loading Complete Nurse Profile...</span>
        </div>
      </div>
    );
  }

  if (!nurse) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 text-center font-sans space-y-4 shadow-sm">
        <UserCog className="h-12 w-12 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Nurse Not Found</h2>
        <p className="text-xs text-slate-500">The requested nurse record could not be found or has been removed.</p>
        <button
          onClick={() => navigate('/nurses')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition-colors inline-flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" /> Return to Nurses Directory
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'Overview', label: 'Overview & Personal Info' },
    { id: 'Credentials', label: 'Professional & Licenses' },
    { id: 'Contact', label: 'Contact & Location' },
    { id: 'Schedule', label: 'Notes & Shift Handovers' },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans pb-12">
      {/* Header */}
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <span>{nurse.name}</span>
            {getStatusBadge(nurse.status)}
          </div>
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Nurses', href: '/nurses' },
          { label: nurse.name },
        ]}
        actions={
          <>
            <button
              onClick={() => navigate('/nurses')}
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
              onClick={() => navigate(`/nurses/edit/${nurse.id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 transition-colors"
            >
              <Edit2 className="h-4 w-4" /> Edit Nurse Profile
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
              src={nurse.avatar || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80"}
              alt={nurse.name}
              className="h-24 w-24 rounded-full object-cover border-4 border-indigo-50 shadow-md shrink-0"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl font-bold text-slate-900">{nurse.name}</h1>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                  {nurse.nurseIdCode || nurse.id}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-semibold text-xs">
                  <span>👩‍⚕️</span> Nurse Practitioner
                </span>
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" /> {nurse.department || 'Emergency Care'}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" /> {nurse.location || 'ER Unit (Ground Floor)'}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-slate-400" /> {nurse.phone || '(512) 555-0299'}
                </span>
                <span className="flex items-center gap-1 text-indigo-600">
                  <Mail className="h-3.5 w-3.5" /> {nurse.email || 'nurse@ccare.com'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
              <p className="text-[10px] text-slate-400 font-medium">Assigned Shift</p>
              <h3 className="text-xs font-bold text-indigo-700 mt-1">{nurse.shift || 'Day Shift'}</h3>
              <p className="text-[10px] text-slate-500 mt-1">08:00 AM - 04:00 PM</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
              <p className="text-[10px] text-slate-400 font-medium">Experience</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">{nurse.experience || '5 Yrs'}</h3>
              <p className="text-[10px] text-emerald-600 font-semibold mt-1">Certified RN</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
              <p className="text-[10px] text-slate-400 font-medium">Sub-Unit</p>
              <h3 className="text-xs font-bold text-slate-900 mt-1 truncate max-w-[100px] mx-auto">{nurse.subUnit || 'ER Unit'}</h3>
              <p className="text-[10px] text-cyan-600 font-semibold mt-1">Clinical Ward</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
              <p className="text-[10px] text-slate-400 font-medium">Status</p>
              <div className="mt-1.5 flex justify-center">{getStatusBadge(nurse.status)}</div>
              <p className="text-[10px] text-slate-400 font-medium mt-1">Active Duty</p>
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
            {/* Personal Details */}
            <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-indigo-600" /> Personal Profile Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                  <p className="text-slate-400 font-medium">Full Name</p>
                  <p className="font-bold text-slate-900 mt-0.5">{nurse.name}</p>
                </div>
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                  <p className="text-slate-400 font-medium">Gender & Date of Birth</p>
                  <p className="font-bold text-slate-900 mt-0.5">Female / 22 Sep 1990 (34 Yrs)</p>
                </div>
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                  <p className="text-slate-400 font-medium">Marital Status</p>
                  <p className="font-bold text-slate-900 mt-0.5">Single</p>
                </div>
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                  <p className="text-slate-400 font-medium">Blood Group</p>
                  <p className="font-bold text-slate-900 mt-0.5">A Positive (A+)</p>
                </div>
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 sm:col-span-2">
                  <p className="text-slate-400 font-medium">Languages Known</p>
                  <p className="font-bold text-slate-900 mt-0.5">English, Spanish</p>
                </div>
              </div>
            </div>

            {/* Employment Details */}
            <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-indigo-600" /> Department & Unit Employment
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                  <p className="text-slate-400 font-medium">Department</p>
                  <p className="font-bold text-slate-900 mt-0.5">{nurse.department || 'Emergency Care'}</p>
                </div>
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                  <p className="text-slate-400 font-medium">Assigned Sub-Unit</p>
                  <p className="font-bold text-slate-900 mt-0.5">{nurse.subUnit || nurse.assignedUnit || 'ER Unit'}</p>
                </div>
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                  <p className="text-slate-400 font-medium">Clinical Role</p>
                  <p className="font-bold text-slate-900 mt-0.5">Registered Nurse (RN)</p>
                </div>
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                  <p className="text-slate-400 font-medium">Shift Schedule</p>
                  <p className="font-bold text-slate-900 mt-0.5">{nurse.shift || 'Day Shift'}</p>
                </div>
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                  <p className="text-slate-400 font-medium">Reporting To</p>
                  <p className="font-bold text-slate-900 mt-0.5">Head Nurse</p>
                </div>
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                  <p className="text-slate-400 font-medium">Date of Joining</p>
                  <p className="font-bold text-slate-900 mt-0.5">15 Mar 2021</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-indigo-600" /> Account Security Credentials
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Nurse ID Code</span>
                  <span className="font-mono font-bold text-slate-900">{nurse.nurseIdCode || nurse.id}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Registered Email</span>
                  <span className="font-medium text-indigo-600 truncate max-w-[150px]">{nurse.email}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Mobile Phone</span>
                  <span className="font-mono font-bold text-slate-800">{nurse.phone}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Status</span>
                  {getStatusBadge(nurse.status)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROFESSIONAL & LICENSES */}
      {activeTab === 'Credentials' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Award className="h-4 w-4 text-indigo-600" /> Nursing License & Certifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium">Nursing License Number</p>
                <p className="font-mono font-bold text-slate-900 mt-0.5">RN-54321098</p>
              </div>
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium">Licensing State</p>
                <p className="font-bold text-slate-900 mt-0.5">Texas Board of Nursing, USA</p>
              </div>
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium">License Expiry Date</p>
                <p className="font-bold text-slate-900 mt-0.5">30 Jun 2026</p>
              </div>
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium">Certifications</p>
                <p className="font-bold text-emerald-700 mt-0.5">BLS, ACLS, PALS Certified</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Lock className="h-4 w-4 text-indigo-600" /> EHR Permissions & Access Rights
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="font-bold text-slate-900">Care Plan & Discharge Checklist Updates</p>
                  <p className="text-[11px] text-slate-400">Updating nursing charts & discharge tasks</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 font-bold rounded-lg text-[11px]">Granted</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="font-bold text-slate-900">Vital Signs & Monitoring Log Entry</p>
                  <p className="text-[11px] text-slate-400">Recording telemetry & blood pressure rounds</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 font-bold rounded-lg text-[11px]">Authorized</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="font-bold text-slate-900">Medication MAR Logging</p>
                  <p className="text-[11px] text-slate-400">Logging administered medication dosages</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 font-bold rounded-lg text-[11px]">Authorized</span>
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
              <MapPin className="h-4 w-4 text-indigo-600" /> Practice Location & Address
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium">Assigned Hospital Ward</p>
                <p className="font-bold text-slate-900 mt-0.5">{nurse.location || 'ER Unit (Ground Floor)'}</p>
              </div>
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium">Street Address</p>
                <p className="font-bold text-slate-900 mt-0.5">500 Medical Center Blvd, Apt 12</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                  <p className="text-slate-400 font-medium">City</p>
                  <p className="font-bold text-slate-900 mt-0.5">Austin</p>
                </div>
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                  <p className="text-slate-400 font-medium">State</p>
                  <p className="font-bold text-slate-900 mt-0.5">Texas</p>
                </div>
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                  <p className="text-slate-400 font-medium">Zip Code</p>
                  <p className="font-bold text-slate-900 mt-0.5">78702</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Phone className="h-4 w-4 text-indigo-600" /> Emergency Contact
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium">Emergency Contact Name</p>
                <p className="font-bold text-slate-900 mt-0.5">Robert Miller</p>
              </div>
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium">Contact Phone Number</p>
                <p className="font-mono font-bold text-slate-900 mt-0.5">(512) 555-8833</p>
              </div>
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium">Relationship</p>
                <p className="font-bold text-slate-900 mt-0.5">Parent</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: NOTES & SHIFT LOGS */}
      {activeTab === 'Schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-600" /> Shift Handovers & Nursing Notes
              </h3>

              <form onSubmit={handleAddNote} className="space-y-3">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record a shift handover note or vital round report..."
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
                <Clock className="h-4 w-4 text-indigo-600" /> Shift Roster Schedule
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                  <p className="font-bold text-indigo-900">Current Assigned Shift</p>
                  <p className="text-xs font-semibold text-indigo-700 mt-0.5">{nurse.shift || 'Day Shift (08:00 AM - 04:00 PM)'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <p className="font-bold text-slate-800">Weekly Duty Days</p>
                  <p className="text-slate-600">Monday through Friday</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

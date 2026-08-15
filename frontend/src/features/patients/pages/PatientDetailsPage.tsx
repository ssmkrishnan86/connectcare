import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Share2, Printer, Edit, Star, AlertTriangle, Plus, Calendar, CheckSquare, MessageSquare } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';

export const PatientDetailsPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [patient, setPatient] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    if (patientId) {
      api.getPatientById(patientId)
        .then((data) => setPatient(data))
        .catch(() => {
          // If ID not found by code, try fetching default or fallback
          api.getPatients()
            .then((list) => {
              if (list && list.length > 0) setPatient(list[0]);
            });
        });
    }
  }, [patientId]);

  const displayPatient = patient || {
    id: patientId || 'P-0001',
    patientIdCode: 'P-0001',
    name: 'Robert Johnson',
    mrn: 'MRN-002344',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    ageGender: '67 / Male',
    dob: 'Oct 12, 1956',
    phone: '(512) 555-2458',
    email: 'robert.j@email.com',
    address: '452 Elm Street, Austin, TX 78702',
    careUnit: 'Cardiology Unit',
    floorRoom: '3rd Floor - 301',
    primaryDoctorName: 'Dr. Sarah Wilson',
    primaryDoctorSpecialty: 'Emergency Medicine',
    primaryDoctorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    status: 'In Care',
    riskLevel: 'High',
    admissionDate: 'Apr 15, 2024',
    careDays: 35,
    dischargePlan: 'Scheduled for May 24',
    bloodPressure: '130/85 mmHg',
    heartRate: '78 bpm',
    bloodSugar: '115 mg/dL',
    temperature: '98.4 °F',
    spO2: '97 %',
  };

  const tabs = [
    'Overview',
    'Medical Information',
    'Health Records',
    'Medications',
    'Care Plan',
    'Vitals & Trends',
    'Documents',
    'Appointments',
    'Tasks & Notes',
    'History',
  ];

  const docName = displayPatient.primaryDoctorName || displayPatient.primaryDoctor?.name || 'Dr. Sarah Wilson';
  const docAvatar = displayPatient.primaryDoctorAvatar || displayPatient.primaryDoctor?.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80';
  const docSpecialty = displayPatient.primaryDoctorSpecialty || displayPatient.primaryDoctor?.specialty || 'Emergency Medicine';

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="Patient Profile"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Patients', href: '/patients' },
          { label: 'Patient List', href: '/patients' },
          { label: 'Patient Profile' },
        ]}
        actions={
          <>
            <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold">
              <Share2 className="h-4 w-4" /> Share Profile
            </button>
            <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold">
              <Printer className="h-4 w-4" /> Print
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20">
              <Edit className="h-4 w-4" /> Edit Patient
            </button>
          </>
        }
      />

      {/* Patient Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 card-shadow flex flex-col lg:flex-row gap-6 justify-between">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="relative">
            <img src={displayPatient.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"} alt={displayPatient.name} className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md" />
            <span className="absolute bottom-0 right-0 p-1 bg-emerald-500 text-white rounded-full border-2 border-white">
              <Badge variant="in-care" className="px-1.5 py-0 text-[10px] bg-emerald-500 text-white border-none">
                In Care
              </Badge>
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-900">{displayPatient.name}</h2>
              <Star className="h-4 w-4 fill-amber-400 text-amber-400 cursor-pointer" />
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
              <span>Patient ID: <strong className="text-slate-800">{displayPatient.patientIdCode || displayPatient.id}</strong></span>
              <span>MRN: <strong className="text-slate-800">{displayPatient.mrn}</strong></span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 pt-2 text-xs text-slate-600">
              <div><span className="text-slate-400">Age / Gender:</span> <p className="font-semibold text-slate-800">{displayPatient.ageGender || "67 / Male"}</p></div>
              <div><span className="text-slate-400">Date of Birth:</span> <p className="font-semibold text-slate-800">{displayPatient.dob || "Oct 12, 1956"}</p></div>
              <div><span className="text-slate-400">Phone:</span> <p className="font-semibold text-slate-800">{displayPatient.phone}</p></div>
              <div><span className="text-slate-400">Email:</span> <p className="font-semibold text-slate-800">{displayPatient.email}</p></div>
            </div>

            <div className="pt-1 text-xs text-slate-600">
              <span className="text-slate-400">Address:</span> <span className="font-medium text-slate-800">{displayPatient.address || "452 Elm Street, Austin, TX 78702"}</span>
            </div>
            <div className="text-xs text-slate-600">
              <span className="text-slate-400">Primary Care Unit:</span> <span className="font-semibold text-blue-600">{displayPatient.careUnit}, {displayPatient.floorRoom}</span>
            </div>
          </div>
        </div>

        {/* Right Info Cards */}
        <div className="flex flex-wrap lg:flex-nowrap gap-3 shrink-0">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 min-w-[140px]">
            <p className="text-[10px] font-semibold text-slate-400 uppercase">Primary Doctor</p>
            <div className="flex items-center gap-2 pt-1">
              <img src={docAvatar} alt={docName} className="h-7 w-7 rounded-full object-cover" />
              <div>
                <p className="font-bold text-slate-900 leading-tight">{docName}</p>
                <p className="text-[10px] text-slate-500">{docSpecialty}</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 min-w-[120px]">
            <p className="text-[10px] font-semibold text-slate-400 uppercase">Risk Level</p>
            <Badge variant="high" className="mt-1">{displayPatient.riskLevel || "High"}</Badge>
            <p className="text-[10px] text-slate-400 pt-1">Last assessed: May 18, 2024</p>
          </div>

          <div className="p-3 bg-red-50/50 border border-red-200 rounded-xl text-xs space-y-1 min-w-[160px]">
            <div className="flex items-center gap-1 text-red-600 font-bold text-[11px]">
              <AlertTriangle className="h-3.5 w-3.5" /> Allergies
            </div>
            <p className="font-semibold text-slate-800 pt-1">Penicillin, Sulfa drugs</p>
            <p className="text-[10px] text-slate-500">+2 more</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 bg-white rounded-xl p-1 card-shadow">
        <div className="flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Area (Overview) */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1 */}
          <div className="space-y-6">
            {/* Recent Vitals */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900">Recent Vitals</h3>
                <button className="text-xs font-semibold text-blue-600">View All</button>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                  <span className="text-slate-600 font-medium">Blood Pressure</span>
                  <span className="font-bold text-slate-900">{displayPatient.bloodPressure || "120/80 mmHg"}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                  <span className="text-slate-600 font-medium">Heart Rate</span>
                  <span className="font-bold text-slate-900">{displayPatient.heartRate || "72 bpm"}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                  <span className="text-slate-600 font-medium">Blood Sugar</span>
                  <span className="font-bold text-slate-900">{displayPatient.bloodSugar || "110 mg/dL"}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                  <span className="text-slate-600 font-medium">Temperature</span>
                  <span className="font-bold text-slate-900">{displayPatient.temperature || "98.6 °F"}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                  <span className="text-slate-600 font-medium">SpO2</span>
                  <span className="font-bold text-slate-900">{displayPatient.spO2 || "98 %"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-6">
            {/* Status Information */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow space-y-3 text-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Hospital Status Details</h3>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-slate-500 font-medium">Admission Date</span>
                <span className="font-semibold text-slate-800">{displayPatient.admissionDate || "Apr 15, 2024"}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-slate-500 font-medium">Care Days</span>
                <span className="font-semibold text-slate-800">{displayPatient.careDays || 35} Days</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-slate-500 font-medium">Discharge Plan</span>
                <span className="font-semibold text-slate-800">{displayPatient.dischargePlan || "Scheduled"}</span>
              </div>
            </div>
          </div>

          {/* Column 3 */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Quick Actions</h3>
              <div className="space-y-2 text-xs">
                <button className="w-full flex items-center gap-3 p-2.5 border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors">
                  <Plus className="h-4 w-4 text-blue-600" /> Add New Note
                </button>
                <button className="w-full flex items-center gap-3 p-2.5 border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors">
                  <Calendar className="h-4 w-4 text-blue-600" /> Schedule Appointment
                </button>
                <button className="w-full flex items-center gap-3 p-2.5 border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors">
                  <CheckSquare className="h-4 w-4 text-blue-600" /> Create Task
                </button>
                <button className="w-full flex items-center gap-3 p-2.5 border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors">
                  <MessageSquare className="h-4 w-4 text-blue-600" /> Send Message to Care Team
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetailsPage;

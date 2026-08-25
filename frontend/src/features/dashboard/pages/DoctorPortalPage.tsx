import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  AlertCircle,
  ClipboardCheck,
  ArrowUpRight,
  ArrowDownRight,
  Send,
  Search,
  RefreshCw,
  Clock,
  Sparkles,
  CheckCircle2,
  Activity,
  Heart,
  Loader2
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useAuth } from '@/features/auth/context/AuthContext';
import { api } from '@/lib/api';

export const DoctorPortalPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTrendTab, setActiveTrendTab] = useState('Overview');

  // AI Assistant State
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponses, setAiResponses] = useState<Array<{ prompt: string; response: string; time: string }>>([]);

  const doctorName = useMemo(() => {
    if (!user?.username) return 'Dr. Sarah Wilson';
    const name = user.username;
    if (name.toLowerCase().startsWith('dr.')) return name;
    return `Dr. ${name.charAt(0).toUpperCase() + name.slice(1)}`;
  }, [user]);

  const todayFormattedDate = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date());
  }, []);

  const loadDoctorOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDoctorOverview(doctorName);
      setData(res);
    } catch (err: any) {
      console.error('Failed to load doctor dashboard data:', err);
      setError(err?.message || 'Failed to load live doctor dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctorOverview();
  }, [doctorName]);

  const handleAiSubmit = async (queryText?: string) => {
    const promptToSubmit = (queryText || aiQuery).trim();
    if (!promptToSubmit || aiLoading) return;

    try {
      setAiLoading(true);
      const res = await api.postDoctorAiAssistant({
        doctorName: doctorName,
        promptQuery: promptToSubmit,
        patientName: data?.myPatients?.[0]?.name || 'Patient',
        patientIdCode: data?.myPatients?.[0]?.patientIdCode || 'PT-001',
        category: 'Clinical Analysis'
      });

      const responseText = res?.data?.aiResponse || res?.aiResponse || 'Analysis completed based on current database records.';
      setAiResponses((prev) => [
        {
          prompt: promptToSubmit,
          response: responseText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        ...prev
      ]);
      setAiQuery('');
    } catch (err: any) {
      console.error('AI assistant error:', err);
      setAiResponses((prev) => [
        {
          prompt: promptToSubmit,
          response: 'Could not process request at this time. Please ensure the database service is running.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        ...prev
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // Live filtered data based on search input
  const filteredSchedule = useMemo(() => {
    if (!data?.todaySchedule) return [];
    if (!searchQuery.trim()) return data.todaySchedule;
    const q = searchQuery.toLowerCase();
    return data.todaySchedule.filter(
      (s: any) =>
        s.name?.toLowerCase().includes(q) ||
        s.type?.toLowerCase().includes(q) ||
        s.status?.toLowerCase().includes(q)
    );
  }, [data?.todaySchedule, searchQuery]);

  const filteredCriticalPatients = useMemo(() => {
    if (!data?.criticalPatients) return [];
    if (!searchQuery.trim()) return data.criticalPatients;
    const q = searchQuery.toLowerCase();
    return data.criticalPatients.filter(
      (p: any) =>
        p.name?.toLowerCase().includes(q) ||
        p.condition?.toLowerCase().includes(q) ||
        p.severity?.toLowerCase().includes(q)
    );
  }, [data?.criticalPatients, searchQuery]);

  const filteredPatients = useMemo(() => {
    if (!data?.myPatients) return [];
    if (!searchQuery.trim()) return data.myPatients;
    const q = searchQuery.toLowerCase();
    return data.myPatients.filter(
      (p: any) =>
        p.name?.toLowerCase().includes(q) ||
        p.cond?.toLowerCase().includes(q) ||
        p.status?.toLowerCase().includes(q) ||
        p.patientIdCode?.toLowerCase().includes(q)
    );
  }, [data?.myPatients, searchQuery]);

  const filteredTasks = useMemo(() => {
    if (!data?.tasks) return [];
    if (!searchQuery.trim()) return data.tasks;
    const q = searchQuery.toLowerCase();
    return data.tasks.filter(
      (t: any) =>
        t.title?.toLowerCase().includes(q) ||
        t.prio?.toLowerCase().includes(q) ||
        t.due?.toLowerCase().includes(q)
    );
  }, [data?.tasks, searchQuery]);

  const filteredAlerts = useMemo(() => {
    if (!data?.alerts) return [];
    if (!searchQuery.trim()) return data.alerts;
    const q = searchQuery.toLowerCase();
    return data.alerts.filter((a: any) => a.msg?.toLowerCase().includes(q));
  }, [data?.alerts, searchQuery]);

  const filteredConsultations = useMemo(() => {
    if (!data?.recentConsultations) return [];
    if (!searchQuery.trim()) return data.recentConsultations;
    const q = searchQuery.toLowerCase();
    return data.recentConsultations.filter(
      (c: any) => c.name?.toLowerCase().includes(q) || c.note?.toLowerCase().includes(q)
    );
  }, [data?.recentConsultations, searchQuery]);

  const metrics = data?.metrics || {
    todayAppointments: 0,
    todayAppointmentsDiff: 0,
    totalPatients: 0,
    newPatientsThisWeek: 0,
    criticalAlerts: 0,
    pendingReviews: 0,
    pendingReviewsDiff: 0
  };

  const vitalsSummary = data?.vitalsSummary || {
    avgSystolic: '--',
    avgDiastolic: '--',
    avgHeartRate: '--',
    avgSpO2: '--'
  };

  const vitalsTrendData = data?.vitalsTrendData || [];

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading live doctor dashboard data from database...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-3 max-w-lg mx-auto my-12">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-sm font-bold text-rose-900">Database Connection Error</h3>
        <p className="text-xs text-rose-600">{error}</p>
        <button
          onClick={loadDoctorOverview}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-sans antialiased text-slate-800">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Good Morning, {doctorName} <span className="animate-bounce">👋</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            {todayFormattedDate} • Live Real-time Database Overview
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patients, appointments, tasks..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-2xs transition-all"
            />
          </div>

          <button
            onClick={loadDoctorOverview}
            disabled={loading}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
            title="Refresh Live Data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Top 4 Live Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Today's Appointments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Today's Appointments</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">{metrics.todayAppointments}</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>
                {metrics.todayAppointmentsDiff >= 0
                  ? `+${metrics.todayAppointmentsDiff} from yesterday`
                  : `${metrics.todayAppointmentsDiff} from yesterday`}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Patients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Patients</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">{metrics.totalPatients}</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 mt-1">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>{metrics.newPatientsThisWeek} new this week</span>
            </div>
          </div>
        </div>

        {/* Card 3: Critical Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Critical Alerts</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">{metrics.criticalAlerts}</div>
            <div className={`flex items-center gap-1 text-[11px] font-bold mt-1 ${metrics.criticalAlerts > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              <span>{metrics.criticalAlerts > 0 ? 'Requires immediate attention' : 'All clear in database'}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Pending Reviews */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Reviews</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ClipboardCheck className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">{metrics.pendingReviews}</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1">
              <ArrowDownRight className="h-3.5 w-3.5 text-emerald-600" />
              <span>
                {metrics.pendingReviewsDiff >= 0
                  ? `+${metrics.pendingReviewsDiff} from yesterday`
                  : `${metrics.pendingReviewsDiff} from yesterday`}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Middle Section: Schedule & Critical Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Today's Schedule */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Today's Schedule
            </h2>
            <button
              onClick={() => navigate('/consultations')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
            >
              View Full Schedule
            </button>
          </div>

          <div className="space-y-3 min-h-[220px]">
            {filteredSchedule.length > 0 ? (
              filteredSchedule.map((slot: any, idx: number) => (
                <div key={slot.id || idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500 w-24 truncate">{slot.time}</span>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{slot.name}</p>
                      <p className="text-[10px] text-slate-500">
                        {slot.type} {slot.assignedNurse ? `• Nurse: ${slot.assignedNurse}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${slot.color || 'bg-blue-50 text-blue-700'}`}>
                    {slot.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400 space-y-1">
                <Calendar className="w-8 h-8 stroke-1 text-slate-300" />
                <p className="text-xs font-semibold">No appointments scheduled for today</p>
                <p className="text-[10px]">New appointments will appear here automatically.</p>
              </div>
            )}
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={() => navigate('/consultations')}
              className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              View All Schedule & Consultations
            </button>
          </div>
        </div>

        {/* Critical Patients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              Critical Patients
            </h2>
            <button
              onClick={() => navigate('/patients')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
            >
              View All ({filteredCriticalPatients.length})
            </button>
          </div>

          <div className="space-y-3 min-h-[220px]">
            {filteredCriticalPatients.length > 0 ? (
              filteredCriticalPatients.map((pat: any, idx: number) => (
                <div key={pat.id || idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 uppercase">
                      {pat.name ? pat.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2) : 'PT'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{pat.name}</p>
                      <p className="text-[10px] text-slate-500">{pat.condition}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${pat.color || 'bg-rose-500 text-white'}`}>
                    {pat.severity}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400 space-y-1">
                <CheckCircle2 className="w-8 h-8 stroke-1 text-emerald-400" />
                <p className="text-xs font-semibold text-slate-600">No high risk patients</p>
                <p className="text-[10px]">All patients are currently stable.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Vitals Trends & My Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Vitals Trends Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              Vitals Trends
            </h2>
            <span className="text-xs text-slate-400 font-medium">Last 7 Days (Database)</span>
          </div>

          <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2 overflow-x-auto">
            {['Overview', 'Blood Pressure', 'Heart Rate', 'SpO2', 'Temperature'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTrendTab(tab)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all shrink-0 cursor-pointer ${
                  activeTrendTab === tab
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="h-44 w-full pt-2">
            {vitalsTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitalsTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} domain={['dataMin - 10', 'dataMax + 10']} />
                  <Tooltip />
                  {(activeTrendTab === 'Overview' || activeTrendTab === 'Blood Pressure') && (
                    <>
                      <Line type="monotone" dataKey="systolic" stroke="#4F46E5" strokeWidth={2.5} dot={{ r: 3 }} name="Systolic" />
                      <Line type="monotone" dataKey="diastolic" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3 }} name="Diastolic" />
                    </>
                  )}
                  {activeTrendTab === 'Heart Rate' && (
                    <Line type="monotone" dataKey="heartRate" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 3 }} name="Heart Rate (bpm)" />
                  )}
                  {activeTrendTab === 'SpO2' && (
                    <Line type="monotone" dataKey="spo2" stroke="#0EA5E9" strokeWidth={2.5} dot={{ r: 3 }} name="SpO2 (%)" />
                  )}
                  {activeTrendTab === 'Temperature' && (
                    <Line type="monotone" dataKey="temperature" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 3 }} name="Temperature (°F)" />
                  )}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                <Activity className="w-7 h-7 stroke-1 text-slate-300 mb-1" />
                <p className="text-xs font-semibold">No vitals data recorded in database yet</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
            <div>
              <p className="text-[10px] font-semibold text-slate-400">Avg. Systolic</p>
              <p className="text-xs font-extrabold text-slate-800">{vitalsSummary.avgSystolic}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400">Avg. Diastolic</p>
              <p className="text-xs font-extrabold text-slate-800">{vitalsSummary.avgDiastolic}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400">Avg. Heart Rate</p>
              <p className="text-xs font-extrabold text-slate-800">{vitalsSummary.avgHeartRate}</p>
            </div>
          </div>
        </div>

        {/* My Patients Table (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              My Patients
            </h2>
            <button
              onClick={() => navigate('/patients')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
            >
              View All Patients
            </button>
          </div>

          <div className="overflow-x-auto min-h-[190px]">
            {filteredPatients.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="pb-2">Patient Name</th>
                    <th className="pb-2">Age / Gender</th>
                    <th className="pb-2">Last Visit</th>
                    <th className="pb-2">Next Appt</th>
                    <th className="pb-2">Condition</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPatients.map((row: any, idx: number) => (
                    <tr key={row.id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 font-bold text-slate-900">
                        <div>{row.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{row.patientIdCode}</div>
                      </td>
                      <td className="py-2.5 text-slate-500 font-medium">{row.age}</td>
                      <td className="py-2.5 text-slate-500">{row.last}</td>
                      <td className="py-2.5 text-slate-500 font-medium">{row.next}</td>
                      <td className="py-2.5 font-semibold text-slate-700">{row.cond}</td>
                      <td className="py-2.5 text-right">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${row.color || 'bg-emerald-50 text-emerald-700'}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center h-44 text-center text-slate-400 space-y-1">
                <Users className="w-8 h-8 stroke-1 text-slate-300" />
                <p className="text-xs font-semibold">No patients found in database</p>
                <p className="text-[10px]">Registered patients will appear here dynamically.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Bottom 4 Grid Columns: Tasks, Alerts, Recent Consultations, AI Assistant */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-indigo-600" />
              Tasks
            </h2>
            <button
              onClick={() => navigate('/tasks')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
            >
              View All
            </button>
          </div>
          <div className="space-y-3 min-h-[160px]">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((t: any, idx: number) => (
                <div key={t.id || idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <p className="text-xs font-bold text-slate-900">{t.title}</p>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className={`font-bold ${t.prioCol || 'text-slate-500'}`}>{t.prio}</span>
                    <span className="text-slate-400">{t.due}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-36 text-center text-slate-400 space-y-1">
                <CheckCircle2 className="w-6 h-6 stroke-1 text-emerald-400" />
                <p className="text-xs font-semibold text-slate-600">No pending tasks</p>
              </div>
            )}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              Alerts
            </h2>
            <button
              onClick={() => navigate('/alerts')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
            >
              View All
            </button>
          </div>
          <div className="space-y-3 min-h-[160px]">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((a: any, idx: number) => (
                <div key={a.id || idx} className="p-2.5 rounded-xl bg-rose-50/50 border border-rose-100 flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{a.msg}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-36 text-center text-slate-400 space-y-1">
                <CheckCircle2 className="w-6 h-6 stroke-1 text-emerald-400" />
                <p className="text-xs font-semibold text-slate-600">No active alerts</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Consultations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Recent Consultations
            </h2>
            <button
              onClick={() => navigate('/consultations')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
            >
              View All
            </button>
          </div>
          <div className="space-y-3 min-h-[160px]">
            {filteredConsultations.length > 0 ? (
              filteredConsultations.map((c: any, idx: number) => (
                <div key={c.id || idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="pr-2 truncate">
                    <p className="text-xs font-bold text-slate-900">{c.name}</p>
                    <p className="text-[10px] text-slate-400">{c.date}</p>
                    <p className="text-[10px] text-slate-500 truncate">{c.note}</p>
                  </div>
                  <button
                    onClick={() => navigate('/consultations')}
                    className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 shrink-0 cursor-pointer"
                  >
                    View
                  </button>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-36 text-center text-slate-400 space-y-1">
                <Calendar className="w-6 h-6 stroke-1 text-slate-300" />
                <p className="text-xs font-semibold">No recent consultations</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Assistant */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-indigo-600 fill-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900">AI Assistant</h2>
              </div>
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-extrabold rounded-md uppercase">Live EHR</span>
            </div>

            <p className="text-xs font-semibold text-slate-600 mt-2">Clinical Insights & Decision Support</p>

            <div className="grid grid-cols-2 gap-1.5 mt-2.5">
              {[
                'Analyze Patient Data',
                'Suggest Care Plan',
                'Drug Interaction Check',
                'Health Risk Assessment'
              ].map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAiSubmit(pill)}
                  disabled={aiLoading}
                  className="p-2 bg-slate-50 border border-slate-200/70 rounded-xl text-[10px] font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-left transition-all cursor-pointer disabled:opacity-50"
                >
                  {pill}
                </button>
              ))}
            </div>

            {/* AI Response Feed */}
            {aiResponses.length > 0 && (
              <div className="mt-3 max-h-36 overflow-y-auto space-y-2 p-2.5 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                {aiResponses.slice(0, 2).map((item, idx) => (
                  <div key={idx} className="text-[11px] space-y-1">
                    <div className="flex items-center justify-between font-bold text-indigo-900">
                      <span>Q: {item.prompt}</span>
                      <span className="text-[9px] text-slate-400 font-normal">{item.time}</span>
                    </div>
                    <div className="text-slate-700 whitespace-pre-line text-[10px] leading-relaxed">
                      {item.response}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAiSubmit();
            }}
            className="relative mt-3"
          >
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="Ask EHR assistant..."
              disabled={aiLoading}
              className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            <button
              type="submit"
              disabled={aiLoading || !aiQuery.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-40 cursor-pointer"
            >
              {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

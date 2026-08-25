import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  AlertCircle,
  ClipboardCheck,
  ArrowUpRight,
  Send,
  Search,
  RefreshCw,
  Clock,
  Sparkles,
  CheckCircle2,
  Heart,
  Loader2,
  Pill,
  ExternalLink,
  Plus,
  Stethoscope,
  ChevronRight,
  BedDouble,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { api } from '@/lib/api';

export const DoctorPortalPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const greeting = useMemo(() => {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}, []);

  // Quick Action Modals
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [newConsultPatientName, setNewConsultPatientName] = useState('');
  const [newConsultType, setNewConsultType] = useState('Follow-up Consultation');
  const [newConsultNotes, setNewConsultNotes] = useState('');
  const [isSavingConsultation, setIsSavingConsultation] = useState(false);

  // AI Assistant State
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponses, setAiResponses] = useState<Array<{ prompt: string; response: string; time: string }>>([]);

  // Local task completion tracking for optimistic UI
  const [completedTaskIds, setCompletedTaskIds] = useState<Record<string, boolean>>({});

  const doctorDisplayName = useMemo(() => {
    if (!user) return 'Doctor';
    const fullName = user.fullName;
    if (fullName) {
      return fullName.toLowerCase().startsWith('dr.') ? fullName : `Dr. ${fullName}`;
    }
    const username = user.username || 'Doctor';
    if (username.toLowerCase().startsWith('dr.')) return username;
    return `Dr. ${username.charAt(0).toUpperCase() + username.slice(1)}`;
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

    if (!user?.doctorId) {
      throw new Error('Unable to resolve the logged-in doctor.');
    }

    const res = await api.getDoctorOverview();
        setData(res);
      } catch (err: any) {
        console.error('Failed to load doctor dashboard data:', err);
        setError(err?.message || 'Failed to load live doctor dashboard data.');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (user?.doctorId) {
      loadDoctorOverview();
    }
  }, [user?.doctorId]);

  const handleAiSubmit = async (queryText?: string) => {
    const promptToSubmit = (queryText || aiQuery).trim();
    if (!promptToSubmit || aiLoading) return;

    try {
      setAiLoading(true);
      const res = await api.postDoctorAiAssistant({
        doctorName: doctorDisplayName,
        promptQuery: promptToSubmit,
        patientName: data?.myPatients?.[0]?.name || 'Patient',
        patientIdCode: data?.myPatients?.[0]?.patientIdCode || 'PT-001',
        category: 'Clinical Decision Support'
      });

      const responseText = res?.data?.aiResponse || res?.aiResponse || 'Clinical evaluation completed based on current database records.';
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
          response: 'Could not complete clinical analysis at this moment. Please verify EHR connectivity.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        ...prev
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreateConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConsultPatientName.trim()) return;

    setIsSavingConsultation(true);
    try {
      await api.createDoctorConsultation({
        patientName: newConsultPatientName.trim(),
        consultationType: newConsultType,
        clinicalNotes: newConsultNotes.trim() || 'Routine physician consultation scheduled.',
        doctorName: doctorDisplayName,
        status: 'Scheduled',
        dateText: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      });
      setShowConsultationModal(false);
      setNewConsultPatientName('');
      setNewConsultNotes('');
      loadDoctorOverview();
    } catch (err) {
      console.error('Failed to create consultation:', err);
    } finally {
      setIsSavingConsultation(false);
    }
  };

  const toggleTaskCompletion = (taskId: string | number) => {
    setCompletedTaskIds((prev) => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
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
        p.patientIdCode?.toLowerCase().includes(q) ||
        p.careUnit?.toLowerCase().includes(q) ||
        p.floorRoom?.toLowerCase().includes(q)
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

  const metrics = data?.metrics || {
    todayAppointments: 0,
    todayAppointmentsDiff: 0,
    totalPatients: 0,
    newPatientsThisWeek: 0,
    criticalAlerts: 0,
    pendingReviews: 0,
    pendingReviewsDiff: 0
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading your live clinical dashboard...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-3 max-w-lg mx-auto my-12">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-sm font-bold text-rose-900">Database Connection Notice</h3>
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
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                 {greeting}, {doctorDisplayName}
              </h1>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                {todayFormattedDate} • Clinical Physician Portal & Assigned Census
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap md:flex-nowrap">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patients, tasks..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium"
            />
          </div>

          <button
            onClick={() => setShowConsultationModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Appt</span>
          </button>

          <button
            onClick={() => navigate('/medications')}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer shrink-0"
          >
            <Pill className="w-3.5 h-3.5 text-indigo-600" />
            <span>Prescriptions</span>
          </button>

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

      {/* Top 4 Live Doctor-Specific KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Today's Appointments */}
        <div
          onClick={() => navigate('/consultations')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Appointments</span>
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

        {/* Card 2: My Assigned In-Care Patients */}
        <div
          onClick={() => navigate('/patients')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Assigned Patients</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">{metrics.totalPatients}</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 mt-1">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>{metrics.newPatientsThisWeek} admitted this week</span>
            </div>
          </div>
        </div>

        {/* Card 3: Critical Watchlist */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 hover:border-rose-300 hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Critical Watchlist</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">{metrics.criticalAlerts}</div>
            <div className={`flex items-center gap-1 text-[11px] font-bold mt-1 ${metrics.criticalAlerts > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              <span>{metrics.criticalAlerts > 0 ? 'Urgent attention required' : 'All assigned patients stable'}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Pending Clinical Orders & Tasks */}
        <div
          onClick={() => navigate('/tasks')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Orders & Tasks</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ClipboardCheck className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">{metrics.pendingReviews}</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 mt-1">
              <span>Awaiting physician review or sign-off</span>
            </div>
          </div>
        </div>

      </div>

      {/* Main 2-Column Clinical Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN (7 COLS): SCHEDULE & PATIENT CENSUS */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Today's Schedule & Ward Rounds */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-black text-slate-900">Today's Clinical Schedule & Rounds</h2>
              </div>
              <button
                onClick={() => navigate('/consultations')}
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Full Schedule</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5 min-h-[190px]">
              {filteredSchedule.length > 0 ? (
                filteredSchedule.map((slot: any, idx: number) => (
                  <div
                    key={slot.id || idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-100 hover:bg-indigo-50/40 hover:border-indigo-100 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-20 text-center py-1 bg-white border border-slate-200 rounded-lg shrink-0">
                        <span className="text-[11px] font-extrabold text-indigo-600 block">{slot.time}</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{slot.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                          {slot.type} {slot.assignedNurse ? `• Attending: ${slot.assignedNurse}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${slot.color || 'bg-blue-50 text-blue-700'}`}>
                        {slot.status}
                      </span>
                      <button
                        onClick={() => navigate('/consultations')}
                        className="px-2.5 py-1 bg-white hover:bg-indigo-600 hover:text-white text-indigo-600 border border-slate-200 hover:border-indigo-600 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-44 text-center text-slate-400 space-y-1.5">
                  <Calendar className="w-8 h-8 stroke-1 text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">No appointments scheduled for today</p>
                  <p className="text-[11px] text-slate-400">Click '+ Schedule Appt' above to book an in-clinic consultation.</p>
                </div>
              )}
            </div>
          </div>

          {/* My In-Care Patients Census */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-black text-slate-900">
                  My Assigned Patients Census ({filteredPatients.length})
                </h2>
              </div>
              <button
                onClick={() => navigate('/patients')}
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All Patients</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto min-h-[220px]">
              {filteredPatients.length > 0 ? (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="pb-2.5">Patient Name</th>
                      <th className="pb-2.5">Ward & Room</th>
                      <th className="pb-2.5">Diagnosis / Condition</th>
                      <th className="pb-2.5">Status</th>
                      <th className="pb-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPatients.map((row: any, idx: number) => (
                      <tr key={row.id || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 font-bold text-slate-900">
                          <div>{row.name}</div>
                          <div className="text-[10px] text-slate-400 font-semibold">{row.patientIdCode}</div>
                        </td>
                        <td className="py-2.5 text-slate-600 font-semibold">
                          <div className="flex items-center gap-1 text-slate-800">
                            <BedDouble className="w-3 h-3 text-slate-400" />
                            <span>{row.floorRoom || 'Not assigned'}</span>
                          </div>
                          <div className="text-[10px] text-slate-400">{row.careUnit || 'Not assigned'}</div>
                        </td>
                        <td className="py-2.5 font-semibold text-slate-700 max-w-[160px] truncate">
                          {row.cond}
                        </td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${row.color || 'bg-emerald-50 text-emerald-700'}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-right space-x-1.5">
                          <button
                            onClick={() => navigate(`/patients/${row.id}`)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            <span>Chart</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400 space-y-1.5">
                  <Users className="w-8 h-8 stroke-1 text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">No assigned patients found</p>
                  <p className="text-[11px] text-slate-400">Patients assigned to your care team will appear here automatically.</p>
                </div>
              )}
            </div>
          </div>

          {/* Real-time Patient Alerts (My Patients Only) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                <h2 className="text-sm font-black text-slate-900">Real-Time Clinical Alerts (My Patients)</h2>
              </div>
              <button
                onClick={() => navigate('/alerts')}
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All Alerts</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5 min-h-[140px]">
              {filteredAlerts.length > 0 ? (
                filteredAlerts.map((a: any, idx: number) => (
                  <div
                    key={a.id || idx}
                    className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{a.msg}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{a.time}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-rose-200/60 text-rose-800 shrink-0">
                      {a.severity || 'High'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-center text-slate-400 space-y-1">
                  <CheckCircle2 className="w-7 h-7 stroke-1 text-emerald-400" />
                  <p className="text-xs font-bold text-slate-600">No active alerts for your patients</p>
                  <p className="text-[10px] text-slate-400">All patient telemetry monitors are within safe parameters.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (5 COLS): TRIAGE, ORDERS & AI CO-PILOT */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Critical & High Risk Patients Watchlist */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                <h2 className="text-sm font-black text-slate-900">Critical & High-Risk Watchlist</h2>
              </div>
              <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-black rounded-md uppercase">
                {filteredCriticalPatients.length} Active
              </span>
            </div>

            <div className="space-y-3 min-h-[190px]">
              {filteredCriticalPatients.length > 0 ? (
                filteredCriticalPatients.map((pat: any, idx: number) => (
                  <div
                    key={pat.id || idx}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2 hover:border-rose-200 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-black text-xs uppercase">
                          {pat.name ? pat.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2) : 'PT'}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900">{pat.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{pat.condition}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${pat.color || 'bg-rose-500 text-white'}`}>
                        {pat.severity}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                      <span className="text-slate-400 font-medium">Continuous Telemetry Active</span>
                      <button
                        onClick={() => navigate(`/patients/${pat.id}`)}
                        className="text-indigo-600 font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Vitals & Chart</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-44 text-center text-slate-400 space-y-1.5">
                  <CheckCircle2 className="w-8 h-8 stroke-1 text-emerald-400" />
                  <p className="text-xs font-bold text-slate-600">No high-risk patients currently</p>
                  <p className="text-[10px] text-slate-400">All assigned patients are currently stable.</p>
                </div>
              )}
            </div>
          </div>

          {/* Pending Clinical Tasks & Orders */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-black text-slate-900">Pending Orders & Tasks</h2>
              </div>
              <button
                onClick={() => navigate('/tasks')}
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5 min-h-[160px]">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((t: any, idx: number) => {
                  const isDone = completedTaskIds[t.id || idx];
                  return (
                    <div
                      key={t.id || idx}
                      onClick={() => toggleTaskCompletion(t.id || idx)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isDone
                          ? 'bg-emerald-50/50 border-emerald-200 text-slate-400 line-through'
                          : 'bg-slate-50 border-slate-100 hover:bg-slate-100/80 text-slate-800'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-md border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                          isDone
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold">{t.title}</p>
                        <div className="flex items-center justify-between text-[10px] mt-1">
                          <span className={`font-extrabold ${isDone ? 'text-slate-400' : t.prioCol || 'text-slate-500'}`}>
                            {t.prio}
                          </span>
                          <span className="text-slate-400">{t.due}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-36 text-center text-slate-400 space-y-1">
                  <CheckCircle2 className="w-6 h-6 stroke-1 text-emerald-400" />
                  <p className="text-xs font-bold text-slate-600">No pending orders or reviews</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Clinical Co-Pilot & Decision Support */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600 fill-indigo-600" />
                <h2 className="text-sm font-black text-slate-900">Doctor AI Clinical Co-Pilot</h2>
              </div>
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-black rounded-md uppercase tracking-wider">
                Live EHR
              </span>
            </div>

            <p className="text-xs font-semibold text-slate-600">Contextual clinical insights, drug checks & care plan drafting:</p>

            <div className="grid grid-cols-2 gap-2">
              {[
                'Drug Interaction Check',
                'Differential Diagnosis',
                'Suggest Care Plan',
                'Review Lab Results'
              ].map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAiSubmit(pill)}
                  disabled={aiLoading}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-left transition-all cursor-pointer disabled:opacity-50"
                >
                  {pill}
                </button>
              ))}
            </div>

            {/* AI Response Feed */}
            {aiResponses.length > 0 && (
              <div className="max-h-40 overflow-y-auto space-y-2.5 p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                {aiResponses.slice(0, 2).map((item, idx) => (
                  <div key={idx} className="text-[11px] space-y-1">
                    <div className="flex items-center justify-between font-bold text-indigo-900">
                      <span>Query: {item.prompt}</span>
                      <span className="text-[9px] text-slate-400 font-normal">{item.time}</span>
                    </div>
                    <div className="text-slate-700 whitespace-pre-line text-[10px] leading-relaxed">
                      {item.response}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAiSubmit();
              }}
              className="relative pt-1"
            >
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Ask clinical co-pilot (e.g. check drug interaction)..."
                disabled={aiLoading}
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              <button
                type="submit"
                disabled={aiLoading || !aiQuery.trim()}
                className="absolute right-2 top-3 w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-40 cursor-pointer"
              >
                {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* Quick Schedule Appointment Modal */}
      {showConsultationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Schedule In-Clinic Consultation
              </h3>
              <button
                onClick={() => setShowConsultationModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateConsultation} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Patient Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eleanor Vance"
                  value={newConsultPatientName}
                  onChange={(e) => setNewConsultPatientName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Type</label>
                <select
                  value={newConsultType}
                  onChange={(e) => setNewConsultType(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-900 cursor-pointer"
                >
                  <option value="Follow-up Consultation">Follow-up Consultation</option>
                  <option value="Post-Op Clinical Review">Post-Op Clinical Review</option>
                  <option value="Medication Evaluation">Medication Evaluation</option>
                  <option value="Urgent Cardiology Review">Urgent Cardiology Review</option>
                  <option value="Pre-Discharge Assessment">Pre-Discharge Assessment</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Notes / Objective</label>
                <textarea
                  rows={3}
                  placeholder="Enter initial clinical notes or consultation objective..."
                  value={newConsultNotes}
                  onChange={(e) => setNewConsultNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConsultationModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingConsultation || !newConsultPatientName.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl shadow-2xs disabled:opacity-50"
                >
                  {isSavingConsultation ? 'Scheduling...' : 'Save Consultation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

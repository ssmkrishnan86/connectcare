import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Calendar,
  AlertTriangle,
  AlertCircle,
  UserCheck,
  CheckSquare,
  FileText,
  Info,
  ChevronRight,
  Share2,
  FileSignature,
  Stethoscope,
  Sparkles
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/features/auth/context/AuthContext';
import { api } from '@/lib/api';
import { DataImportExportToolbar } from '@/components/common/DataImportExportToolbar';

interface AvatarImageProps {
  src?: string;
  alt: string;
  fallbackText: string;
  className?: string;
}

const AvatarImage: React.FC<AvatarImageProps> = ({ src, alt, fallbackText, className = 'w-8 h-8 rounded-full' }) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={`${className} bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px] uppercase shrink-0`}>
        {fallbackText ? fallbackText.slice(0, 2) : 'PT'}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={`${className} object-cover shrink-0`}
    />
  );
};

export const DoctorPortalPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [docData, setDocData] = useState<any>(null);
  const [careTeamsCount, setCareTeamsCount] = useState<number>(0);

  useEffect(() => {
    // Fetch live doctor overview scoped to the authenticated doctor user
    api.getDoctorOverview()
      .then((res: any) => {
        const data = res?.data || res;
        setDocData(data);
      })
      .catch((err) => {
        console.warn('Live doctor overview notice:', err);
      });

    const careTeamParams = user?.doctorId ? { doctorId: user.doctorId } : undefined;
    api.getCareTeams(careTeamParams)
      .then((res: any) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        setCareTeamsCount(list.length);
      })
      .catch(() => {});
  }, [user?.doctorId, user?.userId]);

  // Current formatted date and day
  const { formattedDate, formattedDay } = useMemo(() => {
    const now = new Date();
    return {
      formattedDate: `Today, ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      formattedDay: now.toLocaleDateString('en-US', { weekday: 'long' })
    };
  }, []);

  // Resolve current doctor's display name dynamically based on logged in doctor user
  const doctorDisplayName = useMemo(() => {
    if (docData?.doctorName && docData.doctorName !== 'Doctor') {
      const name = docData.doctorName;
      return name.toLowerCase().startsWith('dr.') ? name : `Dr. ${name}`;
    }
    if (user?.fullName) {
      const name = user.fullName;
      return name.toLowerCase().startsWith('dr.') ? name : `Dr. ${name}`;
    }
    if (user?.username) {
      const uName = user.username;
      if (uName.toLowerCase().startsWith('dr.')) return uName;
      return `Dr. ${uName.charAt(0).toUpperCase() + uName.slice(1)}`;
    }
    return 'Doctor';
  }, [docData?.doctorName, user?.fullName, user?.username]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Dynamic metrics strictly based on logged in doctor's database data
  const metrics = useMemo(() => {
    const totalPatients = docData?.metrics?.totalPatients ?? (docData?.myPatients?.length || 0);
    const todayAppointments = docData?.metrics?.todayAppointments ?? (docData?.todaySchedule?.length || 0);
    const activeAlerts = docData?.alerts ? docData.alerts.length : 0;
    const criticalAlerts = docData?.metrics?.criticalAlerts ?? (docData?.criticalPatients?.length || 0);
    const careTeam = docData?.metrics?.careTeams ?? (docData?.careTeamMembers?.length || careTeamsCount || 0);
    const openTasks = docData?.tasks ? docData.tasks.length : 0;
    const pendingReviews = docData?.metrics?.pendingReviews ?? 0;

    return {
      totalPatients,
      todayAppointments,
      activeAlerts,
      criticalAlerts,
      careTeam,
      openTasks,
      pendingReviews
    };
  }, [docData, careTeamsCount]);

  // Single Row of Operational Clinical Metrics (No patient alerts, all in 1 row)
  const singleRowMetrics = [
    {
      title: 'My Patients',
      value: metrics.totalPatients,
      subtitle: 'Assigned patients',
      icon: Users,
      iconBg: 'bg-blue-50 text-blue-600',
      hoverBorder: 'hover:border-blue-300',
      path: '/patients'
    },
    {
      title: 'Today’s Appts',
      value: metrics.todayAppointments,
      subtitle: 'Scheduled today',
      icon: Calendar,
      iconBg: 'bg-emerald-50 text-emerald-600',
      hoverBorder: 'hover:border-emerald-300',
      path: '/consultations'
    },
    {
      title: 'Active Alerts',
      value: metrics.activeAlerts,
      subtitle: 'Active incidents',
      icon: AlertTriangle,
      iconBg: 'bg-rose-50 text-rose-500',
      hoverBorder: 'hover:border-rose-300',
      path: '/alerts'
    },
    {
      title: 'Critical Alerts',
      value: metrics.criticalAlerts,
      subtitle: 'Immediate triage',
      icon: AlertCircle,
      iconBg: 'bg-red-50 text-red-600',
      hoverBorder: 'hover:border-red-300',
      path: '/alerts'
    },
    {
      title: 'Care Team',
      value: metrics.careTeam,
      subtitle: 'Assigned staff',
      icon: UserCheck,
      iconBg: 'bg-teal-50 text-teal-600',
      hoverBorder: 'hover:border-teal-300',
      path: '/care-teams'
    },
    {
      title: 'Open Tasks',
      value: metrics.openTasks,
      subtitle: 'Pending orders',
      icon: CheckSquare,
      iconBg: 'bg-purple-50 text-purple-600',
      hoverBorder: 'hover:border-purple-300',
      path: '/tasks'
    },
    {
      title: 'Pending Review',
      value: metrics.pendingReviews,
      subtitle: 'Awaiting sign-off',
      icon: FileText,
      iconBg: 'bg-cyan-50 text-cyan-600',
      hoverBorder: 'hover:border-cyan-300',
      path: '/care-plans'
    }
  ];

  // Donut chart health data dynamically computed from doctor's patients
  const healthData = useMemo(() => {
    const total = metrics.totalPatients;
    if (total === 0) {
      return [
        { name: 'Stable', value: 0, color: '#10B981', pct: '0.0' },
        { name: 'Needs Attention', value: 0, color: '#FBBF24', pct: '0.0' },
        { name: 'High Risk', value: 0, color: '#F43F5E', pct: '0.0' },
      ];
    }

    let stable = 0;
    let needsAttention = 0;
    let highRisk = 0;

    if (
      docData?.metrics?.stablePatients !== undefined &&
      docData?.metrics?.needsAttentionPatients !== undefined &&
      docData?.metrics?.highRiskPatients !== undefined &&
      (docData.metrics.stablePatients + docData.metrics.needsAttentionPatients + docData.metrics.highRiskPatients) === total
    ) {
      stable = docData.metrics.stablePatients;
      needsAttention = docData.metrics.needsAttentionPatients;
      highRisk = docData.metrics.highRiskPatients;
    } else if (docData?.myPatients && Array.isArray(docData.myPatients) && docData.myPatients.length > 0) {
      docData.myPatients.forEach((p: any) => {
        const rStr = String(p.riskLevel || p.severity || '').toLowerCase();
        const isHigh = rStr === 'high' || rStr === 'critical' || rStr === '0' || rStr === '1' || p.color?.includes('rose') || p.status === 'High Risk' || p.status === 'Critical';
        const isMed = !isHigh && (rStr === 'medium' || rStr === '2' || p.color?.includes('amber') || p.status === 'Needs Attention' || p.status === 'Admitted');
        if (isHigh) highRisk++;
        else if (isMed) needsAttention++;
        else stable++;
      });
    } else {
      highRisk = metrics.criticalAlerts || (docData?.criticalPatients?.length || 0);
      needsAttention = 0;
      stable = Math.max(0, total - highRisk);
    }

    const sum = (stable + needsAttention + highRisk) || total;

    return [
      { name: 'Stable', value: stable, color: '#10B981', pct: ((stable / sum) * 100).toFixed(1) },
      { name: 'Needs Attention', value: needsAttention, color: '#FBBF24', pct: ((needsAttention / sum) * 100).toFixed(1) },
      { name: 'High Risk', value: highRisk, color: '#F43F5E', pct: ((highRisk / sum) * 100).toFixed(1) },
    ];
  }, [metrics.totalPatients, metrics.criticalAlerts, docData]);

  // Today's appointments for logged in doctor strictly from backend
  const appointmentsList = useMemo(() => {
    if (docData?.todaySchedule && Array.isArray(docData.todaySchedule) && docData.todaySchedule.length > 0) {
      return docData.todaySchedule.slice(0, 5).map((s: any, idx: number) => ({
        id: s.id || `appt-${idx}`,
        time: s.time || '09:00 AM',
        name: s.name || 'Patient Consultation',
        reason: s.type || 'Follow-up Consultation',
        status: s.status === 'Completed' ? 'Confirmed' : (s.status || 'Confirmed'),
        avatar: s.avatar || ''
      }));
    }
    return [];
  }, [docData?.todaySchedule]);

  // High-Risk patients strictly for the logged-in doctor
  const highRiskPatientsList = useMemo(() => {
    if (docData?.criticalPatients && Array.isArray(docData.criticalPatients) && docData.criticalPatients.length > 0) {
      return docData.criticalPatients.slice(0, 3).map((p: any, idx: number) => ({
        id: p.id || `hr-${idx}`,
        name: p.name || 'High Risk Patient',
        condition: p.condition || 'Continuous Telemetry Monitoring',
        status: p.status || 'High Risk',
        avatar: p.avatar || ''
      }));
    }
    return [];
  }, [docData?.criticalPatients]);

  // Pending Actions computed dynamically from doctor's tasks, consultations, alerts, and reviews
  const pendingActions = useMemo(() => {
    const consultationsPending = docData?.todaySchedule
      ? docData.todaySchedule.filter((s: any) => s.status !== 'Completed').length
      : 0;

    const signatureTasks = docData?.tasks
      ? docData.tasks.filter((t: any) => t.title?.toLowerCase().includes('sign') || t.title?.toLowerCase().includes('document')).length
      : 0;

    return [
      {
        id: 'pa1',
        title: 'Review Care Plans',
        subtitle: 'Plans require your review',
        count: metrics.pendingReviews,
        badgeColor: 'bg-rose-50 text-rose-500',
        icon: Share2,
        path: '/care-plans'
      },
      {
        id: 'pa2',
        title: 'Complete Consultations',
        subtitle: 'Consultations awaiting notes',
        count: consultationsPending,
        badgeColor: 'bg-amber-50 text-amber-600',
        icon: Stethoscope,
        path: '/consultations'
      },
      {
        id: 'pa3',
        title: 'Follow up on Alerts',
        subtitle: 'Patient alerts need attention',
        count: metrics.activeAlerts,
        badgeColor: 'bg-rose-50 text-rose-500',
        icon: AlertTriangle,
        path: '/alerts'
      },
      {
        id: 'pa4',
        title: 'Sign Documents',
        subtitle: 'Documents awaiting signature',
        count: signatureTasks > 0 ? signatureTasks : (metrics.openTasks > 0 ? 1 : 0),
        badgeColor: 'bg-emerald-50 text-emerald-600',
        icon: FileSignature,
        path: '/tasks'
      }
    ];
  }, [docData, metrics]);

  // Upcoming appointments dynamically calculated or received from backend
  const upcomingAppointments = useMemo(() => {
    if (docData?.upcomingSchedule && Array.isArray(docData.upcomingSchedule) && docData.upcomingSchedule.length > 0) {
      return docData.upcomingSchedule;
    }

    const res = [];
    const now = new Date();
    for (let d = 1; d <= 3; d++) {
      const nextDate = new Date(now.getTime() + d * 86400000);
      const estCount = metrics.totalPatients > 0 ? Math.max(1, Math.round(metrics.totalPatients / 4)) : 0;
      res.push({
        id: `u-${d}`,
        date: nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        day: nextDate.toLocaleDateString('en-US', { weekday: 'short' }),
        count: `${estCount} Appointment${estCount === 1 ? '' : 's'}`
      });
    }
    return res;
  }, [docData?.upcomingSchedule, metrics.totalPatients]);

  // Recent patient activities strictly for logged in doctor from backend
  const recentActivities = useMemo(() => {
    if (docData?.recentConsultations && Array.isArray(docData.recentConsultations) && docData.recentConsultations.length > 0) {
      return docData.recentConsultations.slice(0, 5).map((rc: any, idx: number) => ({
        id: rc.id || `ra-${idx}`,
        patientName: rc.name || 'Patient Record',
        avatar: rc.avatar || '',
        activity: rc.note || 'Consultation Completed',
        dateTime: rc.date || 'Today',
        by: doctorDisplayName,
        status: 'Completed'
      }));
    }
    return [];
  }, [docData?.recentConsultations, doctorDisplayName]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans antialiased text-slate-800 pb-12">
      
      {/* 1. Header Greeting & Current Date Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {greeting}, {doctorDisplayName} <span>👋</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Here's your patient overview for today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <DataImportExportToolbar
            moduleKey="dashboard"
            data={docData?.myPatients || []}
            idField="id"
            allowImport={false}
            showTemplateLink={false}
          />

          <button
            onClick={() => navigate('/ai-operations')}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer group"
          >
            <Sparkles className="w-4 h-4 text-indigo-200 group-hover:rotate-12 transition-transform" />
            <span>AI Clinical Assistant</span>
          </button>

          {/* Date Card */}
          <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-2xs self-start sm:self-auto">
            <div className="p-2 rounded-xl text-blue-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">{formattedDate}</div>
              <div className="text-[11px] font-medium text-slate-400">{formattedDay}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Single Row Operational Metrics: My Patients, Today's Appts, Active Alerts, Critical Alerts, Care Team, Open Tasks, Pending Review */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3.5">
        {singleRowMetrics.map((item, idx) => {
          const IconC = item.icon;
          const hasData = item.value > 0;
          return (
            <div
              key={idx}
              onClick={() => {
                if (hasData) navigate(item.path);
              }}
              className={`bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3 transition-all ${
                hasData
                  ? `${item.hoverBorder} hover:shadow-xs cursor-pointer group`
                  : 'opacity-60 cursor-not-allowed select-none'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0 ${hasData ? 'group-hover:scale-105 transition-transform' : ''}`}>
                <IconC className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-semibold text-slate-500 block truncate">{item.title}</span>
                <div className="text-xl font-black text-slate-900 leading-tight">{item.value}</div>
                <span className="text-[10px] text-slate-400 block truncate font-medium">{item.subtitle}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Middle Row: Patient Health Overview & Today's Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Card: Patient Health Overview (Col 5) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-4">
              <h2 className="text-sm font-bold text-slate-900">Patient Health Overview</h2>
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
              {/* Donut Chart with Center Total */}
              <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={healthData}
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={68}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {healthData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text in Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-900 leading-none">{metrics.totalPatients}</span>
                  <span className="text-[11px] font-medium text-slate-400 mt-0.5">Total</span>
                </div>
              </div>

              {/* Legend Breakdown */}
              <div className="space-y-4 w-full sm:w-auto">
                {healthData.map((seg, sIdx) => (
                  <div key={sIdx} className="flex items-center justify-between sm:justify-start gap-6">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }}></span>
                      <span className="text-xs font-semibold text-slate-700">{seg.name}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900">{seg.value} ({seg.pct}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              disabled={metrics.totalPatients === 0}
              onClick={() => metrics.totalPatients > 0 && navigate('/patients')}
              className={`text-xs flex items-center gap-1 transition-colors ${
                metrics.totalPatients > 0
                  ? 'font-bold text-blue-600 hover:text-blue-700 cursor-pointer'
                  : 'font-semibold text-slate-300 cursor-not-allowed pointer-events-none'
              }`}
            >
              <span>View all patients</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Card: Today's Appointments (Col 7) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900">Today's Appointments</h2>
              <button
                disabled={appointmentsList.length === 0}
                onClick={() => appointmentsList.length > 0 && navigate('/consultations')}
                className={`text-xs transition-colors ${
                  appointmentsList.length > 0
                    ? 'font-bold text-blue-600 hover:text-blue-700 cursor-pointer'
                    : 'font-semibold text-slate-300 cursor-not-allowed pointer-events-none'
                }`}
              >
                View all
              </button>
            </div>

            {/* List of Appointments */}
            <div className="space-y-3">
              {appointmentsList.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 font-medium">
                  No consultations scheduled for today
                </div>
              ) : (
                appointmentsList.map((appt: any) => (
                  <div
                    key={appt.id}
                    onClick={() => navigate('/consultations')}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-blue-600 w-16 shrink-0">
                        {appt.time}
                      </span>
                      <AvatarImage
                        src={appt.avatar}
                        alt={appt.name}
                        fallbackText={appt.name}
                        className="w-8 h-8 rounded-full border border-slate-100"
                      />
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 leading-tight">{appt.name}</h3>
                        <p className="text-[11px] text-slate-400 font-medium">{appt.reason}</p>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-0.5 rounded-full text-[11px] font-semibold border ${
                        appt.status === 'Confirmed'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60'
                          : 'bg-amber-50 text-amber-600 border-amber-200/60'
                      }`}
                    >
                      {appt.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* 4. Third Row: High-Risk Patients, Pending Actions, Upcoming Appointments (3 Cols) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: High-Risk Patients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900">High-Risk Patients</h2>
              <button
                disabled={highRiskPatientsList.length === 0}
                onClick={() => highRiskPatientsList.length > 0 && navigate('/patients')}
                className={`text-xs transition-colors ${
                  highRiskPatientsList.length > 0
                    ? 'font-bold text-blue-600 hover:text-blue-700 cursor-pointer'
                    : 'font-semibold text-slate-300 cursor-not-allowed pointer-events-none'
                }`}
              >
                View all
              </button>
            </div>

            <div className="space-y-3.5">
              {highRiskPatientsList.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 font-medium">
                  No high-risk patients currently
                </div>
              ) : (
                highRiskPatientsList.map((patient: any) => (
                  <div
                    key={patient.id}
                    onClick={() => navigate(patient.id && !patient.id.startsWith('hr-') ? `/patients/${patient.id}` : '/patients')}
                    className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <AvatarImage
                        src={patient.avatar}
                        alt={patient.name}
                        fallbackText={patient.name}
                        className="w-8 h-8 rounded-full border border-slate-100"
                      />
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 leading-tight">{patient.name}</h3>
                        <p className="text-[11px] text-slate-400 font-medium">{patient.condition}</p>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-500 border border-rose-200/60 shrink-0">
                      {patient.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Pending Actions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900">Pending Actions</h2>
              <button
                disabled={!pendingActions.some(a => a.count > 0)}
                onClick={() => pendingActions.some(a => a.count > 0) && navigate('/tasks')}
                className={`text-xs transition-colors ${
                  pendingActions.some(a => a.count > 0)
                    ? 'font-bold text-blue-600 hover:text-blue-700 cursor-pointer'
                    : 'font-semibold text-slate-300 cursor-not-allowed pointer-events-none'
                }`}
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              {pendingActions.map((action) => {
                const IconComp = action.icon;
                const canClick = action.count > 0;
                return (
                  <div
                    key={action.id}
                    onClick={() => {
                      if (canClick) navigate(action.path);
                    }}
                    className={`flex items-center justify-between p-1.5 rounded-xl transition-colors ${
                      canClick ? 'hover:bg-slate-50 cursor-pointer' : 'opacity-50 cursor-not-allowed select-none'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-600 flex items-center justify-center shrink-0">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 leading-tight">{action.title}</h3>
                        <p className="text-[11px] text-slate-400 font-medium">{action.subtitle}</p>
                      </div>
                    </div>

                    <span className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center ${action.badgeColor} shrink-0`}>
                      {action.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Card 3: Upcoming Appointments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900">Upcoming Appointments</h2>
              <button
                disabled={!upcomingAppointments.some((u: any) => !u.count?.startsWith('0'))}
                onClick={() => upcomingAppointments.some((u: any) => !u.count?.startsWith('0')) && navigate('/consultations')}
                className={`text-xs transition-colors ${
                  upcomingAppointments.some((u: any) => !u.count?.startsWith('0'))
                    ? 'font-bold text-blue-600 hover:text-blue-700 cursor-pointer'
                    : 'font-semibold text-slate-300 cursor-not-allowed pointer-events-none'
                }`}
              >
                View all
              </button>
            </div>

            <div className="space-y-3.5">
              {upcomingAppointments.map((item: any) => {
                const isItemActive = !item.count?.startsWith('0');
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (isItemActive) navigate('/consultations');
                    }}
                    className={`flex items-center justify-between p-1.5 rounded-xl transition-colors ${
                      isItemActive ? 'hover:bg-slate-50 cursor-pointer' : 'opacity-50 cursor-not-allowed select-none'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 leading-tight">{item.date}</h3>
                        <p className="text-[11px] text-slate-400 font-medium">{item.count}</p>
                      </div>
                    </div>

                    <span className="text-xs font-semibold text-slate-500">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* 5. Bottom Row: Recent Patient Activity (Full Width Card) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-900">Recent Patient Activity</h2>
          <button
            disabled={recentActivities.length === 0}
            onClick={() => recentActivities.length > 0 && navigate('/patients')}
            className={`text-xs transition-colors ${
              recentActivities.length > 0
                ? 'font-bold text-blue-600 hover:text-blue-700 cursor-pointer'
                : 'font-semibold text-slate-300 cursor-not-allowed pointer-events-none'
            }`}
          >
            View all
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                <th className="pb-3 font-bold">Patient</th>
                <th className="pb-3 font-bold">Activity</th>
                <th className="pb-3 font-bold">Date & Time</th>
                <th className="pb-3 font-bold">By</th>
                <th className="pb-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentActivities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                    No recent patient activity recorded
                  </td>
                </tr>
              ) : (
                recentActivities.map((act: any) => (
                  <tr key={act.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <AvatarImage
                          src={act.avatar}
                          alt={act.patientName}
                          fallbackText={act.patientName}
                          className="w-7 h-7 rounded-full border border-slate-100"
                        />
                        <span>{act.patientName}</span>
                      </div>
                    </td>
                    <td className="py-3 font-medium text-slate-600">
                      {act.activity}
                    </td>
                    <td className="py-3 font-medium text-slate-600">
                      {act.dateTime}
                    </td>
                    <td className="py-3 font-medium text-slate-600">
                      {act.by}
                    </td>
                    <td className="py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/60 inline-block">
                        {act.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Footer */}
      <footer className="text-center pt-4 pb-2 text-xs text-slate-400 font-medium">
        © {new Date().getFullYear()} ConnectCare. All rights reserved.
      </footer>

    </div>
  );
};

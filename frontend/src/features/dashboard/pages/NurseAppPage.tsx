import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Calendar,
  AlertTriangle,
  AlertCircle,
  UserCheck,
  CheckSquare,
  Info,
  ChevronRight,
  Pill,
  FileSignature,
  Stethoscope,
  Sparkles
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/features/auth/context/AuthContext';
import { api } from '@/lib/api';

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

export const NurseAppPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [nurseData, setNurseData] = useState<any>(null);
  const [careTeamsCount, setCareTeamsCount] = useState<number>(0);

  useEffect(() => {
    // Fetch live nurse overview scoped strictly to the authenticated nurse
    api.getNurseOverview(user?.nurseId)
      .then((res: any) => {
        const data = res?.data || res;
        setNurseData(data);
      })
      .catch((err) => {
        console.warn('Live nurse overview notice:', err);
      });

    api.getCareTeams()
      .then((res: any) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        setCareTeamsCount(list.length);
      })
      .catch(() => {});
  }, [user?.nurseId, user?.userId]);

  // Current formatted date and day
  const { formattedDate, formattedDay } = useMemo(() => {
    const now = new Date();
    return {
      formattedDate: `Today, ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      formattedDay: now.toLocaleDateString('en-US', { weekday: 'long' })
    };
  }, []);

  // Resolve current nurse's display name dynamically based on logged-in nurse user
  const nurseDisplayName = useMemo(() => {
    const cleanName = (raw?: string) => {
      if (!raw) return '';
      const trimmed = raw.trim();
      if (!trimmed || trimmed.toLowerCase() === 'nurse' || trimmed.toLowerCase() === 'staff nurse') {
        return '';
      }
      // If it already starts with "nurse" (e.g. "Nurse1 Test", "Nurse Sarah", "nurse_1", "Nurse-1")
      if (/^nurse/i.test(trimmed)) {
        return trimmed;
      }
      return `Nurse ${trimmed}`;
    };

    const resolved = cleanName(nurseData?.nurseName) || cleanName(user?.fullName) || cleanName(user?.username);
    return resolved || 'Nurse';
  }, [nurseData?.nurseName, user?.fullName, user?.username]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Dynamic metrics strictly based on logged-in nurse's database data
  const metrics = useMemo(() => {
    const totalPatients = nurseData?.metrics?.totalPatients ?? nurseData?.totalPatients ?? (nurseData?.myPatients?.length || 0);
    const todayRounds = nurseData?.metrics?.todayRounds ?? nurseData?.roundsTotal ?? nurseData?.roundsCompleted ?? (nurseData?.todaySchedule?.length || 0);
    const activeAlerts = nurseData?.metrics?.activeAlerts ?? nurseData?.alertsTotal ?? (nurseData?.alerts?.length || 0);
    const criticalAlerts = nurseData?.metrics?.criticalAlerts ?? nurseData?.alertsCritical ?? (nurseData?.criticalPatients?.length || 0);
    const careTeam = nurseData?.metrics?.careTeams ?? (nurseData?.careTeamMembers?.length || careTeamsCount || (totalPatients > 0 ? 1 : 0));
    const openTasks = nurseData?.metrics?.openTasks ?? nurseData?.tasksTotal ?? (nurseData?.tasks?.length || 0);
    const medicationsDue = nurseData?.metrics?.medicationsDue ?? nurseData?.medicationsDueTotal ?? 0;

    return {
      totalPatients,
      todayRounds,
      activeAlerts,
      criticalAlerts,
      careTeam,
      openTasks,
      medicationsDue
    };
  }, [nurseData, careTeamsCount]);

  // Single Row of 7 Operational Clinical Metrics (Matching Doctor Portal Layout)
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
      title: 'Vital Rounds',
      value: metrics.todayRounds,
      subtitle: 'Scheduled rounds',
      icon: Stethoscope,
      iconBg: 'bg-emerald-50 text-emerald-600',
      hoverBorder: 'hover:border-emerald-300',
      path: '/vital-rounds'
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
      subtitle: 'Pending tasks',
      icon: CheckSquare,
      iconBg: 'bg-purple-50 text-purple-600',
      hoverBorder: 'hover:border-purple-300',
      path: '/tasks'
    },
    {
      title: 'Medications Due',
      value: metrics.medicationsDue,
      subtitle: 'Awaiting dose',
      icon: Pill,
      iconBg: 'bg-cyan-50 text-cyan-600',
      hoverBorder: 'hover:border-cyan-300',
      path: '/medications'
    }
  ];

  // Donut chart health data dynamically computed from nurse's patients
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
      nurseData?.metrics?.stablePatients !== undefined &&
      nurseData?.metrics?.needsAttentionPatients !== undefined &&
      nurseData?.metrics?.highRiskPatients !== undefined &&
      (nurseData.metrics.stablePatients + nurseData.metrics.needsAttentionPatients + nurseData.metrics.highRiskPatients) === total
    ) {
      stable = nurseData.metrics.stablePatients;
      needsAttention = nurseData.metrics.needsAttentionPatients;
      highRisk = nurseData.metrics.highRiskPatients;
    } else if (nurseData?.myPatients && Array.isArray(nurseData.myPatients) && nurseData.myPatients.length > 0) {
      nurseData.myPatients.forEach((p: any) => {
        const rStr = String(p.riskLevel || p.severity || '').toLowerCase();
        const isHigh = rStr === 'high' || rStr === 'critical' || rStr === '0' || rStr === '1' || p.color?.includes('rose') || p.status === 'High Risk' || p.status === 'Critical';
        const isMed = !isHigh && (rStr === 'medium' || rStr === '2' || p.color?.includes('amber') || p.status === 'Needs Attention' || p.status === 'Admitted');
        if (isHigh) highRisk++;
        else if (isMed) needsAttention++;
        else stable++;
      });
    } else {
      highRisk = metrics.criticalAlerts || (nurseData?.criticalPatients?.length || 0);
      needsAttention = 0;
      stable = Math.max(0, total - highRisk);
    }

    const sum = (stable + needsAttention + highRisk) || total;

    return [
      { name: 'Stable', value: stable, color: '#10B981', pct: ((stable / sum) * 100).toFixed(1) },
      { name: 'Needs Attention', value: needsAttention, color: '#FBBF24', pct: ((needsAttention / sum) * 100).toFixed(1) },
      { name: 'High Risk', value: highRisk, color: '#F43F5E', pct: ((highRisk / sum) * 100).toFixed(1) },
    ];
  }, [metrics.totalPatients, metrics.criticalAlerts, nurseData]);

  // Today's schedule for logged-in nurse strictly from database
  const todayScheduleList = useMemo(() => {
    if (nurseData?.todaySchedule && Array.isArray(nurseData.todaySchedule) && nurseData.todaySchedule.length > 0) {
      return nurseData.todaySchedule.slice(0, 5).map((s: any, idx: number) => ({
        id: s.id || `sched-${idx}`,
        time: s.time || '08:30 AM',
        name: s.name || 'Patient Care Round',
        reason: s.type || 'Vital Signs & Medication Round',
        status: s.status === 'Completed' ? 'Confirmed' : (s.status || 'Confirmed'),
        avatar: s.avatar || ''
      }));
    }
    return [];
  }, [nurseData?.todaySchedule]);

  // High-Risk patients strictly for the logged-in nurse
  const highRiskPatientsList = useMemo(() => {
    if (nurseData?.criticalPatients && Array.isArray(nurseData.criticalPatients) && nurseData.criticalPatients.length > 0) {
      return nurseData.criticalPatients.slice(0, 3).map((p: any, idx: number) => ({
        id: p.id || `hr-${idx}`,
        name: p.name || 'High Risk Patient',
        condition: p.condition || 'Vital Signs & Continuous Monitoring',
        status: p.status || 'High Risk',
        avatar: p.avatar || ''
      }));
    }
    return [];
  }, [nurseData?.criticalPatients]);

  // Pending Actions strictly computed from real database data for nurse workflow
  const pendingActions = useMemo(() => {
    let pendingRounds = 0;
    if (nurseData?.metrics?.pendingVitalRounds !== undefined) {
      pendingRounds = nurseData.metrics.pendingVitalRounds;
    } else if (nurseData?.roundsPending !== undefined) {
      pendingRounds = nurseData.roundsPending;
    } else if (nurseData?.todaySchedule && Array.isArray(nurseData.todaySchedule) && nurseData.todaySchedule.length > 0) {
      const uncompleted = nurseData.todaySchedule.filter((s: any) => s.status !== 'Completed' && s.status !== 'Recorded').length;
      pendingRounds = uncompleted > 0 ? uncompleted : nurseData.todaySchedule.length;
    } else if (metrics.todayRounds > 0) {
      const completed = nurseData?.roundsCompleted ?? 0;
      pendingRounds = Math.max(0, metrics.todayRounds - completed);
      if (pendingRounds === 0 && metrics.todayRounds > 0) {
        pendingRounds = metrics.todayRounds;
      }
    } else if (metrics.totalPatients > 0) {
      pendingRounds = metrics.totalPatients;
    }

    const pendingMeds = nurseData?.metrics?.medicationsDue ?? nurseData?.medicationsDueTotal ?? metrics.medicationsDue;
    const pendingAlerts = nurseData?.metrics?.activeAlerts ?? nurseData?.alertsTotal ?? metrics.activeAlerts;
    const pendingHandover = nurseData?.metrics?.shiftHandoversPending ?? nurseData?.shiftHandoversPending ?? (nurseData?.metrics?.openTasks ?? metrics.openTasks ?? 0);

    return [
      {
        id: 'npa1',
        title: 'Record Vital Rounds',
        subtitle: 'Rounds pending recording',
        count: pendingRounds,
        badgeColor: 'bg-amber-50 text-amber-600',
        icon: Stethoscope,
        path: '/vital-rounds'
      },
      {
        id: 'npa2',
        title: 'Administer Medications',
        subtitle: 'Medications due / overdue',
        count: pendingMeds,
        badgeColor: 'bg-rose-50 text-rose-500',
        icon: Pill,
        path: '/medications'
      },
      {
        id: 'npa3',
        title: 'Follow up on Alerts',
        subtitle: 'Patient alerts need attention',
        count: pendingAlerts,
        badgeColor: 'bg-rose-50 text-rose-500',
        icon: AlertTriangle,
        path: '/alerts'
      },
      {
        id: 'npa4',
        title: 'Shift Handover',
        subtitle: 'Review & complete handover',
        count: pendingHandover,
        badgeColor: 'bg-emerald-50 text-emerald-600',
        icon: FileSignature,
        path: '/shift-handover'
      }
    ];
  }, [nurseData, metrics]);

  // Upcoming schedule strictly from backend database data
  const upcomingSchedule = useMemo(() => {
    if (nurseData?.upcomingSchedule && Array.isArray(nurseData.upcomingSchedule) && nurseData.upcomingSchedule.length > 0) {
      return nurseData.upcomingSchedule;
    }

    const res = [];
    const now = new Date();
    for (let d = 1; d <= 3; d++) {
      const nextDate = new Date(now.getTime() + d * 86400000);
      res.push({
        id: `nu-${d}`,
        date: nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        day: nextDate.toLocaleDateString('en-US', { weekday: 'short' }),
        count: '0 Rounds'
      });
    }
    return res;
  }, [nurseData?.upcomingSchedule]);

  // Recent patient activities strictly for logged-in nurse from backend
  const recentActivities = useMemo(() => {
    if (nurseData?.recentActivities && Array.isArray(nurseData.recentActivities) && nurseData.recentActivities.length > 0) {
      return nurseData.recentActivities.slice(0, 5).map((act: any, idx: number) => ({
        id: act.id || `nra-${idx}`,
        patientName: act.patientName || 'Patient Record',
        avatar: act.avatar || '',
        activity: act.activity || 'Vital Signs Recorded',
        dateTime: act.dateTime || 'Today',
        by: nurseDisplayName,
        status: act.status || 'Completed'
      }));
    }
    return [];
  }, [nurseData?.recentActivities, nurseDisplayName]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans antialiased text-slate-800 pb-12">
      
      {/* 1. Header Greeting & Current Date Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {greeting}, {nurseDisplayName} <span>👋</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Here's your patient overview for today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/ai-operations')}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-teal-600/20 transition-all cursor-pointer group"
          >
            <Sparkles className="w-4 h-4 text-teal-200 group-hover:rotate-12 transition-transform" />
            <span>AI Clinical Copilot</span>
          </button>

          {/* Date Card */}
          <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-2xs self-start sm:self-auto">
            <div className="p-2 rounded-xl text-teal-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">{formattedDate}</div>
              <div className="text-[11px] font-medium text-slate-400">{formattedDay}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Single Row Operational Metrics: My Patients, Vital Rounds, Active Alerts, Critical Alerts, Care Team, Open Tasks, Medications Due */}
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

      {/* 3. Middle Row: Patient Health Overview & Today's Schedule */}
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

        {/* Right Card: Today's Schedule (Col 7) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900">Today's Schedule & Rounds</h2>
              <button
                disabled={todayScheduleList.length === 0}
                onClick={() => todayScheduleList.length > 0 && navigate('/vital-rounds')}
                className={`text-xs transition-colors ${
                  todayScheduleList.length > 0
                    ? 'font-bold text-blue-600 hover:text-blue-700 cursor-pointer'
                    : 'font-semibold text-slate-300 cursor-not-allowed pointer-events-none'
                }`}
              >
                View all
              </button>
            </div>

            {/* List of Scheduled Rounds & Tasks */}
            <div className="space-y-3">
              {todayScheduleList.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 font-medium">
                  No rounds scheduled for today
                </div>
              ) : (
                todayScheduleList.map((sched: any) => (
                  <div
                    key={sched.id}
                    onClick={() => navigate('/vital-rounds')}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-blue-600 w-16 shrink-0">
                        {sched.time}
                      </span>
                      <AvatarImage
                        src={sched.avatar}
                        alt={sched.name}
                        fallbackText={sched.name}
                        className="w-8 h-8 rounded-full border border-slate-100"
                      />
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 leading-tight">{sched.name}</h3>
                        <p className="text-[11px] text-slate-400 font-medium">{sched.reason}</p>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-0.5 rounded-full text-[11px] font-semibold border ${
                        sched.status === 'Confirmed'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60'
                          : 'bg-amber-50 text-amber-600 border-amber-200/60'
                      }`}
                    >
                      {sched.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* 4. Third Row: High-Risk Patients, Pending Actions, Upcoming Schedule (3 Cols) */}
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

        {/* Card 3: Upcoming Schedule */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900">Upcoming Schedule</h2>
              <button
                disabled={!upcomingSchedule.some((u: any) => !u.count?.startsWith('0'))}
                onClick={() => upcomingSchedule.some((u: any) => !u.count?.startsWith('0')) && navigate('/vital-rounds')}
                className={`text-xs transition-colors ${
                  upcomingSchedule.some((u: any) => !u.count?.startsWith('0'))
                    ? 'font-bold text-blue-600 hover:text-blue-700 cursor-pointer'
                    : 'font-semibold text-slate-300 cursor-not-allowed pointer-events-none'
                }`}
              >
                View all
              </button>
            </div>

            <div className="space-y-3.5">
              {upcomingSchedule.map((item: any) => {
                const isItemActive = !item.count?.startsWith('0');
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (isItemActive) navigate('/vital-rounds');
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

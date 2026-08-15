import React, { useState, useEffect } from 'react';
import {
  Users,
  Heart,
  AlertTriangle,
  ClipboardCheck,
  Percent,
  Calendar,
  Filter,
  Download,
  ExternalLink,
  UserPlus,
  Pill,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Pagination } from '@/components/common/Pagination';
import { api } from '@/lib/api';

export const ReportsOverviewPage: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.getReportsOverview()
      .then((res) => setData(res))
      .catch(console.error);
  }, []);

  const kpis = data?.kpis || {
    totalPatients: 1248,
    activeEpisodes: 892,
    alertsRaised: 28,
    tasksCompleted: 156,
    medicationsAdministered: 2354,
  };

  const getActivityIcon = (typeStr: string) => {
    if (typeStr.includes('Admission')) return <div className="h-7 w-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><UserPlus className="h-3.5 w-3.5" /></div>;
    if (typeStr.includes('Missed')) return <div className="h-7 w-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"><Pill className="h-3.5 w-3.5" /></div>;
    if (typeStr.includes('Alert')) return <div className="h-7 w-7 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0"><Bell className="h-3.5 w-3.5" /></div>;
    if (typeStr.includes('Task')) return <div className="h-7 w-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><CheckCircle2 className="h-3.5 w-3.5" /></div>;
    return <div className="h-7 w-7 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0"><Pill className="h-3.5 w-3.5" /></div>;
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Reports & Analytics"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Reports & Analytics' },
        ]}
        actions={
          <>
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>May 13 – May 19, 2025</span>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm">
              <Filter className="h-4 w-4" /> Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20">
              <Download className="h-4 w-4" /> Export Report
            </button>
          </>
        }
      />

      {/* Top 5 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { title: 'Total Patients', value: kpis.totalPatients.toLocaleString(), change: '↑ 8.5% vs last 7 days', icon: Users, bg: 'bg-purple-100 text-purple-600' },
          { title: 'Active Episodes', value: kpis.activeEpisodes.toLocaleString(), change: '↑ 6.2% vs last 7 days', icon: Heart, bg: 'bg-emerald-100 text-emerald-600' },
          { title: 'Alerts Raised', value: kpis.alertsRaised.toString(), change: '↑ 27.3% vs last 7 days', icon: AlertTriangle, bg: 'bg-amber-100 text-amber-600', isAlert: true },
          { title: 'Tasks Completed', value: kpis.tasksCompleted.toString(), change: '↑ 11.8% vs last 7 days', icon: ClipboardCheck, bg: 'bg-blue-100 text-blue-600' },
          { title: 'Medications Administered', value: kpis.medicationsAdministered.toLocaleString(), change: '↑ 9.7% vs last 7 days', icon: Percent, bg: 'bg-pink-100 text-pink-600' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 card-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className={`h-9 w-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className="h-4 w-4 stroke-[2]" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-[11px] font-medium text-slate-500">{stat.title}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{stat.value}</h3>
            </div>
            <p className={`mt-2 text-[11px] font-semibold ${stat.isAlert ? 'text-rose-600' : 'text-emerald-600'}`}>
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Grid of 6 Analytics Charts / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Patient Trend */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-sm text-slate-900">Patient Trend</h4>
              <p className="text-[10px] text-slate-400 font-medium">New vs Discharged Patients</p>
            </div>
            <button className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
              View full report <ExternalLink className="h-3 w-3" />
            </button>
          </div>
          <div className="flex items-center justify-center gap-4 text-[11px] font-semibold mb-4">
            <span className="flex items-center gap-1 text-blue-600"><span className="h-2 w-2 rounded-full bg-blue-600"></span> New Patients</span>
            <span className="flex items-center gap-1 text-teal-500"><span className="h-2 w-2 rounded-full bg-teal-500"></span> Discharged Patients</span>
          </div>
          <div className="h-40 flex items-end justify-between gap-2 border-b border-slate-200 pb-2 px-2">
            {[
              { day: 'May 13', newP: 60, disP: 30 },
              { day: 'May 14', newP: 75, disP: 45 },
              { day: 'May 15', newP: 65, disP: 35 },
              { day: 'May 16', newP: 90, disP: 50 },
              { day: 'May 17', newP: 70, disP: 40 },
              { day: 'May 18', newP: 80, disP: 42 },
              { day: 'May 19', newP: 92, disP: 52 },
            ].map((pt, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full flex justify-center items-end gap-1 h-28">
                  <div className="w-2.5 bg-blue-600 rounded-t" style={{ height: `${pt.newP}%` }}></div>
                  <div className="w-2.5 bg-teal-400 rounded-t" style={{ height: `${pt.disP}%` }}></div>
                </div>
                <span className="text-[9px] text-slate-400 font-medium">{pt.day.split(' ')[1]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Alerts by Severity */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-sm text-slate-900">Alerts by Severity</h4>
              <p className="text-[10px] text-slate-400 font-medium">Distribution of alerts by severity</p>
            </div>
            <button className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
              View full report <ExternalLink className="h-3 w-3" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="relative h-32 w-32 flex items-center justify-center">
              <svg className="h-32 w-32 transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-emerald-500" strokeWidth="4" strokeDasharray="18, 100" strokeDashoffset="0" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-blue-500" strokeWidth="4" strokeDasharray="32, 100" strokeDashoffset="-18" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-amber-500" strokeWidth="4" strokeDasharray="28, 100" strokeDashoffset="-50" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-rose-500" strokeWidth="4" strokeDasharray="21, 100" strokeDashoffset="-78" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-bold text-slate-900">28</span>
                <span className="text-[9px] text-slate-400 font-medium">Total Alerts</span>
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded bg-rose-500"></span> <span className="font-medium text-slate-600">Critical</span> <span className="font-bold text-slate-900 ml-auto">6 (21.4%)</span></div>
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded bg-amber-500"></span> <span className="font-medium text-slate-600">High</span> <span className="font-bold text-slate-900 ml-auto">8 (28.6%)</span></div>
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded bg-blue-500"></span> <span className="font-medium text-slate-600">Medium</span> <span className="font-bold text-slate-900 ml-auto">9 (32.1%)</span></div>
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded bg-emerald-500"></span> <span className="font-medium text-slate-600">Low</span> <span className="font-bold text-slate-900 ml-auto">5 (17.9%)</span></div>
            </div>
          </div>
        </div>

        {/* Card 3: Tasks Overview */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-sm text-slate-900">Tasks Overview</h4>
              <p className="text-[10px] text-slate-400 font-medium">Tasks by status</p>
            </div>
            <button className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
              View full report <ExternalLink className="h-3 w-3" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="relative h-32 w-32 flex items-center justify-center">
              <svg className="h-32 w-32 transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-rose-500" strokeWidth="4" strokeDasharray="4, 100" strokeDashoffset="0" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-purple-500" strokeWidth="4" strokeDasharray="40, 100" strokeDashoffset="-4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-blue-500" strokeWidth="4" strokeDasharray="22, 100" strokeDashoffset="-44" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-emerald-500" strokeWidth="4" strokeDasharray="35, 100" strokeDashoffset="-66" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-bold text-slate-900">156</span>
                <span className="text-[9px] text-slate-400 font-medium">Total Tasks</span>
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded bg-emerald-500"></span> <span className="font-medium text-slate-600">Completed</span> <span className="font-bold text-slate-900 ml-auto">54 (34.6%)</span></div>
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded bg-blue-500"></span> <span className="font-medium text-slate-600">In Progress</span> <span className="font-bold text-slate-900 ml-auto">34 (21.8%)</span></div>
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded bg-purple-500"></span> <span className="font-medium text-slate-600">Pending</span> <span className="font-bold text-slate-900 ml-auto">62 (39.7%)</span></div>
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded bg-rose-500"></span> <span className="font-medium text-slate-600">Overdue</span> <span className="font-bold text-slate-900 ml-auto">6 (3.8%)</span></div>
            </div>
          </div>
        </div>

        {/* Card 4: Top Conditions */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-sm text-slate-900">Top Conditions</h4>
              <p className="text-[10px] text-slate-400 font-medium">Patients by primary condition</p>
            </div>
            <button className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
              View full report <ExternalLink className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-2.5">
            {[
              { label: 'Hypertension', val: 320, width: '80%' },
              { label: 'Diabetes Mellitus', val: 280, width: '70%' },
              { label: 'COPD', val: 190, width: '48%' },
              { label: 'Coronary Artery Disease', val: 150, width: '38%' },
              { label: 'Asthma', val: 110, width: '28%' },
            ].map((c, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{c.label}</span>
                  <span>{c.val}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: c.width }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 5: Medication Administration */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-sm text-slate-900">Medication Administration</h4>
              <p className="text-[10px] text-slate-400 font-medium">Administration status</p>
            </div>
            <button className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
              View full report <ExternalLink className="h-3 w-3" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="relative h-32 w-32 flex items-center justify-center">
              <svg className="h-32 w-32 transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-rose-500" strokeWidth="4" strokeDasharray="7, 100" strokeDashoffset="0" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-amber-500" strokeWidth="4" strokeDasharray="18, 100" strokeDashoffset="-7" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-emerald-500" strokeWidth="4" strokeDasharray="75, 100" strokeDashoffset="-25" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-bold text-slate-900">2,354</span>
                <span className="text-[9px] text-slate-400 font-medium">Total</span>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded bg-emerald-500"></span> <span className="font-medium text-slate-600">On Time</span> <span className="font-bold text-slate-900 ml-auto">1,782 (75.7%)</span></div>
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded bg-amber-500"></span> <span className="font-medium text-slate-600">Late</span> <span className="font-bold text-slate-900 ml-auto">412 (17.5%)</span></div>
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded bg-rose-500"></span> <span className="font-medium text-slate-600">Missed</span> <span className="font-bold text-slate-900 ml-auto">160 (6.8%)</span></div>
            </div>
          </div>
        </div>

        {/* Card 6: Occupancy Overview */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-bold text-sm text-slate-900">Occupancy Overview</h4>
              <p className="text-[10px] text-slate-400 font-medium">Bed occupancy across locations</p>
            </div>
            <button className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
              View full report <ExternalLink className="h-3 w-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="text-[10px] text-slate-400 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="pb-1.5">Location / Unit</th>
                  <th className="pb-1.5">Occupied</th>
                  <th className="pb-1.5">Available</th>
                  <th className="pb-1.5">Occupancy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {[
                  { unit: 'ICU', occ: 28, avail: 12, rate: '70%', bar: 'bg-emerald-500' },
                  { unit: 'Medical Ward', occ: 142, avail: 38, rate: '78%', bar: 'bg-emerald-500' },
                  { unit: 'Surgical Ward', occ: 96, avail: 24, rate: '80%', bar: 'bg-emerald-500' },
                  { unit: 'Rehab Unit', occ: 34, avail: 16, rate: '68%', bar: 'bg-emerald-500' },
                  { unit: 'Pediatrics', occ: 18, avail: 12, rate: '60%', bar: 'bg-emerald-500' },
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="py-2 font-bold text-slate-900">{row.unit}</td>
                    <td className="py-2">{row.occ}</td>
                    <td className="py-2">{row.avail}</td>
                    <td className="py-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800">{row.rate}</span>
                        <div className="w-12 bg-slate-100 rounded-full h-1.5">
                          <div className={`${row.bar} h-1.5 rounded-full`} style={{ width: row.rate }}></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Table: Recent Activity Summary */}
      <div className="bg-white rounded-xl border border-slate-200 card-shadow p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm text-slate-900">Recent Activity Summary</h4>
          <button className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
            View full report <ExternalLink className="h-3 w-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-3">Activity Type</th>
                <th className="p-3">Details</th>
                <th className="p-3">Related To</th>
                <th className="p-3">Location / Unit</th>
                <th className="p-3">Date & Time</th>
                <th className="p-3">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(data?.recentActivities || [
                { activityType: 'Patient Admission', details: 'New patient admitted', relatedTo: 'Mary Johnson (PID-10023)', locationUnit: 'West Wing - Room 302', dateTimeText: 'May 19, 2025 10:15 AM', performedBy: 'Nurse Sarah' },
                { activityType: 'Medication Missed', details: 'Paracetamol 500mg - Missed dose', relatedTo: 'Robert Brown (PID-10015)', locationUnit: 'ICU - Bed 12', dateTimeText: 'May 19, 2025 09:45 AM', performedBy: 'Nurse Priya' },
                { activityType: 'Alert Raised', details: 'High Heart Rate - 120 bpm', relatedTo: 'Linda Davis (PID-10031)', locationUnit: 'ICU - Bed 08', dateTimeText: 'May 19, 2025 08:30 AM', performedBy: 'Nurse James' },
                { activityType: 'Task Completed', details: 'Physician Rounds', relatedTo: 'Multiple Patients', locationUnit: 'West Wing', dateTimeText: 'May 19, 2025 08:00 AM', performedBy: 'Dr. Michael Brown' },
                { activityType: 'Medication Given', details: 'Amlodipine 5mg', relatedTo: 'William Taylor (PID-10008)', locationUnit: 'Medical Ward - 210', dateTimeText: 'May 19, 2025 07:45 AM', performedBy: 'Nurse Linda' },
              ]).map((act: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      {getActivityIcon(act.activityType)}
                      <span className="font-bold text-slate-900">{act.activityType}</span>
                    </div>
                  </td>
                  <td className="p-3 font-semibold text-slate-800">{act.details}</td>
                  <td className="p-3 font-medium text-slate-600">{act.relatedTo}</td>
                  <td className="p-3 font-medium text-slate-600">{act.locationUnit}</td>
                  <td className="p-3 text-[11px] text-slate-500 font-medium">{act.dateTimeText}</td>
                  <td className="p-3 font-bold text-slate-800">{act.performedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={1}
          totalPages={1}
          totalResults={5}
          pageSize={10}
          onPageChange={() => {}}
          onPageSizeChange={() => {}}
          itemLabel="activities"
        />
      </div>
    </div>
  );
};

export default ReportsOverviewPage;

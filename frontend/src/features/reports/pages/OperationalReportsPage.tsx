import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  LogOut,
  Bed,
  Users,
  CalendarCheck,
  Calendar,
  Filter,
  Download,
  Info,
  ExternalLink,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { api } from '@/lib/api';

export const OperationalReportsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [viewBy, setViewBy] = useState('Daily');

  useEffect(() => {
    api.getOperationalReports()
      .then((res) => setData(res))
      .catch(console.error);
  }, []);

  const kpis = data?.kpis || {
    totalAdmissions: 78,
    totalDischarges: 65,
    avgLengthOfStay: '5.6 days',
    bedOccupancyRate: '82.6%',
    activePatients: 1248,
    appointmentsCompleted: 356,
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Reports & Analytics"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Reports & Analytics', href: '/reports/overview' },
          { label: 'Operational Reports' },
        ]}
        actions={
          <>
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>May 13 – May 19, 2025</span>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm">
              <Filter className="h-4 w-4" /> Filters
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm">
              <Download className="h-4 w-4" /> Export
            </button>
          </>
        }
      />

      {/* Subtitle & Info Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Operational Reports</h2>
          <p className="text-xs text-slate-500 font-medium">Monitor daily operations and facility performance</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl text-[11px] font-semibold text-blue-700">
          <Info className="h-3.5 w-3.5" />
          <span>All times shown in your local time zone</span>
        </div>
      </div>

      {/* Top 6 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { title: 'Total Admissions', value: kpis.totalAdmissions.toString(), change: '↑ 12.4% vs last 7 days', icon: UserPlus, bg: 'bg-blue-100 text-blue-600', isUp: true },
          { title: 'Total Discharges', value: kpis.totalDischarges.toString(), change: '↑ 8.7% vs last 7 days', icon: LogOut, bg: 'bg-purple-100 text-purple-600', isUp: true },
          { title: 'Average Length of Stay', value: kpis.avgLengthOfStay, change: '↓ 2.3% vs last 7 days', icon: Bed, bg: 'bg-indigo-100 text-indigo-600', isUp: false },
          { title: 'Bed Occupancy Rate', value: kpis.bedOccupancyRate, change: '↑ 4.5% vs last 7 days', icon: Bed, bg: 'bg-emerald-100 text-emerald-600', isUp: true },
          { title: 'Active Patients', value: kpis.activePatients.toLocaleString(), change: '↑ 6.2% vs last 7 days', icon: Users, bg: 'bg-cyan-100 text-cyan-600', isUp: true },
          { title: 'Appointments Completed', value: kpis.appointmentsCompleted.toString(), change: '↑ 9.1% vs last 7 days', icon: CalendarCheck, bg: 'bg-amber-100 text-amber-600', isUp: true },
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
            <p className={`mt-2 text-[11px] font-semibold ${stat.isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col text-[10px] text-slate-400">
            <span>Location / Unit</span>
            <select className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium">
              <option value="All">All Locations</option>
              <option value="Main Hospital">Main Hospital</option>
              <option value="West Wing">West Wing</option>
            </select>
          </div>

          <div className="flex flex-col text-[10px] text-slate-400">
            <span>Department</span>
            <select className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium">
              <option value="All">All Departments</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Emergency">Emergency Care</option>
            </select>
          </div>

          <div className="flex flex-col text-[10px] text-slate-400">
            <span>Care Unit</span>
            <select className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium">
              <option value="All">All Units</option>
              <option value="ICU">ICU</option>
              <option value="Med-Surg">Med-Surg Unit</option>
            </select>
          </div>

          <div className="flex flex-col text-[10px] text-slate-400">
            <span>Service Type</span>
            <select className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium">
              <option value="All">All Types</option>
              <option value="Inpatient">Inpatient</option>
              <option value="Outpatient">Outpatient</option>
            </select>
          </div>
        </div>

        {/* View By Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 px-2">View By</span>
          {['Daily', 'Weekly', 'Monthly'].map((opt) => (
            <button
              key={opt}
              onClick={() => setViewBy(opt)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                viewBy === opt ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of 4 Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Chart 1: Admissions vs Discharges */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
          <h4 className="font-bold text-xs text-slate-900 mb-3">Admissions vs Discharges</h4>
          <div className="flex items-center gap-3 text-[10px] font-semibold mb-4">
            <span className="flex items-center gap-1 text-purple-600"><span className="h-2 w-2 rounded-full bg-purple-600"></span> Admissions</span>
            <span className="flex items-center gap-1 text-teal-500"><span className="h-2 w-2 rounded-full bg-teal-500"></span> Discharges</span>
          </div>
          <div className="h-36 flex items-end justify-between gap-1.5 border-b border-slate-200 pb-2">
            {[
              { day: 'May 13', adm: 60, dis: 40 },
              { day: 'May 14', adm: 75, dis: 50 },
              { day: 'May 15', adm: 65, dis: 40 },
              { day: 'May 17', adm: 80, dis: 50 },
              { day: 'May 18', adm: 68, dis: 42 },
              { day: 'May 19', adm: 88, dis: 54 },
            ].map((pt, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full flex justify-center items-end gap-1 h-24">
                  <div className="w-2 bg-purple-600 rounded-t" style={{ height: `${pt.adm}%` }}></div>
                  <div className="w-2 bg-teal-400 rounded-t" style={{ height: `${pt.dis}%` }}></div>
                </div>
                <span className="text-[9px] text-slate-400 font-medium">{pt.day.split(' ')[1]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Bed Occupancy Trend */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow relative">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-xs text-slate-900">Bed Occupancy Trend (%)</h4>
            <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[10px]">82.6%</span>
          </div>
          <div className="h-44 flex items-end justify-between gap-2 border-b border-slate-200 pb-2 px-1">
            {[
              { day: 'May 13', val: 78.1 },
              { day: 'May 15', val: 79.3 },
              { day: 'May 17', val: 82.0 },
              { day: 'May 19', val: 82.6 },
            ].map((pt, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full bg-blue-100 rounded-t flex items-end justify-center" style={{ height: `${pt.val}%` }}>
                  <div className="w-full bg-blue-600/30 border-t-2 border-blue-600 rounded-t h-full"></div>
                </div>
                <span className="text-[9px] text-slate-400 font-medium">{pt.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 3: Patient Flow Summary */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
          <h4 className="font-bold text-xs text-slate-900 mb-3">Patient Flow Summary</h4>
          <div className="flex items-center justify-between">
            <div className="relative h-28 w-28 flex items-center justify-center">
              <svg className="h-28 w-28 transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-purple-600" strokeWidth="4" strokeDasharray="51.4, 100" strokeDashoffset="0" stroke="currentColor" fill="none" />
                <path className="text-cyan-500" strokeWidth="4" strokeDasharray="34.9, 100" strokeDashoffset="-51.4" stroke="currentColor" fill="none" />
                <path className="text-amber-500" strokeWidth="4" strokeDasharray="9.0, 100" strokeDashoffset="-86.3" stroke="currentColor" fill="none" />
                <path className="text-rose-500" strokeWidth="4" strokeDasharray="4.7, 100" strokeDashoffset="-95.3" stroke="currentColor" fill="none" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-sm font-bold text-slate-900">1,248</span>
                <span className="text-[8px] text-slate-400 font-medium">Total Patients</span>
              </div>
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-purple-600"></span> <span className="font-medium text-slate-600">Inpatients</span> <span className="font-bold text-slate-900 ml-auto">642 (51.4%)</span></div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-cyan-500"></span> <span className="font-medium text-slate-600">Outpatients</span> <span className="font-bold text-slate-900 ml-auto">436 (34.9%)</span></div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-amber-500"></span> <span className="font-medium text-slate-600">Day Care</span> <span className="font-bold text-slate-900 ml-auto">112 (9.0%)</span></div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-rose-500"></span> <span className="font-medium text-slate-600">ICU</span> <span className="font-bold text-slate-900 ml-auto">58 (4.7%)</span></div>
            </div>
          </div>
        </div>

        {/* Chart 4: Appointments by Status */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
          <h4 className="font-bold text-xs text-slate-900 mb-3">Appointments by Status</h4>
          <div className="flex items-center justify-between">
            <div className="relative h-28 w-28 flex items-center justify-center">
              <svg className="h-28 w-28 transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-emerald-500" strokeWidth="4" strokeDasharray="69.1, 100" strokeDashoffset="0" stroke="currentColor" fill="none" />
                <path className="text-rose-500" strokeWidth="4" strokeDasharray="13.5, 100" strokeDashoffset="-69.1" stroke="currentColor" fill="none" />
                <path className="text-amber-500" strokeWidth="4" strokeDasharray="9.0, 100" strokeDashoffset="-82.6" stroke="currentColor" fill="none" />
                <path className="text-blue-500" strokeWidth="4" strokeDasharray="8.4, 100" strokeDashoffset="-91.6" stroke="currentColor" fill="none" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-sm font-bold text-slate-900">356</span>
                <span className="text-[8px] text-slate-400 font-medium">Total</span>
              </div>
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-emerald-500"></span> <span className="font-medium text-slate-600">Completed</span> <span className="font-bold text-slate-900 ml-auto">246 (69.1%)</span></div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-rose-500"></span> <span className="font-medium text-slate-600">Cancelled</span> <span className="font-bold text-slate-900 ml-auto">48 (13.5%)</span></div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-amber-500"></span> <span className="font-medium text-slate-600">No Show</span> <span className="font-bold text-slate-900 ml-auto">32 (9.0%)</span></div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-blue-500"></span> <span className="font-medium text-slate-600">Rescheduled</span> <span className="font-bold text-slate-900 ml-auto">30 (8.4%)</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Table: Operational Metrics */}
      <div className="bg-white rounded-xl border border-slate-200 card-shadow p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm text-slate-900">Operational Metrics</h4>
          <button className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
            View Full Report <ExternalLink className="h-3 w-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-3">Metric</th>
                <th className="p-3">Description</th>
                <th className="p-3">May 13</th>
                <th className="p-3">May 14</th>
                <th className="p-3">May 15</th>
                <th className="p-3">May 16</th>
                <th className="p-3">May 17</th>
                <th className="p-3">May 18</th>
                <th className="p-3">May 19</th>
                <th className="p-3">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {[
                { metric: 'New Admissions', desc: 'Number of new patient admissions', m13: '10', m14: '12', m15: '15', m16: '11', m17: '13', m18: '9', m19: '8', trend: '📈' },
                { metric: 'Discharges', desc: 'Number of patient discharges', m13: '8', m14: '9', m15: '11', m16: '10', m17: '9', m18: '11', m19: '7', trend: '📉' },
                { metric: 'Average Length of Stay (Days)', desc: 'Average stay duration for discharged patients', m13: '5.2', m14: '5.6', m15: '5.4', m16: '5.8', m17: '5.3', m18: '5.7', m19: '5.6', trend: '📊' },
                { metric: 'Bed Occupancy Rate (%)', desc: 'Percentage of occupied beds', m13: '78.1%', m14: '79.3%', m15: '81.6%', m16: '83.2%', m17: '82.0%', m18: '83.1%', m19: '82.6%', trend: '📈' },
                { metric: 'ICU Occupancy Rate (%)', desc: 'Percentage of occupied ICU beds', m13: '71.4%', m14: '72.0%', m15: '73.3%', m16: '74.6%', m17: '72.2%', m18: '73.8%', m19: '74.1%', trend: '📈' },
                { metric: 'Appointment Completed', desc: 'Total completed appointments', m13: '42', m14: '48', m15: '50', m16: '47', m17: '49', m18: '56', m19: '64', trend: '🚀' },
                { metric: 'No Show Rate (%)', desc: 'Percentage of missed appointments', m13: '8.6%', m14: '9.1%', m15: '8.3%', m16: '9.0%', m17: '8.7%', m18: '8.9%', m19: '8.5%', trend: '📉' },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-bold text-slate-900">{row.metric}</td>
                  <td className="p-3 text-slate-500 text-[11px]">{row.desc}</td>
                  <td className="p-3">{row.m13}</td>
                  <td className="p-3">{row.m14}</td>
                  <td className="p-3">{row.m15}</td>
                  <td className="p-3">{row.m16}</td>
                  <td className="p-3">{row.m17}</td>
                  <td className="p-3">{row.m18}</td>
                  <td className="p-3 font-bold text-blue-600">{row.m19}</td>
                  <td className="p-3 text-base">{row.trend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OperationalReportsPage;

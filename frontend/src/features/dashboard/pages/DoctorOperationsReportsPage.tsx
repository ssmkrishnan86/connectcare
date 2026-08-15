import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Filter,
  Download,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ArrowUpRight,
  Eye
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { api } from '@/lib/api';

export const DoctorOperationsReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [reportsData, setReportsData] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    api.getDoctorReportsOverview()
      .then((res: any) => {
        if (isMounted && res) {
          setReportsData(res);
        }
      })
      .catch((err) => console.error('Reports fetch error:', err));

    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = reportsData?.metrics || {
    totalAppointments: 1248,
    newPatients: 356,
    completedAppointments: 1032,
    cancelledAppointments: 128,
    noShowRatePercentage: 10.3,
    appointmentsTrend: [
      { date: 'May 15', count: 142 },
      { date: 'May 16', count: 156 },
      { date: 'May 17', count: 189 },
      { date: 'May 18', count: 143 },
      { date: 'May 19', count: 138 },
      { date: 'May 20', count: 176 },
      { date: 'May 21', count: 233 },
      { date: 'May 22', count: 171 },
    ],
    appointmentsByType: [
      { type: 'In-Person', count: 768, percentage: 61.5, color: '#6366F1' },
      { type: 'Video', count: 312, percentage: 25.0, color: '#3B82F6' },
      { type: 'Phone', count: 96, percentage: 7.7, color: '#10B981' },
      { type: 'Other', count: 72, percentage: 5.8, color: '#F59E0B' },
    ],
    departmentBreakdown: [
      { department: 'Cardiology', count: 342 },
      { department: 'General Medicine', count: 289 },
      { department: 'Orthopedics', count: 218 },
      { department: 'Pediatrics', count: 156 },
      { department: 'Dermatology', count: 102 },
      { department: 'Neurology', count: 84 },
      { department: 'Other', count: 57 },
    ],
    operationalSummary: {
      bedOccupancyRate: '72.6%',
      opdUtilization: '68.4%',
      theatreUtilization: '81.3%',
      labUtilization: '65.8%',
      radiologyUtilization: '69.1%'
    }
  };

  const customReports = reportsData?.customReports || [
    { reportName: 'Daily Operations Summary', category: 'Overview', generatedOn: 'May 22, 2024 09:00 AM', generatedBy: 'Dr. Sarah Wilson' },
    { reportName: 'Weekly Appointment Report', category: 'Appointments', generatedOn: 'May 22, 2024 08:30 AM', generatedBy: 'Dr. Sarah Wilson' },
    { reportName: 'Resource Utilization Report', category: 'Resource', generatedOn: 'May 22, 2024 06:15 AM', generatedBy: 'Dr. Sarah Wilson' },
    { reportName: 'Staff Performance Report', category: 'Staff', generatedOn: 'May 21, 2024 06:00 PM', generatedBy: 'Admin User' },
    { reportName: 'Revenue Operations Report', category: 'Revenue', generatedOn: 'May 21, 2024 05:30 PM', generatedBy: 'Admin User' }
  ];

  return (
    <div className="space-y-6 pb-12 font-sans antialiased text-slate-800">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Operations Reports</h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Track operational performance and efficiency across the organization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 transition-all">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        {[
          'Overview',
          'Appointments',
          'Resource Utilization',
          'Staff Performance',
          'Revenue Operations',
          'Service Requests',
          'Inventory',
          'Other'
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filter Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>May 15 - May 22, 2024</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1" />
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
            <span>All Locations</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
            <span>All Departments</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
            <span>All Providers</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50">
          <Filter className="h-4 w-4 text-slate-500" />
          Filters
        </button>
      </div>

      {/* Top 5 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Total Appointments</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{metrics.totalAppointments.toLocaleString()}</div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <ArrowUpRight className="h-3 w-3" />
            <span>12.5% vs Apr 15 - Apr 22</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">New Patients</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{metrics.newPatients}</div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <ArrowUpRight className="h-3 w-3" />
            <span>8.4% vs Apr 15 - Apr 22</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Completed Appointments</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{metrics.completedAppointments.toLocaleString()}</div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <ArrowUpRight className="h-3 w-3" />
            <span>11.2% vs Apr 15 - Apr 22</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Cancelled Appointments</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{metrics.cancelledAppointments}</div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-rose-600">
            <ArrowUpRight className="h-3 w-3" />
            <span>4.8% vs Apr 15 - Apr 22</span>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">No Show Rate</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{metrics.noShowRatePercentage}%</div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-rose-600">
            <ArrowUpRight className="h-3 w-3" />
            <span>2.1% vs Apr 15 - Apr 22</span>
          </div>
        </div>

      </div>

      {/* Row 2: Appointments Trend (Line Chart) & Appointments by Type (Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Line Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Appointments Trend</h2>
            <button className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600">
              By Day <ChevronDown className="h-3 w-3" />
            </button>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.appointmentsTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} domain={[0, 400]} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#6366F1" strokeWidth={2.5} dot={{ r: 4, fill: '#6366F1' }} name="Appointments" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Appointments by Type</h2>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <div className="w-36 h-36 relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={metrics.appointmentsByType} innerRadius={40} outerRadius={60} paddingAngle={4} dataKey="count">
                    {metrics.appointmentsByType.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-extrabold text-slate-900">1,248</span>
                <span className="text-[9px] font-bold text-slate-400">Total</span>
              </div>
            </div>

            <div className="space-y-2 text-xs font-semibold flex-1">
              {metrics.appointmentsByType.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    {item.type}
                  </span>
                  <span className="font-bold text-slate-900">{item.count} ({item.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Row 3: Department Breakdown, Average Waiting Time, Operational Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Department Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Department-wise Appointments</h2>
            <span className="text-xs font-semibold text-slate-400">This Week</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {metrics.departmentBreakdown.map((dept: any, idx: number) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>{dept.department}</span>
                  <span>{dept.count}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: `${Math.min((dept.count / 342) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Average Waiting Time */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Average Waiting Time</h2>
            <span className="text-xs font-semibold text-slate-400">This Week</span>
          </div>

          <div>
            <div className="text-3xl font-extrabold text-slate-900">24 <span className="text-sm font-bold text-slate-500">mins</span></div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600 mt-1">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>5 mins vs Apr 15 - Apr 22</span>
            </div>
          </div>

          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.appointmentsTrend}>
                <Line type="monotone" dataKey="count" stroke="#6366F1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operational Summary */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Operational Summary</h2>
            <div className="space-y-3 mt-4 text-xs font-semibold">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600">Bed Occupancy Rate</span>
                <span className="font-extrabold text-slate-900">{metrics.operationalSummary.bedOccupancyRate}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600">OPD Utilization</span>
                <span className="font-extrabold text-slate-900">{metrics.operationalSummary.opdUtilization}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600">Theatre Utilization</span>
                <span className="font-extrabold text-slate-900">{metrics.operationalSummary.theatreUtilization}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600">Lab Utilization</span>
                <span className="font-extrabold text-slate-900">{metrics.operationalSummary.labUtilization}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600">Radiology Utilization</span>
                <span className="font-extrabold text-slate-900">{metrics.operationalSummary.radiologyUtilization}</span>
              </div>
            </div>
          </div>

          <button className="text-xs font-bold text-indigo-600 hover:underline">View Full Summary →</button>
        </div>

      </div>

      {/* Row 4: Recent Operational Reports Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Recent Operational Reports</h2>
          <button className="text-xs font-bold text-indigo-600 hover:underline">View All Operational Reports →</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                <th className="pb-2">Report Name</th>
                <th className="pb-2">Category</th>
                <th className="pb-2">Generated On</th>
                <th className="pb-2">Generated By</th>
                <th className="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customReports.map((row: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-bold text-slate-900">{row.reportName}</td>
                  <td className="py-3 font-medium text-slate-500">{row.category}</td>
                  <td className="py-3 text-slate-500">{row.generatedOn}</td>
                  <td className="py-3 font-medium text-slate-700">{row.generatedBy}</td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

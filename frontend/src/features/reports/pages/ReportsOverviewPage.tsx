import React, { useState, useEffect } from 'react';
import {
  Users,
  Heart,
  AlertTriangle,
  ClipboardCheck,
  Percent,
  Calendar,
  UserPlus,
  Pill,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataImportExportToolbar } from '@/components/common/DataImportExportToolbar';
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
    totalPatients: 0,
    activeEpisodes: 0,
    alertsRaised: 0,
    tasksCompleted: 0,
    medicationsAdministered: 0,
  };

  const getActivityIcon = (typeStr: string = '') => {
    if (typeStr.includes('Admission')) return <div className="h-7 w-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><UserPlus className="h-3.5 w-3.5" /></div>;
    if (typeStr.includes('Missed')) return <div className="h-7 w-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"><Pill className="h-3.5 w-3.5" /></div>;
    if (typeStr.includes('Alert')) return <div className="h-7 w-7 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0"><Bell className="h-3.5 w-3.5" /></div>;
    if (typeStr.includes('Task')) return <div className="h-7 w-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><CheckCircle2 className="h-3.5 w-3.5" /></div>;
    return <div className="h-7 w-7 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0"><Pill className="h-3.5 w-3.5" /></div>;
  };

  const patientTrend = data?.patientTrend || [];
  const alertsBySeverity = data?.alertsBySeverity || [];
  const tasksOverview = data?.tasksOverview || [];
  const topConditions = data?.topConditions || [];
  const medicationAdministration = data?.medicationAdministration || [];
  const occupancyOverview = data?.occupancyOverview || [];
  const recentActivities = data?.recentActivities || [];

  const maxTrend = Math.max(1, ...patientTrend.map((p: any) => Math.max(p.newP || 0, p.disP || 0)));

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
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>Last 7 Days (Real Time)</span>
            </div>
            <DataImportExportToolbar
              moduleKey="reports"
              data={recentActivities}
              idField="id"
              onImportSuccess={() => api.getReportsOverview().then(setData)}
              customCreateApi={api.createCustomReport}
            />
          </div>
        }
      />

      {/* Top 5 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { title: 'Total Patients', value: kpis.totalPatients.toLocaleString(), change: 'Live Database', icon: Users, bg: 'bg-purple-100 text-purple-600' },
          { title: 'Active Episodes', value: kpis.activeEpisodes.toLocaleString(), change: 'Live Database', icon: Heart, bg: 'bg-emerald-100 text-emerald-600' },
          { title: 'Alerts Raised', value: kpis.alertsRaised.toString(), change: 'Live Database', icon: AlertTriangle, bg: 'bg-amber-100 text-amber-600', isAlert: true },
          { title: 'Tasks Completed', value: kpis.tasksCompleted.toString(), change: 'Live Database', icon: ClipboardCheck, bg: 'bg-blue-100 text-blue-600' },
          { title: 'Medications Prescribed', value: kpis.medicationsAdministered.toLocaleString(), change: 'Live Database', icon: Percent, bg: 'bg-pink-100 text-pink-600' },
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
            <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
              Live Data
            </span>
          </div>
          <div className="flex items-center justify-center gap-4 text-[11px] font-semibold mb-4">
            <span className="flex items-center gap-1 text-blue-600"><span className="h-2 w-2 rounded-full bg-blue-600"></span> New Patients</span>
            <span className="flex items-center gap-1 text-teal-500"><span className="h-2 w-2 rounded-full bg-teal-500"></span> Discharged Patients</span>
          </div>
          <div className="h-40 flex items-end justify-between gap-2 border-b border-slate-200 pb-2 px-2">
            {patientTrend.length > 0 ? (
              patientTrend.map((pt: any, i: number) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-full flex justify-center items-end gap-1 h-28">
                    <div className="w-2.5 bg-blue-600 rounded-t" style={{ height: `${Math.max(4, ((pt.newP || 0) / maxTrend) * 100)}%` }} title={`New: ${pt.newP || 0}`}></div>
                    <div className="w-2.5 bg-teal-400 rounded-t" style={{ height: `${Math.max(4, ((pt.disP || 0) / maxTrend) * 100)}%` }} title={`Discharged: ${pt.disP || 0}`}></div>
                  </div>
                  <span className="text-[9px] text-slate-400 font-medium">{pt.day || pt.date}</span>
                </div>
              ))
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                No patient trend data available
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Alerts by Severity */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-sm text-slate-900">Alerts by Severity</h4>
              <p className="text-[10px] text-slate-400 font-medium">Distribution of alerts by severity</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="relative h-32 w-32 flex items-center justify-center">
              <div className="h-28 w-28 rounded-full border-4 border-slate-100 flex flex-col items-center justify-center bg-slate-50">
                <span className="text-xl font-bold text-slate-900">{kpis.alertsRaised}</span>
                <span className="text-[9px] text-slate-400 font-medium">Active Alerts</span>
              </div>
            </div>
            <div className="space-y-1.5 text-xs flex-1 ml-4">
              {alertsBySeverity.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded" style={{ backgroundColor: item.color || '#3B82F6' }}></span>
                  <span className="font-medium text-slate-600">{item.name}</span>
                  <span className="font-bold text-slate-900 ml-auto">{item.count} ({item.percentage})</span>
                </div>
              ))}
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
          </div>
          <div className="flex items-center justify-between">
            <div className="relative h-32 w-32 flex items-center justify-center">
              <div className="h-28 w-28 rounded-full border-4 border-slate-100 flex flex-col items-center justify-center bg-slate-50">
                <span className="text-xl font-bold text-slate-900">
                  {tasksOverview.reduce((sum: number, t: any) => sum + (t.count || 0), 0)}
                </span>
                <span className="text-[9px] text-slate-400 font-medium">Total Tasks</span>
              </div>
            </div>
            <div className="space-y-1.5 text-xs flex-1 ml-4">
              {tasksOverview.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded" style={{ backgroundColor: item.color || '#10B981' }}></span>
                  <span className="font-medium text-slate-600">{item.name}</span>
                  <span className="font-bold text-slate-900 ml-auto">{item.count} ({item.percentage})</span>
                </div>
              ))}
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
          </div>
          <div className="space-y-2.5">
            {topConditions.length > 0 ? (
              topConditions.map((c: any, i: number) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{c.label || c.condition}</span>
                    <span>{c.val || c.count}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: c.width || '20%' }}></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 py-6 text-center">
                No patient conditions recorded yet
              </div>
            )}
          </div>
        </div>

        {/* Card 5: Medication Status */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-sm text-slate-900">Medication Administration</h4>
              <p className="text-[10px] text-slate-400 font-medium">Administration status</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="relative h-32 w-32 flex items-center justify-center">
              <div className="h-28 w-28 rounded-full border-4 border-slate-100 flex flex-col items-center justify-center bg-slate-50">
                <span className="text-xl font-bold text-slate-900">{kpis.medicationsAdministered}</span>
                <span className="text-[9px] text-slate-400 font-medium">Total Meds</span>
              </div>
            </div>
            <div className="space-y-2 text-xs flex-1 ml-4">
              {medicationAdministration.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded" style={{ backgroundColor: item.color || '#10B981' }}></span>
                  <span className="font-medium text-slate-600">{item.name}</span>
                  <span className="font-bold text-slate-900 ml-auto">{item.count} ({item.percentage})</span>
                </div>
              ))}
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
          </div>
          <div className="overflow-x-auto">
            {occupancyOverview.length > 0 ? (
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
                  {occupancyOverview.map((row: any, i: number) => (
                    <tr key={i}>
                      <td className="py-2 font-bold text-slate-900">{row.unit}</td>
                      <td className="py-2">{row.occ || row.occupied}</td>
                      <td className="py-2">{row.avail || row.available}</td>
                      <td className="py-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800">{row.rate}</span>
                          <div className="w-12 bg-slate-100 rounded-full h-1.5">
                            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: row.rate }}></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-xs text-slate-400 py-6 text-center">
                No location units created yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Table: Recent Activity Summary */}
      <div className="bg-white rounded-xl border border-slate-200 card-shadow p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm text-slate-900">Recent Activity Summary</h4>
        </div>
        <div className="overflow-x-auto">
          {recentActivities.length > 0 ? (
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
                {recentActivities.map((act: any, idx: number) => (
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
          ) : (
            <div className="text-xs text-slate-400 py-8 text-center">
              No recent activities recorded yet
            </div>
          )}
        </div>
        <Pagination
          currentPage={1}
          totalPages={1}
          totalResults={recentActivities.length}
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

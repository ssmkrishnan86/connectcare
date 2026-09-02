import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  LogOut,
  Bed,
  Users,
  CalendarCheck,
  Calendar,
  Download,
  Info,
  ExternalLink,
  X,
  Printer,
  FileText,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataImportExportToolbar } from '@/components/common/DataImportExportToolbar';
import { Pagination } from '@/components/common/Pagination';
import { api } from '@/lib/api';

export const OperationalReportsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [viewBy, setViewBy] = useState('Daily');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    api.getOperationalReports(viewBy)
      .then((res: any) => {
        const payload = res?.data || res;
        setData(payload);
      })
      .catch(console.error);
  }, [viewBy]);

  const handleViewReport = (title: string, category: string, description?: string) => {
    setSelectedReport({
      reportName: title,
      reportType: category,
      generatedByName: 'System Administrator',
      generatedByRole: 'Operations Analyst',
      generatedOnText: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      careUnit: 'Hospital-Wide Operations',
      description: description || `Operational performance analysis aggregated for ${viewBy.toLowerCase()} period reporting.`,
      format: 'PDF'
    });
    setIsViewModalOpen(true);
  };

  const handleDownloadReport = (report: any) => {
    const reportTitle = report?.reportName || 'Operational_Report';
    const content = `CONNECTCARE HEALTHCARE SYSTEM - EXECUTIVE OPERATIONAL REPORT
Title: ${reportTitle}
Period: ${viewBy}
Generated On: ${report?.generatedOnText || new Date().toLocaleString()}
Category: ${report?.reportType || 'Operational Analytics'}

KEY METRICS SUMMARY:
- Total Admissions: ${kpis.totalAdmissions}
- Total Discharges: ${kpis.totalDischarges}
- Avg Length of Stay: ${kpis.avgLengthOfStay}
- Bed Occupancy Rate: ${kpis.bedOccupancyRate}
- Active Patients: ${kpis.activePatients}
- Appointments Completed: ${kpis.appointmentsCompleted}

EXECUTIVE SUMMARY:
${report?.description || 'All operational metrics within standard operating parameters.'}
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${viewBy.toLowerCase()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const reportData = data?.data || data;
  const kpis = reportData?.kpis || {
    totalAdmissions: 0,
    totalDischarges: 0,
    avgLengthOfStay: '0 days',
    bedOccupancyRate: '0%',
    activePatients: 0,
    appointmentsCompleted: 0,
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
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>{new Date(Date.now() - 6 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <DataImportExportToolbar
              moduleKey="reports"
              data={reportData?.recentReports || []}
              idField="id"
              onImportSuccess={() => api.getOperationalReports(viewBy).then((res: any) => setData(res?.data || res))}
              customCreateApi={api.createCustomReport}
            />
          </div>
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
          { title: 'Total Admissions', value: kpis.totalAdmissions.toString(), change: 'Live', icon: UserPlus, bg: 'bg-blue-100 text-blue-600' },
          { title: 'Total Discharges', value: kpis.totalDischarges.toString(), change: 'Live', icon: LogOut, bg: 'bg-purple-100 text-purple-600' },
          { title: 'Average Length of Stay', value: kpis.avgLengthOfStay, change: 'Live', icon: Bed, bg: 'bg-indigo-100 text-indigo-600' },
          { title: 'Bed Occupancy Rate', value: kpis.bedOccupancyRate, change: 'Live', icon: Bed, bg: 'bg-emerald-100 text-emerald-600' },
          { title: 'Active Patients', value: kpis.activePatients.toLocaleString(), change: 'Live', icon: Users, bg: 'bg-cyan-100 text-cyan-600' },
          { title: 'Appointments Completed', value: kpis.appointmentsCompleted.toString(), change: 'Live', icon: CalendarCheck, bg: 'bg-amber-100 text-amber-600' },
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
            <p className="mt-2 text-[11px] font-semibold text-emerald-600">
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
            {(data?.admissionsTrend || []).length > 0 ? (
              (data?.admissionsTrend || []).map((pt: any, i: number) => {
                const maxVal = Math.max(1, ...((data?.admissionsTrend || []).map((x: any) => Math.max(x.adm || 0, x.dis || 0))));
                return (
                  <div key={i} className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full flex justify-center items-end gap-1 h-24">
                      <div className="w-2 bg-purple-600 rounded-t" style={{ height: `${Math.max(4, ((pt.adm || 0) / maxVal) * 100)}%` }} title={`Admissions: ${pt.adm}`}></div>
                      <div className="w-2 bg-teal-400 rounded-t" style={{ height: `${Math.max(4, ((pt.dis || 0) / maxVal) * 100)}%` }} title={`Discharges: ${pt.dis}`}></div>
                    </div>
                    <span className="text-[9px] text-slate-400 font-medium">{pt.day}</span>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                No trend data
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Bed Occupancy Trend */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow relative">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-xs text-slate-900">Bed Occupancy Rate</h4>
            <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[10px]">{kpis.bedOccupancyRate}</span>
          </div>
          <div className="h-36 flex items-center justify-center border-b border-slate-200 pb-2 px-1">
            <div className="flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-slate-900">{kpis.bedOccupancyRate}</span>
              <span className="text-xs text-slate-400 mt-1">Live Hospital Utilization</span>
            </div>
          </div>
        </div>

        {/* Chart 3: Patient Flow Summary */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
          <h4 className="font-bold text-xs text-slate-900 mb-3">Patient Flow Summary</h4>
          <div className="flex items-center justify-between">
            <div className="relative h-28 w-28 flex items-center justify-center">
              <div className="h-24 w-24 rounded-full border-4 border-slate-100 flex flex-col items-center justify-center bg-slate-50">
                <span className="text-sm font-bold text-slate-900">{kpis.activePatients}</span>
                <span className="text-[8px] text-slate-400 font-medium">Patients</span>
              </div>
            </div>
            <div className="space-y-1 text-[11px] flex-1 ml-3">
              {(data?.patientFlowSummary || []).map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded" style={{ backgroundColor: item.color || '#8B5CF6' }}></span>
                  <span className="font-medium text-slate-600">{item.category}</span>
                  <span className="font-bold text-slate-900 ml-auto">{item.count} ({item.percentage})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 4: Appointments by Status */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
          <h4 className="font-bold text-xs text-slate-900 mb-3">Appointments by Status</h4>
          <div className="flex items-center justify-between">
            <div className="relative h-28 w-28 flex items-center justify-center">
              <div className="h-24 w-24 rounded-full border-4 border-slate-100 flex flex-col items-center justify-center bg-slate-50">
                <span className="text-sm font-bold text-slate-900">
                  {(data?.appointmentsByStatus || []).reduce((sum: number, x: any) => sum + (x.count || 0), 0)}
                </span>
                <span className="text-[8px] text-slate-400 font-medium">Total</span>
              </div>
            </div>
            <div className="space-y-1 text-[11px] flex-1 ml-3">
              {(data?.appointmentsByStatus || []).map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded" style={{ backgroundColor: item.color || '#10B981' }}></span>
                  <span className="font-medium text-slate-600">{item.status}</span>
                  <span className="font-bold text-slate-900 ml-auto">{item.count} ({item.percentage})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Table: Operational Metrics */}
      <div className="bg-white rounded-xl border border-slate-200 card-shadow p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm text-slate-900">Operational Metrics</h4>
          <button 
            onClick={() => handleViewReport('Operational Metrics Overview', 'Operational Reports', 'Detailed breakdown of hospital operational metrics across admissions, discharges, length of stay, and bed occupancy.')}
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            View Full Report <ExternalLink className="h-3 w-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-3">Metric</th>
                <th className="p-3">Description</th>
                <th className="p-3">{data?.days?.[0] || 'Day 1'}</th>
                <th className="p-3">{data?.days?.[1] || 'Day 2'}</th>
                <th className="p-3">{data?.days?.[2] || 'Day 3'}</th>
                <th className="p-3">{data?.days?.[3] || 'Day 4'}</th>
                <th className="p-3">{data?.days?.[4] || 'Day 5'}</th>
                <th className="p-3">{data?.days?.[5] || 'Day 6'}</th>
                <th className="p-3">{data?.days?.[6] || 'Day 7'}</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {(data?.operationalMetrics || []).slice((currentPage - 1) * pageSize, currentPage * pageSize).map((row: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-bold text-slate-900">{row.metric}</td>
                  <td className="p-3 text-slate-500 text-[11px]">{row.description || row.desc}</td>
                  <td className="p-3">{row.m1}</td>
                  <td className="p-3">{row.m2}</td>
                  <td className="p-3">{row.m3}</td>
                  <td className="p-3">{row.m4}</td>
                  <td className="p-3">{row.m5}</td>
                  <td className="p-3">{row.m6}</td>
                  <td className="p-3 font-bold text-blue-600">{row.m7}</td>
                  <td className="p-3">
                    <button 
                      onClick={() => handleViewReport(row.metric, 'Operational Metrics', row.description || row.desc)}
                      className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={Math.max(1, Math.ceil(((data?.operationalMetrics || []).length || 1) / pageSize))}
          totalResults={(data?.operationalMetrics || []).length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="metrics"
        />
      </div>

      {/* Report Viewer Modal */}
      {isViewModalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{selectedReport.reportName}</h3>
                  <p className="text-xs text-slate-500 font-semibold">{selectedReport.reportType} • {viewBy} Period</p>
                </div>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Generated By</span>
                  <p className="font-extrabold text-slate-800">{selectedReport.generatedByName}</p>
                  <p className="text-[10px] text-slate-500 font-semibold">{selectedReport.generatedByRole}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Generated On</span>
                  <p className="font-extrabold text-slate-800">{selectedReport.generatedOnText}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Unit / Location</span>
                  <p className="font-extrabold text-slate-800">{selectedReport.careUnit}</p>
                </div>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 text-xs mb-1">Executive Summary</h4>
                <p className="text-slate-600 font-medium leading-relaxed bg-blue-50/40 p-3 rounded-xl border border-blue-100/60">
                  {selectedReport.description}
                </p>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 text-xs mb-2">Operational KPIs ({viewBy} View)</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 text-center">
                    <span className="text-[10px] font-bold text-purple-600">Total Admissions</span>
                    <p className="text-lg font-black text-purple-900 mt-0.5">{kpis.totalAdmissions}</p>
                  </div>
                  <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 text-center">
                    <span className="text-[10px] font-bold text-teal-600">Total Discharges</span>
                    <p className="text-lg font-black text-teal-900 mt-0.5">{kpis.totalDischarges}</p>
                  </div>
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-center">
                    <span className="text-[10px] font-bold text-blue-600">Occupancy Rate</span>
                    <p className="text-lg font-black text-blue-900 mt-0.5">{kpis.bedOccupancyRate}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs shadow-2xs transition-colors cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Print</span>
              </button>
              <button
                onClick={() => handleDownloadReport(selectedReport)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 transition-colors cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Download Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperationalReportsPage;

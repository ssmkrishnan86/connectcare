import React, { useState, useEffect } from 'react';
import {
  FileText,
  Calendar,
  Filter,
  Plus,
  Play,
  Edit2,
  Copy,
  MoreVertical,
  Search,
  Eye,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Info,
  Printer,
  X,
  Download,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Pagination } from '@/components/common/Pagination';
import { api } from '@/lib/api';
import { ReportCreateModal } from '../components/ReportCreateModal';

export const CustomReportsPage: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchReports = () => {
    api.getCustomReports(searchTerm)
      .then((res: any) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        setReports(list);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchReports();
  }, [searchTerm]);

  const handleViewReport = (reportName: string, category: string, description?: string) => {
    setSelectedReport({
      reportName: reportName || 'Custom Operational Report',
      reportType: category || 'Custom Reports',
      generatedByName: 'System Analyst',
      generatedByRole: 'Data Specialist',
      generatedOnText: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      careUnit: 'Custom Analytics Center',
      description: description || 'Custom ad-hoc hospital report query evaluated against live EF Core database records.',
      format: 'CSV'
    });
    setIsViewModalOpen(true);
  };

  const handleDownloadReport = (report: any) => {
    const reportTitle = report?.reportName || 'Custom_Report';
    const content = `CONNECTCARE HEALTHCARE SYSTEM - CUSTOM ANALYTICS REPORT
Title: ${reportTitle}
Generated On: ${report?.generatedOnText || new Date().toLocaleString()}
Category: ${report?.reportType || 'Custom Analytics'}

EXECUTIVE SUMMARY:
${report?.description || 'Custom report records retrieved successfully.'}
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* Page Header */}
      <PageHeader
        title="Reports & Analytics"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Reports & Analytics', href: '/reports/overview' },
          { label: 'Custom Reports' },
        ]}
        actions={
          <>
            <button className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm">
              <FileText className="h-4 w-4 text-slate-500" /> Import Report
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-500/20 transition-colors"
            >
              <Plus className="h-4 w-4" /> Create New Report
            </button>
          </>
        }
      />

      {/* Filter Your Report Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow space-y-3">
        <h4 className="font-bold text-xs text-slate-900">Filter Your Report</h4>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col text-[10px] text-slate-400 font-medium">
              <span>Date Range</span>
              <div className="mt-1 flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>May 13 – May 19, 2025</span>
              </div>
            </div>

            <div className="flex flex-col text-[10px] text-slate-400 font-medium">
              <span>Location / Unit</span>
              <select className="mt-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
                <option>All Locations</option>
                <option>Main Campus</option>
                <option>West Wing</option>
              </select>
            </div>

            <div className="flex flex-col text-[10px] text-slate-400 font-medium">
              <span>Department</span>
              <select className="mt-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
                <option>All Departments</option>
                <option>Cardiology</option>
                <option>Emergency</option>
              </select>
            </div>

            <div className="flex flex-col text-[10px] text-slate-400 font-medium">
              <span>Data Source</span>
              <select className="mt-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
                <option>All Sources</option>
                <option>EHR Database</option>
                <option>Billing System</option>
              </select>
            </div>

            <button className="text-xs font-semibold text-purple-600 hover:underline pt-4 flex items-center gap-1">
              + Add Filter
            </button>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button className="flex items-center gap-1.5 px-3 py-2 border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-semibold transition-colors">
              <Eye className="h-4 w-4" /> Preview
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-500/20 transition-colors">
              <Play className="h-4 w-4 fill-white" /> Run Report
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: My Custom Reports (2/3) + Report Preview (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Reports Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 card-shadow p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">
                My Custom Reports ({reports.length || 12})
              </h3>
              <div className="flex items-center gap-3">
                <div className="relative w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search custom reports..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <select className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
                  <option>All Reports</option>
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Report Name</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Created By</th>
                    <th className="p-3">Last Modified</th>
                    <th className="p-3">Frequency</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {reports.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((r, idx) => (
                    <tr
                      key={r.id || idx}
                      onClick={() => setSelectedReportId(r.id)}
                      className={`hover:bg-purple-50/50 cursor-pointer transition-colors ${selectedReportId === r.id ? 'bg-purple-50/80 border-l-4 border-purple-600' : ''}`}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                            <FileText className="h-4 w-4" />
                          </div>
                          <span className="font-bold text-slate-900">{r.reportName}</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-500 text-[11px]">{r.description}</td>
                      <td className="p-3 font-semibold text-slate-800">{r.createdBy}</td>
                      <td className="p-3 text-[11px] text-slate-500">{r.lastModifiedText}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {r.frequency}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1 text-slate-400">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleViewReport(r.reportName, r.category || 'Custom Reports', r.description); }}
                            title="Run Report" 
                            className="p-1 hover:text-purple-600 cursor-pointer"
                          >
                            <Play className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleViewReport(r.reportName, r.category || 'Custom Reports', r.description); }}
                            title="View Report" 
                            className="p-1 hover:text-blue-600 cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDownloadReport(r); }}
                            title="Download Report" 
                            className="p-1 hover:text-slate-700 cursor-pointer"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={Math.max(1, Math.ceil(reports.length / pageSize))}
              totalResults={reports.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              itemLabel="reports"
            />
          </div>
        </div>

        {/* Right 1 Column: Report Preview Panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 card-shadow p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1">
                  Report Preview <Info className="h-3 w-3 text-slate-400" />
                </h4>
                <p className="font-bold text-sm text-purple-700 mt-0.5">Patient Census Summary</p>
                <p className="text-[10px] text-slate-400">May 13 – May 19, 2025 | All Locations</p>
              </div>
              <button className="text-[11px] font-semibold text-purple-600 hover:underline">Collapse</button>
            </div>

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-purple-50 rounded-xl border border-purple-100">
                <p className="text-[9px] font-medium text-slate-500">Total Patients</p>
                <p className="text-base font-bold text-purple-900 mt-0.5">1,248</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-[9px] font-medium text-slate-500">Inpatients</p>
                <p className="text-base font-bold text-blue-900 mt-0.5">642</p>
              </div>
              <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-[9px] font-medium text-slate-500">Outpatients</p>
                <p className="text-base font-bold text-emerald-900 mt-0.5">436</p>
              </div>
              <div className="p-2 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-[9px] font-medium text-slate-500">Day Care</p>
                <p className="text-base font-bold text-amber-900 mt-0.5">170</p>
                <span className="text-[8px] font-bold text-amber-600">13.6%</span>
              </div>
            </div>

            {/* Donut Chart: Patients by Location */}
            <div className="space-y-2">
              <h5 className="font-bold text-xs text-slate-900">Patients by Location</h5>
              <div className="flex items-center justify-between">
                <div className="relative h-28 w-28 flex items-center justify-center">
                  <svg className="h-28 w-28 transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-purple-600" strokeWidth="4" strokeDasharray="51.4, 100" strokeDashoffset="0" stroke="currentColor" fill="none" />
                    <path className="text-blue-500" strokeWidth="4" strokeDasharray="28.5, 100" strokeDashoffset="-51.4" stroke="currentColor" fill="none" />
                    <path className="text-cyan-500" strokeWidth="4" strokeDasharray="12.0, 100" strokeDashoffset="-79.9" stroke="currentColor" fill="none" />
                    <path className="text-amber-500" strokeWidth="4" strokeDasharray="6.4, 100" strokeDashoffset="-91.9" stroke="currentColor" fill="none" />
                    <path className="text-slate-400" strokeWidth="4" strokeDasharray="1.7, 100" strokeDashoffset="-98.3" stroke="currentColor" fill="none" />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-sm font-bold text-slate-900">1,248</span>
                    <span className="text-[8px] text-slate-400 font-medium">Total Patients</span>
                  </div>
                </div>
                <div className="space-y-1 text-[10px]">
                  <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-purple-600"></span> <span className="font-medium text-slate-600">Main Campus</span> <span className="font-bold text-slate-900 ml-auto">642 (51.4%)</span></div>
                  <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-blue-500"></span> <span className="font-medium text-slate-600">West Wing</span> <span className="font-bold text-slate-900 ml-auto">356 (28.5%)</span></div>
                  <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-cyan-500"></span> <span className="font-medium text-slate-600">Care Center - North</span> <span className="font-bold text-slate-900 ml-auto">150 (12.0%)</span></div>
                  <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-amber-500"></span> <span className="font-medium text-slate-600">Rehab Unit</span> <span className="font-bold text-slate-900 ml-auto">80 (6.4%)</span></div>
                  <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-slate-400"></span> <span className="font-medium text-slate-600">Other Locations</span> <span className="font-bold text-slate-900 ml-auto">20 (1.7%)</span></div>
                </div>
              </div>
            </div>

            {/* Bar Chart: Care Level Distribution */}
            <div className="space-y-2">
              <h5 className="font-bold text-xs text-slate-900">Care Level Distribution</h5>
              <div className="h-28 flex items-end justify-between gap-2 border-b border-slate-200 pb-2 px-1">
                {[
                  { level: 'Critical Care', val: 120, height: '22%' },
                  { level: 'Assisted Living', val: 420, height: '70%' },
                  { level: 'Independent', val: 560, height: '95%' },
                  { level: 'Memory Care', val: 90, height: '16%' },
                  { level: 'Palliative Care', val: 58, height: '10%' },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                    <span className="text-[9px] font-bold text-slate-700">{item.val}</span>
                    <div className="w-full bg-blue-500 rounded-t" style={{ height: item.height }}></div>
                    <span className="text-[7px] text-slate-400 font-medium text-center truncate w-full">{item.level}</span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => handleViewReport('Patient Census Summary', 'Custom Reports', 'Comprehensive custom report preview evaluating patient census metrics and location distributions.')}
              className="w-full flex items-center justify-center gap-2 py-2 border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              View Full Report <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Workflow Banner: Create New Custom Report */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 card-shadow space-y-4">
        <div>
          <h4 className="font-bold text-sm text-slate-900">Create New Custom Report</h4>
          <p className="text-xs text-slate-500 font-medium">Start building a custom report from scratch</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center">
          {[
            { step: '1. Select Data Source', desc: 'Choose the data you want to report on', icon: FileText },
            { step: '2. Choose Fields', desc: 'Select the fields and metrics to include', icon: FileText },
            { step: '3. Apply Filters', desc: 'Add filters to narrow down your data', icon: Filter },
            { step: '4. Group & Summarize', desc: 'Group data and choose aggregations', icon: FileText },
            { step: '5. Save & Run', desc: 'Save your report and run it instantly', icon: Play },
          ].map((st, i) => (
            <div key={i} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <st.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold text-xs text-slate-900">{st.step}</p>
                <p className="text-[10px] text-slate-400 line-clamp-1">{st.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <Plus className="h-4 w-4" /> Start Building
          </button>
        </div>
      </div>

      <ReportCreateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchReports}
      />

      {/* Report Viewer Modal */}
      {isViewModalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{selectedReport.reportName}</h3>
                  <p className="text-xs text-slate-500 font-semibold">{selectedReport.reportType}</p>
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
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Created By</span>
                  <p className="font-extrabold text-slate-800">{selectedReport.generatedByName}</p>
                  <p className="text-[10px] text-slate-500 font-semibold">{selectedReport.generatedByRole}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Generated On</span>
                  <p className="font-extrabold text-slate-800">{selectedReport.generatedOnText}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Category</span>
                  <p className="font-extrabold text-slate-800">{selectedReport.careUnit}</p>
                </div>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 text-xs mb-1">Report Description</h4>
                <p className="text-slate-600 font-medium leading-relaxed bg-purple-50/40 p-3 rounded-xl border border-purple-100/60">
                  {selectedReport.description}
                </p>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 text-xs mb-2">Live Database Metrics</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 text-center">
                    <span className="text-[10px] font-bold text-purple-600">Records Queried</span>
                    <p className="text-lg font-black text-purple-900 mt-0.5">1,248</p>
                  </div>
                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-center">
                    <span className="text-[10px] font-bold text-emerald-600">Execution Status</span>
                    <p className="text-lg font-black text-emerald-900 mt-0.5">Success</p>
                  </div>
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-center">
                    <span className="text-[10px] font-bold text-blue-600">Export Format</span>
                    <p className="text-lg font-black text-blue-900 mt-0.5">CSV / PDF</p>
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
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-md shadow-purple-500/20 transition-colors cursor-pointer"
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

export default CustomReportsPage;

import React, { useState, useEffect } from 'react';
import {
  Users,
  Stethoscope,
  FileText,
  Pill,
  Activity,
  ShieldCheck,
  Calendar,
  Filter,
  Download,
  ExternalLink,
  CheckCircle2,
  MinusCircle,
  AlertOctagon,
  XCircle,
  HelpCircle,
  Printer,
  X,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Pagination } from '@/components/common/Pagination';
import { api } from '@/lib/api';

export const ClinicalReportsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [viewBy, setViewBy] = useState('Weekly');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  useEffect(() => {
    api.getClinicalReports(viewBy)
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
      generatedByName: 'Dr. Sarah Wilson',
      generatedByRole: 'Lead Clinical Auditor',
      generatedOnText: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      careUnit: 'Clinical Care Services',
      description: description || `Comprehensive clinical encounter and diagnosis evaluation aggregated for ${viewBy.toLowerCase()} period reporting.`,
      format: 'PDF'
    });
    setIsViewModalOpen(true);
  };

  const handleDownloadReport = (report: any) => {
    const reportTitle = report?.reportName || 'Clinical_Report';
    const content = `CONNECTCARE HEALTHCARE SYSTEM - EXECUTIVE CLINICAL REPORT
Title: ${reportTitle}
Period: ${viewBy}
Generated On: ${report?.generatedOnText || new Date().toLocaleString()}
Category: ${report?.reportType || 'Clinical Analytics'}

KEY METRICS SUMMARY:
- Total Patients: ${kpis.totalPatients}
- Clinical Encounters: ${kpis.clinicalEncounters}
- New Diagnoses: ${kpis.newDiagnoses}
- Medications Prescribed: ${kpis.medicationsPrescribed}
- Lab Tests Ordered: ${kpis.labTestsOrdered}
- Vaccinations Given: ${kpis.vaccinationsGiven}

EXECUTIVE SUMMARY:
${report?.description || 'All clinical documentation and encounter metrics within verified tolerances.'}
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
    totalPatients: 0,
    clinicalEncounters: 0,
    newDiagnoses: 0,
    medicationsPrescribed: 0,
    labTestsOrdered: 0,
    vaccinationsGiven: 0,
  };

  const getOutcomeIcon = (outcomeStr: string) => {
    switch (outcomeStr?.toLowerCase()) {
      case 'improved':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'stable':
        return <MinusCircle className="h-4 w-4 text-blue-500" />;
      case 'worsened':
        return <AlertOctagon className="h-4 w-4 text-amber-500" />;
      case 'deceased':
        return <XCircle className="h-4 w-4 text-rose-500" />;
      default:
        return <HelpCircle className="h-4 w-4 text-slate-400" />;
    }
  };

  const getEncounterBadge = (typeStr: string) => {
    switch (typeStr?.toLowerCase()) {
      case 'outpatient':
        return <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">Outpatient</span>;
      case 'inpatient':
        return <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">Inpatient</span>;
      case 'emergency':
        return <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800">Emergency</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800">Telehealth</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Reports & Analytics"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Reports & Analytics', href: '/reports/overview' },
          { label: 'Clinical Reports' },
        ]}
        actions={
          <>
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>{new Date(Date.now() - 6 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
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

      {/* Subtitle */}
      <div>
        <h2 className="text-lg font-bold text-slate-900">Clinical Reports</h2>
        <p className="text-xs text-slate-500 font-medium">Monitor clinical outcomes, diagnoses, treatments and patient health trends</p>
      </div>

      {/* Top 6 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { title: 'Total Patients', value: kpis.totalPatients.toLocaleString(), change: 'Live Database', icon: Users, bg: 'bg-purple-100 text-purple-600' },
          { title: 'Clinical Encounters', value: kpis.clinicalEncounters.toLocaleString(), change: 'Live Database', icon: Stethoscope, bg: 'bg-blue-100 text-blue-600' },
          { title: 'New Diagnoses', value: kpis.newDiagnoses.toString(), change: 'Live Database', icon: FileText, bg: 'bg-indigo-100 text-indigo-600' },
          { title: 'Medications Prescribed', value: kpis.medicationsPrescribed.toLocaleString(), change: 'Live Database', icon: Pill, bg: 'bg-emerald-100 text-emerald-600' },
          { title: 'Lab Tests Ordered', value: kpis.labTestsOrdered.toString(), change: 'Live Database', icon: Activity, bg: 'bg-amber-100 text-amber-600' },
          { title: 'Vaccinations Given', value: kpis.vaccinationsGiven.toString(), change: 'Live Database', icon: ShieldCheck, bg: 'bg-cyan-100 text-cyan-600' },
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
            </select>
          </div>

          <div className="flex flex-col text-[10px] text-slate-400">
            <span>Department</span>
            <select className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium">
              <option value="All">All Departments</option>
            </select>
          </div>

          <div className="flex flex-col text-[10px] text-slate-400">
            <span>Care Unit</span>
            <select className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium">
              <option value="All">All Units</option>
            </select>
          </div>

          <div className="flex flex-col text-[10px] text-slate-400">
            <span>Provider</span>
            <select className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium">
              <option value="All">All Providers</option>
            </select>
          </div>

          <div className="flex flex-col text-[10px] text-slate-400">
            <span>Encounter Type</span>
            <select className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium">
              <option value="All">All Types</option>
              <option value="Outpatient">Outpatient</option>
              <option value="Inpatient">Inpatient</option>
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
        {/* Chart 1: Clinical Encounters Trend */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow relative">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-xs text-slate-900">Total Encounters</h4>
            <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[10px]">{kpis.clinicalEncounters}</span>
          </div>
          <div className="h-36 flex items-center justify-center border-b border-slate-200 pb-2 px-1">
            <div className="flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-slate-900">{kpis.clinicalEncounters}</span>
              <span className="text-xs text-slate-400 mt-1">Encounters Logged</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Diagnoses by Category */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
          <h4 className="font-bold text-xs text-slate-900 mb-3">Diagnoses by Category</h4>
          <div className="flex items-center justify-between">
            <div className="relative h-28 w-28 flex items-center justify-center">
              <div className="h-24 w-24 rounded-full border-4 border-slate-100 flex flex-col items-center justify-center bg-slate-50">
                <span className="text-sm font-bold text-slate-900">{kpis.newDiagnoses}</span>
                <span className="text-[8px] text-slate-400 font-medium">Diagnoses</span>
              </div>
            </div>
            <div className="space-y-1 text-[10px] flex-1 ml-3">
              {(data?.diagnosesByCategory || []).length > 0 ? (
                (data?.diagnosesByCategory || []).map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded" style={{ backgroundColor: item.color || '#3B82F6' }}></span>
                    <span className="font-medium text-slate-600">{item.category}</span>
                    <span className="font-bold text-slate-900 ml-auto">{item.count} ({item.percentage})</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-400 text-[10px]">No categories recorded</div>
              )}
            </div>
          </div>
        </div>

        {/* Chart 3: Top Diagnoses */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
          <h4 className="font-bold text-xs text-slate-900 mb-3">Top Diagnoses</h4>
          <div className="space-y-2">
            {(data?.topDiagnoses || []).length > 0 ? (
              (data?.topDiagnoses || []).map((d: any, i: number) => (
                <div key={i} className="space-y-0.5">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                    <span className="truncate">{d.diagnosis}</span>
                    <span>{d.count}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-slate-400 text-xs py-4 text-center">No diagnoses recorded</div>
            )}
          </div>
        </div>

        {/* Chart 4: Encounters by Type */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
          <h4 className="font-bold text-xs text-slate-900 mb-3">Encounters by Type</h4>
          <div className="flex items-center justify-between">
            <div className="relative h-28 w-28 flex items-center justify-center">
              <div className="h-24 w-24 rounded-full border-4 border-slate-100 flex flex-col items-center justify-center bg-slate-50">
                <span className="text-sm font-bold text-slate-900">{kpis.clinicalEncounters}</span>
                <span className="text-[8px] text-slate-400 font-medium">Total</span>
              </div>
            </div>
            <div className="space-y-1 text-[10px] flex-1 ml-3">
              {(data?.encountersByType || []).map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded" style={{ backgroundColor: item.color || '#3B82F6' }}></span>
                  <span className="font-medium text-slate-600">{item.type}</span>
                  <span className="font-bold text-slate-900 ml-auto">{item.count} ({item.percentage})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 2 Columns Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Table: Clinical Outcomes Summary */}
        <div className="bg-white rounded-xl border border-slate-200 card-shadow p-4 space-y-3">
          <h4 className="font-bold text-sm text-slate-900">Clinical Outcomes Summary</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-2.5">Outcome</th>
                  <th className="p-2.5">Description</th>
                  <th className="p-2.5">Count</th>
                  <th className="p-2.5">Rate (%)</th>
                  <th className="p-2.5">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {(data?.clinicalOutcomes || []).length > 0 ? (
                  (data?.clinicalOutcomes || []).map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-2.5 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          {getOutcomeIcon(row.outcome)}
                          <span>{row.outcome}</span>
                        </div>
                      </td>
                      <td className="p-2.5 text-slate-500 text-[11px]">{row.description}</td>
                      <td className="p-2.5 font-bold text-slate-900">{row.count}</td>
                      <td className="p-2.5 font-semibold text-slate-800">{row.rate}</td>
                      <td className={`p-2.5 font-bold ${row.trend?.includes('↑') ? 'text-emerald-600' : row.trend?.includes('↓') ? 'text-rose-600' : 'text-slate-400'}`}>
                        {row.trend}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400 text-xs">
                      No clinical outcome records available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Table: Recent Clinical Activity */}
        <div className="bg-white rounded-xl border border-slate-200 card-shadow p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900">Recent Clinical Activity</h4>
            <button 
              onClick={() => handleViewReport('Recent Clinical Activity Report', 'Clinical Reports', 'Detailed clinical log auditing recent encounters, primary diagnoses, and treating providers.')}
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              View Full Report <ExternalLink className="h-3 w-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-2.5">Date & Time</th>
                  <th className="p-2.5">Patient</th>
                  <th className="p-2.5">Encounter Type</th>
                  <th className="p-2.5">Provider</th>
                  <th className="p-2.5">Reason / Diagnosis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {(data?.recentClinicalEncounters || []).length > 0 ? (
                  (data?.recentClinicalEncounters || []).slice((currentPage - 1) * pageSize, currentPage * pageSize).map((enc: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-2.5 text-[11px] text-slate-500 whitespace-nowrap">{enc.dateText}</td>
                      <td className="p-2.5 font-bold text-slate-900">
                        <p>{enc.patientName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{enc.patientIdCode}</p>
                      </td>
                      <td className="p-2.5">{getEncounterBadge(enc.encounterType)}</td>
                      <td className="p-2.5 font-semibold text-slate-800">{enc.providerName}</td>
                      <td className="p-2.5 font-bold text-slate-900">{enc.reasonDiagnosis}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400 text-xs">
                      No clinical encounters recorded yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.max(1, Math.ceil(((data?.recentClinicalEncounters || []).length || 1) / pageSize))}
            totalResults={(data?.recentClinicalEncounters || []).length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            itemLabel="encounters"
          />
        </div>
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
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Audited By</span>
                  <p className="font-extrabold text-slate-800">{selectedReport.generatedByName}</p>
                  <p className="text-[10px] text-slate-500 font-semibold">{selectedReport.generatedByRole}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Generated On</span>
                  <p className="font-extrabold text-slate-800">{selectedReport.generatedOnText}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Unit / Service</span>
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
                <h4 className="font-extrabold text-slate-900 text-xs mb-2">Clinical KPIs ({viewBy} View)</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-center">
                    <span className="text-[10px] font-bold text-blue-600">Total Encounters</span>
                    <p className="text-lg font-black text-blue-900 mt-0.5">{kpis.clinicalEncounters}</p>
                  </div>
                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-center">
                    <span className="text-[10px] font-bold text-emerald-600">New Diagnoses</span>
                    <p className="text-lg font-black text-emerald-900 mt-0.5">{kpis.newDiagnoses}</p>
                  </div>
                  <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 text-center">
                    <span className="text-[10px] font-bold text-purple-600">Prescriptions</span>
                    <p className="text-lg font-black text-purple-900 mt-0.5">{kpis.medicationsPrescribed}</p>
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

export default ClinicalReportsPage;

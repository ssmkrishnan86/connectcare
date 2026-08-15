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
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Pagination } from '@/components/common/Pagination';
import { api } from '@/lib/api';

export const ClinicalReportsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [viewBy, setViewBy] = useState('Weekly');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    api.getClinicalReports()
      .then((res) => setData(res))
      .catch(console.error);
  }, []);

  const kpis = data?.kpis || {
    totalPatients: 1248,
    clinicalEncounters: 1856,
    newDiagnoses: 312,
    medicationsPrescribed: 2354,
    labTestsOrdered: 987,
    vaccinationsGiven: 256,
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

      {/* Subtitle */}
      <div>
        <h2 className="text-lg font-bold text-slate-900">Clinical Reports</h2>
        <p className="text-xs text-slate-500 font-medium">Monitor clinical outcomes, diagnoses, treatments and patient health trends</p>
      </div>

      {/* Top 6 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { title: 'Total Patients', value: kpis.totalPatients.toLocaleString(), change: '↑ 6.2% vs last 7 days', icon: Users, bg: 'bg-purple-100 text-purple-600', isUp: true },
          { title: 'Clinical Encounters', value: kpis.clinicalEncounters.toLocaleString(), change: '↑ 8.4% vs last 7 days', icon: Stethoscope, bg: 'bg-blue-100 text-blue-600', isUp: true },
          { title: 'New Diagnoses', value: kpis.newDiagnoses.toString(), change: '↑ 5.7% vs last 7 days', icon: FileText, bg: 'bg-indigo-100 text-indigo-600', isUp: true },
          { title: 'Medications Prescribed', value: kpis.medicationsPrescribed.toLocaleString(), change: '↑ 7.3% vs last 7 days', icon: Pill, bg: 'bg-emerald-100 text-emerald-600', isUp: true },
          { title: 'Lab Tests Ordered', value: kpis.labTestsOrdered.toString(), change: '↓ 3.2% vs last 7 days', icon: Activity, bg: 'bg-amber-100 text-amber-600', isUp: false },
          { title: 'Vaccinations Given', value: kpis.vaccinationsGiven.toString(), change: '↑ 9.1% vs last 7 days', icon: ShieldCheck, bg: 'bg-cyan-100 text-cyan-600', isUp: true },
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
            </select>
          </div>

          <div className="flex flex-col text-[10px] text-slate-400">
            <span>Department</span>
            <select className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium">
              <option value="All">All Departments</option>
              <option value="Cardiology">Cardiology</option>
            </select>
          </div>

          <div className="flex flex-col text-[10px] text-slate-400">
            <span>Care Unit</span>
            <select className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium">
              <option value="All">All Units</option>
              <option value="ICU">ICU</option>
            </select>
          </div>

          <div className="flex flex-col text-[10px] text-slate-400">
            <span>Provider</span>
            <select className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium">
              <option value="All">All Providers</option>
              <option value="Dr. Michael Brown">Dr. Michael Brown</option>
              <option value="Dr. Sarah Wilson">Dr. Sarah Wilson</option>
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
            <h4 className="font-bold text-xs text-slate-900">Clinical Encounters Trend</h4>
            <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[10px]">408</span>
          </div>
          <div className="h-44 flex items-end justify-between gap-2 border-b border-slate-200 pb-2 px-1">
            {[
              { label: 'Apr 21-27', val: 50 },
              { label: 'Apr 28-May 4', val: 65 },
              { label: 'May 5-11', val: 78 },
              { label: 'May 12-18', val: 70 },
              { label: 'May 19', val: 95 },
            ].map((pt, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full bg-blue-50 rounded-t flex items-end justify-center" style={{ height: `${pt.val}%` }}>
                  <div className="w-full bg-blue-600 border-t-2 border-blue-700 rounded-t h-full"></div>
                </div>
                <span className="text-[8px] text-slate-400 font-medium text-center">{pt.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Diagnoses by Category */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
          <h4 className="font-bold text-xs text-slate-900 mb-3">Diagnoses by Category</h4>
          <div className="flex items-center justify-between">
            <div className="relative h-28 w-28 flex items-center justify-center">
              <svg className="h-28 w-28 transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-blue-600" strokeWidth="4" strokeDasharray="25.0, 100" strokeDashoffset="0" stroke="currentColor" fill="none" />
                <path className="text-emerald-500" strokeWidth="4" strokeDasharray="20.5, 100" strokeDashoffset="-25.0" stroke="currentColor" fill="none" />
                <path className="text-purple-600" strokeWidth="4" strokeDasharray="15.4, 100" strokeDashoffset="-45.5" stroke="currentColor" fill="none" />
                <path className="text-amber-500" strokeWidth="4" strokeDasharray="12.8, 100" strokeDashoffset="-60.9" stroke="currentColor" fill="none" />
                <path className="text-slate-400" strokeWidth="4" strokeDasharray="26.3, 100" strokeDashoffset="-73.7" stroke="currentColor" fill="none" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-sm font-bold text-slate-900">312</span>
                <span className="text-[8px] text-slate-400 font-medium">Total</span>
              </div>
            </div>
            <div className="space-y-1 text-[10px]">
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-blue-600"></span> <span className="font-medium text-slate-600">Cardiovascular</span> <span className="font-bold text-slate-900 ml-auto">78 (25.0%)</span></div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-emerald-500"></span> <span className="font-medium text-slate-600">Respiratory</span> <span className="font-bold text-slate-900 ml-auto">64 (20.5%)</span></div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-purple-600"></span> <span className="font-medium text-slate-600">Endocrine</span> <span className="font-bold text-slate-900 ml-auto">48 (15.4%)</span></div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-amber-500"></span> <span className="font-medium text-slate-600">Musculoskeletal</span> <span className="font-bold text-slate-900 ml-auto">40 (12.8%)</span></div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-slate-400"></span> <span className="font-medium text-slate-600">Other</span> <span className="font-bold text-slate-900 ml-auto">82 (26.3%)</span></div>
            </div>
          </div>
        </div>

        {/* Chart 3: Top Diagnoses */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
          <h4 className="font-bold text-xs text-slate-900 mb-3">Top Diagnoses</h4>
          <div className="space-y-2">
            {[
              { label: 'Hypertension (I10)', val: 52, width: '85%' },
              { label: 'Type 2 Diabetes (E11)', val: 38, width: '65%' },
              { label: 'COPD (J44.1)', val: 28, width: '48%' },
              { label: 'Asthma (J45.9)', val: 24, width: '40%' },
              { label: 'Osteoarthritis (M17.9)', val: 18, width: '30%' },
            ].map((d, i) => (
              <div key={i} className="space-y-0.5">
                <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                  <span className="truncate">{d.label}</span>
                  <span>{d.val}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: d.width }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 4: Encounters by Type */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
          <h4 className="font-bold text-xs text-slate-900 mb-3">Encounters by Type</h4>
          <div className="flex items-center justify-between">
            <div className="relative h-28 w-28 flex items-center justify-center">
              <svg className="h-28 w-28 transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-blue-600" strokeWidth="4" strokeDasharray="60.6, 100" strokeDashoffset="0" stroke="currentColor" fill="none" />
                <path className="text-cyan-500" strokeWidth="4" strokeDasharray="22.2, 100" strokeDashoffset="-60.6" stroke="currentColor" fill="none" />
                <path className="text-amber-500" strokeWidth="4" strokeDasharray="11.3, 100" strokeDashoffset="-82.8" stroke="currentColor" fill="none" />
                <path className="text-rose-500" strokeWidth="4" strokeDasharray="5.9, 100" strokeDashoffset="-94.1" stroke="currentColor" fill="none" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-sm font-bold text-slate-900">1,856</span>
                <span className="text-[8px] text-slate-400 font-medium">Total</span>
              </div>
            </div>
            <div className="space-y-1 text-[10px]">
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-blue-600"></span> <span className="font-medium text-slate-600">Outpatient</span> <span className="font-bold text-slate-900 ml-auto">1,124 (60.6%)</span></div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-cyan-500"></span> <span className="font-medium text-slate-600">Inpatient</span> <span className="font-bold text-slate-900 ml-auto">412 (22.2%)</span></div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-amber-500"></span> <span className="font-medium text-slate-600">Emergency</span> <span className="font-bold text-slate-900 ml-auto">210 (11.3%)</span></div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-rose-500"></span> <span className="font-medium text-slate-600">Telehealth</span> <span className="font-bold text-slate-900 ml-auto">110 (5.9%)</span></div>
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
                  <th className="p-2.5">Trend (vs last 7 days)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {(data?.clinicalOutcomes || [
                  { outcome: 'Improved', description: 'Patients with improved condition', count: 762, rate: '41.0%', trend: '↑ 6.5%' },
                  { outcome: 'Stable', description: 'Patients with stable condition', count: 703, rate: '37.9%', trend: '↑ 2.1%' },
                  { outcome: 'Worsened', description: 'Patients with worsened condition', count: 218, rate: '11.7%', trend: '↓ 4.3%' },
                  { outcome: 'Deceased', description: 'Patient mortality', count: 23, rate: '1.2%', trend: '↓ 8.0%' },
                  { outcome: 'Unknown', description: 'Outcome not recorded', count: 150, rate: '8.1%', trend: '-- 0.0%' },
                ]).map((row: any, idx: number) => (
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
                    <td className={`p-2.5 font-bold ${row.trend.includes('↑') ? 'text-emerald-600' : row.trend.includes('↓') ? 'text-rose-600' : 'text-slate-400'}`}>
                      {row.trend}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Table: Recent Clinical Activity */}
        <div className="bg-white rounded-xl border border-slate-200 card-shadow p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900">Recent Clinical Activity</h4>
            <button className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
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
                {(data?.recentClinicalEncounters || [
                  { dateText: 'May 19, 2025 10:30 AM', patientName: 'Mary Johnson', patientIdCode: 'PID-10023', encounterType: 'Outpatient', providerName: 'Dr. Sarah Wilson', reasonDiagnosis: 'Hypertension (I10)' },
                  { dateText: 'May 19, 2025 09:15 AM', patientName: 'Robert Brown', patientIdCode: 'PID-10015', encounterType: 'Inpatient', providerName: 'Dr. Michael Brown', reasonDiagnosis: 'COPD Exacerbation (J44.1)' },
                  { dateText: 'May 19, 2025 08:45 AM', patientName: 'Linda Davis', patientIdCode: 'PID-10031', encounterType: 'Outpatient', providerName: 'Dr. James Anderson', reasonDiagnosis: 'Type 2 Diabetes (E11)' },
                  { dateText: 'May 18, 2025 04:20 PM', patientName: 'William Taylor', patientIdCode: 'PID-10008', encounterType: 'Emergency', providerName: 'Dr. Priya Shah', reasonDiagnosis: 'Asthma Attack (J45.901)' },
                  { dateText: 'May 18, 2025 02:10 PM', patientName: 'Patricia Smith', patientIdCode: 'PID-10045', encounterType: 'Telehealth', providerName: 'Dr. Sarah Wilson', reasonDiagnosis: 'Follow-up Consultation' },
                ]).map((enc: any, idx: number) => (
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
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={372}
            totalResults={1856}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            itemLabel="encounters"
          />
        </div>
      </div>
    </div>
  );
};

export default ClinicalReportsPage;

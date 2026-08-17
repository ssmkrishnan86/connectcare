import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  Sun,
  Search,
  MessageSquare,
  Bell,
  Calendar,
  SlidersHorizontal,
  Filter,
  FileText,
  BarChart2,
  Activity,
  Pill,
  ClipboardCheck,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

export const NurseReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    reportsGenerated: 32,
    reportsGeneratedChange: '↑ 12% vs last week',
    patientReports: 18,
    patientReportsPercentage: '56%',
    clinicalReports: 9,
    clinicalReportsPercentage: '28%',
    medicationReports: 3,
    medicationReportsPercentage: '9%',
    operationalReports: 2,
    operationalReportsPercentage: '6%'
  });
  const [, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('Overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [unitFilter, setUnitFilter] = useState('All Units / Floors');
  const [patientFilter, setPatientFilter] = useState('All Patients');
  const [shiftFilter, setShiftFilter] = useState('All Shift');

  const fetchReportsData = async () => {
    setLoading(true);
    try {
      const [reportsRes, statsRes] = await Promise.all([
        api.getNurseReports(activeTab, searchQuery),
        api.getNurseReportStats()
      ]);

      const reportsList = Array.isArray(reportsRes) ? reportsRes : (reportsRes as any)?.data || [];
      setReports(reportsList);

      if ((statsRes as any)?.data) {
        setStats((statsRes as any).data);
      }
    } catch (err) {
      console.error('Failed to fetch nurse reports data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, [activeTab, searchQuery, unitFilter, patientFilter, shiftFilter]);

  const getReportTypeBadge = (type: string) => {
    switch (type) {
      case 'Patient Report':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">Patient Report</span>;
      case 'Clinical Report':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-50 text-purple-700 border border-purple-200">Clinical Report</span>;
      case 'Medication Report':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">Medication Report</span>;
      case 'Operational Report':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-teal-50 text-teal-700 border border-teal-200">Operational Report</span>;
      case 'Quality & Safety':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">Quality & Safety</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-700">{type}</span>;
    }
  };

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'Clinical Report':
        return <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0"><Activity className="h-4 w-4" /></div>;
      case 'Medication Report':
        return <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><Pill className="h-4 w-4" /></div>;
      case 'Operational Report':
        return <div className="h-8 w-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0"><ClipboardCheck className="h-4 w-4" /></div>;
      case 'Quality & Safety':
        return <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0"><FileText className="h-4 w-4" /></div>;
      default:
        return <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><FileText className="h-4 w-4" /></div>;
    }
  };

  const getFormatBadge = (format: string) => {
    if (format === 'PDF') {
      return (
        <span className="inline-flex items-center gap-1 font-bold text-xs text-rose-600">
          <span className="p-1 rounded bg-rose-50 text-rose-600 text-[10px] font-black border border-rose-200">PDF</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 font-bold text-xs text-emerald-600">
        <span className="p-1 rounded bg-emerald-50 text-emerald-600 text-[10px] font-black border border-emerald-200">Excel</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 space-y-5 p-6 max-w-[1700px] mx-auto select-none">
      
      {/* 1. Top Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reports</h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            View and generate reports to monitor patient care and unit performance.
          </p>
        </div>

        {/* Header Right Controls */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Shift Selector */}
          <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
            <Sun className="h-4 w-4 text-amber-500 fill-amber-400" />
            <div className="flex flex-col text-[11px]">
              <span className="font-extrabold text-slate-900">Day Shift</span>
              <span className="text-[10px] text-slate-500 font-semibold">07:00 AM - 03:00 PM</span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1" />
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports..."
              className="pl-9 pr-4 py-2 w-56 sm:w-64 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Icon Badges */}
          <button className="relative p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer" title="Messages">
            <MessageSquare className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center">2</span>
          </button>

          <button className="relative p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer" title="Notifications">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center">6</span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <img
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80"
              alt="Nurse Avatar"
              className="h-9 w-9 rounded-full object-cover border border-indigo-200 shadow-xs"
            />
            <div className="text-left">
              <p className="text-xs font-extrabold text-slate-900 leading-tight">
                {user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : 'Emma Johnson'}
              </p>
              <p className="text-[10px] font-semibold text-slate-400">Staff Nurse</p>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Sub-Header Navigation Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200/80 bg-white px-6 py-2.5 rounded-2xl shadow-xs text-xs font-bold overflow-x-auto">
        {[
          'Overview',
          'Patient Reports',
          'Clinical Reports',
          'Medication Reports',
          'Operational Reports',
          'Quality & Safety'
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-1 transition-colors relative cursor-pointer whitespace-nowrap ${
              activeTab === tab
                ? 'text-indigo-600 font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"></span>
            )}
          </button>
        ))}
      </div>

      {/* 3. Filter Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Date Picker Button */}
          <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>May 16, 2024 - May 22, 2024</span>
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400 ml-1" />
          </div>

          {/* Unit / Floor Dropdown */}
          <div className="relative">
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option>All Units / Floors</option>
              <option>Cardiology Unit</option>
              <option>Medical Unit</option>
              <option>Surgical Unit</option>
              <option>ICU</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Patient Dropdown */}
          <div className="relative">
            <select
              value={patientFilter}
              onChange={(e) => setPatientFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option>All Patients</option>
              <option>Patricia Smith (PT-10001)</option>
              <option>Michael Davis (PT-10002)</option>
              <option>Linda Martinez (PT-10003)</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Shift Dropdown */}
          <div className="relative">
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option>All Shift</option>
              <option>Day Shift</option>
              <option>Night Shift</option>
              <option>Evening Shift</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Filters Toggle Button */}
          <button className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-indigo-700 text-xs font-bold transition-colors cursor-pointer">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* 4. Stat Cards (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Reports Generated */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">{stats.reportsGenerated}</h3>
            <p className="text-[11px] font-bold text-slate-500">Reports Generated</p>
            <p className="text-[10px] font-extrabold text-emerald-600 mt-0.5">{stats.reportsGeneratedChange}</p>
          </div>
        </div>

        {/* Card 2: Patient Reports */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <BarChart2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">{stats.patientReports}</h3>
            <p className="text-[11px] font-bold text-slate-500">Patient Reports</p>
            <p className="text-[10px] font-extrabold text-slate-400 mt-0.5">{stats.patientReportsPercentage}</p>
          </div>
        </div>

        {/* Card 3: Clinical Reports */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">{stats.clinicalReports}</h3>
            <p className="text-[11px] font-bold text-slate-500">Clinical Reports</p>
            <p className="text-[10px] font-extrabold text-slate-400 mt-0.5">{stats.clinicalReportsPercentage}</p>
          </div>
        </div>

        {/* Card 4: Medication Reports */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Pill className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">{stats.medicationReports}</h3>
            <p className="text-[11px] font-bold text-slate-500">Medication Reports</p>
            <p className="text-[10px] font-extrabold text-slate-400 mt-0.5">{stats.medicationReportsPercentage}</p>
          </div>
        </div>

        {/* Card 5: Operational Reports */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">{stats.operationalReports}</h3>
            <p className="text-[11px] font-bold text-slate-500">Operational Reports</p>
            <p className="text-[10px] font-extrabold text-slate-400 mt-0.5">{stats.operationalReportsPercentage}</p>
          </div>
        </div>

      </div>

      {/* 5. Main Split Screen (8 Cols Table + 4 Cols Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Section: Reports Table (8 Columns) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          
          <div className="p-4 border-b border-slate-100">
            <h2 className="font-extrabold text-slate-900 text-sm">Recent Reports</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-slate-700 border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Report Name</th>
                  <th className="py-3.5 px-3">Report Type</th>
                  <th className="py-3.5 px-3">Description</th>
                  <th className="py-3.5 px-3">Generated By</th>
                  <th className="py-3.5 px-3">Generated On</th>
                  <th className="py-3.5 px-3">Format</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Report Name */}
                    <td className="py-3.5 px-4 font-black text-indigo-900 text-xs">
                      <div className="flex items-center gap-2.5">
                        {getReportIcon(row.reportType)}
                        <span className="hover:underline cursor-pointer">{row.reportName}</span>
                      </div>
                    </td>

                    {/* Report Type Badge */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {getReportTypeBadge(row.reportType)}
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-3 text-slate-500 text-[11px] max-w-[200px] truncate">
                      {row.description}
                    </td>

                    {/* Generated By */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <p className="font-bold text-slate-900 text-xs leading-tight">{row.generatedByName}</p>
                      <p className="text-[10px] font-semibold text-slate-400">{row.generatedByRole}</p>
                    </td>

                    {/* Generated On */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-slate-600 text-[11px]">
                      {row.generatedOnText}
                    </td>

                    {/* Format */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {getFormatBadge(row.format)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer" title="View Report">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer" title="Download">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Bar */}
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-500">
            <span>Showing 1 to {reports.length} of {stats.reportsGenerated} reports</span>

            <div className="flex items-center gap-1.5">
              <button className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="px-3 py-1 bg-indigo-600 text-white rounded-lg font-black text-xs">1</button>
              <button className="px-3 py-1 hover:bg-slate-100 text-slate-700 rounded-lg font-bold text-xs cursor-pointer">2</button>
              <button className="px-3 py-1 hover:bg-slate-100 text-slate-700 rounded-lg font-bold text-xs cursor-pointer">3</button>
              <button className="px-3 py-1 hover:bg-slate-100 text-slate-700 rounded-lg font-bold text-xs cursor-pointer">4</button>
              <button className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Right Section: Sidebar Widgets (4 Columns) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Card 1: Quick Report Shortcuts */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
            <h3 className="font-extrabold text-slate-900 text-xs">Quick Report Shortcuts</h3>

            <div className="space-y-2 text-xs font-bold text-slate-700">
              {[
                { label: 'Patient Care Summary', icon: FileText, color: 'text-indigo-600 bg-indigo-50' },
                { label: 'Vital Signs Report', icon: Activity, color: 'text-purple-600 bg-purple-50' },
                { label: 'Medication Report', icon: Pill, color: 'text-emerald-600 bg-emerald-50' },
                { label: 'Task Summary', icon: ClipboardCheck, color: 'text-teal-600 bg-teal-50' },
                { label: 'Discharge Summary', icon: FileText, color: 'text-blue-600 bg-blue-50' },
                { label: 'Incident Report', icon: FileText, color: 'text-rose-600 bg-rose-50' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  className="w-full flex items-center justify-between p-2.5 bg-slate-50 hover:bg-indigo-50/80 border border-slate-100 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`h-7 w-7 rounded-lg ${item.color} flex items-center justify-center shrink-0`}>
                      <item.icon className="h-3.5 w-3.5" />
                    </div>
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Card 2: Reports by Type (Donut Chart Widget) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-xs">Reports by Type</h3>

            <div className="flex items-center justify-center relative my-2">
              <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 36 36">
                {/* Background Track */}
                <path className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                {/* Patient Reports (56%) */}
                <path className="text-blue-500" strokeWidth="4" strokeDasharray="56, 100" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                {/* Clinical Reports (28%) */}
                <path className="text-purple-500" strokeWidth="4" strokeDasharray="28, 100" strokeDashoffset="-56" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                {/* Medication Reports (9%) */}
                <path className="text-amber-500" strokeWidth="4" strokeDasharray="9, 100" strokeDashoffset="-84" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                {/* Operational Reports (6%) */}
                <path className="text-teal-500" strokeWidth="4" strokeDasharray="6, 100" strokeDashoffset="-93" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-slate-900">{stats.reportsGenerated}</span>
                <span className="text-[10px] font-bold text-slate-400">Total</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2 text-xs font-semibold text-slate-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
                  <span>Patient Reports</span>
                </div>
                <span className="font-extrabold text-slate-900">18 ({stats.patientReportsPercentage})</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-500"></span>
                  <span>Clinical Reports</span>
                </div>
                <span className="font-extrabold text-slate-900">9 ({stats.clinicalReportsPercentage})</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                  <span>Medication Reports</span>
                </div>
                <span className="font-extrabold text-slate-900">3 ({stats.medicationReportsPercentage})</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-teal-500"></span>
                  <span>Operational Reports</span>
                </div>
                <span className="font-extrabold text-slate-900">2 ({stats.operationalReportsPercentage})</span>
              </div>
            </div>
          </div>

          {/* Card 3: Recent Reports Widget */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-xs">Recent Reports</h3>
              <button className="text-[10px] font-extrabold text-indigo-600 hover:underline">View All</button>
            </div>

            <div className="space-y-2.5">
              {reports.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    {getReportIcon(item.reportType)}
                    <div>
                      <p className="font-extrabold text-slate-900 text-xs">{item.reportName}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{item.generatedOnText}</p>
                    </div>
                  </div>
                  {getFormatBadge(item.format)}
                </div>
              ))}
            </div>

            <button className="w-full py-2 bg-white hover:bg-slate-50 border border-indigo-200 text-indigo-600 rounded-xl text-xs font-black transition-colors cursor-pointer mt-2">
              View All Reports
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default NurseReportsPage;

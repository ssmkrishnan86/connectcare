import React, { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import {
  Search,
  Calendar,
  ChevronDown,
  Filter,
  AlertTriangle,
  Activity,
  Pill,
  FileText,
  UserCheck,
  FlaskConical,
  Eye,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  FilePlus,
  Users,
  TrendingUp,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All Alerts');

  // Filters
  const [careUnitFilter, setCareUnitFilter] = useState('All');
  const [patientFilter, setPatientFilter] = useState('All');
  const [alertTypeFilter, setAlertTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter] = useState('May 22, 2024');

  // Selected Alert for Right Sidebar
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  const [isAlertDetailOpen, setIsAlertDetailOpen] = useState(true);

  // Selected Checkbox IDs
  const [selectedAlertIds, setSelectedAlertIds] = useState<Record<string, boolean>>({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await api.getAlerts();
      const list = Array.isArray(data) ? data : (data as any)?.data || [];
      setAlerts(list);

      if (list.length > 0 && !selectedAlert) {
        setSelectedAlert(list[0]);
      }
    } catch (err) {
      console.error('Failed to fetch alerts from database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAcknowledge = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.acknowledgeAlert(id);
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'Resolved', isAcknowledged: true } : a))
      );
      if (selectedAlert?.id === id) {
        setSelectedAlert((prev: any) => ({ ...prev, status: 'Resolved', isAcknowledged: true }));
      }
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    const newSelected: Record<string, boolean> = {};
    alerts.forEach((a) => {
      newSelected[a.id] = checked;
    });
    setSelectedAlertIds(newSelected);
  };

  const toggleSelectAlert = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setSelectedAlertIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getNormalizedSeverity = (sev: any): string => {
    if (sev === undefined || sev === null) return 'Medium';
    const str = sev.toString().toLowerCase();
    if (str === '0' || str === 'critical') return 'Critical';
    if (str === '1' || str === 'high') return 'High';
    if (str === '2' || str === 'medium') return 'Medium';
    if (str === '3' || str === 'low' || str === 'information') return 'Information';
    return 'Medium';
  };

  const criticalCount = useMemo(() => alerts.filter((a) => getNormalizedSeverity(a.severity) === 'Critical').length, [alerts]);
  const highCount = useMemo(() => alerts.filter((a) => getNormalizedSeverity(a.severity) === 'High').length, [alerts]);
  const mediumCount = useMemo(() => alerts.filter((a) => getNormalizedSeverity(a.severity) === 'Medium').length, [alerts]);
  const infoCount = useMemo(() => alerts.filter((a) => getNormalizedSeverity(a.severity) === 'Information').length, [alerts]);
  const resolvedCount = useMemo(() => alerts.filter((a) => a.status === 'Resolved' || a.isAcknowledged).length, [alerts]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      // Tab filter
      const normSev = getNormalizedSeverity(a.severity);
      if (activeTab === 'Critical' && normSev !== 'Critical') return false;
      if (activeTab === 'High' && normSev !== 'High') return false;
      if (activeTab === 'Medium' && normSev !== 'Medium') return false;
      if (activeTab === 'Information' && normSev !== 'Information') return false;
      if (activeTab === 'Resolved' && a.status !== 'Resolved' && !a.isAcknowledged) return false;

      // Dropdown filters
      if (careUnitFilter !== 'All' && !(a.careUnit || a.roomLocation || '').includes(careUnitFilter)) return false;
      if (statusFilter !== 'All' && a.status !== statusFilter) return false;
      if (alertTypeFilter !== 'All' && a.type !== alertTypeFilter) return false;

      // Search
      if (search) {
        const query = search.toLowerCase();
        const matchTitle = (a.title || a.triggerCondition || '').toLowerCase().includes(query);
        const matchPatient = (a.patientName || '').toLowerCase().includes(query);
        if (!matchTitle && !matchPatient) return false;
      }

      return true;
    });
  }, [alerts, activeTab, careUnitFilter, statusFilter, alertTypeFilter, search]);

  const paginatedAlerts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAlerts.slice(start, start + pageSize);
  }, [filteredAlerts, currentPage]);

  const totalPages = Math.ceil(filteredAlerts.length / pageSize) || 1;

  const getSeverityBadge = (severity: string) => {
    const sev = (severity || '').toString().toLowerCase();
    if (sev === 'critical' || sev === '0') {
      return (
        <span className="px-2.5 py-1 rounded-md text-[11px] font-black bg-rose-100 text-rose-600 border border-rose-200">
          Critical
        </span>
      );
    }
    if (sev === 'high' || sev === '1') {
      return (
        <span className="px-2.5 py-1 rounded-md text-[11px] font-black bg-amber-100 text-amber-700 border border-amber-200">
          High
        </span>
      );
    }
    if (sev === 'medium' || sev === '2') {
      return (
        <span className="px-2.5 py-1 rounded-md text-[11px] font-black bg-amber-50 text-amber-600 border border-amber-100">
          Medium
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-md text-[11px] font-black bg-blue-100 text-blue-600 border border-blue-200">
        Information
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === 'New') {
      return (
        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-rose-50 text-rose-600 border border-rose-200">
          New
        </span>
      );
    }
    if (status === 'In Progress') {
      return (
        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-indigo-50 text-indigo-600 border border-indigo-200">
          In Progress
        </span>
      );
    }
    if (status === 'Pending') {
      return (
        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-amber-50 text-amber-600 border border-amber-200">
          Pending
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-200">
        Resolved
      </span>
    );
  };

  const getTypePill = (type: string) => {
    switch (type) {
      case 'Vital Signs':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-slate-700">
            <Activity className="h-3.5 w-3.5 text-rose-500" /> Vital Signs
          </span>
        );
      case 'Medication':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-slate-700">
            <Pill className="h-3.5 w-3.5 text-indigo-500" /> Medication
          </span>
        );
      case 'Assessment':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-slate-700">
            <UserCheck className="h-3.5 w-3.5 text-amber-500" /> Assessment
          </span>
        );
      case 'Nursing Care':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-slate-700">
            <Users className="h-3.5 w-3.5 text-indigo-500" /> Nursing Care
          </span>
        );
      case 'Care Plan':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-slate-700">
            <FileText className="h-3.5 w-3.5 text-purple-500" /> Care Plan
          </span>
        );
      case 'Lab Result':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-slate-700">
            <FlaskConical className="h-3.5 w-3.5 text-blue-500" /> Lab Result
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-slate-700">
            <AlertCircle className="h-3.5 w-3.5 text-slate-400" /> {type || 'Alert'}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 space-y-5 p-6 max-w-[1700px] mx-auto select-none">
      
      {/* Page Header */}
      <PageHeader
        title="Alerts"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Alerts' },
        ]}
      />

      {/* 2. Secondary Sub-Header Navigation Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6">
        {[
          { label: "All Alerts", count: alerts.length },
          { label: "Critical", count: criticalCount },
          { label: "High", count: highCount },
          { label: "Medium", count: mediumCount },
          { label: "Information", count: infoCount },
          { label: "Resolved", count: resolvedCount }
        ].map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={`pb-3 text-xs font-bold transition-all relative cursor-pointer ${
              activeTab === tab.label
                ? 'text-indigo-600 font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label} ({tab.count})
            {activeTab === tab.label && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"></span>
            )}
          </button>
        ))}
      </div>

      {/* 3. Stat Summary Cards Row (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* Critical Alerts */}
        <div className="bg-rose-50/40 p-4.5 rounded-2xl border border-rose-200/70 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold shrink-0">
            <AlertTriangle className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 leading-none">{criticalCount}</p>
            <p className="text-xs font-extrabold text-slate-900 mt-1">Critical Alerts</p>
            <p className="text-[11px] font-semibold text-rose-600 mt-0.5">Require immediate action</p>
          </div>
        </div>

        {/* High Alerts */}
        <div className="bg-amber-50/40 p-4.5 rounded-2xl border border-amber-200/70 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <AlertTriangle className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 leading-none">{highCount}</p>
            <p className="text-xs font-extrabold text-slate-900 mt-1">High Alerts</p>
            <p className="text-[11px] font-semibold text-amber-600 mt-0.5">Need attention soon</p>
          </div>
        </div>

        {/* Medium Alerts */}
        <div className="bg-amber-50/20 p-4.5 rounded-2xl border border-amber-100 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-100/60 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <AlertTriangle className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 leading-none">{mediumCount}</p>
            <p className="text-xs font-extrabold text-slate-900 mt-1">Medium Alerts</p>
            <p className="text-[11px] font-semibold text-amber-600 mt-0.5">Monitor closely</p>
          </div>
        </div>

        {/* Information */}
        <div className="bg-blue-50/40 p-4.5 rounded-2xl border border-blue-200/70 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <AlertCircle className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 leading-none">{infoCount}</p>
            <p className="text-xs font-extrabold text-slate-900 mt-1">Information</p>
            <p className="text-[11px] font-semibold text-blue-600 mt-0.5">For your awareness</p>
          </div>
        </div>

      </div>

      {/* 4. Filter Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-52 sm:w-64"
            />
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer">
            <Calendar className="h-4 w-4 text-slate-500" />
            <span>{dateFilter}</span>
          </div>

          {/* All Units / Floors */}
          <select
            value={careUnitFilter}
            onChange={(e) => setCareUnitFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
          >
            <option value="All">All Units / Floors</option>
            <option value="Cardiology Unit">Cardiology Unit</option>
            <option value="Medical Unit">Medical Unit</option>
            <option value="Surgical Unit">Surgical Unit</option>
            <option value="General Ward">General Ward</option>
            <option value="Maternity Unit">Maternity Unit</option>
          </select>

          {/* All Patients */}
          <select
            value={patientFilter}
            onChange={(e) => setPatientFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
          >
            <option value="All">All Patients</option>
            <option value="Inpatients">Inpatients (12)</option>
            <option value="Outpatients">Outpatients (12)</option>
          </select>

          {/* All Alert Types */}
          <select
            value={alertTypeFilter}
            onChange={(e) => setAlertTypeFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
          >
            <option value="All">All Alert Types</option>
            <option value="Vital Signs">Vital Signs</option>
            <option value="Medication">Medication</option>
            <option value="Assessment">Assessment</option>
            <option value="Nursing Care">Nursing Care</option>
            <option value="Care Plan">Care Plan</option>
            <option value="Lab Result">Lab Result</option>
          </select>

          {/* All Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending">Pending</option>
            <option value="Resolved">Resolved</option>
          </select>

          {/* Filters Button */}
          <button className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* 5. Split Master-Detail Layout (Table 8 Columns + Selected Alert Details 4 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Table & Pagination (8 Columns) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-xs font-bold text-slate-400">
                Loading alert records from database...
              </div>
            ) : paginatedAlerts.length === 0 ? (
              <div className="p-12 text-center text-xs font-bold text-slate-400">
                No alerts found matching filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-3 w-8">
                        <input
                          type="checkbox"
                          onChange={toggleSelectAll}
                          className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </th>
                      <th className="py-3 px-4">Alert</th>
                      <th className="py-3 px-4">Patient</th>
                      <th className="py-3 px-4">Alert Type</th>
                      <th className="py-3 px-4">Severity</th>
                      <th className="py-3 px-4">Time</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold">
                    {paginatedAlerts.map((a) => {
                      const isSelected = selectedAlert?.id === a.id || selectedAlert?.title === a.title;
                      const sevStr = (a.severity || '').toString().toLowerCase();
                      const isCritical = sevStr === 'critical' || sevStr === '0';
                      const isHigh = sevStr === 'high' || sevStr === '1';

                      return (
                        <tr
                          key={a.id}
                          onClick={() => setSelectedAlert(a)}
                          className={`transition-colors cursor-pointer ${
                            isSelected ? 'bg-indigo-50/50 hover:bg-indigo-50/80' : 'hover:bg-slate-50/70'
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-3.5 px-3">
                            <input
                              type="checkbox"
                              checked={!!selectedAlertIds[a.id]}
                              onChange={(e) => toggleSelectAlert(a.id, e)}
                              className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                          </td>

                          {/* Alert Title & Subtitle */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                                  isCritical
                                    ? 'bg-rose-100 text-rose-600'
                                    : isHigh
                                    ? 'bg-amber-100 text-amber-600'
                                    : 'bg-blue-100 text-blue-600'
                                }`}
                              >
                                <AlertTriangle className="h-4 w-4 stroke-[2.2]" />
                              </div>
                              <div>
                                <p className="font-extrabold text-slate-900 text-xs hover:text-indigo-600 transition-colors">
                                  {a.title || a.triggerCondition}
                                </p>
                                <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                                  {a.description || a.triggerCondition}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Patient */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              {a.patientAvatar ? (
                                <img
                                  src={a.patientAvatar}
                                  alt={a.patientName}
                                  className="h-8 w-8 rounded-full object-cover border border-slate-200 shrink-0"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 border border-indigo-200">
                                  {a.patientName ? a.patientName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'PT'}
                                </div>
                              )}
                              <div>
                                <p className="font-extrabold text-slate-900 text-xs">{a.patientName}</p>
                                <p className="text-[10px] font-semibold text-slate-400">
                                  Room {a.roomLocation || '302'} • {a.careUnit || 'Cardiology'}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Alert Type */}
                          <td className="py-3.5 px-4">
                            {getTypePill(a.type || 'Vital Signs')}
                          </td>

                          {/* Severity */}
                          <td className="py-3.5 px-4">
                            {getSeverityBadge(a.severity)}
                          </td>

                          {/* Time */}
                          <td className="py-3.5 px-4">
                            <p className="font-extrabold text-slate-900">
                              {a.timestampText ? a.timestampText.split(' ')[3] + ' ' + (a.timestampText.split(' ')[4] || 'AM') : '08:05 AM'}
                            </p>
                            <p className="text-[10px] font-semibold text-slate-400">
                              {a.timestampText ? a.timestampText.split(' ').slice(0, 3).join(' ') : 'May 22, 2024'}
                            </p>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            {getStatusBadge(a.status || 'New')}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAlert(a);
                                }}
                                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="View Alert Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Table Pagination Footer */}
            <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>
                Showing {filteredAlerts.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredAlerts.length)} of {filteredAlerts.length} alerts
              </span>
              
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="h-7 w-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    onClick={() => setCurrentPage(pg)}
                    className={`h-7 w-7 rounded-lg font-bold flex items-center justify-center text-xs cursor-pointer ${
                      currentPage === pg
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className="h-7 w-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Selected Alert Details Panel (4 Columns) */}
        <div className="lg:col-span-4 space-y-4 sticky top-6">
          
          {/* Card 1: Alert Details Box */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider text-slate-400">Alert Details</h3>
              <button
                onClick={() => setIsAlertDetailOpen(!isAlertDetailOpen)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                {isAlertDetailOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>

            {selectedAlert && isAlertDetailOpen && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Alert Header Highlight Banner */}
                <div className="bg-rose-50/50 border border-rose-200/80 p-3.5 rounded-xl flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangle className="h-4 w-4 stroke-[2.2]" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm leading-tight">{selectedAlert.title || selectedAlert.triggerCondition}</h4>
                      <p className="text-[11px] font-extrabold text-slate-500 mt-0.5">{selectedAlert.description || selectedAlert.triggerCondition}</p>
                    </div>
                  </div>
                  {getSeverityBadge(selectedAlert.severity)}
                </div>

                {/* Patient Information */}
                <div className="flex items-center gap-3.5 pt-1">
                  {selectedAlert.patientAvatar ? (
                    <img
                      src={selectedAlert.patientAvatar}
                      alt={selectedAlert.patientName}
                      className="h-12 w-12 rounded-full object-cover border-2 border-indigo-200 shadow-xs shrink-0"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg border-2 border-indigo-200 shadow-xs shrink-0">
                      {selectedAlert.patientName ? selectedAlert.patientName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'PT'}
                    </div>
                  )}
                  <div>
                    <h4 className="font-black text-slate-900 text-sm leading-tight">{selectedAlert.patientName}</h4>
                    <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                      Room {selectedAlert.roomLocation || '302'} • {selectedAlert.careUnit || 'Cardiology Unit'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-semibold text-slate-500">
                        {selectedAlert.ageGender || '68 Y • Female • A+'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-700">
                        {selectedAlert.patientType || 'Inpatient'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Alert Key-Value Details */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs font-semibold">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Alert Type</span>
                    <span className="font-extrabold text-slate-900">{selectedAlert.type || 'Vital Signs'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Alert Time</span>
                    <span className="font-extrabold text-slate-900">{selectedAlert.timestampText || 'May 22, 2024 08:05 AM'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Detected By</span>
                    <span className="font-extrabold text-slate-900">{selectedAlert.detectedBy || 'Monitor System'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Source</span>
                    <span className="font-extrabold text-slate-900">{selectedAlert.source || 'Bedside Monitor'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Notes</span>
                    <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-medium text-[11px] leading-relaxed">
                      {selectedAlert.notes || 'Patient complained of headache and dizziness.'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer">
                    View Patient Profile
                  </button>
                  <button className="w-full py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer">
                    <span>Update Status</span>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h3 className="font-extrabold text-slate-900 text-xs">Quick Actions</h3>

            <div className="space-y-2">
              <button
                onClick={(e) => selectedAlert && handleAcknowledge(selectedAlert.id, e)}
                className="w-full flex items-center gap-2 px-3.5 py-2.5 border border-indigo-200 rounded-xl text-xs font-extrabold text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                Acknowledge Alert
              </button>
              <button className="w-full flex items-center gap-2 px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
                <FilePlus className="h-4 w-4 text-slate-500" />
                Add Note
              </button>
              <button className="w-full flex items-center gap-2 px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
                <Users className="h-4 w-4 text-slate-500" />
                Notify Care Team
              </button>
              <button className="w-full flex items-center gap-2 px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-extrabold text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer">
                <TrendingUp className="h-4 w-4" />
                Escalate Alert
              </button>
            </div>
          </div>

          {/* Card 3: Alert Trends (Today) Donut Chart Box */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-900 text-xs">Alert Trends (Today)</h3>
              <button className="text-[11px] font-bold text-indigo-600 hover:underline">View All</button>
            </div>

            <div className="flex items-center gap-6">
              {/* Donut Chart SVG */}
              <div className="relative h-28 w-28 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <path
                    className="text-slate-100"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Critical (33%) */}
                  <path
                    className="text-rose-500"
                    strokeDasharray="33, 100"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* High (28%) */}
                  <path
                    className="text-amber-500"
                    strokeDasharray="28, 100"
                    strokeDashoffset="-33"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Medium (28%) */}
                  <path
                    className="text-amber-300"
                    strokeDasharray="28, 100"
                    strokeDashoffset="-61"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Information (11%) */}
                  <path
                    className="text-blue-500"
                    strokeDasharray="11, 100"
                    strokeDashoffset="-89"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-black text-slate-900 leading-none">{alerts.length}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Total</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-2 text-xs font-semibold text-slate-600 flex-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span> Critical
                  </span>
                  <span className="font-extrabold text-slate-900">{criticalCount} <span className="text-[10px] text-slate-400 font-medium">({alerts.length ? Math.round((criticalCount / alerts.length) * 100) : 0}%)</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span> High
                  </span>
                  <span className="font-extrabold text-slate-900">{highCount} <span className="text-[10px] text-slate-400 font-medium">({alerts.length ? Math.round((highCount / alerts.length) * 100) : 0}%)</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-300"></span> Medium
                  </span>
                  <span className="font-extrabold text-slate-900">{mediumCount} <span className="text-[10px] text-slate-400 font-medium">({alerts.length ? Math.round((mediumCount / alerts.length) * 100) : 0}%)</span></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span> Information
                  </span>
                  <span className="font-extrabold text-slate-900">{infoCount} <span className="text-[10px] text-slate-400 font-medium">({alerts.length ? Math.round((infoCount / alerts.length) * 100) : 0}%)</span></span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default AlertsPage;

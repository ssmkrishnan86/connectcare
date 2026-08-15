import React, { useState, useEffect } from 'react';
import {
  Bell,
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  Download,
  Plus,
  Eye,
  MoreVertical,
  SlidersHorizontal,
  RotateCcw,
  Activity,
  Pill,
  Wrench,
  UserPlus,
  ShieldAlert,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Pagination } from '@/components/common/Pagination';
import { api } from '@/lib/api';
import { AlertCreateModal } from '../components/AlertCreateModal';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalAlerts: 28,
    critical: 6,
    high: 8,
    medium: 9,
    resolvedToday: 14,
  });
  const [activeTab, setActiveTab] = useState('All Alerts');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const loadAlerts = () => {
    api.getAlerts()
      .then((data) => setAlerts(data || []))
      .catch(console.error);

    api.getAlertStats()
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleAcknowledge = async (id: string) => {
    try {
      await api.acknowledgeAlert(id);
      loadAlerts();
    } catch (err) {
      console.error('Failed to acknowledge alert', err);
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    let matchesTab = true;
    if (activeTab === 'Open') matchesTab = alert.status === 'Open' || (!alert.isAcknowledged && alert.status !== 'Resolved');
    else if (activeTab === 'In Progress') matchesTab = alert.status === 'In Progress' || alert.status === 'InProgress';
    else if (activeTab === 'Resolved') matchesTab = alert.status === 'Resolved' || alert.isAcknowledged;
    else if (activeTab === 'Dismissed') matchesTab = alert.status === 'Dismissed';

    const matchesStatus = statusFilter === 'All' || (alert.status || '').toLowerCase() === statusFilter.toLowerCase();
    const matchesPriority = priorityFilter === 'All' || (alert.severity || '').toString().toLowerCase() === priorityFilter.toLowerCase();
    const matchesType = typeFilter === 'All' || (alert.type || '').toLowerCase() === typeFilter.toLowerCase();
    const matchesLoc = locationFilter === 'All' || (alert.roomLocation || '').toLowerCase().includes(locationFilter.toLowerCase());

    return matchesTab && matchesStatus && matchesPriority && matchesType && matchesLoc;
  });

  const getAlertIcon = (typeStr: string, severityStr: string) => {
    if (severityStr === 'Critical' || severityStr === '0') {
      return <div className="h-8 w-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0"><AlertOctagon className="h-4 w-4 stroke-[2]" /></div>;
    }
    if (severityStr === 'High' || severityStr === '1') {
      return <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0"><AlertTriangle className="h-4 w-4 stroke-[2]" /></div>;
    }
    if (typeStr === 'Resolved' || severityStr === 'Low') {
      return <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><CheckCircle2 className="h-4 w-4 stroke-[2]" /></div>;
    }
    return <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><Info className="h-4 w-4 stroke-[2]" /></div>;
  };

  const getTypeBadge = (typeStr: string) => {
    switch (typeStr?.toLowerCase()) {
      case 'patient safety': case 'patientsafety':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-50 text-pink-700 border border-pink-200"><ShieldAlert className="h-3 w-3" /> Patient Safety</span>;
      case 'vital signs': case 'vitalsigns':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"><Activity className="h-3 w-3" /> Vital Signs</span>;
      case 'medication':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><Pill className="h-3 w-3" /> Medication</span>;
      case 'equipment':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200"><Wrench className="h-3 w-3" /> Equipment</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"><UserPlus className="h-3 w-3" /> Admission</span>;
    }
  };

  const getPriorityBadge = (pri: any) => {
    const pStr = pri?.toString().toLowerCase();
    if (pStr === 'critical' || pStr === '0') return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white uppercase">Critical</span>;
    if (pStr === 'high' || pStr === '1') return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white uppercase">High</span>;
    if (pStr === 'medium' || pStr === '2') return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500 text-white uppercase">Medium</span>;
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white uppercase">Low</span>;
  };

  const getStatusBadge = (statusStr: string, isAck: boolean) => {
    if (statusStr === 'Resolved' || isAck) return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Resolved</span>;
    if (statusStr === 'In Progress' || statusStr === 'InProgress') return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">In Progress</span>;
    return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">Open</span>;
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <PageHeader
        title={
          <div className="flex items-center gap-2">
            <span>Alerts & Incidents</span>
            <span className="h-5 w-5 rounded-full bg-red-500 text-white font-bold text-[11px] flex items-center justify-center">12</span>
          </div>
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Alerts & Incidents' },
        ]}
        actions={
          <>
            <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-colors">
              <Download className="h-4 w-4" /> Export
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-colors"
            >
              <Plus className="h-4 w-4" /> New Alert
            </button>
          </>
        }
      />

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { title: 'Total Alerts', value: (stats.totalAlerts || alerts.length || 28).toString(), subtext: '↑ 27% vs last 7 days', icon: Bell, bg: 'bg-pink-100 text-pink-600' },
          { title: 'Critical', value: (stats.critical || 6).toString(), subtext: 'Needs immediate attention', icon: AlertOctagon, bg: 'bg-red-100 text-red-600' },
          { title: 'High Priority', value: (stats.high || 8).toString(), subtext: 'Action required soon', icon: AlertTriangle, bg: 'bg-amber-100 text-amber-600' },
          { title: 'Medium Priority', value: (stats.medium || 9).toString(), subtext: 'Requires monitoring', icon: Info, bg: 'bg-blue-100 text-blue-600' },
          { title: 'Resolved Today', value: (stats.resolvedToday || 14).toString(), subtext: '↑ 20% vs yesterday', icon: CheckCircle2, bg: 'bg-emerald-100 text-emerald-600' },
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
            <p className="mt-2 text-[11px] font-medium text-slate-400">
              {stat.subtext}
            </p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col text-[10px] text-slate-400">
            <span>Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
            >
              <option value="All">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div className="flex flex-col text-[10px] text-slate-400">
            <span>Priority</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="flex flex-col text-[10px] text-slate-400">
            <span>Type</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
            >
              <option value="All">All Types</option>
              <option value="Patient Safety">Patient Safety</option>
              <option value="Vital Signs">Vital Signs</option>
              <option value="Medication">Medication</option>
              <option value="Equipment">Equipment</option>
              <option value="Admission">Admission</option>
            </select>
          </div>

          <div className="flex flex-col text-[10px] text-slate-400">
            <span>Location / Unit</span>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
            >
              <option value="All">All Locations</option>
              <option value="West Wing">West Wing</option>
              <option value="ICU">ICU</option>
              <option value="East Wing">East Wing</option>
              <option value="North Block">North Block</option>
            </select>
          </div>

          <div className="flex flex-col text-[10px] text-slate-400">
            <span>Date Range</span>
            <input
              type="text"
              readOnly
              value="May 13 - May 19, 2025"
              className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2 pt-3">
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-600">
              <SlidersHorizontal className="h-3.5 w-3.5" /> More Filters
            </button>
            <button
              onClick={() => {
                setStatusFilter('All');
                setPriorityFilter('All');
                setTypeFilter('All');
                setLocationFilter('All');
              }}
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-600"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Clear
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          {[
            { label: 'All Alerts', count: 28 },
            { label: 'Open', count: 14 },
            { label: 'In Progress', count: 5 },
            { label: 'Resolved', count: 9 },
            { label: 'Dismissed', count: 0 },
          ].map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === tab.label
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === tab.label ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-3 w-8">
                  <input type="checkbox" className="rounded border-slate-300" />
                </th>
                <th className="p-3">Alert / Incident</th>
                <th className="p-3">Patient</th>
                <th className="p-3">Type</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Location / Unit</th>
                <th className="p-3">Reported By</th>
                <th className="p-3">Time</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAlerts.map((alert) => (
                <tr key={alert.id || alert.alertIdCode} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3">
                    <input type="checkbox" className="rounded border-slate-300" />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {getAlertIcon(alert.type, alert.severity)}
                      <div>
                        <p className="font-bold text-slate-900">{alert.title || alert.triggerCondition}</p>
                        <p className="text-[10px] text-slate-400">{alert.description || alert.triggerCondition}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    {alert.patientName && alert.patientName !== '--' ? (
                      <div className="flex items-center gap-2.5">
                        <img src={alert.patientAvatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"} alt={alert.patientName} className="h-7 w-7 rounded-full object-cover shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900">{alert.patientName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{alert.patientIdCode || 'PID-10023'}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-semibold">--</span>
                    )}
                  </td>
                  <td className="p-3">
                    {getTypeBadge(alert.type || 'Patient Safety')}
                  </td>
                  <td className="p-3">
                    {getPriorityBadge(alert.severity)}
                  </td>
                  <td className="p-3 font-semibold text-slate-800">{alert.roomLocation}</td>
                  <td className="p-3">
                    <p className="font-bold text-slate-800">{alert.reportedByRole || alert.reportedBy}</p>
                    <p className="text-[10px] text-slate-400">{alert.reportedBy}</p>
                  </td>
                  <td className="p-3 text-[11px] text-slate-500 font-medium whitespace-nowrap">{alert.timestampText || 'May 19, 2025 09:15 AM'}</td>
                  <td className="p-3">
                    {getStatusBadge(alert.status, alert.isAcknowledged)}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Acknowledge Alert"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <Pagination
        currentPage={currentPage}
        totalPages={4}
        totalResults={28}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        itemLabel="alerts"
      />

      <AlertCreateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadAlerts}
      />
    </div>
  );
};

export default AlertsPage;

import React, { useState, useEffect } from 'react';
import {
  Pill,
  CheckCircle2,
  Clock,
  FileText,
  AlertTriangle,
  Search,
  Plus,
  Eye,
  Edit2,
  MoreVertical,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Pagination } from '@/components/common/Pagination';
import { api } from '@/lib/api';

export const MedicationsPage: React.FC = () => {
  const [medications, setMedications] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalMedications: 248,
    active: 198,
    dueToday: 42,
    prescriptions: 156,
    interactionsFound: 5,
  });
  const [reminders, setReminders] = useState<any[]>([]);
  const [expiring, setExpiring] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('All Medications');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [routeFilter, setRouteFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    api.getMedications(searchTerm, statusFilter !== 'All' ? statusFilter : undefined)
      .then((data) => setMedications(data || []))
      .catch(console.error);

    api.getMedicationStats()
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(console.error);

    api.getMedicationReminders()
      .then((data) => setReminders(data || []))
      .catch(console.error);

    api.getExpiringMedications()
      .then((data) => setExpiring(data || []))
      .catch(console.error);
  }, [searchTerm, statusFilter]);

  const filteredMedications = medications.filter((m) => {
    let matchesTab = true;
    if (activeTab === 'Active') matchesTab = m.status === 'Active';
    else if (activeTab === 'Discontinued') matchesTab = m.status === 'Discontinued';
    else if (activeTab === 'On Hold') matchesTab = m.status === 'On Hold';

    const matchesType = typeFilter === 'All' || (m.form || '').toLowerCase() === typeFilter.toLowerCase();
    const matchesRoute = routeFilter === 'All' || (m.route || '').toLowerCase() === routeFilter.toLowerCase();

    return matchesTab && matchesType && matchesRoute;
  });

  const getStatusBadge = (statusStr: string) => {
    if (statusStr === 'Active') {
      return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-700">Active</span>;
    }
    if (statusStr === 'Discontinued') {
      return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-600">Discontinued</span>;
    }
    return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-700">On Hold</span>;
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Medication Management"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Medication' },
        ]}
        actions={
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-colors">
            <Plus className="h-4 w-4" /> Add Medication
          </button>
        }
      />

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { title: 'Total Medications', value: (stats.totalMedications || 248).toString(), subtext: 'Across all patients', icon: Pill, bg: 'bg-purple-100 text-purple-600' },
          { title: 'Active Medications', value: (stats.active || 198).toString(), subtext: '79.8% of total', icon: CheckCircle2, bg: 'bg-emerald-100 text-emerald-600' },
          { title: 'Due Today', value: (stats.dueToday || 42).toString(), subtext: 'Next dose due', icon: Clock, bg: 'bg-amber-100 text-amber-600' },
          { title: 'Prescriptions', value: (stats.prescriptions || 156).toString(), subtext: 'Active prescriptions', icon: FileText, bg: 'bg-blue-100 text-blue-600' },
          { title: 'Interactions Found', value: (stats.interactionsFound || 5).toString(), subtext: 'Requires review', icon: AlertTriangle, bg: 'bg-rose-100 text-rose-600' },
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
            <p className={`mt-2 text-[11px] font-semibold ${stat.title.includes('Active') ? 'text-emerald-600' : stat.title.includes('Due') ? 'text-amber-600' : stat.title.includes('Interactions') ? 'text-rose-600' : 'text-slate-400'}`}>
              {stat.subtext}
            </p>
          </div>
        ))}
      </div>

      {/* Grid Layout: Main Table (Left) + Side Panels (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Columns: Filters & Medication Table */}
        <div className="lg:col-span-3 space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative w-full lg:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search medication name..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <div className="flex flex-col text-[10px] text-slate-400">
                  <span>Status</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
                  >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Discontinued">Discontinued</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>

                <div className="flex flex-col text-[10px] text-slate-400">
                  <span>Medication Type</span>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
                  >
                    <option value="All">All Types</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Inhaler">Inhaler</option>
                    <option value="Capsule">Capsule</option>
                  </select>
                </div>

                <div className="flex flex-col text-[10px] text-slate-400">
                  <span>Route</span>
                  <select
                    value={routeFilter}
                    onChange={(e) => setRouteFilter(e.target.value)}
                    className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
                  >
                    <option value="All">All Routes</option>
                    <option value="Oral">Oral</option>
                    <option value="Inhalation">Inhalation</option>
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
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-3">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-600">
                    <SlidersHorizontal className="h-3.5 w-3.5" /> More Filters
                  </button>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('All');
                      setTypeFilter('All');
                      setRouteFilter('All');
                      setLocationFilter('All');
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-600"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              {[
                { label: 'All Medications', count: 248 },
                { label: 'Active', count: 198 },
                { label: 'Discontinued', count: 32 },
                { label: 'On Hold', count: 18 },
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
                    <th className="p-3">Medication</th>
                    <th className="p-3">Patient</th>
                    <th className="p-3">Dosage & Route</th>
                    <th className="p-3">Frequency</th>
                    <th className="p-3">Next Dose</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Prescribed By</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMedications.map((m) => (
                    <tr key={m.id || m.medicationIdCode} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${m.status === 'Discontinued' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-600'}`}>
                            <Pill className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{m.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{m.form}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <img src={m.patientAvatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"} alt={m.patientName} className="h-7 w-7 rounded-full object-cover shrink-0" />
                          <div>
                            <p className="font-bold text-slate-900">{m.patientName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{m.patientIdCode || 'PID-10023'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{m.dosage}</p>
                        <p className="text-[10px] text-slate-400">{m.route}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-slate-800">{m.frequency?.split('(')[0]}</p>
                        <p className="text-[10px] text-slate-400">{m.frequency?.includes('(') ? m.frequency.split('(')[1].replace(')', '') : ''}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-semibold text-slate-800 text-[11px]">{m.nextDoseTime}</p>
                        {m.relativeTimeText && (
                          <p className="text-[10px] font-bold text-amber-600">{m.relativeTimeText}</p>
                        )}
                      </td>
                      <td className="p-3">
                        {getStatusBadge(m.status)}
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{m.prescribedBy}</p>
                        <p className="text-[10px] text-slate-400">{m.prescribedBySpecialty}</p>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                            <Edit2 className="h-4 w-4" />
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
            totalPages={25}
            totalResults={248}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            itemLabel="medications"
          />
        </div>

        {/* Right 1 Column: Medication Reminders & Expiring Cards */}
        <div className="space-y-4">
          {/* Card 1: Medication Reminders */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h4 className="font-bold text-xs text-slate-900">Medication Reminders</h4>
              <button className="text-[11px] font-semibold text-blue-600 hover:underline">View all</button>
            </div>
            <div className="space-y-3">
              {reminders.map((r, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <img src={r.patientAvatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"} alt={r.patientName} className="h-7 w-7 rounded-full object-cover shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900">{r.patientName}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{r.medicationName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${r.doseTimeText === 'As needed' ? 'text-blue-600' : 'text-slate-900'}`}>{r.doseTimeText}</p>
                    {r.relativeTimeText && r.relativeTimeText !== 'As needed' && (
                      <p className="text-[10px] font-semibold text-amber-600">{r.relativeTimeText}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Expiring Soon */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h4 className="font-bold text-xs text-slate-900">Expiring Soon</h4>
              <button className="text-[11px] font-semibold text-blue-600 hover:underline">View all</button>
            </div>
            <div className="space-y-3">
              {expiring.map((exp, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                      <Pill className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{exp.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{exp.batch}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-rose-600">{exp.expiryDate}</p>
                    <p className="text-[10px] font-bold text-rose-500">{exp.daysLeft}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Drug Interaction Alerts */}
          <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-200 card-shadow">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-xs text-rose-900">Drug Interaction Alerts</h4>
              <button className="text-[11px] font-semibold text-blue-600 hover:underline">View all</button>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-rose-600">5</span>
              <span className="text-xs font-semibold text-rose-800">Potential interactions found</span>
            </div>
            <p className="text-[11px] font-bold text-rose-600 mt-1">Requires review</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicationsPage;

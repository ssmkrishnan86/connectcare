import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Edit,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Filter,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { api } from '@/lib/api';

export const AuditLogsPage: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalEvents: 25842,
    totalEventsChange: '↑ 12.5% vs last 7 days',
    userLogins: 2156,
    userLoginsChange: '↑ 8.4% vs last 7 days',
    dataChanges: 18934,
    dataChangesChange: '↑ 15.2% vs last 7 days',
    securityEvents: 312,
    securityEventsChange: '↑ 6.3% vs last 7 days',
    failedAttempts: 98,
    failedAttemptsChange: '↓ 4.1% vs last 7 days',
  });
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('All Users');
  const [moduleFilter, setModuleFilter] = useState('All Modules');
  const [actionFilter, setActionFilter] = useState('All Actions');
  const [statusFilter, setStatusFilter] = useState('All Status');

  useEffect(() => {
    api.getAuditLogs(searchTerm, userFilter, moduleFilter, actionFilter, statusFilter)
      .then((data) => {
        setEntries(data || []);
        if (data && data.length > 0 && !selectedEntry) {
          setSelectedEntry(data[0]);
        }
      })
      .catch(console.error);

    api.getAuditLogStats()
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(console.error);
  }, [searchTerm, userFilter, moduleFilter, actionFilter, statusFilter]);

  const getActionBadge = (actionStr: string) => {
    switch (actionStr?.toUpperCase()) {
      case 'CREATE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">CREATE</span>;
      case 'UPDATE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">UPDATE</span>;
      case 'DELETE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">DELETE</span>;
      case 'LOGIN':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">LOGIN</span>;
      case 'LOGIN_FAIL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">LOGIN_FAIL</span>;
      case 'EXPORT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-100 text-pink-800">EXPORT</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">{actionStr}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* Page Header */}
      <PageHeader
        title="Audit Logs"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Audit Logs' },
        ]}
        actions={
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm">
            <Download className="h-4 w-4 text-slate-500" /> Export Logs
          </button>
        }
      />

      {/* 5 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { title: 'Total Events', value: (stats.totalEvents || 25842).toLocaleString(), change: stats.totalEventsChange, icon: ShieldAlert, bg: 'bg-purple-100 text-purple-600', isUp: true },
          { title: 'User Logins', value: (stats.userLogins || 2156).toLocaleString(), change: stats.userLoginsChange, icon: Users, bg: 'bg-blue-100 text-blue-600', isUp: true },
          { title: 'Data Changes', value: (stats.dataChanges || 18934).toLocaleString(), change: stats.dataChangesChange, icon: Edit, bg: 'bg-emerald-100 text-emerald-600', isUp: true },
          { title: 'Security Events', value: (stats.securityEvents || 312).toString(), change: stats.securityEventsChange, icon: ShieldCheck, bg: 'bg-amber-100 text-amber-600', isUp: true },
          { title: 'Failed Attempts', value: (stats.failedAttempts || 98).toString(), change: stats.failedAttemptsChange, icon: AlertTriangle, bg: 'bg-rose-100 text-rose-600', isUp: false },
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
          <div className="flex flex-col text-[10px] text-slate-400 font-medium">
            <span>Date Range</span>
            <div className="mt-1 flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>May 13, 2025 – May 19, 2025</span>
            </div>
          </div>

          <div className="flex flex-col text-[10px] text-slate-400 font-medium">
            <span>User</span>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="mt-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
            >
              <option>All Users</option>
              <option>John Admin</option>
              <option>Priya Nurse</option>
              <option>Dr. David Allen</option>
            </select>
          </div>

          <div className="flex flex-col text-[10px] text-slate-400 font-medium">
            <span>Module</span>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="mt-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
            >
              <option>All Modules</option>
              <option>Resident</option>
              <option>Medication</option>
              <option>Clinical Note</option>
              <option>Task</option>
              <option>Authentication</option>
            </select>
          </div>

          <div className="flex flex-col text-[10px] text-slate-400 font-medium">
            <span>Action</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="mt-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
            >
              <option>All Actions</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="LOGIN">LOGIN</option>
              <option value="LOGIN_FAIL">LOGIN_FAIL</option>
            </select>
          </div>

          <div className="flex flex-col text-[10px] text-slate-400 font-medium">
            <span>Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
            >
              <option>All Status</option>
              <option value="Success">Success</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-3">
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold">
            <Filter className="h-3.5 w-3.5" /> Filters
          </button>
          <button
            onClick={() => {
              setUserFilter('All Users');
              setModuleFilter('All Modules');
              setActionFilter('All Actions');
              setStatusFilter('All Status');
              setSearchTerm('');
            }}
            className="text-xs font-semibold text-purple-600 hover:underline"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Main Grid: Audit Log Entries (2/3) + Log Details Inspector (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Entries Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 card-shadow p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900">
                Audit Log Entries (1 - {entries.length} of 25,842)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Date & Time</th>
                    <th className="p-3">User</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Module</th>
                    <th className="p-3">Record / Description</th>
                    <th className="p-3">IP Address</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {entries.map((entry, idx) => (
                    <tr
                      key={entry.id || idx}
                      onClick={() => setSelectedEntry(entry)}
                      className={`hover:bg-purple-50/50 cursor-pointer transition-colors ${selectedEntry?.id === entry.id ? 'bg-purple-50/80 border-l-4 border-purple-600' : ''}`}
                    >
                      <td className="p-3 text-[11px] text-slate-500 whitespace-nowrap">{entry.dateTimeText}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[10px] shrink-0">
                            {entry.userName?.substring(0, 2).toUpperCase() || 'JA'}
                          </div>
                          <span className="font-bold text-slate-900">{entry.userName}</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-600 text-[11px]">{entry.userRole}</td>
                      <td className="p-3">{getActionBadge(entry.action)}</td>
                      <td className="p-3 font-semibold text-slate-800">{entry.module}</td>
                      <td className="p-3 text-slate-700 text-[11px] line-clamp-1">{entry.recordDescription}</td>
                      <td className="p-3 font-mono text-[10px] text-slate-500">{entry.ipAddress}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${entry.status === 'Success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500 font-medium">Showing 1 to 20 of 25,842 entries</span>
              <div className="flex items-center gap-2">
                <button className="p-1 border border-slate-200 rounded text-slate-400 hover:text-slate-600">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button className="px-2 py-0.5 bg-purple-600 text-white rounded font-bold">1</button>
                <button className="px-2 py-0.5 hover:bg-slate-100 text-slate-600 rounded">2</button>
                <button className="px-2 py-0.5 hover:bg-slate-100 text-slate-600 rounded">3</button>
                <button className="px-2 py-0.5 hover:bg-slate-100 text-slate-600 rounded">4</button>
                <button className="px-2 py-0.5 hover:bg-slate-100 text-slate-600 rounded">5</button>
                <span className="text-slate-400">...</span>
                <button className="px-2 py-0.5 hover:bg-slate-100 text-slate-600 rounded">1293</button>
                <button className="p-1 border border-slate-200 rounded text-slate-400 hover:text-slate-600">
                  <ChevronRight className="h-4 w-4" />
                </button>
                <select className="ml-2 px-2 py-1 border border-slate-200 rounded text-slate-600 text-[11px]">
                  <option>20 / page</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Log Details Inspector Panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 card-shadow p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-sm text-slate-900">Log Details</h4>
              <button className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Action Header Banner */}
            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                {getActionBadge(selectedEntry?.action || 'CREATE')}
                <span className="text-[11px] text-slate-500 font-semibold">{selectedEntry?.dateTimeText || 'May 19, 2025 10:15:30 AM'}</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                {selectedEntry?.status || 'Success'}
              </span>
            </div>

            {/* User Information */}
            <div className="space-y-2 border-b border-slate-100 pb-3 text-xs">
              <h5 className="font-bold text-[11px] uppercase tracking-wider text-slate-400">User Information</h5>
              <div className="flex justify-between">
                <span className="text-slate-500">User Name</span>
                <span className="font-bold text-slate-900">{selectedEntry?.userName || 'John Admin'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Role</span>
                <span className="font-semibold text-slate-700">{selectedEntry?.userRole || 'System Administrator'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">User ID</span>
                <span className="font-mono text-slate-600">USR-001</span>
              </div>
            </div>

            {/* Action Information */}
            <div className="space-y-2 border-b border-slate-100 pb-3 text-xs">
              <h5 className="font-bold text-[11px] uppercase tracking-wider text-slate-400">Action Information</h5>
              <div className="flex justify-between">
                <span className="text-slate-500">Action</span>
                <span className="font-bold text-slate-900">{selectedEntry?.action || 'CREATE'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Module</span>
                <span className="font-semibold text-slate-700">{selectedEntry?.module || 'Resident'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Record</span>
                <span className="font-bold text-slate-900">{selectedEntry?.recordDescription?.split('record ')[1] || 'Mary Johnson (RID-10023)'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Description</span>
                <span className="font-medium text-slate-700">{selectedEntry?.recordDescription || 'Created new resident record'}</span>
              </div>
            </div>

            {/* Technical Information */}
            <div className="space-y-2 border-b border-slate-100 pb-3 text-xs">
              <h5 className="font-bold text-[11px] uppercase tracking-wider text-slate-400">Technical Information</h5>
              <div className="flex justify-between">
                <span className="text-slate-500">IP Address</span>
                <span className="font-mono font-bold text-slate-900">{selectedEntry?.ipAddress || '192.168.1.25'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Device / Browser</span>
                <span className="font-medium text-slate-700">Chrome 124.0.0.0 / Windows 11</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Session ID</span>
                <span className="font-mono text-slate-600 text-[10px]">sess_8f72g7sd89f7sd</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Application</span>
                <span className="font-semibold text-slate-700">Connected Care Admin Portal</span>
              </div>
            </div>

            {/* Changes (New Record) */}
            <div className="space-y-2 border-b border-slate-100 pb-3 text-xs">
              <h5 className="font-bold text-[11px] uppercase tracking-wider text-slate-400">Changes (New Record)</h5>
              <div className="flex justify-between">
                <span className="text-slate-500">Full Name</span>
                <span className="font-bold text-slate-900">Mary Johnson</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date of Birth</span>
                <span className="font-medium text-slate-700">May 12, 1948</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gender</span>
                <span className="font-medium text-slate-700">Female</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Room / Unit</span>
                <span className="font-medium text-slate-700">301A / Assisted Living</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Primary Care Physician</span>
                <span className="font-semibold text-purple-700">Dr. David Allen</span>
              </div>
              <button className="text-[11px] font-semibold text-purple-600 hover:underline pt-1">View all 18 fields</button>
            </div>

            {/* More Information */}
            <div className="space-y-2 text-xs">
              <h5 className="font-bold text-[11px] uppercase tracking-wider text-slate-400">More Information</h5>
              <div className="flex justify-between">
                <span className="text-slate-500">Data Source</span>
                <span className="font-semibold text-slate-700">Web Application</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Event ID</span>
                <span className="font-mono text-slate-600 text-[10px]">EVT-20250519-00025642</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsPage;

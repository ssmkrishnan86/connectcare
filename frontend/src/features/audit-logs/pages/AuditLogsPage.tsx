import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  Users,
  Edit,
  ShieldCheck,
  AlertTriangle,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { api } from '@/lib/api';
import { toast } from '@/context/ToastContext';

export const AuditLogsPage: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalEvents: 0,
    totalEventsChange: '0 events',
    userLogins: 0,
    userLoginsChange: '0 sessions',
    dataChanges: 0,
    dataChangesChange: '0 mutations',
    securityEvents: 0,
    securityEventsChange: '0 events',
    failedAttempts: 0,
    failedAttemptsChange: '0 alerts',
  });
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('All Users');
  const [moduleFilter, setModuleFilter] = useState('All Modules');
  const [actionFilter, setActionFilter] = useState('All Actions');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const fetchAuditLogs = () => {
    api.getAuditLogs(searchTerm, userFilter, moduleFilter, actionFilter, statusFilter)
      .then((data) => {
        const list = data || [];
        setEntries(list);
        if (list.length > 0) {
          setSelectedEntry((prev: any) => {
            if (prev) {
              const fresh = list.find((item: any) => item.id === prev.id);
              if (fresh) return fresh;
            }
            return list[0];
          });
        } else {
          setSelectedEntry(null);
        }
      })
      .catch(console.error);

    api.getAuditLogStats()
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [searchTerm, userFilter, moduleFilter, actionFilter, statusFilter]);

  // Extract unique users and modules dynamically for dropdowns
  const availableUsers = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => {
      if (e.userName) set.add(e.userName);
    });
    return Array.from(set);
  }, [entries]);

  const availableModules = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => {
      if (e.module) set.add(e.module);
    });
    return Array.from(set);
  }, [entries]);

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
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">{actionStr || 'N/A'}</span>;
    }
  };

  const totalCount = stats.totalEvents || entries.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

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
          <button
            onClick={() => {
              if (entries.length === 0) {
                toast.warning('No audit log records to export.');
                return;
              }
              const headers = ['Timestamp', 'Event Type', 'User', 'Role', 'Action', 'IP Address', 'Severity'];
              const rows = entries.map((e) => [
                `"${e.timestamp || ''}"`,
                `"${e.eventType || ''}"`,
                `"${e.userName || ''}"`,
                `"${e.role || ''}"`,
                `"${e.action || ''}"`,
                `"${e.ipAddress || ''}"`,
                `"${e.severity || ''}"`
              ]);
              const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement('a');
              link.setAttribute('href', encodedUri);
              link.setAttribute('download', `ConnectCare_Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              toast.success(`Exported ${entries.length} audit log record(s) to CSV.`);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="h-4 w-4 text-slate-500" /> Export Logs
          </button>
        }
      />

      {/* 5 Dynamic KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { title: 'Total Events', value: (stats.totalEvents ?? 0).toLocaleString(), change: stats.totalEventsChange, icon: ShieldAlert, bg: 'bg-purple-100 text-purple-600', isUp: true },
          { title: 'User Logins', value: (stats.userLogins ?? 0).toLocaleString(), change: stats.userLoginsChange, icon: Users, bg: 'bg-blue-100 text-blue-600', isUp: true },
          { title: 'Data Changes', value: (stats.dataChanges ?? 0).toLocaleString(), change: stats.dataChangesChange, icon: Edit, bg: 'bg-emerald-100 text-emerald-600', isUp: true },
          { title: 'Security Events', value: (stats.securityEvents ?? 0).toLocaleString(), change: stats.securityEventsChange, icon: ShieldCheck, bg: 'bg-amber-100 text-amber-600', isUp: true },
          { title: 'Failed Attempts', value: (stats.failedAttempts ?? 0).toLocaleString(), change: stats.failedAttemptsChange, icon: AlertTriangle, bg: 'bg-rose-100 text-rose-600', isUp: false },
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
              {stat.change || '--'}
            </p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col text-[10px] text-slate-400 font-medium">
            <span>Search</span>
            <div className="relative mt-1 w-52">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search user, action, IP..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
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
              {availableUsers.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
              {!availableUsers.includes('John Admin') && <option value="John Admin">John Admin</option>}
              {!availableUsers.includes('Priya Nurse') && <option value="Priya Nurse">Priya Nurse</option>}
              {!availableUsers.includes('Dr. David Allen') && <option value="Dr. David Allen">Dr. David Allen</option>}
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
              {availableModules.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
              {!availableModules.includes('Resident') && <option value="Resident">Resident</option>}
              {!availableModules.includes('Medication') && <option value="Medication">Medication</option>}
              {!availableModules.includes('Clinical Note') && <option value="Clinical Note">Clinical Note</option>}
              {!availableModules.includes('Task') && <option value="Task">Task</option>}
              {!availableModules.includes('Authentication') && <option value="Authentication">Authentication</option>}
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
              <option value="EXPORT">EXPORT</option>
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
            Clear All Filters
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
                {entries.length === 0
                  ? 'Audit Log Entries (0 entries)'
                  : `Audit Log Entries (1 - ${entries.length} of ${totalCount.toLocaleString()})`}
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
                  {entries.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                        No audit log records found in database matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    entries.map((entry, idx) => (
                      <tr
                        key={entry.id || idx}
                        onClick={() => setSelectedEntry(entry)}
                        className={`hover:bg-purple-50/50 cursor-pointer transition-colors ${selectedEntry?.id === entry.id ? 'bg-purple-50/80 border-l-4 border-purple-600' : ''}`}
                      >
                        <td className="p-3 text-[11px] text-slate-500 whitespace-nowrap">{entry.dateTimeText || 'N/A'}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[10px] shrink-0">
                              {entry.userName?.substring(0, 2).toUpperCase() || 'U'}
                            </div>
                            <span className="font-bold text-slate-900">{entry.userName || 'System'}</span>
                          </div>
                        </td>
                        <td className="p-3 text-slate-600 text-[11px]">{entry.userRole || 'User'}</td>
                        <td className="p-3">{getActionBadge(entry.action)}</td>
                        <td className="p-3 font-semibold text-slate-800">{entry.module || 'System'}</td>
                        <td className="p-3 text-slate-700 text-[11px] line-clamp-1">{entry.recordDescription || 'N/A'}</td>
                        <td className="p-3 font-mono text-[10px] text-slate-500">{entry.ipAddress || '127.0.0.1'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${entry.status === 'Success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {entry.status || 'Success'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Dynamic Pagination Footer */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500 font-medium">
                {entries.length === 0
                  ? 'Showing 0 of 0 entries'
                  : `Showing 1 to ${entries.length} of ${totalCount.toLocaleString()} entries`}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 border border-slate-200 rounded text-slate-400 hover:text-slate-600 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-2.5 py-0.5 rounded text-xs font-bold transition-colors ${
                      currentPage === page
                        ? 'bg-purple-600 text-white'
                        : 'hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1 border border-slate-200 rounded text-slate-400 hover:text-slate-600 disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <select className="ml-2 px-2 py-1 border border-slate-200 rounded text-slate-600 text-[11px]">
                  <option>{pageSize} / page</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Log Details Inspector Panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 card-shadow p-4 space-y-4">
            {selectedEntry ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-bold text-sm text-slate-900">Log Details</h4>
                  <button
                    onClick={() => setSelectedEntry(null)}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Action Header Banner */}
                <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    {getActionBadge(selectedEntry.action)}
                    <span className="text-[11px] text-slate-500 font-semibold">{selectedEntry.dateTimeText || 'N/A'}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedEntry.status === 'Success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {selectedEntry.status}
                  </span>
                </div>

                {/* User Information */}
                <div className="space-y-2 border-b border-slate-100 pb-3 text-xs">
                  <h5 className="font-bold text-[11px] uppercase tracking-wider text-slate-400">User Information</h5>
                  <div className="flex justify-between">
                    <span className="text-slate-500">User Name</span>
                    <span className="font-bold text-slate-900">{selectedEntry.userName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Role</span>
                    <span className="font-semibold text-slate-700">{selectedEntry.userRole || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Entry ID</span>
                    <span className="font-mono text-slate-600 text-[10px]">{selectedEntry.id?.substring(0, 8)}...</span>
                  </div>
                </div>

                {/* Action Information */}
                <div className="space-y-2 border-b border-slate-100 pb-3 text-xs">
                  <h5 className="font-bold text-[11px] uppercase tracking-wider text-slate-400">Action Information</h5>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Action</span>
                    <span className="font-bold text-slate-900">{selectedEntry.action}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Module</span>
                    <span className="font-semibold text-slate-700">{selectedEntry.module}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Description</span>
                    <span className="font-medium text-slate-700">{selectedEntry.recordDescription}</span>
                  </div>
                </div>

                {/* Technical Information */}
                <div className="space-y-2 border-b border-slate-100 pb-3 text-xs">
                  <h5 className="font-bold text-[11px] uppercase tracking-wider text-slate-400">Technical Information</h5>
                  <div className="flex justify-between">
                    <span className="text-slate-500">IP Address</span>
                    <span className="font-mono font-bold text-slate-900">{selectedEntry.ipAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Application</span>
                    <span className="font-semibold text-slate-700">Connected Care Portal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Timestamp</span>
                    <span className="font-semibold text-slate-700">{selectedEntry.dateTimeText}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-slate-400 font-medium text-xs">
                Select an audit log entry from the table to view details.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsPage;

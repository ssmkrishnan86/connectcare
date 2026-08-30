import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  History,
  RefreshCw,
  Loader2,
  Shield
} from 'lucide-react';
import { api } from '@/lib/api';

interface AuditLogRecord {
  id?: string;
  timeText?: string;
  createdDate?: string;
  title?: string;
  residentInfo?: string;
  service?: string;
  type?: string;
  action?: string;
  user?: string;
}

export const AiAuditLogsScreen: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [selectedService, setSelectedService] = useState('All Services');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const services = [
    'All Services',
    'AI Operations Governance',
    'AI Clinical Summarization',
    'AI Medication Intelligence',
    'AI Care Prioritization',
    'AI Discharge Readiness',
    'AI Copilot Orchestration',
  ];

  const loadLogs = async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res: any = await api.getAiActivities();
      const list = Array.isArray(res) ? res : res?.data || [];
      setLogs(list);
    } catch (err: any) {
      console.error('Failed to load AI audit logs:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadLogs(false);
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (selectedService === 'All Services') return true;
    return log.service?.toLowerCase().includes(selectedService.toLowerCase()) || log.title?.toLowerCase().includes(selectedService.toLowerCase());
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col font-sans">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
        <h1 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-600" />
          <span>AI Audit Trail & Provenance Registry</span>
        </h1>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadLogs(true)}
            disabled={isRefreshing || isLoading}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            title="Refresh Audit Logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Filter by Service:</span>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-2xs focus:outline-none"
          >
            {services.map((svc) => (
              <option key={svc} value={svc}>
                {svc}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Immutable HIPAA-Compliant Activity Log</span>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="p-5">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
            <span className="text-xs text-slate-500 font-medium">Retrieving audit provenance records...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No audit logs found for the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 px-3">Timestamp</th>
                  <th className="pb-3 px-3">Service</th>
                  <th className="pb-3 px-3">Activity Description</th>
                  <th className="pb-3 px-3">Resident / Scope</th>
                  <th className="pb-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredLogs.map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {log.timeText || (log.createdDate ? new Date(log.createdDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent')}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                      {log.service || 'AI Core Service'}
                    </td>
                    <td className="py-3 px-3 text-slate-800">
                      {log.title || 'AI Orchestration Request Processed'}
                    </td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {log.residentInfo || 'Hospital System'}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 ${
                          log.type === 'Success' || !log.type
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.type === 'Warning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.type === 'Success' || !log.type ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : log.type === 'Warning' ? (
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                        )}
                        <span>{log.type || 'Success'}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiAuditLogsScreen;

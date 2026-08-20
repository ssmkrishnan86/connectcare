import React, { useState, useEffect, useMemo } from 'react';
import { X, Bot, CheckCircle2, AlertTriangle, FileText, Search, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';

interface AiActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiActivityModal: React.FC<AiActivityModalProps> = ({ isOpen, onClose }) => {
  const [activities, setActivities] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchActivities = () => {
    api.getAiActivities()
      .then((data) => setActivities(data || []))
      .catch(console.error);
  };

  useEffect(() => {
    if (isOpen) {
      fetchActivities();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = activities.filter((act) => {
    const matchesSearch =
      act.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.residentInfo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.service?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'All Types' || act.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Error':
        return <div className="h-5 w-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0"><AlertTriangle className="h-3 w-3" /></div>;
      case 'Info':
        return <div className="h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><FileText className="h-3 w-3" /></div>;
      case 'Warning':
        return <div className="h-5 w-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0"><AlertTriangle className="h-3 w-3" /></div>;
      default:
        return <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><CheckCircle2 className="h-3 w-3" /></div>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">All AI Operations Activity Logs</h3>
              <p className="text-xs text-slate-500 font-medium">Historical audit trail of all AI assistant executions and operations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search activity title, resident info, service..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
            >
              <option value="All Types">All Event Types</option>
              <option value="Success">Success</option>
              <option value="Info">Info</option>
              <option value="Warning">Warning</option>
              <option value="Error">Error</option>
            </select>

            <button
              onClick={fetchActivities}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold"
            >
              <RefreshCw className="h-3.5 w-3.5 text-slate-500" /> Refresh
            </button>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3">Time</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Activity Description</th>
                  <th className="p-3">Context / Info</th>
                  <th className="p-3">AI Service</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400 font-medium">
                      No AI activity records found matching criteria.
                    </td>
                  </tr>
                ) : (
                  paginated.map((act, idx) => (
                    <tr key={act.id || idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 text-[11px] text-slate-500 font-medium whitespace-nowrap">{act.timeText}</td>
                      <td className="p-3">{getActivityIcon(act.type)}</td>
                      <td className="p-3 font-bold text-slate-900">{act.title}</td>
                      <td className="p-3 text-slate-600 text-[11px]">{act.residentInfo}</td>
                      <td className="p-3 font-semibold text-purple-700">{act.service || 'AI Core'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">
              Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} activities
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1 border border-slate-200 rounded text-slate-400 hover:text-slate-600 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-2 py-0.5 rounded text-xs font-bold transition-colors ${
                    currentPage === page ? 'bg-purple-600 text-white' : 'hover:bg-slate-100 text-slate-600'
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
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

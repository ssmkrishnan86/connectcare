import React, { useState, useEffect } from 'react';
import { X, Sparkles, RefreshCw, Search } from 'lucide-react';
import { api } from '@/lib/api';

interface AiServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiServicesModal: React.FC<AiServicesModalProps> = ({ isOpen, onClose }) => {
  const [services, setServices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchServices = () => {
    setLoading(true);
    api.getAiServices()
      .then((data) => setServices(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      fetchServices();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredServices = services.filter((s) =>
    s.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.modelVersion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">All AI Services Status</h3>
              <p className="text-xs text-slate-500 font-medium">Real-time status and models for operational AI services</p>
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
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search AI services or models..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              onClick={fetchServices}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3">AI Service Name</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Model / Version</th>
                  <th className="p-3">Uptime</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-400 font-medium">
                      No AI services found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredServices.map((s, idx) => (
                    <tr key={s.id || idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-600 shrink-0" />
                        <span>{s.serviceName}</span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${s.status === 'Healthy' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-600 text-[11px]">{s.modelVersion}</td>
                      <td className="p-3 font-bold text-slate-900">{s.uptimePercentage}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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

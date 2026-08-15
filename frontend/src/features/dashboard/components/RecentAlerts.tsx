import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Link } from 'react-router-dom';
import { api } from '../../../lib/api';

export const RecentAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    api.getRecentAlerts().then(setAlerts).catch(console.error);
  }, []);

  const getSeverityVariant = (severity: string): 'critical' | 'high' | 'medium' | 'low' => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'critical';
      case 'high': return 'high';
      case 'medium': return 'medium';
      default: return 'low';
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-900">Recent Alerts</h2>
        <Link to="/alerts" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
          View All
        </Link>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No recent alerts</p>
        ) : (
          alerts.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors text-xs">
              <div className="flex items-center gap-3">
                <Badge variant={getSeverityVariant(item.severity)} className="w-16 justify-center">
                  {item.severity}
                </Badge>
                <div>
                  <p className="font-bold text-slate-800">{item.patientName}</p>
                  <p className="text-[11px] text-slate-400">{item.location}</p>
                </div>
              </div>
              <span className="text-[11px] font-medium text-slate-500">{item.time}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

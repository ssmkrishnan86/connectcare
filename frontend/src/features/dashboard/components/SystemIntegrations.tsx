import React, { useEffect, useState } from 'react';
import { Database, Activity, Pill, Radio, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Link } from 'react-router-dom';
import { api } from '../../../lib/api';

export const SystemIntegrations: React.FC = () => {
  const [integrations, setIntegrations] = useState<any[]>([]);

  useEffect(() => {
    api.getIntegrations().then(setIntegrations).catch(console.error);
  }, []);

  const getIcon = (idx: number) => {
    const icons = [Database, Activity, Pill, Radio, DollarSign];
    const IconComp = icons[idx % icons.length];
    return <IconComp className="h-3.5 w-3.5" />;
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow flex flex-col justify-between">
      <h2 className="text-sm font-bold text-slate-900 mb-3">System Integrations</h2>

      <div className="space-y-2">
        {integrations.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                {getIcon(idx)}
              </div>
              <span className="font-semibold text-slate-800">{item.name}</span>
            </div>
            <Badge variant="active">{item.status || 'Connected'}</Badge>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-slate-100 text-center mt-2">
        <Link to="/integrations" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
          View All Integrations
        </Link>
      </div>
    </div>
  );
};

import React, { useEffect, useState, useMemo } from 'react';
import { Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

export const TopUnitsAttention: React.FC = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.getLocations().catch(() => []),
      api.getAlerts().catch(() => []),
    ]).then(([locsRes, alertsRes]) => {
      const locList = Array.isArray(locsRes) ? locsRes : (locsRes as any)?.data || [];
      const alertList = Array.isArray(alertsRes) ? alertsRes : (alertsRes as any)?.data || [];
      setLocations(locList);
      setAlerts(alertList);
    });
  }, []);

  const topUnits = useMemo(() => {
    // Extract unit names from locations or active alerts
    const unitMap = new Map<string, { critical: number; high: number; total: number }>();

    // Seed from real location units
    locations.forEach((loc) => {
      const name = loc.name || loc.unitName || loc.careUnit;
      if (name && !unitMap.has(name)) {
        unitMap.set(name, { critical: 0, high: 0, total: 0 });
      }
    });

    // Populate with real active alerts
    alerts.forEach((alert) => {
      if (alert.status === 'Resolved' || alert.status === 'Dismissed') return;
      const unit = alert.careUnit || alert.roomLocation || 'General Ward';
      const cleanUnit = unit.split('-')[0].trim();
      
      const current = unitMap.get(cleanUnit) || { critical: 0, high: 0, total: 0 };
      const sev = alert.severity?.toString().toLowerCase();
      if (sev === '0' || sev === 'critical') current.critical += 1;
      else if (sev === '1' || sev === 'high') current.high += 1;
      current.total += 1;
      unitMap.set(cleanUnit, current);
    });

    // Convert to sorted list
    const list = Array.from(unitMap.entries()).map(([name, counts]) => {
      let status: 'High' | 'Medium' | 'Low' = 'Low';
      if (counts.critical > 0 || counts.high >= 2) status = 'High';
      else if (counts.high > 0 || counts.total >= 2) status = 'Medium';

      return {
        name,
        status,
        score: counts.critical * 3 + counts.high * 2 + counts.total,
      };
    });

    list.sort((a, b) => b.score - a.score);
    return list.slice(0, 5);
  }, [locations, alerts]);

  const hasData = topUnits.length > 0 || locations.length > 0;

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow flex flex-col justify-between">
      <h2 className="text-sm font-bold text-slate-900 mb-3">Top Units Needing Attention</h2>

      <div className="space-y-2.5">
        {topUnits.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No care units recorded.</p>
        ) : (
          topUnits.map((unit) => (
            <div key={unit.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors text-xs">
              <div className="flex items-center gap-2.5">
                <Building2 className="h-4 w-4 text-slate-400" />
                <span className="font-semibold text-slate-800">{unit.name}</span>
              </div>
              <Badge
                variant={
                  unit.status === 'High' ? 'high' : unit.status === 'Medium' ? 'medium' : 'low'
                }
              >
                {unit.status}
              </Badge>
            </div>
          ))
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 text-center mt-2">
        <button
          disabled={!hasData}
          onClick={() => hasData && navigate('/locations')}
          className={`text-xs transition-colors ${
            hasData
              ? 'font-semibold text-blue-600 hover:text-blue-700 cursor-pointer'
              : 'font-semibold text-slate-300 cursor-not-allowed pointer-events-none'
          }`}
        >
          View All Units
        </button>
      </div>
    </div>
  );
};

export default TopUnitsAttention;

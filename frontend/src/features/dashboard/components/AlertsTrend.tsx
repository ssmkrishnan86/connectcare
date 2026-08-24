import React, { useEffect, useState, useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { api } from '@/lib/api';

export const AlertsTrend: React.FC = () => {
  const [range, setRange] = useState<'7' | '30'>('7');
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    api.getAlerts()
      .then((res) => {
        const list = Array.isArray(res) ? res : (res as any)?.data || [];
        setAlerts(list);
      })
      .catch(console.error);
  }, []);

  const chartData = useMemo(() => {
    const daysCount = parseInt(range, 10);
    const result: Array<{ day: string; value: number }> = [];
    const now = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().substring(0, 10);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const dayAlertsCount = alerts.filter((a) => {
        if (!a.createdDate) return false;
        try {
          return new Date(a.createdDate).toISOString().substring(0, 10) === dateStr;
        } catch {
          return false;
        }
      }).length;

      result.push({
        day: label,
        value: dayAlertsCount,
      });
    }

    return result;
  }, [alerts, range]);

  const maxVal = useMemo(() => {
    const max = Math.max(...chartData.map((d) => d.value), 5);
    return Math.ceil(max * 1.25);
  }, [chartData]);

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-900">Alerts Trend</h2>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as any)}
          className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-semibold cursor-pointer outline-none"
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
        </select>
      </div>

      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="alertGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} domain={[0, maxVal]} allowDecimals={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
            />
            <Area type="monotone" dataKey="value" name="Alerts" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#alertGrad)" dot={{ r: 3, fill: '#ef4444' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AlertsTrend;

import React, { useEffect, useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api';

export const AlertSummary: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    api.getAlertSummary().then(setSummary).catch(console.error);
  }, []);

  const totalAlerts = summary?.totalAlerts ?? 0;
  const hasData = totalAlerts > 0;

  const chartData = useMemo(() => {
    const critical = summary?.critical ?? 0;
    const high = summary?.high ?? 0;
    const medium = summary?.medium ?? 0;
    const low = summary?.low ?? 0;

    if (totalAlerts === 0) {
      return [
        { name: 'Critical', value: 0, color: '#ef4444' },
        { name: 'High', value: 0, color: '#f97316' },
        { name: 'Medium', value: 0, color: '#f59e0b' },
        { name: 'Information', value: 0, color: '#3b82f6' },
      ];
    }

    return [
      { name: 'Critical', value: critical, color: '#ef4444' },
      { name: 'High', value: high, color: '#f97316' },
      { name: 'Medium', value: medium, color: '#f59e0b' },
      { name: 'Information', value: low, color: '#3b82f6' },
    ];
  }, [summary, totalAlerts]);

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-slate-900">Alert Summary</h2>
      </div>

      <div className="flex items-center justify-between my-2">
        {/* Donut Chart with Center Text */}
        <div className="relative h-40 w-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={totalAlerts === 0 ? [{ name: 'None', value: 1, color: '#f1f5f9' }] : chartData}
                innerRadius={48}
                outerRadius={68}
                paddingAngle={totalAlerts === 0 ? 0 : 3}
                dataKey="value"
              >
                {totalAlerts === 0 ? (
                  <Cell fill="#f1f5f9" />
                ) : (
                  chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))
                )}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-slate-900">{totalAlerts}</span>
            <span className="text-[10px] text-slate-500 font-medium">Total Alerts</span>
          </div>
        </div>

        {/* Legend List */}
        <div className="space-y-2 text-xs font-medium pl-4 flex-1">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                {item.name}
              </span>
              <span className="font-semibold text-slate-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 text-center">
        <button
          disabled={!hasData}
          onClick={() => hasData && navigate('/alerts')}
          className={`text-xs transition-colors ${
            hasData
              ? 'font-semibold text-blue-600 hover:text-blue-700 cursor-pointer'
              : 'font-semibold text-slate-300 cursor-not-allowed pointer-events-none'
          }`}
        >
          View All Alerts
        </button>
      </div>
    </div>
  );
};

export default AlertSummary;

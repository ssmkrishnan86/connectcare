import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { api } from '../../../lib/api';

export const AlertSummary: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    api.getAlertSummary().then(setSummary).catch(console.error);
  }, []);

  const chartData = [
    { name: 'Critical', value: summary?.critical ?? 3, color: '#ef4444' },
    { name: 'High', value: summary?.high ?? 4, color: '#f97316' },
    { name: 'Medium', value: summary?.medium ?? 3, color: '#f59e0b' },
    { name: 'Low', value: summary?.low ?? 2, color: '#3b82f6' },
  ];

  const totalAlerts = summary?.totalAlerts ?? 12;

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
                data={chartData}
                innerRadius={48}
                outerRadius={68}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
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
        <Link to="/alerts" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
          View All Alerts
        </Link>
      </div>
    </div>
  );
};

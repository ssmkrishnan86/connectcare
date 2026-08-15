import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const data = [
  { time: '12 AM', alerts: 20, tasks: 10 },
  { time: '4 AM', alerts: 45, tasks: 22 },
  { time: '8 AM', alerts: 70, tasks: 42 },
  { time: '12 PM', alerts: 58, tasks: 20 },
  { time: '4 PM', alerts: 76, tasks: 40 },
  { time: '8 PM', alerts: 62, tasks: 20 },
  { time: '12 AM', alerts: 90, tasks: 65 },
];

export const TodaysOverview: React.FC = () => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Today's Overview</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600"></span> Alerts
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> Tasks Completed
            </span>
          </div>
          <select className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none">
            <option>Today</option>
            <option>Yesterday</option>
          </select>
        </div>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
            />
            <Line type="monotone" dataKey="alerts" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: '#2563eb' }} />
            <Line type="monotone" dataKey="tasks" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

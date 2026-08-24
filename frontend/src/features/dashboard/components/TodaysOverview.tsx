import React, { useEffect, useState, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { api } from '@/lib/api';

export const TodaysOverview: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<'Today' | 'Yesterday'>('Today');
  const [alerts, setAlerts] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.getAlerts().catch(() => []),
      api.getTasks().catch(() => []),
    ]).then(([alertsRes, tasksRes]) => {
      const alertList = Array.isArray(alertsRes) ? alertsRes : (alertsRes as any)?.data || [];
      const taskList = Array.isArray(tasksRes) ? tasksRes : (tasksRes as any)?.data || [];
      setAlerts(alertList);
      setTasks(taskList);
    });
  }, []);

  const chartData = useMemo(() => {
    const timeSlots = ['12 AM', '4 AM', '8 AM', '12 PM', '4 PM', '8 PM', '11 PM'];
    const targetDate = new Date();
    if (selectedDay === 'Yesterday') {
      targetDate.setDate(targetDate.getDate() - 1);
    }
    const targetDateStr = targetDate.toISOString().substring(0, 10);

    // Filter items matching the date
    const dayAlerts = alerts.filter((a) => {
      if (!a.createdDate) return false;
      try {
        return new Date(a.createdDate).toISOString().substring(0, 10) === targetDateStr;
      } catch {
        return false;
      }
    });

    const dayCompletedTasks = tasks.filter((t) => {
      const isCompleted = t.status === 'Completed' || t.statusStr === 'Completed' || t.isCompleted;
      if (!isCompleted) return false;
      if (!t.updatedDate && !t.createdDate) return true;
      try {
        const d = new Date(t.updatedDate || t.createdDate).toISOString().substring(0, 10);
        return d === targetDateStr;
      } catch {
        return true;
      }
    });

    // Map into time slot buckets
    return timeSlots.map((slot, index) => {
      const startHour = index * 4;
      const endHour = startHour + 4;

      const slotAlerts = dayAlerts.filter((a) => {
        try {
          const h = new Date(a.createdDate).getHours();
          return h >= startHour && h < endHour;
        } catch {
          return false;
        }
      }).length;

      const slotTasks = dayCompletedTasks.filter((t) => {
        try {
          const h = new Date(t.updatedDate || t.createdDate).getHours();
          return h >= startHour && h < endHour;
        } catch {
          return false;
        }
      }).length;

      return {
        time: slot,
        alerts: slotAlerts,
        tasks: slotTasks,
      };
    });
  }, [alerts, tasks, selectedDay]);

  const maxVal = useMemo(() => {
    const vals = chartData.flatMap((d) => [d.alerts, d.tasks]);
    const max = Math.max(...vals, 5);
    return Math.ceil(max * 1.25);
  }, [chartData]);

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
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value as any)}
            className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none cursor-pointer font-semibold"
          >
            <option value="Today">Today</option>
            <option value="Yesterday">Yesterday</option>
          </select>
        </div>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} domain={[0, maxVal]} allowDecimals={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
            />
            <Line type="monotone" dataKey="alerts" name="Alerts" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: '#2563eb' }} />
            <Line type="monotone" dataKey="tasks" name="Tasks Completed" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TodaysOverview;

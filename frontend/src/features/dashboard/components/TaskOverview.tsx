import React, { useEffect, useState, useMemo } from 'react';
import { AlertTriangle, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

export const TaskOverview: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    api.getTasks()
      .then((data) => {
        const list = Array.isArray(data) ? data : (data as any)?.data || [];
        setTasks(list);
      })
      .catch(console.error);
  }, []);

  const hasData = tasks.length > 0;

  const counts = useMemo(() => {
    const todayStr = new Date().toISOString().substring(0, 10);
    const in7Days = new Date();
    in7Days.setDate(in7Days.getDate() + 7);
    const in7DaysStr = in7Days.toISOString().substring(0, 10);

    const overdue = tasks.filter((t) => {
      const isCompleted = t.status === 'Completed' || t.statusStr === 'Completed' || t.isCompleted;
      if (isCompleted) return false;
      if (t.isOverdue) return true;
      if (t.dueDate) {
        return t.dueDate.substring(0, 10) < todayStr;
      }
      return false;
    }).length;

    const dueToday = tasks.filter((t) => {
      const isCompleted = t.status === 'Completed' || t.statusStr === 'Completed' || t.isCompleted;
      if (isCompleted) return false;
      if (t.dueDate) {
        return t.dueDate.substring(0, 10) === todayStr;
      }
      return !t.isOverdue;
    }).length;

    const dueThisWeek = tasks.filter((t) => {
      const isCompleted = t.status === 'Completed' || t.statusStr === 'Completed' || t.isCompleted;
      if (isCompleted) return false;
      if (t.dueDate) {
        const d = t.dueDate.substring(0, 10);
        return d >= todayStr && d <= in7DaysStr;
      }
      return true;
    }).length;

    const completedToday = tasks.filter((t) => {
      const isCompleted = t.status === 'Completed' || t.statusStr === 'Completed' || t.isCompleted;
      if (!isCompleted) return false;
      if (t.updatedDate) {
        return t.updatedDate.substring(0, 10) === todayStr;
      }
      return true;
    }).length;

    return {
      overdue,
      dueToday,
      dueThisWeek,
      completedToday,
    };
  }, [tasks]);

  const items = [
    { label: 'Overdue', value: counts.overdue.toString(), icon: AlertTriangle, color: 'text-red-500 bg-red-50' },
    { label: 'Due Today', value: counts.dueToday.toString(), icon: Clock, color: 'text-blue-500 bg-blue-50' },
    { label: 'Due This Week', value: counts.dueThisWeek.toString(), icon: Calendar, color: 'text-purple-500 bg-purple-50' },
    { label: 'Completed Today', value: counts.completedToday.toString(), icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50' },
  ];

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow flex flex-col justify-between">
      <h2 className="text-sm font-bold text-slate-900 mb-3">Task Overview</h2>

      <div className="space-y-2.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${item.color}`}>
                <item.icon className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-slate-700">{item.label}</span>
            </div>
            <span className="text-sm font-bold text-slate-900">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-slate-100 text-center mt-2">
        <button
          disabled={!hasData}
          onClick={() => hasData && navigate('/tasks')}
          className={`text-xs transition-colors ${
            hasData
              ? 'font-semibold text-blue-600 hover:text-blue-700 cursor-pointer'
              : 'font-semibold text-slate-300 cursor-not-allowed pointer-events-none'
          }`}
        >
          View All Tasks
        </button>
      </div>
    </div>
  );
};

export default TaskOverview;

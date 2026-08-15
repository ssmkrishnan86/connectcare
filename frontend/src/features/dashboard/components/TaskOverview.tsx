import React from 'react';
import { AlertTriangle, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TaskOverview: React.FC = () => {
  const items = [
    { label: 'Overdue', value: '18', icon: AlertTriangle, color: 'text-red-500 bg-red-50' },
    { label: 'Due Today', value: '45', icon: Clock, color: 'text-blue-500 bg-blue-50' },
    { label: 'Due This Week', value: '93', icon: Calendar, color: 'text-purple-500 bg-purple-50' },
    { label: 'Completed Today', value: '32', icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50' },
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
        <Link to="/tasks" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
          View All Tasks
        </Link>
      </div>
    </div>
  );
};

import React from 'react';
import { Users, UserCheck, UserPlus, UserMinus, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const PatientStatsBar: React.FC = () => {
  const stats = [
    { title: 'All Patients', value: '2,350', change: '12.5% vs last month', isUp: true, icon: Users, bg: 'bg-blue-100 text-blue-600' },
    { title: 'In Care', value: '1,880', change: '8.4% vs last month', isUp: true, icon: UserCheck, bg: 'bg-emerald-100 text-emerald-600' },
    { title: 'Admitted', value: '320', change: '3.2% vs last month', isUp: true, icon: UserPlus, bg: 'bg-purple-100 text-purple-600' },
    { title: 'Discharged', value: '120', change: '4.1% vs last month', isUp: false, icon: UserMinus, bg: 'bg-amber-100 text-amber-600' },
    { title: 'Inactive', value: '30', change: '10% vs last month', isUp: false, icon: Users, bg: 'bg-slate-100 text-slate-600' },
    { title: 'New This Month', value: '85', change: '7.6% vs last month', isUp: true, icon: Calendar, bg: 'bg-cyan-100 text-cyan-600' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
      {stats.map((stat, idx) => (
        <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
          <div className="flex items-center justify-between">
            <div className={`h-9 w-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
              <stat.icon className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-[11px] font-medium text-slate-500">{stat.title}</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">{stat.value}</h3>
          </div>
          <div className="mt-2 text-[11px] font-medium">
            {stat.isUp ? (
              <span className="inline-flex items-center text-emerald-600">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> {stat.change}
              </span>
            ) : (
              <span className="inline-flex items-center text-red-600">
                <ArrowDownRight className="h-3 w-3 mr-0.5" /> {stat.change}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

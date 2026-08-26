import React, { useEffect, useState } from 'react';
import { Users, AlertTriangle, AlertCircle, UserCheck, CheckSquare, FileText, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api';

export const DashboardStats: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboardSummary()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch dashboard summary', err);
        setLoading(false);
      });
  }, []);

  const stats = [
    {
      title: 'Total Patients',
      value: data?.totalPatients ?? '0',
      change: data?.patientsChange ?? 'Active patients',
      isIncrease: true,
      icon: Users,
      iconBg: 'bg-blue-100 text-blue-600',
      path: '/patients',
      count: parseInt(String(data?.totalPatients ?? 0), 10) || 0,
    },
    {
      title: 'Active Alerts',
      value: data?.activeAlerts ?? '0',
      change: data?.activeAlertsChange ?? 'Active incidents',
      isIncrease: true,
      isAlert: true,
      icon: AlertTriangle,
      iconBg: 'bg-red-100 text-red-600',
      path: '/alerts',
      count: parseInt(String(data?.activeAlerts ?? 0), 10) || 0,
    },
    {
      title: 'Critical Alerts',
      value: data?.criticalAlerts ?? '0',
      change: data?.criticalAlertsChange ?? 'Immediate triage',
      isIncrease: true,
      isAlert: true,
      icon: AlertCircle,
      iconBg: 'bg-amber-100 text-amber-600',
      path: '/alerts',
      count: parseInt(String(data?.criticalAlerts ?? 0), 10) || 0,
    },
    {
      title: 'Care Teams',
      value: data?.careTeams ?? '0',
      change: data?.careTeamsChange ?? 'Doctor / Nurse staff',
      isIncrease: true,
      icon: UserCheck,
      iconBg: 'bg-emerald-100 text-emerald-600',
      path: '/care-teams',
      count: parseInt(String(data?.careTeams ?? 0), 10) || 0,
    },
    {
      title: 'Open Tasks',
      value: data?.openTasks ?? '0',
      change: data?.openTasksChange ?? 'Pending completion',
      isIncrease: false,
      icon: CheckSquare,
      iconBg: 'bg-purple-100 text-purple-600',
      path: '/tasks',
      count: parseInt(String(data?.openTasks ?? 0), 10) || 0,
    },
    {
      title: 'Pending Reviews',
      value: data?.pendingReviews ?? '0',
      change: data?.pendingReviewsChange ?? 'Awaiting sign-off',
      isIncrease: false,
      icon: FileText,
      iconBg: 'bg-cyan-100 text-cyan-600',
      path: '/care-plans',
      count: parseInt(String(data?.pendingReviews ?? 0), 10) || 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
      {stats.map((stat, idx) => {
        const hasData = stat.count > 0;
        return (
          <div
            key={idx}
            onClick={() => {
              if (hasData) navigate(stat.path);
            }}
            className={`bg-white p-4 rounded-xl border border-slate-200 card-shadow transition-all ${
              hasData ? 'card-shadow-hover cursor-pointer group hover:border-slate-300' : 'cursor-default'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`h-10 w-10 rounded-xl ${stat.iconBg} flex items-center justify-center transition-transform ${hasData ? 'group-hover:scale-105' : ''}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              {loading && <span className="text-[10px] text-slate-400 font-normal">Syncing...</span>}
            </div>
            <div className="mt-3">
              <p className="text-xs font-medium text-slate-500">{stat.title}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] font-medium">
              {stat.isIncrease ? (
                <span
                  className={`inline-flex items-center transition-colors ${
                    !hasData
                      ? 'text-slate-400 cursor-not-allowed'
                      : stat.isAlert
                      ? 'text-red-600 group-hover:underline'
                      : 'text-emerald-600 group-hover:underline'
                  }`}
                >
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  {stat.change}
                </span>
              ) : (
                <span
                  className={`inline-flex items-center transition-colors ${
                    !hasData ? 'text-slate-400 cursor-not-allowed' : 'text-emerald-600 group-hover:underline'
                  }`}
                >
                  <ArrowDownRight className="h-3 w-3 mr-0.5" />
                  {stat.change}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

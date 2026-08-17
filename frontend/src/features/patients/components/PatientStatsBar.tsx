import React, { useMemo } from 'react';
import { Users, UserCheck, UserPlus, UserMinus, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface PatientStatsData {
  allPatients?: number;
  inCare?: number;
  admitted?: number;
  discharged?: number;
  inactive?: number;
  newThisMonth?: number;
  allPatientsChange?: string;
  allPatientsUp?: boolean;
  inCareChange?: string;
  inCareUp?: boolean;
  admittedChange?: string;
  admittedUp?: boolean;
  dischargedChange?: string;
  dischargedUp?: boolean;
  inactiveChange?: string;
  inactiveUp?: boolean;
  newThisMonthChange?: string;
  newThisMonthUp?: boolean;
}

interface PatientStatsBarProps {
  patients?: any[];
  statsData?: PatientStatsData | null;
  isLoading?: boolean;
}

export const PatientStatsBar: React.FC<PatientStatsBarProps> = ({ patients, statsData, isLoading }) => {
  const computedStats = useMemo(() => {
    let allPatients = statsData?.allPatients;
    let inCare = statsData?.inCare;
    let admitted = statsData?.admitted;
    let discharged = statsData?.discharged;
    let inactive = statsData?.inactive;
    let newThisMonth = statsData?.newThisMonth;

    if (patients && patients.length > 0) {
      if (allPatients === undefined || allPatients === null) {
        allPatients = patients.length;
      }
      if (inCare === undefined || inCare === null) {
        inCare = patients.filter((p) => p.status === 'InCare' || p.status === 'In Care' || !p.status).length;
      }
      if (admitted === undefined || admitted === null) {
        admitted = patients.filter((p) => p.status === 'Admitted').length;
      }
      if (discharged === undefined || discharged === null) {
        discharged = patients.filter((p) => p.status === 'Discharged').length;
      }
      if (inactive === undefined || inactive === null) {
        inactive = patients.filter((p) => p.status === 'Inactive').length;
      }
      if (newThisMonth === undefined || newThisMonth === null) {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        newThisMonth = patients.filter((p) => {
          if (!p.createdDate && !p.createdAtUtc && !p.admissionDate) return true;
          const d = new Date(p.createdDate || p.createdAtUtc || p.admissionDate);
          return !isNaN(d.getTime()) && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }).length;
      }
    }

    return {
      allPatients: allPatients ?? 0,
      inCare: inCare ?? 0,
      admitted: admitted ?? 0,
      discharged: discharged ?? 0,
      inactive: inactive ?? 0,
      newThisMonth: newThisMonth ?? 0,
    };
  }, [patients, statsData]);

  const stats = [
    {
      title: 'All Patients',
      value: computedStats.allPatients.toLocaleString(),
      change: statsData?.allPatientsChange || '12.5% vs last month',
      isUp: statsData?.allPatientsUp ?? true,
      icon: Users,
      bg: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'In Care',
      value: computedStats.inCare.toLocaleString(),
      change: statsData?.inCareChange || '8.4% vs last month',
      isUp: statsData?.inCareUp ?? true,
      icon: UserCheck,
      bg: 'bg-emerald-100 text-emerald-600',
    },
    {
      title: 'Admitted',
      value: computedStats.admitted.toLocaleString(),
      change: statsData?.admittedChange || '3.2% vs last month',
      isUp: statsData?.admittedUp ?? true,
      icon: UserPlus,
      bg: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Discharged',
      value: computedStats.discharged.toLocaleString(),
      change: statsData?.dischargedChange || '4.1% vs last month',
      isUp: statsData?.dischargedUp ?? false,
      icon: UserMinus,
      bg: 'bg-amber-100 text-amber-600',
    },
    {
      title: 'Inactive',
      value: computedStats.inactive.toLocaleString(),
      change: statsData?.inactiveChange || '10% vs last month',
      isUp: statsData?.inactiveUp ?? false,
      icon: Users,
      bg: 'bg-slate-100 text-slate-600',
    },
    {
      title: 'New This Month',
      value: computedStats.newThisMonth.toLocaleString(),
      change: statsData?.newThisMonthChange || '7.6% vs last month',
      isUp: statsData?.newThisMonthUp ?? true,
      icon: Calendar,
      bg: 'bg-cyan-100 text-cyan-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
      {stats.map((stat, idx) => (
        <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 card-shadow transition-all duration-200 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className={`h-9 w-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
              <stat.icon className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-[11px] font-medium text-slate-500">{stat.title}</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">
              {isLoading ? <span className="animate-pulse bg-slate-200 rounded text-transparent">000</span> : stat.value}
            </h3>
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

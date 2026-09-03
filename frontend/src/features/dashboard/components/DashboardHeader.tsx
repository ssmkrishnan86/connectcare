import React from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { DataImportExportToolbar } from '@/components/common/DataImportExportToolbar';

export const DashboardHeader: React.FC = () => {
  const { user } = useAuth();
  const userName = user?.fullName || (user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : (user?.role || 'Administrator'));

  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-xs text-slate-500 mt-1">Welcome back, {userName}! Here's what's happening today across all care units.</p>
      </div>
      <DataImportExportToolbar
        moduleKey="dashboard"
        data={[
          { metric: 'Total Residents', value: '1,248', status: 'Active' },
          { metric: 'Active Doctors', value: '48', status: 'On Duty' },
          { metric: 'Active Nurses', value: '142', status: 'On Shift' },
          { metric: 'Bed Occupancy Rate', value: '87.4%', status: 'Normal' },
          { metric: 'Active Alerts', value: '14', status: 'Critical / Warning' },
          { metric: 'Medication Compliance', value: '96.2%', status: 'High' },
        ]}
        allowImport={false}
        showTemplateLink={false}
      />
    </div>
  );
};

import React from 'react';
import { DashboardHeader } from '../components/DashboardHeader';
import { DashboardStats } from '../components/DashboardStats';
import { TodaysOverview } from '../components/TodaysOverview';
import { AlertSummary } from '../components/AlertSummary';
import { PatientStatus } from '../components/PatientStatus';
import { PatientHealthOverview } from '../components/PatientHealthOverview';
import { TaskOverview } from '../components/TaskOverview';
import { MedicationCompliance } from '../components/MedicationCompliance';
import { TopUnitsAttention } from '../components/TopUnitsAttention';
import { AiOperationsBrief } from '../components/AiOperationsBrief';
import { AlertsTrend } from '../components/AlertsTrend';
import { RecentAlerts } from '../components/RecentAlerts';
import { SystemIntegrations } from '../components/SystemIntegrations';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <DashboardHeader />
      <DashboardStats />

      {/* Grid Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TodaysOverview />
        <AlertSummary />
        <PatientStatus />
        <PatientHealthOverview />
      </div>

      {/* Grid Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TaskOverview />
        <MedicationCompliance />
        <TopUnitsAttention />
        <AiOperationsBrief />
      </div>

      {/* Grid Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <AlertsTrend />
        <RecentAlerts />
        <SystemIntegrations />
      </div>
    </div>
  );
};

export default DashboardPage;

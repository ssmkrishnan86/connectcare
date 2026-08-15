import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { PatientsPage } from '@/features/patients/pages/PatientsPage';
import { PatientDetailsPage } from '@/features/patients/pages/PatientDetailsPage';
import { CareTeamsPage } from '@/features/care-teams/pages/CareTeamsPage';
import { DoctorsPage } from '@/features/doctors/pages/DoctorsPage';
import { NursesPage } from '@/features/nurses/pages/NursesPage';
import { LocationsPage } from '@/features/locations/pages/LocationsPage';
import { AlertsPage } from '@/features/alerts/pages/AlertsPage';
import { TasksPage } from '@/features/tasks/pages/TasksPage';
import { MedicationsPage } from '@/features/medications/pages/MedicationsPage';
import { ReportsPage } from '@/features/reports/pages/ReportsPage';
import { AiOperationsPage } from '@/features/ai-operations/pages/AiOperationsPage';
import { IntegrationsPage } from '@/features/integrations/pages/IntegrationsPage';
import { AuditLogsPage } from '@/features/audit-logs/pages/AuditLogsPage';
import { SettingsPage } from '@/features/settings/pages/SettingsPage';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="patients/:patientId" element={<PatientDetailsPage />} />
        <Route path="care-teams" element={<CareTeamsPage />} />
        <Route path="doctors" element={<DoctorsPage />} />
        <Route path="nurses" element={<NursesPage />} />
        <Route path="locations" element={<LocationsPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="medications" element={<MedicationsPage />} />
        <Route path="reports/*" element={<ReportsPage />} />
        <Route path="ai-operations" element={<AiOperationsPage />} />
        <Route path="integrations" element={<IntegrationsPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="settings/*" element={<SettingsPage />} />
        <Route path="prototype/*" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

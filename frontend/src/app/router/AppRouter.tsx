import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { useAuth } from '@/features/auth/context/AuthContext';
import { usePermission } from '@/context/PermissionContext';
import { PermissionRoute } from './PermissionRoute';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { PatientsPage } from '@/features/patients/pages/PatientsPage';
import { AddPatientPage } from '@/features/patients/pages/AddPatientPage';
import { PatientDetailsPage } from '@/features/patients/pages/PatientDetailsPage';
import { CareTeamsPage } from '@/features/care-teams/pages/CareTeamsPage';
import { DoctorsPage } from '@/features/doctors/pages/DoctorsPage';
import { AddDoctorPage } from '@/features/doctors/pages/AddDoctorPage';
import { DoctorDetailsPage } from '@/features/doctors/pages/DoctorDetailsPage';
import { NursesPage } from '@/features/nurses/pages/NursesPage';
import { AddNursePage } from '@/features/nurses/pages/AddNursePage';
import { NurseDetailsPage } from '@/features/nurses/pages/NurseDetailsPage';
import { LocationsPage } from '@/features/locations/pages/LocationsPage';
import { AddLocationPage } from '@/features/locations/pages/AddLocationPage';
import { LocationDetailsPage } from '@/features/locations/pages/LocationDetailsPage';
import { AlertsPage } from '@/features/alerts/pages/AlertsPage';
import { TasksPage } from '@/features/tasks/pages/TasksPage';
import { MedicationsPage } from '@/features/medications/pages/MedicationsPage';
import { ReportsPage } from '@/features/reports/pages/ReportsPage';
import { AiOperationsPage } from '@/features/ai-operations/pages/AiOperationsPage';
import { IntegrationsPage } from '@/features/integrations/pages/IntegrationsPage';
import { AuditLogsPage } from '@/features/audit-logs/pages/AuditLogsPage';
import { SettingsPage } from '@/features/settings/pages/SettingsPage';

import { DischargeChecklistPage } from '@/features/nurses/pages/DischargeChecklistPage';
import { ConsultationsPage } from '@/features/nurses/pages/ConsultationsPage';
import { CarePlansPage } from '@/features/nurses/pages/CarePlansPage';
import { VitalRoundsPage } from '@/features/nurses/pages/VitalRoundsPage';
import { ShiftHandoverPage } from '@/features/nurses/pages/ShiftHandoverPage';
import { NurseSettingsProfilePage } from '@/features/settings/pages/NurseSettingsProfilePage';
import { DocumentationsPage } from '@/features/nurses/pages/DocumentationsPage';
import { NurseMessagesPage } from '@/features/nurses/pages/NurseMessagesPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-600 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Authenticating Session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const HomeRedirect: React.FC = () => {
  const { firstPermittedRoute } = usePermission();
  return <Navigate to={firstPermittedRoute || '/dashboard'} replace />;
};

const DashboardRoute: React.FC = () => {
  const { canAccessModule, firstPermittedRoute } = usePermission();

  if (!canAccessModule('Dashboard')) {
    const targetRoute = firstPermittedRoute && firstPermittedRoute !== '/dashboard' ? firstPermittedRoute : '/patients';
    return <Navigate to={targetRoute} replace />;
  }

  return <PermissionRoute module="Dashboard"><DashboardPage /></PermissionRoute>;
};

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Application Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomeRedirect />} />
        
        {/* Dashboard */}
        <Route path="dashboard" element={<DashboardRoute />} />

        {/* Patients / Residents */}
        <Route path="patients" element={<PermissionRoute module="Residents"><PatientsPage /></PermissionRoute>} />
        <Route path="patients/new" element={<PermissionRoute module="Residents" action="create"><AddPatientPage /></PermissionRoute>} />
        <Route path="patients/edit/:patientId" element={<PermissionRoute module="Residents" action="update"><AddPatientPage /></PermissionRoute>} />
        <Route path="patients/:patientId" element={<PermissionRoute module="Residents"><PatientDetailsPage /></PermissionRoute>} />

        {/* Care Teams */}
        <Route path="care-teams" element={<PermissionRoute module="Care Team"><CareTeamsPage /></PermissionRoute>} />

        {/* Doctors */}
        <Route path="doctors" element={<PermissionRoute module="Doctors"><DoctorsPage /></PermissionRoute>} />
        <Route path="doctors/new" element={<PermissionRoute module="Doctors" action="create"><AddDoctorPage /></PermissionRoute>} />
        <Route path="doctors/edit/:doctorId" element={<PermissionRoute module="Doctors" action="update"><AddDoctorPage /></PermissionRoute>} />
        <Route path="doctors/:doctorId" element={<PermissionRoute module="Doctors"><DoctorDetailsPage /></PermissionRoute>} />

        {/* Nurses */}
        <Route path="nurses" element={<PermissionRoute module="Nurses"><NursesPage /></PermissionRoute>} />
        <Route path="nurses/new" element={<PermissionRoute module="Nurses" action="create"><AddNursePage /></PermissionRoute>} />
        <Route path="nurses/edit/:nurseId" element={<PermissionRoute module="Nurses" action="update"><AddNursePage /></PermissionRoute>} />
        <Route path="nurses/:nurseId" element={<PermissionRoute module="Nurses"><NurseDetailsPage /></PermissionRoute>} />

        {/* Locations */}
        <Route path="locations" element={<PermissionRoute module="Locations"><LocationsPage /></PermissionRoute>} />
        <Route path="locations/new" element={<PermissionRoute module="Locations" action="create"><AddLocationPage /></PermissionRoute>} />
        <Route path="locations/edit/:locationId" element={<PermissionRoute module="Locations" action="update"><AddLocationPage /></PermissionRoute>} />
        <Route path="locations/:locationId" element={<PermissionRoute module="Locations"><LocationDetailsPage /></PermissionRoute>} />

        {/* Alerts */}
        <Route path="alerts" element={<PermissionRoute module="Alerts & Incidents"><AlertsPage /></PermissionRoute>} />

        {/* Tasks */}
        <Route path="tasks" element={<PermissionRoute module="Tasks"><TasksPage /></PermissionRoute>} />

        {/* Medications */}
        <Route path="medications" element={<PermissionRoute module="Medication"><MedicationsPage /></PermissionRoute>} />

        {/* Clinical Operations */}
        <Route path="discharge-checklist" element={<PermissionRoute module="Clinical"><DischargeChecklistPage /></PermissionRoute>} />
        <Route path="consultations" element={<PermissionRoute module="Clinical"><ConsultationsPage /></PermissionRoute>} />
        <Route path="appointments" element={<PermissionRoute module="Clinical"><ConsultationsPage /></PermissionRoute>} />
        <Route path="care-plans" element={<PermissionRoute module="Clinical"><CarePlansPage /></PermissionRoute>} />
        <Route path="vital-rounds" element={<PermissionRoute module="Clinical"><VitalRoundsPage /></PermissionRoute>} />
        <Route path="shift-handover" element={<PermissionRoute module="Clinical"><ShiftHandoverPage /></PermissionRoute>} />
        <Route path="documentations" element={<PermissionRoute module="Clinical"><DocumentationsPage /></PermissionRoute>} />

        {/* Messages */}
        <Route path="messages" element={<PermissionRoute module="Messages"><NurseMessagesPage /></PermissionRoute>} />

        {/* Reports & Analytics */}
        <Route path="reports/*" element={<PermissionRoute module="Reports & Analytics"><ReportsPage /></PermissionRoute>} />

        {/* AI Operations */}
        <Route path="ai-operations" element={<PermissionRoute module="AI Operations"><AiOperationsPage /></PermissionRoute>} />

        {/* Integrations */}
        <Route path="integrations" element={<PermissionRoute module="Integrations"><IntegrationsPage /></PermissionRoute>} />

        {/* Audit Logs */}
        <Route path="audit-logs" element={<PermissionRoute module="Audit Logs"><AuditLogsPage /></PermissionRoute>} />

        {/* Settings */}
        <Route path="settings-profile" element={<PermissionRoute module="Settings"><NurseSettingsProfilePage /></PermissionRoute>} />
        <Route path="settings/*" element={<PermissionRoute module="Settings"><SettingsPage /></PermissionRoute>} />

        {/* Fallback Routes */}
        <Route path="prototype/*" element={<DashboardPage />} />
        <Route path="*" element={<HomeRedirect />} />
      </Route>
    </Routes>
  );
};

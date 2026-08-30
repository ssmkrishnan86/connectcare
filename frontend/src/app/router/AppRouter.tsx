import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { useAuth } from '@/features/auth/context/AuthContext';
import { usePermission } from '@/context/PermissionContext';
import { PermissionRoute } from './PermissionRoute';

// Fast Loading Skeleton Fallback
const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center p-12 min-h-[300px]">
    <div className="flex items-center gap-3 text-xs font-bold text-slate-500 bg-white px-4 py-2.5 rounded-2xl shadow-xs border border-slate-200">
      <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <span>Loading View...</span>
    </div>
  </div>
);

// Lazy Loaded Routes for High Performance & Instant Route Transitions
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const PatientsPage = lazy(() => import('@/features/patients/pages/PatientsPage').then(m => ({ default: m.PatientsPage })));
const AddPatientPage = lazy(() => import('@/features/patients/pages/AddPatientPage').then(m => ({ default: m.AddPatientPage })));
const PatientDetailsPage = lazy(() => import('@/features/patients/pages/PatientDetailsPage').then(m => ({ default: m.PatientDetailsPage })));
const CareTeamsPage = lazy(() => import('@/features/care-teams/pages/CareTeamsPage').then(m => ({ default: m.CareTeamsPage })));
const DoctorsPage = lazy(() => import('@/features/doctors/pages/DoctorsPage').then(m => ({ default: m.DoctorsPage })));
const AddDoctorPage = lazy(() => import('@/features/doctors/pages/AddDoctorPage').then(m => ({ default: m.AddDoctorPage })));
const DoctorDetailsPage = lazy(() => import('@/features/doctors/pages/DoctorDetailsPage').then(m => ({ default: m.DoctorDetailsPage })));
const NursesPage = lazy(() => import('@/features/nurses/pages/NursesPage').then(m => ({ default: m.NursesPage })));
const AddNursePage = lazy(() => import('@/features/nurses/pages/AddNursePage').then(m => ({ default: m.AddNursePage })));
const NurseDetailsPage = lazy(() => import('@/features/nurses/pages/NurseDetailsPage').then(m => ({ default: m.NurseDetailsPage })));
const LocationsPage = lazy(() => import('@/features/locations/pages/LocationsPage').then(m => ({ default: m.LocationsPage })));
const AddLocationPage = lazy(() => import('@/features/locations/pages/AddLocationPage').then(m => ({ default: m.AddLocationPage })));
const LocationDetailsPage = lazy(() => import('@/features/locations/pages/LocationDetailsPage').then(m => ({ default: m.LocationDetailsPage })));
const AlertsPage = lazy(() => import('@/features/alerts/pages/AlertsPage').then(m => ({ default: m.AlertsPage })));
const TasksPage = lazy(() => import('@/features/tasks/pages/TasksPage').then(m => ({ default: m.TasksPage })));
const MedicationsPage = lazy(() => import('@/features/medications/pages/MedicationsPage').then(m => ({ default: m.MedicationsPage })));
const ReportsPage = lazy(() => import('@/features/reports/pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
const AiOperationsPage = lazy(() => import('@/features/ai-operations/pages/AiOperationsPage').then(m => ({ default: m.AiOperationsPage })));
const AiIntegrationsHubPage = lazy(() => import('@/features/ai-integrations/pages/AiIntegrationsHubPage').then(m => ({ default: m.AiIntegrationsHubPage })));
const IntegrationsPage = lazy(() => import('@/features/integrations/pages/IntegrationsPage').then(m => ({ default: m.IntegrationsPage })));
const AuditLogsPage = lazy(() => import('@/features/audit-logs/pages/AuditLogsPage').then(m => ({ default: m.AuditLogsPage })));
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const DischargeChecklistPage = lazy(() => import('@/features/nurses/pages/DischargeChecklistPage').then(m => ({ default: m.DischargeChecklistPage })));
const ConsultationsPage = lazy(() => import('@/features/nurses/pages/ConsultationsPage').then(m => ({ default: m.ConsultationsPage })));
const CarePlansPage = lazy(() => import('@/features/nurses/pages/CarePlansPage').then(m => ({ default: m.CarePlansPage })));
const VitalRoundsPage = lazy(() => import('@/features/nurses/pages/VitalRoundsPage').then(m => ({ default: m.VitalRoundsPage })));
const ShiftHandoverPage = lazy(() => import('@/features/nurses/pages/ShiftHandoverPage').then(m => ({ default: m.ShiftHandoverPage })));
const NurseSettingsProfilePage = lazy(() => import('@/features/settings/pages/NurseSettingsProfilePage').then(m => ({ default: m.NurseSettingsProfilePage })));
const DocumentationsPage = lazy(() => import('@/features/nurses/pages/DocumentationsPage').then(m => ({ default: m.DocumentationsPage })));
const NurseMessagesPage = lazy(() => import('@/features/nurses/pages/NurseMessagesPage').then(m => ({ default: m.NurseMessagesPage })));
const NotificationsPage = lazy(() => import('@/features/notifications/pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })));

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
    <Suspense fallback={<PageLoader />}>
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

          {/* AI Operations & Copilot Suite */}
          <Route path="ai-operations" element={<PermissionRoute module="AI Operations"><AiOperationsPage /></PermissionRoute>} />
          <Route path="ai-copilot/*" element={<PermissionRoute module="AI Operations"><AiIntegrationsHubPage /></PermissionRoute>} />
          <Route path="ai-copilot" element={<PermissionRoute module="AI Operations"><AiIntegrationsHubPage /></PermissionRoute>} />
          <Route path="ai-integrations" element={<PermissionRoute module="AI Operations"><AiIntegrationsHubPage /></PermissionRoute>} />
          <Route path="ai-hub/*" element={<PermissionRoute module="AI Operations"><AiIntegrationsHubPage /></PermissionRoute>} />
          <Route path="ai-hub" element={<PermissionRoute module="AI Operations"><AiIntegrationsHubPage /></PermissionRoute>} />

          {/* Integrations */}
          <Route path="integrations" element={<PermissionRoute module="Integrations"><IntegrationsPage /></PermissionRoute>} />

          {/* Audit Logs */}
          <Route path="audit-logs" element={<PermissionRoute module="Audit Logs"><AuditLogsPage /></PermissionRoute>} />

          {/* Notifications Center */}
          <Route path="notifications" element={<NotificationsPage />} />

          {/* Settings */}
          <Route path="settings-profile" element={<PermissionRoute module="Settings"><NurseSettingsProfilePage /></PermissionRoute>} />
          <Route path="settings/*" element={<PermissionRoute module="Settings"><SettingsPage /></PermissionRoute>} />

          {/* Fallback Routes */}
          <Route path="prototype/*" element={<DashboardPage />} />
          <Route path="*" element={<HomeRedirect />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRouter;

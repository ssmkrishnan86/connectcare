import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { useAuth } from '@/features/auth/context/AuthContext';
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
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="patients/new" element={<AddPatientPage />} />
        <Route path="patients/edit/:patientId" element={<AddPatientPage />} />
        <Route path="patients/:patientId" element={<PatientDetailsPage />} />
        <Route path="care-teams" element={<CareTeamsPage />} />
        <Route path="doctors" element={<DoctorsPage />} />
        <Route path="doctors/new" element={<AddDoctorPage />} />
        <Route path="doctors/edit/:doctorId" element={<AddDoctorPage />} />
        <Route path="doctors/:doctorId" element={<DoctorDetailsPage />} />
        <Route path="nurses" element={<NursesPage />} />
        <Route path="nurses/new" element={<AddNursePage />} />
        <Route path="nurses/edit/:nurseId" element={<AddNursePage />} />
        <Route path="nurses/:nurseId" element={<NurseDetailsPage />} />
        <Route path="locations" element={<LocationsPage />} />
        <Route path="locations/new" element={<AddLocationPage />} />
        <Route path="locations/edit/:locationId" element={<AddLocationPage />} />
        <Route path="locations/:locationId" element={<LocationDetailsPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="medications" element={<MedicationsPage />} />
        <Route path="discharge-checklist" element={<DischargeChecklistPage />} />
        <Route path="consultations" element={<ConsultationsPage />} />
        <Route path="appointments" element={<ConsultationsPage />} />
        <Route path="care-plans" element={<CarePlansPage />} />
        <Route path="vital-rounds" element={<VitalRoundsPage />} />
        <Route path="shift-handover" element={<ShiftHandoverPage />} />
        <Route path="settings-profile" element={<NurseSettingsProfilePage />} />
        <Route path="documentations" element={<DocumentationsPage />} />
        <Route path="messages" element={<NurseMessagesPage />} />
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

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ReportsOverviewPage } from './ReportsOverviewPage';
import { OperationalReportsPage } from './OperationalReportsPage';
import { ClinicalReportsPage } from './ClinicalReportsPage';
import { FinancialReportsPage } from './FinancialReportsPage';
import { CustomReportsPage } from './CustomReportsPage';
import { DoctorOperationsReportsPage } from '@/features/dashboard/pages/DoctorOperationsReportsPage';

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const isDoctor = user?.role === 'Doctor';

  return (
    <Routes>
      <Route index element={<Navigate to="overview" replace />} />
      <Route path="overview" element={isDoctor ? <DoctorOperationsReportsPage /> : <ReportsOverviewPage />} />
      <Route path="operational" element={isDoctor ? <DoctorOperationsReportsPage /> : <OperationalReportsPage />} />
      <Route path="operations" element={<Navigate to="../operational" replace />} />
      <Route path="clinical" element={<ClinicalReportsPage />} />
      <Route path="financial" element={<FinancialReportsPage />} />
      <Route path="custom" element={<CustomReportsPage />} />
      <Route path="*" element={<Navigate to="overview" replace />} />
    </Routes>
  );
};

export default ReportsPage;

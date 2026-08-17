import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { NurseReportsPage } from './NurseReportsPage';
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
      <Route path="overview" element={isDoctor ? <DoctorOperationsReportsPage /> : <NurseReportsPage />} />
      <Route path="operational" element={isDoctor ? <DoctorOperationsReportsPage /> : <NurseReportsPage />} />
      <Route path="operations" element={<Navigate to="../operational" replace />} />
      <Route path="clinical" element={isDoctor ? <ClinicalReportsPage /> : <NurseReportsPage />} />
      <Route path="financial" element={isDoctor ? <FinancialReportsPage /> : <NurseReportsPage />} />
      <Route path="custom" element={isDoctor ? <CustomReportsPage /> : <NurseReportsPage />} />
      <Route path="*" element={<Navigate to="overview" replace />} />
    </Routes>
  );
};

export default ReportsPage;

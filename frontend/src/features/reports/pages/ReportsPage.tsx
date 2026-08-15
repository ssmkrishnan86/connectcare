import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ReportsOverviewPage } from './ReportsOverviewPage';
import { OperationalReportsPage } from './OperationalReportsPage';
import { ClinicalReportsPage } from './ClinicalReportsPage';
import { FinancialReportsPage } from './FinancialReportsPage';
import { CustomReportsPage } from './CustomReportsPage';

export const ReportsPage: React.FC = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="overview" replace />} />
      <Route path="overview" element={<ReportsOverviewPage />} />
      <Route path="operational" element={<OperationalReportsPage />} />
      <Route path="operations" element={<Navigate to="../operational" replace />} />
      <Route path="clinical" element={<ClinicalReportsPage />} />
      <Route path="financial" element={<FinancialReportsPage />} />
      <Route path="custom" element={<CustomReportsPage />} />
      <Route path="*" element={<Navigate to="overview" replace />} />
    </Routes>
  );
};

export default ReportsPage;

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SettingsLayout from '../components/SettingsLayout';
import GeneralSettingsPage from './GeneralSettingsPage';
import OrganizationSettingsPage from './OrganizationSettingsPage';
import UserManagementSettingsPage from './UserManagementSettingsPage';
import RolesPermissionsSettingsPage from './RolesPermissionsSettingsPage';
import NotificationSettingsPage from './NotificationSettingsPage';
import LocalizationSettingsPage from './LocalizationSettingsPage';
import SecuritySettingsPage from './SecuritySettingsPage';
import BackupRestoreSettingsPage from './BackupRestoreSettingsPage';
import SubscriptionSettingsPage from './SubscriptionSettingsPage';
import NurseSettingsProfilePage from './NurseSettingsProfilePage';
import DoctorSettingsProfilePage from './DoctorSettingsProfilePage';
import { useAuth } from '@/features/auth/context/AuthContext';
import { usePermission } from '@/context/PermissionContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { isNurse, isDoctor, roleName } = usePermission();

  const userRole = (roleName || user?.role || '').toLowerCase();
  const isDoctorRole = isDoctor || userRole === 'doctor';
  const isNurseRole = isNurse || userRole === 'nurse';

  if (isDoctorRole) {
    return <DoctorSettingsProfilePage />;
  }

  if (isNurseRole) {
    return <NurseSettingsProfilePage />;
  }

  return (
    <Routes>
      <Route element={<SettingsLayout />}>
        <Route index element={<GeneralSettingsPage />} />
        <Route path="profile" element={<NurseSettingsProfilePage />} />
        <Route path="organization" element={<OrganizationSettingsPage />} />
        <Route path="users" element={<UserManagementSettingsPage />} />
        <Route path="roles" element={<RolesPermissionsSettingsPage />} />
        <Route path="notifications" element={<NotificationSettingsPage />} />
        <Route path="localization" element={<LocalizationSettingsPage />} />
        <Route path="security" element={<SecuritySettingsPage />} />
        <Route path="backup" element={<BackupRestoreSettingsPage />} />
        <Route path="subscription" element={<SubscriptionSettingsPage />} />
      </Route>
    </Routes>
  );
};

export default SettingsPage;

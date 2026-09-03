import React from 'react';
import { usePermission, type PermissionAction } from '@/context/PermissionContext';
import { AccessDeniedPage } from '@/components/common/AccessDeniedPage';

interface PermissionRouteProps {
  module: string;
  action?: PermissionAction;
  children: React.ReactNode;
}

export const PermissionRoute: React.FC<PermissionRouteProps> = ({
  module,
  action = 'read',
  children,
}) => {
  const { can, canAccessModule } = usePermission();

  const isAllowed = action === 'read' ? canAccessModule(module) : can(module, action);

  if (!isAllowed) {
    return <AccessDeniedPage moduleName={module} requiredAction={action} />;
  }

  return <>{children}</>;
};

export default PermissionRoute;

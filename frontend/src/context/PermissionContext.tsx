import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { api } from '@/lib/api';

export type PermissionAction =
  | 'fullAccess'
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'export'
  | 'import'
  | 'print';

export interface PermissionMatrix {
  [moduleName: string]: {
    [action in PermissionAction]?: boolean;
  };
}

export const ALL_MODULES = [
  'Dashboard',
  'Residents',
  'Care Team',
  'Doctors',
  'Nurses',
  'Locations',
  'Clinical',
  'Medication',
  'Tasks',
  'Messages',
  'Alerts & Incidents',
  'Reports & Analytics',
  'Financial',
  'AI Operations',
  'Integrations',
  'Audit Logs',
  'Settings',
] as const;

export type SystemModule = typeof ALL_MODULES[number];

export interface PatientTabDefinition {
  key: string;
  label: string;
  description: string;
  defaultModule: string;
}

export const ALL_PATIENT_TABS: PatientTabDefinition[] = [
  { key: 'Overview', label: 'Overview', description: 'Patient demographic summary, quick vitals, allergies & flags', defaultModule: 'Residents' },
  { key: 'Care Intelligence & AI', label: 'Care Intelligence & AI', description: 'Clinical copilot AI insights, predictive risks & summaries', defaultModule: 'AI Operations' },
  { key: 'Medical Information', label: 'Medical Information', description: 'Primary diagnoses, clinical conditions, surgery & directives', defaultModule: 'Clinical' },
  { key: 'Health Records', label: 'Health Records', description: 'Past clinical encounters, history notes, immunizations', defaultModule: 'Clinical' },
  { key: 'Medications', label: 'Medications', description: 'Active pharmaceutical prescriptions, dosage logs & e-scripts', defaultModule: 'Medication' },
  { key: 'Care Plan', label: 'Care Plan', description: 'Clinical care goals, recovery milestones & multidisciplinary tasks', defaultModule: 'Clinical' },
  { key: 'Discharge Readiness', label: 'Discharge Readiness', description: '14-point discharge verification checklist and clearance criteria', defaultModule: 'Clinical' },
  { key: 'Vitals & Trends', label: 'Vitals & Trends', description: 'Physiological vitals charting (BP, HR, SpO2, Temperature)', defaultModule: 'Clinical' },
  { key: 'Documents', label: 'Documents', description: 'Uploaded patient documentation, lab attachments, scanned records', defaultModule: 'Clinical' },
  { key: 'Appointments', label: 'Appointments', description: 'Physician and specialist consultation bookings and schedules', defaultModule: 'Clinical' },
  { key: 'Tasks & Notes', label: 'Tasks & Notes', description: 'Assigned patient care tasks, shift nursing notes and reminders', defaultModule: 'Tasks' },
  { key: 'History', label: 'History', description: 'Patient access audit logs, activity trail and timeline', defaultModule: 'Audit Logs' },
];

// Module aliases mapping for flexible checking
const MODULE_ALIASES: Record<string, string> = {
  patients: 'Residents',
  patient: 'Residents',
  residents: 'Residents',
  resident: 'Residents',
  careteam: 'Care Team',
  'care team': 'Care Team',
  'care-teams': 'Care Team',
  doctors: 'Doctors',
  doctor: 'Doctors',
  nurses: 'Nurses',
  nurse: 'Nurses',
  locations: 'Locations',
  location: 'Locations',
  units: 'Locations',
  clinical: 'Clinical',
  consultations: 'Clinical',
  appointments: 'Clinical',
  'care-plans': 'Clinical',
  careplans: 'Clinical',
  vitals: 'Clinical',
  'vital-rounds': 'Clinical',
  handover: 'Clinical',
  'shift-handover': 'Clinical',
  documentation: 'Clinical',
  documentations: 'Clinical',
  discharge: 'Clinical',
  'discharge-checklist': 'Clinical',
  medications: 'Medication',
  medication: 'Medication',
  tasks: 'Tasks',
  task: 'Tasks',
  'tasks & activities': 'Tasks',
  messages: 'Messages',
  message: 'Messages',
  chat: 'Messages',
  alerts: 'Alerts & Incidents',
  alert: 'Alerts & Incidents',
  'alerts & incidents': 'Alerts & Incidents',
  incidents: 'Alerts & Incidents',
  reports: 'Reports & Analytics',
  report: 'Reports & Analytics',
  'reports & analytics': 'Reports & Analytics',
  analytics: 'Reports & Analytics',
  financial: 'Financial',
  finance: 'Financial',
  billing: 'Financial',
  'ai operations': 'AI Operations',
  'ai-operations': 'AI Operations',
  ai: 'AI Operations',
  integrations: 'Integrations',
  integration: 'Integrations',
  'audit logs': 'Audit Logs',
  'audit-logs': 'Audit Logs',
  audit: 'Audit Logs',
  settings: 'Settings',
  setting: 'Settings',
  'user management': 'Settings',
  'roles & permissions': 'Settings',
};

const normalizeModuleName = (name: string): string => {
  if (!name) return '';
  const clean = name.trim().toLowerCase();
  return MODULE_ALIASES[clean] || name;
};

// Route path to module mapping
export const ROUTE_TO_MODULE_MAP: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/patients': 'Residents',
  '/patients/new': 'Residents',
  '/care-teams': 'Care Team',
  '/doctors': 'Doctors',
  '/doctors/new': 'Doctors',
  '/nurses': 'Nurses',
  '/nurses/new': 'Nurses',
  '/locations': 'Locations',
  '/locations/new': 'Locations',
  '/alerts': 'Alerts & Incidents',
  '/tasks': 'Tasks',
  '/medications': 'Medication',
  '/consultations': 'Clinical',
  '/appointments': 'Clinical',
  '/care-plans': 'Clinical',
  '/vital-rounds': 'Clinical',
  '/shift-handover': 'Clinical',
  '/discharge-checklist': 'Clinical',
  '/documentations': 'Clinical',
  '/messages': 'Messages',
  '/reports': 'Reports & Analytics',
  '/reports/overview': 'Reports & Analytics',
  '/reports/operational': 'Reports & Analytics',
  '/reports/clinical': 'Reports & Analytics',
  '/reports/financial': 'Financial',
  '/reports/custom': 'Reports & Analytics',
  '/ai-operations': 'AI Operations',
  '/integrations': 'Integrations',
  '/audit-logs': 'Audit Logs',
  '/settings': 'Settings',
  '/settings/organization': 'Settings',
  '/settings/users': 'Settings',
  '/settings/roles': 'Settings',
  '/settings/notifications': 'Settings',
  '/settings/localization': 'Settings',
  '/settings/security': 'Settings',
  '/settings/backup': 'Settings',
  '/settings/subscription': 'Financial',
};

export interface PermissionContextType {
  matrix: PermissionMatrix;
  can: (module: string, action: PermissionAction) => boolean;
  canAccessModule: (module: string) => boolean;
  canAccessRoute: (pathname: string) => boolean;
  canAccessPatientTab: (tabKey: string) => boolean;
  patientTabPermissions: Record<string, boolean>;
  hasPermission: (permissionKey: string) => boolean;
  getFirstPermittedRoute: () => string;
  firstPermittedRoute: string;
  isAdmin: boolean;
  isDoctor: boolean;
  isNurse: boolean;
  roleName: string;
  previewRole: { roleName: string; matrix: PermissionMatrix } | null;
  setPreviewRole: (role: { roleName: string; matrix: PermissionMatrix } | null) => void;
  updateLocalMatrix: (updatedMatrix: PermissionMatrix) => void;
  refreshPermissions: () => Promise<void>;
}

export const getFirstPermittedRoute = (
  canAccessModule: (moduleName: string) => boolean,
  roleName?: string
): string => {
  const roleLower = (roleName || '').toLowerCase();
  const isDoc = roleLower === 'doctor';
  const isNrs = roleLower === 'nurse';

  if (isDoc) {
    const docItems = [
      { module: 'Dashboard', path: '/dashboard' },
      { module: 'Residents', path: '/patients' },
      { module: 'Care Team', path: '/care-teams' },
      { module: 'Clinical', path: '/consultations' },
      { module: 'Clinical', path: '/care-plans' },
      { module: 'Tasks', path: '/tasks' },
      { module: 'Alerts & Incidents', path: '/alerts' },
      { module: 'Messages', path: '/messages' },
      { module: 'Reports & Analytics', path: '/reports' },
      { module: 'AI Operations', path: '/ai-operations' },
    ];
    const allowed = docItems.find((i) => canAccessModule(i.module));
    return allowed ? allowed.path : '/dashboard';
  }

  if (isNrs) {
    const nurseItems = [
      { module: 'Dashboard', path: '/dashboard' },
      { module: 'Residents', path: '/patients' },
      { module: 'Care Team', path: '/care-teams' },
      { module: 'Clinical', path: '/vital-rounds' },
      { module: 'Medication', path: '/medications' },
      { module: 'Tasks', path: '/tasks' },
      { module: 'Alerts & Incidents', path: '/alerts' },
      { module: 'Clinical', path: '/shift-handover' },
      { module: 'Clinical', path: '/documentations' },
      { module: 'Clinical', path: '/care-plans' },
      { module: 'Clinical', path: '/consultations' },
      { module: 'Clinical', path: '/discharge-checklist' },
      { module: 'Reports & Analytics', path: '/reports' },
      { module: 'Messages', path: '/messages' },
      { module: 'AI Operations', path: '/ai-operations' },
      { module: 'Settings', path: '/settings-profile' },
    ];
    const allowed = nurseItems.find((i) => canAccessModule(i.module));
    return allowed ? allowed.path : '/dashboard';
  }

  // Standard & Custom roles (Admin, Lab Technician, Viewer, Receptionist, Care Manager, etc.)
  const standardItems = [
    { module: 'Dashboard', path: '/dashboard' },
    { module: 'Residents', path: '/patients' },
    { module: 'Care Team', path: '/care-teams' },
    { module: 'Messages', path: '/messages' },
    { module: 'Doctors', path: '/doctors' },
    { module: 'Nurses', path: '/nurses' },
    { module: 'Locations', path: '/locations' },
    { module: 'Alerts & Incidents', path: '/alerts' },
    { module: 'Tasks', path: '/tasks' },
    { module: 'Medication', path: '/medications' },
    { module: 'Reports & Analytics', path: '/reports/overview' },
    { module: 'Integrations', path: '/integrations' },
    { module: 'Audit Logs', path: '/audit-logs' },
    { module: 'AI Operations', path: '/ai-operations' },
    { module: 'Settings', path: '/settings' },
  ];
  const firstAllowed = standardItems.find((i) => canAccessModule(i.module));
  return firstAllowed ? firstAllowed.path : '/dashboard';
};

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [localMatrix, setLocalMatrix] = useState<PermissionMatrix | null>(null);
  const [previewRole, setPreviewRole] = useState<{ roleName: string; matrix: PermissionMatrix } | null>(null);

  const realRoleName = user?.role || 'Admin';
  const roleName = previewRole ? previewRole.roleName : realRoleName;
  const roleLower = roleName.toLowerCase();
  const isAdmin = roleLower === 'admin' || roleLower === 'system administrator' || roleLower === 'administrator';
  const isDoctor = roleLower === 'doctor';
  const isNurse = roleLower === 'nurse';

  // Real-time synchronization of role permissions from backend database
  const refreshPermissions = useCallback(async () => {
    if (!user) return;
    try {
      // If user object has a valid permissionsMatrix, use it immediately
      if (user.permissionsMatrix && Object.keys(user.permissionsMatrix).length > 0) {
        setLocalMatrix(user.permissionsMatrix);
      } else if (user.permissionsMatrixJson) {
        try {
          const parsed = JSON.parse(user.permissionsMatrixJson);
          if (parsed && Object.keys(parsed).length > 0) {
            setLocalMatrix(parsed);
          }
        } catch { }
      }

      // Fetch fresh role definitions directly from settings API to ensure real-time sync with database
      const rolesData = await api.getSettingsRoles();
      const roleList = Array.isArray(rolesData) ? rolesData : (rolesData as any)?.data || [];
      if (Array.isArray(roleList) && roleList.length > 0) {
        const userRoleClean = (user.role || '').replace(/[\s\-_]/g, '').toLowerCase();
        const userAssignedClean = (user.assignedRoles || []).map((r: string) => (r || '').replace(/[\s\-_]/g, '').toLowerCase());

        const matchedRole = roleList.find((r: any) => {
          const rClean = (r.roleName || '').replace(/[\s\-_]/g, '').toLowerCase();
          if (stringMatches(rClean, userRoleClean)) return true;
          if (userAssignedClean.some((ar: string) => stringMatches(rClean, ar))) return true;
          if (userRoleClean.includes('lab') && rClean.includes('lab')) return true;
          if (userRoleClean.includes('admin') && rClean.includes('admin')) return true;
          if (userRoleClean.includes('doctor') && rClean.includes('doctor')) return true;
          if (userRoleClean.includes('nurse') && rClean.includes('nurse')) return true;
          return false;
        });

        if (matchedRole && matchedRole.permissionsMatrixJson) {
          try {
            const parsed = JSON.parse(matchedRole.permissionsMatrixJson);
            if (parsed && Object.keys(parsed).length > 0) {
              setLocalMatrix(parsed);
              return;
            }
          } catch { }
        }
      }

      // Secondary fallback: fetch from /auth/me
      const meRes = await api.getCurrentUser();
      const meData = meRes?.data || meRes;
      if (meData?.permissionsMatrixJson) {
        try {
          const parsed = JSON.parse(meData.permissionsMatrixJson);
          if (parsed && Object.keys(parsed).length > 0) {
            setLocalMatrix(parsed);
          }
        } catch { }
      }
    } catch (err) {
      console.error('Failed to refresh permissions matrix:', err);
    }
  }, [user]);

  function stringMatches(a: string, b: string) {
    if (!a || !b) return false;
    return a === b || a.includes(b) || b.includes(a);
  }

  // Sync on mount and user change
  useEffect(() => {
    refreshPermissions();
  }, [user, refreshPermissions]);

  // Listen to custom permissions-updated events from Settings page
  useEffect(() => {
    const handlePermissionsUpdated = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.matrix) {
        const targetRoleName = (customEvent.detail.roleName || '').replace(/[\s\-_]/g, '').toLowerCase();
        const currentRoleClean = (user?.role || '').replace(/[\s\-_]/g, '').toLowerCase();
        if (stringMatches(targetRoleName, currentRoleClean) || (targetRoleName.includes('lab') && currentRoleClean.includes('lab'))) {
          setLocalMatrix(customEvent.detail.matrix);
        }
      }
    };

    window.addEventListener('connectcare:permissions-updated', handlePermissionsUpdated);
    return () => {
      window.removeEventListener('connectcare:permissions-updated', handlePermissionsUpdated);
    };
  }, [user]);

  // Compute active matrix
  const activeMatrix = useMemo<PermissionMatrix>(() => {
    if (previewRole && previewRole.matrix && Object.keys(previewRole.matrix).length > 0) {
      return previewRole.matrix;
    }

    if (localMatrix && Object.keys(localMatrix).length > 0) {
      return localMatrix;
    }

    // Default Fallbacks if no explicit matrix loaded yet
    const fallback: PermissionMatrix = {};
    ALL_MODULES.forEach((mod) => {
      if (isAdmin) {
        fallback[mod] = {
          fullAccess: true,
          create: true,
          read: true,
          update: true,
          delete: true,
          export: true,
          import: true,
          print: true,
        };
      } else if (isDoctor) {
        const isCoreClinical = [
          'Dashboard',
          'Residents',
          'Care Team',
          'Clinical',
          'Medication',
          'Tasks',
          'Messages',
          'Alerts & Incidents',
          'AI Operations',
          'Settings',
        ].includes(mod);
        const isRead = ['Doctors', 'Nurses', 'Locations', 'Reports & Analytics'].includes(mod);

        fallback[mod] = {
          fullAccess: isCoreClinical,
          create: isCoreClinical,
          read: isCoreClinical || isRead,
          update: isCoreClinical,
          delete: false,
          export: isCoreClinical,
          import: false,
          print: true,
        };
      } else if (isNurse) {
        const isCoreNurse = [
          'Dashboard',
          'Residents',
          'Care Team',
          'Clinical',
          'Medication',
          'Tasks',
          'Messages',
          'Alerts & Incidents',
          'AI Operations',
          'Settings',
        ].includes(mod);
        const isRead = ['Doctors', 'Nurses', 'Locations', 'Reports & Analytics'].includes(mod);

        fallback[mod] = {
          fullAccess: false,
          create: isCoreNurse,
          read: isCoreNurse || isRead,
          update: isCoreNurse,
          delete: false,
          export: false,
          import: false,
          print: true,
        };
      } else {
        // Zero-trust security fallback for custom or unconfigured roles
        fallback[mod] = {
          fullAccess: false,
          create: false,
          read: false,
          update: false,
          delete: false,
          export: false,
          import: false,
          print: false,
        };
      }
    });

    // Also populate patient tabs in fallback matrix
    ALL_PATIENT_TABS.forEach((tab) => {
      const tabKey = `Patient Tab: ${tab.key}`;
      if (isAdmin) {
        fallback[tabKey] = {
          fullAccess: true,
          create: true,
          read: true,
          update: true,
          delete: true,
          export: true,
          import: true,
          print: true,
        };
      } else if (isDoctor) {
        fallback[tabKey] = {
          fullAccess: true,
          create: true,
          read: true,
          update: true,
          delete: false,
          export: true,
          import: false,
          print: true,
        };
      } else if (isNurse) {
        fallback[tabKey] = {
          fullAccess: false,
          create: true,
          read: true,
          update: true,
          delete: false,
          export: false,
          import: false,
          print: true,
        };
      } else {
        fallback[tabKey] = {
          fullAccess: false,
          create: false,
          read: true,
          update: false,
          delete: false,
          export: false,
          import: false,
          print: false,
        };
      }
    });

    return fallback;
  }, [previewRole, localMatrix, isAdmin, isDoctor, isNurse]);

  // Core Check function: can(module, action) - reads directly from permissions matrix, not hard-coded
  const can = useCallback(
    (moduleName: string, action: PermissionAction): boolean => {
      const normalized = normalizeModuleName(moduleName);
      const modPermissions = activeMatrix[normalized] || activeMatrix[moduleName];

      if (!modPermissions) {
        const foundKey = Object.keys(activeMatrix).find(
          (k) => k.toLowerCase() === normalized.toLowerCase() || k.toLowerCase() === moduleName.toLowerCase()
        );
        if (foundKey) {
          const p = activeMatrix[foundKey];
          if (p?.fullAccess) return true;
          return !!p?.[action];
        }
        return false;
      }

      if (modPermissions.fullAccess) return true;
      return !!modPermissions[action];
    },
    [activeMatrix]
  );

  // Can Access Module (checks 'read' or 'fullAccess' in active matrix)
  const canAccessModule = useCallback(
    (moduleName: string): boolean => {
      const normalized = normalizeModuleName(moduleName);
      return can(normalized, 'read') || can(normalized, 'fullAccess');
    },
    [can]
  );

  // Can Access Route Path - verified through active matrix module access
  const canAccessRoute = useCallback(
    (pathname: string): boolean => {
      const cleanPath = pathname.split('?')[0].replace(/\/$/, '') || '/';

      let targetModule = ROUTE_TO_MODULE_MAP[cleanPath];
      if (!targetModule) {
        const matchingEntry = Object.entries(ROUTE_TO_MODULE_MAP).find(([routeKey]) =>
          cleanPath.startsWith(routeKey)
        );
        if (matchingEntry) {
          targetModule = matchingEntry[1];
        }
      }

      if (!targetModule) return true;
      return canAccessModule(targetModule);
    },
    [canAccessModule]
  );

  // Granular Permission Key check - verified through matrix, not hard-coded
  const hasPermission = useCallback(
    (permissionKey: string): boolean => {
      if (user?.permissions && user.permissions.includes(permissionKey)) {
        return true;
      }

      const parts = permissionKey.split('.');
      if (parts.length >= 2) {
        const modKey = parts[0];
        const actKey = parts[1] as PermissionAction;
        const normalizedAction: PermissionAction =
          actKey === ('view' as any) ? 'read' :
          actKey === ('edit' as any) ? 'update' : actKey;

        return can(modKey, normalizedAction);
      }

      return can(permissionKey, 'read') || can(permissionKey, 'fullAccess');
    },
    [user, can]
  );

  // Can Access Patient Tab
  const canAccessPatientTab = useCallback(
    (tabKey: string): boolean => {
      // If user has no access to the parent Patients/Residents module, deny all tabs
      if (!canAccessModule('Residents') && !canAccessModule('Patients')) {
        return false;
      }

      // Check explicit tab permission in matrix (e.g., "Patient Tab: Overview", "Patient: Overview", or "Overview")
      const candidateKeys = [
        `Patient Tab: ${tabKey}`,
        `Patient: ${tabKey}`,
        `patient_tab_${tabKey.toLowerCase().replace(/[\s&_-]+/g, '_')}`,
        tabKey,
      ];

      for (const k of candidateKeys) {
        if (activeMatrix[k]) {
          const tabPerm = activeMatrix[k];
          if (tabPerm.fullAccess !== undefined || tabPerm.read !== undefined) {
            return !!(tabPerm.fullAccess || tabPerm.read);
          }
        }
      }

      // If not explicitly set in matrix, fallback to the tab's default system module permission
      const tabDef = ALL_PATIENT_TABS.find(
        (t) => t.key.toLowerCase() === tabKey.toLowerCase()
      );
      if (tabDef && tabDef.defaultModule) {
        return canAccessModule(tabDef.defaultModule);
      }

      return true;
    },
    [activeMatrix, canAccessModule]
  );

  const patientTabPermissions = useMemo(() => {
    const res: Record<string, boolean> = {};
    ALL_PATIENT_TABS.forEach((tab) => {
      res[tab.key] = canAccessPatientTab(tab.key);
    });
    return res;
  }, [canAccessPatientTab]);

  // Compute dynamic first permitted left menu route for the active role
  const firstPermittedRoute = useMemo(() => {
    return getFirstPermittedRoute(canAccessModule, roleName);
  }, [canAccessModule, roleName]);

  const getFirstPermittedRouteCallback = useCallback(() => {
    return getFirstPermittedRoute(canAccessModule, roleName);
  }, [canAccessModule, roleName]);

  // Update local matrix
  const updateLocalMatrix = useCallback((updatedMatrix: PermissionMatrix) => {
    setLocalMatrix(updatedMatrix);
  }, []);

  return (
    <PermissionContext.Provider
      value={{
        matrix: activeMatrix,
        can,
        canAccessModule,
        canAccessRoute,
        canAccessPatientTab,
        patientTabPermissions,
        hasPermission,
        getFirstPermittedRoute: getFirstPermittedRouteCallback,
        firstPermittedRoute,
        isAdmin,
        isDoctor,
        isNurse,
        roleName,
        previewRole,
        setPreviewRole,
        updateLocalMatrix,
        refreshPermissions,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermission = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermission must be used within a PermissionProvider');
  }
  return context;
};

export default PermissionContext;

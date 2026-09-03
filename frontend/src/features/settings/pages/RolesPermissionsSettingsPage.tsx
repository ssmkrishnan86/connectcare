import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Loader2,
  Eye,
  Users,
  Sparkles,
  Stethoscope,
  FileText,
  Pill,
  HeartPulse,
  ClipboardCheck,
  Activity,
  FileEdit,
  Calendar,
  CheckSquare,
  ShieldAlert,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/context/AuthContext';
import { usePermission, ALL_PATIENT_TABS } from '@/context/PermissionContext';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import { RoleCreateModal } from '../components/RoleCreateModal';
import { DataImportExportToolbar } from '@/components/common/DataImportExportToolbar';

export const ALL_SYSTEM_MODULES = [
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
];

const DEFAULT_ACTIONS = [
  { key: 'fullAccess', label: 'FULL ACCESS' },
  { key: 'create', label: 'CREATE' },
  { key: 'read', label: 'READ' },
  { key: 'update', label: 'UPDATE' },
  { key: 'delete', label: 'DELETE' },
  { key: 'export', label: 'EXPORT' },
  { key: 'import', label: 'IMPORT' },
  { key: 'print', label: 'PRINT' },
];

export const PATIENT_TAB_ACTIONS = [
  { key: 'fullAccess', label: 'FULL ACCESS' },
  { key: 'read', label: 'VIEW' },
  { key: 'create', label: 'CREATE' },
  { key: 'update', label: 'UPDATE' },
  { key: 'delete', label: 'DELETE' },
  { key: 'export', label: 'EXPORT' },
];

const getPatientTabIcon = (tabKey: string) => {
  switch (tabKey) {
    case 'Overview': return Users;
    case 'Care Intelligence & AI': return Sparkles;
    case 'Medical Information': return Stethoscope;
    case 'Health Records': return FileText;
    case 'Medications': return Pill;
    case 'Care Plan': return HeartPulse;
    case 'Discharge Readiness': return ClipboardCheck;
    case 'Vitals & Trends': return Activity;
    case 'Documents': return FileEdit;
    case 'Appointments': return Calendar;
    case 'Tasks & Notes': return CheckSquare;
    case 'History': return ShieldAlert;
    default: return Users;
  }
};

export const RolesPermissionsSettingsPage: React.FC = () => {
  const { user: currentUser, updateUserPermissions } = useAuth();
  const { updateLocalMatrix, previewRole, setPreviewRole } = usePermission();
  const isAdmin = currentUser?.role?.toLowerCase().includes('admin');
  const toast = useToast();
  const confirm = useConfirm();

  const [roles, setRoles] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [roleSearchTerm, setRoleSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'Permissions' | 'Users' | 'Role Details'>('Permissions');
  const [viewMode, setViewMode] = useState<'Module' | 'PatientTabs' | 'Action'>('Module');
  const [permissionPreset, setPermissionPreset] = useState<'Full Access' | 'Limited Access' | 'Read Only' | 'Custom'>('Full Access');
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [assignedUsers, setAssignedUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [savingMatrix, setSavingMatrix] = useState(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);

  // Dynamic matrix state for selected role: Record<ModuleName, Record<ActionKey, boolean>>
  const [matrix, setMatrix] = useState<Record<string, Record<string, boolean>>>({});

  // Detect if selected role is System Administrator / Admin
  const isSelectedRoleAdmin = useMemo(() => {
    if (!selectedRole?.roleName) return false;
    const name = selectedRole.roleName.toLowerCase().trim();
    return (
      name === 'admin' ||
      name === 'administrator' ||
      name === 'system administrator' ||
      name.includes('admin') ||
      (selectedRole.categoryBadge === 'System Role' && name.includes('admin'))
    );
  }, [selectedRole]);

  // Pagination for Left Role List
  const [rolePage, setRolePage] = useState(1);
  const rolePageSize = 8;

  const fetchRoles = () => {
    api.getSettingsRoles()
      .then((data) => {
        const roleList = data || [];
        setRoles(roleList);
        if (roleList.length > 0) {
          if (!selectedRole) {
            setSelectedRole(roleList[0]);
          } else {
            const updatedSelected = roleList.find((r) => r.id === selectedRole.id) || roleList[0];
            setSelectedRole(updatedSelected);
          }
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Sync Matrix & Assigned Users whenever Selected Role Changes
  useEffect(() => {
    if (!selectedRole) return;

    // Load permissions matrix JSON
    let parsedMatrix: Record<string, Record<string, boolean>> = {};
    if (selectedRole.permissionsMatrixJson) {
      try {
        parsedMatrix = JSON.parse(selectedRole.permissionsMatrixJson);
      } catch (e) {
        console.error('Failed to parse permissionsMatrixJson:', e);
      }
    }

    const isSystemAdminRole = isSelectedRoleAdmin;

    // Ensure all system modules exist in matrix
    const fullMatrix: Record<string, Record<string, boolean>> = {};
    ALL_SYSTEM_MODULES.forEach((modName) => {
      const existing = parsedMatrix[modName];
      if (existing && Object.keys(existing).length > 0) {
        fullMatrix[modName] = {
          fullAccess: false,
          create: false,
          read: false,
          update: false,
          delete: false,
          export: false,
          import: false,
          print: false,
          ...existing,
        };
      } else if (isSystemAdminRole) {
        // Admin role defaults to full access for all system modules
        fullMatrix[modName] = {
          fullAccess: true,
          create: true,
          read: true,
          update: true,
          delete: true,
          export: true,
          import: true,
          print: true,
        };
      } else {
        fullMatrix[modName] = {
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

    // Ensure all patient tabs exist in matrix
    ALL_PATIENT_TABS.forEach((tab) => {
      const tabKey = `Patient Tab: ${tab.key}`;
      const existing = parsedMatrix[tabKey] || parsedMatrix[tab.key];
      if (existing && Object.keys(existing).length > 0) {
        fullMatrix[tabKey] = { ...existing };
      } else if (isSystemAdminRole) {
        // Admin role defaults to full access for all patient tabs
        fullMatrix[tabKey] = {
          fullAccess: true,
          create: true,
          read: true,
          update: true,
          delete: true,
          export: true,
        };
      } else {
        const modDefault = fullMatrix[tab.defaultModule] || fullMatrix['Residents'];
        const isAllowed = !!(modDefault?.fullAccess || modDefault?.read);
        fullMatrix[tabKey] = {
          fullAccess: isAllowed,
          create: isAllowed,
          read: isAllowed,
          update: isAllowed,
          delete: isAllowed,
          export: isAllowed,
        };
      }
    });

    setMatrix(fullMatrix);
    if (isSystemAdminRole) {
      setPermissionPreset('Full Access');
    }

    if (previewRole) {
      setPreviewRole({ roleName: selectedRole.roleName, matrix: fullMatrix });
    }

    // Fetch assigned users from database
    setLoadingUsers(true);
    api.getSettingsUsers(undefined, selectedRole.roleName)
      .then((data) => setAssignedUsers(data || []))
      .catch(console.error)
      .finally(() => setLoadingUsers(false));
  }, [selectedRole, isSelectedRoleAdmin]);

  // Filtered Roles
  const filteredRoles = useMemo(() => {
    return roles.filter((r) =>
      r.roleName?.toLowerCase().includes(roleSearchTerm.toLowerCase()) ||
      r.description?.toLowerCase().includes(roleSearchTerm.toLowerCase())
    );
  }, [roles, roleSearchTerm]);

  const totalRolePages = Math.max(1, Math.ceil(filteredRoles.length / rolePageSize));
  const paginatedRoles = useMemo(() => {
    const start = (rolePage - 1) * rolePageSize;
    return filteredRoles.slice(start, start + rolePageSize);
  }, [filteredRoles, rolePage, rolePageSize]);

  // Persist Matrix to Backend Database
  const saveMatrixToDatabase = (updatedMatrix: Record<string, Record<string, boolean>>, presetName?: string, showToast = true) => {
    if (!selectedRole) return;

    const jsonString = JSON.stringify(updatedMatrix);
    setSavingMatrix(true);

    api.updateSettingsRole(selectedRole.id, {
      ...selectedRole,
      permissionsMatrixJson: jsonString,
    })
      .then(() => {
        setSelectedRole({ ...selectedRole, permissionsMatrixJson: jsonString });
        if (presetName) setPermissionPreset(presetName as any);
        const userRole = (currentUser?.role || '').toLowerCase();
        const selRole = (selectedRole.roleName || '').toLowerCase();
        const isCurrentRoleMatch =
          userRole === selRole ||
          (userRole.includes('admin') && (selRole.includes('admin') || selRole.includes('system') || selRole.includes('administrator'))) ||
          (userRole === 'doctor' && selRole === 'doctor') ||
          (userRole === 'nurse' && selRole === 'nurse') ||
          (userRole.includes('lab') && selRole.includes('lab'));

        if (isCurrentRoleMatch) {
          updateUserPermissions(jsonString, updatedMatrix);
          updateLocalMatrix(updatedMatrix);
        }

        if (previewRole) {
          setPreviewRole({ roleName: selectedRole.roleName, matrix: updatedMatrix });
        }

        // Broadcast to all open tabs and components in real time
        window.dispatchEvent(
          new CustomEvent('connectcare:permissions-updated', {
            detail: { roleName: selectedRole.roleName, matrix: updatedMatrix }
          })
        );

        if (showToast) {
          toast.success(`Permissions for role "${selectedRole.roleName}" updated successfully in real time.`);
        }
      })
      .catch((err) => {
        console.error('Failed to save role permissions matrix:', err);
        if (showToast) toast.error('Failed to save permissions matrix.');
      })
      .finally(() => {
        setSavingMatrix(false);
      });
  };

  // Toggle single action in module matrix
  const handleTogglePermission = (moduleName: string, actionKey: string) => {
    if (!isCustomizing) return;
    const currentVal = !!matrix[moduleName]?.[actionKey];

    const updated = {
      ...matrix,
      [moduleName]: {
        ...matrix[moduleName],
        [actionKey]: !currentVal,
      },
    };

    // If toggling fullAccess, sync all other action keys for that module
    if (actionKey === 'fullAccess') {
      const newVal = !currentVal;
      DEFAULT_ACTIONS.forEach((act) => {
        updated[moduleName][act.key] = newVal;
      });
    }

    setMatrix(updated);
    setPermissionPreset('Custom');
    saveMatrixToDatabase(updated, 'Custom', false);
  };

  // Toggle entire Patient Tab (Quick Enable / Disable)
  const handleTogglePatientTab = (tabKey: string) => {
    const matrixKey = `Patient Tab: ${tabKey}`;
    const currentEnabled = !!(matrix[matrixKey]?.read || matrix[matrixKey]?.fullAccess);
    const newEnabled = !currentEnabled;

    const updated = {
      ...matrix,
      [matrixKey]: {
        fullAccess: newEnabled,
        read: newEnabled,
        create: newEnabled,
        update: newEnabled,
        delete: newEnabled,
        export: newEnabled,
      },
    };

    setMatrix(updated);
    setPermissionPreset('Custom');
    saveMatrixToDatabase(updated, 'Custom', false);
    toast.success(`Patient tab "${tabKey}" ${newEnabled ? 'enabled' : 'disabled'} for ${selectedRole?.roleName}.`);
  };

  // Toggle single action within a Patient Tab
  const handleTogglePatientTabAction = (tabKey: string, actionKey: string) => {
    const matrixKey = `Patient Tab: ${tabKey}`;
    const currentVal = !!matrix[matrixKey]?.[actionKey];
    const newVal = !currentVal;

    const currentTabObj = matrix[matrixKey] || {};
    const updatedTabObj: Record<string, boolean> = {
      ...currentTabObj,
      [actionKey]: newVal,
    };

    if (actionKey === 'fullAccess') {
      PATIENT_TAB_ACTIONS.forEach((act) => {
        updatedTabObj[act.key] = newVal;
      });
    } else if (actionKey === 'read' && !newVal) {
      updatedTabObj.fullAccess = false;
    }

    const updated = {
      ...matrix,
      [matrixKey]: updatedTabObj,
    };

    setMatrix(updated);
    setPermissionPreset('Custom');
    saveMatrixToDatabase(updated, 'Custom', false);
  };

  // Bulk Enable All Patient Tabs
  const handleEnableAllPatientTabs = () => {
    const updated = { ...matrix };
    ALL_PATIENT_TABS.forEach((tab) => {
      updated[`Patient Tab: ${tab.key}`] = {
        fullAccess: true,
        read: true,
        create: true,
        update: true,
        delete: true,
        export: true,
      };
    });
    setMatrix(updated);
    setPermissionPreset('Custom');
    saveMatrixToDatabase(updated, 'Custom', true);
    toast.success(`All patient tabs enabled for ${selectedRole?.roleName}.`);
  };

  // Bulk Disable All Patient Tabs
  const handleDisableAllPatientTabs = () => {
    const updated = { ...matrix };
    ALL_PATIENT_TABS.forEach((tab) => {
      updated[`Patient Tab: ${tab.key}`] = {
        fullAccess: false,
        read: false,
        create: false,
        update: false,
        delete: false,
        export: false,
      };
    });
    setMatrix(updated);
    setPermissionPreset('Custom');
    saveMatrixToDatabase(updated, 'Custom', true);
    toast.info(`All patient tabs disabled for ${selectedRole?.roleName}.`);
  };

  // Preset Handlers
  const applyPreset = (preset: 'Full Access' | 'Limited Access' | 'Read Only' | 'Custom') => {
    if (!selectedRole) return;
    setPermissionPreset(preset);

    const newMatrix: Record<string, Record<string, boolean>> = {};

    ALL_SYSTEM_MODULES.forEach((mod) => {
      if (preset === 'Full Access') {
        newMatrix[mod] = { fullAccess: true, create: true, read: true, update: true, delete: true, export: true, import: true, print: true };
      } else if (preset === 'Limited Access') {
        const isCoreClinical = ['Dashboard', 'Residents', 'Care Team', 'Clinical', 'Medication', 'Tasks', 'Messages', 'Alerts & Incidents'].includes(mod);
        const isRead = ['Doctors', 'Nurses', 'Locations', 'Reports & Analytics'].includes(mod);
        newMatrix[mod] = {
          fullAccess: isCoreClinical,
          create: isCoreClinical,
          read: isCoreClinical || isRead,
          update: isCoreClinical,
          delete: false,
          export: isCoreClinical,
          import: false,
          print: true,
        };
      } else if (preset === 'Read Only') {
        const isRestricted = ['Settings', 'Integrations', 'Audit Logs', 'Financial'].includes(mod);
        newMatrix[mod] = { fullAccess: false, create: false, read: !isRestricted, update: false, delete: false, export: false, import: false, print: false };
      } else {
        newMatrix[mod] = { ...(matrix[mod] || {}) };
      }
    });

    // Also apply to all Patient Tabs
    ALL_PATIENT_TABS.forEach((tab) => {
      const tabKey = `Patient Tab: ${tab.key}`;
      if (preset === 'Full Access') {
        newMatrix[tabKey] = { fullAccess: true, create: true, read: true, update: true, delete: true, export: true };
      } else if (preset === 'Limited Access') {
        newMatrix[tabKey] = { fullAccess: true, create: true, read: true, update: true, delete: false, export: true };
      } else if (preset === 'Read Only') {
        newMatrix[tabKey] = { fullAccess: false, create: false, read: true, update: false, delete: false, export: false };
      } else {
        newMatrix[tabKey] = { ...(matrix[tabKey] || {}) };
      }
    });

    setMatrix(newMatrix);
    saveMatrixToDatabase(newMatrix, preset);
  };

  // Role CRUD Handlers
  const handleOpenAddRoleModal = () => {
    setEditingRole(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditRoleModal = () => {
    if (!selectedRole) return;
    setEditingRole(selectedRole);
    setIsAddModalOpen(true);
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;
    if (selectedRole.categoryBadge === 'System Role') {
      toast.warning('System Roles cannot be deleted.');
      return;
    }

    const confirmed = await confirm({
      title: 'Delete Custom Role',
      message: `Are you sure you want to delete custom role "${selectedRole.roleName}"? This action cannot be undone.`,
      confirmText: 'Delete Role',
      variant: 'danger',
    });

    if (confirmed) {
      try {
        await api.deleteSettingsRole(selectedRole.id);
        toast.success(`Role "${selectedRole.roleName}" deleted successfully.`);
        setSelectedRole(null);
        fetchRoles();
      } catch (err: any) {
        console.error('Failed to delete role:', err);
        toast.error(err?.response?.data?.message || err?.message || 'Failed to delete role definition.');
      }
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Roles & Permissions</h3>
          <p className="text-xs text-slate-500 font-medium">Create, customize and manage security roles for the application.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <DataImportExportToolbar
            moduleKey="settings-roles"
            data={roles}
            idField="id"
            onImportSuccess={fetchRoles}
            customCreateApi={api.createSettingsRole}
          />
          {isAdmin && (
            <button
              onClick={handleOpenAddRoleModal}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-500/20 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Create New Role
            </button>
          )}
        </div>
      </div>

      {/* Grid: Left Roles List (1/3) + Right Permissions Matrix (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Roles List */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow space-y-3 h-fit">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="font-bold text-xs text-slate-900">Roles ({filteredRoles.length})</h4>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={roleSearchTerm}
                onChange={(e) => {
                  setRoleSearchTerm(e.target.value);
                  setRolePage(1);
                }}
                placeholder="Search roles..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>
            <button
              onClick={fetchRoles}
              className="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50"
              title="Refresh Roles"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-2 min-h-[300px]">
            {paginatedRoles.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs font-medium">
                No roles found matching criteria.
              </div>
            ) : (
              paginatedRoles.map((r, i) => (
                <div
                  key={r.id || i}
                  onClick={() => setSelectedRole(r)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedRole?.id === r.id
                      ? 'bg-purple-50/80 border-purple-300 shadow-sm'
                      : 'bg-white border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs shrink-0">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-900">{r.roleName}</p>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{r.description}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full shrink-0 ml-1">
                      {r.usersCount || 0} Users
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Role List Pagination */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-[10px] text-slate-400">
              Showing {filteredRoles.length === 0 ? 0 : (rolePage - 1) * rolePageSize + 1} to {Math.min(rolePage * rolePageSize, filteredRoles.length)} of {filteredRoles.length} roles
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={rolePage === 1}
                onClick={() => setRolePage((p) => Math.max(1, p - 1))}
                className="p-1 border border-slate-200 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              {Array.from({ length: totalRolePages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setRolePage(p)}
                  className={`px-2 py-0.5 rounded font-bold text-[10px] transition-colors ${
                    rolePage === p ? 'bg-purple-600 text-white' : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={rolePage >= totalRolePages}
                onClick={() => setRolePage((p) => Math.min(totalRolePages, p + 1))}
                className="p-1 border border-slate-200 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Role Details, Tabs & Permissions Matrix */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 card-shadow p-6 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-base text-slate-900">{selectedRole?.roleName || 'System Administrator'}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                    {selectedRole?.categoryBadge || 'System Role'}
                  </span>
                  {selectedRole?.status && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedRole.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                      {selectedRole.status}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {selectedRole?.description || 'Full access to all modules and settings. Can manage users, roles and system configurations.'}
                </p>
              </div>

              {isAdmin && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (previewRole && previewRole.roleName === selectedRole?.roleName) {
                        setPreviewRole(null);
                        toast.info('Exited role preview mode.');
                      } else {
                        setPreviewRole({ roleName: selectedRole.roleName, matrix });
                        toast.success(`Previewing "${selectedRole.roleName}" permissions in left menu.`);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      previewRole?.roleName === selectedRole?.roleName
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 ring-2 ring-purple-400'
                        : 'border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                    }`}
                    title="Apply and preview this role's navigation and permissions live"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    {previewRole?.roleName === selectedRole?.roleName ? `Previewing (Active)` : `Preview in Left Menu`}
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenEditRoleModal}
                    className="flex items-center gap-1 px-3 py-1.5 border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Edit Role
                  </button>
                  {selectedRole?.categoryBadge !== 'System Role' && (
                    <button
                      type="button"
                      onClick={handleDeleteRole}
                      className="p-1.5 border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                      title="Delete Custom Role"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Sub-tabs & View Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-2 text-xs">
              <div className="flex gap-4">
                {(['Permissions', `Users (${assignedUsers.length})`, 'Role Details'] as const).map((tb) => {
                  const tabKey = tb.startsWith('Permissions') ? 'Permissions' : tb.startsWith('Users') ? 'Users' : 'Role Details';
                  return (
                    <button
                      key={tb}
                      onClick={() => setActiveTab(tabKey)}
                      className={`pb-2 font-bold border-b-2 transition-colors cursor-pointer ${
                        activeTab === tabKey
                          ? 'border-purple-600 text-purple-700'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tb}
                    </button>
                  );
                })}
              </div>

              {activeTab === 'Permissions' && (
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setViewMode('Module')}
                    className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                      viewMode === 'Module' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    System Modules
                  </button>
                  <button
                    onClick={() => setViewMode('PatientTabs')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                      viewMode === 'PatientTabs' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Users className="h-3.5 w-3.5" />
                    Patient Tabs ({ALL_PATIENT_TABS.length})
                  </button>
                  <button
                    onClick={() => setViewMode('Action')}
                    className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                      viewMode === 'Action' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Action View
                  </button>
                </div>
              )}
            </div>

            {/* TAB 1: PERMISSIONS TAB */}
            {activeTab === 'Permissions' && (
              <div className="space-y-4">
                {/* Module View Matrix */}
                {viewMode === 'Module' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-bold text-xs text-slate-900">Module Permissions</h5>
                        <p className="text-[10px] text-slate-400">Define action access level per module. Disabling "Patients" hides the module from the left menu.</p>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <table className="w-full text-center text-xs text-slate-700">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          <tr>
                            <th className="p-2.5 text-left">Module</th>
                            {DEFAULT_ACTIONS.map((act) => (
                              <th key={act.key} className="p-2.5">{act.label}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {ALL_SYSTEM_MODULES.map((modName) => (
                            <tr key={modName} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-2.5 text-left font-bold text-slate-900">
                                {modName === 'Residents' ? (
                                  <div className="flex items-center gap-1.5">
                                    <span>Patients</span>
                                    <span className="text-[10px] text-purple-700 font-semibold bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">
                                      Residents (Left Menu)
                                    </span>
                                  </div>
                                ) : (
                                  modName
                                )}
                              </td>
                              {DEFAULT_ACTIONS.map((act) => {
                                const isChecked = !!matrix[modName]?.[act.key];
                                return (
                                  <td key={act.key} className="p-2.5">
                                    {isCustomizing ? (
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => handleTogglePermission(modName, act.key)}
                                        className="h-4 w-4 accent-purple-600 rounded cursor-pointer"
                                      />
                                    ) : isChecked ? (
                                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-rose-400 mx-auto" />
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Patient Tabs View Matrix */}
                {viewMode === 'PatientTabs' && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-purple-50/50 p-3.5 rounded-xl border border-purple-100">
                      <div>
                        <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-purple-600" />
                          Patient Tab Level Permissions
                        </h5>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Configure granular tab visibility and permitted actions inside the Patient Details page (<code className="text-purple-700 bg-purple-100/70 px-1 py-0.5 rounded text-[9px]">/patients/:id</code>). Changes update the application in real-time.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleEnableAllPatientTabs}
                          className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                        >
                          Enable All Tabs
                        </button>
                        <button
                          type="button"
                          onClick={handleDisableAllPatientTabs}
                          className="px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                        >
                          Disable All Tabs
                        </button>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <table className="w-full text-center text-xs text-slate-700">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          <tr>
                            <th className="p-2.5 text-left min-w-[200px]">Patient Profile Tab</th>
                            <th className="p-2.5 text-left">Linked Module</th>
                            <th className="p-2.5">Tab Access</th>
                            {PATIENT_TAB_ACTIONS.map((act) => (
                              <th key={act.key} className="p-2.5">{act.label}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {ALL_PATIENT_TABS.map((tab) => {
                            const TabIcon = getPatientTabIcon(tab.key);
                            const matrixKey = `Patient Tab: ${tab.key}`;
                            const tabPerms = matrix[matrixKey] || {};
                            const isTabEnabled = !!(tabPerms.fullAccess || tabPerms.read);

                            return (
                              <tr key={tab.key} className="hover:bg-slate-50/80 transition-colors">
                                <td className="p-2.5 text-left">
                                  <div className="flex items-center gap-2.5">
                                    <div className={`p-1.5 rounded-lg shrink-0 ${isTabEnabled ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-400'}`}>
                                      <TabIcon className="h-4 w-4" />
                                    </div>
                                    <div>
                                      <p className="font-bold text-xs text-slate-900">{tab.label}</p>
                                      <p className="text-[10px] text-slate-400 line-clamp-1">{tab.description}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-2.5 text-left">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                                    {tab.defaultModule}
                                  </span>
                                </td>
                                <td className="p-2.5">
                                  <button
                                    type="button"
                                    onClick={() => handleTogglePatientTab(tab.key)}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                                      isTabEnabled
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                        : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200'
                                    }`}
                                    title={`Click to ${isTabEnabled ? 'disable' : 'enable'} this tab`}
                                  >
                                    {isTabEnabled ? (
                                      <>
                                        <ToggleRight className="h-4 w-4 text-emerald-600" /> Enabled
                                      </>
                                    ) : (
                                      <>
                                        <ToggleLeft className="h-4 w-4 text-slate-400" /> Disabled
                                      </>
                                    )}
                                  </button>
                                </td>
                                {PATIENT_TAB_ACTIONS.map((act) => {
                                  const isChecked = !!tabPerms[act.key];
                                  return (
                                    <td key={act.key} className="p-2.5">
                                      {isCustomizing ? (
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={() => handleTogglePatientTabAction(tab.key, act.key)}
                                          className="h-4 w-4 accent-purple-600 rounded cursor-pointer"
                                        />
                                      ) : isChecked ? (
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                                      ) : (
                                        <XCircle className="h-4 w-4 text-rose-400 mx-auto" />
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Action View Matrix */}
                {viewMode === 'Action' && (
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-bold text-xs text-slate-900">Action Permissions View</h5>
                      <p className="text-[10px] text-slate-400">View permitted modules grouped by functional action.</p>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <table className="w-full text-left text-xs text-slate-700">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          <tr>
                            <th className="p-2.5">Action Type</th>
                            <th className="p-2.5">Permitted Modules</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {DEFAULT_ACTIONS.map((act) => {
                            const allowedMods = ALL_SYSTEM_MODULES.filter((m) => !!matrix[m]?.[act.key]);
                            return (
                              <tr key={act.key} className="hover:bg-slate-50 transition-colors">
                                <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                                  {act.label}
                                </td>
                                <td className="p-3">
                                  <div className="flex flex-wrap gap-1.5">
                                    {allowedMods.length === 0 ? (
                                      <span className="text-slate-400 text-[11px] italic">No modules allowed</span>
                                    ) : (
                                      allowedMods.map((m) => (
                                        <span key={m} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800">
                                          {m}
                                        </span>
                                      ))
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Footer Controls & Customize Toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-4 text-[10px]">
                    <span className="flex items-center gap-1 font-semibold text-slate-600">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Allowed
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-slate-600">
                      <XCircle className="h-3.5 w-3.5 text-rose-400" /> Not Allowed
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {savingMatrix && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving changes...
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (isCustomizing) {
                          toast.success(`Custom permissions for "${selectedRole?.roleName}" saved successfully.`);
                          setIsCustomizing(false);
                        } else {
                          setIsCustomizing(true);
                        }
                      }}
                      className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isCustomizing
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                          : 'border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100'
                      }`}
                    >
                      {isCustomizing ? 'Done Customizing' : 'Customize Permissions'}
                    </button>
                  </div>
                </div>

                {/* Permission Presets Section */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                  <h5 className="font-bold text-xs text-slate-900">Permission Presets</h5>
                  <p className="text-[10px] text-slate-400">Select a predefined permission template to apply across modules and patient tabs.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    {[
                      { title: 'Full Access' as const, desc: 'Grants full access to all modules and patient tabs.' },
                      { title: 'Limited Access' as const, desc: 'Grants access to core clinical and care tabs.' },
                      { title: 'Read Only' as const, desc: 'Grants read-only access across modules and tabs.' },
                      { title: 'Custom' as const, desc: 'Configure custom module and tab permissions.' },
                    ].map((pst) => (
                      <div
                        key={pst.title}
                        onClick={() => applyPreset(pst.title)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          permissionPreset === pst.title
                            ? 'bg-white border-purple-500 shadow-sm ring-1 ring-purple-400'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900">{pst.title}</span>
                          <input
                            type="radio"
                            name="preset"
                            checked={permissionPreset === pst.title}
                            readOnly
                            className="accent-purple-600 pointer-events-none"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400">{pst.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: USERS TAB */}
            {activeTab === 'Users' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h5 className="font-bold text-xs text-slate-900">Assigned Users ({assignedUsers.length})</h5>
                  <span className="text-[11px] text-slate-400">Users holding the "{selectedRole?.roleName}" role</span>
                </div>

                {loadingUsers ? (
                  <div className="text-center py-8 text-slate-400 text-xs">Loading assigned users...</div>
                ) : assignedUsers.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50">
                    No active users currently assigned to this role.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase">
                        <tr>
                          <th className="p-3">User Name</th>
                          <th className="p-3">Email</th>
                          <th className="p-3">Department</th>
                          <th className="p-3">Location</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {assignedUsers.map((u, i) => (
                          <tr key={u.id || i} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold">
                                {u.userName?.substring(0, 2).toUpperCase()}
                              </div>
                              <span>{u.userName}</span>
                            </td>
                            <td className="p-3 text-slate-600">{u.email}</td>
                            <td className="p-3 text-slate-700">{u.department}</td>
                            <td className="p-3 text-slate-700">{u.location}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                                {u.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ROLE DETAILS TAB */}
            {activeTab === 'Role Details' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="font-semibold text-slate-500 block">Role Name</span>
                    <span className="font-bold text-slate-900 text-sm">{selectedRole?.roleName}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block">Category</span>
                    <span className="font-bold text-purple-700">{selectedRole?.categoryBadge}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block">Status</span>
                    <span className="font-bold text-emerald-700">{selectedRole?.status || 'Active'}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block">Assigned Users</span>
                    <span className="font-bold text-slate-900">{assignedUsers.length} Users</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-slate-700 block">Description & Access Scope</span>
                  <p className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium">
                    {selectedRole?.description || 'No detailed description provided.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Role Create / Edit Modal */}
      <RoleCreateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchRoles}
        initialData={editingRole}
      />
    </div>
  );
};

export default RolesPermissionsSettingsPage;

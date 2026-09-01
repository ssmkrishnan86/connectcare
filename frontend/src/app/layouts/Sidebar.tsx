import React, { useEffect, useState, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '@/features/auth/context/AuthContext';
import { usePermission } from '@/context/PermissionContext';
import { fetchApi, api } from '@/lib/api';
import { toggleSidebar } from '@/store/slices/uiSlice';
import type { RootState } from '@/store';
import {
  LayoutDashboard,
  Users,
  HeartPulse,
  Stethoscope,
  UserCog,
  Building2,
  AlertTriangle,
  CheckSquare,
  Pill,
  BarChart3,
  FileText,
  Network,
  ShieldAlert,
  Sparkles,
  Settings,
  ShieldCheck,
  Bell,
  Globe,
  Lock,
  Database,
  CreditCard,
  Calendar,
  MessageSquare,
  Activity,
  Repeat,
  FileEdit,
  UserCheck,
  ClipboardCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  X
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const { user, logout } = useAuth();
  const { canAccessModule, roleName, isDoctor, isNurse, previewRole, setPreviewRole } = usePermission();
  const role = roleName || user?.role || 'Admin';

  const sidebarOpen = useSelector((state: RootState) => state.ui.sidebarOpen);

  const [dbMenus, setDbMenus] = useState<any[]>([]);
  const [activeAlertsCount, setActiveAlertsCount] = useState<number>(0);
  const [activeTasksCount, setActiveTasksCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    fetchApi<any>(`/rbac/user-menu?role=${encodeURIComponent(role)}`)
      .then((res: any) => {
        const menuArray = Array.isArray(res) ? res : res?.data;
        if (isMounted && Array.isArray(menuArray) && menuArray.length > 0) {
          setDbMenus(menuArray);
        }
      })
      .catch((err: any) => {
        console.error('Failed to load RBAC menus:', err);
      });

    // Fetch dynamic active counts from database
    api.getAlerts()
      .then((res: any) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        const count = list.filter((a: any) => a.status !== 'Resolved' && a.status !== 'Dismissed').length;
        if (isMounted) setActiveAlertsCount(count);
      })
      .catch(() => {});

    api.getTasks()
      .then((res: any) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        const count = list.filter((t: any) => !t.isCompleted && t.statusStr !== 'Completed' && t.status !== 2).length;
        if (isMounted) setActiveTasksCount(count);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [role]);

  // Doctor Navigation Items matching reference mockup
  const doctorNavItems = useMemo(() => [
    { menuKey: 'doc_dashboard', title: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard', module: 'Dashboard' },
    { menuKey: 'doc_patients', title: 'My Patients', path: '/patients', icon: 'Users', module: 'Residents' },
    { menuKey: 'doc_care_team', title: 'Care Team', path: '/care-teams', icon: 'HeartPulse', module: 'Care Team' },
    { menuKey: 'doc_appointments', title: 'Appointments', path: '/consultations', icon: 'Calendar', module: 'Clinical' },
    { menuKey: 'doc_care_plans', title: 'Care Plans', path: '/care-plans', icon: 'HeartPulse', module: 'Clinical' },
    { menuKey: 'doc_tasks', title: 'Tasks & Follow-ups', path: '/tasks', icon: 'CheckSquare', module: 'Tasks' },
    { menuKey: 'doc_ai', title: 'AI Copilot', path: '/ai-copilot', icon: 'Sparkles', module: 'AI Operations' },
    { menuKey: 'doc_alerts', title: 'Alerts', path: '/alerts', icon: 'Bell', module: 'Alerts & Incidents' },
    { menuKey: 'doc_messages', title: 'Messages', path: '/messages', icon: 'MessageSquare', module: 'Messages' },
    { menuKey: 'doc_reports', title: 'Reports', path: '/reports', icon: 'BarChart3', module: 'Reports & Analytics' },
  ], []);

  // Nurse Navigation Fallback Items
  const nurseNavItems = useMemo(() => [
    { menuKey: 'nurse_dashboard', title: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard', module: 'Dashboard' },
    { menuKey: 'nurse_patients', title: 'My Patients', path: '/patients', icon: 'Users', module: 'Residents' },
    { menuKey: 'nurse_care_team', title: 'Care Team', path: '/care-teams', icon: 'HeartPulse', module: 'Care Team' },
    { menuKey: 'nurse_vitals', title: 'Vital Rounds', path: '/vital-rounds', icon: 'Activity', module: 'Clinical' },
    { menuKey: 'nurse_medications', title: 'Medications', path: '/medications', icon: 'Pill', module: 'Medication' },
    { menuKey: 'nurse_tasks', title: 'Tasks', path: '/tasks', icon: 'CheckSquare', badgeType: activeTasksCount > 0 ? 'count' : undefined, badgeValue: activeTasksCount > 0 ? activeTasksCount.toString() : undefined, module: 'Tasks' },
    { menuKey: 'nurse_ai', title: 'AI Copilot', path: '/ai-copilot', icon: 'Sparkles', module: 'AI Operations' },
    { menuKey: 'nurse_alerts', title: 'Alerts', path: '/alerts', icon: 'Bell', badgeType: activeAlertsCount > 0 ? 'count' : undefined, badgeValue: activeAlertsCount > 0 ? activeAlertsCount.toString() : undefined, module: 'Alerts & Incidents' },
    { menuKey: 'nurse_handover', title: 'Shift Handover', path: '/shift-handover', icon: 'Repeat', module: 'Clinical' },
    { menuKey: 'nurse_doc', title: 'Documentation', path: '/documentations', icon: 'FileEdit', module: 'Clinical' },
    { menuKey: 'nurse_care_plans', title: 'Care Plans', path: '/care-plans', icon: 'HeartPulse', module: 'Clinical' },
    { menuKey: 'nurse_consult', title: 'Appointments', path: '/consultations', icon: 'Calendar', module: 'Clinical' },
    { menuKey: 'nurse_discharge', title: 'Discharge Checklist', path: '/discharge-checklist', icon: 'ClipboardCheck', module: 'Clinical' },
    { menuKey: 'nurse_reports', title: 'Reports', path: '/reports', icon: 'BarChart2', module: 'Reports & Analytics' },
    { menuKey: 'nurse_messages', title: 'Messages', path: '/messages', icon: 'MessageSquare', module: 'Messages' },
    { menuKey: 'nurse_settings', title: 'Settings & Profile', path: '/settings-profile', icon: 'Settings', module: 'Settings' },
  ], [activeAlertsCount, activeTasksCount]);

  // Icon Resolver
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'LayoutDashboard': return LayoutDashboard;
      case 'Users': return Users;
      case 'Calendar': return Calendar;
      case 'Stethoscope': return Stethoscope;
      case 'HeartPulse': return HeartPulse;
      case 'CheckSquare': return CheckSquare;
      case 'Bell': return Bell;
      case 'MessageSquare': return MessageSquare;
      case 'FileText': return FileText;
      case 'BarChart2': case 'BarChart3': return BarChart3;
      case 'Sparkles': return Sparkles;
      case 'Settings': return Settings;
      case 'Activity': return Activity;
      case 'Pill': return Pill;
      case 'Repeat': return Repeat;
      case 'FileEdit': return FileEdit;
      case 'UserCheck': return UserCheck;
      case 'ClipboardCheck': return ClipboardCheck;
      case 'Building2': return Building2;
      case 'Zap': case 'Network': return Network;
      case 'Shield': case 'ShieldAlert': return ShieldAlert;
      default: return LayoutDashboard;
    }
  };

  // Default Admin & Standard Nav Groups
  const rawNavGroups = useMemo(() => [
    {
      title: 'CORE',
      items: [
        { label: 'Dashboard Overview', path: '/dashboard', icon: LayoutDashboard, module: 'Dashboard' },
        { label: 'Patient List', path: '/patients', icon: Users, module: 'Residents' },
        { label: 'Care Team', path: '/care-teams', icon: HeartPulse, module: 'Care Team' },
        { label: 'AI Copilot Suite', path: '/ai-copilot', icon: Sparkles, module: 'AI Operations' },
        { label: 'Messages & Care Chat', path: '/messages', icon: MessageSquare, module: 'Messages' },
      ],
    },
    {
      title: 'STAFF & OPERATIONS',
      items: [
        { label: 'Doctors', path: '/doctors', icon: Stethoscope, module: 'Doctors' },
        { label: 'Nurses', path: '/nurses', icon: UserCog, module: 'Nurses' },
        { label: 'Locations & Units', path: '/locations', icon: Building2, module: 'Locations' },
        {
          label: 'Alerts & Incidents',
          path: '/alerts',
          icon: AlertTriangle,
          badge: activeAlertsCount > 0 ? activeAlertsCount.toString() : undefined,
          badgeVariant: 'critical' as const,
          module: 'Alerts & Incidents',
        },
        {
          label: 'Task Management',
          path: '/tasks',
          icon: CheckSquare,
          badge: activeTasksCount > 0 ? activeTasksCount.toString() : undefined,
          badgeVariant: 'secondary' as const,
          module: 'Tasks',
        },
        { label: 'Medication Management', path: '/medications', icon: Pill, module: 'Medication' },
      ],
    },
    {
      title: 'REPORTS & ANALYTICS',
      items: [
        { label: 'Reports & Analytics Overview', path: '/reports/overview', icon: BarChart3, module: 'Reports & Analytics' },
        { label: 'Operational Reports', path: '/reports/operational', icon: FileText, module: 'Reports & Analytics' },
        { label: 'Clinical Reports', path: '/reports/clinical', icon: FileText, module: 'Reports & Analytics' },
        { label: 'Financial Reports', path: '/reports/financial', icon: FileText, module: 'Financial' },
        { label: 'Custom Reports', path: '/reports/custom', icon: FileText, module: 'Reports & Analytics' },
      ],
    },
    {
      title: 'ADMINISTRATION',
      items: [
        { label: 'Integrations', path: '/integrations', icon: Network, module: 'Integrations' },
        { label: 'Audit Log', path: '/audit-logs', icon: ShieldAlert, module: 'Audit Logs' },
        { label: 'AI Operations Center', path: '/ai-operations', icon: Sparkles, module: 'AI Operations' },
      ],
    },
    {
      title: 'SETTINGS',
      items: [
        { label: 'General', path: '/settings', icon: Settings, module: 'Settings' },
        { label: 'Organization', path: '/settings/organization', icon: Building2, module: 'Settings' },
        { label: 'User Management', path: '/settings/users', icon: Users, module: 'Settings' },
        { label: 'Roles & Permissions', path: '/settings/roles', icon: ShieldCheck, module: 'Settings' },
        { label: 'Notifications', path: '/settings/notifications', icon: Bell, module: 'Settings' },
        { label: 'Localization', path: '/settings/localization', icon: Globe, module: 'Settings' },
        { label: 'Security', path: '/settings/security', icon: Lock, module: 'Settings' },
        { label: 'Backup & Restore', path: '/settings/backup', icon: Database, module: 'Settings' },
        { label: 'Subscription', path: '/settings/subscription', icon: CreditCard, module: 'Financial' },
      ],
    },
  ], [activeAlertsCount, activeTasksCount]);

  // Filter Nav Groups based on active permissions
  const filteredNavGroups = useMemo(() => {
    return rawNavGroups
      .map(group => ({
        ...group,
        items: group.items.filter(item => canAccessModule(item.module)),
      }))
      .filter(group => group.items.length > 0);
  }, [rawNavGroups, canAccessModule]);

  // Filter Clinical Role Menus based on active permissions
  const filteredDoctorNav = useMemo(() => {
    return doctorNavItems.filter(item => canAccessModule(item.module));
  }, [doctorNavItems, canAccessModule]);

  const filteredNurseNav = useMemo(() => {
    return nurseNavItems.filter(item => canAccessModule(item.module));
  }, [nurseNavItems, canAccessModule]);

  const portalTitle = isDoctor ? 'DOCTOR PORTAL' : role === 'Nurse' ? 'Nurse App' : `${role.toUpperCase()} PORTAL`;
  const displayName = isDoctor ? (user?.fullName || 'Dr. Sarah Wilson') : (user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : 'User');

  const roleMenus = isDoctor
    ? filteredDoctorNav
    : isNurse
    ? filteredNurseNav
    : (dbMenus.length > 0 ? dbMenus.filter(m => canAccessModule(m.module || m.title)) : []);

  return (
    <aside
      className={`${
        sidebarOpen ? 'w-64' : 'w-16'
      } bg-[#0B132B] text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 z-30 select-none font-sans transition-all duration-300 shrink-0 overflow-x-hidden`}
    >
      {/* Brand Header */}
      <div
        className={`p-3.5 flex items-center ${
          sidebarOpen ? 'justify-between' : 'flex-col gap-2 justify-center'
        } border-b border-slate-800/80 shrink-0 relative`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            onClick={() => !sidebarOpen && dispatch(toggleSidebar())}
            className={`h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30 shrink-0 ${
              !sidebarOpen ? 'cursor-pointer hover:bg-blue-500 transition-colors' : ''
            }`}
            title={!sidebarOpen ? 'Expand Left Menu' : undefined}
          >
            <Shield className="h-5 w-5 fill-white/20 stroke-[2.2]" />
          </div>
          {sidebarOpen && (
            <div className="min-w-0 transition-opacity duration-200">
              <h1 className="font-extrabold text-white text-sm tracking-tight leading-tight truncate">ConnectCare</h1>
              <p className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase truncate">{portalTitle}</p>
            </div>
          )}
        </div>

        {/* Toggle Arrow Button */}
        <button
          type="button"
          onClick={() => dispatch(toggleSidebar())}
          title={sidebarOpen ? 'Hide Left Menu' : 'Show Left Menu'}
          className={`p-1.5 rounded-xl border border-slate-700/60 bg-slate-800/70 text-slate-300 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all cursor-pointer shrink-0 shadow-xs group`}
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          ) : (
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          )}
        </button>
      </div>

      {/* Role Preview Banner */}
      {previewRole && (
        <div className="mx-2.5 my-2 p-2 bg-purple-950/80 border border-purple-500/60 rounded-xl flex items-center justify-between text-xs text-purple-200 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shrink-0"></span>
            {sidebarOpen ? (
              <span className="truncate font-bold text-[11px] text-purple-200">
                Preview: <strong className="text-white">{previewRole.roleName}</strong>
              </span>
            ) : (
              <span className="text-[10px] font-bold text-purple-300">Prev</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setPreviewRole(null)}
            className="p-1 hover:bg-purple-800/60 rounded-lg text-purple-300 hover:text-white cursor-pointer"
            title="Exit Role Preview Mode"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
        {(!isDoctor && !isNurse) ? (
          filteredNavGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {sidebarOpen && (
                <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                  {group.title}
                </h3>
              )}
              <div className="space-y-0.5 mt-1">
                {group.items.map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/settings'}
                    title={!sidebarOpen ? item.label : undefined}
                    className={({ isActive }) =>
                      `flex items-center ${
                        sidebarOpen ? 'justify-between px-3' : 'justify-center px-0'
                      } py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <item.icon className="h-4 w-4 shrink-0 stroke-[2.2]" />
                      {sidebarOpen && <span className="truncate">{item.label}</span>}
                    </div>

                    {sidebarOpen && item.badge && (
                      <Badge variant={item.badgeVariant || 'secondary'}>
                        {item.badge}
                      </Badge>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="space-y-1">
            {roleMenus.map(item => {
              const IconComp = getIcon(item.icon);
              return (
                <NavLink
                  key={item.menuKey || item.path}
                  to={item.path}
                  end={item.path === '/dashboard' || item.path === '/settings' || item.path === '/settings-profile'}
                  title={!sidebarOpen ? item.title : undefined}
                  className={({ isActive }) =>
                    `flex items-center ${
                      sidebarOpen ? 'justify-between px-3' : 'justify-center px-0'
                    } py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`
                  }
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <IconComp className="h-4 w-4 shrink-0 stroke-[2.2]" />
                    {sidebarOpen && <span className="truncate">{item.title}</span>}
                  </div>

                  {sidebarOpen && item.badgeValue && (
                    <Badge variant={item.badgeType === 'critical' ? 'critical' : 'secondary'}>
                      {item.badgeValue}
                    </Badge>
                  )}
                </NavLink>
              );
            })}
          </div>
        )}
      </nav>

      {/* Settings & Logout Links in Sidebar Navigation */}
      <div className="px-2.5 py-2 border-t border-slate-800/80 space-y-1 shrink-0">
        {canAccessModule('Settings') && (
          <NavLink
            to={isNurse ? '/settings-profile' : '/settings'}
            className={({ isActive }) =>
              `flex items-center ${
                sidebarOpen ? 'px-3 gap-3' : 'justify-center px-0'
              } py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`
            }
            title={!sidebarOpen ? 'Settings' : undefined}
          >
            <Settings className="h-4 w-4 shrink-0 stroke-[2.2]" />
            {sidebarOpen && <span>Settings</span>}
          </NavLink>
        )}
      </div>

      {/* Profile Card at very bottom */}
      <div className="p-3 border-t border-slate-800/80 shrink-0">
        <div
          className={`flex items-center ${
            sidebarOpen ? 'justify-between' : 'justify-center'
          } p-2 rounded-xl bg-slate-900/70 border border-slate-800/80`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="User Profile"
                className="h-8 w-8 rounded-full object-cover shrink-0 border border-cyan-400/40"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 font-bold flex items-center justify-center text-xs shrink-0">
                {displayName.charAt(0)}
              </div>
            )}
            
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate leading-tight">{displayName}</p>
                {isDoctor ? (
                  <div className="text-[10px] leading-tight">
                    <span className="text-cyan-400 font-semibold block">Cardiologist</span>
                    <span className="text-slate-400 font-medium block">DOC-1001</span>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500 font-semibold truncate">{role}</p>
                )}
              </div>
            )}
          </div>

          {sidebarOpen && (
            <button
              type="button"
              onClick={() => logout()}
              title="Sign Out"
              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

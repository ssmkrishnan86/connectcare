import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '@/features/auth/context/AuthContext';
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
  Cross,
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
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const { user, logout } = useAuth();
  const role = user?.role || 'Admin';

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

  // Doctor Navigation Fallback Items
  const doctorNavItems = [
    { menuKey: 'doc_dashboard', title: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { menuKey: 'doc_patients', title: 'My Patients', path: '/patients', icon: 'Users' },
    { menuKey: 'doc_schedule', title: 'Schedule', path: '/care-teams', icon: 'Calendar' },
    { menuKey: 'doc_consultations', title: 'Consultations', path: '/consultations', icon: 'Stethoscope' },
    { menuKey: 'doc_care_plans', title: 'Care Plans', path: '/care-plans', icon: 'HeartPulse' },
    { menuKey: 'doc_tasks', title: 'Tasks', path: '/tasks', icon: 'CheckSquare', badgeType: activeTasksCount > 0 ? 'count' : undefined, badgeValue: activeTasksCount > 0 ? activeTasksCount.toString() : undefined },
    { menuKey: 'doc_alerts', title: 'Alerts', path: '/alerts', icon: 'Bell', badgeType: activeAlertsCount > 0 ? 'count' : undefined, badgeValue: activeAlertsCount > 0 ? activeAlertsCount.toString() : undefined },
    { menuKey: 'doc_messages', title: 'Messages', path: '/messages', icon: 'MessageSquare' },
    { menuKey: 'doc_documents', title: 'Documents', path: '/documentations', icon: 'FileText' },
    { menuKey: 'doc_reports', title: 'Reports', path: '/reports', icon: 'BarChart2' },
    { menuKey: 'doc_ai', title: 'AI Assistant', path: '/ai-operations', icon: 'Sparkles', badgeType: 'new', badgeValue: 'New' },
    { menuKey: 'doc_settings', title: 'Settings', path: '/settings', icon: 'Settings' },
  ];

  // Nurse Navigation Fallback Items
  const nurseNavItems = [
    { menuKey: 'nurse_dashboard', title: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { menuKey: 'nurse_patients', title: 'My Patients', path: '/patients', icon: 'Users' },
    { menuKey: 'nurse_vitals', title: 'Vital Rounds', path: '/vital-rounds', icon: 'Activity' },
    { menuKey: 'nurse_medications', title: 'Medications', path: '/medications', icon: 'Pill' },
    { menuKey: 'nurse_tasks', title: 'Tasks', path: '/tasks', icon: 'CheckSquare', badgeType: activeTasksCount > 0 ? 'count' : undefined, badgeValue: activeTasksCount > 0 ? activeTasksCount.toString() : undefined },
    { menuKey: 'nurse_alerts', title: 'Alerts', path: '/alerts', icon: 'Bell', badgeType: activeAlertsCount > 0 ? 'count' : undefined, badgeValue: activeAlertsCount > 0 ? activeAlertsCount.toString() : undefined },
    { menuKey: 'nurse_handover', title: 'Shift Handover', path: '/shift-handover', icon: 'Repeat' },
    { menuKey: 'nurse_doc', title: 'Documentation', path: '/documentations', icon: 'FileEdit' },
    { menuKey: 'nurse_care_plans', title: 'Care Plans', path: '/care-plans', icon: 'HeartPulse' },
    { menuKey: 'nurse_consult', title: 'Consultations', path: '/consultations', icon: 'UserCheck' },
    { menuKey: 'nurse_discharge', title: 'Discharge Checklist', path: '/discharge-checklist', icon: 'ClipboardCheck' },
    { menuKey: 'nurse_reports', title: 'Reports', path: '/reports', icon: 'BarChart2' },
    { menuKey: 'nurse_messages', title: 'Messages', path: '/messages', icon: 'MessageSquare' },
    { menuKey: 'nurse_settings', title: 'Settings & Profile', path: '/settings-profile', icon: 'Settings' },
  ];

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

  // Default Admin Nav Groups
  const adminNavGroups = [
    {
      title: 'CORE',
      items: [
        { label: 'Dashboard Overview', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Patient List', path: '/patients', icon: Users },
        { label: 'Care Team', path: '/care-teams', icon: HeartPulse },
      ],
    },
    {
      title: 'STAFF & OPERATIONS',
      items: [
        { label: 'Doctors', path: '/doctors', icon: Stethoscope },
        { label: 'Nurses', path: '/nurses', icon: UserCog },
        { label: 'Locations & Units', path: '/locations', icon: Building2 },
        {
          label: 'Alerts & Incidents',
          path: '/alerts',
          icon: AlertTriangle,
          badge: activeAlertsCount > 0 ? activeAlertsCount.toString() : undefined,
          badgeVariant: 'critical' as const,
        },
        {
          label: 'Task Management',
          path: '/tasks',
          icon: CheckSquare,
          badge: activeTasksCount > 0 ? activeTasksCount.toString() : undefined,
          badgeVariant: 'secondary' as const,
        },

        { label: 'Medication Management', path: '/medications', icon: Pill },
      ],
    },
    {
      title: 'REPORTS & ANALYTICS',
      items: [
        { label: 'Reports & Analytics Overview', path: '/reports/overview', icon: BarChart3 },
        { label: 'Operational Reports', path: '/reports/operational', icon: FileText },
        { label: 'Clinical Reports', path: '/reports/clinical', icon: FileText },
        { label: 'Financial Reports', path: '/reports/financial', icon: FileText },
        { label: 'Custom Reports', path: '/reports/custom', icon: FileText },
      ],
    },
    {
      title: 'ADMINISTRATION',
      items: [
        { label: 'Integrations', path: '/integrations', icon: Network },
        { label: 'Audit Log', path: '/audit-logs', icon: ShieldAlert },
        { label: 'AI Operations Center', path: '/ai-operations', icon: Sparkles },
      ],
    },
    {
      title: 'SETTINGS',
      items: [
        { label: 'General', path: '/settings', icon: Settings },
        { label: 'Organization', path: '/settings/organization', icon: Building2 },
        { label: 'User Management', path: '/settings/users', icon: Users },
        { label: 'Roles & Permissions', path: '/settings/roles', icon: ShieldCheck },
        { label: 'Notifications', path: '/settings/notifications', icon: Bell },
        { label: 'Localization', path: '/settings/localization', icon: Globe },
        { label: 'Security', path: '/settings/security', icon: Lock },
        { label: 'Backup & Restore', path: '/settings/backup', icon: Database },
        { label: 'Subscription', path: '/settings/subscription', icon: CreditCard },
      ],
    },
  ];

  const portalTitle = role === 'Doctor' ? 'Doctor Portal' : role === 'Nurse' ? 'Nurse App' : 'Admin Portal';
  const displayName = user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : 'User';

  const roleMenus = dbMenus.length > 0
    ? dbMenus
    : role.toLowerCase() === 'doctor'
      ? doctorNavItems
      : role.toLowerCase() === 'nurse'
        ? nurseNavItems
        : [];

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
            className={`h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0 ${
              !sidebarOpen ? 'cursor-pointer hover:bg-indigo-500 transition-colors' : ''
            }`}
            title={!sidebarOpen ? 'Expand Left Menu' : undefined}
          >
            <Cross className="h-6 w-6 stroke-[2.5]" />
          </div>
          {sidebarOpen && (
            <div className="min-w-0 transition-opacity duration-200">
              <h1 className="font-bold text-white text-base tracking-tight leading-tight truncate">Connected Care</h1>
              <p className="text-[11px] font-bold text-indigo-400 truncate">{portalTitle}</p>
            </div>
          )}
        </div>

        {/* Toggle Arrow Button */}
        <button
          type="button"
          onClick={() => dispatch(toggleSidebar())}
          title={sidebarOpen ? 'Hide Left Menu' : 'Show Left Menu'}
          className={`p-1.5 rounded-xl border border-slate-700/60 bg-slate-800/70 text-slate-300 hover:text-white hover:bg-indigo-600 hover:border-indigo-500 transition-all cursor-pointer shrink-0 shadow-xs group`}
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          ) : (
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          )}
        </button>
      </div>


      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
        {role === 'Admin' ? (
          adminNavGroups.map((group, groupIdx) => (
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
                          ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
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
                  key={item.path}
                  to={item.path}
                  end={item.path === '/settings'}
                  title={!sidebarOpen ? item.title : undefined}
                  className={({ isActive }) =>
                    `flex items-center ${
                      sidebarOpen ? 'justify-between px-3' : 'justify-center px-0'
                    } py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
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

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-slate-800/80 shrink-0">
        <div
          className={`flex items-center ${
            sidebarOpen ? 'justify-between' : 'justify-center'
          } p-2 rounded-xl bg-slate-900/60 border border-slate-800/80`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-7 w-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 font-bold flex items-center justify-center text-xs shrink-0">
              {displayName.charAt(0)}
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{displayName}</p>
                <p className="text-[10px] text-slate-500 font-semibold truncate">{role}</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
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

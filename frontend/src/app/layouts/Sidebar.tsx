import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '@/features/auth/context/AuthContext';
import { fetchApi } from '@/lib/api';
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
  LogOut
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const role = user?.role || 'Admin';

  const sidebarOpen = useSelector((state: RootState) => state.ui.sidebarOpen);
  const [dbMenus, setDbMenus] = useState<any[]>([]);

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
    { menuKey: 'doc_tasks', title: 'Tasks', path: '/tasks', icon: 'CheckSquare', badgeType: 'count', badgeValue: '6' },
    { menuKey: 'doc_alerts', title: 'Alerts', path: '/alerts', icon: 'Bell', badgeType: 'count', badgeValue: '3' },
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
    { menuKey: 'nurse_tasks', title: 'Tasks', path: '/tasks', icon: 'CheckSquare' },
    { menuKey: 'nurse_alerts', title: 'Alerts', path: '/alerts', icon: 'Bell', badgeType: 'count', badgeValue: '6' },
    { menuKey: 'nurse_handover', title: 'Shift Handover', path: '/shift-handover', icon: 'Repeat' },
    { menuKey: 'nurse_doc', title: 'Documentation', path: '/documentations', icon: 'FileEdit' },
    { menuKey: 'nurse_care_plans', title: 'Care Plans', path: '/care-plans', icon: 'HeartPulse' },
    { menuKey: 'nurse_consult', title: 'Consultations', path: '/consultations', icon: 'UserCheck' },
    { menuKey: 'nurse_discharge', title: 'Discharge Checklist', path: '/discharge-checklist', icon: 'ClipboardCheck' },
    { menuKey: 'nurse_reports', title: 'Reports', path: '/reports', icon: 'BarChart2' },
    { menuKey: 'nurse_messages', title: 'Messages', path: '/messages', icon: 'MessageSquare', badgeType: 'count', badgeValue: '8' },
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
        { label: 'Alerts & Incidents', path: '/alerts', icon: AlertTriangle, badge: '12', badgeVariant: 'critical' as const },
        { label: 'Task Management', path: '/tasks', icon: CheckSquare },
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
        className={`p-4 flex items-center ${
          sidebarOpen ? 'gap-3' : 'justify-center'
        } border-b border-slate-800/80 shrink-0`}
      >
        <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0">
          <Cross className="h-6 w-6 stroke-[2.5]" />
        </div>
        {sidebarOpen && (
          <div className="min-w-0 transition-opacity duration-200">
            <h1 className="font-bold text-white text-base tracking-tight leading-tight truncate">Connected Care</h1>
            <p className="text-[11px] font-bold text-indigo-400 truncate">{portalTitle}</p>
          </div>
        )}
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
                        sidebarOpen ? 'justify-between px-3' : 'justify-center px-2'
                      } py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <item.icon className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-white" />
                      {sidebarOpen && <span className="truncate">{item.label}</span>}
                    </div>
                    {sidebarOpen && item.badge && (
                      <Badge
                        variant={item.badgeVariant}
                        className={
                          item.badgeVariant === 'critical' ? 'bg-rose-500 text-white border-none px-2 text-[10px]' : ''
                        }
                      >
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
            {sidebarOpen && (
              <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                {role.toUpperCase()} MENUS
              </h3>
            )}
            <div className="space-y-1 mt-2">
              {roleMenus.map((m: any) => {
                const IconComp = getIcon(m.icon);
                return (
                  <NavLink
                    key={m.id || m.menuKey}
                    to={m.path}
                    title={!sidebarOpen ? m.title : undefined}
                    className={({ isActive }) =>
                      `flex items-center ${
                        sidebarOpen ? 'justify-between px-3.5' : 'justify-center px-2'
                      } py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <IconComp className="h-4 w-4 shrink-0 text-slate-400" />
                      {sidebarOpen && <span className="truncate">{m.title}</span>}
                    </div>
                    {sidebarOpen && m.badgeValue && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                          m.badgeType === 'new' ? 'bg-indigo-500 text-white' : 'bg-rose-500 text-white'
                        }`}
                      >
                        {m.badgeValue}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* User Footer Profile */}
      <div className={`p-2.5 m-2 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'} shrink-0`}>
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="h-9 w-9 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0" title={!sidebarOpen ? `${displayName} (${role})` : undefined}>
            {displayName.substring(0, 2).toUpperCase()}
          </div>
          {sidebarOpen && (
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{displayName}</p>
              <p className="text-[10px] font-semibold text-indigo-400 truncate">{role}</p>
            </div>
          )}
        </div>

        {sidebarOpen && (
          <button
            onClick={() => logout()}
            title="Logout"
            className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

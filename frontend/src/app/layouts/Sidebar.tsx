import React from 'react';
import { NavLink } from 'react-router-dom';
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
  PlayCircle,
  MoreVertical,
  Cross,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export const Sidebar: React.FC = () => {
  const navGroups = [
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
        { label: 'Medication Management', path: '/medication', icon: Pill },
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
    {
      title: 'PROTOTYPE',
      items: [
        { label: 'Completed Flow', path: '/prototype/completed-flow', icon: PlayCircle },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#0B132B] text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 z-30 select-none font-sans">
      {/* Brand Header */}
      <div className="p-4 flex items-center gap-3 border-b border-slate-800/80 shrink-0">
        <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
          <Cross className="h-6 w-6 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="font-bold text-white text-base tracking-tight leading-tight">Connected Care</h1>
          <p className="text-[11px] text-slate-400 font-medium">Admin Portal</p>
        </div>
      </div>

      {/* Navigation Groups List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {group.title}
            </h3>
            <div className="space-y-0.5 mt-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/settings'}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <item.icon className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-white" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <Badge
                      variant={item.badgeVariant}
                      className={item.badgeVariant === 'critical' ? 'bg-red-500 text-white border-none px-2 text-[10px]' : ''}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Footer Profile */}
      <div className="p-3 m-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0">
            JA
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-white truncate">John Admin</p>
            <p className="text-[10px] text-slate-400 truncate">System Administrator</p>
          </div>
        </div>
        <button className="text-slate-400 hover:text-white p-1">
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

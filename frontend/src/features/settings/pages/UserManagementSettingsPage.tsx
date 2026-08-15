import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  StopCircle,
  ShieldAlert,
  Plus,
  Upload,
  Search,
  Filter,
  Download,
  Eye,
  Edit2,
  Key,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import { UserAccountCreateModal } from '../components/UserAccountCreateModal';

export const UserManagementSettingsPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalUsers: 156,
    activeUsers: 142,
    pendingInvitations: 8,
    inactiveUsers: 6,
    lockedAccounts: 3,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchUsers = () => {
    api.getSettingsUsers(searchTerm, roleFilter, statusFilter)
      .then((data) => setUsers(data || []))
      .catch(console.error);

    api.getSettingsUserStats()
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter, statusFilter]);

  const getRoleBadge = (roleStr: string) => {
    switch (roleStr) {
      case 'System Administrator':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">System Administrator</span>;
      case 'Nurse':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">Nurse</span>;
      case 'Doctor':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Doctor</span>;
      case 'Care Manager':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Care Manager</span>;
      case 'Billing Staff':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">Billing Staff</span>;
      case 'IT Support':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-100 text-cyan-800">IT Support</span>;
      case 'Receptionist':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-100 text-pink-800">Receptionist</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">{roleStr}</span>;
    }
  };

  const getStatusBadge = (statusStr: string) => {
    switch (statusStr) {
      case 'Active':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Active</span>;
      case 'Inactive':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span> Inactive</span>;
      case 'Locked':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">Locked</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">{statusStr}</span>;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">User Management</h3>
          <p className="text-xs text-slate-500 font-medium">Create, manage and control access for users in your organization.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3.5 py-2 border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-semibold">
            <Upload className="h-4 w-4" /> Import Users
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-500/20"
          >
            <Plus className="h-4 w-4" /> Add New User
          </button>
        </div>
      </div>

      {/* 5 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { title: 'Total Users', value: (stats.totalUsers || 156).toString(), subtext: '↑ 12.5% vs last month', icon: Users, bg: 'bg-purple-100 text-purple-600' },
          { title: 'Active Users', value: (stats.activeUsers || 142).toString(), subtext: '90.4% of total users', icon: CheckCircle2, bg: 'bg-emerald-100 text-emerald-600' },
          { title: 'Pending Invitations', value: (stats.pendingInvitations || 8).toString(), subtext: 'Invitations not accepted', icon: Clock, bg: 'bg-amber-100 text-amber-600' },
          { title: 'Inactive Users', value: (stats.inactiveUsers || 6).toString(), subtext: 'Users deactivated', icon: StopCircle, bg: 'bg-rose-100 text-rose-600' },
          { title: 'Locked Accounts', value: (stats.lockedAccounts || 3).toString(), subtext: 'Require attention', icon: ShieldAlert, bg: 'bg-blue-100 text-blue-600' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 card-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className={`h-9 w-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className="h-4 w-4 stroke-[2]" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-[11px] font-medium text-slate-500">{stat.title}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{stat.value}</h3>
            </div>
            <p className="mt-2 text-[11px] font-medium text-slate-400">{stat.subtext}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid: Filters Left (1/4) + User List Table Right (3/4) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow space-y-4 h-fit">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="font-bold text-xs text-slate-900">Filters</h4>
            <button
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('All Roles');
                setStatusFilter('All Status');
              }}
              className="text-xs font-semibold text-purple-600 hover:underline"
            >
              Reset
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-medium text-slate-600 block mb-1">Search User</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email or ID..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-medium text-slate-600 block mb-1">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
              >
                <option>All Roles</option>
                <option>System Administrator</option>
                <option>Doctor</option>
                <option>Nurse</option>
                <option>Care Manager</option>
                <option>Billing Staff</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-slate-600 block mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
              >
                <option>All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Locked">Locked</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-slate-600 block mb-1">Department / Unit</label>
              <select className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium">
                <option>All Departments</option>
                <option>Administration</option>
                <option>Nursing</option>
                <option>Medical</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-slate-600 block mb-1">Location / Unit</label>
              <select className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium">
                <option>All Locations</option>
                <option>Main Campus</option>
                <option>West Wing</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-slate-600 block mb-1">Last Login</label>
              <select className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium">
                <option>Any Time</option>
              </select>
            </div>

            <button className="w-full flex items-center justify-center gap-1.5 py-2 border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl font-semibold">
              <Filter className="h-3.5 w-3.5" /> Apply Filters
            </button>
          </div>
        </div>

        {/* Right Column: User List Table */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 card-shadow p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-2">
              <h4 className="font-bold text-sm text-slate-900">User List (156)</h4>
              <div className="flex items-center gap-3">
                <div className="relative w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                  />
                </div>
                <button className="flex items-center gap-1 px-3 py-1 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white">
                  <Download className="h-3.5 w-3.5 text-slate-400" /> Export
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Department / Unit</th>
                    <th className="p-3">Location / Unit</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Last Login</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {users.map((usr, idx) => (
                    <tr key={usr.id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                            {usr.userName?.substring(0, 2).toUpperCase() || 'JA'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">{usr.userName}</p>
                            <p className="text-[10px] text-slate-400">{usr.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">{getRoleBadge(usr.role)}</td>
                      <td className="p-3 text-slate-700 text-[11px]">{usr.department}</td>
                      <td className="p-3 text-slate-700 text-[11px]">{usr.location}</td>
                      <td className="p-3">{getStatusBadge(usr.status)}</td>
                      <td className="p-3 text-slate-500 text-[11px] whitespace-nowrap">{usr.lastSignInText}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1 text-slate-400">
                          <button className="p-1 hover:text-purple-600" title="View"><Eye className="h-3.5 w-3.5" /></button>
                          <button className="p-1 hover:text-blue-600" title="Edit"><Edit2 className="h-3.5 w-3.5" /></button>
                          <button className="p-1 hover:text-amber-600" title="Reset Password"><Key className="h-3.5 w-3.5" /></button>
                          <button className="p-1 hover:text-slate-700" title="More"><MoreVertical className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500 font-medium">Showing 1 to {users.length} of 156 users</span>
              <div className="flex items-center gap-2">
                <button className="p-1 border border-slate-200 rounded text-slate-400 hover:text-slate-600">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button className="px-2 py-0.5 bg-purple-600 text-white rounded font-bold">1</button>
                <button className="px-2 py-0.5 hover:bg-slate-100 text-slate-600 rounded">2</button>
                <button className="px-2 py-0.5 hover:bg-slate-100 text-slate-600 rounded">3</button>
                <button className="px-2 py-0.5 hover:bg-slate-100 text-slate-600 rounded">4</button>
                <button className="px-2 py-0.5 hover:bg-slate-100 text-slate-600 rounded">5</button>
                <span className="text-slate-400">...</span>
                <button className="px-2 py-0.5 hover:bg-slate-100 text-slate-600 rounded">16</button>
                <button className="p-1 border border-slate-200 rounded text-slate-400 hover:text-slate-600">
                  <ChevronRight className="h-4 w-4" />
                </button>
                <select className="ml-2 px-2 py-1 border border-slate-200 rounded text-slate-600 text-[11px]">
                  <option>10 / page</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UserAccountCreateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchUsers}
      />
    </div>
  );
};

export default UserManagementSettingsPage;

import React, { useState, useEffect, useMemo } from 'react';
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
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/context/AuthContext';
import { usePermission } from '@/context/PermissionContext';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import { UserAccountCreateModal } from '../components/UserAccountCreateModal';

export const UserManagementSettingsPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { can } = usePermission();
  const isAdmin = currentUser?.role?.toLowerCase().includes('admin');
  const toast = useToast();
  const confirm = useConfirm();

  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    activeUsers: 0,
    pendingInvitations: 0,
    inactiveUsers: 0,
    lockedAccounts: 0,
    activeUsersPercentage: '0%',
  });

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [loading, setLoading] = useState(false);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const fetchUsers = () => {
    setLoading(true);
    api.getSettingsUsers(searchTerm, roleFilter, statusFilter)
      .then((data) => setUsers(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));

    api.getSettingsUserStats()
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter, statusFilter]);

  // Apply Department and Location local filtering if selected
  const filteredUsers = useMemo(() => {
    return users.filter((usr) => {
      const matchDept = departmentFilter === 'All Departments' || usr.department === departmentFilter;
      const matchLoc = locationFilter === 'All Locations' || usr.location === locationFilter;
      return matchDept && matchLoc;
    });
  }, [users, departmentFilter, locationFilter]);

  // Calculate dynamic pagination
  const totalUsersCount = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalUsersCount / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const handleOpenAddModal = () => {
    if (!isAdmin) {
      toast.warning('Only System Administrators can create new user accounts.');
      return;
    }
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (usr: any) => {
    if (!isAdmin) {
      toast.warning('Only System Administrators can edit user accounts.');
      return;
    }
    setEditingUser(usr);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (usr: any) => {
    if (!isAdmin) {
      toast.warning('Only System Administrators can delete user accounts.');
      return;
    }

    const confirmed = await confirm({
      title: 'Delete User Account',
      message: `Are you sure you want to delete user "${usr.userName}" (${usr.email})? This action cannot be undone.`,
      confirmText: 'Delete User',
      variant: 'danger',
    });

    if (confirmed) {
      try {
        await api.deleteSettingsUser(usr.id);
        toast.success(`User ${usr.userName} was deleted successfully.`);
        fetchUsers();
      } catch (err: any) {
        console.error('Failed to delete user:', err);
        toast.error(err?.response?.data?.message || err?.message || 'Failed to delete user. Please try again.');
      }
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setRoleFilter('All Roles');
    setStatusFilter('All Status');
    setDepartmentFilter('All Departments');
    setLocationFilter('All Locations');
    setCurrentPage(1);
  };

  const getRoleBadge = (roleStr: string) => {
    switch (roleStr) {
      case 'System Administrator':
      case 'Administrator':
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
          {can('Settings', 'import') && (
            <button className="flex items-center gap-1.5 px-3.5 py-2 border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-semibold cursor-pointer">
              <Upload className="h-4 w-4" /> Import Users
            </button>
          )}
          {can('Settings', 'create') && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-500/20 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add New User
            </button>
          )}
        </div>
      </div>

      {/* 5 Dynamic Database KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { title: 'Total Users', value: (stats.totalUsers || 0).toString(), subtext: stats.totalUsersChange || 'Database records', icon: Users, bg: 'bg-purple-100 text-purple-600' },
          { title: 'Active Users', value: (stats.activeUsers || 0).toString(), subtext: stats.activeUsersPercentage || 'Active in system', icon: CheckCircle2, bg: 'bg-emerald-100 text-emerald-600' },
          { title: 'Pending Invitations', value: (stats.pendingInvitations || 0).toString(), subtext: stats.pendingInvitationsNote || 'Pending setup', icon: Clock, bg: 'bg-amber-100 text-amber-600' },
          { title: 'Inactive Users', value: (stats.inactiveUsers || 0).toString(), subtext: stats.inactiveUsersNote || 'Deactivated accounts', icon: StopCircle, bg: 'bg-rose-100 text-rose-600' },
          { title: 'Locked Accounts', value: (stats.lockedAccounts || 0).toString(), subtext: stats.lockedAccountsNote || 'Require attention', icon: ShieldAlert, bg: 'bg-blue-100 text-blue-600' },
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
              onClick={handleResetFilters}
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
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by name, email or ID..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-medium text-slate-600 block mb-1">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
              >
                <option>All Roles</option>
                <option value="System Administrator">System Administrator</option>
                <option value="Doctor">Doctor</option>
                <option value="Nurse">Nurse</option>
                <option value="Care Manager">Care Manager</option>
                <option value="Billing Staff">Billing Staff</option>
                <option value="IT Support">IT Support</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-slate-600 block mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
              >
                <option>All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
                <option value="Locked">Locked</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-slate-600 block mb-1">Department / Unit</label>
              <select
                value={departmentFilter}
                onChange={(e) => {
                  setDepartmentFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
              >
                <option>All Departments</option>
                <option value="Administration">Administration</option>
                <option value="Nursing">Nursing</option>
                <option value="Medical">Medical</option>
                <option value="Care Management">Care Management</option>
                <option value="Billing & Finance">Billing & Finance</option>
                <option value="Information Technology">Information Technology</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-slate-600 block mb-1">Location / Unit</label>
              <select
                value={locationFilter}
                onChange={(e) => {
                  setLocationFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
              >
                <option>All Locations</option>
                <option value="Main Campus">Main Campus</option>
                <option value="West Wing">West Wing</option>
                <option value="North Wing">North Wing</option>
                <option value="East Wing">East Wing</option>
              </select>
            </div>

            <button
              onClick={fetchUsers}
              className="w-full flex items-center justify-center gap-1.5 py-2 border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl font-semibold transition-colors"
            >
              <Filter className="h-3.5 w-3.5" /> Apply Filters
            </button>
          </div>
        </div>

        {/* Right Column: User List Table */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 card-shadow p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-2">
              <h4 className="font-bold text-sm text-slate-900">User List ({totalUsersCount})</h4>
              <div className="flex items-center gap-3">
                <div className="relative w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search users..."
                    className="w-full pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                  />
                </div>
                <button
                  onClick={fetchUsers}
                  className="flex items-center gap-1 px-3 py-1 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} /> Refresh
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
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                        No user accounts found matching selected criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((usr, idx) => (
                      <tr key={usr.id || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                              {usr.userName?.substring(0, 2).toUpperCase() || 'US'}
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
                        <td className="p-3 text-slate-500 text-[11px] whitespace-nowrap">{usr.lastSignInText || 'Never'}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1 text-slate-400">
                            {can('Settings', 'update') && (
                              <button
                                onClick={() => handleOpenEditModal(usr)}
                                className="p-1.5 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit User Account"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {can('Settings', 'delete') && (
                              <button
                                onClick={() => handleDeleteUser(usr)}
                                className="p-1.5 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete User Account"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Dynamic Pagination Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500 font-medium">
                {totalUsersCount === 0
                  ? 'Showing 0 users'
                  : `Showing ${(currentPage - 1) * pageSize + 1} to ${Math.min(currentPage * pageSize, totalUsersCount)} of ${totalUsersCount} users`}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 border border-slate-200 rounded text-slate-400 hover:text-slate-600 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-2.5 py-0.5 rounded font-bold transition-colors ${
                      currentPage === page ? 'bg-purple-600 text-white' : 'hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1 border border-slate-200 rounded text-slate-400 hover:text-slate-600 disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value) || 10);
                    setCurrentPage(1);
                  }}
                  className="ml-2 px-2 py-1 border border-slate-200 rounded text-slate-600 text-[11px] font-medium"
                >
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Create / Edit Modal */}
      <UserAccountCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchUsers}
        initialData={editingUser}
      />
    </div>
  );
};

export default UserManagementSettingsPage;

import React, { useEffect, useState } from 'react';
import { Users, Stethoscope, UserCheck, HeartPulse, UserCog, Calendar, Search, Plus, Eye, Edit2, ArrowUpRight, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/common/Pagination';
import { api } from '@/lib/api';
import { CareTeamMemberCreateModal } from '../components/CareTeamMemberCreateModal';
import { CareTeamMemberViewModal } from '../components/CareTeamMemberViewModal';
import { CareTeamMemberEditModal } from '../components/CareTeamMemberEditModal';

export const CareTeamsPage: React.FC = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMember, setViewMember] = useState<any | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editMember, setEditMember] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchMembers = () => {
    api.getCareTeams()
      .then((data) => setMembers(data || []))
      .catch(console.error);
  };

  const handleViewMember = (member: any) => {
    setViewMember(member);
    setIsViewModalOpen(true);
  };

  const handleEditMember = (member: any) => {
    setEditMember(member);
    setIsEditModalOpen(true);
  };

  const handleDeleteMember = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove care team member "${name}"?`)) return;
    try {
      await api.deleteCareTeamMember(id);
      fetchMembers();
    } catch (err: any) {
      alert(err?.message || 'Failed to remove team member.');
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const formatRole = (roleVal: any): { label: string; variant: 'doctor' | 'nurse' | 'allied' | 'support' } => {
    if (roleVal === 0 || roleVal === 'Doctor' || roleVal === 'doctor') {
      return { label: 'Doctor', variant: 'doctor' };
    }
    if (roleVal === 1 || roleVal === 'Nurse' || roleVal === 'nurse') {
      return { label: 'Nurse', variant: 'nurse' };
    }
    if (roleVal === 2 || roleVal === 'AlliedHealth' || roleVal === 'Allied Health' || roleVal === 'alliedhealth') {
      return { label: 'Allied Health', variant: 'allied' };
    }
    return { label: 'Support Staff', variant: 'support' };
  };

  const formatStatus = (statusVal: any): { label: string; variant: 'active' | 'on-leave' | 'inactive' } => {
    if (statusVal === 0 || statusVal === 'Active' || statusVal === 'active') {
      return { label: 'Active', variant: 'active' };
    }
    if (statusVal === 1 || statusVal === 'OnLeave' || statusVal === 'On Leave' || statusVal === 'onleave') {
      return { label: 'On Leave', variant: 'on-leave' };
    }
    return { label: 'Inactive', variant: 'inactive' };
  };

  const filteredMembers = members.filter((member) => {
    const roleObj = formatRole(member.role);
    const statusObj = formatStatus(member.status);

    const matchesSearch =
      (member.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.memberIdCode || member.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.email || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'All' || roleObj.label.toLowerCase().replace(/\s+/g, '') === roleFilter.toLowerCase().replace(/\s+/g, '');
    const matchesStatus = statusFilter === 'All' || statusObj.label.toLowerCase().replace(/\s+/g, '') === statusFilter.toLowerCase().replace(/\s+/g, '');

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="Care Team"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Care Teams' },
        ]}
        actions={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20"
          >
            <Plus className="h-4 w-4" /> Add Team Member
          </button>
        }
      />

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { title: 'Total Care Team Members', value: members.length.toString(), change: 'Live from DB', icon: Users, bg: 'bg-blue-100 text-blue-600' },
          { title: 'Doctors', value: members.filter(m => formatRole(m.role).label === 'Doctor').length.toString(), change: 'Doctors', icon: Stethoscope, bg: 'bg-emerald-100 text-emerald-600' },
          { title: 'Nurses', value: members.filter(m => formatRole(m.role).label === 'Nurse').length.toString(), change: 'Nurses', icon: UserCheck, bg: 'bg-purple-100 text-purple-600' },
          { title: 'Allied Health', value: members.filter(m => formatRole(m.role).label === 'Allied Health').length.toString(), change: 'Allied Health', icon: HeartPulse, bg: 'bg-amber-100 text-amber-600' },
          { title: 'Support Staff', value: members.filter(m => formatRole(m.role).label === 'Support Staff').length.toString(), change: 'Support Staff', icon: UserCog, bg: 'bg-cyan-100 text-cyan-600' },
          { title: 'Active Today', value: members.filter(m => formatStatus(m.status).label === 'Active').length.toString(), change: 'Active staff', icon: Calendar, bg: 'bg-indigo-100 text-indigo-600' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
            <div className={`h-9 w-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
              <stat.icon className="h-4 w-4" />
            </div>
            <div className="mt-3">
              <p className="text-[11px] font-medium text-slate-500">{stat.title}</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">{stat.value}</h3>
            </div>
            <p className="mt-2 text-[11px] font-medium text-emerald-600 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-0.5" /> {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search team member..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
          >
            <option value="All">All Roles</option>
            <option value="Doctor">Doctor</option>
            <option value="Nurse">Nurse</option>
            <option value="AlliedHealth">Allied Health</option>
            <option value="SupportStaff">Support Staff</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="OnLeave">On Leave</option>
            <option value="Inactive">Inactive</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setRoleFilter('All');
              setStatusFilter('All');
            }}
            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Care Team Table */}
      <div className="bg-white rounded-xl border border-slate-200 card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-3">Member</th>
                <th className="p-3">Role</th>
                <th className="p-3">Department / Unit</th>
                <th className="p-3">Location</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Status</th>
                <th className="p-3">Shift / Schedule</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-700">No Care Team Members Found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      No team members currently exist. Click "Add Team Member" to create a new team member.
                    </p>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                    >
                      <Plus className="h-4 w-4" /> Add Team Member
                    </button>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const roleObj = formatRole(member.role);
                  const statusObj = formatStatus(member.status);

                  return (
                    <tr key={member.id || member.memberIdCode} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {member.avatar ? (
                            <img src={member.avatar} alt={member.name} className="h-8 w-8 rounded-full object-cover shrink-0 border border-slate-200" />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-200">
                              {member.name ? member.name.replace('Dr. ', '').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'CT'}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900">{member.name}</p>
                            <p className="text-[10px] text-slate-400">ID: {member.memberIdCode || member.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant={roleObj.variant}>
                          {roleObj.label}
                        </Badge>
                      </td>
                      <td className="p-3 font-semibold text-slate-800">{member.department}</td>
                      <td className="p-3 text-slate-600">{member.location}</td>
                      <td className="p-3">
                        <p className="font-mono text-slate-700">{member.phone}</p>
                        <p className="text-[10px] text-slate-400">{member.email}</p>
                      </td>
                      <td className="p-3">
                        <Badge variant={statusObj.variant}>
                          {statusObj.label}
                        </Badge>
                      </td>
                      <td className="p-3 font-medium text-slate-600">{member.shift}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewMember(member)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditMember(member)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg"
                            title="Edit member"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMember(member.id, member.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                            title="Remove member"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={1}
        totalResults={filteredMembers.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        itemLabel="results"
      />

      <CareTeamMemberCreateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchMembers}
      />

      <CareTeamMemberViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewMember(null);
        }}
        member={viewMember}
      />

      <CareTeamMemberEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditMember(null);
        }}
        onSuccess={fetchMembers}
        member={editMember}
      />
    </div>
  );
};

export default CareTeamsPage;

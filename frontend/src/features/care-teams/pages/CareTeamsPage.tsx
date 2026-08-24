import React, { useEffect, useState } from 'react';
import { Users, Stethoscope, UserCheck, HeartPulse, Calendar, Search, Plus, Eye, Edit2, ArrowUpRight, Trash2, Shield, LayoutGrid, List, ChevronRight, Building2 } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/common/Pagination';
import { api } from '@/lib/api';
import { CareTeamMemberCreateModal } from '../components/CareTeamMemberCreateModal';
import { CareTeamMemberViewModal } from '../components/CareTeamMemberViewModal';
import { CareTeamMemberEditModal } from '../components/CareTeamMemberEditModal';

export const CareTeamsPage: React.FC = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'teams' | 'members'>('teams');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [teamFilter, setTeamFilter] = useState<string>('All');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [viewMember, setViewMember] = useState<any | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [editMember, setEditMember] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

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

  const distinctTeams: string[] = Array.from(
    new Set<string>(
      members
        .map((m: any) => (m.teamName as string) || 'General Care Team')
        .filter((t: string): boolean => Boolean(t))
    )
  );

  const filteredMembers = members.filter((member: any) => {
    const roleObj = formatRole(member.role);
    const statusObj = formatStatus(member.status);
    const memberTeam = member.teamName || 'General Care Team';

    const matchesSearch =
      (member.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.memberIdCode || member.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.teamName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.specialty || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.department || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTeam = teamFilter === 'All' || memberTeam.toLowerCase() === teamFilter.toLowerCase();
    const matchesRole = roleFilter === 'All' || roleObj.label.toLowerCase().replace(/\s+/g, '') === roleFilter.toLowerCase().replace(/\s+/g, '');
    const matchesStatus = statusFilter === 'All' || statusObj.label.toLowerCase().replace(/\s+/g, '') === statusFilter.toLowerCase().replace(/\s+/g, '');

    return matchesSearch && matchesTeam && matchesRole && matchesStatus;
  });

  // Group members by Care Team
  const groupedTeams = distinctTeams.map((teamName) => {
    const teamMembers = filteredMembers.filter((m) => (m.teamName || 'General Care Team') === teamName);
    const doctorsCount = teamMembers.filter((m) => formatRole(m.role).label === 'Doctor').length;
    const nursesCount = teamMembers.filter((m) => formatRole(m.role).label === 'Nurse').length;
    const alliedCount = teamMembers.filter((m) => formatRole(m.role).label === 'Allied Health' || formatRole(m.role).label === 'Support Staff').length;
    const department = teamMembers[0]?.department || 'Multi-Disciplinary';
    const location = teamMembers[0]?.location || 'Main Campus';

    return {
      teamName,
      department,
      location,
      members: teamMembers,
      totalMembers: teamMembers.length,
      doctorsCount,
      nursesCount,
      alliedCount,
    };
  }).filter((team) => team.members.length > 0 || teamFilter === 'All');

  const totalPages = Math.ceil(filteredMembers.length / pageSize) || 1;
  const paginatedMembers = filteredMembers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto select-none font-sans text-slate-800">
      <PageHeader
        title="Care Teams"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Care Teams' },
        ]}
        actions={
          <div className="flex items-center gap-3">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('teams')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'teams'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Care Teams ({distinctTeams.length})
              </button>
              <button
                onClick={() => setViewMode('members')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'members'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <List className="h-3.5 w-3.5" /> All Members ({members.length})
              </button>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[3]" /> Add Team Member
            </button>
          </div>
        }
      />

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { title: 'Total Members', value: members.length.toString(), change: 'Registered Staff', icon: Users, bg: 'bg-blue-100 text-blue-600' },
          { title: 'Care Teams', value: distinctTeams.length.toString(), change: 'Clinical Teams', icon: Shield, bg: 'bg-indigo-100 text-indigo-600' },
          { title: 'Doctors', value: members.filter((m: any) => formatRole(m.role).label === 'Doctor').length.toString(), change: 'Physicians', icon: Stethoscope, bg: 'bg-emerald-100 text-emerald-600' },
          { title: 'Nurses', value: members.filter((m: any) => formatRole(m.role).label === 'Nurse').length.toString(), change: 'Staff Nurses', icon: UserCheck, bg: 'bg-purple-100 text-purple-600' },
          { title: 'Allied Health', value: members.filter((m: any) => formatRole(m.role).label === 'Allied Health').length.toString(), change: 'Support Care', icon: HeartPulse, bg: 'bg-amber-100 text-amber-600' },
          { title: 'Active Today', value: members.filter((m: any) => formatStatus(m.status).label === 'Active').length.toString(), change: 'On Duty', icon: Calendar, bg: 'bg-teal-100 text-teal-600' },
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
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search member, team, specialty..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Team Filter */}
          <select
            value={teamFilter}
            onChange={(e) => {
              setTeamFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <option value="All">All Care Teams</option>
            {distinctTeams.map((t: string) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <option value="All">All Roles</option>
            <option value="Doctor">Doctor</option>
            <option value="Nurse">Nurse</option>
            <option value="AlliedHealth">Allied Health</option>
            <option value="SupportStaff">Support Staff</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="OnLeave">On Leave</option>
            <option value="Inactive">Inactive</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setTeamFilter('All');
              setRoleFilter('All');
              setStatusFilter('All');
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      {/* VIEW 1: GROUPED CARE TEAMS VIEW */}
      {viewMode === 'teams' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupedTeams.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200 p-8">
              <Shield className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Care Teams Found</h3>
              <p className="text-xs text-slate-400 mt-1">No care teams match your current search/filter criteria.</p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add Team Member
              </button>
            </div>
          ) : (
            groupedTeams.map((team, tIdx) => (
              <div
                key={`team-${tIdx}`}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Team Card Header */}
                <div className="p-5 border-b border-slate-100 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0 border border-indigo-100">
                        <Shield className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900 leading-tight">{team.teamName}</h3>
                        <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                          <Building2 className="h-3 w-3 inline text-slate-400" /> {team.department}
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[11px] font-extrabold rounded-lg border border-indigo-100 shrink-0">
                      {team.totalMembers} {team.totalMembers === 1 ? 'Member' : 'Members'}
                    </span>
                  </div>

                  {/* Role Distribution Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {team.doctorsCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md border border-emerald-100">
                        <Stethoscope className="h-3 w-3" /> {team.doctorsCount} {team.doctorsCount === 1 ? 'Doctor' : 'Doctors'}
                      </span>
                    )}
                    {team.nursesCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-md border border-purple-100">
                        <UserCheck className="h-3 w-3" /> {team.nursesCount} {team.nursesCount === 1 ? 'Nurse' : 'Nurses'}
                      </span>
                    )}
                    {team.alliedCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-md border border-amber-100">
                        <HeartPulse className="h-3 w-3" /> {team.alliedCount} Allied Care
                      </span>
                    )}
                  </div>
                </div>

                {/* Team Members List */}
                <div className="p-5 space-y-3 flex-1 bg-slate-50/50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Practitioners ({team.members.length})</p>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {team.members.map((member: any) => {
                      const roleObj = formatRole(member.role);
                      const statusObj = formatStatus(member.status);

                      return (
                        <div
                          key={member.id || member.memberIdCode}
                          className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {member.avatar ? (
                              <img src={member.avatar} alt={member.name} className="h-8 w-8 rounded-full object-cover shrink-0 border border-slate-200" />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0 border border-blue-200">
                                {member.name ? member.name.replace('Dr. ', '').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'CT'}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-bold text-slate-900 truncate">{member.name}</p>
                                <Badge variant={statusObj.variant}>{statusObj.label}</Badge>
                              </div>
                              <p className="text-[10px] text-slate-500 font-medium truncate">
                                {member.specialty || member.department} • <span className="font-semibold text-slate-700">{roleObj.label}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleViewMember(member)}
                              className="p-1 text-slate-400 hover:text-blue-600 rounded-lg cursor-pointer"
                              title="View practitioner profile"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleEditMember(member)}
                              className="p-1 text-slate-400 hover:text-blue-600 rounded-lg cursor-pointer"
                              title="Edit practitioner"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Team Card Footer */}
                <div className="p-3.5 bg-white border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">{team.location}</span>
                  <button
                    onClick={() => {
                      setTeamFilter(team.teamName);
                      setViewMode('members');
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    View Roster <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* VIEW 2: FLAT MEMBERS TABLE VIEW */
        <div className="bg-white rounded-xl border border-slate-200 card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3">Member</th>
                  <th className="p-3">Care Team Name</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Department / Specialty</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Shift / Schedule</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedMembers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
                      <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-slate-700">No Care Team Members Found</p>
                      <p className="text-xs text-slate-400 mt-1">
                        No team members currently exist matching filter criteria.
                      </p>
                      <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        <Plus className="h-4 w-4" /> Add Team Member
                      </button>
                    </td>
                  </tr>
                ) : (
                  paginatedMembers.map((member: any) => {
                    const roleObj = formatRole(member.role);
                    const statusObj = formatStatus(member.status);
                    const teamName = member.teamName || 'General Care Team';

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
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100/80">
                            <Shield className="h-3 w-3 text-indigo-500" />
                            {teamName}
                          </span>
                        </td>
                        <td className="p-3">
                          <Badge variant={roleObj.variant}>
                            {roleObj.label}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <p className="font-semibold text-slate-800">{member.department || 'General Care'}</p>
                          {member.specialty && (
                            <p className="text-[10px] text-slate-500 font-medium">{member.specialty}</p>
                          )}
                        </td>
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
                              className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg cursor-pointer"
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditMember(member)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg cursor-pointer"
                              title="Edit member"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMember(member.id, member.name)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
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

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalResults={filteredMembers.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            itemLabel="results"
          />
        </div>
      )}

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

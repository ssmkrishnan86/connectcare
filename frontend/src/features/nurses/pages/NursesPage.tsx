import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCog,
  CheckCircle2,
  UserCheck,
  UserX,
  Building2,
  Award,
  Search,
  Plus,
  Eye,
  Edit2,
  SlidersHorizontal,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/common/Pagination';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import { NurseCreateModal } from '../components/NurseCreateModal';

export const NursesPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const [nurses, setNurses] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalNurses: 0,
    active: 0,
    onLeave: 0,
    inactive: 0,
    departments: 0,
    certificationsDue: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [unitFilter, setUnitFilter] = useState('All');
  const [shiftFilter, setShiftFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchNurses = () => {
    api.getNurses(searchTerm)
      .then((data) => setNurses(data || []))
      .catch(console.error);

    api.getNurseStats()
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(console.error);
  };

  const handleDeleteNurse = async (id: string, name: string) => {
    const confirmed = await confirm({
      title: 'Remove Nurse',
      message: `Are you sure you want to remove nurse "${name}"?`,
      confirmText: 'Remove Nurse',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      await api.deleteNurse(id);
      toast.success(`Nurse "${name}" removed successfully.`);
      fetchNurses();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to remove nurse profile.');
    }
  };

  useEffect(() => {
    fetchNurses();
  }, [searchTerm]);

  const filteredNurses = nurses.filter((nurse) => {
    const matchesDept = departmentFilter === 'All' || (nurse.department || '').toLowerCase().includes(departmentFilter.toLowerCase());
    const matchesUnit = unitFilter === 'All' || (nurse.location || nurse.subUnit || '').toLowerCase().includes(unitFilter.toLowerCase());
    const matchesShift = shiftFilter === 'All' || (nurse.shift || '').toLowerCase().includes(shiftFilter.toLowerCase());

    let matchesStatus = true;
    if (statusFilter !== 'All') {
      const statusStr = nurse.status === 0 || nurse.status === 'Active' ? 'Active' : nurse.status === 1 || nurse.status === 'OnLeave' ? 'OnLeave' : 'Inactive';
      matchesStatus = statusStr.toLowerCase() === statusFilter.toLowerCase();
    }
    return matchesDept && matchesUnit && matchesShift && matchesStatus;
  });

  const getShiftBadge = (shiftStr: string) => {
    if (shiftStr.includes('Night')) {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/60 flex flex-col">
          <span className="font-bold">{shiftStr.split('(')[0]}</span>
          <span className="text-[9px] text-purple-500">{shiftStr.includes('(') ? shiftStr.split('(')[1].replace(')', '') : ''}</span>
        </span>
      );
    }
    if (shiftStr.includes('Evening')) {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 flex flex-col">
          <span className="font-bold">{shiftStr.split('(')[0]}</span>
          <span className="text-[9px] text-amber-500">{shiftStr.includes('(') ? shiftStr.split('(')[1].replace(')', '') : ''}</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 flex flex-col">
        <span className="font-bold">{shiftStr.split('(')[0]}</span>
        <span className="text-[9px] text-blue-500">{shiftStr.includes('(') ? shiftStr.split('(')[1].replace(')', '') : ''}</span>
      </span>
    );
  };

  const getStatusBadge = (statusVal: any) => {
    if (statusVal === 0 || statusVal === 'Active') return <Badge variant="active">Active</Badge>;
    if (statusVal === 1 || statusVal === 'OnLeave' || statusVal === 'On Leave') return <Badge variant="on-leave">On Leave</Badge>;
    return <Badge variant="inactive">Inactive</Badge>;
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Nurses"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Nurses' },
        ]}
        actions={
          <button
            onClick={() => navigate('/nurses/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Nurse
          </button>
        }
      />

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { title: 'Total Nurses', value: (stats.totalNurses ?? nurses.length ?? 0).toString(), change: 'Active nurses', changeType: 'green', icon: UserCog, bg: 'bg-blue-100 text-blue-600' },
          { title: 'Active', value: (stats.active ?? 0).toString(), change: 'Active staff', changeType: 'green', icon: CheckCircle2, bg: 'bg-emerald-100 text-emerald-600' },
          { title: 'On Leave', value: (stats.onLeave ?? 0).toString(), change: 'On Leave', changeType: 'red', icon: UserCheck, bg: 'bg-amber-100 text-amber-600' },
          { title: 'Inactive', value: (stats.inactive ?? 0).toString(), change: 'Inactive', changeType: 'gray', icon: UserX, bg: 'bg-indigo-100 text-indigo-600' },
          { title: 'Departments', value: (stats.departments ?? 0).toString(), change: 'Departments', changeType: 'link', icon: Building2, bg: 'bg-cyan-100 text-cyan-600' },
          { title: 'Certifications Due', value: (stats.certificationsDue ?? 0).toString(), change: 'Certifications', changeType: 'link', icon: Award, bg: 'bg-pink-100 text-pink-600' },
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
            <p className={`mt-2 text-[11px] font-semibold flex items-center ${
              stat.changeType === 'green' ? 'text-emerald-600' :
              stat.changeType === 'red' ? 'text-rose-600' :
              stat.changeType === 'link' ? 'text-blue-600 cursor-pointer hover:underline' : 'text-slate-500'
            }`}>
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">

        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search nurse by name, email or phone..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex flex-col text-[10px] text-slate-400">
            <span>Department</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
            >
              <option value="All">All Departments</option>
              <option value="Emergency">Emergency Care</option>
              <option value="Med-Surg">Med-Surg</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="ICU">ICU</option>
              <option value="Geriatrics">Geriatrics</option>
            </select>
          </div>

          <div className="flex flex-col text-[10px] text-slate-400">
            <span>Unit / Location</span>
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
            >
              <option value="All">All Units</option>
              <option value="ER Unit">ER Unit</option>
              <option value="Med-Surg Unit 1">Med-Surg Unit 1</option>
              <option value="Pediatrics Unit">Pediatrics Unit</option>
              <option value="ICU">ICU Unit</option>
            </select>
          </div>

          <div className="flex flex-col text-[10px] text-slate-400">
            <span>Shift</span>
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
            >
              <option value="All">All Shifts</option>
              <option value="Day">Day Shift</option>
              <option value="Evening">Evening Shift</option>
              <option value="Night">Night Shift</option>
            </select>
          </div>

          <div className="flex flex-col text-[10px] text-slate-400">
            <span>Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="OnLeave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-3">
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-600">
              <SlidersHorizontal className="h-3.5 w-3.5" /> More Filters
            </button>
            <button
              onClick={() => {
                setSearchTerm('');
                setDepartmentFilter('All');
                setUnitFilter('All');
                setShiftFilter('All');
                setStatusFilter('All');
              }}
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-600"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Clear
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-3">Nurse</th>
                <th className="p-3">Department / Unit</th>
                <th className="p-3">Location</th>
                <th className="p-3">Shift</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Status</th>
                <th className="p-3">Experience</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredNurses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <UserCog className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-700">No Nurses Found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      No nurse records currently match your filter criteria. Click "Add Nurse" to register a new nurse.
                    </p>
                    <button
                      onClick={() => navigate('/nurses/new')}
                      className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                    >
                      <Plus className="h-4 w-4" /> Add Nurse
                    </button>
                  </td>
                </tr>
              ) : (
                filteredNurses.map((nurse) => (
                  <tr key={nurse.id || nurse.nurseIdCode} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {nurse.avatar ? (
                          <img src={nurse.avatar} alt={nurse.name} className="h-9 w-9 rounded-full object-cover shrink-0 border border-slate-200" />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-200">
                            {nurse.name ? nurse.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'RN'}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{nurse.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{nurse.nurseIdCode || nurse.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-slate-800">{nurse.department}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{nurse.subUnit || nurse.assignedUnit}</p>
                    </td>
                    <td className="p-3 font-semibold text-slate-800">{nurse.location}</td>
                    <td className="p-3">
                      {getShiftBadge(nurse.shift || 'Day Shift (08:00 AM - 04:00 PM)')}
                    </td>
                    <td className="p-3">
                      <p className="font-mono text-slate-800 font-medium">{nurse.phone}</p>
                      <p className="text-[10px] text-blue-600">{nurse.email}</p>
                    </td>
                    <td className="p-3">
                      {getStatusBadge(nurse.status)}
                    </td>
                    <td className="p-3 font-semibold text-slate-800">{nurse.experience || '5 Years'}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/nurses/${nurse.id}`)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Nurse Profile"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/nurses/edit/${nurse.id}`)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Nurse"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteNurse(nurse.id, nurse.name)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Nurse"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredNurses.length / pageSize) || 1}
        totalResults={filteredNurses.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        itemLabel="nurses"
      />

      <NurseCreateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchNurses}
      />
    </div>
  );
};

export default NursesPage;

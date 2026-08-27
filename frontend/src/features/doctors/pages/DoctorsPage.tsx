import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  CheckCircle2,
  UserCheck,
  UserX,
  Video,
  Award,
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Filter,
  RotateCcw,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/common/Pagination';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';

export const DoctorsPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalDoctors: 0,
    active: 0,
    onLeave: 0,
    inactive: 0,
    teleconsultation: 0,
    specialties: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchDoctors = () => {
    api.getDoctors(searchTerm, specialtyFilter === 'All' ? undefined : specialtyFilter)
      .then((data) => setDoctors(data || []))
      .catch(console.error);

    api.getDoctorStats()
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchDoctors();
  }, [searchTerm, specialtyFilter]);

  const handleDeleteDoctor = async (id: string, name: string) => {
    const confirmed = await confirm({
      title: 'Remove Doctor',
      message: `Are you sure you want to remove doctor "${name}"?`,
      confirmText: 'Remove Doctor',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      await api.deleteDoctor(id);
      toast.success(`Doctor "${name}" removed successfully.`);
      fetchDoctors();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.data?.message || err?.message || 'Cannot delete Doctor as they are assigned to patient(s).';
      toast.error(msg);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSpecialtyFilter('All');
    setDepartmentFilter('All');
    setLocationFilter('All');
    setStatusFilter('All');
    setCurrentPage(1);
  };

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      // 1. Specialty
      if (specialtyFilter !== 'All') {
        const spec = (doc.specialty || '').toLowerCase();
        if (!spec.includes(specialtyFilter.toLowerCase())) return false;
      }

      // 2. Department
      if (departmentFilter !== 'All') {
        const dept = (doc.department || '').toLowerCase();
        if (!dept.includes(departmentFilter.toLowerCase())) return false;
      }

      // 3. Location
      if (locationFilter !== 'All') {
        const loc = (doc.location || '').toLowerCase();
        if (!loc.includes(locationFilter.toLowerCase())) return false;
      }

      // 4. Status
      if (statusFilter !== 'All') {
        const statusStr = doc.status === 0 || doc.status === 'Active' ? 'Active' : doc.status === 1 || doc.status === 'OnLeave' ? 'OnLeave' : 'Inactive';
        if (statusStr.toLowerCase() !== statusFilter.toLowerCase()) return false;
      }

      return true;
    });
  }, [doctors, specialtyFilter, departmentFilter, locationFilter, statusFilter]);

  const getStatusBadge = (statusVal: any) => {
    const s = String(statusVal).toLowerCase();
    if (s === '0' || s === 'active') return <Badge variant="active">Active</Badge>;
    if (s === '1' || s === 'onleave' || s === 'on leave') return <Badge variant="on-leave">On Leave</Badge>;
    return <Badge variant="inactive">Inactive</Badge>;
  };

  const paginatedDoctors = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDoctors.slice(start, start + pageSize);
  }, [filteredDoctors, currentPage, pageSize]);

  return (
    <div className="space-y-6 font-sans select-none text-slate-800">
      
      {/* Top Header */}
      <PageHeader
        title="Doctors"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Doctors' },
        ]}
        actions={
          <button
            onClick={() => navigate('/doctors/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Doctor
          </button>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { title: 'Total Doctors', value: (stats.totalDoctors ?? doctors.length ?? 0).toString(), change: 'Active doctors', changeType: 'green', icon: Stethoscope, bg: 'bg-blue-100 text-blue-600' },
          { title: 'Active', value: (stats.active ?? 0).toString(), change: 'Active staff', changeType: 'green', icon: CheckCircle2, bg: 'bg-emerald-100 text-emerald-600' },
          { title: 'On Leave', value: (stats.onLeave ?? 0).toString(), change: 'On Leave', changeType: 'red', icon: UserCheck, bg: 'bg-amber-100 text-amber-600' },
          { title: 'Inactive', value: (stats.inactive ?? 0).toString(), change: 'Inactive', changeType: 'gray', icon: UserX, bg: 'bg-indigo-100 text-indigo-600' },
          { title: 'Teleconsultation', value: (stats.teleconsultation ?? 0).toString(), change: 'Available', changeType: 'green', icon: Video, bg: 'bg-teal-100 text-teal-600' },
          { title: 'Specialties', value: (stats.specialties ?? 7).toString(), change: 'Clinical areas', changeType: 'green', icon: Award, bg: 'bg-purple-100 text-purple-600' },
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
              stat.changeType === 'red' ? 'text-rose-600' : 'text-slate-500'
            }`}>
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search doctor by name, ID or email..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Specialty Filter */}
            <div className="flex flex-col text-[10px] text-slate-400">
              <span className="font-bold">Specialty</span>
              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-bold cursor-pointer"
              >
                <option value="All">All Specialties</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Pulmonology">Pulmonology</option>
                <option value="Internal Medicine">Internal Medicine</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex flex-col text-[10px] text-slate-400">
              <span className="font-bold">Status</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-bold cursor-pointer"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="OnLeave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <button
              onClick={() => setShowMoreFilters(!showMoreFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-bold transition-colors cursor-pointer mt-3.5 ${
                showMoreFilters ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Filter className="h-3.5 w-3.5" />
              <span>More Filters</span>
            </button>

            {(searchTerm || specialtyFilter !== 'All' || departmentFilter !== 'All' || locationFilter !== 'All' || statusFilter !== 'All') && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors cursor-pointer mt-3.5"
                title="Clear all filters"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* More Filters Row */}
        {showMoreFilters && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-1">
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">Department</label>
              <input
                type="text"
                value={departmentFilter === 'All' ? '' : departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value || 'All')}
                placeholder="Filter by department name..."
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">Location</label>
              <input
                type="text"
                value={locationFilter === 'All' ? '' : locationFilter}
                onChange={(e) => setLocationFilter(e.target.value || 'All')}
                placeholder="Filter by practice location..."
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-3">Doctor</th>
                <th className="p-3">Specialty</th>
                <th className="p-3">Department</th>
                <th className="p-3">Location</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Status</th>
                <th className="p-3">Experience</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedDoctors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    No doctor records found matching criteria.
                  </td>
                </tr>
              ) : (
                paginatedDoctors.map((doc) => (
                  <tr key={doc.id || doc.doctorIdCode} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <div
                        onClick={() => navigate(`/doctors/${doc.id || doc.doctorIdCode}`)}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        {doc.avatar ? (
                          <img src={doc.avatar} alt={doc.name} className="h-9 w-9 rounded-full object-cover shrink-0 border border-slate-200" />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-200">
                            {doc.name ? doc.name.replace('Dr. ', '').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'DR'}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{doc.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{doc.doctorIdCode || doc.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 font-semibold text-[11px]">
                        <span>{doc.specialtyIcon || '💙'}</span> {doc.specialty}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-800">{doc.department}</td>
                    <td className="p-3 font-semibold text-slate-800">{doc.location}</td>
                    <td className="p-3">
                      <p className="font-mono text-slate-800 font-medium">{doc.phone}</p>
                      <p className="text-[10px] text-blue-600 truncate max-w-[150px]">{doc.email}</p>
                    </td>
                    <td className="p-3">
                      {getStatusBadge(doc.status)}
                    </td>
                    <td className="p-3 font-semibold text-slate-800">{doc.experience}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/doctors/${doc.id || doc.doctorIdCode}`)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="View Doctor Profile"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/doctors/edit/${doc.id || doc.doctorIdCode}`)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Doctor Profile (5 Steps)"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDoctor(doc.id, doc.name)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Doctor"
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
        totalPages={Math.ceil(filteredDoctors.length / pageSize) || 1}
        totalResults={filteredDoctors.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        itemLabel="doctors"
      />

    </div>
  );
};

export default DoctorsPage;


import React, { useState, useEffect } from 'react';
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
  SlidersHorizontal,
  RotateCcw,
  CheckCircle,
  Trash2,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/common/Pagination';
import { api } from '@/lib/api';
import { DoctorCreateModal } from '../components/DoctorCreateModal';
import { DoctorViewModal } from '../components/DoctorViewModal';
import { DoctorEditModal } from '../components/DoctorEditModal';

export const DoctorsPage: React.FC = () => {
  const navigate = useNavigate();
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewDoctor, setViewDoctor] = useState<any | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editDoctor, setEditDoctor] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchDoctors = () => {
    api.getDoctors(searchTerm, specialtyFilter)
      .then((data) => setDoctors(data || []))
      .catch(console.error);

    api.getDoctorStats()
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(console.error);
  };

  const handleViewDoctor = (doc: any) => {
    navigate(`/doctors/${doc.id}`);
  };

  const handleEditDoctor = (doc: any) => {
    navigate(`/doctors/edit/${doc.id}`);
  };

  const handleDeleteDoctor = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove doctor "${name}"?`)) return;
    try {
      await api.deleteDoctor(id);
      fetchDoctors();
    } catch (err: any) {
      alert(err?.message || 'Failed to remove doctor.');
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [searchTerm, specialtyFilter]);

  const filteredDoctors = doctors.filter((doc) => {
    const matchesDept = departmentFilter === 'All' || (doc.department || '').toLowerCase().includes(departmentFilter.toLowerCase());
    const matchesLoc = locationFilter === 'All' || (doc.location || '').toLowerCase().includes(locationFilter.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter !== 'All') {
      const statusStr = doc.status === 0 || doc.status === 'Active' ? 'Active' : doc.status === 1 || doc.status === 'OnLeave' ? 'OnLeave' : 'Inactive';
      matchesStatus = statusStr.toLowerCase() === statusFilter.toLowerCase();
    }
    return matchesDept && matchesLoc && matchesStatus;
  });

  const getStatusBadge = (statusVal: any) => {
    if (statusVal === 0 || statusVal === 'Active') return <Badge variant="active">Active</Badge>;
    if (statusVal === 1 || statusVal === 'OnLeave' || statusVal === 'On Leave') return <Badge variant="on-leave">On Leave</Badge>;
    return <Badge variant="inactive">Inactive</Badge>;
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <PageHeader
        title={
          <div className="flex items-center gap-2">
            <span>Doctors</span>
            <CheckCircle className="h-5 w-5 fill-blue-600 text-white" />
          </div>
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Doctors' },
        ]}
        actions={
          <button
            onClick={() => navigate('/doctors/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Doctor
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { title: 'Total Doctors', value: (stats.totalDoctors ?? doctors.length ?? 0).toString(), change: 'Live from DB', changeType: 'up', icon: Stethoscope, bg: 'bg-blue-100 text-blue-600' },
          { title: 'Active', value: (stats.active ?? 0).toString(), change: 'Active staff', changeType: 'green', icon: CheckCircle2, bg: 'bg-emerald-100 text-emerald-600' },
          { title: 'On Leave', value: (stats.onLeave ?? 0).toString(), change: 'On Leave', changeType: 'orange', icon: UserCheck, bg: 'bg-amber-100 text-amber-600' },
          { title: 'Inactive', value: (stats.inactive ?? 0).toString(), change: 'Inactive', changeType: 'gray', icon: UserX, bg: 'bg-indigo-100 text-indigo-600' },
          { title: 'Teleconsultation', value: (stats.teleconsultation ?? 0).toString(), change: 'Teleconsultation', changeType: 'up', icon: Video, bg: 'bg-cyan-100 text-cyan-600' },
          { title: 'Specialties', value: (stats.specialties ?? 0).toString(), change: 'Total specialties', changeType: 'neutral', icon: Award, bg: 'bg-pink-100 text-pink-600' },
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
              stat.changeType === 'up' || stat.changeType === 'green' ? 'text-emerald-600' :
              stat.changeType === 'orange' ? 'text-amber-600' : 'text-slate-500'
            }`}>
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search doctor by name, email or phone..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex flex-col text-[10px] text-slate-400">
            <span>Specialty</span>
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
            >
              <option value="All">All Specialties</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Emergency Medicine">Emergency Medicine</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Endocrinology">Endocrinology</option>
              <option value="Neurology">Neurology</option>
              <option value="Internal Medicine">Internal Medicine</option>
              <option value="Pulmonology">Pulmonology</option>
              <option value="Pediatrics">Pediatrics</option>
            </select>
          </div>

          <div className="flex flex-col text-[10px] text-slate-400">
            <span>Department / Unit</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
            >
              <option value="All">All Departments</option>
              <option value="Cardiology">Cardiology Unit</option>
              <option value="Emergency">Emergency Department</option>
              <option value="Orthopedics">Orthopedics Unit</option>
              <option value="Endocrine">Endocrine Unit</option>
            </select>
          </div>

          <div className="flex flex-col text-[10px] text-slate-400">
            <span>Location</span>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
            >
              <option value="All">All Locations</option>
              <option value="Med-Surg">Med-Surg Unit</option>
              <option value="ER">ER Unit</option>
              <option value="Ortho">Ortho Unit</option>
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
                setSpecialtyFilter('All');
                setDepartmentFilter('All');
                setLocationFilter('All');
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
                <th className="p-3">Doctor</th>
                <th className="p-3">Specialty</th>
                <th className="p-3">Department / Unit</th>
                <th className="p-3">Location</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Status</th>
                <th className="p-3">Experience</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDoctors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Stethoscope className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-700">No Doctors Found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      No doctor records currently exist. Click "Add Doctor" to register a new doctor.
                    </p>
                    <button
                      onClick={() => navigate('/doctors/new')}
                      className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                    >
                      <Plus className="h-4 w-4" /> Add Doctor
                    </button>
                  </td>
                </tr>
              ) : (
                filteredDoctors.map((doc) => (
                  <tr key={doc.id || doc.doctorIdCode} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {doc.avatar ? (
                          <img src={doc.avatar} alt={doc.name} className="h-9 w-9 rounded-full object-cover shrink-0 border border-slate-200" />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-200">
                            {doc.name ? doc.name.replace('Dr. ', '').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'DR'}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{doc.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{doc.doctorIdCode || doc.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 font-semibold text-xs">
                        <span>{doc.specialtyIcon || '💙'}</span> {doc.specialty}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-800">{doc.department}</td>
                    <td className="p-3">
                      <p className="font-semibold text-slate-800">{doc.location?.split('(')[0] || doc.location}</p>
                      <p className="text-[10px] text-slate-400">{doc.location?.includes('(') ? doc.location.split('(')[1].replace(')', '') : 'Main Floor'}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-mono text-slate-800 font-medium">{doc.phone}</p>
                      <p className="text-[10px] text-blue-600">{doc.email}</p>
                    </td>
                    <td className="p-3">
                      {getStatusBadge(doc.status)}
                    </td>
                    <td className="p-3 font-semibold text-slate-800">{doc.experience || '10 Years'}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleViewDoctor(doc)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Profile"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditDoctor(doc)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDoctor(doc.id, doc.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="Remove Doctor"
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

      <DoctorCreateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchDoctors}
      />

      <DoctorViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewDoctor(null);
        }}
        doctor={viewDoctor}
      />

      <DoctorEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditDoctor(null);
        }}
        onSuccess={fetchDoctors}
        doctor={editDoctor}
      />
    </div>
  );
};

export default DoctorsPage;

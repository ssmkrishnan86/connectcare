import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  Bed,
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
import { usePermission } from '@/context/PermissionContext';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import { LocationUnitCreateModal } from '../components/LocationUnitCreateModal';

export const LocationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { can } = usePermission();
  const toast = useToast();
  const confirm = useConfirm();
  const [locations, setLocations] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalLocations: 0,
    active: 0,
    inactive: 0,
    totalUnits: 0,
    totalBeds: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [facilityFilter, setFacilityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchLocations = () => {
    api.getLocations(searchTerm)
      .then((data) => setLocations(data || []))
      .catch(console.error);

    api.getLocationStats()
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(console.error);
  };

  const handleDeleteLocation = async (id: string, name: string) => {
    const confirmed = await confirm({
      title: 'Remove Location',
      message: `Are you sure you want to remove location "${name}"?`,
      confirmText: 'Remove Location',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      await api.deleteLocation(id);
      toast.success(`Location "${name}" removed successfully.`);
      fetchLocations();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to remove location.');
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [searchTerm]);

  const filteredLocations = locations.filter((loc) => {
    const matchesFacility = facilityFilter === 'All' || (loc.facility || '').toLowerCase().includes(facilityFilter.toLowerCase());
    const matchesType = typeFilter === 'All' || (loc.type || '').toLowerCase() === typeFilter.toLowerCase();
    
    let matchesStatus = true;
    if (statusFilter !== 'All') {
      const statusStr = loc.status === 0 || loc.status === 'Active' ? 'Active' : 'Inactive';
      matchesStatus = statusStr.toLowerCase() === statusFilter.toLowerCase();
    }

    return matchesFacility && matchesType && matchesStatus;
  });

  const getTypeBadge = (typeStr: string) => {
    switch (typeStr?.toLowerCase()) {
      case 'hospital':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">Hospital</span>;
      case 'wing':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">Wing</span>;
      case 'block':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">Block</span>;
      case 'specialty center': case 'specialtycenter':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200">Specialty Center</span>;
      case 'center':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Center</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-100 text-pink-800 border border-pink-200">Clinic</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <PageHeader
        title="Locations & Units"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Locations' },
        ]}
        actions={
          can('Locations', 'create') ? (
            <button
              onClick={() => navigate('/locations/new')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-colors"
            >
              <Plus className="h-4 w-4" /> Add Location / Unit
            </button>
          ) : undefined
        }
      />

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { title: 'Total Locations', value: (stats.totalLocations ?? locations.length ?? 0).toString(), subtext: 'Operational care units', icon: Building2, bg: 'bg-purple-100 text-purple-600' },
          { title: 'Active', value: (stats.active ?? 0).toString(), subtext: 'Active units', icon: CheckCircle2, bg: 'bg-emerald-100 text-emerald-600' },
          { title: 'Inactive', value: (stats.inactive ?? 0).toString(), subtext: 'Inactive units', icon: XCircle, bg: 'bg-amber-100 text-amber-600' },
          { title: 'Units / Departments', value: (stats.totalUnits ?? 0).toString(), subtext: 'Across all locations', icon: LayoutGrid, bg: 'bg-blue-100 text-blue-600' },
          { title: 'Beds', value: (stats.totalBeds ?? 0).toString(), subtext: 'Total capacity', icon: Bed, bg: 'bg-pink-100 text-pink-600' },
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
            <p className="mt-2 text-[11px] font-medium text-slate-400">
              {stat.subtext}
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
            placeholder="Search location by name or code..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex flex-col text-[10px] text-slate-400">
            <span>Facility</span>
            <select
              value={facilityFilter}
              onChange={(e) => setFacilityFilter(e.target.value)}
              className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
            >
              <option value="All">All Facilities</option>
              <option value="Connected Care Hospital">Connected Care Hospital</option>
              <option value="Connected Care Clinic">Connected Care Clinic</option>
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
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex flex-col text-[10px] text-slate-400">
            <span>Type</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
            >
              <option value="All">All Types</option>
              <option value="Hospital">Hospital</option>
              <option value="Wing">Wing</option>
              <option value="Block">Block</option>
              <option value="Specialty Center">Specialty Center</option>
              <option value="Center">Center</option>
              <option value="Clinic">Clinic</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-3">
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-600">
              <SlidersHorizontal className="h-3.5 w-3.5" /> More Filters
            </button>
            <button
              onClick={() => {
                setSearchTerm('');
                setFacilityFilter('All');
                setStatusFilter('All');
                setTypeFilter('All');
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
                <th className="p-3">Location / Unit</th>
                <th className="p-3">Type</th>
                <th className="p-3">Facility</th>
                <th className="p-3">Units / Departments</th>
                <th className="p-3">Beds</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLocations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Building2 className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-700">No Locations Found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      No location records currently exist. Click "Add Location / Unit" to create a new location.
                    </p>
                    <button
                      onClick={() => navigate('/locations/new')}
                      className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                    >
                      <Plus className="h-4 w-4" /> Add Location / Unit
                    </button>
                  </td>
                </tr>
              ) : (
                filteredLocations.map((loc) => (
                  <tr key={loc.id || loc.code} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {loc.avatar ? (
                          <img src={loc.avatar} alt={loc.name} className="h-10 w-10 rounded-xl object-cover shrink-0 border border-slate-200" />
                        ) : (
                          <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-200">
                            <Building2 className="h-5 w-5 text-blue-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{loc.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{loc.code || loc.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      {getTypeBadge(loc.type)}
                    </td>
                    <td className="p-3">
                      <p className="font-semibold text-slate-800">{loc.facility}</p>
                      <p className="text-[10px] text-slate-400">{loc.facilityLocation}</p>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <span>{loc.unitsCount || 1}</span>
                        <button className="text-[11px] text-blue-600 hover:underline font-semibold">View units</button>
                      </div>
                    </td>
                    <td className="p-3 font-bold text-slate-800">{loc.beds || 30}</td>
                    <td className="p-3">
                      <Badge variant={loc.status === 0 || loc.status === 'Active' ? 'active' : 'inactive'}>
                        {loc.status === 0 || loc.status === 'Active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/locations/${loc.id}`)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {can('Locations', 'update') && (
                          <button
                            onClick={() => navigate(`/locations/edit/${loc.id}`)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Location"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        )}
                        {can('Locations', 'delete') && (
                          <button
                            onClick={() => handleDeleteLocation(loc.id, loc.name)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Location"
                          >
                            <Trash2 className="h-4 w-4" />
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
      </div>

      {/* Pagination Footer */}
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredLocations.length / pageSize) || 1}
        totalResults={filteredLocations.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        itemLabel="locations"
      />

      <LocationUnitCreateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchLocations}
      />
    </div>
  );
};

export default LocationsPage;

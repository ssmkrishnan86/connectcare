import React, { useState, useEffect } from 'react';
import {
  Building2,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  Bed,
  Search,
  Download,
  Upload,
  Plus,
  Eye,
  Edit2,
  MoreVertical,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/common/Pagination';
import { api } from '@/lib/api';
import { LocationUnitCreateModal } from '../components/LocationUnitCreateModal';

export const LocationsPage: React.FC = () => {
  const [locations, setLocations] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalLocations: 18,
    active: 16,
    inactive: 2,
    totalUnits: 42,
    totalBeds: 425,
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
      {/* Page Header */}
      <PageHeader
        title="Locations / Units"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Locations / Units' },
        ]}
        actions={
          <>
            <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-colors">
              <Download className="h-4 w-4" /> Export
            </button>
            <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-colors">
              <Upload className="h-4 w-4" /> Import
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-colors"
            >
              <Plus className="h-4 w-4" /> Add Location / Unit
            </button>
          </>
        }
      />

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { title: 'Total Locations', value: (stats.totalLocations || locations.length || 18).toString(), subtext: 'Across 5 facilities', icon: Building2, bg: 'bg-purple-100 text-purple-600' },
          { title: 'Active', value: (stats.active || 16).toString(), subtext: '88.9% of total', icon: CheckCircle2, bg: 'bg-emerald-100 text-emerald-600' },
          { title: 'Inactive', value: (stats.inactive || 2).toString(), subtext: '11.1% of total', icon: XCircle, bg: 'bg-amber-100 text-amber-600' },
          { title: 'Units / Departments', value: (stats.totalUnits || 42).toString(), subtext: 'Across all locations', icon: LayoutGrid, bg: 'bg-blue-100 text-blue-600' },
          { title: 'Beds', value: (stats.totalBeds || 425).toString(), subtext: 'Total capacity', icon: Bed, bg: 'bg-pink-100 text-pink-600' },
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
              {filteredLocations.map((loc) => (
                <tr key={loc.id || loc.code} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={loc.avatar || "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=150&auto=format&fit=crop&q=80"} alt={loc.name} className="h-10 w-10 rounded-xl object-cover shrink-0 border border-slate-200" />
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
                      <span>{loc.unitsCount || 18}</span>
                      <button className="text-[11px] text-blue-600 hover:underline font-semibold">View units</button>
                    </div>
                  </td>
                  <td className="p-3 font-bold text-slate-800">{loc.beds || 220}</td>
                  <td className="p-3">
                    <Badge variant={loc.status === 0 || loc.status === 'Active' ? 'active' : 'inactive'}>
                      {loc.status === 0 || loc.status === 'Active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <Pagination
        currentPage={currentPage}
        totalPages={9}
        totalResults={18}
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

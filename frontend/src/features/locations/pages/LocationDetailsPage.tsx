import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Edit2,
  Printer,
  ChevronLeft,
  Users,
  Loader2,
  Bed,
  LayoutGrid,
  AlertTriangle,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';

export const LocationDetailsPage: React.FC = () => {
  const { locationId } = useParams<{ locationId: string }>();
  const navigate = useNavigate();

  const [location, setLocation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    if (locationId) {
      setIsLoading(true);
      api.getLocationById(locationId)
        .then((locData) => {
          setLocation(locData);
        })
        .catch((err) => console.error('Failed to load location profile:', err))
        .finally(() => setIsLoading(false));
    }
  }, [locationId]);

  const getTypeBadge = (typeStr: string) => {
    switch (typeStr?.toLowerCase()) {
      case 'hospital':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">Hospital</span>;
      case 'wing':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">Wing</span>;
      case 'block':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">Block</span>;
      case 'specialty center': case 'specialtycenter':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">Specialty Center</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Clinic</span>;
    }
  };

  const getPriorityBadge = (priorityVal: any) => {
    if (priorityVal === 3 || priorityVal === 'Critical') return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">Critical Priority</span>;
    if (priorityVal === 2 || priorityVal === 'High') return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">High Priority</span>;
    if (priorityVal === 1 || priorityVal === 'Medium') return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Medium Priority</span>;
    return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">Low Priority</span>;
  };

  if (isLoading) {
    return (
      <div className="min-h-[450px] flex items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-600 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <Loader2 className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin text-blue-600" />
          <span>Loading Complete Location Profile...</span>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 text-center font-sans space-y-4 shadow-sm">
        <Building2 className="h-12 w-12 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Location Not Found</h2>
        <p className="text-xs text-slate-500">The requested location unit could not be found or has been removed.</p>
        <button
          onClick={() => navigate('/locations')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors inline-flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" /> Return to Locations Directory
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'Overview', label: 'Overview & Capacity' },
    { id: 'Priority', label: 'Operational & Priority' },
    { id: 'Rooms', label: 'Sub-Units & Rooms' },
    { id: 'Staff', label: 'Assigned Staff & Logs' },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans pb-12">
      {/* Header */}
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <span>{location.name}</span>
            <Badge variant={location.status === 0 || location.status === 'Active' ? 'active' : 'inactive'}>
              {location.status === 0 || location.status === 'Active' ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Locations / Units', href: '/locations' },
          { label: location.name },
        ]}
        actions={
          <>
            <button
              onClick={() => navigate('/locations')}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> Back to Directory
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              <Printer className="h-4 w-4" /> Print Profile
            </button>
            <button
              onClick={() => navigate(`/locations/edit/${location.id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-colors"
            >
              <Edit2 className="h-4 w-4" /> Edit Location Profile
            </button>
          </>
        }
      />

      {/* Top Profile Summary Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-6">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6">
          {/* Left Avatar & Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            {location.avatar ? (
              <img
                src={location.avatar}
                alt={location.name}
                className="h-24 w-24 rounded-2xl object-cover border-4 border-blue-50 shadow-md shrink-0"
              />
            ) : (
              <div className="h-24 w-24 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-2xl border-4 border-blue-50 shadow-md shrink-0">
                <Building2 className="h-10 w-10 text-blue-600" />
              </div>
            )}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl font-bold text-slate-900">{location.name}</h1>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                  {location.code || location.id}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
                {getTypeBadge(location.type)}
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" /> {location.facility || 'Connected Care Hospital'}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" /> {location.facilityLocation || 'Austin, TX'}
                </span>
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" /> Floor: {location.floor || '1st Floor - 104'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
              <p className="text-[10px] text-slate-400 font-medium">Total Bed Capacity</p>
              <h3 className="text-xl font-bold text-blue-700 mt-0.5">{location.beds || 30} Beds</h3>
              <p className="text-[10px] text-slate-500 mt-1">{location.capacity || '30 Beds'}</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
              <p className="text-[10px] text-slate-400 font-medium">Occupied Beds</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">{location.occupied || '24 Beds'}</h3>
              <p className="text-[10px] text-emerald-600 font-semibold mt-1">Occupancy {location.occupancyRate || '80%'}</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
              <p className="text-[10px] text-slate-400 font-medium">Sub-Units / Depts</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">{location.unitsCount || 12} Units</h3>
              <p className="text-[10px] text-purple-600 font-semibold mt-1">Care Departments</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
              <p className="text-[10px] text-slate-400 font-medium">Attention Level</p>
              <div className="mt-1.5 flex justify-center">{getPriorityBadge(location.attentionPriority)}</div>
              <p className="text-[10px] text-slate-400 font-medium mt-1">Monitoring Status</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-2 overflow-x-auto">
        <div className="flex items-center min-w-max gap-2">
          {tabs.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT SECTIONS */}

      {/* TAB 1: OVERVIEW & CAPACITY */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" /> Facility & Location Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium">Unit Name</p>
                <p className="font-bold text-slate-900 mt-0.5">{location.name}</p>
              </div>
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium">Unit Code</p>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{location.code}</p>
              </div>
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium">Facility Name</p>
                <p className="font-bold text-slate-900 mt-0.5">{location.facility}</p>
              </div>
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium">Facility City / Location</p>
                <p className="font-bold text-slate-900 mt-0.5">{location.facilityLocation}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Bed className="h-4 w-4 text-blue-600" /> Bed Occupancy & Capacity Metrics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium">Total Beds</p>
                <p className="font-bold text-blue-700 mt-0.5">{location.beds} Beds</p>
              </div>
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium">Occupied Beds</p>
                <p className="font-bold text-slate-900 mt-0.5">{location.occupied || '0 Beds'}</p>
              </div>
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium">Occupancy Rate</p>
                <p className="font-bold text-emerald-600 mt-0.5">{location.occupancyRate || '0%'}</p>
              </div>
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium">Sub-Units Count</p>
                <p className="font-bold text-purple-700 mt-0.5">{location.unitsCount || 1} Units</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OPERATIONAL & PRIORITY */}
      {activeTab === 'Priority' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-blue-600" /> Attention Priority & Operational Status
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="font-bold text-slate-900">Operational Status</p>
                  <p className="text-[11px] text-slate-400">Current active ward status</p>
                </div>
                <Badge variant={location.status === 0 || location.status === 'Active' ? 'active' : 'inactive'}>
                  {location.status === 0 || location.status === 'Active' ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="font-bold text-slate-900">Attention Priority Level</p>
                  <p className="text-[11px] text-slate-400">Telemetry & alert escalation level</p>
                </div>
                {getPriorityBadge(location.attentionPriority)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SUB-UNITS & ROOMS */}
      {activeTab === 'Rooms' && (
        <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-blue-600" /> Sub-Units & Care Wards
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="font-bold text-slate-900">Ward A (Rooms 101 - 110)</p>
              <p className="text-slate-500">10 Beds • 8 Occupied</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="font-bold text-slate-900">Ward B (Rooms 111 - 120)</p>
              <p className="text-slate-500">10 Beds • 7 Occupied</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="font-bold text-slate-900">ICU Telemetry Bay</p>
              <p className="text-slate-500">10 Beds • 9 Occupied</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ASSIGNED STAFF & LOGS */}
      {activeTab === 'Staff' && (
        <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" /> Assigned Clinical Staff
          </h3>
          <p className="text-xs text-slate-500">Staff members currently assigned to duty shift in this location unit.</p>
          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-xs font-semibold text-blue-900">
            Care Team assigned to {location.name}: Duty Shift Active
          </div>
        </div>
      )}
    </div>
  );
};

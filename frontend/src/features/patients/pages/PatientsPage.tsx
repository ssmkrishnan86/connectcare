import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/context/AuthContext';
import { usePermission } from '@/context/PermissionContext';
import { Pagination } from '@/components/common/Pagination';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import {
  Search,
  Calendar,
  Users,
  UserCheck,
  Bed,
  Home,
  UserMinus,
  Plus,
  Eye,
  Edit2,
  Trash2,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Filter,
  RotateCcw,
} from 'lucide-react';
import { DataImportExportToolbar } from '@/components/common/DataImportExportToolbar';


export const PatientsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { can } = usePermission();
  const toast = useToast();
  const confirm = useConfirm();

  const isNurse = user?.role?.toLowerCase() === 'nurse';
  const isDoctor = user?.role?.toLowerCase() === 'doctor';

  const [patients, setPatients] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    allPatients: 0,
    inCare: 0,
    admitted: 0,
    discharged: 0,
    inactive: 0,
    newThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [tableSearch, setTableSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [unitFilter, setUnitFilter] = useState('All Units');
  const [doctorFilter, setDoctorFilter] = useState('All Doctors');
  const [riskFilter, setRiskFilter] = useState('All Risk Levels');
  const [ageGroupFilter, setAgeGroupFilter] = useState('All Age Groups');
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const [doctors, setDoctors] = useState<any[]>([]);
  const [careUnits, setCareUnits] = useState<any[]>([]);

  // Selection State for Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openActionRowId, setOpenActionRowId] = useState<string | null>(null);

  // Sorting State
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const getPatientAge = (p: any): number => {
    if (p.dob) {
      const birthDate = new Date(p.dob);
      if (!isNaN(birthDate.getTime())) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age >= 0 ? age : 65;
      }
    }
    if (p.ageGender) {
      const match = p.ageGender.match(/(\d+)/);
      if (match) return parseInt(match[1], 10);
    }
    return 65;
  };

  const fetchPatientsData = async () => {
    setLoading(true);
    try {
      const [listRes, statsRes, docsRes, locsRes] = await Promise.all([
        api.getPatients(undefined, undefined, undefined, user?.doctorId, user?.nurseId),
        api.getPatientStats(user?.doctorId, user?.nurseId),
        api.getDoctors(),
        api.getLocations(),
      ]);

      const rawList = Array.isArray(listRes) ? listRes : (listRes as any)?.data || [];
      setPatients(rawList);

      const rawStats = (statsRes as any)?.data || statsRes;
      if (rawStats) {
        setStats(rawStats);
      }

      if (docsRes) setDoctors(docsRes);
      if (locsRes) setCareUnits(locsRes);
    } catch (err) {
      console.error('Failed to load patient records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientsData();
  }, [user]);

  // Bulk Selection Handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = paginatedPatients.map((p) => p.id || p.patientIdCode);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // CSV / Excel Export
  const handleExportCSV = () => {
    const dataToExport = selectedIds.length > 0
      ? patients.filter((p) => selectedIds.includes(p.id || p.patientIdCode))
      : filteredPatientsList;

    if (dataToExport.length === 0) {
      toast.warning('No patient records to export.');
      return;
    }

    const headers = ['Patient ID', 'Name', 'Age/Gender', 'Phone', 'Email', 'Care Unit', 'Floor/Room', 'Primary Doctor', 'Status', 'Risk Level', 'Insurance Provider', 'Policy Number', 'Group Number', 'Insurance Valid Until', 'Admission Date'];
    const rows = dataToExport.map((p) => [
      `"${p.patientIdCode || p.id}"`,
      `"${p.name}"`,
      `"${p.ageGender || ''}"`,
      `"${p.phone || ''}"`,
      `"${p.email || ''}"`,
      `"${p.careUnit || ''}"`,
      `"${p.floorRoom || ''}"`,
      `"${p.primaryDoctorName || ''}"`,
      `"${p.status}"`,
      `"${p.riskLevel}"`,
      `"${p.insuranceProvider || ''}"`,
      `"${p.insurancePolicyNumber || ''}"`,
      `"${p.insuranceGroupNumber || ''}"`,
      `"${p.insuranceValidUntil || ''}"`,
      `"${p.admissionDate || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ConnectCare_Patients_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${dataToExport.length} patient record(s) to CSV.`);
  };

  // Delete Patient
  const handleDeletePatient = async (patientId: string, patientName: string) => {
    const confirmed = await confirm({
      title: 'Remove Patient',
      message: `Are you sure you want to remove patient "${patientName}"? This action cannot be undone.`,
      confirmText: 'Remove Patient',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      await api.deletePatient(patientId);
      toast.success(`Patient "${patientName}" removed successfully.`);
      await fetchPatientsData();
      setSelectedIds((prev) => prev.filter((id) => id !== patientId));
    } catch (err: any) {
      console.error('Failed to delete patient:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete patient record.');
    }
  };

  const handleResetFilters = () => {
    setTableSearch('');
    setStatusFilter('All Status');
    setUnitFilter('All Units');
    setDoctorFilter('All Doctors');
    setRiskFilter('All Risk Levels');
    setAgeGroupFilter('All Age Groups');
    setSortField(null);
    setCurrentPage(1);
  };

  // Helper Badge Renderers
  const getStatusBadge = (status: any) => {
    const s = String(status).toLowerCase();
    if (s === '0' || s === 'incare' || s.includes('in care')) {
      return <Badge variant="in-care">In Care</Badge>;
    }
    if (s === '1' || s === 'admitted') {
      return <Badge variant="admitted">Admitted</Badge>;
    }
    if (s === '2' || s === 'discharged') {
      return <Badge variant="discharged">Discharged</Badge>;
    }
    return <Badge variant="inactive">Inactive</Badge>;
  };

  const getRiskBadge = (risk: any) => {
    const r = String(risk).toLowerCase();
    if (r === '0' || r.includes('crit') || r.includes('high')) {
      return <Badge variant="critical">Critical</Badge>;
    }
    if (r === '1' || r === 'high') {
      return <Badge variant="high">High</Badge>;
    }
    if (r === '2' || r === 'medium') {
      return <Badge variant="medium">Medium</Badge>;
    }
    return <Badge variant="low">Low</Badge>;
  };

  // Filtered Patients Memo
  const filteredPatientsList = useMemo(() => {
    return patients.filter((p) => {
      // 1. Search Query
      if (tableSearch.trim()) {
        const query = tableSearch.toLowerCase();
        const matchesName = (p.name || '').toLowerCase().includes(query);
        const matchesId = (p.patientIdCode || p.id || '').toLowerCase().includes(query);
        const matchesPhone = (p.phone || '').toLowerCase().includes(query);
        const matchesEmail = (p.email || '').toLowerCase().includes(query);
        const matchesUnit = (p.careUnit || '').toLowerCase().includes(query);
        if (!matchesName && !matchesId && !matchesPhone && !matchesEmail && !matchesUnit) return false;
      }

      // 2. Status Filter
      if (statusFilter !== 'All Status' && statusFilter !== 'All') {
        const sStr = String(p.status).toLowerCase();
        const targetStatus = statusFilter.toLowerCase();
        if (targetStatus === 'in care' && !sStr.includes('incare') && !sStr.includes('in care') && sStr !== '0') return false;
        if (targetStatus === 'admitted' && !sStr.includes('admitted') && sStr !== '1') return false;
        if (targetStatus === 'discharged' && !sStr.includes('discharged') && sStr !== '2') return false;
        if (targetStatus === 'inactive' && !sStr.includes('inactive') && sStr !== '3') return false;
      }

      // 3. Care Unit Filter
      if (unitFilter !== 'All Units' && unitFilter !== 'All') {
        const unitName = (p.careUnit || '').toLowerCase();
        if (!unitName.includes(unitFilter.toLowerCase())) return false;
      }

      // 4. Primary Doctor Filter
      if (doctorFilter !== 'All Doctors' && doctorFilter !== 'All') {
        const docName = (p.primaryDoctorName || '').toLowerCase();
        if (!docName.includes(doctorFilter.toLowerCase())) return false;
      }

      // 5. Risk Level Filter
      if (riskFilter !== 'All Risk Levels' && riskFilter !== 'All') {
        const rStr = String(p.riskLevel).toLowerCase();
        const targetRisk = riskFilter.toLowerCase();
        if (targetRisk === 'high' && !rStr.includes('high') && rStr !== '0' && !rStr.includes('critical')) return false;
        if (targetRisk === 'medium' && !rStr.includes('medium') && rStr !== '1') return false;
        if (targetRisk === 'low' && !rStr.includes('low') && rStr !== '2') return false;
      }

      // 6. Age Group Filter
      if (ageGroupFilter !== 'All Age Groups') {
        const age = getPatientAge(p);
        if (ageGroupFilter === '0-18' && (age < 0 || age > 18)) return false;
        if (ageGroupFilter === '19-50' && (age < 19 || age > 50)) return false;
        if (ageGroupFilter === '51-70' && (age < 51 || age > 70)) return false;
        if (ageGroupFilter === '71+' && age < 71) return false;
      }

      return true;
    });
  }, [patients, tableSearch, statusFilter, unitFilter, doctorFilter, riskFilter, ageGroupFilter]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedPatientsList = useMemo(() => {
    if (!sortField) return filteredPatientsList;

    return [...filteredPatientsList].sort((a, b) => {
      let valA: any = a[sortField] ?? '';
      let valB: any = b[sortField] ?? '';

      if (sortField === 'name') {
        valA = a.name || `${a.firstName || ''} ${a.lastName || ''}`;
        valB = b.name || `${b.firstName || ''} ${b.lastName || ''}`;
      } else if (sortField === 'ageGender') {
        valA = getPatientAge(a);
        valB = getPatientAge(b);
      } else if (sortField === 'status') {
        valA = String(a.status);
        valB = String(b.status);
      } else if (sortField === 'riskLevel') {
        valA = String(a.riskLevel);
        valB = String(b.riskLevel);
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();

      if (strA < strB) return sortOrder === 'asc' ? -1 : 1;
      if (strA > strB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredPatientsList, sortField, sortOrder]);

  const renderSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-slate-500 transition-colors" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-3 w-3 text-indigo-600 font-bold" />
    ) : (
      <ArrowDown className="h-3 w-3 text-indigo-600 font-bold" />
    );
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [tableSearch, statusFilter, unitFilter, doctorFilter, riskFilter, ageGroupFilter, sortField, sortOrder]);

  const totalItems = sortedPatientsList.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize;

  const paginatedPatients = useMemo(() => {
    return sortedPatientsList.slice(startIndex, startIndex + pageSize);
  }, [sortedPatientsList, startIndex, pageSize]);

  return (
    <div className="space-y-5 max-w-[1700px] mx-auto select-none font-sans text-slate-800">
      
      {/* Page Header (Title, Breadcrumbs & Action Buttons) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Patient List
          </h1>
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 mt-1">
            <span
              onClick={() => navigate('/dashboard')}
              className="text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Dashboard
            </span>
            <span className="text-slate-400 mx-0.5">&gt;</span>
            <span className="text-slate-500 font-bold">{isDoctor || isNurse ? 'My Patients' : 'Patients'}</span>
            <span className="text-slate-400 mx-0.5">&gt;</span>
            <span className="text-slate-400 font-semibold">Patient List</span>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2.5">
          <DataImportExportToolbar
            moduleKey="patients"
            data={filteredPatientsList}
            selectedIds={selectedIds}
            idField="id"
            onImportSuccess={fetchPatientsData}
            customCreateApi={api.createPatient}
          />

          {can('Residents', 'create') && (
            <button
              onClick={() => navigate('/patients/new')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Patient</span>
            </button>
          )}
        </div>
      </div>

      {/* 6 Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        
        {/* Card 1: All Patients */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">All Patients</p>
            <h3 className="text-xl font-black text-slate-900 leading-tight">{(stats?.allPatients ?? stats?.AllPatients ?? patients.length).toLocaleString()}</h3>
          </div>
        </div>

        {/* Card 2: In Care */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">In Care</p>
            <h3 className="text-xl font-black text-slate-900 leading-tight">{(stats?.inCare ?? stats?.InCare ?? 0).toLocaleString()}</h3>
          </div>
        </div>

        {/* Card 3: Admitted */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <Bed className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">Admitted</p>
            <h3 className="text-xl font-black text-slate-900 leading-tight">{(stats?.admitted ?? stats?.Admitted ?? 0).toLocaleString()}</h3>
          </div>
        </div>

        {/* Card 4: Discharged */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Home className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">Discharged</p>
            <h3 className="text-xl font-black text-slate-900 leading-tight">{(stats?.discharged ?? stats?.Discharged ?? 0).toLocaleString()}</h3>
          </div>
        </div>

        {/* Card 5: Inactive */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200">
            <UserMinus className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">Inactive</p>
            <h3 className="text-xl font-black text-slate-900 leading-tight">{(stats?.inactive ?? stats?.Inactive ?? 0).toLocaleString()}</h3>
          </div>
        </div>

        {/* Card 6: New This Month */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">New This Month</p>
            <h3 className="text-xl font-black text-slate-900 leading-tight">{(stats?.newThisMonth ?? stats?.NewThisMonth ?? 0).toLocaleString()}</h3>
          </div>
        </div>

      </div>

      {/* Filter Control Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            
            {/* Table Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Search by name, ID, phone, email..."
                className="pl-9 pr-4 py-2 w-64 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Dropdown */}
            <div className="relative">
              <span className="text-[10px] font-bold text-slate-400 absolute left-3 top-1 pointer-events-none">Status</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl pl-3 pr-8 pt-4 pb-1 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option>All Status</option>
                <option>In Care</option>
                <option>Admitted</option>
                <option>Discharged</option>
                <option>Inactive</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Care Unit Dropdown */}
            <div className="relative">
              <span className="text-[10px] font-bold text-slate-400 absolute left-3 top-1 pointer-events-none">Care Unit</span>
              <select
                value={unitFilter}
                onChange={(e) => setUnitFilter(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl pl-3 pr-8 pt-4 pb-1 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="All Units">All Units</option>
                {careUnits.map((unit) => (
                  <option key={unit.id || unit.name} value={unit.name}>
                    {unit.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Primary Doctor Dropdown */}
            <div className="relative">
              <span className="text-[10px] font-bold text-slate-400 absolute left-3 top-1 pointer-events-none">Primary Doctor</span>
              <select
                value={doctorFilter}
                onChange={(e) => setDoctorFilter(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl pl-3 pr-8 pt-4 pb-1 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="All Doctors">All Doctors</option>
                {doctors.map((doctor: any) => (
                  <option key={doctor.id || doctor.name} value={doctor.name}>
                    {doctor.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMoreFilters(!showMoreFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                showMoreFilters ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Filter className="h-3.5 w-3.5" />
              <span>More Filters</span>
            </button>

            {(tableSearch || statusFilter !== 'All Status' || unitFilter !== 'All Units' || doctorFilter !== 'All Doctors' || riskFilter !== 'All Risk Levels' || ageGroupFilter !== 'All Age Groups') && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* More Filters Drawer */}
        {showMoreFilters && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-2">
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">Risk Level</label>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option>All Risk Levels</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">Age Group</label>
              <select
                value={ageGroupFilter}
                onChange={(e) => setAgeGroupFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option>All Age Groups</option>
                <option>0-18</option>
                <option>19-50</option>
                <option>51-70</option>
                <option>71+</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Selection Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs font-bold text-indigo-900 animate-in fade-in">
          <span>{selectedIds.length} patient(s) selected</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1 bg-white border border-indigo-200 rounded-lg text-indigo-700 hover:bg-indigo-100 transition-colors shadow-2xs"
            >
              Export Selected
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1 text-slate-500 hover:text-slate-800 transition-colors"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Main Patient List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-slate-700 border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={paginatedPatients.length > 0 && selectedIds.length === paginatedPatients.length}
                    className="h-4 w-4 accent-blue-600 rounded cursor-pointer"
                  />
                </th>
                <th onClick={() => handleSort('patientIdCode')} className="py-3.5 px-3 whitespace-nowrap cursor-pointer group">
                  <div className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                    <span>Patient ID</span>
                    {renderSortIcon('patientIdCode')}
                  </div>
                </th>
                <th onClick={() => handleSort('name')} className="py-3.5 px-4 whitespace-nowrap cursor-pointer group">
                  <div className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                    <span>Patient Name</span>
                    {renderSortIcon('name')}
                  </div>
                </th>
                <th onClick={() => handleSort('ageGender')} className="py-3.5 px-3 whitespace-nowrap cursor-pointer group">
                  <div className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                    <span>Age / Gender</span>
                    {renderSortIcon('ageGender')}
                  </div>
                </th>
                <th onClick={() => handleSort('phone')} className="py-3.5 px-3 whitespace-nowrap cursor-pointer group">
                  <div className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                    <span>Phone</span>
                    {renderSortIcon('phone')}
                  </div>
                </th>
                <th onClick={() => handleSort('careUnit')} className="py-3.5 px-3 whitespace-nowrap cursor-pointer group">
                  <div className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                    <span>Care Unit</span>
                    {renderSortIcon('careUnit')}
                  </div>
                </th>
                <th onClick={() => handleSort('primaryDoctorName')} className="py-3.5 px-3 whitespace-nowrap cursor-pointer group">
                  <div className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                    <span>Primary Doctor</span>
                    {renderSortIcon('primaryDoctorName')}
                  </div>
                </th>
                <th onClick={() => handleSort('status')} className="py-3.5 px-3 whitespace-nowrap cursor-pointer group">
                  <div className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                    <span>Status</span>
                    {renderSortIcon('status')}
                  </div>
                </th>
                <th onClick={() => handleSort('riskLevel')} className="py-3.5 px-3 whitespace-nowrap cursor-pointer group">
                  <div className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                    <span>Risk Level</span>
                    {renderSortIcon('riskLevel')}
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 font-bold">
                    Loading patient records...
                  </td>
                </tr>
              ) : paginatedPatients.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 font-medium">
                    No patient records found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedPatients.map((row) => {
                  const rowId = row.id || row.patientIdCode;
                  const isSelected = selectedIds.includes(rowId);
                  const isMenuOpen = openActionRowId === rowId;

                  return (
                    <tr key={rowId} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}>
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(rowId)}
                          className="h-4 w-4 accent-blue-600 rounded cursor-pointer"
                        />
                      </td>

                      {/* Patient ID Code */}
                      <td className="py-3.5 px-3 font-extrabold text-slate-900 whitespace-nowrap">
                        {row.patientIdCode || row.id}
                      </td>

                      {/* Patient Name & Avatar */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {row.avatar ? (
                            <img
                              src={row.avatar.startsWith('http') || row.avatar.startsWith('data:') || row.avatar.startsWith('/') ? row.avatar : `/${row.avatar}`}
                              alt={row.name}
                              className="h-8 w-8 rounded-full object-cover shrink-0 border border-slate-200"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 border border-indigo-200">
                              {row.name ? row.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'PT'}
                            </div>
                          )}
                          <div>
                            <p className="font-black text-slate-900 text-xs leading-tight">{row.name}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">{row.dob || 'Jan 15, 1958'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Age / Gender */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-slate-700 font-bold text-xs">
                        {row.ageGender || `${getPatientAge(row)} / ${row.gender || 'M'}`}
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-slate-600 font-semibold text-xs">
                        {row.phone || '(512) 555-0100'}
                      </td>

                      {/* Care Unit & Floor Room */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <p className="font-extrabold text-slate-900 text-xs leading-tight">{row.careUnit || 'General Ward'}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{row.floorRoom || '1st Floor - 101'}</p>
                      </td>

                      {/* Primary Doctor */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="font-bold text-slate-800 text-xs">{row.primaryDoctorName || 'Unassigned'}</span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {getStatusBadge(row.status)}
                      </td>

                      {/* Risk Level */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {getRiskBadge(row.riskLevel)}
                      </td>

                      {/* Actions Column with 3-Dots Dropdown Menu */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center relative">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => navigate(`/patients/${rowId}`)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="View Profile"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {can('Residents', 'update') && (
                            <button
                              onClick={() => navigate(`/patients/edit/${rowId}`)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Details"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          )}

                          <div className="relative inline-block text-left">
                            <button
                              onClick={() => setOpenActionRowId(isMenuOpen ? null : rowId)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="More actions"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>

                            {isMenuOpen && (
                              <div
                                onMouseLeave={() => setOpenActionRowId(null)}
                                className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 text-xs font-semibold text-slate-700 animate-in fade-in slide-in-from-top-1"
                              >
                                <button
                                  onClick={() => {
                                    setOpenActionRowId(null);
                                    navigate(`/patients/${rowId}`);
                                  }}
                                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Eye className="h-3.5 w-3.5 text-blue-600" />
                                  <span>View Profile</span>
                                </button>
                                {can('Residents', 'update') && (
                                  <button
                                    onClick={() => {
                                      setOpenActionRowId(null);
                                      navigate(`/patients/edit/${rowId}`);
                                    }}
                                    className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Edit2 className="h-3.5 w-3.5 text-indigo-600" />
                                    <span>Edit Patient</span>
                                  </button>
                                )}
                                {can('Residents', 'delete') && (
                                  <button
                                    onClick={() => {
                                      setOpenActionRowId(null);
                                      handleDeletePatient(rowId, row.name);
                                    }}
                                    className="w-full text-left px-3.5 py-1.5 hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer border-t border-slate-100 mt-1 pt-1.5"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                                    <span>Delete Record</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination (auto-hides when 1 page or <= pageSize) */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalResults={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="patients"
        />
      </div>

    </div>
  );
};

export default PatientsPage;

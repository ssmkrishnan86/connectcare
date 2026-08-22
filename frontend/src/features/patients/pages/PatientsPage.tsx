import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  Search,
  Calendar,
  Users,
  UserCheck,
  Bed,
  Home,
  UserMinus,
  Plus,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit2,
  Trash2,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X
} from 'lucide-react';

export const PatientsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [patients, setPatients] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    allPatients: 0,
    inCare: 0,
    admitted: 0,
    discharged: 0,
    inactive: 0,
    newThisMonth: 0,
  });
  const [, setLoading] = useState(true);

  // Search & Filter States
  const [tableSearch, setTableSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [unitFilter, setUnitFilter] = useState('All Units');
  const [doctorFilter, setDoctorFilter] = useState('All Doctors');
  const [riskFilter, setRiskFilter] = useState('All Risk Levels');
  const [ageGroupFilter, setAgeGroupFilter] = useState('All Age Groups');

  // Sorting State
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);

  // New Patient Form State
  const [newPatientIdCode, setNewPatientIdCode] = useState('P-0011');
  const [newName, setNewName] = useState('');
  const [newDob, setNewDob] = useState('');
  const [newAgeGender, setNewAgeGender] = useState('65 / Male');
  const [newPhone, setNewPhone] = useState('(512) 555-0000');
  const [newCareUnit, setNewCareUnit] = useState('Cardiology Unit');
  const [newFloorRoom, setNewFloorRoom] = useState('3rd Floor - 303');
  const [newDoctorName, setNewDoctorName] = useState('Dr. Sarah Wilson');
  const [newStatus, setNewStatus] = useState('InCare');
  const [newRiskLevel, setNewRiskLevel] = useState('Medium');

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
      const [listRes, statsRes] = await Promise.all([
        api.getPatients(undefined, undefined, undefined, user?.doctorId, user?.nurseId),
        api.getPatientStats(user?.doctorId, user?.nurseId),
      ]);

      const listData = Array.isArray(listRes) ? listRes : (listRes as any)?.data || [];
      setPatients(listData);

      const statsData = (statsRes as any)?.data || statsRes;
      if (statsData) {
        setStats(statsData);
      }
    } catch (err) {
      console.error('Failed to fetch patients data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientsData();
  }, [user?.doctorId, user?.nurseId, user?.role]);

  const handleDeletePatient = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete patient "${name}"?`)) return;
    try {
      await api.deletePatient(id);
      fetchPatientsData();
    } catch (err) {
      console.error('Failed to delete patient:', err);
      alert('Failed to delete patient.');
    }
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    try {
      await api.createPatient({
        patientIdCode: newPatientIdCode,
        name: newName,
        dob: newDob || 'Jan 15, 1958',
        ageGender: newAgeGender,
        phone: newPhone,
        careUnit: newCareUnit,
        floorRoom: newFloorRoom,
        primaryDoctorName: newDoctorName,
        status: newStatus === 'InCare' ? 0 : newStatus === 'Admitted' ? 1 : 2,
        riskLevel: newRiskLevel === 'High' ? 0 : newRiskLevel === 'Medium' ? 1 : 2,
        lastVisit: 'May 22, 2024 10:00 AM',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      });

      setShowAddModal(false);
      setNewName('');
      fetchPatientsData();
    } catch (err) {
      console.error('Failed to create patient:', err);
    }
  };

  const getStatusBadge = (status: any) => {
    const s = String(status);
    if (s === 'InCare' || s === '0' || s === 'In Care') {
      return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-emerald-100 text-emerald-700">In Care</span>;
    }
    if (s === 'Admitted' || s === '1') {
      return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-blue-100 text-blue-700">Admitted</span>;
    }
    if (s === 'Discharged' || s === '2') {
      return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-slate-100 text-slate-600">Discharged</span>;
    }
    return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-rose-100 text-rose-700">Inactive</span>;
  };

  const getRiskBadge = (risk: any) => {
    const r = String(risk);
    if (r === 'High' || r === '0' || r === 'Critical') {
      return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-rose-100 text-rose-700">High</span>;
    }
    if (r === 'Medium' || r === '1') {
      return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-amber-100 text-amber-700">Medium</span>;
    }
    return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-emerald-100 text-emerald-700">Low</span>;
  };

  const filteredPatientsList = useMemo(() => {
    return patients.filter((p) => {
      // 1. Search Query
      if (tableSearch.trim()) {
        const q = tableSearch.toLowerCase().trim();
        const name = (p.name || `${p.firstName || ''} ${p.lastName || ''}`).toLowerCase();
        const idCode = (p.patientIdCode || p.id || '').toLowerCase();
        const mrn = (p.mrn || '').toLowerCase();
        const phone = (p.phone || '').toLowerCase();
        const email = (p.email || '').toLowerCase();
        const address = (p.address || '').toLowerCase();

        const matchesSearch = name.includes(q) || idCode.includes(q) || mrn.includes(q) || phone.includes(q) || email.includes(q) || address.includes(q);
        if (!matchesSearch) return false;
      }

      // 2. Status Filter
      if (statusFilter !== 'All Status') {
        const sStr = String(p.status).toLowerCase();
        const targetStatus = statusFilter.toLowerCase().replace(/\s+/g, '');
        if (targetStatus === 'incare' && !sStr.includes('incare') && sStr !== '0' && sStr !== 'in care') return false;
        if (targetStatus === 'admitted' && !sStr.includes('admitted') && sStr !== '1') return false;
        if (targetStatus === 'discharged' && !sStr.includes('discharged') && sStr !== '2') return false;
        if (targetStatus === 'inactive' && !sStr.includes('inactive') && sStr !== '3') return false;
      }

      // 3. Care Unit Filter
      if (unitFilter !== 'All Units') {
        const unitName = (p.careUnit || '').toLowerCase();
        if (!unitName.includes(unitFilter.toLowerCase())) return false;
      }

      // 4. Primary Doctor Filter
      if (doctorFilter !== 'All Doctors') {
        const docName = (p.primaryDoctorName || '').toLowerCase();
        if (!docName.includes(doctorFilter.toLowerCase())) return false;
      }

      // 5. Risk Level Filter
      if (riskFilter !== 'All Risk Levels') {
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

  // Reset page when filters, search, or sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [tableSearch, statusFilter, unitFilter, doctorFilter, riskFilter, ageGroupFilter, sortField, sortOrder]);

  const totalItems = sortedPatientsList.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const paginatedPatients = useMemo(() => {
    return sortedPatientsList.slice(startIndex, startIndex + pageSize);
  }, [sortedPatientsList, startIndex, pageSize]);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safeCurrentPage > 3) pages.push('...');
      const start = Math.max(2, safeCurrentPage - 1);
      const end = Math.min(totalPages - 1, safeCurrentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (safeCurrentPage < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 space-y-5 p-6 max-w-[1700px] mx-auto select-none">
      
      {/* Page Header (Title, Breadcrumbs & Action Buttons) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {user?.role === 'Doctor' ? 'My Patients - Clinical List' : user?.role === 'Nurse' ? 'My Patients - Nursing Care List' : 'Patients - Patient List'}
          </h1>
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 mt-1">
            <span
              onClick={() => navigate('/dashboard')}
              className="text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Dashboard
            </span>
            <span className="text-slate-400 mx-0.5">&gt;</span>
            <span className="text-slate-500 font-bold">{(user?.role === 'Doctor' || user?.role === 'Nurse') ? 'My Patients' : 'Patients'}</span>
            <span className="text-slate-400 mx-0.5">&gt;</span>
            <span className="text-slate-400 font-semibold">Patient List</span>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/patients/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Patient</span>
          </button>
        </div>
      </div>

      {/* 2. 6 Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        
        {/* Card 1: All Patients */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">All Patients</p>
            <h3 className="text-xl font-black text-slate-900 leading-tight">{(stats?.allPatients ?? stats?.AllPatients ?? 0).toLocaleString()}</h3>
            <p className="text-[10px] font-extrabold text-emerald-600 mt-0.5">↑ 12.5% <span className="text-slate-400 font-normal">vs last month</span></p>
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
            <p className="text-[10px] font-extrabold text-emerald-600 mt-0.5">↑ 8.4% <span className="text-slate-400 font-normal">vs last month</span></p>
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
            <p className="text-[10px] font-extrabold text-emerald-600 mt-0.5">↑ 3.2% <span className="text-slate-400 font-normal">vs last month</span></p>
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
            <p className="text-[10px] font-extrabold text-slate-500 mt-0.5">0% <span className="text-slate-400 font-normal">vs last month</span></p>
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
            <p className="text-[10px] font-extrabold text-slate-500 mt-0.5">0% <span className="text-slate-400 font-normal">vs last month</span></p>
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
            <p className="text-[10px] font-extrabold text-emerald-600 mt-0.5">↑ 7.6% <span className="text-slate-400 font-normal">vs last month</span></p>
          </div>
        </div>

      </div>

      {/* 3. Filter Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          
          {/* Table Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Search by name, ID, phone, email..."
              className="pl-9 pr-4 py-2 w-64 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <span className="text-[10px] font-bold text-slate-400 absolute left-3 top-1 pointer-events-none">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl pl-3 pr-8 pt-4 pb-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
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
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl pl-3 pr-8 pt-4 pb-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option>All Units</option>
              <option>Cardiology Unit</option>
              <option>Med-Surg Unit 2</option>
              <option>Diabetes Care</option>
              <option>General Ward</option>
              <option>Geriatrics Unit</option>
              <option>Orthopedics Unit</option>
              <option>Neurology Unit</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Primary Doctor Dropdown */}
          <div className="relative">
            <span className="text-[10px] font-bold text-slate-400 absolute left-3 top-1 pointer-events-none">Primary Doctor</span>
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl pl-3 pr-8 pt-4 pb-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option>All Doctors</option>
              <option>Dr. Sarah Wilson</option>
              <option>Dr. Michael Brown</option>
              <option>Dr. James Lee</option>
              <option>Dr. Emily Clark</option>
              <option>Dr. Anita Sharma</option>
              <option>Dr. Lisa Patel</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Risk Level Dropdown */}
          <div className="relative">
            <span className="text-[10px] font-bold text-slate-400 absolute left-3 top-1 pointer-events-none">Risk Level</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl pl-3 pr-8 pt-4 pb-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option>All Risk Levels</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Age Group Dropdown */}
          <div className="relative">
            <span className="text-[10px] font-bold text-slate-400 absolute left-3 top-1 pointer-events-none">Age Group</span>
            <select
              value={ageGroupFilter}
              onChange={(e) => setAgeGroupFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl pl-3 pr-8 pt-4 pb-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option>All Age Groups</option>
              <option>0-18</option>
              <option>19-50</option>
              <option>51-70</option>
              <option>71+</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 4. Main Patient List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-slate-700 border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                <th onClick={() => handleSort('patientIdCode')} className="py-3.5 px-4 whitespace-nowrap cursor-pointer group">
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
                <th onClick={() => handleSort('lastVisit')} className="py-3.5 px-3 whitespace-nowrap cursor-pointer group">
                  <div className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                    <span>Last Visit</span>
                    {renderSortIcon('lastVisit')}
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedPatients.map((row) => (
                <tr key={row.id || row.patientIdCode} className="hover:bg-slate-50/80 transition-colors">

                  {/* Patient ID Code */}
                  <td className="py-3.5 px-3 font-extrabold text-slate-900 whitespace-nowrap">
                    {row.patientIdCode}
                  </td>

                  {/* Patient Name & Avatar */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img
                        src={row.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'}
                        alt={row.name}
                        className="h-8 w-8 rounded-full object-cover shrink-0 border border-slate-200"
                      />
                      <div>
                        <p className="font-black text-slate-900 text-xs leading-tight">{row.name}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{row.dob || 'Jan 15, 1958'}</p>
                      </div>
                    </div>
                  </td>

                  {/* Age / Gender */}
                  <td className="py-3.5 px-3 whitespace-nowrap text-slate-700 font-bold text-xs">
                    {row.ageGender}
                  </td>

                  {/* Phone */}
                  <td className="py-3.5 px-3 whitespace-nowrap text-slate-600 font-semibold text-xs">
                    {row.phone}
                  </td>

                  {/* Care Unit & Floor Room */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <p className="font-extrabold text-slate-900 text-xs leading-tight">{row.careUnit}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{row.floorRoom || '1st Floor - 101'}</p>
                  </td>

                  {/* Primary Doctor */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <img
                        src={row.primaryDoctorAvatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'}
                        alt={row.primaryDoctorName}
                        className="h-6 w-6 rounded-full object-cover shrink-0 border border-slate-200"
                      />
                      <span className="font-bold text-slate-800 text-xs">{row.primaryDoctorName}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {getStatusBadge(row.status)}
                  </td>

                  {/* Risk Level */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {getRiskBadge(row.riskLevel)}
                  </td>

                  {/* Last Visit */}
                  <td className="py-3.5 px-3 whitespace-nowrap text-slate-600 text-[11px] font-semibold">
                    {row.lastVisit}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => navigate(`/patients/${row.id || row.patientIdCode}`)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        title="View Patient Profile"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => navigate(`/patients/edit/${row.id || row.patientIdCode}`)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Patient Details"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleDeletePatient(row.id || row.patientIdCode, row.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Patient"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 5. Table Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-500">
          <span>
            Showing {totalItems === 0 ? 0 : startIndex + 1} to {endIndex} of {totalItems} patients
          </span>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              className="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {getPageNumbers().map((pNum, idx) =>
              pNum === '...' ? (
                <span key={`ellipsis-${idx}`} className="px-1.5 text-slate-400 font-bold">...</span>
              ) : (
                <button
                  key={`page-${pNum}`}
                  onClick={() => setCurrentPage(pNum as number)}
                  className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
                    safeCurrentPage === pNum
                      ? 'bg-indigo-600 text-white font-black shadow-xs'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {pNum}
                </button>
              )
            )}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
              className="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="ml-2 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add New Patient Modal Form */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base">Add New Patient</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Patient Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Robert Johnson"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Patient ID Code</label>
                  <input
                    type="text"
                    required
                    value={newPatientIdCode}
                    onChange={(e) => setNewPatientIdCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Age / Gender</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 67 / Male"
                    value={newAgeGender}
                    onChange={(e) => setNewAgeGender(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Date of Birth</label>
                  <input
                    type="text"
                    placeholder="Oct 12, 1956"
                    value={newDob}
                    onChange={(e) => setNewDob(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Care Unit</label>
                  <select
                    value={newCareUnit}
                    onChange={(e) => setNewCareUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option>Cardiology Unit</option>
                    <option>Med-Surg Unit 2</option>
                    <option>Diabetes Care</option>
                    <option>General Ward</option>
                    <option>Geriatrics Unit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Floor & Room</label>
                  <input
                    type="text"
                    value={newFloorRoom}
                    onChange={(e) => setNewFloorRoom(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Primary Doctor</label>
                <select
                  value={newDoctorName}
                  onChange={(e) => setNewDoctorName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option>Dr. Sarah Wilson</option>
                  <option>Dr. Michael Brown</option>
                  <option>Dr. James Lee</option>
                  <option>Dr. Emily Clark</option>
                  <option>Dr. Anita Sharma</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="InCare">In Care</option>
                    <option value="Admitted">Admitted</option>
                    <option value="Discharged">Discharged</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Risk Level</label>
                  <select
                    value={newRiskLevel}
                    onChange={(e) => setNewRiskLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20"
                >
                  Add Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PatientsPage;

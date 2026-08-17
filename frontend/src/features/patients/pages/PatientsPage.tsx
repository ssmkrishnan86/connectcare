import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  Menu,
  Search,
  Bell,
  MessageSquare,
  Calendar,
  Filter,
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
  MoreVertical,
  ChevronDown,
  ArrowUpDown,
  X,
  Upload
} from 'lucide-react';

export const PatientsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [patients, setPatients] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    allPatients: 2350,
    inCare: 1880,
    admitted: 320,
    discharged: 120,
    inactive: 30,
    newThisMonth: 85,
  });
  const [, setLoading] = useState(true);

  // Search & Filter States
  const [headerSearch, setHeaderSearch] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [unitFilter, setUnitFilter] = useState('All Units');
  const [doctorFilter, setDoctorFilter] = useState('All Doctors');
  const [riskFilter, setRiskFilter] = useState('All Risk Levels');
  const [ageGroupFilter, setAgeGroupFilter] = useState('All Age Groups');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any | null>(null);

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

  const fetchPatientsData = async () => {
    setLoading(true);
    try {
      const activeSearch = tableSearch || headerSearch;
      const statusParam = statusFilter !== 'All Status' ? statusFilter : undefined;
      const unitParam = unitFilter !== 'All Units' ? unitFilter : undefined;

      const [listRes, statsRes] = await Promise.all([
        api.getPatients(activeSearch, statusParam, unitParam),
        api.getPatientStats(),
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
  }, [tableSearch, headerSearch, statusFilter, unitFilter]);

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
      if (doctorFilter !== 'All Doctors' && p.primaryDoctorName !== doctorFilter) return false;
      if (riskFilter !== 'All Risk Levels') {
        const rStr = String(p.riskLevel);
        if (riskFilter === 'High' && rStr !== 'High' && rStr !== '0') return false;
        if (riskFilter === 'Medium' && rStr !== 'Medium' && rStr !== '1') return false;
        if (riskFilter === 'Low' && rStr !== 'Low' && rStr !== '2') return false;
      }
      return true;
    });
  }, [patients, doctorFilter, riskFilter]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 space-y-5 p-6 max-w-[1700px] mx-auto select-none">
      
      {/* 1. Top Header Bar (Admin Mode) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Patients - Patient List</h1>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">
              <span className="text-indigo-600 font-bold hover:underline cursor-pointer">Dashboard</span> &gt; <span className="text-slate-500 font-bold">Patients</span> &gt; Patient List
            </p>
          </div>
        </div>

        {/* Header Right Controls */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Header Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              placeholder="Search patients, ID, phone, email..."
              className="pl-9 pr-4 py-2 w-64 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Icon Badges */}
          <button className="relative p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer" title="Notifications">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center">8</span>
          </button>

          <button className="relative p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer" title="Messages">
            <MessageSquare className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center">3</span>
          </button>

          <button className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer" title="Calendar">
            <Calendar className="h-4 w-4" />
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="h-9 w-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
              JA
            </div>
            <div className="text-left">
              <p className="text-xs font-extrabold text-slate-900 leading-tight">
                {user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : 'John Admin'}
              </p>
              <p className="text-[10px] font-semibold text-slate-400">System Administrator</p>
            </div>
          </div>

        </div>
      </div>

      {/* Top Action Header Buttons */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => setShowImportModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-extrabold transition-colors cursor-pointer shadow-xs"
        >
          <Upload className="h-4 w-4" />
          <span>Import Patients</span>
        </button>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-600/20 transition-transform active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Patient</span>
        </button>
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
            <h3 className="text-xl font-black text-slate-900 leading-tight">{(stats.allPatients || 2350).toLocaleString()}</h3>
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
            <h3 className="text-xl font-black text-slate-900 leading-tight">{(stats.inCare || 1880).toLocaleString()}</h3>
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
            <h3 className="text-xl font-black text-slate-900 leading-tight">{(stats.admitted || 320).toLocaleString()}</h3>
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
            <h3 className="text-xl font-black text-slate-900 leading-tight">{(stats.discharged || 120).toLocaleString()}</h3>
            <p className="text-[10px] font-extrabold text-rose-600 mt-0.5">↓ 4.1% <span className="text-slate-400 font-normal">vs last month</span></p>
          </div>
        </div>

        {/* Card 5: Inactive */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200">
            <UserMinus className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">Inactive</p>
            <h3 className="text-xl font-black text-slate-900 leading-tight">{(stats.inactive || 30).toLocaleString()}</h3>
            <p className="text-[10px] font-extrabold text-rose-600 mt-0.5">↓ 10% <span className="text-slate-400 font-normal">vs last month</span></p>
          </div>
        </div>

        {/* Card 6: New This Month */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400">New This Month</p>
            <h3 className="text-xl font-black text-slate-900 leading-tight">{(stats.newThisMonth || 85).toLocaleString()}</h3>
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

          {/* More Filters Toggle Button */}
          <button className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-indigo-700 text-xs font-bold transition-colors cursor-pointer">
            <Filter className="h-3.5 w-3.5" />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* 4. Main Patient List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-slate-700 border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-10">
                  <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                </th>
                <th className="py-3.5 px-3 whitespace-nowrap">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-slate-700">
                    <span>Patient ID</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Patient Name</th>
                <th className="py-3.5 px-3">Age / Gender</th>
                <th className="py-3.5 px-3 whitespace-nowrap">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-slate-700">
                    <span>Phone</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 px-3 whitespace-nowrap">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-slate-700">
                    <span>Care Unit</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 px-3 whitespace-nowrap">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-slate-700">
                    <span>Primary Doctor</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 px-3 whitespace-nowrap">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-slate-700">
                    <span>Status</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 px-3">Risk Level</th>
                <th className="py-3.5 px-3 whitespace-nowrap">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-slate-700">
                    <span>Last Visit</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatientsList.map((row) => (
                <tr key={row.id || row.patientIdCode} className="hover:bg-slate-50/80 transition-colors">
                  
                  {/* Select Checkbox */}
                  <td className="py-3.5 px-4">
                    <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  </td>

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
                        onClick={() => setEditingPatient(row)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Patient"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      <button
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="More Options"
                      >
                        <MoreVertical className="h-4 w-4" />
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
          <span>Showing 1 to {filteredPatientsList.length} of {(stats.allPatients || 2350).toLocaleString()} patients</span>

          <div className="flex items-center gap-1.5">
            <button className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="px-3 py-1 bg-indigo-600 text-white rounded-lg font-black text-xs">1</button>
            <button className="px-3 py-1 hover:bg-slate-100 text-slate-700 rounded-lg font-bold text-xs cursor-pointer">2</button>
            <button className="px-3 py-1 hover:bg-slate-100 text-slate-700 rounded-lg font-bold text-xs cursor-pointer">3</button>
            <button className="px-3 py-1 hover:bg-slate-100 text-slate-700 rounded-lg font-bold text-xs cursor-pointer">4</button>
            <button className="px-3 py-1 hover:bg-slate-100 text-slate-700 rounded-lg font-bold text-xs cursor-pointer">5</button>
            <span className="px-1 text-slate-400">...</span>
            <button className="px-3 py-1 hover:bg-slate-100 text-slate-700 rounded-lg font-bold text-xs cursor-pointer">235</button>
            <button className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer">
              <ChevronRight className="h-4 w-4" />
            </button>

            <select className="ml-2 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-2 py-1 focus:outline-none">
              <option>10 / page</option>
              <option>20 / page</option>
              <option>50 / page</option>
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

      {/* Edit Patient Modal */}
      {editingPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base">Edit Patient Details</h3>
              <button onClick={() => setEditingPatient(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Patient Name</label>
                <input
                  type="text"
                  defaultValue={editingPatient.name}
                  onChange={(e) => setEditingPatient({ ...editingPatient, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Care Unit</label>
                  <input
                    type="text"
                    defaultValue={editingPatient.careUnit}
                    onChange={(e) => setEditingPatient({ ...editingPatient, careUnit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Phone</label>
                  <input
                    type="text"
                    defaultValue={editingPatient.phone}
                    onChange={(e) => setEditingPatient({ ...editingPatient, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setEditingPatient(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setEditingPatient(null);
                    fetchPatientsData();
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Patients Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base">Import Patients</h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-600">
              <p>Upload CSV or Excel file containing patient records.</p>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-2 hover:border-indigo-400 transition-colors cursor-pointer bg-slate-50">
                <Upload className="h-8 w-8 text-slate-400 mx-auto" />
                <p className="font-extrabold text-slate-800">Click to upload file</p>
                <p className="text-[10px] text-slate-400">CSV, XLSX up to 10MB</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20"
                >
                  Import File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PatientsPage;

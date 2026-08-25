import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  Sun,
  Search,
  MessageSquare,
  Bell,
  Calendar,
  SlidersHorizontal,
  Filter,
  ClipboardCheck,
  RotateCw,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  FileText,
  Shield,
  Printer,
  X
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

export const DischargeChecklistPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [checklists, setChecklists] = useState<any[]>([]);
  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    totalPatients: 21,
    inProgress: 7,
    readyForDischarge: 9,
    pendingItems: 3,
    dischargedToday: 2,
  });
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('All Patients');
  const [searchQuery, setSearchQuery] = useState('');
  const [unitFilter, setUnitFilter] = useState('All Units / Floors');
  const [patientFilter, setPatientFilter] = useState('All Patients');
  const [statusFilter, setStatusFilter] = useState('All Checklist Status');

  // New Checklist Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [newPatientName, setNewPatientName] = useState('');
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newCareUnit, setNewCareUnit] = useState('');
  const [newDoctor, setNewDoctor] = useState('');
  const [newDischargeDate, setNewDischargeDate] = useState(new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }));

  // Quick Action Modal states
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);

  const fetchChecklistsData = async () => {
    setLoading(true);
    try {
      const nurseIdParam = user?.role === 'Nurse' ? user?.nurseId : undefined;
      const doctorIdParam = user?.role === 'Doctor' ? user?.doctorId : undefined;

      const [listRes, sumRes, patRes] = await Promise.all([
        api.getDischargeChecklists(activeTab, unitFilter, searchQuery),
        api.getDischargeSummary(),
        api.getPatients(undefined, undefined, undefined, doctorIdParam, nurseIdParam).catch(() => []),
      ]);

      const listData = Array.isArray(listRes) ? listRes : (listRes as any)?.data || [];
      setChecklists(listData);

      const pats = Array.isArray(patRes) ? patRes : (patRes as any)?.data || [];
      setPatientsList(pats);

      if (listData.length > 0 && !selectedPatient) {
        setSelectedPatient(listData[0]);
      }

      const sumData = (sumRes as any)?.data || sumRes;
      if (sumData) {
        setSummary(sumData);
      }
    } catch (err) {
      console.error('Failed to fetch discharge checklists:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChecklistsData();
  }, [activeTab, searchQuery, unitFilter, patientFilter, statusFilter, user?.nurseId, user?.doctorId]);

  const handleSelectPatientForDischarge = (patientId: string) => {
    setSelectedPatientId(patientId);
    const pat = patientsList.find(p => p.id === patientId);
    if (pat) {
      setNewPatientName(pat.name || '');
      setNewRoomNumber(pat.roomNumber || 'Room 101');
      setNewCareUnit(pat.department || pat.careUnit || 'Cardiology Unit');
      setNewDoctor(pat.primaryDoctorName || pat.assignedDoctorName || (user?.role === 'Doctor' ? (user.fullName || user.username) : 'Attending Physician'));
    } else {
      setNewPatientName('');
      setNewRoomNumber('');
      setNewCareUnit('');
      setNewDoctor('');
    }
  };

  const handleCreateChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName) return;

    try {
      await api.createDischargeChecklist({
        patientName: newPatientName,
        roomNumber: newRoomNumber || 'Room 101',
        careUnit: newCareUnit || 'General Ward',
        attendingDoctorName: newDoctor || 'Attending Physician',
        expectedDischargeText: newDischargeDate,
        admitDateText: new Date(Date.now() - 4 * 86400000).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        admitDaysText: '4 days',
      });
      setShowModal(false);
      setSelectedPatientId('');
      setNewPatientName('');
      setNewRoomNumber('');
      setNewCareUnit('');
      setNewDoctor('');
      fetchChecklistsData();
    } catch (err) {
      console.error('Failed to create discharge checklist:', err);
    }
  };

  const getStatusBadge = (status: string, percentage: number) => {
    const statusStr = String(status);
    if (statusStr === 'InProgress' || statusStr === '0' || statusStr === 'In Progress') {
      return (
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
            In Progress
          </span>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
            <span className="font-extrabold text-blue-600">{percentage}% Completed</span>
          </div>
          <div className="h-1.5 w-28 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${percentage}%` }}></div>
          </div>
        </div>
      );
    }

    if (statusStr === 'Ready' || statusStr === '1' || statusStr === 'Ready for Discharge') {
      return (
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Ready
          </span>
          <div className="text-[10px] font-extrabold text-emerald-600">All Completed</div>
          <div className="h-1.5 w-28 bg-emerald-500 rounded-full"></div>
        </div>
      );
    }

    if (statusStr === 'PendingItems' || statusStr === '2' || statusStr === 'Pending Items') {
      return (
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
            Pending Items
          </span>
          <div className="text-[10px] font-extrabold text-amber-600">{percentage}% Completed</div>
          <div className="h-1.5 w-28 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${percentage}%` }}></div>
          </div>
        </div>
      );
    }

    if (statusStr === 'Discharged' || statusStr === '3') {
      return (
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
            Discharged
          </span>
          <div className="text-[10px] font-extrabold text-purple-600">Completed</div>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-600">
          Cancelled
        </span>
        <div className="text-[10px] font-semibold text-slate-400">Discharge cancelled</div>
      </div>
    );
  };

  const isDoctor = user?.role?.toLowerCase() === 'doctor';

  return (
    <div className="space-y-5 max-w-[1700px] mx-auto select-none font-sans text-slate-800">
      
      {/* 1. Top Header Bar (Nurse View Only) */}
      {!isDoctor && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Discharge Checklist</h1>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Ensure all discharge tasks are completed before the patient leaves.
            </p>
          </div>

          {/* Header Right Controls */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Shift Selector */}
            <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer">
              <Sun className="h-4 w-4 text-amber-500 fill-amber-400" />
              <div className="flex flex-col text-[11px]">
                <span className="font-extrabold text-slate-900">Day Shift</span>
                <span className="text-[10px] text-slate-500 font-semibold">07:00 AM - 03:00 PM</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1" />
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patients..."
                className="pl-9 pr-4 py-2 w-56 sm:w-64 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Icon Badges */}
            <button className="relative p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer" title="Messages">
              <MessageSquare className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center">3</span>
            </button>

            <button className="relative p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer" title="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center">6</span>
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-200 shadow-xs">
                {user?.username ? user.username.slice(0, 2).toUpperCase() : 'RN'}
              </div>
              <div className="text-left">
                <p className="text-xs font-extrabold text-slate-900 leading-tight">
                  {user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : 'Staff Nurse'}
                </p>
                <p className="text-[10px] font-semibold text-slate-400">Staff Nurse</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. Sub-Header Navigation Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200/80 bg-white px-6 py-2.5 rounded-2xl shadow-xs text-xs font-bold overflow-x-auto">
        {[
          'All Patients',
          'In Progress',
          'Ready for Discharge',
          'Discharged',
          'Cancelled'
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-1 transition-colors relative cursor-pointer whitespace-nowrap ${
              activeTab === tab
                ? 'text-indigo-600 font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"></span>
            )}
          </button>
        ))}
      </div>

      {/* 3. Filter Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patients..."
              className="pl-8 pr-3 py-2 w-52 sm:w-60 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Date Picker Button */}
          <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>May 22, 2024</span>
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400 ml-1" />
          </div>

          {/* Unit / Floor Dropdown */}
          <div className="relative">
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option>All Units / Floors</option>
              <option>Cardiology Unit</option>
              <option>Medical Unit</option>
              <option>Surgical Unit</option>
              <option>General Ward</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Patient Dropdown */}
          <div className="relative">
            <select
              value={patientFilter}
              onChange={(e) => setPatientFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option>All Patients</option>
              <option>Patricia Smith</option>
              <option>Michael Davis</option>
              <option>Linda Martinez</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Checklist Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option>All Checklist Status</option>
              <option>In Progress</option>
              <option>Ready for Discharge</option>
              <option>Pending Items</option>
              <option>Cancelled</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Filters Toggle Button */}
          <button className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-indigo-700 text-xs font-bold transition-colors cursor-pointer">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* 4. Stat Summary Cards (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Total Patients */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">{summary.totalPatients || summary.total || 21}</h3>
            <p className="text-[11px] font-bold text-slate-500">Total Patients</p>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">All time</p>
          </div>
        </div>

        {/* Card 2: In Progress */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <RotateCw className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">{summary.inProgress || summary.inProgressCount || 7}</h3>
            <p className="text-[11px] font-bold text-slate-500">In Progress</p>
            <p className="text-[10px] font-extrabold text-slate-400 mt-0.5">33%</p>
          </div>
        </div>

        {/* Card 3: Ready for Discharge */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">{summary.readyForDischarge || summary.ready || 9}</h3>
            <p className="text-[11px] font-bold text-slate-500">Ready for Discharge</p>
            <p className="text-[10px] font-extrabold text-slate-400 mt-0.5">43%</p>
          </div>
        </div>

        {/* Card 4: Pending Items */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">{summary.pendingItems || 3}</h3>
            <p className="text-[11px] font-bold text-slate-500">Pending Items</p>
            <p className="text-[10px] font-extrabold text-slate-400 mt-0.5">14%</p>
          </div>
        </div>

        {/* Card 5: Discharged Today */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <XCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">{summary.dischargedToday || 2}</h3>
            <p className="text-[11px] font-bold text-slate-500">Discharged Today</p>
            <p className="text-[10px] font-extrabold text-slate-400 mt-0.5">10%</p>
          </div>
        </div>

      </div>

      {/* 5. Main Split Screen (8 Cols Table + 4 Cols Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Section: Discharge Checklist Table (8 Columns) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          
          <div className="p-4 border-b border-slate-100">
            <h2 className="font-extrabold text-slate-900 text-sm">Discharge Checklist</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-slate-700 border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-3">Room / Unit</th>
                  <th className="py-3.5 px-3">Admit Date</th>
                  <th className="py-3.5 px-3">Checklist Status</th>
                  <th className="py-3.5 px-3">Pending Items</th>
                  <th className="py-3.5 px-3">Expected Discharge</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {checklists.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedPatient(row)}
                    className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                      selectedPatient?.id === row.id ? 'bg-indigo-50/40' : ''
                    }`}
                  >
                    
                    {/* Patient */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {row.patientAvatar ? (
                          <img
                            src={row.patientAvatar}
                            alt={row.patientName}
                            className="h-8 w-8 rounded-full object-cover shrink-0 border border-slate-200"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 border border-indigo-200">
                            {row.patientName ? row.patientName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'PT'}
                          </div>
                        )}
                        <div>
                          <p className="font-black text-slate-900 text-xs leading-tight">{row.patientName}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">PID: {row.patientIdCode || 'PT-10001'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Room / Unit */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <p className="font-extrabold text-slate-900 text-xs leading-tight">{row.roomNumber || '302'}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{row.careUnit || 'Cardiology Unit'}</p>
                    </td>

                    {/* Admit Date */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <p className="font-bold text-slate-900 text-xs leading-tight">{row.admitDateText}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{row.admitDaysText || '4 days'}</p>
                    </td>

                    {/* Checklist Status */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {getStatusBadge(row.checklistStatus, row.progressPercentage)}
                    </td>

                    {/* Pending Items */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {row.pendingItemsCount !== undefined && row.pendingItemsCount !== null && String(row.pendingItemsCount) !== '-' ? (
                        <div>
                          <span className="font-black text-slate-900 text-xs">{row.pendingItemsCount}</span>
                          <p className="text-[10px] font-extrabold text-rose-600 hover:underline cursor-pointer">View Details</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-bold">-</span>
                      )}
                    </td>

                    {/* Expected Discharge */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {row.expectedDischargeText && row.expectedDischargeText !== '-' ? (
                        <div>
                          <p className="font-bold text-slate-900 text-xs leading-tight">{row.expectedDischargeText}</p>
                          <p className={`text-[10px] font-extrabold ${row.expectedDischargeRelative === 'Today' ? 'text-indigo-600' : 'text-slate-400'}`}>
                            {row.expectedDischargeRelative}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-bold">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer" title="View Patient Checklist">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer" title="More Options">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Bar */}
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-500">
            <span>Showing 1 to {checklists.length} of {summary.totalPatients || 21} patients</span>

            <div className="flex items-center gap-1.5">
              <button className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="px-3 py-1 bg-indigo-600 text-white rounded-lg font-black text-xs">1</button>
              <button className="px-3 py-1 hover:bg-slate-100 text-slate-700 rounded-lg font-bold text-xs cursor-pointer">2</button>
              <button className="px-3 py-1 hover:bg-slate-100 text-slate-700 rounded-lg font-bold text-xs cursor-pointer">3</button>
              <button className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Right Section: Sidebar Widgets (4 Columns) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Card 1: Selected Patient */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-900 text-xs">Selected Patient</h3>
              <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
            </div>

            {selectedPatient && (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  {selectedPatient.patientAvatar ? (
                    <img
                      src={selectedPatient.patientAvatar}
                      alt={selectedPatient.patientName}
                      className="h-12 w-12 rounded-full object-cover shrink-0 border-2 border-indigo-100 shadow-xs"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg shrink-0 border-2 border-indigo-100 shadow-xs">
                      {selectedPatient.patientName ? selectedPatient.patientName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'PT'}
                    </div>
                  )}
                  <div className="space-y-1">
                    <h4 className="font-black text-slate-900 text-sm">{selectedPatient.patientName}</h4>
                    <p className="text-[11px] font-bold text-slate-500">PID: {selectedPatient.patientIdCode || 'PT-10001'}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{selectedPatient.ageGender || '68 Y • Female • A+'}</p>
                    <p className="text-[10px] text-slate-500 font-semibold">Room {selectedPatient.roomNumber || '302'} • {selectedPatient.careUnit || 'Cardiology Unit'}</p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                      In Progress
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs font-semibold">
                  <div>
                    <p className="text-[10px] text-slate-400">Admit Date</p>
                    <p className="font-extrabold text-slate-900 text-xs">{selectedPatient.admitDateText || 'May 18, 2024'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Expected Discharge</p>
                    <p className="font-extrabold text-slate-900 text-xs">{selectedPatient.expectedDischargeText || 'May 22, 2024'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-semibold">
                  <div>
                    <p className="text-[10px] text-slate-400">Attending Doctor</p>
                    <p className="font-extrabold text-slate-900 text-xs">{selectedPatient.attendingDoctorName || 'Dr. Sarah Wilson'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Care Team</p>
                    <p className="font-extrabold text-slate-900 text-xs">{selectedPatient.careTeamMembersCount || 3} Members</p>
                  </div>
                </div>

                <button className="w-full py-2 bg-white hover:bg-slate-50 border border-indigo-200 text-indigo-600 rounded-xl text-xs font-black transition-colors cursor-pointer mt-2">
                  View Patient Profile
                </button>
              </div>
            )}
          </div>

          {/* Card 2: Checklist Summary */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-xs">Checklist Summary</h3>

            {/* Donut Progress Ring */}
            <div className="flex items-center gap-6">
              <div className="relative flex items-center justify-center shrink-0">
                <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-blue-500" strokeWidth="4" strokeDasharray={`${selectedPatient?.progressPercentage || 70}, 100`} stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-lg font-black text-slate-900">{selectedPatient?.progressPercentage || 70}%</span>
                  <span className="text-[9px] font-bold text-slate-400">Completed</span>
                </div>
              </div>

              {/* Progress Breakdown */}
              <div className="space-y-1.5 text-xs font-semibold text-slate-600 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    <span>Completed</span>
                  </div>
                  <span className="font-extrabold text-slate-900">{selectedPatient?.completedItemsCount || 7}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    <span>In Progress</span>
                  </div>
                  <span className="font-extrabold text-slate-900">{selectedPatient?.inProgressItemsCount || 4}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    <span>Pending</span>
                  </div>
                  <span className="font-extrabold text-slate-900">{selectedPatient?.pendingItemsCount || 2}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                    <span>Not Started</span>
                  </div>
                  <span className="font-extrabold text-slate-900">{selectedPatient?.notStartedItemsCount || 1}</span>
                </div>
              </div>
            </div>

            <p className="text-[10px] font-semibold text-slate-400 border-t border-slate-100 pt-2">
              Total Items: {selectedPatient?.totalItemsCount || 14}
            </p>
          </div>

          {/* Card 3: Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-2.5">
            <h3 className="font-extrabold text-slate-900 text-xs">Quick Actions</h3>

            <button
              onClick={() => setShowModal(true)}
              className="w-full flex items-center gap-2.5 py-2 px-3 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl text-xs font-black transition-colors cursor-pointer text-left"
            >
              <ClipboardCheck className="h-4 w-4 shrink-0 text-indigo-600" />
              <span>Start New Checklist</span>
            </button>

            <button
              onClick={() => setShowTemplateModal(true)}
              className="w-full flex items-center gap-2.5 py-2 px-3 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl text-xs font-black transition-colors cursor-pointer text-left"
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span>Discharge Instructions Template</span>
            </button>

            <button
              onClick={() => setShowEducationModal(true)}
              className="w-full flex items-center gap-2.5 py-2 px-3 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl text-xs font-black transition-colors cursor-pointer text-left"
            >
              <Shield className="h-4 w-4 shrink-0" />
              <span>Patient Education Materials</span>
            </button>

            <button
              onClick={() => window.print()}
              className="w-full flex items-center gap-2.5 py-2 px-3 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl text-xs font-black transition-colors cursor-pointer text-left"
            >
              <Printer className="h-4 w-4 shrink-0" />
              <span>Print Discharge Summary</span>
            </button>

            <button
              onClick={() => navigate('/reports')}
              className="w-full flex items-center gap-2.5 py-2 px-3 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl text-xs font-black transition-colors cursor-pointer text-left"
            >
              <Eye className="h-4 w-4 shrink-0" />
              <span>View Discharge Reports</span>
            </button>
          </div>

        </div>

      </div>

      {/* Start New Checklist Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base">Start New Discharge Checklist</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateChecklist} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Select Patient <span className="text-rose-500">*</span></label>
                <select
                  required
                  value={selectedPatientId}
                  onChange={(e) => handleSelectPatientForDischarge(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">-- Select Patient --</option>
                  {patientsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.patientId ? `(${p.patientId})` : ''} - Room {p.roomNumber || 'N/A'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Patient Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter patient full name"
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Room Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 302"
                    value={newRoomNumber}
                    onChange={(e) => setNewRoomNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Care Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. Cardiology Unit"
                    value={newCareUnit}
                    onChange={(e) => setNewCareUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Attending Doctor</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Sarah Wilson"
                  value={newDoctor}
                  onChange={(e) => setNewDoctor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Expected Discharge Date</label>
                <input
                  type="text"
                  placeholder="e.g. May 24, 2024"
                  value={newDischargeDate}
                  onChange={(e) => setNewDischargeDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20"
                >
                  Start Checklist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Discharge Instructions Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <FileText className="h-4 w-4" />
                </div>
                <h3 className="font-black text-slate-900 text-base">Discharge Instructions Template</h3>
              </div>
              <button onClick={() => setShowTemplateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <p className="font-extrabold text-slate-900">Standard Post-Discharge Care Plan</p>
                <p>1. Follow prescribed medication schedule precisely. Do not discontinue without physician approval.</p>
                <p>2. Keep surgical incision sites dry and clean. Monitor for redness or swelling.</p>
                <p>3. Attend scheduled follow-up consultation within 7 days.</p>
                <p>4. Seek emergency medical attention immediately if experiencing shortness of breath or chest pain.</p>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs"
              >
                Close Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Education Materials Modal */}
      {showEducationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Shield className="h-4 w-4" />
                </div>
                <h3 className="font-black text-slate-900 text-base">Patient Education Materials</h3>
              </div>
              <button onClick={() => setShowEducationModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl">
                <p className="font-extrabold text-emerald-900 mb-1">Available Patient Pamphlets & Guides</p>
                <ul className="list-disc pl-5 space-y-1 text-slate-700">
                  <li>Cardiovascular Health & Home Recovery Protocol</li>
                  <li>Diabetic Diet, Blood Sugar Tracking & Insulin Safety</li>
                  <li>Wound Care & Suture Management Guide</li>
                  <li>Mobility Exercises & Fall Prevention at Home</li>
                </ul>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowEducationModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DischargeChecklistPage;

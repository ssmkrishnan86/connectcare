import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  Sun,
  Search,
  Bell,
  MessageSquare,
  Calendar,
  ChevronDown,
  ChevronUp,
  Plus,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Activity,
  Heart,
  Thermometer,
  Wind,
  AlertCircle
} from 'lucide-react';

export const VitalRoundsPage: React.FC = () => {
  const { user } = useAuth();
  const [vitals, setVitals] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    totalPatients: 24,
    inpatientsCount: 12,
    outpatientsCount: 12,
    completed: 18,
    pending: 4,
    overdue: 2,
    onTimeCount: 16,
    completedLateCount: 2,
    averageCompletionTime: '5m 20s',
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState("Today's Rounds");
  const [careUnitFilter, setCareUnitFilter] = useState('All');
  const [patientFilter, setPatientFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter] = useState('May 22, 2024');

  // Selected Patient for Right Sidebar Panel
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);

  // Modal State for Recording Vitals
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [targetPatientForModal, setTargetPatientForModal] = useState<any | null>(null);

  // Modal Form Inputs
  const [bpInput, setBpInput] = useState('120/80 mmHg');
  const [hrInput, setHrInput] = useState('82 bpm');
  const [tempInput, setTempInput] = useState('98.6 °F');
  const [spo2Input, setSpo2Input] = useState('98 %');
  const [rrInput, setRrInput] = useState('18 /min');
  const [painInput, setPainInput] = useState('2/10');
  const [nurseNameInput, setNurseNameInput] = useState(user?.username ? `Nurse ${user.username}` : 'Emma Johnson');

  const fetchVitalData = async () => {
    setLoading(true);
    try {
      let statusParam: string | undefined = undefined;
      if (activeTab === 'Overdue Rounds') statusParam = 'Overdue';
      else if (statusFilter !== 'All') statusParam = statusFilter;

      const [listRes, sumRes] = await Promise.all([
        api.getVitalRounds(statusParam, search),
        api.getVitalRoundSummary(),
      ]);

      const listData = Array.isArray(listRes) ? listRes : (listRes as any)?.data || [];
      setVitals(listData);

      if (listData.length > 0 && !selectedPatient) {
        setSelectedPatient(listData[0]);
      }

      const sumData = (sumRes as any)?.data || sumRes;
      if (sumData) {
        setSummary(sumData);
      }
    } catch (err) {
      console.error('Failed to load vital round data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVitalData();
  }, [activeTab, statusFilter, careUnitFilter, patientFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVitalData();
  };

  const handleOpenRecordModal = (patient: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTargetPatientForModal(patient);
    setSelectedPatient(patient);
    setBpInput(patient.bloodPressure || '120/80 mmHg');
    setHrInput(patient.heartRate || '82 bpm');
    setTempInput(patient.temperature || '98.6 °F');
    setSpo2Input(patient.spO2 || '98 %');
    setRrInput(patient.respiratoryRate || '18 /min');
    setPainInput(patient.painScore || '2/10');
    setShowRecordModal(true);
  };

  const handleSaveVitalsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPatientForModal) return;

    try {
      const updated = await api.recordVitals(targetPatientForModal.id, {
        bloodPressure: bpInput,
        heartRate: hrInput,
        temperature: tempInput,
        spO2: spo2Input,
        respiratoryRate: rrInput,
        painScore: painInput,
        nurseName: nurseNameInput,
      });

      const updatedRecord = updated?.data || updated;
      setShowRecordModal(false);

      if (selectedPatient?.id === targetPatientForModal.id) {
        setSelectedPatient(updatedRecord || { ...targetPatientForModal, bloodPressure: bpInput, heartRate: hrInput, temperature: tempInput, spO2: spo2Input, respiratoryRate: rrInput, painScore: painInput, status: 'Completed' });
      }

      fetchVitalData();
    } catch (err) {
      console.error('Failed to save vitals:', err);
    }
  };

  const getStatusPill = (status: string, nextDueRelative?: string) => {
    if (status === 'Overdue' || (nextDueRelative && nextDueRelative.toLowerCase().includes('overdue'))) {
      return (
        <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-rose-50 text-rose-600 border border-rose-200">
          Overdue
        </span>
      );
    }
    if (status === 'Completed') {
      return (
        <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-200">
          Completed
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-amber-50 text-amber-600 border border-amber-200">
        Pending
      </span>
    );
  };

  const isDoctor = user?.role?.toLowerCase() === 'doctor';

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 space-y-5 p-6 max-w-[1700px] mx-auto select-none">
      
      {/* 1. Top Header Bar (Nurse View Only) */}
      {!isDoctor && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Vital Rounds</h1>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Record, monitor and review patient vital signs.
            </p>
          </div>

          {/* Controls Right */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Shift Selector */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
              <Sun className="h-4 w-4 text-amber-500 fill-amber-400" />
              <div className="flex flex-col text-[11px]">
                <span className="font-extrabold text-slate-900 flex items-center gap-1">
                  Day Shift <ChevronDown className="h-3 w-3 text-slate-400" />
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">07:00 AM - 03:00 PM</span>
              </div>
            </div>

            {/* Search Box */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search patients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-52 sm:w-64"
              />
            </form>

            {/* Icon Badges */}
            <button className="relative p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer" title="Messages">
              <MessageSquare className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center">8</span>
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

      {/* 2. Secondary Sub-Header Navigation Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6">
        {[
          "Today's Rounds",
          "My Rounds",
          "Rounds History",
          "Overdue Rounds"
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-xs font-bold transition-all relative cursor-pointer ${
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

      {/* 3. Filter Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search patients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 sm:w-56"
            />
          </form>

          {/* Date Picker */}
          <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer">
            <Calendar className="h-4 w-4 text-slate-500" />
            <span>{dateFilter}</span>
          </div>

          {/* All Units / Floors */}
          <select
            value={careUnitFilter}
            onChange={(e) => setCareUnitFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
          >
            <option value="All">All Units / Floors</option>
            <option value="Cardiology Unit">Cardiology Unit</option>
            <option value="Medical Unit">Medical Unit</option>
            <option value="Surgical Unit">Surgical Unit</option>
            <option value="General Ward">General Ward</option>
            <option value="Maternity Unit">Maternity Unit</option>
          </select>

          {/* All Patients */}
          <select
            value={patientFilter}
            onChange={(e) => setPatientFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
          >
            <option value="All">All Patients</option>
            <option value="Inpatients">Inpatients (12)</option>
            <option value="Outpatients">Outpatients (12)</option>
          </select>

          {/* All Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending (4)</option>
            <option value="Overdue">Overdue (2)</option>
            <option value="Completed">Completed (18)</option>
          </select>

          {/* Filters Button */}
          <button className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Start New Round Button */}
        <button
          onClick={() => {
            if (vitals.length > 0) handleOpenRecordModal(vitals[0]);
          }}
          className="flex items-center gap-1.5 px-4 py-2 border-2 border-indigo-600 bg-white text-indigo-600 hover:bg-indigo-50 font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          Start New Round
        </button>
      </div>

      {/* 4. Split Layout (Left Table & Stats + Right Selected Patient Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Stats + Table + Summary (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Top 4 Stat Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            
            {/* Total Patients */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-purple-100/70 text-purple-600 flex items-center justify-center font-bold shrink-0">
                <Users className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 leading-none">{summary.totalPatients}</p>
                <p className="text-[11px] font-bold text-slate-500 mt-1">Total Patients</p>
                <p className="text-[10px] font-semibold text-slate-400 mt-0.5">12 Inpatients • 12 Outpatients</p>
              </div>
            </div>

            {/* Completed */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                <CheckCircle2 className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 leading-none">{summary.completed}</p>
                <p className="text-[11px] font-bold text-slate-500 mt-1">Completed</p>
                <p className="text-[10px] font-semibold text-slate-400 mt-0.5">75%</p>
              </div>
            </div>

            {/* Pending */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-amber-100/70 text-amber-600 flex items-center justify-center font-bold shrink-0">
                <Clock className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 leading-none">{summary.pending}</p>
                <p className="text-[11px] font-bold text-slate-500 mt-1">Pending</p>
                <p className="text-[10px] font-semibold text-slate-400 mt-0.5">17%</p>
              </div>
            </div>

            {/* Overdue */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-rose-100/70 text-rose-600 flex items-center justify-center font-bold shrink-0">
                <AlertCircle className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 leading-none">{summary.overdue}</p>
                <p className="text-[11px] font-bold text-slate-500 mt-1">Overdue</p>
                <p className="text-[10px] font-semibold text-slate-400 mt-0.5">8%</p>
              </div>
            </div>
          </div>

          {/* Patients for Vital Rounds Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm">Patients for Vital Rounds</h3>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs font-bold text-slate-400">
                Loading patients for vital rounds...
              </div>
            ) : vitals.length === 0 ? (
              <div className="p-12 text-center text-xs font-bold text-slate-400">
                No patient vital rounds matching filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Patient</th>
                      <th className="py-3 px-4">Room / Bed</th>
                      <th className="py-3 px-4">Last Round</th>
                      <th className="py-3 px-4">Next Due</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold">
                    {vitals.map((v) => {
                      const isSelected = selectedPatient?.id === v.id;
                      const isOverdue = v.status === 'Overdue' || (v.nextDueRelativeText && v.nextDueRelativeText.toLowerCase().includes('overdue'));

                      return (
                        <tr
                          key={v.id}
                          onClick={() => setSelectedPatient(v)}
                          className={`transition-colors cursor-pointer ${
                            isSelected ? 'bg-indigo-50/50 hover:bg-indigo-50/80' : 'hover:bg-slate-50/70'
                          }`}
                        >
                          {/* Patient */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              {v.patientAvatar ? (
                                <img
                                  src={v.patientAvatar}
                                  alt={v.patientName}
                                  className="h-9 w-9 rounded-full object-cover border border-slate-200 shrink-0"
                                />
                              ) : (
                                <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-200 shrink-0">
                                  {v.patientName ? v.patientName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'PT'}
                                </div>
                              )}
                              <div>
                                <p className="font-extrabold text-slate-900 text-xs hover:text-indigo-600 transition-colors">
                                  {v.patientName}
                                </p>
                                <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                                  {v.ageGender || '68 Y • F'} • {v.patientIdCode || 'PT-10001'}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Room / Bed */}
                          <td className="py-3.5 px-4">
                            <p className="font-extrabold text-slate-900">{v.roomBed || '302'}</p>
                            <p className="text-[10px] font-semibold text-slate-400">{v.careUnit || 'Cardiology Unit'}</p>
                          </td>

                          {/* Last Round */}
                          <td className="py-3.5 px-4">
                            <p className="font-extrabold text-slate-900">{v.lastRoundTimeText || '08:00 AM'}</p>
                            <p className="text-[10px] font-semibold text-slate-400">{v.lastRoundDateText || 'May 22, 2024'}</p>
                          </td>

                          {/* Next Due */}
                          <td className="py-3.5 px-4">
                            {isOverdue ? (
                              <div>
                                <p className="font-black text-rose-600">Overdue</p>
                                <p className="text-[10px] font-bold text-rose-500">{v.nextDueRelativeText || '15 mins'}</p>
                              </div>
                            ) : (
                              <div>
                                <p className="font-extrabold text-slate-900">{v.nextDueTimeText || '12:00 PM'}</p>
                                <p className="text-[10px] font-bold text-amber-500">{v.nextDueRelativeText || 'Due in 1h 15m'}</p>
                              </div>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            {getStatusPill(v.status, v.nextDueRelativeText)}
                          </td>

                          {/* Action */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={(e) => handleOpenRecordModal(v, e)}
                              className={`px-3.5 py-1.5 rounded-xl border font-extrabold text-xs transition-all cursor-pointer ${
                                isOverdue
                                  ? 'border-rose-300 text-rose-600 hover:bg-rose-50'
                                  : 'border-indigo-300 text-indigo-600 hover:bg-indigo-50'
                              }`}
                            >
                              Record Vitals
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Table Pagination Footer */}
            <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Showing 1 to {vitals.length} of {summary.totalPatients} patients</span>
              
              <div className="flex items-center gap-1.5">
                <button className="h-7 w-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button className="h-7 w-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                  1
                </button>
                <button className="h-7 w-7 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 flex items-center justify-center text-xs cursor-pointer font-bold">
                  2
                </button>
                <button className="h-7 w-7 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 flex items-center justify-center text-xs cursor-pointer font-bold">
                  3
                </button>
                <button className="h-7 w-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Section: Round Completion Summary */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-sm">Round Completion Summary</h3>
              <div className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl cursor-pointer">
                <span>Today</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>

            {/* 5 Bottom Metric Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              
              {/* Donut Chart / Progress Card */}
              <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 flex items-center gap-3">
                <div className="relative h-10 w-10 shrink-0 flex items-center justify-center">
                  <svg className="w-10 h-10 transform -rotate-90">
                    <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3.5" className="text-slate-200" fill="transparent" />
                    <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3.5" className="text-indigo-600" fill="transparent" strokeDasharray="100" strokeDashoffset="21" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Rounds Completed</p>
                  <p className="text-base font-black text-slate-900">18 <span className="text-xs font-semibold text-slate-400">/ 24</span></p>
                  <p className="text-[10px] font-bold text-indigo-600">79%</p>
                </div>
              </div>

              {/* On Time */}
              <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">On Time</p>
                  <p className="text-base font-black text-slate-900">16</p>
                  <p className="text-[10px] font-bold text-emerald-600">67%</p>
                </div>
              </div>

              {/* Completed Late */}
              <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-amber-100/70 text-amber-600 flex items-center justify-center font-bold shrink-0">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Completed Late</p>
                  <p className="text-base font-black text-slate-900">2</p>
                  <p className="text-[10px] font-bold text-amber-600">8%</p>
                </div>
              </div>

              {/* Overdue */}
              <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-rose-100/70 text-rose-600 flex items-center justify-center font-bold shrink-0">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Overdue</p>
                  <p className="text-base font-black text-slate-900">2</p>
                  <p className="text-[10px] font-bold text-rose-600">8%</p>
                </div>
              </div>

              {/* Average Completion Time */}
              <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-indigo-100/70 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Avg Completion Time</p>
                  <p className="text-base font-black text-slate-900">5m 20s</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Persistent Selected Patient Panel (4 Columns) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-5 sticky top-6">
          
          {/* Panel Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider text-slate-400">Selected Patient</h3>
            <button
              onClick={() => setIsPanelExpanded(!isPanelExpanded)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 cursor-pointer"
            >
              {isPanelExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          {selectedPatient && isPanelExpanded && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              {/* Patient Banner */}
              <div className="flex items-center gap-3.5">
                {selectedPatient.patientAvatar ? (
                  <img
                    src={selectedPatient.patientAvatar}
                    alt={selectedPatient.patientName}
                    className="h-14 w-14 rounded-full object-cover border-2 border-indigo-200 shadow-xs shrink-0"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xl border-2 border-indigo-200 shadow-xs shrink-0">
                    {selectedPatient.patientName ? selectedPatient.patientName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'PT'}
                  </div>
                )}
                <div>
                  <h3 className="font-black text-slate-900 text-base leading-tight">{selectedPatient.patientName}</h3>
                  <p className="text-[11px] font-bold text-slate-400 mt-0.5">PID: {selectedPatient.patientIdCode || 'PT-10001'}</p>
                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                    {selectedPatient.ageGender || '68 Y • Female'} • {selectedPatient.bloodGroup || 'A+'}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-500">
                    Room {selectedPatient.roomBed || '302'} • {selectedPatient.careUnit || 'Cardiology Unit'}
                  </p>

                  <div className="mt-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-700">
                      Inpatient
                    </span>
                  </div>
                </div>
              </div>

              {/* 3 Metric Box Grid */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Attending Doctor</p>
                  <p className="font-extrabold text-slate-800 text-[11px] mt-0.5 truncate">{selectedPatient.attendingDoctorName || 'Dr. Sarah Wilson'}</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Care Team</p>
                  <p className="font-extrabold text-slate-800 text-[11px] mt-0.5">{selectedPatient.careTeamMembersCount || 3} Members</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">LOS</p>
                  <p className="font-extrabold text-slate-800 text-[11px] mt-0.5">{selectedPatient.lengthOfStayText || '4 Days'}</p>
                </div>
              </div>

              {/* Last Vital Round Box */}
              <div className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100/80 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Last Vital Round</p>
                  <button className="px-2.5 py-1 bg-white border border-indigo-200 text-indigo-600 rounded-lg text-[10px] font-extrabold hover:bg-indigo-50 transition-colors cursor-pointer">
                    View History
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="text-indigo-600 font-black">{selectedPatient.lastRoundTimeText || '08:00 AM'} <span className="text-[10px] text-slate-500 font-semibold">{selectedPatient.lastRoundDateText || 'May 22, 2024'}</span></span>
                  <span className="text-[11px] text-slate-500 font-semibold">Recorded by <strong className="text-slate-800">{selectedPatient.recordedByNurseName || 'Emma Johnson'}</strong></span>
                </div>
              </div>

              {/* Latest Vitals List */}
              <div className="space-y-2.5 pt-1">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Latest Vitals</h4>
                
                <div className="space-y-2 text-xs font-extrabold text-slate-800">
                  
                  {/* BP */}
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2.5 text-slate-600">
                      <div className="h-7 w-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <Activity className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-bold text-slate-700 text-xs">Blood Pressure</span>
                    </div>
                    <span className="text-slate-900 font-black">{selectedPatient.bloodPressure || '120/80 mmHg'}</span>
                  </div>

                  {/* Heart Rate */}
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2.5 text-slate-600">
                      <div className="h-7 w-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                        <Heart className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-bold text-slate-700 text-xs">Heart Rate</span>
                    </div>
                    <span className="text-slate-900 font-black">{selectedPatient.heartRate || '82 bpm'}</span>
                  </div>

                  {/* Temperature */}
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2.5 text-slate-600">
                      <div className="h-7 w-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                        <Thermometer className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-bold text-slate-700 text-xs">Temperature</span>
                    </div>
                    <span className="text-slate-900 font-black">{selectedPatient.temperature || '98.6 °F'}</span>
                  </div>

                  {/* SpO2 */}
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2.5 text-slate-600">
                      <div className="h-7 w-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Wind className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-bold text-slate-700 text-xs">SpO₂</span>
                    </div>
                    <span className="text-slate-900 font-black">{selectedPatient.spO2 || '98 %'}</span>
                  </div>

                  {/* Respiratory Rate */}
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2.5 text-slate-600">
                      <div className="h-7 w-7 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center">
                        <Wind className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-bold text-slate-700 text-xs">Respiratory Rate</span>
                    </div>
                    <span className="text-slate-900 font-black">{selectedPatient.respiratoryRate || '18 /min'}</span>
                  </div>

                  {/* Pain Score */}
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2.5 text-slate-600">
                      <div className="h-7 w-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                        <AlertTriangle className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-bold text-slate-700 text-xs">Pain Score</span>
                    </div>
                    <span className="text-slate-900 font-black">{selectedPatient.painScore || '2/10'}</span>
                  </div>
                </div>
              </div>

              {/* Big Primary Full Width Action Button */}
              <button
                onClick={() => handleOpenRecordModal(selectedPatient)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-600/25 transition-all cursor-pointer mt-4"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                Record New Vitals
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Record Vitals Modal */}
      {showRecordModal && targetPatientForModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base">Record Vitals for {targetPatientForModal.patientName}</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  {targetPatientForModal.patientIdCode} • Room {targetPatientForModal.roomBed} ({targetPatientForModal.careUnit})
                </p>
              </div>
              <button onClick={() => setShowRecordModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVitalsSubmit} className="space-y-4 text-xs font-bold text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Blood Pressure</label>
                  <input
                    type="text"
                    required
                    value={bpInput}
                    onChange={(e) => setBpInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block mb-1">Heart Rate</label>
                  <input
                    type="text"
                    required
                    value={hrInput}
                    onChange={(e) => setHrInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Body Temperature</label>
                  <input
                    type="text"
                    required
                    value={tempInput}
                    onChange={(e) => setTempInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block mb-1">SpO2 Oxygen</label>
                  <input
                    type="text"
                    required
                    value={spo2Input}
                    onChange={(e) => setSpo2Input(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Respiratory Rate</label>
                  <input
                    type="text"
                    required
                    value={rrInput}
                    onChange={(e) => setRrInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block mb-1">Pain Score</label>
                  <input
                    type="text"
                    required
                    value={painInput}
                    onChange={(e) => setPainInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Recorded By Nurse</label>
                <input
                  type="text"
                  required
                  value={nurseNameInput}
                  onChange={(e) => setNurseNameInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-extrabold shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  Save Vitals to DB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

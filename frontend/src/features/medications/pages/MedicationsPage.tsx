import React, { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  Search,
  Calendar,
  ChevronDown,
  Filter,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  ChevronLeft,
  ChevronRight,
  List,
  Grid,
  Pill,
  Plus,
  Package,
  ShieldCheck,
  MoreVertical,
  X,
  ChevronUp
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { AddPRNMedicationModal } from '../components/AddPRNMedicationModal';
import { MedicationInventoryModal } from '../components/MedicationInventoryModal';
import { DrugInteractionModal } from '../components/DrugInteractionModal';

export const MedicationsPage: React.FC = () => {
  const { user } = useAuth();
  const [medications, setMedications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('Medication Round');
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');

  // Filters
  const [careUnitFilter, setCareUnitFilter] = useState('All');
  const [patientFilter, setPatientFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter] = useState('May 22, 2024');

  // Selected Patient
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [isPatientPanelOpen, setIsPatientPanelOpen] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modal States
  const [isAddPRNModalOpen, setIsAddPRNModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);

  // Selected Medications Checkboxes
  const [selectedMedIds, setSelectedMedIds] = useState<Record<string, boolean>>({});

  const fetchMedicationData = async () => {
    setLoading(true);
    try {
      const data = await api.getMedications(search);
      const list = Array.isArray(data) ? data : (data as any)?.data || [];
      setMedications(list);

      if (list.length > 0 && !selectedPatient) {
        setSelectedPatient({
          name: list[0].patientName || 'Patricia Smith',
          patientIdCode: list[0].patientIdCode || 'PT-10001',
          ageGender: list[0].ageGender || '68 Y • Female • A+',
          roomBed: list[0].roomBed || '302',
          careUnit: list[0].careUnit || 'Cardiology Unit',
          avatar: list[0].patientAvatar || '',
          attendingDoctorName: 'Dr. Sarah Wilson',
          careTeamMembersCount: 3,
          lengthOfStayText: '4 Days',
        });
      }
    } catch (err) {
      console.error('Failed to load medication data from database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicationData();
  }, [activeTab, statusFilter, careUnitFilter, patientFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMedicationData();
  };

  const handleAdministerMedication = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const med = medications.find((m) => m.id === id);
      if (med) {
        const updatedMed = {
          ...med,
          status: 'Given',
          administeredBy: user?.username ? `Nurse ${user.username}` : 'Emma Johnson',
          administeredTime: '08:00 AM',
          relativeTimeText: 'Given',
        };
        await api.updateMedication(id, updatedMed);
        fetchMedicationData();
      }
    } catch (err) {
      console.error('Failed to administer medication:', err);
    }
  };

  const handleStartRound = async () => {
    if (!window.confirm('Start Medication Round? This will mark pending and overdue medications as Given.')) return;
    try {
      const res = await api.startMedicationRound();
      fetchMedicationData();
      alert(res?.message || 'Medication Round started successfully!');
    } catch (err) {
      console.error('Failed to start medication round:', err);
    }
  };

  const handleViewAll = () => {
    setStatusFilter('All');
    setCareUnitFilter('All');
    setPatientFilter('All');
    setSearch('');
    setActiveTab('Medication Round');
  };

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    const newSelected: Record<string, boolean> = {};
    medications.forEach((m) => {
      newSelected[m.id] = checked;
    });
    setSelectedMedIds(newSelected);
  };

  const toggleSelectMed = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setSelectedMedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const givenCount = useMemo(() => medications.filter((m) => m.status === 'Given' || m.status === 'Active').length, [medications]);
  const pendingCount = useMemo(() => medications.filter((m) => m.status === 'Pending').length, [medications]);
  const overdueCount = useMemo(() => medications.filter((m) => m.status === 'Overdue').length, [medications]);

  const filteredMeds = useMemo(() => {
    return medications.filter((m) => {
      // Care Unit Filter
      if (careUnitFilter !== 'All' && !(m.careUnit || '').includes(careUnitFilter)) return false;

      // Status Filter
      if (statusFilter !== 'All' && (m.status || '').toLowerCase() !== statusFilter.toLowerCase()) return false;

      // Tab Filter
      if (activeTab === 'Scheduled') {
        if (m.status !== 'Pending' && m.status !== 'Overdue') return false;
      } else if (activeTab === 'PRN Medications') {
        const isPRN = (m.category || '').toUpperCase() === 'PRN' ||
                      (m.frequency || '').toUpperCase().includes('PRN') ||
                      (m.name || '').toUpperCase().includes('PRN');
        if (!isPRN) return false;
      } else if (activeTab === 'Administration History') {
        if (m.status !== 'Given' && m.status !== 'Active') return false;
      }

      return true;
    });
  }, [medications, careUnitFilter, statusFilter, activeTab]);

  const paginatedMeds = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMeds.slice(start, start + pageSize);
  }, [filteredMeds, currentPage]);

  const totalPages = Math.ceil(filteredMeds.length / pageSize) || 1;

  const getStatusBadge = (status: string, nextDoseRelative?: string) => {
    if (status === 'Given' || status === 'Active') {
      return (
        <div>
          <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-200">
            Given
          </span>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">07:55 AM</p>
        </div>
      );
    }
    if (status === 'Overdue' || (nextDoseRelative && nextDoseRelative.toLowerCase().includes('late'))) {
      return (
        <div>
          <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-rose-50 text-rose-600 border border-rose-200">
            Overdue
          </span>
          <p className="text-[10px] font-bold text-rose-500 mt-0.5">15 min late</p>
        </div>
      );
    }
    return (
      <div>
        <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-amber-50 text-amber-600 border border-amber-200">
          Pending
        </span>
        <p className="text-[10px] font-bold text-amber-500 mt-0.5">Due in 15 min</p>
      </div>
    );
  };

  return (
    <div className="space-y-5 max-w-[1700px] mx-auto select-none font-sans text-slate-800">
      
      {/* Page Header */}
      <PageHeader
        title="Medications"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Medications' },
        ]}
      />

      {/* 2. Secondary Sub-Header Navigation Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6">
        {[
          "Medication Round",
          "Scheduled",
          "PRN Medications",
          "Administration History",
          "Medication Inventory"
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              if (tab === 'Medication Inventory') {
                setIsInventoryModalOpen(true);
              }
            }}
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

      {/* 3. Stat Summary Cards Row (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3.5">
        
        {/* Total Patients */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-purple-100/70 text-purple-600 flex items-center justify-center font-bold shrink-0">
            <Users className="h-5 w-5 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 leading-none">0</p>
            <p className="text-[11px] font-bold text-slate-500 mt-1">Total Patients</p>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Live from DB</p>
          </div>
        </div>

        {/* Given */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 className="h-5 w-5 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 leading-none">{givenCount}</p>
            <p className="text-[11px] font-bold text-slate-500 mt-1">Given</p>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{medications.length ? `${Math.round((givenCount / medications.length) * 100)}%` : '0%'}</p>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-amber-100/70 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <Clock className="h-5 w-5 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 leading-none">{pendingCount}</p>
            <p className="text-[11px] font-bold text-slate-500 mt-1">Pending</p>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{medications.length ? `${Math.round((pendingCount / medications.length) * 100)}%` : '0%'}</p>
          </div>
        </div>

        {/* Overdue */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-rose-100/70 text-rose-600 flex items-center justify-center font-bold shrink-0">
            <AlertTriangle className="h-5 w-5 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 leading-none">{overdueCount}</p>
            <p className="text-[11px] font-bold text-slate-500 mt-1">Overdue</p>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{medications.length ? `${Math.round((overdueCount / medications.length) * 100)}%` : '0%'}</p>
          </div>
        </div>

        {/* Total Medications */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <FileText className="h-5 w-5 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 leading-none">{medications.length}</p>
            <p className="text-[11px] font-bold text-slate-500 mt-1">Total Medications</p>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Live from DB</p>
          </div>
        </div>

      </div>

      {/* 4. Filter Controls Row & View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search patients, medication..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-52 sm:w-64"
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
            <option value="Pending">Pending (8)</option>
            <option value="Given">Given (18)</option>
            <option value="Overdue">Overdue (2)</option>
          </select>

          {/* Filters Button */}
          <button className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters</span>
          </button>
        </div>

        {/* View Switcher Buttons */}
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <List className="h-3.5 w-3.5" />
            List View
          </button>
          <button
            onClick={() => setViewMode('card')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'card'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Grid className="h-3.5 w-3.5" />
            Card View
          </button>
        </div>
      </div>

      {/* 5. Split Layout (Table & Banner Left + Selected Patient Sidebar Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Round Banner + Table + Pagination (8 Columns) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Medication Round Banner */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Pill className="h-4 w-4" />
              </div>
              <h3 className="font-extrabold text-indigo-600 text-sm">Medication Round - 08:00 AM</h3>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs font-extrabold text-amber-600 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                {pendingCount} Medications Pending
              </span>
              <button
                onClick={handleStartRound}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                Start Round
              </button>
            </div>
          </div>

          {/* Medications Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-xs font-bold text-slate-400">
                Loading medication records from database...
              </div>
            ) : paginatedMeds.length === 0 ? (
              <div className="p-12 text-center text-xs font-bold text-slate-400">
                No medications found matching filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-3 w-8">
                        <input
                          type="checkbox"
                          onChange={toggleSelectAll}
                          className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </th>
                      <th className="py-3 px-4">Patient</th>
                      <th className="py-3 px-4">Medication</th>
                      <th className="py-3 px-4">Dose & Route</th>
                      <th className="py-3 px-4">Time</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Administered By</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold">
                    {paginatedMeds.map((m) => {
                      const isSelected = selectedPatient?.patientIdCode === m.patientIdCode || selectedPatient?.name === m.patientName;
                      const isGiven = m.status === 'Given';

                      return (
                        <tr
                          key={m.id}
                          onClick={() =>
                            setSelectedPatient({
                              name: m.patientName || 'Patricia Smith',
                              patientIdCode: m.patientIdCode || 'PT-10001',
                              ageGender: m.ageGender || '68 Y • Female • A+',
                              roomBed: m.roomBed || '302',
                              careUnit: m.careUnit || 'Cardiology Unit',
                              avatar: m.patientAvatar || '',
                              attendingDoctorName: 'Dr. Sarah Wilson',
                              careTeamMembersCount: 3,
                              lengthOfStayText: '4 Days',
                            })
                          }
                          className={`transition-colors cursor-pointer ${
                            isSelected ? 'bg-indigo-50/50 hover:bg-indigo-50/80' : 'hover:bg-slate-50/70'
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-3.5 px-3">
                            <input
                              type="checkbox"
                              checked={!!selectedMedIds[m.id]}
                              onChange={(e) => toggleSelectMed(m.id, e)}
                              className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                          </td>

                          {/* Patient */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              {m.patientAvatar ? (
                                <img
                                  src={m.patientAvatar.startsWith('http') || m.patientAvatar.startsWith('data:') || m.patientAvatar.startsWith('/') ? m.patientAvatar : `/${m.patientAvatar}`}
                                  alt={m.patientName}
                                  className="h-9 w-9 rounded-full object-cover border border-slate-200 shrink-0"
                                />
                              ) : (
                                <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 border border-indigo-200">
                                  {m.patientName ? m.patientName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'PT'}
                                </div>
                              )}
                              <div>
                                <p className="font-extrabold text-slate-900 text-xs hover:text-indigo-600 transition-colors">
                                  {m.patientName}
                                </p>
                                <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                                  Room {m.roomBed || '302'} • {m.ageGender || '68 Y • F'}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Medication */}
                          <td className="py-3.5 px-4">
                            <p className="font-extrabold text-slate-900">{m.name || 'Metoprolol 50 mg'}</p>
                            <p className="text-[10px] font-semibold text-slate-400">{m.form || 'Tablet'}</p>
                          </td>

                          {/* Dose & Route */}
                          <td className="py-3.5 px-4">
                            <p className="font-extrabold text-slate-900">{m.dosage || '50 mg'}</p>
                            <p className="text-[10px] font-semibold text-slate-400">{m.route || 'Oral'}</p>
                          </td>

                          {/* Time */}
                          <td className="py-3.5 px-4 font-extrabold text-slate-900">
                            {m.nextDoseTime || '08:00 AM'}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            {getStatusBadge(m.status, m.relativeTimeText)}
                          </td>

                          {/* Administered By */}
                          <td className="py-3.5 px-4">
                            {isGiven ? (
                              <div>
                                <p className="font-extrabold text-slate-900">{m.administeredBy || 'Emma Johnson'}</p>
                                <p className="text-[10px] font-semibold text-slate-400">{m.administeredTime || '07:55 AM'}</p>
                              </div>
                            ) : (
                              <span className="text-slate-400 font-bold">-</span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {isGiven ? (
                                <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                  <CheckCircle2 className="h-4 w-4" />
                                </div>
                              ) : (
                                <button
                                  onClick={(e) => handleAdministerMedication(m.id, e)}
                                  className="px-3.5 py-1.5 rounded-xl border border-indigo-300 text-indigo-600 hover:bg-indigo-50 font-extrabold text-xs transition-all cursor-pointer"
                                >
                                  Administer
                                </button>
                              )}
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="text-slate-400 hover:text-slate-600 p-1"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </div>
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
              <span>Showing {filteredMeds.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredMeds.length)} of {filteredMeds.length} medications</span>
              
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="h-7 w-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    onClick={() => setCurrentPage(pg)}
                    className={`h-7 w-7 rounded-lg font-bold flex items-center justify-center text-xs cursor-pointer ${
                      currentPage === pg
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className="h-7 w-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Persistent Sidebar Panels (4 Columns) */}
        <div className="lg:col-span-4 space-y-4 sticky top-6">
          
          {/* Card 1: Selected Patient Box */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider text-slate-400">Selected Patient</h3>
              <button
                onClick={() => setIsPatientPanelOpen(!isPatientPanelOpen)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                {isPatientPanelOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>

            {selectedPatient && isPatientPanelOpen && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Info Banner */}
                <div className="flex items-center gap-3.5">
                  {selectedPatient.avatar ? (
                    <img
                      src={selectedPatient.avatar.startsWith('http') || selectedPatient.avatar.startsWith('data:') || selectedPatient.avatar.startsWith('/') ? selectedPatient.avatar : `/${selectedPatient.avatar}`}
                      alt={selectedPatient.name}
                      className="h-14 w-14 rounded-full object-cover border-2 border-indigo-200 shadow-xs shrink-0"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0 border border-indigo-200">
                      {selectedPatient.name ? selectedPatient.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'PT'}
                    </div>
                  )}
                  <div>
                    <h3 className="font-black text-slate-900 text-base leading-tight">{selectedPatient.name}</h3>
                    <p className="text-[11px] font-bold text-slate-400 mt-0.5">PID: {selectedPatient.patientIdCode || 'PT-10001'}</p>
                    <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                      {selectedPatient.ageGender || '68 Y • Female • A+'}
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

                {/* 3 Metric Cards */}
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
              </div>
            )}
          </div>

          {/* Card 2: Today's Medication Summary Box */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-900 text-xs">Today's Medication Summary</h3>
              <button
                onClick={handleViewAll}
                className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-2 text-xs font-semibold text-slate-700">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Given
                </span>
                <span className="font-extrabold text-slate-900">{givenCount} <span className="text-[10px] text-slate-400">({medications.length ? `${Math.round((givenCount / medications.length) * 100)}%` : '0%'})</span></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600" /> Pending
                </span>
                <span className="font-extrabold text-slate-900">{pendingCount} <span className="text-[10px] text-slate-400">({medications.length ? `${Math.round((pendingCount / medications.length) * 100)}%` : '0%'})</span></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-600" /> Overdue
                </span>
                <span className="font-extrabold text-slate-900">{overdueCount} <span className="text-[10px] text-slate-400">({medications.length ? `${Math.round((overdueCount / medications.length) * 100)}%` : '0%'})</span></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <X className="h-4 w-4 text-blue-600" /> Refused
                </span>
                <span className="font-extrabold text-slate-900">0 <span className="text-[10px] text-slate-400">(0%)</span></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-600" /> On Hold
                </span>
                <span className="font-extrabold text-slate-900">0 <span className="text-[10px] text-slate-400">(0%)</span></span>
              </div>
            </div>
          </div>

          {/* Card 3: Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h3 className="font-extrabold text-slate-900 text-xs">Quick Actions</h3>

            <div className="space-y-2">
              <button
                onClick={() => setIsAddPRNModalOpen(true)}
                className="w-full flex items-center gap-2 px-3.5 py-2.5 border border-indigo-200 rounded-xl text-xs font-extrabold text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Add PRN Medication
              </button>
              <button
                onClick={() => setIsInventoryModalOpen(true)}
                className="w-full flex items-center gap-2 px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Package className="h-4 w-4 text-slate-500" />
                Medication Inventory
              </button>
              <button
                onClick={() => setIsInteractionModalOpen(true)}
                className="w-full flex items-center gap-2 px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4 text-indigo-600" />
                Drug Interaction Check
              </button>
            </div>
          </div>

          {/* Card 4: Next Medication Due Highlight Box */}
          <div className="bg-amber-50/70 rounded-2xl border border-amber-200/80 p-4 space-y-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Next Medication Due</p>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-extrabold text-slate-900 text-xs">Furosemide 20 mg</p>
                <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Room 102 • James Brown</p>
              </div>

              <div className="text-right">
                <p className="font-black text-amber-600 text-xs">08:00 AM</p>
                <p className="text-[10px] font-bold text-amber-500">Due in 15 min</p>
              </div>
            </div>
          </div>

        </div>

      </div>

      <AddPRNMedicationModal
        isOpen={isAddPRNModalOpen}
        onClose={() => setIsAddPRNModalOpen(false)}
        onSuccess={fetchMedicationData}
      />

      <MedicationInventoryModal
        isOpen={isInventoryModalOpen}
        onClose={() => setIsInventoryModalOpen(false)}
      />

      <DrugInteractionModal
        isOpen={isInteractionModalOpen}
        onClose={() => setIsInteractionModalOpen(false)}
      />

    </div>
  );
};

export default MedicationsPage;

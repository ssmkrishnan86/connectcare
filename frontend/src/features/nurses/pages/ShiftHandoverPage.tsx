import React, { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { PageHeader } from '@/components/common/PageHeader';
import { DataImportExportToolbar } from '@/components/common/DataImportExportToolbar';
import { Badge } from '@/components/ui/Badge';
import {
  ArrowRight,
  Bell,
  Printer,
  Info,
  CheckCircle2,
  Users,
  AlertTriangle,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Clock,
  Circle,
  Trash2,
  Save,
  Search,
  X,
  UserCheck,
  FileText
} from 'lucide-react';

export const ShiftHandoverPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  // Primary data states
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Handover Overview' | 'My Handover History' | 'Received Handovers'>('Handover Overview');

  // Interactive Form & Section states
  const [notes, setNotes] = useState('');
  const [autoSaveText, setAutoSaveText] = useState('Just now');
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedTaskIds, setCompletedTaskIds] = useState<Record<string, boolean>>({});

  // Incoming Nurse & Shift states
  const [nursesList, setNursesList] = useState<any[]>([]);
  const [selectedIncomingNurseId, setSelectedIncomingNurseId] = useState<string>('');
  const [selectedIncomingNurseName, setSelectedIncomingNurseName] = useState<string>('');
  const [selectedIncomingNurseRole, setSelectedIncomingNurseRole] = useState<string>('Staff Nurse');
  const [selectedIncomingNurseAvatar, setSelectedIncomingNurseAvatar] = useState<string>('');
  const [currentShift, setCurrentShift] = useState<string>('Day Shift (07:00 AM - 03:00 PM)');
  const [handoverToShift, setHandoverToShift] = useState<string>('Evening Shift (03:00 PM - 11:00 PM)');

  // Patient Table Search & Pagination
  const [patientSearch, setPatientSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // History & Received Handovers states
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [receivedList, setReceivedList] = useState<any[]>([]);
  const [receivedLoading, setReceivedLoading] = useState(false);
  const [receivedSearch, setReceivedSearch] = useState('');

  // Modals
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedDetailHandover, setSelectedDetailHandover] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // -------------------------------------------------------------------------
  // Fetch Handover Overview & Active Nurses
  // -------------------------------------------------------------------------
  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await api.getShiftHandoverOverview(user?.nurseId);
      const overviewData = res?.data || res;
      setData(overviewData);

      const handover = overviewData?.handover;
      if (handover) {
        if (handover.handoverNotes) setNotes(handover.handoverNotes);
        if (handover.incomingNurseName) setSelectedIncomingNurseName(handover.incomingNurseName);
        if (handover.incomingNurseRole) setSelectedIncomingNurseRole(handover.incomingNurseRole);
        if (handover.incomingNurseAvatar) setSelectedIncomingNurseAvatar(handover.incomingNurseAvatar);
        if (handover.currentShift) setCurrentShift(handover.currentShift);
        if (handover.handoverToShift) setHandoverToShift(handover.handoverToShift);
      }
    } catch (err) {
      console.error('Failed to fetch shift handover data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNurses = async () => {
    try {
      const res: any = await api.getNurses();
      const list = Array.isArray(res) ? res : (res?.data || []);
      if (Array.isArray(list)) {
        setNursesList(list);
        if (!selectedIncomingNurseName && list.length > 0) {
          const other = list.find((n: any) => n.name?.toLowerCase() !== (user?.fullName || user?.username || '').toLowerCase()) || list[0];
          if (other) {
            setSelectedIncomingNurseId(other.id);
            setSelectedIncomingNurseName(other.name);
            setSelectedIncomingNurseRole(other.role || 'Staff Nurse');
            setSelectedIncomingNurseAvatar(other.avatar || '');
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch nurses:', err);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.getShiftHandoverHistory();
      setHistoryList(res?.data || res || []);
    } catch (err) {
      console.error('Failed to fetch handover history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchReceived = async () => {
    setReceivedLoading(true);
    try {
      const nurseName = user?.fullName || user?.username;
      const res = await api.getReceivedHandovers(nurseName);
      setReceivedList(res?.data || res || []);
    } catch (err) {
      console.error('Failed to fetch received handovers:', err);
    } finally {
      setReceivedLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchNurses();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'My Handover History') {
      fetchHistory();
    } else if (activeTab === 'Received Handovers') {
      fetchReceived();
    }
  }, [activeTab]);

  // -------------------------------------------------------------------------
  // Handlers: Save Draft, Complete, Discard, Task Toggle
  // -------------------------------------------------------------------------
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await api.saveHandoverDraft({
        notes,
        outgoingNurseName: user?.fullName || user?.username || data?.handover?.outgoingNurseName || 'Current Nurse',
        outgoingNurseRole: user?.role === 'Nurse' ? 'Staff Nurse' : (user?.role || 'Staff Nurse'),
        outgoingNurseAvatar: user?.avatar || '',
        incomingNurseName: selectedIncomingNurseName,
        incomingNurseRole: selectedIncomingNurseRole,
        incomingNurseAvatar: selectedIncomingNurseAvatar,
        currentShift,
        handoverToShift,
      });
      const now = new Date();
      setAutoSaveText(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      toast.success('Shift handover draft saved successfully.', 'Draft Saved');
    } catch (err: any) {
      console.error('Failed to save draft:', err);
      toast.error(err?.message || 'Failed to save shift draft.', 'Save Error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenCompleteConfirm = () => {
    if (!selectedIncomingNurseName) {
      toast.warning('Please select an incoming nurse before completing handover.', 'Missing Information');
      return;
    }
    setConfirmCompleteOpen(true);
  };

  const handleConfirmComplete = async () => {
    setIsCompleting(true);
    try {
      const completedIds = Object.keys(completedTaskIds).filter(id => completedTaskIds[id]);
      await api.completeShiftHandover({
        notes,
        outgoingNurseName: user?.fullName || user?.username || data?.handover?.outgoingNurseName || 'Current Nurse',
        outgoingNurseRole: user?.role === 'Nurse' ? 'Staff Nurse' : (user?.role || 'Staff Nurse'),
        outgoingNurseAvatar: user?.avatar || '',
        incomingNurseName: selectedIncomingNurseName,
        incomingNurseRole: selectedIncomingNurseRole,
        incomingNurseAvatar: selectedIncomingNurseAvatar,
        currentShift,
        handoverToShift,
        completedTaskIds: completedIds,
      });

      setIsCompleted(true);
      setConfirmCompleteOpen(false);
      toast.success(
        `Shift handover to ${selectedIncomingNurseName} finalized successfully! Notification dispatched.`,
        'Handover Completed'
      );
      await fetchOverview();
    } catch (err: any) {
      console.error('Failed to complete handover:', err);
      toast.error(err?.message || 'Failed to complete handover.', 'Completion Failed');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDiscardHandover = () => {
    setNotes('');
    setCompletedTaskIds({});
    toast.info('Draft notes and checklist have been reset.', 'Handover Reset');
  };

  const toggleTask = (taskId: string) => {
    setCompletedTaskIds(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const handleSelectIncomingNurse = (nurseId: string) => {
    setSelectedIncomingNurseId(nurseId);
    const n = nursesList.find(item => item.id === nurseId);
    if (n) {
      setSelectedIncomingNurseName(n.name);
      setSelectedIncomingNurseRole(n.role || 'Staff Nurse');
      setSelectedIncomingNurseAvatar(n.avatar || '');
    }
  };

  const handleOpenDetailModal = async (handoverId: string) => {
    setDetailLoading(true);
    setViewModalOpen(true);
    try {
      const res = await api.getShiftHandoverById(handoverId);
      setSelectedDetailHandover(res?.data || res);
    } catch (err) {
      console.error('Failed to load handover details:', err);
      toast.error('Failed to load handover details.', 'Error');
      setViewModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handlePrintHandover = () => {
    window.print();
  };

  // -------------------------------------------------------------------------
  // Live Computed Data & Metrics
  // -------------------------------------------------------------------------
  const patientSummaries: any[] = data?.patientSummaries || [];
  const pendingTasksList: any[] = data?.pendingTasks || [];
  const recentAlertsList: any[] = data?.recentAlerts || [];

  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return patientSummaries;
    const q = patientSearch.toLowerCase();
    return patientSummaries.filter(p =>
      (p.patientName && p.patientName.toLowerCase().includes(q)) ||
      (p.patientIdCode && p.patientIdCode.toLowerCase().includes(q)) ||
      (p.roomNumber && p.roomNumber.toLowerCase().includes(q)) ||
      (p.careUnit && p.careUnit.toLowerCase().includes(q)) ||
      (p.conditionStatus && p.conditionStatus.toLowerCase().includes(q))
    );
  }, [patientSummaries, patientSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / pageSize));
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPatients.slice(start, start + pageSize);
  }, [filteredPatients, currentPage, pageSize]);

  const totalAssignedPatients = patientSummaries.length;
  const highPriorityPatientsCount = patientSummaries.filter(
    p => p.priority === 'High' || p.priority === 'Critical'
  ).length;
  const totalPendingTasks = pendingTasksList.length;
  const totalAlertsCount = recentAlertsList.length;

  const isSection1Done = patientSummaries.length > 0;
  const isSection2Done = Object.values(completedTaskIds).some(v => v) || pendingTasksList.length === 0;
  const isSection3Done = recentAlertsList.length >= 0;
  const isSection4Done = notes.trim().length > 0;

  const completedSectionsCount =
    (isSection1Done ? 1 : 0) +
    (isSection2Done ? 1 : 0) +
    (isSection3Done ? 1 : 0) +
    (isSection4Done ? 1 : 0);

  const completionPercentage = Math.round((completedSectionsCount / 4) * 100);

  const getPriorityBadge = (pri: string) => {
    if (pri === 'High' || pri === 'Critical') {
      return <Badge variant="critical">High</Badge>;
    }
    if (pri === 'Medium') {
      return <Badge variant="medium">Medium</Badge>;
    }
    return <Badge variant="low">Low</Badge>;
  };

  const getConditionBadge = (status: string, subtitle: string) => {
    const isImproving = status?.toLowerCase().includes('improv');
    const isPostOp = status?.toLowerCase().includes('post');
    const textColor = isImproving ? 'text-blue-600' : isPostOp ? 'text-amber-600' : 'text-emerald-600';

    return (
      <div>
        <span className={`font-extrabold text-xs ${textColor}`}>{status || 'Stable'}</span>
        <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{subtitle || 'In Monitoring'}</p>
      </div>
    );
  };

  const currentDateText = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });

  const currentTimeText = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="space-y-5 max-w-[1700px] mx-auto select-none font-sans text-slate-800">
      
      {/* 1. Page Header with Breadcrumbs & Data Toolbar */}
      <PageHeader
        title="Shift Handover"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Nurse Portal', href: '/nurse-dashboard' },
          { label: 'Shift Handover' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintHandover}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-xs transition-all cursor-pointer"
            >
              <Printer className="h-4 w-4 text-slate-500" />
              <span>Print Handover</span>
            </button>
            <DataImportExportToolbar
              moduleKey="shift-handover"
              data={patientSummaries.length > 0 ? patientSummaries : (data?.handover ? [data.handover] : [])}
              idField="id"
              onImportSuccess={fetchOverview}
              customCreateApi={(d) => api.saveHandoverNotes(d.criticalNotes || d.notes || '')}
            />
          </div>
        }
      />

      {/* 2. Sub-Header Navigation Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6">
        {(['Handover Overview', 'My Handover History', 'Received Handovers'] as const).map(tab => (
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

      {/* ------------------------------------------------------------------- */}
      {/* TAB 1: HANDOVER OVERVIEW                                            */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'Handover Overview' && (
        <div className="space-y-5">
          
          {/* 3. Stat Summary Cards Row (4 Live Cards + Print Button) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
            
            {/* Patients Assigned */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-purple-100/70 text-purple-600 flex items-center justify-center font-bold shrink-0">
                <Users className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 leading-none">{totalAssignedPatients}</p>
                <p className="text-[11px] font-bold text-slate-500 mt-1">Patients Assigned</p>
              </div>
            </div>

            {/* High Priority Patients */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-rose-100/70 text-rose-600 flex items-center justify-center font-bold shrink-0">
                <AlertTriangle className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 leading-none">{highPriorityPatientsCount}</p>
                <p className="text-[11px] font-bold text-slate-500 mt-1">High Priority Patients</p>
              </div>
            </div>

            {/* Pending Tasks */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-amber-100/70 text-amber-600 flex items-center justify-center font-bold shrink-0">
                <ClipboardList className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 leading-none">{totalPendingTasks}</p>
                <p className="text-[11px] font-bold text-slate-500 mt-1">Pending Tasks</p>
              </div>
            </div>

            {/* New Alerts */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center font-bold shrink-0">
                <Bell className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 leading-none">{totalAlertsCount}</p>
                <p className="text-[11px] font-bold text-slate-500 mt-1">New Alerts</p>
              </div>
            </div>

            {/* Print Handover Button */}
            <button
              onClick={handlePrintHandover}
              className="flex items-center justify-center gap-2 p-4 bg-white hover:bg-slate-50 border border-indigo-200 rounded-2xl text-xs font-extrabold text-indigo-600 shadow-xs transition-all cursor-pointer h-full"
            >
              <Printer className="h-4 w-4" />
              Print Handover
            </button>
          </div>

          {/* 4. Review Info Banner Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 shadow-xs">
            <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
              <div className="h-7 w-7 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Info className="h-4 w-4" />
              </div>
              <span>Please review clinical details below and select the incoming nurse before completing handover.</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>Auto-save: {autoSaveText}</span>
              </div>

              <button
                onClick={handleOpenCompleteConfirm}
                disabled={isCompleted}
                className={`px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-md transition-all cursor-pointer ${
                  isCompleted
                    ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                }`}
              >
                {isCompleted ? '✓ Handover Completed' : 'Complete Handover'}
              </button>
            </div>
          </div>

          {/* 5. Master Split-Screen Layout (Left 8 Columns + Right 4 Columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Side: Handover Summary + 3 Cards (8 Columns) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* 1. Patient Handover Summary Section */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-extrabold text-slate-900 text-sm">1. Patient Handover Summary</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-700">
                      {totalAssignedPatients} Patients
                    </span>
                  </div>

                  {/* Table Search Input */}
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search patient, room, unit..."
                      value={patientSearch}
                      onChange={e => {
                        setPatientSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-3">Patient</th>
                        <th className="py-3 px-3">Room / Unit</th>
                        <th className="py-3 px-3">Condition Updates</th>
                        <th className="py-3 px-3 text-center">Pending Tasks</th>
                        <th className="py-3 px-3">Special Instructions</th>
                        <th className="py-3 px-3 text-center">Priority</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold">
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 font-bold">
                            Loading assigned patients...
                          </td>
                        </tr>
                      ) : paginatedPatients.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 font-bold">
                            No patients found matching your search.
                          </td>
                        </tr>
                      ) : (
                        paginatedPatients.map((p: any) => (
                          <tr key={p.id || p.patientIdCode} className="hover:bg-slate-50/70 transition-colors">
                            {/* Patient */}
                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-3">
                                {p.patientAvatar ? (
                                  <img
                                    src={p.patientAvatar}
                                    alt={p.patientName}
                                    className="h-9 w-9 rounded-full object-cover border border-slate-200 shrink-0"
                                  />
                                ) : (
                                  <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 border border-indigo-200">
                                    {p.patientName ? p.patientName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'PT'}
                                  </div>
                                )}
                                <div>
                                  <p className="font-extrabold text-slate-900 text-xs">{p.patientName}</p>
                                  <p className="text-[10px] font-semibold text-slate-400">
                                    {p.ageGender || 'Age/Gender N/A'} • {p.patientIdCode || 'PT-Code'}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Room / Unit */}
                            <td className="py-3.5 px-3">
                              <p className="font-extrabold text-slate-900">{p.roomNumber || 'Room N/A'}</p>
                              <p className="text-[10px] font-semibold text-slate-400">{p.careUnit || 'General Ward'}</p>
                            </td>

                            {/* Condition Updates */}
                            <td className="py-3.5 px-3">
                              {getConditionBadge(p.conditionStatus, p.conditionSubtitle)}
                            </td>

                            {/* Pending Tasks */}
                            <td className="py-3.5 px-3 text-center">
                              <span className={`font-black text-xs ${p.pendingTasksCount > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {p.pendingTasksCount}
                              </span>
                            </td>

                            {/* Special Instructions */}
                            <td className="py-3.5 px-3">
                              <p className="font-semibold text-slate-700 text-[11px]">{p.specialInstructions || 'Routine observation'}</p>
                            </td>

                            {/* Priority */}
                            <td className="py-3.5 px-3 text-center">
                              {getPriorityBadge(p.priority)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Footer */}
                <div className="pt-2 flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>
                    Showing {filteredPatients.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredPatients.length)} of {filteredPatients.length} patients
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className="h-7 w-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
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
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className="h-7 w-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer disabled:opacity-40"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom 3 Sub-Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Card 2: Pending Tasks */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4.5 shadow-xs flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs border-b border-slate-100 pb-2 flex items-center justify-between">
                      <span>2. Pending Tasks</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-700">
                        {totalPendingTasks}
                      </span>
                    </h4>

                    <div className="space-y-2.5 pt-2 text-xs font-semibold max-h-56 overflow-y-auto">
                      {pendingTasksList.length === 0 ? (
                        <p className="text-[11px] text-slate-400 text-center py-4 font-bold">
                          No pending tasks for assigned patients.
                        </p>
                      ) : (
                        pendingTasksList.map((t: any) => (
                          <div key={t.id} className="flex items-start gap-2.5">
                            <input
                              type="checkbox"
                              checked={!!completedTaskIds[t.id]}
                              onChange={() => toggleTask(t.id)}
                              className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <div className="flex-1 min-w-0">
                              <p className={`font-extrabold leading-tight text-slate-900 truncate ${completedTaskIds[t.id] ? 'line-through text-slate-400' : ''}`}>
                                {t.title}
                              </p>
                              <p className="text-[10px] text-slate-400 font-semibold truncate">
                                {t.patientName} • {t.roomLocation}
                              </p>
                            </div>
                            <span className="text-[10px] font-black text-rose-500 shrink-0">{t.dueTime || 'Pending'}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 font-medium">
                    Review and check off completed clinical tasks before handoff.
                  </p>
                </div>

                {/* Card 3: New Alerts & Events */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4.5 shadow-xs flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs border-b border-slate-100 pb-2 flex items-center justify-between">
                      <span>3. Active Alerts & Events</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700">
                        {totalAlertsCount}
                      </span>
                    </h4>

                    <div className="space-y-2.5 pt-2 text-xs font-semibold max-h-56 overflow-y-auto">
                      {recentAlertsList.length === 0 ? (
                        <p className="text-[11px] text-slate-400 text-center py-4 font-bold">
                          No active alerts for assigned patients.
                        </p>
                      ) : (
                        recentAlertsList.map((a: any) => (
                          <div key={a.id} className="flex items-start gap-2.5">
                            <div className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${a.severity === 'Critical' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                              <AlertTriangle className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-extrabold text-slate-900 text-xs truncate">{a.title}</p>
                              <p className="text-[10px] text-slate-400 font-semibold truncate">
                                {a.patientName} - {a.roomLocation}
                              </p>
                            </div>
                            <span className="text-[10px] font-semibold text-slate-400 shrink-0">{a.time || 'Today'}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 font-medium">
                    Communicate all high/critical alert events to oncoming nurse.
                  </p>
                </div>

                {/* Card 4: Notes for Next Shift */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4.5 shadow-xs flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs border-b border-slate-100 pb-2">
                      4. Notes for Next Shift
                    </h4>

                    <div className="pt-2 space-y-2">
                      <textarea
                        rows={6}
                        maxLength={500}
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Enter clinical handover notes, SBAR summary, pending lab work, or high-risk observations..."
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed resize-none"
                      />
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                        <span>{notes.length}/500 characters</span>
                        <button
                          onClick={handleSaveDraft}
                          disabled={isSaving}
                          className="text-indigo-600 hover:underline font-extrabold cursor-pointer"
                        >
                          {isSaving ? 'Saving...' : 'Save Draft'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-50/60 p-2 rounded-xl border border-indigo-100 flex items-center gap-2 text-[10px] font-semibold text-indigo-900">
                    <Info className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                    <span>Add any additional notes or critical updates for the next shift nurse.</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Right Side: Persistent Handover Summary Panel (4 Columns) */}
            <div className="lg:col-span-4 space-y-4 sticky top-6">
              
              {/* Handover Summary Box */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider text-slate-400">Handover Summary</h3>

                {/* Circular Progress Donut */}
                <div className="flex items-center gap-6 p-2">
                  <div className="relative h-24 w-24 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-100"
                        strokeWidth="4"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-indigo-600"
                        strokeDasharray={`${completionPercentage}, 100`}
                        strokeWidth="4.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-black text-indigo-900">{completionPercentage}%</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-black text-slate-900">{completedSectionsCount} / 4</p>
                    <p className="text-xs font-bold text-slate-500">Sections Completed</p>
                    <p className="text-[11px] font-semibold text-indigo-600 mt-1">
                      {4 - completedSectionsCount} Pending Section{4 - completedSectionsCount === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>

                {/* Dynamic Checklist */}
                <div className="space-y-2.5 text-xs font-extrabold border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between text-slate-900">
                    <span>Patient Handover Summary</span>
                    {isSection1Done ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-100" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-300" />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-slate-900">
                    <span>Pending Tasks & Verification</span>
                    {isSection2Done ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-100" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-slate-900">
                    <span>New Alerts & Events</span>
                    {isSection3Done ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-100" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-300" />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-slate-900">
                    <span>Notes for Next Shift</span>
                    {isSection4Done ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-100" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                </div>

                {/* Outgoing Nurse Details (Logged-in user) */}
                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Outgoing Nurse Details</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.fullName || user.username}
                          className="h-10 w-10 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-200 shrink-0">
                          {(user?.fullName || user?.username || 'Nurse').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-extrabold text-slate-900 text-xs">
                          {user?.fullName || user?.username || data?.handover?.outgoingNurseName || 'Current Nurse'}
                        </p>
                        <p className="text-[10px] font-semibold text-slate-400">
                          {user?.role === 'Nurse' ? 'Staff Nurse' : (user?.role || 'Staff Nurse')}
                        </p>
                        <p className="text-[10px] font-semibold text-indigo-600">{currentShift}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-1">
                    <span>{currentDateText}</span>
                    <span className="font-extrabold text-slate-900 flex items-center gap-1">
                      {currentTimeText} <ArrowRight className="h-3.5 w-3.5 text-indigo-600" />
                    </span>
                  </div>
                </div>

                {/* Handover To (Interactive Nurse Selection) */}
                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Handover To (Incoming Nurse)</p>
                    <span className="text-[10px] font-extrabold text-indigo-600">Select Nurse</span>
                  </div>

                  <select
                    value={selectedIncomingNurseId}
                    onChange={e => handleSelectIncomingNurse(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="">-- Choose Incoming Nurse --</option>
                    {nursesList.map(n => (
                      <option key={n.id} value={n.id}>
                        {n.name} - {n.department || 'General Care'} ({n.shift || 'Incoming Shift'})
                      </option>
                    ))}
                  </select>

                  {selectedIncomingNurseName && (
                    <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200/60 mt-2">
                      {selectedIncomingNurseAvatar ? (
                        <img
                          src={selectedIncomingNurseAvatar}
                          alt={selectedIncomingNurseName}
                          className="h-9 w-9 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs border border-emerald-200 shrink-0">
                          {selectedIncomingNurseName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-extrabold text-slate-900 text-xs">{selectedIncomingNurseName}</p>
                        <p className="text-[10px] font-semibold text-slate-400">{selectedIncomingNurseRole}</p>
                        <p className="text-[10px] font-semibold text-emerald-600">{handoverToShift}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Quick Actions</p>

                  <button
                    onClick={handleSaveDraft}
                    disabled={isSaving}
                    className="w-full flex items-center justify-center gap-2 py-2.5 border border-indigo-200 rounded-xl text-xs font-extrabold text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving Draft...' : 'Save as Draft'}
                  </button>

                  <button
                    onClick={handleDiscardHandover}
                    className="w-full flex items-center justify-center gap-2 py-2.5 border border-rose-200 rounded-xl text-xs font-extrabold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    Reset Notes
                  </button>
                </div>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* TAB 2: MY HANDOVER HISTORY                                          */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'My Handover History' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">My Handover History</h3>
              <p className="text-xs text-slate-400">Complete audit log of shift handovers initiated by this station.</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search handover by code, nurse..."
                value={historySearch}
                onChange={e => setHistorySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">Handover Code</th>
                  <th className="py-3 px-3">Date & Shift</th>
                  <th className="py-3 px-3">Handed Over To</th>
                  <th className="py-3 px-3 text-center">Patients</th>
                  <th className="py-3 px-3 text-center">Alerts</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold">
                {historyLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-bold">
                      Loading handover history...
                    </td>
                  </tr>
                ) : historyList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-bold">
                      <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      No completed handovers recorded yet.
                    </td>
                  </tr>
                ) : (
                  historyList
                    .filter((h: any) =>
                      !historySearch ||
                      h.handoverIdCode?.toLowerCase().includes(historySearch.toLowerCase()) ||
                      h.incomingNurseName?.toLowerCase().includes(historySearch.toLowerCase()) ||
                      h.currentShift?.toLowerCase().includes(historySearch.toLowerCase())
                    )
                    .map((h: any) => (
                      <tr key={h.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3 font-extrabold text-indigo-600">
                          {h.handoverIdCode || 'SHO-RECORD'}
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-extrabold text-slate-900">{h.handoverDateText || 'Recently'}</p>
                          <p className="text-[10px] text-slate-400">{h.currentShift}</p>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                              {(h.incomingNurseName || 'IN').slice(0, 2).toUpperCase()}
                            </div>
                            <span>{h.incomingNurseName || 'On-Call Nurse'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-bold">
                          {h.patientsAssignedCount || 0}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-rose-600">
                          {h.newAlertsCount || 0}
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant="admitted">Completed</Badge>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleOpenDetailModal(h.id)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* TAB 3: RECEIVED HANDOVERS                                           */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'Received Handovers' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Received Handovers</h3>
              <p className="text-xs text-slate-400">Handovers directed to you or your department from the outgoing nurse.</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by code or nurse..."
                value={receivedSearch}
                onChange={e => setReceivedSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">Handover Code</th>
                  <th className="py-3 px-3">Date & Shift</th>
                  <th className="py-3 px-3">Handed Over By</th>
                  <th className="py-3 px-3 text-center">Patients</th>
                  <th className="py-3 px-3">Notes Preview</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold">
                {receivedLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-bold">
                      Loading received handovers...
                    </td>
                  </tr>
                ) : receivedList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
                      <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      No incoming handovers found for your profile.
                    </td>
                  </tr>
                ) : (
                  receivedList
                    .filter((h: any) =>
                      !receivedSearch ||
                      h.handoverIdCode?.toLowerCase().includes(receivedSearch.toLowerCase()) ||
                      h.outgoingNurseName?.toLowerCase().includes(receivedSearch.toLowerCase())
                    )
                    .map((h: any) => (
                      <tr key={h.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3 font-extrabold text-emerald-600">
                          {h.handoverIdCode || 'SHO-RECORD'}
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-extrabold text-slate-900">{h.handoverDateText || 'Recently'}</p>
                          <p className="text-[10px] text-slate-400">{h.currentShift}</p>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                              {(h.outgoingNurseName || 'ON').slice(0, 2).toUpperCase()}
                            </div>
                            <span>{h.outgoingNurseName || 'Outgoing Nurse'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-bold">
                          {h.patientsAssignedCount || 0}
                        </td>
                        <td className="py-3 px-3 max-w-xs truncate text-slate-500 font-medium">
                          {h.handoverNotes || 'No notes provided.'}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleOpenDetailModal(h.id)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            Review Report
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* MODAL 1: VIEW DETAILED HANDOVER REPORT                              */}
      {/* ------------------------------------------------------------------- */}
      {viewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Shift Handover Report ({selectedDetailHandover?.handover?.handoverIdCode || 'Handover Details'})
                  </h3>
                  <p className="text-[11px] text-slate-400 font-semibold">
                    {selectedDetailHandover?.handover?.handoverDateText} • {selectedDetailHandover?.handover?.handoverTimeText}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {detailLoading ? (
                <p className="text-center py-10 font-bold text-slate-400">Loading details...</p>
              ) : selectedDetailHandover ? (
                <>
                  {/* Nurse Cards Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Handed Over By</p>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                          {(selectedDetailHandover.handover?.outgoingNurseName || 'ON').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-xs">{selectedDetailHandover.handover?.outgoingNurseName}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{selectedDetailHandover.handover?.outgoingNurseRole}</p>
                          <p className="text-[10px] text-indigo-600 font-bold">{selectedDetailHandover.handover?.currentShift}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Handed Over To</p>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                          {(selectedDetailHandover.handover?.incomingNurseName || 'IN').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-xs">{selectedDetailHandover.handover?.incomingNurseName}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{selectedDetailHandover.handover?.incomingNurseRole}</p>
                          <p className="text-[10px] text-emerald-600 font-bold">{selectedDetailHandover.handover?.handoverToShift}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Clinical Notes Section */}
                  <div className="space-y-2">
                    <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                      Handover Notes & Clinical SBAR Summary
                    </h4>
                    <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 leading-relaxed font-semibold whitespace-pre-wrap">
                      {selectedDetailHandover.handover?.handoverNotes || 'No notes were recorded for this handover.'}
                    </div>
                  </div>

                  {/* Patient Snapshot Table */}
                  <div className="space-y-2">
                    <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                      Patients Snapshot at Handover ({selectedDetailHandover.patientSnapshots?.length || 0})
                    </h4>
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs text-slate-700">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase">
                          <tr>
                            <th className="py-2.5 px-3">Patient</th>
                            <th className="py-2.5 px-3">Room</th>
                            <th className="py-2.5 px-3">Condition</th>
                            <th className="py-2.5 px-3">Special Instructions</th>
                            <th className="py-2.5 px-3 text-center">Priority</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold">
                          {selectedDetailHandover.patientSnapshots?.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-6 text-center text-slate-400 font-bold">
                                No individual patient snapshot records attached.
                              </td>
                            </tr>
                          ) : (
                            selectedDetailHandover.patientSnapshots?.map((sp: any) => (
                              <tr key={sp.id} className="hover:bg-slate-50/50">
                                <td className="py-2.5 px-3">
                                  <p className="font-black text-slate-900">{sp.patientName}</p>
                                  <p className="text-[10px] text-slate-400">{sp.patientIdCode}</p>
                                </td>
                                <td className="py-2.5 px-3">{sp.roomNumber}</td>
                                <td className="py-2.5 px-3">{sp.conditionStatus}</td>
                                <td className="py-2.5 px-3 text-[11px] text-slate-600">{sp.specialInstructions}</td>
                                <td className="py-2.5 px-3 text-center">{getPriorityBadge(sp.priority)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                Print Report
              </button>
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* MODAL 2: CONFIRM COMPLETE HANDOVER                                  */}
      {/* ------------------------------------------------------------------- */}
      {confirmCompleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-indigo-600">
              <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center font-bold">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Finalize Shift Handover?</h3>
                <p className="text-[11px] text-slate-400 font-semibold">Incoming Nurse: {selectedIncomingNurseName}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Completing this handover will submit your notes, snapshot the current state of {totalAssignedPatients} patients, and dispatch an in-app handover alert to {selectedIncomingNurseName}.
            </p>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1 text-xs">
              <div className="flex justify-between font-semibold text-slate-600">
                <span>Shift:</span>
                <span className="font-bold text-slate-900">{currentShift}</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-600">
                <span>Next Shift:</span>
                <span className="font-bold text-slate-900">{handoverToShift}</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-600">
                <span>Checklist Verification:</span>
                <span className="font-bold text-emerald-600">{completionPercentage}% Completed</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmCompleteOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmComplete}
                disabled={isCompleting}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-colors cursor-pointer"
              >
                {isCompleting ? 'Finalizing...' : 'Yes, Complete Handover'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ShiftHandoverPage;

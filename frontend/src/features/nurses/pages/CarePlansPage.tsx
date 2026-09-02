import React, { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/context/AuthContext';
import { PageHeader } from '@/components/common/PageHeader';
import { DataImportExportToolbar } from '@/components/common/DataImportExportToolbar';
import {
  Search,
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  Flag,
  ClipboardCheck,
  Eye,
  Edit2,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Heart,
  Wind,
  Scissors,
  Activity,
  Droplet,
  Brain,
  Bone,
  Apple,
  Printer,
  RefreshCw,
  X,
  Loader2,
  AlertTriangle,
  Check
} from 'lucide-react';

interface NoteItem {
  id?: string;
  text: string;
  date: string;
  author?: string;
}

const extractPlanNotes = (plan: any): NoteItem[] => {
  if (!plan) return [];
  let list: any[] = [];
  if (Array.isArray(plan.notes) && plan.notes.length > 0) {
    list = plan.notes;
  } else if (Array.isArray(plan.notesList) && plan.notesList.length > 0) {
    list = plan.notesList;
  } else if (plan.notesJson) {
    try {
      const parsed = typeof plan.notesJson === 'string' ? JSON.parse(plan.notesJson) : plan.notesJson;
      if (Array.isArray(parsed)) list = parsed;
    } catch {
      list = [];
    }
  }

  return list.map((n: any, idx: number) => ({
    id: n.id || n.Id || String(idx),
    text: n.text || n.Text || n.noteText || n.NoteText || n.content || n.Content || '',
    date: n.date || n.Date || n.createdDate || n.CreatedDate || n.dateText || n.createdAtText || '',
    author: n.author || n.Author || n.authorName || n.AuthorName || 'Staff Provider',
  })).filter(n => Boolean(n.text));
};

export const CarePlansPage: React.FC = () => {
  const { user } = useAuth();
  const isDoctor = user?.role?.toLowerCase() === 'doctor';

  const doctorName = useMemo(() => {
    if (!user?.username) return 'Dr. Sarah Wilson';
    const name = user.username;
    if (name.toLowerCase().startsWith('dr.')) return name;
    return `Dr. ${name.charAt(0).toUpperCase() + name.slice(1)}`;
  }, [user]);

  const [carePlans, setCarePlans] = useState<any[]>([]);
  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    totalCarePlans: 0,
    activePlans: 0,
    reviewDue: 0,
    completed: 0,
    draftPlans: 0,
  });
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState('All Care Plans');
  const [searchQuery, setSearchQuery] = useState('');
  const [unitFilter, setUnitFilter] = useState('All Units / Floors');
  const [patientFilter, setPatientFilter] = useState('All Patients');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [conditionFilter, setConditionFilter] = useState('All Conditions');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [modalTarget, setModalTarget] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string>('');

  const todayFormattedDate = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    }).format(new Date());
  }, []);

  const fetchCarePlansData = async (targetId?: string) => {
    setLoading(true);
    try {
      const activeSelectedId = targetId || selectedPlan?.id;
      const [listRes, sumRes, patRes] = await Promise.all([
        api.getCarePlans({
          tab: activeTab,
          status: statusFilter,
          unit: unitFilter,
          patient: patientFilter,
          condition: conditionFilter,
          search: searchQuery,
          doctorName: doctorName
        }),
        api.getCarePlanSummary(),
        api.getPatients(undefined, undefined, undefined, user?.doctorId, user?.nurseId)
      ]);

      const listData = Array.isArray(listRes) ? listRes : (listRes as any)?.data || [];
      setCarePlans(listData);

      if (listData.length > 0) {
        const found = activeSelectedId ? listData.find((c: any) => c.id === activeSelectedId) : null;
        setSelectedPlan(found || listData[0]);
      } else {
        setSelectedPlan(null);
      }

      const sumData = (sumRes as any)?.data || sumRes;
      if (sumData) {
        setSummary(sumData);
      }

      const patients = Array.isArray(patRes) ? patRes : (patRes as any)?.data || [];
      setPatientsList(patients);
    } catch (err) {
      console.error('Failed to fetch care plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchCarePlansData();
  }, [activeTab, searchQuery, unitFilter, patientFilter, statusFilter, conditionFilter]);

  const showFeedback = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(''), 3500);
  };

  // 1. Create Care Plan
  const handleCreateCarePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await api.createCarePlan({
        patientName: formData.patientName || '',
        patientIdCode: formData.patientIdCode || '',
        primaryCondition: formData.primaryCondition || 'Heart Failure',
        planTitle: formData.planTitle || 'Heart Failure Management',
        assignedNurseName: formData.assignedNurseName || 'Emma Johnson',
        attendingDoctorName: isDoctor ? doctorName : (formData.attendingDoctorName || 'Dr. Sarah Wilson'),
        careUnit: formData.careUnit || 'Cardiology Unit',
        roomNumber: formData.roomNumber || 'Room 302',
        startDateText: formData.startDateText || todayFormattedDate,
        reviewDateText: formData.reviewDateText || '7 days later',
        goalCount: Number(formData.goalCount) || 5
      });
      const createdPlan = (res as any)?.data || res;
      setShowCreateModal(false);
      setFormData({});
      showFeedback('Care plan created successfully in database.');
      if (createdPlan && createdPlan.id) {
        setSelectedPlan(createdPlan);
      }
      await fetchCarePlansData(createdPlan?.id);
    } catch (err) {
      console.error('Failed to create care plan:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Update Care Plan
  const handleUpdateCarePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTarget?.id) return;
    try {
      setActionLoading(true);
      const res = await api.updateCarePlan(modalTarget.id, {
        patientName: formData.patientName,
        patientIdCode: formData.patientIdCode,
        primaryCondition: formData.primaryCondition,
        planTitle: formData.planTitle,
        goalCount: Number(formData.goalCount),
        status: formData.status,
        startDateText: formData.startDateText,
        reviewDateText: formData.reviewDateText,
        careUnit: formData.careUnit,
        roomNumber: formData.roomNumber,
        assignedNurseName: formData.assignedNurseName,
        attendingDoctorName: formData.attendingDoctorName,
        overallProgressPercentage: Number(formData.overallProgressPercentage)
      });
      const updatedPlan = (res as any)?.data || res;
      setShowEditModal(false);
      setFormData({});
      showFeedback('Care plan updated successfully in database.');
      if (updatedPlan && updatedPlan.id) {
        setSelectedPlan(updatedPlan);
        setCarePlans((prev) => prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)));
      }
      const targetId = updatedPlan?.id || modalTarget.id;
      setModalTarget(null);
      await fetchCarePlansData(targetId);
    } catch (err) {
      console.error('Failed to update care plan:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Delete Care Plan
  const handleDeleteCarePlan = async () => {
    if (!modalTarget?.id) return;
    try {
      setActionLoading(true);
      await api.deleteCarePlan(modalTarget.id);
      setShowDeleteModal(false);
      setModalTarget(null);
      setFormData({});
      showFeedback('Care plan removed from database.');
      await fetchCarePlansData();
    } catch (err) {
      console.error('Failed to delete care plan:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Add Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTarget?.id || !formData.noteText) return;
    try {
      setActionLoading(true);
      const author = isDoctor ? doctorName : (user?.fullName || user?.username || 'Staff Provider');
      const res = await api.addCarePlanNote(modalTarget.id, {
        noteText: formData.noteText,
        authorName: author
      });
      const updatedPlan = (res as any)?.data || res;
      setShowNoteModal(false);
      setFormData({});
      showFeedback('Care plan note saved to database.');
      if (updatedPlan && updatedPlan.id) {
        setSelectedPlan(updatedPlan);
        setCarePlans((prev) => prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)));
      }
      const targetId = updatedPlan?.id || modalTarget.id;
      setModalTarget(null);
      await fetchCarePlansData(targetId);
    } catch (err) {
      console.error('Failed to add care plan note:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // 5. Review Care Plan
  const handleReviewCarePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTarget?.id) return;
    try {
      setActionLoading(true);
      const res = await api.reviewCarePlan(modalTarget.id, {
        newReviewDateText: formData.newReviewDateText || '14 days later',
        reviewOutcome: formData.reviewOutcome || '',
        overallProgressPercentage: Number(formData.overallProgressPercentage) || modalTarget.overallProgressPercentage,
        status: formData.status || 'Active'
      });
      const updatedPlan = (res as any)?.data || res;
      setShowReviewModal(false);
      setFormData({});
      showFeedback('Care plan review recorded in database.');
      if (updatedPlan && updatedPlan.id) {
        setSelectedPlan(updatedPlan);
        setCarePlans((prev) => prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)));
      }
      const targetId = updatedPlan?.id || modalTarget.id;
      setModalTarget(null);
      await fetchCarePlansData(targetId);
    } catch (err) {
      console.error('Failed to record care plan review:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Pagination Math
  const totalItems = carePlans.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedCarePlans = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return carePlans.slice(start, start + pageSize);
  }, [carePlans, currentPage, pageSize]);

  // Parse Notes from JSON or direct list
  const selectedPlanNotes: NoteItem[] = useMemo(() => {
    return extractPlanNotes(selectedPlan);
  }, [selectedPlan]);

  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case 'Heart Failure':
        return <Heart className="h-4 w-4 text-[#4F46E5]" />;
      case 'COPD':
        return <Wind className="h-4 w-4 text-[#4F46E5]" />;
      case 'Post Surgery':
        return <Scissors className="h-4 w-4 text-[#4F46E5]" />;
      case 'Mobility Impairment':
        return <Activity className="h-4 w-4 text-[#4F46E5]" />;
      case 'Diabetes Type 2':
        return <Droplet className="h-4 w-4 text-[#4F46E5]" />;
      case 'Stroke Recovery':
        return <Brain className="h-4 w-4 text-[#4F46E5]" />;
      case 'Arthritis':
        return <Bone className="h-4 w-4 text-[#4F46E5]" />;
      case 'Malnutrition':
        return <Apple className="h-4 w-4 text-[#4F46E5]" />;
      default:
        return <Activity className="h-4 w-4 text-[#4F46E5]" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
      case '0':
        return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-emerald-100 text-emerald-700">Active</span>;
      case 'ReviewDue':
      case 'Review Due':
      case '1':
        return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-rose-100 text-rose-700">Review Due</span>;
      case 'Completed':
      case '2':
        return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-blue-100 text-blue-700">Completed</span>;
      case 'Draft':
      case '3':
        return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-indigo-100 text-indigo-700">Draft</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-5 max-w-[1700px] mx-auto select-none font-sans text-slate-800">
      
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <Check className="h-4 w-4" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Care Plans"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Care Plans' },
        ]}
        actions={
          <DataImportExportToolbar
            moduleKey="care-plans"
            data={carePlans}
            idField="id"
            onImportSuccess={fetchCarePlansData}
            customCreateApi={api.createCarePlan}
          />
        }
      />

      {/* 2. Sub-Header Navigation Tabs & + New Care Plan Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200/80 bg-white px-6 py-2.5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-6 text-xs font-bold overflow-x-auto w-full sm:w-auto">
          {[
            'All Care Plans',
            "My Patients' Plans",
            'Active Plans',
            'Completed Plans',
            'Review Due'
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

        <button
          onClick={() => {
            setFormData({
              patientId: '',
              patientName: '',
              patientIdCode: '',
              primaryCondition: 'General Care',
              planTitle: '',
              assignedNurseName: !isDoctor ? (user?.fullName || user?.username || '') : '',
              attendingDoctorName: isDoctor ? doctorName : '',
              careUnit: '',
              roomNumber: '',
              startDateText: todayFormattedDate,
              reviewDateText: '',
              goalCount: 1
            });
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-600/20 transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          <span>New Care Plan</span>
        </button>
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
              placeholder="Search care plans..."
              className="pl-8 pr-3 py-2 w-52 sm:w-60 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Date Indicator */}
          <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>{todayFormattedDate}</span>
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
              <option>Maternity Unit</option>
              <option>Neurology Unit</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Patient Dropdown */}
          <div className="relative">
            <select
              value={patientFilter}
              onChange={(e) => setPatientFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer max-w-[180px] truncate"
            >
              <option>All Patients</option>
              {patientsList.map((p: any) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Review Due</option>
              <option>Completed</option>
              <option>Draft</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Condition Dropdown */}
          <div className="relative">
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option>All Conditions</option>
              <option>Heart Failure</option>
              <option>COPD</option>
              <option>Post Surgery</option>
              <option>Mobility Impairment</option>
              <option>Diabetes Type 2</option>
              <option>Stroke Recovery</option>
              <option>Arthritis</option>
              <option>Malnutrition</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Reset Filters Button */}
          <button
            onClick={() => {
              setSearchQuery('');
              setUnitFilter('All Units / Floors');
              setPatientFilter('All Patients');
              setStatusFilter('All Status');
              setConditionFilter('All Conditions');
              fetchCarePlansData();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-indigo-700 text-xs font-bold transition-colors cursor-pointer"
            title="Reset Filters"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* 4. Stat Summary Cards (5 Live DB Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Total Care Plans */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">{summary.totalCarePlans}</h3>
            <p className="text-[11px] font-bold text-slate-500">Total Care Plans</p>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Database records</p>
          </div>
        </div>

        {/* Card 2: Active Plans */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">{summary.activePlans}</h3>
            <p className="text-[11px] font-bold text-slate-500">Active Plans</p>
            <p className="text-[10px] font-extrabold text-emerald-600 mt-0.5">
              {summary.totalCarePlans > 0 ? Math.round((summary.activePlans / summary.totalCarePlans) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Card 3: Review Due */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">{summary.reviewDue}</h3>
            <p className="text-[11px] font-bold text-slate-500">Review Due</p>
            <p className="text-[10px] font-extrabold text-amber-600 mt-0.5">
              {summary.totalCarePlans > 0 ? Math.round((summary.reviewDue / summary.totalCarePlans) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Card 4: Completed */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <Flag className="h-6 w-6 fill-rose-100" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">{summary.completed}</h3>
            <p className="text-[11px] font-bold text-slate-500">Completed</p>
            <p className="text-[10px] font-extrabold text-rose-600 mt-0.5">
              {summary.totalCarePlans > 0 ? Math.round((summary.completed / summary.totalCarePlans) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Card 5: Draft Plans */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">{summary.draftPlans}</h3>
            <p className="text-[11px] font-bold text-slate-500">Draft Plans</p>
            <p className="text-[10px] font-extrabold text-blue-600 mt-0.5">
              {summary.totalCarePlans > 0 ? Math.round((summary.draftPlans / summary.totalCarePlans) * 100) : 0}%
            </p>
          </div>
        </div>

      </div>

      {/* 5. Main Split Screen (8 Cols Table + 4 Cols Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Section: Care Plans Table (8 Columns) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-extrabold text-slate-900 text-sm">
              Care Plans ({carePlans.length})
            </h2>
            <span className="text-[11px] font-semibold text-slate-400">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          <div className="overflow-x-auto min-h-[300px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-center space-y-2">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <p className="text-xs font-bold text-slate-500">Loading care plans from database...</p>
              </div>
            ) : paginatedCarePlans.length > 0 ? (
              <table className="w-full text-left text-xs font-semibold text-slate-700 border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Patient</th>
                    <th className="py-3.5 px-3">Primary Condition</th>
                    <th className="py-3.5 px-3">Care Plan Title</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-3">Start Date</th>
                    <th className="py-3.5 px-3">Review Date</th>
                    <th className="py-3.5 px-3">Assigned To</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedCarePlans.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedPlan(row)}
                      className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                        selectedPlan?.id === row.id ? 'bg-indigo-50/40' : ''
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
                            <p className="text-[10px] text-slate-400 font-semibold">{row.roomNumber || 'Room 302'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Primary Condition */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getConditionIcon(row.primaryCondition)}
                          <span className="font-bold text-slate-800">{row.primaryCondition}</span>
                        </div>
                      </td>

                      {/* Care Plan Title & Goals */}
                      <td className="py-3.5 px-3">
                        <p className="font-extrabold text-indigo-900 text-xs hover:underline cursor-pointer">{row.planTitle}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{row.goalCount || 6} Goals</p>
                      </td>

                      {/* Status Pill */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {getStatusBadge(row.status)}
                      </td>

                      {/* Start Date */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-slate-600 text-[11px]">
                        {row.startDateText}
                      </td>

                      {/* Review Date */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <p className="font-bold text-slate-900 text-xs leading-tight">{row.reviewDateText}</p>
                        {row.reviewDueBadge && row.reviewDueBadge !== '-' && row.reviewDueBadge !== 'Draft' && row.reviewDueBadge !== 'Completed' && (
                          <p className={`text-[10px] font-extrabold ${row.reviewDueBadge.includes('today') ? 'text-rose-600 font-black' : 'text-rose-500'}`}>
                            {row.reviewDueBadge}
                          </p>
                        )}
                      </td>

                      {/* Assigned To */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <p className="font-bold text-slate-900 text-xs leading-tight">{row.assignedNurseName}</p>
                        <p className="text-[10px] font-semibold text-slate-400">{isDoctor ? 'Caregiver' : 'Staff Nurse'}</p>
                      </td>

                      {/* Actions: View, Edit, Delete */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalTarget(row);
                              setShowViewModal(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="View Care Plan Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalTarget(row);
                              setFormData({
                                patientName: row.patientName,
                                patientIdCode: row.patientIdCode,
                                primaryCondition: row.primaryCondition,
                                planTitle: row.planTitle,
                                assignedNurseName: row.assignedNurseName,
                                attendingDoctorName: row.attendingDoctorName,
                                careUnit: row.careUnit,
                                roomNumber: row.roomNumber,
                                startDateText: row.startDateText,
                                reviewDateText: row.reviewDateText,
                                goalCount: row.goalCount,
                                overallProgressPercentage: row.overallProgressPercentage,
                                status: row.status
                              });
                              setShowEditModal(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Care Plan"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalTarget(row);
                              setShowDeleteModal(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Care Plan"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center text-slate-400 space-y-2">
                <FileText className="w-10 h-10 stroke-1 text-slate-300" />
                <p className="text-sm font-bold text-slate-600">No care plans found</p>
                <p className="text-xs">No records matched your selected tab or filter criteria in the database.</p>
              </div>
            )}
          </div>

          {/* Table Pagination Bar */}
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-500">
            <span>
              Showing {totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(currentPage * pageSize, totalItems)} of {totalItems} care plans
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || totalItems === 0}
                className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                title="Previous Page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    currentPage === pageNum
                      ? 'bg-indigo-600 text-white font-black'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalItems === 0}
                className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                title="Next Page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Right Section: Sidebar Widgets (4 Columns) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Card 1: Selected Patient (Live DB) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-900 text-xs">Selected Patient</h3>
              <span className="text-[10px] font-bold text-indigo-600">Live DB</span>
            </div>

            {selectedPlan ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3 pt-1">
                  {selectedPlan.patientAvatar ? (
                    <img
                      src={selectedPlan.patientAvatar}
                      alt={selectedPlan.patientName}
                      className="h-12 w-12 rounded-full object-cover shrink-0 border-2 border-indigo-100 shadow-xs"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg shrink-0 border-2 border-indigo-100 shadow-xs">
                      {selectedPlan.patientName ? selectedPlan.patientName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'PT'}
                    </div>
                  )}
                  <div className="space-y-1">
                    <h4 className="font-black text-slate-900 text-sm">{selectedPlan.patientName}</h4>
                    <p className="text-[11px] font-bold text-slate-500">PID: {selectedPlan.patientIdCode || 'PT-10001'}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{selectedPlan.ageGender || '68 Y • General'} • Blood: {selectedPlan.bloodGroup || 'A+'}</p>
                    <p className="text-[10px] text-slate-500 font-semibold">{selectedPlan.roomNumber || 'Room 302'} • {selectedPlan.careUnit || 'Cardiology Unit'}</p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-[9px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                      Inpatient Care
                    </span>
                  </div>
                </div>

                {/* 3 Patient Quick Metrics */}
                <div className="grid grid-cols-3 gap-2 pt-3 text-center border-t border-slate-100 text-xs">
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-semibold">Attending Doctor</p>
                    <p className="font-extrabold text-slate-900 text-[11px] truncate mt-0.5">{selectedPlan?.attendingDoctorName || doctorName}</p>
                  </div>

                  <div className="p-2 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-semibold">Care Team</p>
                    <p className="font-extrabold text-slate-900 text-[11px] mt-0.5">{selectedPlan?.careTeamMembersCount || 3} Members</p>
                  </div>

                  <div className="p-2 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-semibold">LOS</p>
                    <p className="font-extrabold text-slate-900 text-[11px] mt-0.5">{selectedPlan?.lengthOfStayText || '4 Days'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                Select a care plan to view patient metrics.
              </div>
            )}
          </div>

          {/* Card 2: Care Plan Progress (Live DB) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-xs">Care Plan Progress</h3>
              <button
                onClick={() => {
                  if (selectedPlan) {
                    setModalTarget(selectedPlan);
                    setShowViewModal(true);
                  }
                }}
                className="text-[10px] font-extrabold text-indigo-600 hover:underline cursor-pointer"
              >
                View Details
              </button>
            </div>

            {/* Donut Progress Ring */}
            <div className="flex items-center gap-6">
              <div className="relative flex items-center justify-center shrink-0">
                <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-emerald-500" strokeWidth="4" strokeDasharray={`${selectedPlan?.overallProgressPercentage || 0}, 100`} stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-lg font-black text-slate-900">{selectedPlan?.overallProgressPercentage || 0}%</span>
                  <span className="text-[9px] font-bold text-slate-400">Overall Progress</span>
                </div>
              </div>

              {/* Progress Breakdown */}
              <div className="space-y-1.5 text-xs font-semibold text-slate-600 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    <span>Completed</span>
                  </div>
                  <span className="font-extrabold text-slate-900">{selectedPlan?.completedTasksCount || 0}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    <span>In Progress</span>
                  </div>
                  <span className="font-extrabold text-slate-900">{selectedPlan?.inProgressTasksCount || 0}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    <span>Not Started</span>
                  </div>
                  <span className="font-extrabold text-slate-900">{selectedPlan?.notStartedTasksCount || 0}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                    <span>Overdue</span>
                  </div>
                  <span className="font-extrabold text-slate-900">{selectedPlan?.overdueTasksCount || 0}</span>
                </div>
              </div>
            </div>

            <p className="text-[10px] font-semibold text-slate-400 border-t border-slate-100 pt-2 text-center">
              Last Updated: {selectedPlan?.lastUpdatedText || todayFormattedDate}
            </p>
          </div>

          {/* Card 3: Recent Notes (Live Database) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-xs">
                Recent Notes ({selectedPlanNotes.length})
              </h3>
              <button
                onClick={() => {
                  if (selectedPlan) {
                    setModalTarget(selectedPlan);
                    setFormData({ noteText: '' });
                    setShowNoteModal(true);
                  }
                }}
                disabled={!selectedPlan}
                className="text-[10px] font-extrabold text-indigo-600 hover:underline cursor-pointer disabled:opacity-50"
              >
                Add Note
              </button>
            </div>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {selectedPlanNotes.length > 0 ? (
                selectedPlanNotes.map((note, idx) => (
                  <div key={note.id || idx} className="flex items-start gap-2.5 p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100 mt-0.5">
                      <FileText className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-xs leading-snug break-words">{note.text}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mt-1">
                        <span>{note.date}</span>
                        {note.author && <span className="font-bold text-slate-500">{note.author}</span>}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-slate-400 space-y-1">
                  <FileText className="h-6 w-6 mx-auto stroke-1 text-slate-300" />
                  <p className="text-xs font-semibold">No notes recorded in database yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Card 4: Quick Actions (All Fully Functional) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-2.5">
            <h3 className="font-extrabold text-slate-900 text-xs">Quick Actions</h3>

            <button
              onClick={() => {
                if (selectedPlan) {
                  setModalTarget(selectedPlan);
                  setFormData({ noteText: '' });
                  setShowNoteModal(true);
                }
              }}
              disabled={!selectedPlan}
              className="w-full flex items-center justify-center gap-2 py-2 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl text-xs font-black transition-colors cursor-pointer disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add Care Plan Note
            </button>

            <button
              onClick={() => {
                if (selectedPlan) {
                  setModalTarget(selectedPlan);
                  setFormData({
                    patientName: selectedPlan.patientName,
                    patientIdCode: selectedPlan.patientIdCode,
                    primaryCondition: selectedPlan.primaryCondition,
                    planTitle: selectedPlan.planTitle,
                    assignedNurseName: selectedPlan.assignedNurseName,
                    attendingDoctorName: selectedPlan.attendingDoctorName,
                    careUnit: selectedPlan.careUnit,
                    roomNumber: selectedPlan.roomNumber,
                    startDateText: selectedPlan.startDateText,
                    reviewDateText: selectedPlan.reviewDateText,
                    goalCount: selectedPlan.goalCount,
                    overallProgressPercentage: selectedPlan.overallProgressPercentage,
                    status: selectedPlan.status
                  });
                  setShowEditModal(true);
                }
              }}
              disabled={!selectedPlan}
              className="w-full flex items-center justify-center gap-2 py-2 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl text-xs font-black transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              Update Care Plan
            </button>

            <button
              onClick={() => {
                if (selectedPlan) {
                  setModalTarget(selectedPlan);
                  setFormData({
                    newReviewDateText: selectedPlan.reviewDateText || '14 days later',
                    reviewOutcome: '',
                    overallProgressPercentage: selectedPlan.overallProgressPercentage,
                    status: selectedPlan.status
                  });
                  setShowReviewModal(true);
                }
              }}
              disabled={!selectedPlan}
              className="w-full flex items-center justify-center gap-2 py-2 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl text-xs font-black transition-colors cursor-pointer disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Care Plan Review
            </button>

            <button
              onClick={() => window.print()}
              disabled={!selectedPlan}
              className="w-full flex items-center justify-center gap-2 py-2 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl text-xs font-black transition-colors cursor-pointer disabled:opacity-50"
            >
              <Printer className="h-4 w-4" />
              Print Care Plan
            </button>
          </div>

        </div>

      </div>

      {/* MODAL 1: Create Care Plan Form */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Plus className="h-5 w-5 text-indigo-600" />
                Create New Care Plan
              </h3>
              <button onClick={() => {
                setShowCreateModal(false);
                setFormData({});
              }} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCarePlan} className="space-y-3.5 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Select Patient</label>
                  <select
                    value={formData.patientId || ''}
                    onChange={(e) => {
                      const selPatient = patientsList.find(p => p.id === e.target.value);
                      if (selPatient) {
                        setFormData({
                          ...formData,
                          patientId: selPatient.id,
                          patientName: selPatient.name,
                          patientIdCode: selPatient.patientId || selPatient.id?.substring(0, 8) || '',
                          primaryCondition: selPatient.diagnosis || selPatient.condition || formData.primaryCondition || 'General Care',
                          careUnit: selPatient.department || selPatient.careUnit || '',
                          roomNumber: selPatient.roomNumber || '',
                          attendingDoctorName: selPatient.primaryDoctorName || formData.attendingDoctorName || '',
                          assignedNurseName: selPatient.assignedNurseName || formData.assignedNurseName || ''
                        });
                      } else {
                        setFormData({
                          ...formData,
                          patientId: '',
                          patientName: e.target.value
                        });
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">-- Choose Patient --</option>
                    {patientsList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.patientId ? `(${p.patientId})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Patient ID Code</label>
                  <input
                    type="text"
                    maxLength={30}
                    placeholder="e.g. PT-10001"
                    value={formData.patientIdCode || ''}
                    onChange={(e) => setFormData({ ...formData, patientIdCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Patient Full Name</label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  placeholder="Enter patient full name"
                  value={formData.patientName || ''}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Primary Condition</label>
                  <select
                    value={formData.primaryCondition || ''}
                    onChange={(e) => setFormData({ ...formData, primaryCondition: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">Select Primary Condition</option>
                    <option>General Care</option>
                    <option>Heart Failure</option>
                    <option>COPD</option>
                    <option>Post Surgery</option>
                    <option>Mobility Impairment</option>
                    <option>Diabetes Type 2</option>
                    <option>Stroke Recovery</option>
                    <option>Arthritis</option>
                    <option>Malnutrition</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Goal Count</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={formData.goalCount || 1}
                    onChange={(e) => setFormData({ ...formData, goalCount: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Care Plan Title</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  placeholder="e.g. Heart Failure Management"
                  value={formData.planTitle || ''}
                  onChange={(e) => setFormData({ ...formData, planTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Care Unit</label>
                  <input
                    type="text"
                    maxLength={50}
                    placeholder="e.g. Cardiology Unit"
                    value={formData.careUnit || ''}
                    onChange={(e) => setFormData({ ...formData, careUnit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Room / Bed</label>
                  <input
                    type="text"
                    maxLength={20}
                    placeholder="e.g. Room 302"
                    value={formData.roomNumber || ''}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Attending Physician</label>
                  <input
                    type="text"
                    maxLength={50}
                    placeholder="e.g. Dr. Sarah Wilson"
                    value={formData.attendingDoctorName || doctorName}
                    onChange={(e) => setFormData({ ...formData, attendingDoctorName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Assigned Caregiver</label>
                  <input
                    type="text"
                    maxLength={50}
                    placeholder="e.g. Emma Johnson"
                    value={formData.assignedNurseName || (!isDoctor ? (user?.fullName || user?.username || '') : '')}
                    onChange={(e) => setFormData({ ...formData, assignedNurseName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({});
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Save Care Plan to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: View Full Plan Details */}
      {showViewModal && modalTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                Care Plan: {modalTarget.planTitle}
              </h3>
              <button onClick={() => {
                setShowViewModal(false);
                setModalTarget(null);
              }} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-500 font-bold block text-[10px] uppercase tracking-wider">Patient</span>
                  <span className="font-extrabold text-slate-900">{modalTarget.patientName}</span>
                  <span className="text-slate-400 block text-[10px]">{modalTarget.patientIdCode}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block text-[10px] uppercase tracking-wider">Primary Condition</span>
                  <span className="font-extrabold text-slate-900">{modalTarget.primaryCondition}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block text-[10px] uppercase tracking-wider">Status</span>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    modalTarget.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {modalTarget.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block text-[10px] uppercase tracking-wider">Assigned Caregiver</span>
                  <span className="font-bold text-slate-800">{modalTarget.assignedNurseName}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block text-[10px] uppercase tracking-wider">Physician</span>
                  <span className="font-bold text-slate-800">{modalTarget.attendingDoctorName}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block text-[10px] uppercase tracking-wider">Unit / Room</span>
                  <span className="font-bold text-slate-800">{modalTarget.careUnit} • {modalTarget.roomNumber}</span>
                </div>
              </div>

              {/* Progress Summary */}
              <div className="space-y-2">
                <div className="flex justify-between font-extrabold text-slate-800">
                  <span>Overall Completion Progress</span>
                  <span>{modalTarget.overallProgressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      modalTarget.overallProgressPercentage >= 75 ? 'bg-emerald-500' :
                      modalTarget.overallProgressPercentage >= 40 ? 'bg-indigo-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${modalTarget.overallProgressPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Clinical Notes List */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                {(() => {
                  const modalNotes = extractPlanNotes(modalTarget);
                  return (
                    <>
                      <h4 className="font-black text-slate-900 text-xs">Progress Notes & Observations ({modalNotes.length})</h4>
                      {modalNotes.length > 0 ? (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {modalNotes.map((n: any, idx: number) => (
                            <div key={n.id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700">
                              <p className="font-medium text-xs leading-relaxed break-words">{n.text}</p>
                              <p className="text-[10px] text-slate-400 font-bold mt-1.5 flex justify-between">
                                <span>By: {n.author}</span>
                                <span>{n.date}</span>
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">No notes recorded yet for this plan.</p>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowViewModal(false);
                  setModalTarget(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit Care Plan */}
      {showEditModal && modalTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-indigo-600" />
                Edit Care Plan
              </h3>
              <button onClick={() => {
                setShowEditModal(false);
                setFormData({});
                setModalTarget(null);
              }} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCarePlan} className="space-y-3.5 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Plan Title</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={formData.planTitle || ''}
                  onChange={(e) => setFormData({ ...formData, planTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Primary Condition</label>
                  <input
                    type="text"
                    maxLength={50}
                    value={formData.primaryCondition || ''}
                    onChange={(e) => setFormData({ ...formData, primaryCondition: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Status</label>
                  <select
                    value={formData.status || ''}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">Select Status</option>
                    <option value="Active">Active</option>
                    <option value="ReviewDue">Review Due</option>
                    <option value="Completed">Completed</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Review Date</label>
                  <input
                    type="text"
                    maxLength={50}
                    value={formData.reviewDateText || ''}
                    onChange={(e) => setFormData({ ...formData, reviewDateText: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Progress Percentage (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.overallProgressPercentage || 0}
                    onChange={(e) => setFormData({ ...formData, overallProgressPercentage: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setFormData({});
                    setModalTarget(null);
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit2 className="h-4 w-4" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Delete Confirmation Dialog */}
      {showDeleteModal && modalTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-rose-600 text-base flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Delete Care Plan
              </h3>
              <button onClick={() => {
                setShowDeleteModal(false);
                setModalTarget(null);
              }} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-slate-700 font-bold">
                Are you sure you want to delete this care plan for <span className="text-slate-900 font-extrabold">{modalTarget.patientName}</span>?
              </p>
              <p className="text-slate-500">
                This will permanently delete the care plan <span className="font-bold text-slate-700">"{modalTarget.planTitle}"</span> from the database.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setModalTarget(null);
                }}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCarePlan}
                disabled={actionLoading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-600/20 inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Add Care Plan Note */}
      {showNoteModal && modalTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                Add Care Plan Note
              </h3>
              <button onClick={() => {
                setShowNoteModal(false);
                setFormData({});
                setModalTarget(null);
              }} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddNote} className="space-y-3.5 text-xs font-semibold">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="font-extrabold text-slate-900">{modalTarget.patientName}</p>
                <p className="text-[11px] text-slate-500">{modalTarget.planTitle}</p>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Clinical Observation / Progress Note</label>
                <textarea
                  rows={4}
                  required
                  maxLength={1500}
                  placeholder="Enter observation on patient care plan progress..."
                  value={formData.noteText || ''}
                  onChange={(e) => setFormData({ ...formData, noteText: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                ></textarea>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Max length: 1500</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowNoteModal(false);
                    setFormData({});
                    setModalTarget(null);
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                  Save Note to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: Care Plan Review */}
      {showReviewModal && modalTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-indigo-600" />
                Care Plan Review
              </h3>
              <button onClick={() => {
                setShowReviewModal(false);
                setFormData({});
                setModalTarget(null);
              }} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleReviewCarePlan} className="space-y-3.5 text-xs font-semibold">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="font-extrabold text-slate-900">{modalTarget.patientName}</p>
                <p className="text-[11px] text-slate-500">Current Review Date: {modalTarget.reviewDateText}</p>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">New Review Date</label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  placeholder="e.g. Jun 20, 2024"
                  value={formData.newReviewDateText || 'Jun 20, 2024'}
                  onChange={(e) => setFormData({ ...formData, newReviewDateText: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Overall Progress (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={formData.overallProgressPercentage || modalTarget.overallProgressPercentage}
                  onChange={(e) => setFormData({ ...formData, overallProgressPercentage: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Review Outcome / Modifications</label>
                <textarea
                  rows={3}
                  maxLength={1000}
                  placeholder="Document modifications to patient care goals..."
                  value={formData.reviewOutcome || ''}
                  onChange={(e) => setFormData({ ...formData, reviewOutcome: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewModal(false);
                    setFormData({});
                    setModalTarget(null);
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  Record Plan Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CarePlansPage;

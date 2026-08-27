import React, { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/context/AuthContext';
import { PageHeader } from '@/components/common/PageHeader';
import {
  Search,
  Calendar,
  SlidersHorizontal,
  Users,
  CheckCircle2,
  Clock,
  RotateCw,
  Eye,
  Edit2,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Heart,
  Stethoscope,
  Scissors,
  Apple,
  Activity,
  Brain,
  Smile,
  User,
  FileText,
  Printer,
  ArrowRight,
  X,
  Loader2,
  RefreshCw
} from 'lucide-react';

export const ConsultationsPage: React.FC = () => {
  const { user } = useAuth();
  const isDoctor = user?.role?.toLowerCase() === 'doctor';

  const doctorName = useMemo(() => {
    if (user?.fullName) return user.fullName;
    if (!user?.username) return 'Doctor 1 Test';
    const name = user.username;
    if (name.toLowerCase().startsWith('dr.')) return name;
    return name;
  }, [user]);

  const [consultations, setConsultations] = useState<any[]>([]);
  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [recentConsultations, setRecentConsultations] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    totalConsultations: 0,
    completed: 0,
    inProgress: 0,
    scheduled: 0,
    followUpDue: 0,
  });
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Tabs & Filters
  const [activeTab, setActiveTab] = useState('All Consultations');
  const [searchQuery, setSearchQuery] = useState('');
  const [unitFilter, setUnitFilter] = useState('All Units / Floors');
  const [patientFilter, setPatientFilter] = useState('All Patients');
  const [typeFilter, setTypeFilter] = useState('All Consultation Types');
  const [statusFilter, setStatusFilter] = useState('All Status');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals
  const [showNewModal, setShowNewModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [modalTarget, setModalTarget] = useState<any>(null);

  // Form States
  const [formData, setFormData] = useState<any>({});
  const [actionLoading, setActionLoading] = useState(false);

  // Today's formatted date string
  const todayFormattedDate = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    }).format(new Date());
  }, []);

  const fetchConsultationsData = async () => {
    setLoading(true);
    try {
      const [listRes, sumRes, patRes] = await Promise.all([
        api.getConsultations({
          tab: activeTab,
          status: statusFilter,
          type: typeFilter,
          patient: patientFilter,
          careUnit: unitFilter,
          search: searchQuery,
          doctorName: doctorName
        }),
        api.getConsultationSummary(),
        api.getPatients(undefined, undefined, undefined, user?.doctorId, user?.nurseId)
      ]);

      let listData = Array.isArray(listRes) ? listRes : (listRes as any)?.data || [];

      if (activeTab === "Today's Schedule" || activeTab === "Today") {
        const now = new Date();
        const monthShort = now.toLocaleString('en-US', { month: 'short' }).toLowerCase();
        const monthLong = now.toLocaleString('en-US', { month: 'long' }).toLowerCase();
        const day = String(now.getDate()).padStart(2, '0');
        const dayNoPad = String(now.getDate());
        const year = String(now.getFullYear());

        listData = listData.filter((c: any) => {
          const dt = (c.dateTimeText || '').toLowerCase();
          if (dt.includes('today')) return true;
          if (
            (dt.includes(`${monthShort} ${day}`) || dt.includes(`${monthShort} ${dayNoPad}`) ||
             dt.includes(`${monthLong} ${day}`) || dt.includes(`${monthLong} ${dayNoPad}`) ||
             dt.includes(`${day} ${monthShort}`) || dt.includes(`${dayNoPad} ${monthShort}`) ||
             dt.includes(`${day} ${monthLong}`) || dt.includes(`${dayNoPad} ${monthLong}`)) &&
            (dt.includes(year) || !dt.match(/\d{4}/))
          ) {
            return true;
          }
          return false;
        });
      }

      setConsultations(listData);

      if (listData.length > 0) {
        if (!selectedConsultation || !listData.find((c: any) => c.id === selectedConsultation.id)) {
          setSelectedConsultation(listData[0]);
          loadRecentForPatient(listData[0]);
        }
      } else {
        setSelectedConsultation(null);
        setRecentConsultations([]);
      }

      const sumData = (sumRes as any)?.data || sumRes;
      if (sumData) {
        setSummary(sumData);
      }

      const patients = Array.isArray(patRes) ? patRes : (patRes as any)?.data || [];
      setPatientsList(patients);
    } catch (err) {
      console.error('Failed to fetch consultations data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentForPatient = async (consultation: any) => {
    if (!consultation?.patientIdCode && !consultation?.patientName) return;
    try {
      const q = consultation.patientIdCode || consultation.patientName;
      const res = await api.getRecentConsultations(q);
      const list = Array.isArray(res) ? res : (res as any)?.data || [];
      setRecentConsultations(list.filter((c: any) => c.id !== consultation.id).slice(0, 3));
    } catch (err) {
      console.error('Failed to load recent consultations for patient:', err);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchConsultationsData();
  }, [activeTab, searchQuery, unitFilter, patientFilter, typeFilter, statusFilter]);

  const handleSelectRow = (row: any) => {
    setSelectedConsultation(row);
    loadRecentForPatient(row);
  };

  // Like Action
  const handleToggleLike = async (e: React.MouseEvent, row: any) => {
    e.stopPropagation();
    try {
      const res = await api.toggleLikeConsultation(row.id);
      const updated = (res as any)?.data || res;
      setConsultations((prev) =>
        prev.map((item) => (item.id === row.id ? { ...item, isLiked: updated?.isLiked ?? !item.isLiked } : item))
      );
      if (selectedConsultation?.id === row.id) {
        setSelectedConsultation((prev: any) => ({ ...prev, isLiked: updated?.isLiked ?? !prev.isLiked }));
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (!modalTarget?.id) return;
    try {
      setActionLoading(true);
      await api.deleteConsultation(modalTarget.id);
      setShowDeleteModal(false);
      setModalTarget(null);
      fetchConsultationsData();
    } catch (err) {
      console.error('Failed to delete consultation:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Create Action
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await api.createConsultation(formData);
      setShowNewModal(false);
      setFormData({});
      fetchConsultationsData();
    } catch (err) {
      console.error('Failed to create consultation:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Edit Action
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTarget?.id) return;
    try {
      setActionLoading(true);
      await api.updateConsultation(modalTarget.id, formData);
      setShowEditModal(false);
      setModalTarget(null);
      fetchConsultationsData();
    } catch (err) {
      console.error('Failed to update consultation:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Follow-up Action
  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConsultation?.id) return;
    try {
      setActionLoading(true);
      await api.scheduleConsultationFollowUp(selectedConsultation.id, formData);
      setShowFollowUpModal(false);
      setFormData({});
      fetchConsultationsData();
    } catch (err) {
      console.error('Failed to schedule follow up:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Add Note Action
  const handleAddNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConsultation?.id) return;
    try {
      setActionLoading(true);
      await api.addConsultationNote(selectedConsultation.id, formData);
      setShowNoteModal(false);
      setFormData({});
      fetchConsultationsData();
    } catch (err) {
      console.error('Failed to add consultation note:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Refer Specialist Action
  const handleReferralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConsultation?.id) return;
    try {
      setActionLoading(true);
      await api.referConsultationSpecialist(selectedConsultation.id, formData);
      setShowReferralModal(false);
      setFormData({});
      fetchConsultationsData();
    } catch (err) {
      console.error('Failed to refer specialist:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Print Action
  const handlePrint = () => {
    window.print();
  };

  // Pagination Math
  const totalItems = consultations.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedConsultations = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return consultations.slice(start, start + pageSize);
  }, [consultations, currentPage, pageSize]);

  const getConsultationTypeIcon = (type: string) => {
    switch (type) {
      case 'Cardiology Consult':
        return <Heart className="h-4 w-4 text-[#4F46E5]" />;
      case 'Medical Consult':
        return <Stethoscope className="h-4 w-4 text-[#4F46E5]" />;
      case 'Surgical Consult':
        return <Scissors className="h-4 w-4 text-[#4F46E5]" />;
      case 'Nutrition Consult':
        return <Apple className="h-4 w-4 text-[#4F46E5]" />;
      case 'Physiotherapy Consult':
        return <Activity className="h-4 w-4 text-[#4F46E5]" />;
      case 'Neurology Consult':
        return <Brain className="h-4 w-4 text-[#4F46E5]" />;
      case 'Psychology Consult':
        return <Smile className="h-4 w-4 text-[#4F46E5]" />;
      case 'Geriatric Consult':
        return <User className="h-4 w-4 text-[#4F46E5]" />;
      default:
        return <Stethoscope className="h-4 w-4 text-[#4F46E5]" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStr = String(status);
    if (statusStr === 'InProgress' || statusStr === '0' || statusStr === 'In Progress') {
      return <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">In Progress</span>;
    }
    if (statusStr === 'Completed' || statusStr === '1') {
      return <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">Completed</span>;
    }
    if (statusStr === 'Scheduled' || statusStr === '2') {
      return <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200">Scheduled</span>;
    }
    if (statusStr === 'FollowUpDue' || statusStr === '3' || statusStr === 'Follow-up Due') {
      return <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">Follow-up Due</span>;
    }
    return <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-700">{statusStr}</span>;
  };

  return (
    <div className="space-y-5 max-w-[1700px] mx-auto select-none font-sans text-slate-800">
      
      {/* Page Header */}
      <PageHeader
        title="Consultations"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Consultations' },
        ]}
      />

      {/* 2. Sub-Header Navigation Tabs & + New Consultation Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200/80 bg-white px-6 py-2.5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-6 text-xs font-bold overflow-x-auto w-full sm:w-auto">
          {[
            'All Consultations',
            'My Consultations',
            "Today's Schedule",
            'Follow-ups',
            'Completed'
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
              patientName: '',
              patientIdCode: '',
              consultationType: 'Cardiology Consult',
              consultationSubtitle: '',
              physicianName: doctorName,
              physicianRole: isDoctor ? 'Cardiologist' : 'Attending Physician',
              dateTimeText: `${todayFormattedDate} 10:00 AM`,
              location: 'Consultation Room 1',
              careUnit: 'Cardiology Unit',
              roomNumber: '302',
              ageGender: '60 Y • Male',
              bloodGroup: 'A+',
              reason: '',
              status: 'Scheduled',
              clinicalNotes: ''
            });
            setShowNewModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-600/20 transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          <span>New Consultation</span>
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
              placeholder="Search consultations..."
              className="pl-8 pr-3 py-2 w-52 sm:w-60 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Date Picker Button */}
          <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>{todayFormattedDate}</span>
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
              {patientsList.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Consultation Type Dropdown */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option>All Consultation Types</option>
              <option>Cardiology Consult</option>
              <option>Medical Consult</option>
              <option>Surgical Consult</option>
              <option>Nutrition Consult</option>
              <option>Physiotherapy Consult</option>
              <option>Neurology Consult</option>
              <option>Psychology Consult</option>
              <option>Geriatric Consult</option>
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
              <option>In Progress</option>
              <option>Completed</option>
              <option>Scheduled</option>
              <option>Follow-up Due</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Refresh / Reset Filters Button */}
          <button
            onClick={() => {
              setSearchQuery('');
              setUnitFilter('All Units / Floors');
              setPatientFilter('All Patients');
              setTypeFilter('All Consultation Types');
              setStatusFilter('All Status');
              fetchConsultationsData();
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
        
        {/* Card 1: Total Consultations */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">{summary.totalConsultations}</h3>
            <p className="text-[11px] font-bold text-slate-500">Total Consultations</p>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Database record count</p>
          </div>
        </div>

        {/* Card 2: Completed */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">{summary.completed}</h3>
            <p className="text-[11px] font-bold text-slate-500">Completed</p>
            <p className="text-[10px] font-extrabold text-emerald-600 mt-0.5">
              {summary.totalConsultations > 0 ? Math.round((summary.completed / summary.totalConsultations) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Card 3: In Progress */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">{summary.inProgress}</h3>
            <p className="text-[11px] font-bold text-slate-500">In Progress</p>
            <p className="text-[10px] font-extrabold text-amber-600 mt-0.5">
              {summary.totalConsultations > 0 ? Math.round((summary.inProgress / summary.totalConsultations) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Card 4: Scheduled */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <Calendar className="h-6 w-6 text-rose-500" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">{summary.scheduled}</h3>
            <p className="text-[11px] font-bold text-slate-500">Scheduled</p>
            <p className="text-[10px] font-extrabold text-rose-600 mt-0.5">
              {summary.totalConsultations > 0 ? Math.round((summary.scheduled / summary.totalConsultations) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Card 5: Follow-up Due */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <RotateCw className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">{summary.followUpDue}</h3>
            <p className="text-[11px] font-bold text-slate-500">Follow-up Due</p>
            <p className="text-[10px] font-extrabold text-blue-600 mt-0.5">
              {summary.totalConsultations > 0 ? Math.round((summary.followUpDue / summary.totalConsultations) * 100) : 0}%
            </p>
          </div>
        </div>

      </div>

      {/* 5. Main Split Screen (8 Cols Table + 4 Cols Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Section: Consultations List Table (8 Columns) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-extrabold text-slate-900 text-sm">
              Consultations List ({consultations.length})
            </h2>
            <span className="text-[11px] font-semibold text-slate-400">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          <div className="overflow-x-auto min-h-[300px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-center space-y-2">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <p className="text-xs font-bold text-slate-500">Loading consultations from database...</p>
              </div>
            ) : paginatedConsultations.length > 0 ? (
              <table className="w-full text-left text-xs font-semibold text-slate-700 border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Patient</th>
                    <th className="py-3.5 px-3">Consultation Type</th>
                    <th className="py-3.5 px-3">Physician</th>
                    <th className="py-3.5 px-3">Date & Time</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-3">Follow-up</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedConsultations.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => handleSelectRow(row)}
                      className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                        selectedConsultation?.id === row.id ? 'bg-indigo-50/40' : ''
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
                            <p className="text-[10px] text-slate-400 font-semibold">PID: {row.patientIdCode || 'PT-10001'} | Room {row.roomNumber || '302'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Consultation Type */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getConsultationTypeIcon(row.consultationType)}
                          <div>
                            <p className="font-extrabold text-slate-900 text-xs leading-tight">{row.consultationType}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">{row.consultationSubtitle}</p>
                          </div>
                        </div>
                      </td>

                      {/* Physician */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          {row.physicianAvatar ? (
                            <img
                              src={row.physicianAvatar}
                              alt={row.physicianName}
                              className="h-7 w-7 rounded-full object-cover shrink-0 border border-slate-200"
                            />
                          ) : (
                            <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0 border border-blue-200">
                              {row.physicianName ? row.physicianName.replace('Dr. ', '').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'DR'}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900 text-xs leading-tight">{row.physicianName}</p>
                            <p className="text-[10px] font-semibold text-slate-400">{row.physicianRole}</p>
                          </div>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-slate-600 text-[11px]">
                        {row.dateTimeText}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {getStatusBadge(row.status)}
                      </td>

                      {/* Follow-up */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {row.followUpDateText && row.followUpDateText !== '-' ? (
                          <span className={`font-bold text-xs ${row.status === 'FollowUpDue' || row.status === 'Follow-up Due' ? 'text-rose-600' : row.status === 'Completed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {row.followUpDateText}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-bold">-</span>
                        )}
                      </td>

                      {/* Working Actions: View, Edit, Delete, Like (No More icon) */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          
                          {/* Like Button */}
                          <button
                            onClick={(e) => handleToggleLike(e, row)}
                            className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title={row.isLiked ? 'Unlike Consultation' : 'Like Consultation'}
                          >
                            <Heart className={`h-4 w-4 transition-colors ${row.isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-400 hover:text-rose-500'}`} />
                          </button>

                          {/* View Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalTarget(row);
                              setShowViewModal(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="View Consultation Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalTarget(row);
                              setFormData({
                                patientName: row.patientName,
                                patientIdCode: row.patientIdCode,
                                roomNumber: row.roomNumber,
                                careUnit: row.careUnit,
                                ageGender: row.ageGender,
                                bloodGroup: row.bloodGroup,
                                consultationType: row.consultationType,
                                consultationSubtitle: row.consultationSubtitle,
                                physicianName: row.physicianName,
                                physicianRole: row.physicianRole,
                                dateTimeText: row.dateTimeText,
                                location: row.location,
                                reason: row.reason,
                                status: row.status,
                                followUpDateText: row.followUpDateText,
                                clinicalNotes: row.clinicalNotes
                              });
                              setShowEditModal(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Consultation"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalTarget(row);
                              setShowDeleteModal(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Consultation"
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
                <Calendar className="w-10 h-10 stroke-1 text-slate-300" />
                <p className="text-sm font-bold text-slate-600">No consultations found</p>
                <p className="text-xs">No records matched your selected tab or filter criteria.</p>
              </div>
            )}
          </div>

          {/* Table Working Pagination Bar */}
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-500">
            <span>
              Showing {totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(currentPage * pageSize, totalItems)} of {totalItems} consultations
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
          
          {/* Card 1: Selected Consultation Details */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-900 text-xs">Selected Consultation</h3>
              <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
            </div>

            {selectedConsultation ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  {selectedConsultation.patientAvatar ? (
                    <img
                      src={selectedConsultation.patientAvatar}
                      alt={selectedConsultation.patientName}
                      className="h-12 w-12 rounded-full object-cover shrink-0 border-2 border-indigo-100 shadow-xs"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg shrink-0 border-2 border-indigo-100 shadow-xs">
                      {selectedConsultation.patientName ? selectedConsultation.patientName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'PT'}
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-slate-900 text-sm">{selectedConsultation.patientName}</h4>
                      {selectedConsultation.isLiked && <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />}
                    </div>
                    <p className="text-[11px] font-bold text-slate-500">PID: {selectedConsultation.patientIdCode || 'PT-10001'} | Room {selectedConsultation.roomNumber || '302'}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{selectedConsultation.ageGender || '68 Y • Female • A+'}</p>
                    <p className="text-[10px] text-slate-500 font-semibold">{selectedConsultation.consultationSubtitle || selectedConsultation.consultationType}</p>
                    <div>{getStatusBadge(selectedConsultation.status)}</div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs font-semibold">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Consultation Details</p>

                  <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-xs">
                    <div>
                      <p className="text-[10px] text-slate-400">Consultation Type</p>
                      <p className="font-extrabold text-slate-900">{selectedConsultation.consultationType}</p>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-400">Physician</p>
                      <p className="font-extrabold text-slate-900">{selectedConsultation.physicianName}</p>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-400">Date & Time</p>
                      <p className="font-extrabold text-slate-900">{selectedConsultation.dateTimeText}</p>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-400">Location</p>
                      <p className="font-extrabold text-slate-900">{selectedConsultation.location || 'Cardiology OPD'}</p>
                    </div>
                  </div>

                  <div className="pt-1">
                    <p className="text-[10px] text-slate-400">Reason</p>
                    <p className="font-bold text-slate-800 text-xs">{selectedConsultation.reason || 'General Consultation'}</p>
                  </div>

                  {selectedConsultation.clinicalNotes && (
                    <div className="pt-1">
                      <p className="text-[10px] text-slate-400">Clinical Notes</p>
                      <p className="font-medium text-slate-700 text-xs whitespace-pre-line bg-slate-50 p-2 rounded-lg border border-slate-100">
                        {selectedConsultation.clinicalNotes}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setModalTarget(selectedConsultation);
                    setShowViewModal(true);
                  }}
                  className="w-full py-2 bg-white hover:bg-slate-50 border border-indigo-200 text-indigo-600 rounded-xl text-xs font-black transition-colors cursor-pointer mt-2"
                >
                  View Full Details
                </button>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                Select a consultation to view details.
              </div>
            )}
          </div>

          {/* Card 2: Recent Consultations (Loaded Dynamically from Database) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-xs">Recent Consultations</h3>
              <button
                onClick={() => setActiveTab('All Consultations')}
                className="text-[10px] font-extrabold text-indigo-600 hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-2 text-xs font-semibold">
              {recentConsultations.length > 0 ? (
                recentConsultations.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    onClick={() => handleSelectRow(item)}
                    className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-indigo-50/40 border border-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="font-extrabold text-slate-900 text-xs">{item.dateTimeText || item.createdDate}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{item.consultationType || item.consultationSubtitle}</p>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-slate-400 text-[11px] font-semibold">
                  No other recent consultations found for this patient.
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Quick Actions (All Fully Functional) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-2.5">
            <h3 className="font-extrabold text-slate-900 text-xs">Quick Actions</h3>

            <button
              onClick={() => {
                setFormData({
                  patientName: selectedConsultation?.patientName || '',
                  patientIdCode: selectedConsultation?.patientIdCode || '',
                  consultationType: 'Medical Consult',
                  consultationSubtitle: 'Follow-up',
                  physicianName: doctorName,
                  physicianRole: 'Attending Physician',
                  dateTimeText: `${todayFormattedDate} 11:30 AM`,
                  location: 'Consultation Room 2',
                  careUnit: selectedConsultation?.careUnit || 'General Ward',
                  roomNumber: selectedConsultation?.roomNumber || '101',
                  ageGender: selectedConsultation?.ageGender || '60 Y • General',
                  bloodGroup: selectedConsultation?.bloodGroup || 'A+',
                  reason: '',
                  status: 'Scheduled',
                  clinicalNotes: ''
                });
                setShowNewModal(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-2 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl text-xs font-black transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              New Consultation
            </button>

            <button
              onClick={() => {
                if (!selectedConsultation) return;
                setFormData({
                  followUpDate: `${todayFormattedDate}`,
                  physicianName: selectedConsultation.physicianName || doctorName,
                  notes: 'Scheduled for follow-up review.'
                });
                setShowFollowUpModal(true);
              }}
              disabled={!selectedConsultation}
              className="w-full flex items-center justify-center gap-2 py-2 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl text-xs font-black transition-colors cursor-pointer disabled:opacity-50"
            >
              <Calendar className="h-4 w-4" />
              Schedule Follow-up
            </button>

            <button
              onClick={() => {
                if (!selectedConsultation) return;
                setFormData({
                  clinicalNotes: '',
                  diagnosis: selectedConsultation.consultationSubtitle || ''
                });
                setShowNoteModal(true);
              }}
              disabled={!selectedConsultation}
              className="w-full flex items-center justify-center gap-2 py-2 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl text-xs font-black transition-colors cursor-pointer disabled:opacity-50"
            >
              <FileText className="h-4 w-4" />
              Add Consultation Note
            </button>

            <button
              onClick={() => {
                if (!selectedConsultation) return;
                setFormData({
                  specialistDepartment: 'Cardiology',
                  specialistName: 'Dr. Sarah Wilson',
                  reason: 'Specialist evaluation required.',
                  priority: 'Routine'
                });
                setShowReferralModal(true);
              }}
              disabled={!selectedConsultation}
              className="w-full flex items-center justify-center gap-2 py-2 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl text-xs font-black transition-colors cursor-pointer disabled:opacity-50"
            >
              <ArrowRight className="h-4 w-4" />
              Refer to Specialist
            </button>

            <button
              onClick={handlePrint}
              disabled={!selectedConsultation}
              className="w-full flex items-center justify-center gap-2 py-2 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl text-xs font-black transition-colors cursor-pointer disabled:opacity-50"
            >
              <Printer className="h-4 w-4" />
              Print Consultation
            </button>
          </div>

        </div>

      </div>

      {/* MODAL 1: New Consultation Form */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base">Schedule New Consultation</h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Patient Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Patricia Smith"
                    value={formData.patientName || ''}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Patient ID Code</label>
                  <input
                    type="text"
                    placeholder="e.g. PT-10001"
                    value={formData.patientIdCode || ''}
                    onChange={(e) => setFormData({ ...formData, patientIdCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Consultation Type</label>
                  <select
                    value={formData.consultationType || ''}
                    onChange={(e) => setFormData({ ...formData, consultationType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">Select Consultation Type</option>
                    <option>Cardiology Consult</option>
                    <option>Medical Consult</option>
                    <option>Surgical Consult</option>
                    <option>Nutrition Consult</option>
                    <option>Physiotherapy Consult</option>
                    <option>Neurology Consult</option>
                    <option>Psychology Consult</option>
                    <option>Geriatric Consult</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Subtitle / Diagnosis</label>
                  <input
                    type="text"
                    placeholder="e.g. Heart Failure"
                    value={formData.consultationSubtitle || ''}
                    onChange={(e) => setFormData({ ...formData, consultationSubtitle: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Physician Name</label>
                  <input
                    type="text"
                    required
                    value={formData.physicianName || doctorName}
                    onChange={(e) => setFormData({ ...formData, physicianName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Physician Role</label>
                  <input
                    type="text"
                    value={formData.physicianRole || 'Attending Physician'}
                    onChange={(e) => setFormData({ ...formData, physicianRole: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Date & Time</label>
                  <input
                    type="text"
                    value={formData.dateTimeText || ''}
                    onChange={(e) => setFormData({ ...formData, dateTimeText: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location || 'Consultation Room 1'}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Care Unit</label>
                  <input
                    type="text"
                    value={formData.careUnit || 'Cardiology Unit'}
                    onChange={(e) => setFormData({ ...formData, careUnit: e.target.value })}
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
                    <option value="Scheduled">Scheduled</option>
                    <option value="InProgress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="FollowUpDue">Follow-up Due</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Reason for Consultation</label>
                <textarea
                  rows={2}
                  placeholder="Describe chief complaint or reason..."
                  value={formData.reason || ''}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Clinical Notes</label>
                <textarea
                  rows={2}
                  placeholder="Clinical observations or findings..."
                  value={formData.clinicalNotes || ''}
                  onChange={(e) => setFormData({ ...formData, clinicalNotes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
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
                  Schedule Consultation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: View Consultation Details */}
      {showViewModal && modalTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Eye className="h-5 w-5 text-indigo-600" />
                Consultation Details
              </h3>
              <button onClick={() => setShowViewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              <div className="flex items-start gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                {modalTarget.patientAvatar ? (
                  <img
                    src={modalTarget.patientAvatar}
                    alt={modalTarget.patientName}
                    className="h-14 w-14 rounded-full object-cover shrink-0 border-2 border-indigo-100"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xl shrink-0 border-2 border-indigo-100">
                    {modalTarget.patientName ? modalTarget.patientName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'PT'}
                  </div>
                )}
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-slate-900 text-base">{modalTarget.patientName}</h4>
                    {getStatusBadge(modalTarget.status)}
                  </div>
                  <p className="text-slate-500 font-bold">PID: {modalTarget.patientIdCode} | Room {modalTarget.roomNumber}</p>
                  <p className="text-slate-400">{modalTarget.ageGender} • Blood Group: {modalTarget.bloodGroup}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black">Consultation Type</p>
                  <p className="font-extrabold text-slate-900 text-xs mt-0.5">{modalTarget.consultationType}</p>
                  <p className="text-[11px] text-slate-500">{modalTarget.consultationSubtitle}</p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black">Physician</p>
                  <p className="font-extrabold text-slate-900 text-xs mt-0.5">{modalTarget.physicianName}</p>
                  <p className="text-[11px] text-slate-500">{modalTarget.physicianRole}</p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black">Date & Time</p>
                  <p className="font-extrabold text-slate-900 text-xs mt-0.5">{modalTarget.dateTimeText}</p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black">Location</p>
                  <p className="font-extrabold text-slate-900 text-xs mt-0.5">{modalTarget.location || 'OPD'}</p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black">Care Unit</p>
                  <p className="font-extrabold text-slate-900 text-xs mt-0.5">{modalTarget.careUnit}</p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black">Follow-up Date</p>
                  <p className="font-extrabold text-slate-900 text-xs mt-0.5">{modalTarget.followUpDateText || 'None'}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 uppercase font-black">Reason for Consultation</p>
                <p className="text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">{modalTarget.reason || 'General check-up.'}</p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 uppercase font-black">Clinical Notes & Findings</p>
                <p className="text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-line">
                  {modalTarget.clinicalNotes || 'No notes entered yet.'}
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit Consultation Form */}
      {showEditModal && modalTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-indigo-600" />
                Edit Consultation
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Patient Name</label>
                  <input
                    type="text"
                    required
                    value={formData.patientName || ''}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Patient ID Code</label>
                  <input
                    type="text"
                    value={formData.patientIdCode || ''}
                    onChange={(e) => setFormData({ ...formData, patientIdCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Consultation Type</label>
                  <select
                    value={formData.consultationType || ''}
                    onChange={(e) => setFormData({ ...formData, consultationType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">Select Consultation Type</option>
                    <option>Cardiology Consult</option>
                    <option>Medical Consult</option>
                    <option>Surgical Consult</option>
                    <option>Nutrition Consult</option>
                    <option>Physiotherapy Consult</option>
                    <option>Neurology Consult</option>
                    <option>Psychology Consult</option>
                    <option>Geriatric Consult</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Subtitle / Condition</label>
                  <input
                    type="text"
                    value={formData.consultationSubtitle || ''}
                    onChange={(e) => setFormData({ ...formData, consultationSubtitle: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Physician Name</label>
                  <input
                    type="text"
                    required
                    value={formData.physicianName || ''}
                    onChange={(e) => setFormData({ ...formData, physicianName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Physician Role</label>
                  <input
                    type="text"
                    value={formData.physicianRole || ''}
                    onChange={(e) => setFormData({ ...formData, physicianRole: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Date & Time</label>
                  <input
                    type="text"
                    value={formData.dateTimeText || ''}
                    onChange={(e) => setFormData({ ...formData, dateTimeText: e.target.value })}
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
                    <option value="InProgress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="FollowUpDue">Follow-up Due</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Follow-up Date</label>
                  <input
                    type="text"
                    value={formData.followUpDateText || ''}
                    onChange={(e) => setFormData({ ...formData, followUpDateText: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Reason for Consultation</label>
                <textarea
                  rows={2}
                  value={formData.reason || ''}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Clinical Notes</label>
                <textarea
                  rows={3}
                  value={formData.clinicalNotes || ''}
                  onChange={(e) => setFormData({ ...formData, clinicalNotes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
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
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <Trash2 className="h-6 w-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-black text-slate-900 text-base">Delete Consultation?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete the consultation for <span className="font-extrabold text-slate-800">{modalTarget.patientName}</span>? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={actionLoading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md shadow-rose-600/20 inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Schedule Follow-up Modal */}
      {showFollowUpModal && selectedConsultation && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                Schedule Follow-up
              </h3>
              <button onClick={() => setShowFollowUpModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFollowUpSubmit} className="space-y-3.5 text-xs font-semibold">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <p className="font-extrabold text-slate-900">{selectedConsultation.patientName}</p>
                <p className="text-[11px] text-slate-500">Current Type: {selectedConsultation.consultationType}</p>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Follow-up Date</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. May 30, 2024"
                  value={formData.followUpDate || ''}
                  onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Attending Physician</label>
                <input
                  type="text"
                  value={formData.physicianName || selectedConsultation.physicianName || doctorName}
                  onChange={(e) => setFormData({ ...formData, physicianName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Follow-up Instructions / Notes</label>
                <textarea
                  rows={3}
                  placeholder="Instructions for follow-up review..."
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFollowUpModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
                  Save Follow-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: Add Consultation Note Modal */}
      {showNoteModal && selectedConsultation && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                Add Consultation Note
              </h3>
              <button onClick={() => setShowNoteModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddNoteSubmit} className="space-y-3.5 text-xs font-semibold">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <p className="font-extrabold text-slate-900">{selectedConsultation.patientName}</p>
                <p className="text-[11px] text-slate-500">PID: {selectedConsultation.patientIdCode}</p>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Clinical Diagnosis / Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. Hypertension Stage 2"
                  value={formData.diagnosis || ''}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Clinical Findings & Examination Notes</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter detailed clinical findings..."
                  value={formData.clinicalNotes || ''}
                  onChange={(e) => setFormData({ ...formData, clinicalNotes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
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
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: Refer to Specialist Modal */}
      {showReferralModal && selectedConsultation && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-indigo-600" />
                Refer to Specialist
              </h3>
              <button onClick={() => setShowReferralModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleReferralSubmit} className="space-y-3.5 text-xs font-semibold">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <p className="font-extrabold text-slate-900">{selectedConsultation.patientName}</p>
                <p className="text-[11px] text-slate-500">Referred by: {doctorName}</p>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Specialist Department</label>
                <select
                  value={formData.specialistDepartment || ''}
                  onChange={(e) => setFormData({ ...formData, specialistDepartment: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">Select Specialist Department</option>
                  <option>Cardiology</option>
                  <option>Neurology</option>
                  <option>Surgical Department</option>
                  <option>Nutrition & Dietetics</option>
                  <option>Physiotherapy & Rehab</option>
                  <option>Psychiatry & Psychology</option>
                  <option>Geriatrics</option>
                  <option>Pulmonology</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Specialist Physician Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Emily Clark"
                  value={formData.specialistName || ''}
                  onChange={(e) => setFormData({ ...formData, specialistName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Referral Priority</label>
                <select
                  value={formData.priority || ''}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">Select Referral Priority</option>
                  <option value="Routine">Routine</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Reason for Referral</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain why specialist evaluation is requested..."
                  value={formData.reason || ''}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReferralModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  Submit Referral
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ConsultationsPage;


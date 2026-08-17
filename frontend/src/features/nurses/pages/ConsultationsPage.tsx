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
  Users,
  CheckCircle2,
  Clock,
  RotateCw,
  Eye,
  MoreVertical,
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
  X
} from 'lucide-react';

export const ConsultationsPage: React.FC = () => {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    totalConsultations: 18,
    completed: 6,
    inProgress: 7,
    scheduled: 4,
    followUpDue: 1,
  });
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
  const [, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('All Consultations');
  const [searchQuery, setSearchQuery] = useState('');
  const [unitFilter, setUnitFilter] = useState('All Units / Floors');
  const [patientFilter, setPatientFilter] = useState('All Patients');
  const [typeFilter, setTypeFilter] = useState('All Consultation Types');
  const [statusFilter, setStatusFilter] = useState('All Status');

  // New Consultation Modal
  const [showModal, setShowModal] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newType, setNewType] = useState('Cardiology Consult');
  const [newPhysician, setNewPhysician] = useState('Dr. Sarah Wilson');
  const [newDateTime, setNewDateTime] = useState('May 22, 2024 09:45 AM');
  const [newLocation, setNewLocation] = useState('Cardiology OPD');
  const [newReason, setNewReason] = useState('');

  const fetchConsultationsData = async () => {
    setLoading(true);
    try {
      const [listRes, sumRes] = await Promise.all([
        api.getConsultations(activeTab, typeFilter, searchQuery),
        api.getConsultationSummary(),
      ]);

      const listData = Array.isArray(listRes) ? listRes : (listRes as any)?.data || [];
      setConsultations(listData);

      if (listData.length > 0 && !selectedConsultation) {
        setSelectedConsultation(listData[0]);
      }

      const sumData = (sumRes as any)?.data || sumRes;
      if (sumData) {
        setSummary(sumData);
      }
    } catch (err) {
      console.error('Failed to fetch consultations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultationsData();
  }, [activeTab, searchQuery, unitFilter, patientFilter, typeFilter, statusFilter]);

  const handleCreateConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName) return;

    try {
      await api.createConsultation({
        patientName: newPatientName,
        consultationType: newType,
        physicianName: newPhysician,
        dateTimeText: newDateTime,
        location: newLocation,
        reason: newReason,
      });
      setShowModal(false);
      setNewPatientName('');
      setNewReason('');
      fetchConsultationsData();
    } catch (err) {
      console.error('Failed to create consultation:', err);
    }
  };

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
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 space-y-5 p-6 max-w-[1700px] mx-auto select-none">
      
      {/* 1. Top Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Consultations</h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Manage and track patient consultations and follow-ups.
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
              placeholder="Search consultations..."
              className="pl-9 pr-4 py-2 w-56 sm:w-64 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

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
            <img
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80"
              alt="Nurse Avatar"
              className="h-9 w-9 rounded-full object-cover border border-indigo-200 shadow-xs"
            />
            <div className="text-left">
              <p className="text-xs font-extrabold text-slate-900 leading-tight">
                {user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : 'Emma Johnson'}
              </p>
              <p className="text-[10px] font-semibold text-slate-400">Staff Nurse</p>
            </div>
          </div>

        </div>
      </div>

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
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-600/20 transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          <span>New Consultation</span>
        </button>
      </div>

      {/* 3. Filter Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          
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

          {/* Filters Toggle Button */}
          <button className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-indigo-700 text-xs font-bold transition-colors cursor-pointer">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* 4. Stat Summary Cards (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Total Consultations */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">{summary.totalConsultations || summary.total || 18}</h3>
            <p className="text-[11px] font-bold text-slate-500">Total Consultations</p>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">All time</p>
          </div>
        </div>

        {/* Card 2: Completed */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">{summary.completed || 6}</h3>
            <p className="text-[11px] font-bold text-slate-500">Completed</p>
            <p className="text-[10px] font-extrabold text-slate-400 mt-0.5">33%</p>
          </div>
        </div>

        {/* Card 3: In Progress */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">{summary.inProgress || 7}</h3>
            <p className="text-[11px] font-bold text-slate-500">In Progress</p>
            <p className="text-[10px] font-extrabold text-slate-400 mt-0.5">39%</p>
          </div>
        </div>

        {/* Card 4: Scheduled */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <Calendar className="h-6 w-6 text-rose-500" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">{summary.scheduled || 4}</h3>
            <p className="text-[11px] font-bold text-slate-500">Scheduled</p>
            <p className="text-[10px] font-extrabold text-slate-400 mt-0.5">22%</p>
          </div>
        </div>

        {/* Card 5: Follow-up Due */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <RotateCw className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">{summary.followUpDue || 1}</h3>
            <p className="text-[11px] font-bold text-slate-500">Follow-up Due</p>
            <p className="text-[10px] font-extrabold text-slate-400 mt-0.5">6%</p>
          </div>
        </div>

      </div>

      {/* 5. Main Split Screen (8 Cols Table + 4 Cols Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Section: Consultations List Table (8 Columns) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          
          <div className="p-4 border-b border-slate-100">
            <h2 className="font-extrabold text-slate-900 text-sm">Consultations List</h2>
          </div>

          <div className="overflow-x-auto">
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
                {consultations.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedConsultation(row)}
                    className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                      selectedConsultation?.id === row.id ? 'bg-indigo-50/40' : ''
                    }`}
                  >
                    
                    {/* Patient */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img
                          src={row.patientAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'}
                          alt={row.patientName}
                          className="h-8 w-8 rounded-full object-cover shrink-0 border border-slate-200"
                        />
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
                        <img
                          src={row.physicianAvatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'}
                          alt={row.physicianName}
                          className="h-7 w-7 rounded-full object-cover shrink-0 border border-slate-200"
                        />
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
                        <span className={`font-bold text-xs ${row.status === 3 || row.status === 'FollowUpDue' || row.status === 'Follow-up Due' ? 'text-rose-600' : row.status === 1 || row.status === 'Completed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {row.followUpDateText}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-bold">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer" title="View Consultation Details">
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
            <span>Showing 1 to {consultations.length} of {summary.totalConsultations || 18} consultations</span>

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
          
          {/* Card 1: Selected Consultation Details */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-900 text-xs">Selected Consultation</h3>
              <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
            </div>

            {selectedConsultation && (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <img
                    src={selectedConsultation.patientAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'}
                    alt={selectedConsultation.patientName}
                    className="h-12 w-12 rounded-full object-cover shrink-0 border-2 border-indigo-100 shadow-xs"
                  />
                  <div className="space-y-1">
                    <h4 className="font-black text-slate-900 text-sm">{selectedConsultation.patientName}</h4>
                    <p className="text-[11px] font-bold text-slate-500">PID: {selectedConsultation.patientIdCode || 'PT-10001'} | Room {selectedConsultation.roomNumber || '302'}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{selectedConsultation.ageGender || '68 Y • Female • A+'}</p>
                    <p className="text-[10px] text-slate-500 font-semibold">{selectedConsultation.consultationSubtitle || 'Heart Failure'}</p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                      In Progress
                    </span>
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
                    <p className="font-bold text-slate-800 text-xs">{selectedConsultation.reason || 'Shortness of breath, fatigue'}</p>
                  </div>
                </div>

                <button className="w-full py-2 bg-white hover:bg-slate-50 border border-indigo-200 text-indigo-600 rounded-xl text-xs font-black transition-colors cursor-pointer mt-2">
                  View Full Details
                </button>
              </div>
            )}
          </div>

          {/* Card 2: Recent Consultations */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-xs">Recent Consultations</h3>
              <button className="text-[10px] font-extrabold text-indigo-600 hover:underline">View All</button>
            </div>

            <div className="space-y-2 text-xs font-semibold">
              {[
                { date: 'May 15, 2024', title: 'Follow-up', status: 'Completed' },
                { date: 'May 08, 2024', title: 'Review', status: 'Completed' },
                { date: 'May 01, 2024', title: 'Initial Consult', status: 'Completed' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <div>
                    <p className="font-extrabold text-slate-900 text-xs">{item.date}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{item.title}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-2.5">
            <h3 className="font-extrabold text-slate-900 text-xs">Quick Actions</h3>

            <button
              onClick={() => setShowModal(true)}
              className="w-full flex items-center justify-center gap-2 py-2 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl text-xs font-black transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              New Consultation
            </button>

            <button className="w-full flex items-center justify-center gap-2 py-2 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl text-xs font-black transition-colors cursor-pointer">
              <Calendar className="h-4 w-4" />
              Schedule Follow-up
            </button>

            <button className="w-full flex items-center justify-center gap-2 py-2 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl text-xs font-black transition-colors cursor-pointer">
              <FileText className="h-4 w-4" />
              Add Consultation Note
            </button>

            <button className="w-full flex items-center justify-center gap-2 py-2 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl text-xs font-black transition-colors cursor-pointer">
              <ArrowRight className="h-4 w-4" />
              Refer to Specialist
            </button>

            <button className="w-full flex items-center justify-center gap-2 py-2 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl text-xs font-black transition-colors cursor-pointer">
              <Printer className="h-4 w-4" />
              Print Consultation
            </button>
          </div>

        </div>

      </div>

      {/* New Consultation Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base">Schedule New Consultation</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateConsultation} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Patient Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Patricia Smith"
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Consultation Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option>Cardiology Consult</option>
                  <option>Medical Consult</option>
                  <option>Surgical Consult</option>
                  <option>Nutrition Consult</option>
                  <option>Physiotherapy Consult</option>
                  <option>Neurology Consult</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Physician Name</label>
                <input
                  type="text"
                  required
                  value={newPhysician}
                  onChange={(e) => setNewPhysician(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Date & Time</label>
                  <input
                    type="text"
                    value={newDateTime}
                    onChange={(e) => setNewDateTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Location</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Reason for Consultation</label>
                <textarea
                  rows={2}
                  placeholder="Describe chief complaint or reason..."
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                ></textarea>
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
                  Schedule Consultation
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

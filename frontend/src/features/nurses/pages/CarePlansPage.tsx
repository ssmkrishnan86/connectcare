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
  FileText,
  CheckCircle2,
  Clock,
  Flag,
  ClipboardCheck,
  Eye,
  MoreVertical,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Heart,
  Wind,
  Scissors,
  Activity,
  Droplet,
  Brain,
  Bone,
  Apple,
  Edit2,
  Printer,
  RefreshCw,
  X
} from 'lucide-react';

export const CarePlansPage: React.FC = () => {
  const { user } = useAuth();
  const [carePlans, setCarePlans] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    totalCarePlans: 28,
    activePlans: 16,
    reviewDue: 6,
    completed: 4,
    draftPlans: 2,
  });
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('All Care Plans');
  const [searchQuery, setSearchQuery] = useState('');
  const [unitFilter, setUnitFilter] = useState('All Units / Floors');
  const [patientFilter, setPatientFilter] = useState('All Patients');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [conditionFilter, setConditionFilter] = useState('All Conditions');

  // New Care Plan Modal
  const [showModal, setShowModal] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newCondition, setNewCondition] = useState('Heart Failure');
  const [newPlanTitle, setNewPlanTitle] = useState('Heart Failure Management');
  const [newNurse, setNewNurse] = useState('Emma Johnson');

  const fetchCarePlansData = async () => {
    setLoading(true);
    try {
      const [listRes, sumRes] = await Promise.all([
        api.getCarePlans(activeTab, searchQuery),
        api.getCarePlanSummary(),
      ]);

      const listData = Array.isArray(listRes) ? listRes : (listRes as any)?.data || [];
      setCarePlans(listData);

      if (listData.length > 0 && !selectedPlan) {
        setSelectedPlan(listData[0]);
      }

      const sumData = (sumRes as any)?.data || sumRes;
      if (sumData) {
        setSummary(sumData);
      }
    } catch (err) {
      console.error('Failed to fetch care plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarePlansData();
  }, [activeTab, searchQuery, unitFilter, patientFilter, statusFilter, conditionFilter]);

  const handleCreateCarePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName) return;

    try {
      await api.createCarePlan({
        patientName: newPatientName,
        primaryCondition: newCondition,
        planTitle: newPlanTitle,
        assignedNurseName: newNurse,
        startDateText: 'May 22, 2024',
        reviewDateText: 'May 29, 2024',
      });
      setShowModal(false);
      setNewPatientName('');
      fetchCarePlansData();
    } catch (err) {
      console.error('Failed to create care plan:', err);
    }
  };

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

  const isDoctor = user?.role?.toLowerCase() === 'doctor';

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 space-y-5 p-6 max-w-[1700px] mx-auto select-none">
      
      {/* 1. Top Header Bar (Nurse View Only) */}
      {!isDoctor && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Care Plans</h1>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Manage and track individualized care plans for your patients.
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
                placeholder="Search care plans..."
                className="pl-9 pr-4 py-2 w-56 sm:w-64 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Icon Badges */}
            <button className="relative p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer" title="Messages">
              <MessageSquare className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center">5</span>
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
      )}

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
          onClick={() => setShowModal(true)}
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
              <option>ICU</option>
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
        
        {/* Card 1: Total Care Plans */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">{summary.totalCarePlans || summary.total || 28}</h3>
            <p className="text-[11px] font-bold text-slate-500">Total Care Plans</p>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">All patients</p>
          </div>
        </div>

        {/* Card 2: Active Plans */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">{summary.activePlans || summary.active || 16}</h3>
            <p className="text-[11px] font-bold text-slate-500">Active Plans</p>
            <p className="text-[10px] font-extrabold text-slate-400 mt-0.5">57%</p>
          </div>
        </div>

        {/* Card 3: Review Due */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">{summary.reviewDue || summary.review || 6}</h3>
            <p className="text-[11px] font-bold text-slate-500">Review Due</p>
            <p className="text-[10px] font-extrabold text-slate-400 mt-0.5">21%</p>
          </div>
        </div>

        {/* Card 4: Completed */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <Flag className="h-6 w-6 fill-rose-100" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">{summary.completed || 4}</h3>
            <p className="text-[11px] font-bold text-slate-500">Completed</p>
            <p className="text-[10px] font-extrabold text-slate-400 mt-0.5">14%</p>
          </div>
        </div>

        {/* Card 5: Draft Plans */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">{summary.draftPlans || summary.draft || 2}</h3>
            <p className="text-[11px] font-bold text-slate-500">Draft Plans</p>
            <p className="text-[10px] font-extrabold text-slate-400 mt-0.5">7%</p>
          </div>
        </div>

      </div>

      {/* 5. Main Split Screen (8 Cols Table + 4 Cols Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Section: Care Plans Table (8 Columns) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          
          <div className="p-4 border-b border-slate-100">
            <h2 className="font-extrabold text-slate-900 text-sm">Care Plans</h2>
          </div>

          <div className="overflow-x-auto">
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
                {carePlans.map((row) => (
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
                        <img
                          src={row.patientAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'}
                          alt={row.patientName}
                          className="h-8 w-8 rounded-full object-cover shrink-0 border border-slate-200"
                        />
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
                      <p className="text-[10px] font-semibold text-slate-400">Staff Nurse</p>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer" title="View Details">
                          <Eye className="h-4 w-4" />
                        </button>
                        {row.status === 'Draft' ? (
                          <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer" title="Edit Plan">
                            <Edit2 className="h-4 w-4" />
                          </button>
                        ) : (
                          <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer" title="Options">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Bar */}
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-500">
            <span>Showing 1 to {carePlans.length} of {summary.totalCarePlans || 28} care plans</span>

            <div className="flex items-center gap-1.5">
              <button className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="px-3 py-1 bg-indigo-600 text-white rounded-lg font-black text-xs">1</button>
              <button className="px-3 py-1 hover:bg-slate-100 text-slate-700 rounded-lg font-bold text-xs cursor-pointer">2</button>
              <button className="px-3 py-1 hover:bg-slate-100 text-slate-700 rounded-lg font-bold text-xs cursor-pointer">3</button>
              <button className="px-3 py-1 hover:bg-slate-100 text-slate-700 rounded-lg font-bold text-xs cursor-pointer">4</button>
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

            {selectedPlan && (
              <div className="flex items-start gap-3 pt-1">
                <img
                  src={selectedPlan.patientAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'}
                  alt={selectedPlan.patientName}
                  className="h-12 w-12 rounded-full object-cover shrink-0 border-2 border-indigo-100 shadow-xs"
                />
                <div className="space-y-1">
                  <h4 className="font-black text-slate-900 text-sm">{selectedPlan.patientName}</h4>
                  <p className="text-[11px] font-bold text-slate-500">PID: {selectedPlan.patientIdCode || 'PT-10001'}</p>
                  <p className="text-[10px] text-slate-400 font-semibold">{selectedPlan.ageGender || '68 Y • Female • A+'}</p>
                  <p className="text-[10px] text-slate-500 font-semibold">{selectedPlan.roomNumber || 'Room 302'} • {selectedPlan.careUnit || 'Cardiology Unit'}</p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-[9px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                    Inpatient
                  </span>
                </div>
              </div>
            )}

            {/* 3 Patient Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 pt-3 text-center border-t border-slate-100 text-xs">
              <div className="p-2 bg-slate-50 rounded-xl">
                <p className="text-[10px] text-slate-400 font-semibold">Attending Doctor</p>
                <p className="font-extrabold text-slate-900 text-[11px] truncate mt-0.5">{selectedPlan?.attendingDoctorName || 'Dr. Sarah Wilson'}</p>
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

          {/* Card 2: Care Plan Progress */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-xs">Care Plan Progress</h3>
              <button className="text-[10px] font-extrabold text-indigo-600 hover:underline">View Details</button>
            </div>

            {/* Donut Progress Ring */}
            <div className="flex items-center gap-6">
              <div className="relative flex items-center justify-center shrink-0">
                <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-emerald-500" strokeWidth="4" strokeDasharray={`${selectedPlan?.overallProgressPercentage || 78}, 100`} stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-lg font-black text-slate-900">{selectedPlan?.overallProgressPercentage || 78}%</span>
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
                  <span className="font-extrabold text-slate-900">{selectedPlan?.completedTasksCount || 14}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    <span>In Progress</span>
                  </div>
                  <span className="font-extrabold text-slate-900">{selectedPlan?.inProgressTasksCount || 8}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    <span>Not Started</span>
                  </div>
                  <span className="font-extrabold text-slate-900">{selectedPlan?.notStartedTasksCount || 4}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                    <span>Overdue</span>
                  </div>
                  <span className="font-extrabold text-slate-900">{selectedPlan?.overdueTasksCount || 2}</span>
                </div>
              </div>
            </div>

            <p className="text-[10px] font-semibold text-slate-400 border-t border-slate-100 pt-2 text-center">
              Last Updated: {selectedPlan?.lastUpdatedText || 'May 22, 2024 10:30 AM'}
            </p>
          </div>

          {/* Card 3: Recent Notes */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-xs">Recent Notes</h3>
              <button className="text-[10px] font-extrabold text-indigo-600 hover:underline">View All</button>
            </div>

            <div className="space-y-2.5">
              {[
                { text: 'Patient showing improvement in mobility with assistance.', date: 'May 22, 2024 • 09:45 AM' },
                { text: "Medication adjusted as per doctor's instructions.", date: 'May 21, 2024 • 04:30 PM' },
                { text: 'Diet plan updated. Patient tolerating soft diet well.', date: 'May 21, 2024 • 11:15 AM' }
              ].map((note, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100 mt-0.5">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-xs leading-snug">{note.text}</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">{note.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-2.5">
            <h3 className="font-extrabold text-slate-900 text-xs">Quick Actions</h3>

            <button className="w-full flex items-center justify-center gap-2 py-2 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl text-xs font-black transition-colors cursor-pointer">
              <Plus className="h-4 w-4" />
              Add Care Plan Note
            </button>

            <button className="w-full flex items-center justify-center gap-2 py-2 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl text-xs font-black transition-colors cursor-pointer">
              <RefreshCw className="h-4 w-4" />
              Update Care Plan
            </button>

            <button className="w-full flex items-center justify-center gap-2 py-2 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl text-xs font-black transition-colors cursor-pointer">
              <Plus className="h-4 w-4" />
              Care Plan Review
            </button>

            <button className="w-full flex items-center justify-center gap-2 py-2 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl text-xs font-black transition-colors cursor-pointer">
              <Printer className="h-4 w-4" />
              Print Care Plan
            </button>
          </div>

        </div>

      </div>

      {/* New Care Plan Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base">Create New Care Plan</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCarePlan} className="space-y-4 text-xs font-semibold">
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
                <label className="block text-slate-700 font-extrabold mb-1">Primary Condition</label>
                <select
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option>Heart Failure</option>
                  <option>COPD</option>
                  <option>Post Surgery</option>
                  <option>Mobility Impairment</option>
                  <option>Diabetes Type 2</option>
                  <option>Stroke Recovery</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Care Plan Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Heart Failure Management"
                  value={newPlanTitle}
                  onChange={(e) => setNewPlanTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Assigned Nurse</label>
                <input
                  type="text"
                  value={newNurse}
                  onChange={(e) => setNewNurse(e.target.value)}
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
                  Create Plan
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

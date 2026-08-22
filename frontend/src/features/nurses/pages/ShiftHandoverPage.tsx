import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  Sun,
  ArrowRight,
  MessageSquare,
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
  Save
} from 'lucide-react';

export const ShiftHandoverPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Handover Overview');
  const [notes, setNotes] = useState(
    "• Patricia's BP was high in the morning, medication adjusted.\n• Linda is experiencing mild pain, pain meds given.\n• James needs assistance while walking.\n• Room 502 patient (Robert Johnson) awaiting lab results.\n• All medications up to date."
  );
  const [autoSaveText, setAutoSaveText] = useState('10:24 AM');
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedTaskIds, setCompletedTaskIds] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await api.getShiftHandoverOverview();
      const overviewData = res?.data || res;
      setData(overviewData);
      if (overviewData?.handover?.handoverNotes) {
        setNotes(overviewData.handover.handoverNotes);
      }
    } catch (err) {
      console.error('Failed to fetch shift handover data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await api.saveHandoverNotes(notes);
      const now = new Date();
      setAutoSaveText(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompleteHandover = async () => {
    try {
      await api.completeShiftHandover();
      setIsCompleted(true);
    } catch (err) {
      console.error('Failed to complete handover:', err);
    }
  };

  const toggleTask = (taskId: string) => {
    setCompletedTaskIds((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const patientSummaries = data?.patientSummaries || [];
  const pendingTasksList = data?.pendingTasks || [];
  const recentAlertsList = data?.recentAlerts || [];

  const getPriorityBadge = (pri: string) => {
    if (pri === 'High') {
      return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-rose-50 text-rose-600 border border-rose-200">High</span>;
    }
    if (pri === 'Medium') {
      return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-amber-50 text-amber-600 border border-amber-200">Medium</span>;
    }
    return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-200">Low</span>;
  };

  const getConditionBadge = (status: string, subtitle: string) => {
    if (status === 'Improving') {
      return (
        <div>
          <span className="font-extrabold text-blue-600 text-xs">{status}</span>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{subtitle}</p>
        </div>
      );
    }
    if (status.includes('Post Op')) {
      return (
        <div>
          <span className="font-extrabold text-amber-600 text-xs">{status}</span>
          <p className="text-[10px] font-semibold text-amber-500 mt-0.5">{subtitle}</p>
        </div>
      );
    }
    return (
      <div>
        <span className="font-extrabold text-emerald-600 text-xs">{status}</span>
        <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{subtitle}</p>
      </div>
    );
  };

  const isDoctor = user?.role?.toLowerCase() === 'doctor';

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 space-y-5 p-6 max-w-[1700px] mx-auto select-none">
      
      {/* 1. Top Header Bar (Nurse View Only) */}
      {!isDoctor && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Shift HandOver</h1>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Ensure a smooth continuity of care by sharing key patient updates.
            </p>
          </div>

          {/* Shift Controls Right */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Current Shift */}
            <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
              <Sun className="h-4 w-4 text-amber-500 fill-amber-400" />
              <div className="flex flex-col text-[11px]">
                <span className="font-extrabold text-slate-900 flex items-center gap-1">
                  Day Shift <ChevronRight className="h-3 w-3 text-slate-400" />
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">07:00 AM - 03:00 PM</span>
              </div>
            </div>

            {/* Transfer Pill */}
            <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-700">
              <div className="h-5 w-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                <ArrowRight className="h-3 w-3" />
              </div>
              <div className="flex flex-col text-[11px]">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Handover To</span>
                <span className="font-extrabold text-indigo-900">Evening Shift (03:00 PM - 11:00 PM)</span>
              </div>
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
      )}

      {/* 2. Sub-Header Navigation Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6">
        {["Handover Overview", "My Handover History", "Received Handovers"].map((tab) => (
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

      {/* 3. Stat Summary Cards Row (4 Cards + Print Button) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
        
        {/* Patients Assigned */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-purple-100/70 text-purple-600 flex items-center justify-center font-bold shrink-0">
            <Users className="h-5 w-5 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 leading-none">24</p>
            <p className="text-[11px] font-bold text-slate-500 mt-1">Patients Assigned</p>
          </div>
        </div>

        {/* High Priority Patients */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-rose-100/70 text-rose-600 flex items-center justify-center font-bold shrink-0">
            <AlertTriangle className="h-5 w-5 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 leading-none">5</p>
            <p className="text-[11px] font-bold text-slate-500 mt-1">High Priority Patients</p>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-amber-100/70 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <ClipboardList className="h-5 w-5 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 leading-none">6</p>
            <p className="text-[11px] font-bold text-slate-500 mt-1">Pending Tasks</p>
          </div>
        </div>

        {/* New Alerts */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <Bell className="h-5 w-5 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 leading-none">4</p>
            <p className="text-[11px] font-bold text-slate-500 mt-1">New Alerts</p>
          </div>
        </div>

        {/* Print Handover Button */}
        <button className="flex items-center justify-center gap-2 p-4 bg-white hover:bg-slate-50 border border-indigo-200 rounded-2xl text-xs font-extrabold text-indigo-600 shadow-xs transition-all cursor-pointer">
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
          <span>Please review all details below and add any additional notes before completing handover.</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>Auto-save: {autoSaveText}</span>
          </div>

          <button
            onClick={handleCompleteHandover}
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
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <h3 className="font-extrabold text-slate-900 text-sm">1. Patient Handover Summary</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-700">
                  24 Patients
                </span>
              </div>
              <button className="text-xs font-extrabold text-indigo-600 hover:underline flex items-center gap-1">
                View All Patients <ArrowRight className="h-3.5 w-3.5" />
              </button>
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
                  {patientSummaries.map((p: any) => (
                    <tr key={p.id || p.patientIdCode} className="hover:bg-slate-50/70 transition-colors">
                      {/* Patient */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.patientAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'}
                            alt={p.patientName}
                            className="h-9 w-9 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <p className="font-extrabold text-slate-900 text-xs">{p.patientName}</p>
                            <p className="text-[10px] font-semibold text-slate-400">
                              {p.ageGender} • {p.patientIdCode}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Room / Unit */}
                      <td className="py-3.5 px-3">
                        <p className="font-extrabold text-slate-900">{p.roomNumber}</p>
                        <p className="text-[10px] font-semibold text-slate-400">{p.careUnit}</p>
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
                        <p className="font-semibold text-slate-700 text-[11px]">{p.specialInstructions}</p>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-3 text-center">
                        {getPriorityBadge(p.priority)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="pt-2 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Showing 1 to 5 of 24 patients</span>
              
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="h-7 w-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {[1, 2, 3, 5].map((pg) => (
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
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="h-7 w-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom 3 Sub-Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Card 2: Pending Tasks (6) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4.5 shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs border-b border-slate-100 pb-2">
                  2. Pending Tasks <span className="text-indigo-600">6</span>
                </h4>

                <div className="space-y-2.5 pt-2 text-xs font-semibold">
                  {pendingTasksList.map((t: any) => (
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
                      <span className="text-[10px] font-black text-rose-500 shrink-0">{t.dueTime}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button className="pt-2 border-t border-slate-100 text-[11px] font-extrabold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer">
                + View all tasks <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {/* Card 3: New Alerts & Events (4) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4.5 shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs border-b border-slate-100 pb-2">
                  3. New Alerts & Events <span className="text-indigo-600">4</span>
                </h4>

                <div className="space-y-2.5 pt-2 text-xs font-semibold">
                  {recentAlertsList.map((a: any) => (
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
                      <span className="text-[10px] font-semibold text-slate-400 shrink-0">{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button className="pt-2 border-t border-slate-100 text-[11px] font-extrabold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer">
                View all alerts <ArrowRight className="h-3 w-3" />
              </button>
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
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter additional shift notes..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed resize-none"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                    <span>{notes.length}/500 characters</span>
                    <button
                      onClick={handleSaveDraft}
                      className="text-indigo-600 hover:underline font-extrabold"
                    >
                      {isSaving ? 'Saving...' : 'Save Draft'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50/60 p-2 rounded-xl border border-indigo-100 flex items-center gap-2 text-[10px] font-semibold text-indigo-900">
                <Info className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                <span>Add any additional notes or important updates for the next shift nurse.</span>
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
                    strokeDasharray="75, 100"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-black text-indigo-900">75%</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-black text-slate-900">18 / 24</p>
                <p className="text-xs font-bold text-slate-500">Sections Completed</p>
                <p className="text-[11px] font-semibold text-indigo-600 mt-1">6 Pending Sections</p>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-2.5 text-xs font-extrabold border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between text-slate-900">
                <span>Patient Handover Summary</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-100" />
              </div>
              <div className="flex items-center justify-between text-slate-900">
                <span>Pending Tasks</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-100" />
              </div>
              <div className="flex items-center justify-between text-slate-900">
                <span>New Alerts & Events</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-100" />
              </div>
              <div className="flex items-center justify-between text-slate-900">
                <span>Notes for Next Shift</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-100" />
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Outstanding Medications</span>
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Equipment & Supplies</span>
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Other Updates</span>
                <Circle className="h-4 w-4 text-slate-300" />
              </div>
            </div>

            {/* Outgoing Nurse Details */}
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase">Outgoing Nurse Details</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80"
                    alt="Emma Johnson"
                    className="h-10 w-10 rounded-full object-cover border border-indigo-200 shrink-0"
                  />
                  <div>
                    <p className="font-extrabold text-slate-900 text-xs">Emma Johnson</p>
                    <p className="text-[10px] font-semibold text-slate-400">Staff Nurse</p>
                    <p className="text-[10px] font-semibold text-slate-400">Day Shift (07:00 AM - 03:00 PM)</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-1">
                <span>May 22, 2024</span>
                <span className="font-extrabold text-slate-900 flex items-center gap-1">
                  02:45 PM <ArrowRight className="h-3.5 w-3.5 text-indigo-600" />
                </span>
              </div>
            </div>

            {/* Handover To */}
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase">Handover To</p>

              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                  alt="Sophia Williams"
                  className="h-10 w-10 rounded-full object-cover border border-indigo-200 shrink-0"
                />
                <div>
                  <p className="font-extrabold text-slate-900 text-xs">Sophia Williams</p>
                  <p className="text-[10px] font-semibold text-slate-400">Staff Nurse</p>
                  <p className="text-[10px] font-semibold text-slate-400">Evening Shift (03:00 PM - 11:00 PM)</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase">Quick Actions</p>

              <button
                onClick={handleSaveDraft}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-indigo-200 rounded-xl text-xs font-extrabold text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
              >
                <Save className="h-4 w-4" />
                Save as Draft
              </button>

              <button
                onClick={() => setNotes('')}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-rose-200 rounded-xl text-xs font-extrabold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                Discard Handover
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default ShiftHandoverPage;

import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  FileText,
  Hourglass,
  CheckCircle2,
  Calendar,
  Search,
  Plus,
  Eye,
  Edit2,
  MoreVertical,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Pagination } from '@/components/common/Pagination';
import { api } from '@/lib/api';
import { TaskCreateModal } from '../components/TaskCreateModal';

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalTasks: 156,
    open: 62,
    inProgress: 34,
    completed: 54,
    overdue: 6,
  });
  const [activeTab, setActiveTab] = useState('All Tasks');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [assigneeFilter, setAssigneeFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const loadTasks = () => {
    api.getTasks()
      .then((data) => setTasks(data || []))
      .catch(console.error);

    api.getTaskStats()
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const filteredTasks = tasks.filter((t) => {
    let matchesTab = true;
    if (activeTab === 'My Tasks') matchesTab = (t.assignedCaregiver || '').includes('Sarah');
    else if (activeTab === 'Assigned to Others') matchesTab = !(t.assignedCaregiver || '').includes('Sarah');
    else if (activeTab === 'Overdue') matchesTab = t.isOverdue || (t.dueTime || '').includes('Overdue');
    else if (activeTab === 'Completed') matchesTab = t.status === 2 || t.statusStr === 'Completed';

    const matchesSearch = (t.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.assignedCaregiver || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || (t.statusStr || '').toLowerCase() === statusFilter.toLowerCase();
    const matchesPriority = priorityFilter === 'All' || (t.priority || '').toString().toLowerCase() === priorityFilter.toLowerCase();
    const matchesType = typeFilter === 'All' || (t.taskType || '').toLowerCase() === typeFilter.toLowerCase();
    const matchesAssignee = assigneeFilter === 'All' || (t.assignedCaregiver || '').toLowerCase().includes(assigneeFilter.toLowerCase());

    return matchesTab && matchesSearch && matchesStatus && matchesPriority && matchesType && matchesAssignee;
  });

  const getTaskTypeBadge = (typeStr: string) => {
    switch (typeStr?.toLowerCase()) {
      case 'documentation':
        return <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-100 text-blue-700">Documentation</span>;
      case 'medication':
        return <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-700">Medication</span>;
      case 'clinical care': case 'clinicalcare':
        return <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-purple-100 text-purple-700">Clinical Care</span>;
      case 'care activity': case 'careactivity':
        return <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-cyan-100 text-cyan-700">Care Activity</span>;
      case 'care coordination': case 'carecoordination':
        return <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-orange-100 text-orange-700">Care Coordination</span>;
      case 'follow-up': case 'followup':
        return <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-100 text-amber-700">Follow-up</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-100 text-blue-700">Care Planning</span>;
    }
  };

  const getPriorityBadge = (pri: any) => {
    const pStr = pri?.toString().toLowerCase();
    if (pStr === 'high' || pStr === '0') return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">High</span>;
    if (pStr === 'medium' || pStr === '1') return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700">Medium</span>;
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">Low</span>;
  };

  const getStatusBadge = (statusStr: string) => {
    if (statusStr === 'Completed') return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800">Completed</span>;
    if (statusStr === 'In Progress' || statusStr === 'InProgress') return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-800">In Progress</span>;
    return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 text-red-800">Open</span>;
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Task Management"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Tasks' },
        ]}
        actions={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-colors"
          >
            <Plus className="h-4 w-4" /> Create Task
          </button>
        }
      />

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { title: 'Total Tasks', value: (stats.totalTasks || tasks.length || 156).toString(), subtext: 'All assigned tasks', icon: CheckSquare, bg: 'bg-purple-100 text-purple-600' },
          { title: 'Open', value: (stats.open || 62).toString(), subtext: '39.7% of total', icon: FileText, bg: 'bg-blue-100 text-blue-600' },
          { title: 'In Progress', value: (stats.inProgress || 34).toString(), subtext: '21.8% of total', icon: Hourglass, bg: 'bg-amber-100 text-amber-600' },
          { title: 'Completed', value: (stats.completed || 54).toString(), subtext: '34.6% of total', icon: CheckCircle2, bg: 'bg-emerald-100 text-emerald-600' },
          { title: 'Overdue', value: (stats.overdue || 6).toString(), subtext: 'Requires attention', icon: Calendar, bg: 'bg-red-100 text-red-600' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 card-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className={`h-9 w-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className="h-4 w-4 stroke-[2]" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-[11px] font-medium text-slate-500">{stat.title}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{stat.value}</h3>
            </div>
            <p className="mt-2 text-[11px] font-medium text-slate-400">
              {stat.subtext}
            </p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex flex-col text-[10px] text-slate-400">
              <span>Status</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
              >
                <option value="All">All Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="flex flex-col text-[10px] text-slate-400">
              <span>Priority</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
              >
                <option value="All">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="flex flex-col text-[10px] text-slate-400">
              <span>Task Type</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
              >
                <option value="All">All Types</option>
                <option value="Documentation">Documentation</option>
                <option value="Medication">Medication</option>
                <option value="Clinical Care">Clinical Care</option>
                <option value="Care Activity">Care Activity</option>
                <option value="Care Coordination">Care Coordination</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Care Planning">Care Planning</option>
              </select>
            </div>

            <div className="flex flex-col text-[10px] text-slate-400">
              <span>Assignee</span>
              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
              >
                <option value="All">All Assignees</option>
                <option value="Nurse Sarah">Nurse Sarah</option>
                <option value="Nurse Priya">Nurse Priya</option>
                <option value="Nurse James">Nurse James</option>
                <option value="Dr. Michael">Dr. Michael</option>
              </select>
            </div>

            <div className="flex flex-col text-[10px] text-slate-400">
              <span>Due Date</span>
              <input
                type="text"
                readOnly
                value="May 13 - May 19, 2025"
                className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2 pt-3">
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-600">
                <SlidersHorizontal className="h-3.5 w-3.5" /> More Filters
              </button>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('All');
                  setPriorityFilter('All');
                  setTypeFilter('All');
                  setAssigneeFilter('All');
                }}
                className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-600"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Clear
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          {[
            { label: 'All Tasks', count: 156 },
            { label: 'My Tasks', count: 18 },
            { label: 'Assigned to Others', count: 138 },
            { label: 'Overdue', count: 6 },
            { label: 'Completed', count: 54 },
          ].map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === tab.label
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === tab.label ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-3 w-8">
                  <input type="checkbox" className="rounded border-slate-300" />
                </th>
                <th className="p-3">Task Title</th>
                <th className="p-3">Patient</th>
                <th className="p-3">Task Type</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Assignee</th>
                <th className="p-3">Due Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map((t) => {
                const isOverdue = t.isOverdue || (t.dueTime || '').includes('Overdue');

                return (
                  <tr key={t.id || t.taskIdCode} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <input type="checkbox" className="rounded border-slate-300" />
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="font-bold text-slate-900">{t.title}</p>
                        <p className="text-[10px] text-slate-400">{t.description}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      {t.patientName ? (
                        <div className="flex items-center gap-2.5">
                          <img src={t.patientAvatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"} alt={t.patientName} className="h-7 w-7 rounded-full object-cover shrink-0" />
                          <div>
                            <p className="font-bold text-slate-900">{t.patientName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{t.patientIdCode || 'PID-10023'}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-semibold">--</span>
                      )}
                    </td>
                    <td className="p-3">
                      {getTaskTypeBadge(t.taskType)}
                    </td>
                    <td className="p-3">
                      {getPriorityBadge(t.priority)}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <img src={t.assigneeAvatar || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80"} alt={t.assignedCaregiver} className="h-7 w-7 rounded-full object-cover shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900">{t.assignedCaregiver}</p>
                          <p className="text-[10px] text-slate-400">{t.assigneeRole || 'Nursing'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <p className={`font-semibold text-xs ${isOverdue ? 'text-rose-600' : 'text-slate-800'}`}>
                        {t.dueTime || 'May 19, 2025 10:00 AM'}
                      </p>
                      {isOverdue && (
                        <span className="text-[10px] font-bold text-rose-600">Overdue</span>
                      )}
                    </td>
                    <td className="p-3">
                      {getStatusBadge(t.statusStr || (t.status === 2 ? 'Completed' : t.status === 1 ? 'In Progress' : 'Open'))}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Task">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
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
      </div>

      {/* Pagination Footer */}
      <Pagination
        currentPage={currentPage}
        totalPages={16}
        totalResults={156}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        itemLabel="tasks"
      />

      <TaskCreateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadTasks}
      />
    </div>
  );
};

export default TasksPage;

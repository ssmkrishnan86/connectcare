import React, { useState } from 'react';
import {
  Users,
  CheckSquare,
  Pill,
  AlertTriangle,
  Stethoscope,
  Sun
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const NurseAppPage: React.FC = () => {
  const [checkedTasks, setCheckedTasks] = useState<Record<number, boolean>>({
    3: true,
    4: true,
  });

  const toggleTask = (id: number) => {
    setCheckedTasks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const careTypeData = [
    { name: 'Medical', value: 10, color: '#6366F1' },
    { name: 'Surgical', value: 7, color: '#10B981' },
    { name: 'ICU', value: 4, color: '#3B82F6' },
    { name: 'Maternity', value: 3, color: '#F59E0B' },
  ];

  const priorityData = [
    { name: 'Critical', value: 4, color: '#EF4444' },
    { name: 'High', value: 6, color: '#F59E0B' },
    { name: 'Medium', value: 9, color: '#10B981' },
    { name: 'Low', value: 5, color: '#3B82F6' },
  ];

  const vitalsTrendData = [
    { time: '03 AM', temp: 98.6, pulse: 72, spo2: 98 },
    { time: '06 AM', temp: 98.8, pulse: 78, spo2: 97 },
    { time: '09 AM', temp: 99.1, pulse: 82, spo2: 96 },
    { time: '12 PM', temp: 98.6, pulse: 75, spo2: 99 },
    { time: '03 PM', temp: 98.4, pulse: 74, spo2: 98 },
  ];

  return (
    <div className="space-y-6 pb-12 font-sans antialiased text-slate-800">
      
      {/* Top Banner Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Good Morning, Emma <span className="animate-bounce">👋</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            You have <span className="text-indigo-600 font-bold">8 tasks</span> and <span className="text-rose-600 font-bold">6 alerts</span> today.
          </p>
        </div>

        {/* Shift Badge */}
        <div className="flex items-center gap-3 bg-white p-2.5 px-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Sun className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Day Shift</p>
            <p className="text-[10px] font-semibold text-slate-500">07:00 AM - 03:00 PM</p>
          </div>
        </div>
      </div>

      {/* Top 5 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: My Patients */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">My Patients</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">24</div>
          <div className="text-[10px] font-bold text-slate-400">12 Inpatients • 12 Outpatients</div>
        </div>

        {/* Card 2: Tasks */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">8</div>
          <div className="text-[10px] font-bold text-emerald-600"><span className="text-slate-700">5 Pending</span> • 3 Completed</div>
        </div>

        {/* Card 3: Medications Due */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Medications Due</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Pill className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">6</div>
          <div className="text-[10px] font-bold text-rose-600"><span className="text-rose-600 font-bold">2 Overdue</span> • 4 Upcoming</div>
        </div>

        {/* Card 4: Alerts */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Alerts</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">6</div>
          <div className="text-[10px] font-bold text-rose-600">3 Critical • 3 High</div>
        </div>

        {/* Card 5: My Rounds */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">My Rounds</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Stethoscope className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">3/6</div>
          <div className="text-[10px] font-bold text-slate-400">Rounds Completed</div>
        </div>

      </div>

      {/* Row 2 Section: Today's Overview, Patients by Priority, Vital Signs Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Overview & Patients by Care Type */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Today's Overview</h2>
            <button className="text-xs font-semibold text-indigo-600">View All Patients →</button>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div>
              <p className="text-base font-extrabold text-slate-900">12</p>
              <p className="text-[9px] font-bold text-slate-400">Total Patients</p>
            </div>
            <div>
              <p className="text-base font-extrabold text-emerald-600">4</p>
              <p className="text-[9px] font-bold text-slate-400">Admissions</p>
            </div>
            <div>
              <p className="text-base font-extrabold text-blue-600">1</p>
              <p className="text-[9px] font-bold text-slate-400">Discharges</p>
            </div>
            <div>
              <p className="text-base font-extrabold text-amber-600">2</p>
              <p className="text-[9px] font-bold text-slate-400">Transfers</p>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-xs font-bold text-slate-900 mb-2">Patients by Care Type</p>
            <div className="flex items-center gap-4">
              <div className="w-28 h-28 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={careTypeData} innerRadius={28} outerRadius={42} paddingAngle={4} dataKey="value">
                      {careTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs font-extrabold text-slate-900">24</span>
                  <span className="text-[8px] font-bold text-slate-400">Total</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs font-semibold flex-1">
                {careTypeData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                      {item.name}
                    </span>
                    <span className="font-bold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Patients by Priority */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Patients by Priority</h2>
            <button className="text-xs font-semibold text-indigo-600">View Patients →</button>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <div className="w-32 h-32 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={priorityData} innerRadius={35} outerRadius={52} paddingAngle={4} dataKey="value">
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-extrabold text-slate-900">24</span>
                <span className="text-[9px] font-bold text-slate-400">Total</span>
              </div>
            </div>

            <div className="space-y-2 text-xs font-semibold flex-1">
              {priorityData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    {item.name}
                  </span>
                  <span className="font-bold text-slate-900">{item.value} ({Math.round((item.value/24)*100)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vital Signs Trend */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Vital Signs Trend <span className="text-xs font-normal text-slate-400">(Last 12 Hours)</span></h2>
            <button className="text-xs font-semibold text-indigo-600">View All Vitals →</button>
          </div>

          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-600"></span> Temp (°F)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Pulse (bpm)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> SpO2 (%)</span>
          </div>

          <div className="h-44 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vitalsTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} domain={[60, 105]} />
                <Tooltip />
                <Line type="monotone" dataKey="temp" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="pulse" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="spo2" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row 3 Section: Upcoming Medication, My Tasks, Alerts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Upcoming Medication */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Upcoming Medication <span className="text-xs font-normal text-slate-400">(Next 3 Hours)</span></h2>
            <button className="text-xs font-semibold text-indigo-600">View All →</button>
          </div>

          <div className="space-y-3">
            {[
              { time: '09:00 AM', med: 'Metoprolol 50 mg', pat: 'Patricia Smith • Room 102', due: 'Due in 20 min', color: 'bg-rose-50 text-rose-700 border-rose-200' },
              { time: '10:00 AM', med: 'Furosemide 20 mg', pat: 'Michael Davis • Room 201', due: 'Due in 1 hr', color: 'bg-amber-50 text-amber-700 border-amber-200' },
              { time: '11:00 AM', med: 'Paracetamol 650 mg', pat: 'Linda Martinez • Room 305', due: 'Due in 2 hr', color: 'bg-blue-50 text-blue-700 border-blue-200' },
            ].map((m, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{m.time}</span>
                  <p className="text-xs font-bold text-slate-900 mt-1">{m.med}</p>
                  <p className="text-[10px] text-slate-500">{m.pat}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${m.color}`}>
                  {m.due}
                </span>
              </div>
            ))}
          </div>

          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs font-bold text-rose-700">
            <span>2 medications overdue</span>
            <button className="hover:underline text-[11px]">View Overdue →</button>
          </div>
        </div>

        {/* My Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">My Tasks</h2>
            <button className="text-xs font-semibold text-indigo-600">View All →</button>
          </div>

          <div className="space-y-2.5">
            {[
              { id: 1, text: 'Vital Signs - Room 102', pat: 'Patricia Smith', due: 'Due Today 08:00 AM', dueCol: 'text-rose-600' },
              { id: 2, text: 'Wound Care - Room 201', pat: 'Michael Davis', due: 'Due Today 09:30 AM', dueCol: 'text-amber-600' },
              { id: 3, text: 'IV Site Assessment - Room 305', pat: 'Linda Martinez', due: 'Due Today 10:00 AM', dueCol: 'text-amber-600' },
              { id: 4, text: 'Medication Round', pat: 'Completed', due: '07:30 AM', dueCol: 'text-emerald-600' },
              { id: 5, text: 'Care Plan Update - Room 105', pat: 'Completed', due: '07:15 AM', dueCol: 'text-emerald-600' },
            ].map((task) => (
              <div key={task.id} className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={!!checkedTasks[task.id]}
                  onChange={() => toggleTask(task.id)}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <div className="flex-1 text-xs">
                  <p className={`font-bold ${checkedTasks[task.id] ? 'line-through text-slate-400' : 'text-slate-900'}`}>{task.text}</p>
                  <p className="text-[10px] text-slate-500">{task.pat}</p>
                </div>
                <span className={`text-[10px] font-bold ${task.dueCol}`}>{task.due}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts (Latest) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Alerts (Latest)</h2>
            <button className="text-xs font-semibold text-indigo-600">View All →</button>
          </div>

          <div className="space-y-3">
            {[
              { type: 'Critical', text: 'BP 180/110 mmHg', pat: 'Patricia Smith • Room 102', time: '08:05 AM', color: 'bg-rose-50 border-rose-200 text-rose-700' },
              { type: 'High', text: 'SpO2 below 90%', pat: 'Michael Davis • Room 201', time: '07:58 AM', color: 'bg-amber-50 border-amber-200 text-amber-700' },
              { type: 'High', text: 'Pain Score 8/10', pat: 'James Brown • Room 302', time: '07:45 AM', color: 'bg-amber-50 border-amber-200 text-amber-700' },
              { type: 'Medium', text: 'Low Urine Output', pat: 'Linda Martinez • Room 305', time: '07:30 AM', color: 'bg-blue-50 border-blue-200 text-blue-700' },
            ].map((a, idx) => (
              <div key={idx} className={`p-3 rounded-xl border flex items-start gap-2.5 ${a.color}`}>
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase">{a.type}</span>
                    <span className="text-[10px] opacity-75">{a.time}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">{a.text}</p>
                  <p className="text-[10px] text-slate-600">{a.pat}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Shift Summary Cards */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 mb-3">Shift Summary</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <p className="text-[11px] font-semibold text-slate-500">Patients Handover</p>
            <p className="text-2xl font-extrabold text-slate-900">18</p>
            <button className="text-[10px] font-bold text-indigo-600 hover:underline">View Details →</button>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <p className="text-[11px] font-semibold text-slate-500">Rounds Completed</p>
            <p className="text-2xl font-extrabold text-slate-900">3/6</p>
            <button className="text-[10px] font-bold text-indigo-600 hover:underline">View Details →</button>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <p className="text-[11px] font-semibold text-slate-500">Medications Given</p>
            <p className="text-2xl font-extrabold text-slate-900">15</p>
            <button className="text-[10px] font-bold text-indigo-600 hover:underline">View Details →</button>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <p className="text-[11px] font-semibold text-slate-500">Documents Added</p>
            <p className="text-2xl font-extrabold text-slate-900">9</p>
            <button className="text-[10px] font-bold text-indigo-600 hover:underline">View Details →</button>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <p className="text-[11px] font-semibold text-slate-500">Incidents Reported</p>
            <p className="text-2xl font-extrabold text-slate-900">1</p>
            <button className="text-[10px] font-bold text-indigo-600 hover:underline">View Details →</button>
          </div>

        </div>
      </div>

    </div>
  );
};

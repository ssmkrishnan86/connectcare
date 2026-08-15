import React, { useState } from 'react';
import {
  Calendar,
  Users,
  AlertCircle,
  ClipboardCheck,
  ArrowUpRight,
  ArrowDownRight,
  Send,
  Search
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const DoctorPortalPage: React.FC = () => {
  const [aiQuery, setAiQuery] = useState('');
  const [activeTrendTab, setActiveTrendTab] = useState('Overview');

  const vitalsTrendData = [
    { day: 'May 15', systolic: 120, diastolic: 76 },
    { day: 'May 16', systolic: 125, diastolic: 80 },
    { day: 'May 17', systolic: 118, diastolic: 74 },
    { day: 'May 18', systolic: 122, diastolic: 78 },
    { day: 'May 19', systolic: 128, diastolic: 82 },
    { day: 'May 20', systolic: 124, diastolic: 79 },
    { day: 'May 21', systolic: 126, diastolic: 81 },
  ];

  return (
    <div className="space-y-6 pb-12 font-sans antialiased text-slate-800">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Good Morning, Dr. Sarah Wilson <span className="animate-bounce">👋</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Tuesday, May 21, 2024
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search patients, appointments..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-2xs"
          />
        </div>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Today's Appointments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Today's Appointments</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">12</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>2 from yesterday</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Patients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Patients</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">128</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>5 new this week</span>
            </div>
          </div>
        </div>

        {/* Card 3: Critical Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Critical Alerts</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">3</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600 mt-1">
              <span>Requires attention</span>
            </div>
          </div>
        </div>

        {/* Card 4: Pending Reviews */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Reviews</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ClipboardCheck className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">18</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1">
              <ArrowDownRight className="h-3.5 w-3.5 text-emerald-600" />
              <span>2 from yesterday</span>
            </div>
          </div>
        </div>

      </div>

      {/* Middle Section: Schedule, Critical Patients, Patient Health Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Schedule */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Today's Schedule</h2>
            <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">View Full Schedule</button>
          </div>

          <div className="space-y-3">
            {[
              { time: '09:00 AM', name: 'Robert Johnson', type: 'Follow-up Consultation', status: 'Confirmed', color: 'bg-blue-50 text-blue-700' },
              { time: '10:30 AM', name: 'Mary Williams', type: 'Routine Check-up', status: 'Confirmed', color: 'bg-blue-50 text-blue-700' },
              { time: '11:30 AM', name: 'Michael Brown', type: 'Blood Pressure Check', status: 'Pending', color: 'bg-amber-50 text-amber-700' },
              { time: '02:00 PM', name: 'Jennifer Davis', type: 'Follow-up Consultation', status: 'Confirmed', color: 'bg-blue-50 text-blue-700' },
              { time: '03:30 PM', name: 'Lisa Martinez', type: 'ECG Review', status: 'Confirmed', color: 'bg-blue-50 text-blue-700' },
            ].map((slot, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 w-16">{slot.time}</span>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{slot.name}</p>
                    <p className="text-[10px] text-slate-500">{slot.type}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${slot.color}`}>
                  {slot.status}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 text-center">
            <button className="text-xs font-bold text-indigo-600 hover:underline">View All Schedule</button>
          </div>
        </div>

        {/* Critical Patients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Critical Patients</h2>
            <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">View All (3)</button>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Robert Johnson', condition: 'Heart Failure', severity: 'High', color: 'bg-rose-500 text-white' },
              { name: 'Michael Brown', condition: 'Hypertension', severity: 'High', color: 'bg-rose-500 text-white' },
              { name: 'Jennifer Davis', condition: 'Diabetes Type 2', severity: 'Medium', color: 'bg-amber-500 text-white' },
            ].map((pat, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                    {pat.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{pat.name}</p>
                    <p className="text-[10px] text-slate-500">{pat.condition}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${pat.color}`}>
                  {pat.severity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Patient Health Overview */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Patient Health Overview</h2>
            <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">View Full Report</button>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-slate-500">Blood Pressure</p>
                <p className="text-sm font-extrabold text-slate-900">120/80 <span className="text-xs font-normal text-slate-500">mmHg</span></p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md">Normal</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-slate-500">Heart Rate</p>
                <p className="text-sm font-extrabold text-slate-900">110 <span className="text-xs font-normal text-slate-500">bpm</span></p>
              </div>
              <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold rounded-md">High</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-slate-500">Weight</p>
                <p className="text-sm font-extrabold text-slate-900">72 <span className="text-xs font-normal text-slate-500">kg</span></p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md">Normal</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 font-medium">Updated 10 min ago</p>
        </div>

      </div>

      {/* Vitals Trends & My Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Vitals Trends Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Vitals Trends</h2>
            <span className="text-xs text-slate-400 font-medium">Last 7 Days</span>
          </div>

          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            {['Overview', 'Blood Pressure', 'Heart Rate', 'SpO2', 'Weight'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTrendTab(tab)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                  activeTrendTab === tab
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="h-44 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vitalsTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} domain={[60, 140]} />
                <Tooltip />
                <Line type="monotone" dataKey="systolic" stroke="#4F46E5" strokeWidth={2.5} dot={{ r: 3 }} name="Systolic" />
                <Line type="monotone" dataKey="diastolic" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3 }} name="Diastolic" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
            <div>
              <p className="text-[10px] font-semibold text-slate-400">Avg. Systolic</p>
              <p className="text-xs font-extrabold text-slate-800">124 mmHg</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400">Avg. Diastolic</p>
              <p className="text-xs font-extrabold text-slate-800">78 mmHg</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400">Avg. Heart Rate</p>
              <p className="text-xs font-extrabold text-slate-800">76 bpm</p>
            </div>
          </div>
        </div>

        {/* My Patients Table (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">My Patients</h2>
            <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">View All Patients</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="pb-2">Patient Name</th>
                  <th className="pb-2">Age</th>
                  <th className="pb-2">Last Visit</th>
                  <th className="pb-2">Next Appt</th>
                  <th className="pb-2">Condition</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: 'Robert Johnson', age: 68, last: 'May 18, 2024', next: 'May 25, 2024', cond: 'Heart Failure', status: 'Stable', color: 'bg-emerald-50 text-emerald-700' },
                  { name: 'Mary Williams', age: 55, last: 'May 19, 2024', next: 'May 22, 2024', cond: 'Hypertension', status: 'Stable', color: 'bg-emerald-50 text-emerald-700' },
                  { name: 'Michael Brown', age: 62, last: 'May 17, 2024', next: 'May 24, 2024', cond: 'Diabetes Type 2', status: 'Monitor', color: 'bg-amber-50 text-amber-700' },
                  { name: 'Jennifer Davis', age: 45, last: 'May 16, 2024', next: 'May 21, 2024', cond: 'Asthma', status: 'Stable', color: 'bg-emerald-50 text-emerald-700' },
                  { name: 'William Taylor', age: 70, last: 'May 15, 2024', next: 'May 28, 2024', cond: 'COPD', status: 'Stable', color: 'bg-emerald-50 text-emerald-700' },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 font-bold text-slate-900">{row.name}</td>
                    <td className="py-2.5 text-slate-500 font-medium">{row.age}</td>
                    <td className="py-2.5 text-slate-500">{row.last}</td>
                    <td className="py-2.5 text-slate-500 font-medium">{row.next}</td>
                    <td className="py-2.5 font-semibold text-slate-700">{row.cond}</td>
                    <td className="py-2.5 text-right">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${row.color}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Bottom 4 Grid Columns: Tasks, Alerts, Recent Consultations, AI Assistant */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Tasks</h2>
            <button className="text-xs font-semibold text-indigo-600">View All Tasks</button>
          </div>
          <div className="space-y-3">
            {[
              { title: 'Review lab results - Robert Johnson', prio: 'High Priority', prioCol: 'text-rose-600', due: 'Due in 2 hours' },
              { title: 'Approve care plan - Mary Williams', prio: 'Medium Priority', prioCol: 'text-amber-600', due: 'Due in 4 hours' },
              { title: 'Review ECG report - Michael Brown', prio: 'Medium Priority', prioCol: 'text-amber-600', due: 'Due in 6 hours' },
              { title: 'Complete consultation notes', prio: 'Low Priority', prioCol: 'text-slate-400', due: 'Due tomorrow' },
            ].map((t, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <p className="text-xs font-bold text-slate-900">{t.title}</p>
                <div className="flex items-center justify-between text-[10px]">
                  <span className={`font-bold ${t.prioCol}`}>{t.prio}</span>
                  <span className="text-slate-400">{t.due}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Alerts</h2>
            <button className="text-xs font-semibold text-indigo-600">View All Alerts</button>
          </div>
          <div className="space-y-3">
            {[
              { msg: 'High blood pressure alert - Michael Brown', time: '2 min ago' },
              { msg: 'Medication interaction detected - Jennifer Davis', time: '15 min ago' },
              { msg: 'Appointment reminder - Robert Johnson', time: '1 hour ago' },
            ].map((a, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-rose-50/50 border border-rose-100 flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-900">{a.msg}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Consultations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Recent Consultations</h2>
            <button className="text-xs font-semibold text-indigo-600">View All</button>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Patricia Smith', date: 'May 21, 2024 09:30 AM', note: 'Follow-up consultation completed' },
              { name: 'James Wilson', date: 'May 21, 2024 08:45 AM', note: 'Routine check-up completed' },
              { name: 'Maria Garcia', date: 'May 20, 2024 04:30 PM', note: 'ECG review and analysis' },
            ].map((c, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">{c.name}</p>
                  <p className="text-[10px] text-slate-400">{c.date}</p>
                  <p className="text-[10px] text-slate-500">{c.note}</p>
                </div>
                <button className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-indigo-600 hover:bg-indigo-50">
                  View Notes
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* AI Assistant */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-indigo-600 font-bold text-sm">✨</span>
                <h2 className="text-sm font-bold text-slate-900">AI Assistant</h2>
              </div>
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-extrabold rounded-md uppercase">Beta</span>
            </div>

            <p className="text-xs font-semibold text-slate-600 mt-3">How can I help you today?</p>

            <div className="grid grid-cols-2 gap-1.5 mt-3">
              {[
                'Analyze Patient Data',
                'Suggest Care Plan',
                'Drug Interaction Check',
                'Health Risk Assessment'
              ].map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => setAiQuery(pill)}
                  className="p-2 bg-slate-50 border border-slate-200/70 rounded-xl text-[10px] font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-left transition-all"
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>

          <div className="relative mt-3">
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="Ask me anything..."
              className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors">
              <Send className="h-3 w-3" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

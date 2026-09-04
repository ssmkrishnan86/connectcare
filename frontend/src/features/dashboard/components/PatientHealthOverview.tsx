import React from 'react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { useNavigate } from 'react-router-dom';

const bpData = [{ v: 118 }, { v: 122 }, { v: 120 }, { v: 125 }, { v: 119 }, { v: 121 }, { v: 120 }];
const sugarData = [{ v: 105 }, { v: 115 }, { v: 108 }, { v: 112 }, { v: 109 }, { v: 114 }, { v: 110 }];
const hrData = [{ v: 70 }, { v: 74 }, { v: 71 }, { v: 75 }, { v: 73 }, { v: 72 }, { v: 72 }];

export const PatientHealthOverview: React.FC = () => {
  const navigate = useNavigate();
  const hasData = bpData.length > 0;

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-slate-900">Patient Health Overview</h2>
        <select className="px-2 py-0.5 text-xs border border-slate-200 rounded-md bg-slate-50 text-slate-700">
          <option>Daily</option>
          <option>Weekly</option>
        </select>
      </div>

      <div className="space-y-4 my-2">
        {/* Blood Pressure */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Latest Blood Pressure</p>
            <p className="text-sm font-bold text-slate-900">
              120/80 <span className="text-[10px] text-slate-400 font-normal">mmHg</span>
            </p>
          </div>
          <div className="h-9 w-28">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bpData}>
                <Line type="monotone" dataKey="v" stroke="#2563eb" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Blood Sugar */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Latest Blood Sugar</p>
            <p className="text-sm font-bold text-slate-900">
              110 <span className="text-[10px] text-slate-400 font-normal">mg/dL</span>
            </p>
          </div>
          <div className="h-9 w-28">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sugarData}>
                <Line type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Heart Rate */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Latest Heart Rate</p>
            <p className="text-sm font-bold text-slate-900">
              72 <span className="text-[10px] text-slate-400 font-normal">bpm</span>
            </p>
          </div>
          <div className="h-9 w-28">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hrData}>
                <Line type="monotone" dataKey="v" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 text-center">
        <button
          disabled={!hasData}
          onClick={() => hasData && navigate('/reports')}
          className={`text-xs transition-colors ${
            hasData
              ? 'font-semibold text-blue-600 hover:text-blue-700 cursor-pointer'
              : 'font-semibold text-slate-300 cursor-not-allowed pointer-events-none'
          }`}
        >
          View Analytics
        </button>
      </div>
    </div>
  );
};

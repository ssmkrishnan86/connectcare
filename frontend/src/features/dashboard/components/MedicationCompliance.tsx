import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

const data = [
  { name: 'On Time', value: 92, color: '#10b981' },
  { name: 'Missed', value: 5, color: '#ef4444' },
  { name: 'Late', value: 3, color: '#f97316' },
];

export const MedicationCompliance: React.FC = () => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow flex flex-col justify-between">
      <h2 className="text-sm font-bold text-slate-900 mb-2">Medication Compliance</h2>

      <div className="flex items-center justify-between my-2">
        <div className="relative h-36 w-36 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={44}
                outerRadius={62}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-slate-900">92%</span>
            <span className="text-[10px] text-slate-500 font-medium">Overall</span>
          </div>
        </div>

        <div className="space-y-2 text-xs font-medium pl-3 flex-1">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                {item.name}
              </span>
              <span className="font-semibold text-slate-900">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 text-center">
        <Link to="/medications" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
          View Report
        </Link>
      </div>
    </div>
  );
};

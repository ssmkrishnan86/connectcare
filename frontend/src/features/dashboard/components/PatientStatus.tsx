import React, { useEffect, useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api';

export const PatientStatus: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    api.getPatientStatus().then(setStatus).catch(console.error);
  }, []);

  const totalPatients = status?.totalPatients ?? 0;
  const hasData = totalPatients > 0;

  const chartData = useMemo(() => {
    const inCare = status?.inCare ?? 0;
    const admitted = status?.admitted ?? 0;
    const discharged = status?.discharged ?? 0;
    const inactive = status?.inactive ?? 0;

    return [
      { name: 'In Care', value: inCare, color: '#10b981' },
      { name: 'Admitted', value: admitted, color: '#2563eb' },
      { name: 'Discharged', value: discharged, color: '#8b5cf6' },
      { name: 'Inactive', value: inactive, color: '#64748b' },
    ];
  }, [status]);

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-slate-900">Patient Status</h2>
      </div>

      <div className="flex items-center justify-between my-2">
        <div className="relative h-40 w-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={totalPatients === 0 ? [{ name: 'None', value: 1, color: '#f1f5f9' }] : chartData}
                innerRadius={48}
                outerRadius={68}
                paddingAngle={totalPatients === 0 ? 0 : 3}
                dataKey="value"
              >
                {totalPatients === 0 ? (
                  <Cell fill="#f1f5f9" />
                ) : (
                  chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))
                )}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-slate-900">{totalPatients.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 font-medium">Total Patients</span>
          </div>
        </div>

        <div className="space-y-2 text-xs font-medium pl-4 flex-1">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                {item.name}
              </span>
              <span className="font-semibold text-slate-900">{item.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 text-center">
        <button
          disabled={!hasData}
          onClick={() => hasData && navigate('/patients')}
          className={`text-xs transition-colors ${
            hasData
              ? 'font-semibold text-blue-600 hover:text-blue-700 cursor-pointer'
              : 'font-semibold text-slate-300 cursor-not-allowed pointer-events-none'
          }`}
        >
          View All Patients
        </button>
      </div>
    </div>
  );
};

export default PatientStatus;

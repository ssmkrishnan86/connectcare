import React from 'react';
import { Zap, UserX, Pill, Stethoscope } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Link } from 'react-router-dom';

export const AiOperationsBrief: React.FC = () => {
  const insights = [
    { text: 'Emergency response time increased 14%.', icon: Zap },
    { text: '18 care tasks are overdue.', icon: UserX },
    { text: 'Medication compliance is below target in Med-Surg Unit 2.', icon: Pill },
    { text: 'Staffing gap predicted in Cardiology Unit tomorrow.', icon: Stethoscope },
  ];

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow flex flex-col justify-between">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-sm font-bold text-slate-900">AI Operations Brief</h2>
        <Badge variant="new">NEW</Badge>
      </div>

      <div className="space-y-3 my-1">
        {insights.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3 text-xs text-slate-700">
            <div className="p-1.5 rounded-md bg-indigo-50 text-indigo-600 shrink-0 mt-0.5">
              <item.icon className="h-3.5 w-3.5" />
            </div>
            <p className="leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-slate-100 text-center mt-2">
        <Link to="/ai-operations" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
          View AI Insights
        </Link>
      </div>
    </div>
  );
};

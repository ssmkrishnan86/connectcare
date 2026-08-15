import React from 'react';
import { Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Link } from 'react-router-dom';

export const TopUnitsAttention: React.FC = () => {
  const units = [
    { name: 'Cardiology Unit', status: 'High' as const },
    { name: 'Med-Surg Unit 2', status: 'High' as const },
    { name: 'ICU', status: 'Medium' as const },
    { name: 'Pediatrics Unit', status: 'Medium' as const },
    { name: 'Orthopedics Unit', status: 'Low' as const },
  ];

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow flex flex-col justify-between">
      <h2 className="text-sm font-bold text-slate-900 mb-3">Top Units Needing Attention</h2>

      <div className="space-y-2.5">
        {units.map((unit) => (
          <div key={unit.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors text-xs">
            <div className="flex items-center gap-2.5">
              <Building2 className="h-4 w-4 text-slate-400" />
              <span className="font-semibold text-slate-800">{unit.name}</span>
            </div>
            <Badge
              variant={
                unit.status === 'High' ? 'high' : unit.status === 'Medium' ? 'medium' : 'low'
              }
            >
              {unit.status}
            </Badge>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-slate-100 text-center mt-2">
        <Link to="/locations" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
          View All Units
        </Link>
      </div>
    </div>
  );
};

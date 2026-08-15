import React from 'react';
import { Search, SlidersHorizontal, Download } from 'lucide-react';

interface PatientFiltersProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusChange: (val: string) => void;
  unitFilter: string;
  onUnitChange: (val: string) => void;
  riskFilter: string;
  onRiskChange: (val: string) => void;
}

export const PatientFilters: React.FC<PatientFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  unitFilter,
  onUnitChange,
  riskFilter,
  onRiskChange,
}) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow mb-6 flex flex-col lg:flex-row items-center justify-between gap-4">
      {/* Search Input */}
      <div className="relative w-full lg:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name, ID, phone, email..."
          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Dropdown Filters */}
      <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
        <div className="flex flex-col">
          <label className="text-[10px] font-semibold text-slate-500 mb-0.5">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
          >
            <option value="All">All Status</option>
            <option value="In Care">In Care</option>
            <option value="Admitted">Admitted</option>
            <option value="Discharged">Discharged</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-[10px] font-semibold text-slate-500 mb-0.5">Care Unit</label>
          <select
            value={unitFilter}
            onChange={(e) => onUnitChange(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
          >
            <option value="All">All Units</option>
            <option value="Cardiology Unit">Cardiology Unit</option>
            <option value="Med-Surg Unit 2">Med-Surg Unit 2</option>
            <option value="Diabetes Care">Diabetes Care</option>
            <option value="General Ward">General Ward</option>
            <option value="Geriatrics Unit">Geriatrics Unit</option>
            <option value="Orthopedics Unit">Orthopedics Unit</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-[10px] font-semibold text-slate-500 mb-0.5">Primary Doctor</label>
          <select className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none">
            <option>All Doctors</option>
            <option>Dr. Sarah Wilson</option>
            <option>Dr. Michael Brown</option>
            <option>Dr. James Lee</option>
            <option>Dr. Emily Clark</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-[10px] font-semibold text-slate-500 mb-0.5">Risk Level</label>
          <select
            value={riskFilter}
            onChange={(e) => onRiskChange(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
          >
            <option value="All">All Risk Levels</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-[10px] font-semibold text-slate-500 mb-0.5">Age Group</label>
          <select className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none">
            <option>All Age Groups</option>
            <option>Under 18</option>
            <option>18 - 50</option>
            <option>51 - 70</option>
            <option>Over 70</option>
          </select>
        </div>

        <div className="flex items-end gap-2 mt-auto">
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50">
            <SlidersHorizontal className="h-3.5 w-3.5" /> More Filters
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>
      </div>
    </div>
  );
};

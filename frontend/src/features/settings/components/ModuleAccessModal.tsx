import React, { useState } from 'react';
import { X, ShieldCheck, Check, Save } from 'lucide-react';
import { toast } from '@/context/ToastContext';

interface ModuleAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  enabledModules: Record<string, boolean>;
  onSaveModules: (updatedModules: Record<string, boolean>) => void;
}

export const ModuleAccessModal: React.FC<ModuleAccessModalProps> = ({
  isOpen,
  onClose,
  enabledModules,
  onSaveModules,
}) => {
  const [localModules, setLocalModules] = useState<Record<string, boolean>>({ ...enabledModules });

  const roles = [
    { name: 'Administrator', badge: 'bg-purple-100 text-purple-700' },
    { name: 'Doctor / Physician', badge: 'bg-blue-100 text-blue-700' },
    { name: 'Charge Nurse', badge: 'bg-emerald-100 text-emerald-700' },
    { name: 'Caregiver / Staff', badge: 'bg-amber-100 text-amber-700' },
    { name: 'Billing Manager', badge: 'bg-slate-100 text-slate-700' },
  ];

  // Role permissions matrix state
  const [matrix, setMatrix] = useState<Record<string, Record<string, boolean>>>({
    'Residents': { 'Administrator': true, 'Doctor / Physician': true, 'Charge Nurse': true, 'Caregiver / Staff': true, 'Billing Manager': false },
    'Care & Clinical': { 'Administrator': true, 'Doctor / Physician': true, 'Charge Nurse': true, 'Caregiver / Staff': true, 'Billing Manager': false },
    'Medication': { 'Administrator': true, 'Doctor / Physician': true, 'Charge Nurse': true, 'Caregiver / Staff': false, 'Billing Manager': false },
    'Billing & Finance': { 'Administrator': true, 'Doctor / Physician': false, 'Charge Nurse': false, 'Caregiver / Staff': false, 'Billing Manager': true },
    'Reports & Analytics': { 'Administrator': true, 'Doctor / Physician': true, 'Charge Nurse': true, 'Caregiver / Staff': false, 'Billing Manager': true },
    'Alerts & Incidents': { 'Administrator': true, 'Doctor / Physician': true, 'Charge Nurse': true, 'Caregiver / Staff': true, 'Billing Manager': false },
    'Tasks & Activities': { 'Administrator': true, 'Doctor / Physician': true, 'Charge Nurse': true, 'Caregiver / Staff': true, 'Billing Manager': false },
    'Document Management': { 'Administrator': true, 'Doctor / Physician': true, 'Charge Nurse': true, 'Caregiver / Staff': false, 'Billing Manager': true },
    'Visitor Management': { 'Administrator': true, 'Doctor / Physician': false, 'Charge Nurse': true, 'Caregiver / Staff': true, 'Billing Manager': false },
  });

  if (!isOpen) return null;

  const togglePermission = (modName: string, roleName: string) => {
    setMatrix((prev) => ({
      ...prev,
      [modName]: {
        ...prev[modName],
        [roleName]: !prev[modName]?.[roleName],
      },
    }));
  };

  const toggleModuleEnable = (modName: string) => {
    setLocalModules((prev) => ({
      ...prev,
      [modName]: !prev[modName],
    }));
  };

  const handleSave = () => {
    onSaveModules(localModules);
    toast.success('Module access permissions updated successfully.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Manage Module Access & Role Permissions</h3>
              <p className="text-xs text-slate-500 font-medium">Control which user roles can view and operate each module</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <tr>
                  <th className="p-3">Module Name</th>
                  <th className="p-3 text-center">Status</th>
                  {roles.map((r) => (
                    <th key={r.name} className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.badge}`}>
                        {r.name}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {Object.keys(localModules).map((modKey) => {
                  const isEnabled = !!localModules[modKey];
                  return (
                    <tr key={modKey} className={`hover:bg-slate-50 transition-colors ${!isEnabled ? 'opacity-50 bg-slate-50/40' : ''}`}>
                      <td className="p-3 font-bold text-slate-900">{modKey}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => toggleModuleEnable(modKey)}
                          className={`w-9 h-4.5 flex items-center rounded-full p-0.5 transition-colors mx-auto ${
                            isEnabled ? 'bg-purple-600 justify-end' : 'bg-slate-300 justify-start'
                          }`}
                        >
                          <span className="bg-white w-3.5 h-3.5 rounded-full shadow"></span>
                        </button>
                      </td>
                      {roles.map((r) => {
                        const hasAccess = !!matrix[modKey]?.[r.name] && isEnabled;
                        return (
                          <td key={r.name} className="p-3 text-center">
                            <button
                              disabled={!isEnabled}
                              onClick={() => togglePermission(modKey, r.name)}
                              className={`h-6 w-6 rounded-lg flex items-center justify-center mx-auto transition-colors ${
                                hasAccess
                                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                                  : 'bg-slate-100 text-slate-300 hover:text-slate-400'
                              } ${!isEnabled ? 'cursor-not-allowed opacity-50' : ''}`}
                            >
                              {hasAccess && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-500/20 transition-colors"
          >
            <Save className="h-4 w-4" /> Save Module Access
          </button>
        </div>
      </div>
    </div>
  );
};
